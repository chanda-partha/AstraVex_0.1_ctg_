/**
 * ELON Conversation & State Management Engine
 * 
 * Manages the sequential onboarding journey, temporary visitor identity,
 * Gemini context persistence, and voice orchestration.
 */

import { sendElonChat } from '../services/api';
import { elonVoice } from './ElonVoice';
import { ELON_SCRIPTS } from './elonPrompt';
import { audioManager } from '../audio/AudioManager';

export type ElonStage = 
  | 'idle'
  | 'welcome'
  | 'ask_name'
  | 'greeting'
  | 'space_intro'
  | 'mission_brief'
  | 'ready';

export interface ElonMessage {
  id: string;
  sender: 'elon' | 'user';
  text: string;
  timestamp: number;
}

export interface ElonState {
  stage: ElonStage;
  visitorName: string;
  isSpeaking: boolean;
  isLoading: boolean;
  subtitles: string;
  isNamePopupOpen: boolean;
  showMissionOptions: boolean;
  messages: ElonMessage[];
}

type ElonStateListener = (state: ElonState) => void;

class ElonConversationManager {
  private stage: ElonStage = 'idle';
  private visitorName: string = '';
  private isSpeaking: boolean = false;
  private isLoading: boolean = false;
  private subtitles: string = '';
  private isNamePopupOpen: boolean = false;
  private showMissionOptions: boolean = false;
  private messages: ElonMessage[] = [];
  private listeners: Set<ElonStateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedName = sessionStorage.getItem('astravex_visitor_name');
      if (savedName) {
        this.visitorName = savedName;
      }
    }
  }

  public getState(): ElonState {
    return {
      stage: this.stage,
      visitorName: this.visitorName,
      isSpeaking: this.isSpeaking,
      isLoading: this.isLoading,
      subtitles: this.subtitles,
      isNamePopupOpen: this.isNamePopupOpen,
      showMissionOptions: this.showMissionOptions,
      messages: [...this.messages],
    };
  }

  public subscribe(listener: ElonStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (_) {}
    });
  }

  /**
   * STEP 1: CINEMATIC WELCOME
   * Triggered upon valid visitor interaction
   */
  public async startWelcome() {
    audioManager.handleUserGesture();

    if (this.stage !== 'idle' && this.stage !== 'welcome') {
      // If already past welcome, just play welcome again
      this.replayWelcome();
      return;
    }

    this.stage = 'welcome';
    this.subtitles = ELON_SCRIPTS.WELCOME;
    this.isNamePopupOpen = false;
    this.showMissionOptions = false;
    this.notify();

    elonVoice.speak(ELON_SCRIPTS.WELCOME, {
      onStart: () => {
        this.isSpeaking = true;
        this.notify();
      },
      onEnd: () => {
        this.isSpeaking = false;
        this.notify();
        // Automatically progress to Step 2: Ask for visitor's name
        this.askVisitorName();
      }
    });
  }

  /**
   * STEP 2: ASK FOR THE VISITOR'S NAME
   */
  public askVisitorName() {
    this.stage = 'ask_name';
    this.subtitles = ELON_SCRIPTS.ASK_NAME;
    this.isNamePopupOpen = true;
    this.notify();

    elonVoice.speak(ELON_SCRIPTS.ASK_NAME, {
      onStart: () => {
        this.isSpeaking = true;
        this.notify();
      },
      onEnd: () => {
        this.isSpeaking = false;
        this.notify();
      }
    });
  }

  /**
   * Confirm Visitor Identity & Progress to Steps 3, 4, and 5
   */
  public async confirmVisitorName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    this.visitorName = trimmed;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('astravex_visitor_name', trimmed);
    }

    this.isNamePopupOpen = false;
    this.isLoading = true;
    this.notify();

    // STEP 3: PERSONALIZED GREETING (Dynamic Gemini with fallback)
    this.stage = 'greeting';
    let greetingText = ELON_SCRIPTS.getGreeting(trimmed);

    try {
      const res = await sendElonChat(
        `My name is ${trimmed}. Welcome me aboard ASTRAVEX and ask how I am.`,
        trimmed,
        'greeting'
      );
      if (res?.reply) {
        greetingText = res.reply;
      }
    } catch (_) {}

    this.isLoading = false;
    this.subtitles = greetingText;
    this.appendMessage('elon', greetingText);
    this.notify();

    elonVoice.speak(greetingText, {
      onStart: () => {
        this.isSpeaking = true;
        this.notify();
      },
      onEnd: () => {
        this.isSpeaking = false;
        this.notify();
        // After greeting, smoothly transition to Step 4: Space Introduction
        setTimeout(() => this.speakSpaceIntro(), 700);
      }
    });
  }

  /**
   * STEP 4: SPACE INTRODUCTION
   */
  private async speakSpaceIntro() {
    this.stage = 'space_intro';
    let introText = ELON_SCRIPTS.SPACE_INTRO;

    this.subtitles = introText;
    this.appendMessage('elon', introText);
    this.notify();

    elonVoice.speak(introText, {
      onStart: () => {
        this.isSpeaking = true;
        this.notify();
      },
      onEnd: () => {
        this.isSpeaking = false;
        this.notify();
        // After space intro, transition to Step 5: Mission Selection
        setTimeout(() => this.speakMissionBriefing(), 700);
      }
    });
  }

  /**
   * STEP 5: MISSION SELECTION
   */
  private speakMissionBriefing() {
    this.stage = 'mission_brief';
    const briefText = ELON_SCRIPTS.getMissionBriefing(this.visitorName || 'Explorer');

    this.subtitles = briefText;
    this.showMissionOptions = true;
    this.appendMessage('elon', briefText);
    this.notify();

    elonVoice.speak(briefText, {
      onStart: () => {
        this.isSpeaking = true;
        this.notify();
      },
      onEnd: () => {
        this.isSpeaking = false;
        this.stage = 'ready';
        this.notify();
      }
    });
  }

  /**
   * Replay welcome message
   */
  public replayWelcome() {
    elonVoice.stop();
    this.startWelcome();
  }

  /**
   * Send custom question to ELON anytime
   */
  public async sendUserQuestion(
    question: string,
    context?: { destination?: any; mission?: any; hardware?: any }
  ) {
    const clean = question.trim();
    if (!clean) return;

    this.appendMessage('user', clean);
    this.isLoading = true;
    this.notify();

    try {
      const response = await sendElonChat(
        clean,
        this.visitorName || 'Explorer',
        'general',
        context
      );

      this.isLoading = false;
      const reply = response.reply;
      this.subtitles = reply;
      this.appendMessage('elon', reply);
      this.notify();

      elonVoice.speak(reply, {
        onStart: () => {
          this.isSpeaking = true;
          this.notify();
        },
        onEnd: () => {
          this.isSpeaking = false;
          this.notify();
        }
      });
    } catch (err) {
      this.isLoading = false;
      const fallback = `Commander ${this.visitorName || 'Explorer'}, my communication link encountered atmospheric interference, but our onboard navigation and telemetry remain fully operational.`;
      this.subtitles = fallback;
      this.appendMessage('elon', fallback);
      this.notify();

      elonVoice.speak(fallback, {
        onStart: () => {
          this.isSpeaking = true;
          this.notify();
        },
        onEnd: () => {
          this.isSpeaking = false;
          this.notify();
        }
      });
    }
  }

  /**
   * Reset session (clears visitor name and conversation)
   */
  public resetSession() {
    elonVoice.stop();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('astravex_visitor_name');
    }
    this.stage = 'idle';
    this.visitorName = '';
    this.isSpeaking = false;
    this.isLoading = false;
    this.subtitles = '';
    this.isNamePopupOpen = false;
    this.showMissionOptions = false;
    this.messages = [];
    this.notify();
  }

  private appendMessage(sender: 'elon' | 'user', text: string) {
    this.messages.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      sender,
      text,
      timestamp: Date.now(),
    });
    // Keep last 30 messages in memory
    if (this.messages.length > 30) {
      this.messages.shift();
    }
  }
}

export const elonConversation = new ElonConversationManager();

