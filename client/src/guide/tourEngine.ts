/**
 * Synchronized ElevenLabs Voice-Guided Tour Engine for ASTRAVEX
 *
 * Plays pre-recorded ElevenLabs .mp3 voice clips in `client/public/sounds/`,
 * tracks exact spoken timestamps, broadcasts active UI spotlight target IDs,
 * and integrates with CinematicAudioManager (ducking + volume/mute sync) and
 * ElonVoiceEngine (mutual exclusion).
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import { DestinationType, ScreenType } from '../types';
import { audioManager } from '../audio/AudioManager';
import { elonVoice } from '../elon/ElonVoice';

export type TourTrackId =
  | 'welcome_home'
  | 'space_exploration_intro'
  | 'destination_moon'
  | 'destination_mars'
  | 'earth_launch'
  | 'planetary_landing'
  | 'surface_telemetry'
  | 'surface_dock'
  | 'live_mission_data'
  | 'gemini_ai_assistant'
  | 'briefing_perseverance'
  | 'briefing_curiosity'
  | 'briefing_mro'
  | 'briefing_lro'
  | 'briefing_lunar_surface'
  | 'hardware_specs'
  | 'story_and_lab'
  | 'mission_quiz';

export type SpotlightColor = 'cyan' | 'rose' | 'amber';
export type TourTrackCategory = 'stages' | 'missions' | 'data';

export interface TourCue {
  startTime: number;
  endTime: number;
  caption: string;
  targets: string[];
  color: SpotlightColor;
}

export interface TourTrackConfig {
  id: TourTrackId;
  stepLabel: string;
  title: string;
  category: TourTrackCategory;
  src: string;
  durationSec: number;
  cues: TourCue[];
  sustainTargets: string[];
  sustainColor: SpotlightColor;
  nextTrack?: TourTrackId;
}

export interface TourState {
  tourEnabled: boolean;
  currentTrackId: TourTrackId | null;
  stepLabel: string;
  title: string;
  isPlaying: boolean;
  isPaused: boolean;
  hasEnded: boolean;
  needsAutoplayUnlock: boolean;
  currentTime: number;
  duration: number;
  caption: string;
  activeTargets: string[];
  spotlightColor: SpotlightColor;
}

const TOUR_STORAGE_KEY = 'astravex_tour_enabled';

export const TOUR_TRACKS: Record<TourTrackId, TourTrackConfig> = {
  welcome_home: {
    id: 'welcome_home',
    stepLabel: 'STAGE 1 · WELCOME',
    title: 'Welcome & Destination Selection',
    category: 'stages',
    src: '/sounds/welcome_home.mp3',
    durationSec: 17.24,
    cues: [
      {
        startTime: 0,
        endTime: 4.77,
        caption: 'Welcome to AstraVex, your gateway to NASA mission exploration.',
        targets: ['welcome-hero'],
        color: 'cyan',
      },
      {
        startTime: 4.77,
        endTime: 12.24,
        caption:
          'Here, you can experience real space missions and explore authentic scientific hardware across the solar system.',
        targets: ['welcome-hero'],
        color: 'cyan',
      },
      {
        startTime: 12.24,
        endTime: 15.34,
        caption: 'To begin your journey, please select your destination.',
        targets: ['destination-cards'],
        color: 'cyan',
      },
      {
        startTime: 15.34,
        endTime: 16.42,
        caption: 'Choose the Moon...',
        targets: ['moon-card'],
        color: 'cyan',
      },
      {
        startTime: 16.42,
        endTime: 17.5,
        caption: '...or Mars.',
        targets: ['mars-card'],
        color: 'rose',
      },
    ],
    sustainTargets: ['moon-card', 'mars-card'],
    sustainColor: 'cyan',
  },

  space_exploration_intro: {
    id: 'space_exploration_intro',
    stepLabel: 'OVERVIEW · SOLAR SYSTEM',
    title: 'Solar System & Telemetry Overview',
    category: 'stages',
    src: '/sounds/space_exploration_intro.mp3',
    durationSec: 22.69,
    cues: [
      {
        startTime: 0,
        endTime: 7.2,
        caption:
          'Beyond the boundaries of Earth lies an extraordinary solar system waiting to be explored.',
        targets: ['welcome-hero'],
        color: 'cyan',
      },
      {
        startTime: 7.2,
        endTime: 15.4,
        caption:
          'In AstraVex, every crater, rover, and orbital satellite is powered by authentic telemetry from NASA and international space agencies.',
        targets: ['live-data-trigger', 'mission-dossier'],
        color: 'cyan',
      },
      {
        startTime: 15.4,
        endTime: 23.0,
        caption:
          'You can follow the full mission journey step by step, or jump directly to any active spacecraft in our Voice Guide menu.',
        targets: ['destination-cards', 'moon-card', 'mars-card'],
        color: 'amber',
      },
    ],
    sustainTargets: ['live-data-trigger'],
    sustainColor: 'cyan',
  },

  destination_moon: {
    id: 'destination_moon',
    stepLabel: 'STAGE 2 · LUNAR ORBIT',
    title: 'Lunar Orbit & Landing Sites',
    category: 'stages',
    src: '/sounds/destination_moon.mp3',
    durationSec: 19.64,
    cues: [
      {
        startTime: 0,
        endTime: 10.31,
        caption:
          'Welcome to lunar orbit. Every pin marks an authentic landing zone, from Apollo 11 at Tranquility Base to the Artemis 3 South Pole site.',
        targets: ['site-dossier'],
        color: 'cyan',
      },
      {
        startTime: 10.31,
        endTime: 13.1,
        caption: 'Select a landing site on the 3D globe,',
        targets: ['site-list'],
        color: 'cyan',
      },
      {
        startTime: 13.1,
        endTime: 16.02,
        caption: 'then click Commence Expedition to launch from Earth,',
        targets: ['commence-btn'],
        color: 'cyan',
      },
      {
        startTime: 16.02,
        endTime: 19.9,
        caption: 'or click Direct 3D Surface to land immediately.',
        targets: ['direct-3d-btn'],
        color: 'amber',
      },
    ],
    sustainTargets: ['commence-btn', 'direct-3d-btn'],
    sustainColor: 'cyan',
  },

  destination_mars: {
    id: 'destination_mars',
    stepLabel: 'STAGE 2 · MARS ORBIT',
    title: 'Mars Orbit & Rover Sites',
    category: 'stages',
    src: '/sounds/destination_mars.mp3',
    durationSec: 18.36,
    cues: [
      {
        startTime: 0,
        endTime: 8.4,
        caption:
          'Welcome to Mars orbit. Here, you can explore active NASA expeditions like Perseverance in Jezero Crater and Curiosity on Mount Sharp.',
        targets: ['site-dossier'],
        color: 'rose',
      },
      {
        startTime: 8.4,
        endTime: 11.4,
        caption: 'Select your target mission on the 3D globe,',
        targets: ['site-list'],
        color: 'rose',
      },
      {
        startTime: 11.4,
        endTime: 14.8,
        caption: 'then click Commence Expedition to launch from Earth,',
        targets: ['commence-btn'],
        color: 'rose',
      },
      {
        startTime: 14.8,
        endTime: 18.6,
        caption: 'or click Direct 3D Surface to explore the rover right away.',
        targets: ['direct-3d-btn'],
        color: 'amber',
      },
    ],
    sustainTargets: ['commence-btn', 'direct-3d-btn'],
    sustainColor: 'rose',
  },

  earth_launch: {
    id: 'earth_launch',
    stepLabel: 'STAGE 3 · EARTH LAUNCH',
    title: 'Rocket Launch & Liftoff Telemetry',
    category: 'stages',
    src: '/sounds/earth_launch.mp3',
    durationSec: 14.21,
    cues: [
      {
        startTime: 0,
        endTime: 9.89,
        caption:
          'Launch sequence initiated. Watch authentic NASA liftoff telemetry, including altitude, velocity, and G-forces on the flight timeline below.',
        targets: ['launch-timeline'],
        color: 'cyan',
      },
      {
        startTime: 9.89,
        endTime: 14.5,
        caption: 'Whenever you are ready for planetary arrival, click Proceed to Landing.',
        targets: ['proceed-landing'],
        color: 'amber',
      },
    ],
    sustainTargets: ['proceed-landing'],
    sustainColor: 'amber',
  },

  planetary_landing: {
    id: 'planetary_landing',
    stepLabel: 'STAGE 4 · LANDING',
    title: 'Entry, Descent & Touchdown',
    category: 'stages',
    src: '/sounds/planetary_landing.mp3',
    durationSec: 12.83,
    cues: [
      {
        startTime: 0,
        endTime: 7.26,
        caption:
          'Atmospheric entry and powered descent engaged. Follow the mission radio transcripts as our spacecraft decelerates for touchdown.',
        targets: ['landing-telemetry'],
        color: 'cyan',
      },
      {
        startTime: 7.26,
        endTime: 13.1,
        caption: 'Once touchdown is confirmed, click Explore 3D Surface to deploy onto the alien terrain.',
        targets: ['deploy-surface'],
        color: 'amber',
      },
    ],
    sustainTargets: ['deploy-surface'],
    sustainColor: 'amber',
  },

  surface_telemetry: {
    id: 'surface_telemetry',
    stepLabel: 'STAGE 5 · SURFACE BRIEFING',
    title: '3D Surface & Live Telemetry',
    category: 'stages',
    src: '/sounds/surface_telemetry.mp3',
    durationSec: 20.19,
    cues: [
      {
        startTime: 0,
        endTime: 4.85,
        caption: 'Touchdown confirmed! Welcome to the 3D exploration surface.',
        targets: ['surface-stage'],
        color: 'cyan',
      },
      {
        startTime: 4.85,
        endTime: 13.1,
        caption:
          'On the top left, you can monitor live NASA mission telemetry, including current mission Sol, distance from Earth, and live signal delay.',
        targets: ['mission-dossier', 'live-data-trigger'],
        color: 'cyan',
      },
      {
        startTime: 13.1,
        endTime: 20.4,
        caption:
          'Drag anywhere to orbit the 3D spacecraft, and click any glowing pin on the model to inspect its scientific instruments.',
        targets: ['pins-toggle'],
        color: 'amber',
      },
    ],
    sustainTargets: ['mission-dossier', 'live-data-trigger'],
    sustainColor: 'cyan',
    nextTrack: 'surface_dock',
  },

  surface_dock: {
    id: 'surface_dock',
    stepLabel: 'STAGE 5 · COMMAND DOCK',
    title: 'Surface Command Dock Controls',
    category: 'stages',
    src: '/sounds/surface_dock.mp3',
    durationSec: 11.65,
    cues: [
      {
        startTime: 0,
        endTime: 4.45,
        caption: 'Use the command dock at the bottom of your screen to fire the onboard sensor,',
        targets: ['btn-sensor'],
        color: 'cyan',
      },
      {
        startTime: 4.45,
        endTime: 7.09,
        caption: 'open authentic NASA hardware specs,',
        targets: ['btn-specs'],
        color: 'cyan',
      },
      {
        startTime: 7.09,
        endTime: 9.2,
        caption: 'read the AI mission story,',
        targets: ['btn-story'],
        color: 'amber',
      },
      {
        startTime: 9.2,
        endTime: 11.9,
        caption: 'or take the science quiz to earn mission points.',
        targets: ['btn-quiz'],
        color: 'cyan',
      },
    ],
    sustainTargets: ['btn-specs', 'btn-story', 'btn-quiz'],
    sustainColor: 'cyan',
  },

  live_mission_data: {
    id: 'live_mission_data',
    stepLabel: 'DATA HUB · LIVE SCIENCE',
    title: 'Live Mission Data Hub Guide',
    category: 'data',
    src: '/sounds/live_mission_data.mp3',
    durationSec: 20.78,
    cues: [
      {
        startTime: 0,
        endTime: 4.8,
        caption: 'Welcome to the Live Mission Data hub.',
        targets: ['live-data-photos'],
        color: 'cyan',
      },
      {
        startTime: 4.8,
        endTime: 14.5,
        caption:
          'Here, you can inspect real-time spacecraft photography, planetary weather, surface temperatures, radiation levels, seismic readings, and live orbital mechanics.',
        targets: ['live-data-weather', 'live-data-radiation', 'live-data-orbital'],
        color: 'cyan',
      },
      {
        startTime: 14.5,
        endTime: 21.0,
        caption:
          'If you want any measurement explained in plain language, ask Astra (powered by Gemini AI) right inside this panel.',
        targets: ['live-data-gemini'],
        color: 'amber',
      },
    ],
    sustainTargets: ['live-data-gemini'],
    sustainColor: 'amber',
  },

  gemini_ai_assistant: {
    id: 'gemini_ai_assistant',
    stepLabel: 'AI ANALYST · ASTRA GEMINI',
    title: 'Astra · Gemini AI Telemetry Analyst',
    category: 'data',
    src: '/sounds/gemini_ai_assistant.mp3',
    durationSec: 16.05,
    cues: [
      {
        startTime: 0,
        endTime: 5.5,
        caption: "Astra (powered by Gemini AI) is connected directly to your active spacecraft's telemetry.",
        targets: ['gemini-explain-chips'],
        color: 'cyan',
      },
      {
        startTime: 5.5,
        endTime: 16.3,
        caption:
          "Select any quick-explain topic to decode today's weather, radiation, or orbital data, or type your own question below to explore the science behind this mission.",
        targets: ['gemini-explain-chips', 'gemini-chat-input'],
        color: 'amber',
      },
    ],
    sustainTargets: ['gemini-explain-chips'],
    sustainColor: 'cyan',
  },

  briefing_perseverance: {
    id: 'briefing_perseverance',
    stepLabel: 'MARS · PERSEVERANCE',
    title: 'Perseverance & Ingenuity (Jezero)',
    category: 'missions',
    src: '/sounds/briefing_perseverance.mp3',
    durationSec: 25.17,
    cues: [
      {
        startTime: 0,
        endTime: 9.2,
        caption:
          "You are now inspecting NASA's Perseverance rover inside Jezero Crater, an ancient Martian lakebed and river delta.",
        targets: ['mission-dossier'],
        color: 'rose',
      },
      {
        startTime: 9.2,
        endTime: 25.4,
        caption:
          'Powered by a nuclear radioisotope generator, Perseverance uses its SuperCam laser, MEDA weather station, and ground-penetrating radar to hunt for ancient microbial biosignatures and seal rock cores for future return to Earth.',
        targets: ['live-data-trigger', 'btn-specs'],
        color: 'amber',
      },
    ],
    sustainTargets: ['live-data-trigger'],
    sustainColor: 'amber',
  },

  briefing_curiosity: {
    id: 'briefing_curiosity',
    stepLabel: 'MARS · CURIOSITY',
    title: 'Curiosity Rover (Gale Crater)',
    category: 'missions',
    src: '/sounds/briefing_curiosity.mp3',
    durationSec: 22.77,
    cues: [
      {
        startTime: 0,
        endTime: 8.6,
        caption:
          "Welcome to Gale Crater, where NASA's Curiosity rover has climbed the layered foothills of Mount Sharp since 2012.",
        targets: ['mission-dossier'],
        color: 'rose',
      },
      {
        startTime: 8.6,
        endTime: 23.0,
        caption:
          "Curiosity's onboard chemical laboratory and radiation assessment detector proved that ancient Mars once held freshwater lakes with the chemical building blocks for life, while measuring exact radiation levels for future human astronauts.",
        targets: ['live-data-trigger', 'btn-specs'],
        color: 'amber',
      },
    ],
    sustainTargets: ['live-data-trigger'],
    sustainColor: 'amber',
  },

  briefing_mro: {
    id: 'briefing_mro',
    stepLabel: 'MARS ORBIT · MRO',
    title: 'Mars Reconnaissance Orbiter (MRO)',
    category: 'missions',
    src: '/sounds/briefing_mro.mp3',
    durationSec: 22.77,
    cues: [
      {
        startTime: 0,
        endTime: 10.2,
        caption:
          "Orbiting Mars every one hundred and twelve minutes, the Mars Reconnaissance Orbiter serves as NASA's high-resolution eye in the sky and primary deep-space communications relay.",
        targets: ['mission-dossier'],
        color: 'rose',
      },
      {
        startTime: 10.2,
        endTime: 23.0,
        caption:
          'Its HiRISE camera resolves surface boulders from three hundred kilometers up, while its shallow radar probes beneath the Martian crust to map buried water-ice glaciers.',
        targets: ['live-data-trigger', 'btn-specs'],
        color: 'amber',
      },
    ],
    sustainTargets: ['live-data-trigger'],
    sustainColor: 'amber',
  },

  briefing_lro: {
    id: 'briefing_lro',
    stepLabel: 'LUNAR ORBIT · LRO',
    title: 'Lunar Reconnaissance Orbiter (LRO)',
    category: 'missions',
    src: '/sounds/briefing_lro.mp3',
    durationSec: 24.05,
    cues: [
      {
        startTime: 0,
        endTime: 7.8,
        caption:
          "You are tracking NASA's Lunar Reconnaissance Orbiter in polar orbit fifty kilometers above the Moon.",
        targets: ['mission-dossier'],
        color: 'cyan',
      },
      {
        startTime: 7.8,
        endTime: 24.3,
        caption:
          'Since 2009, LRO has mapped the entire lunar surface in sub-meter detail, photographed the original Apollo landing modules, measured extreme temperatures inside permanently shadowed south pole craters, and scouted safe touchdown zones for Artemis astronauts.',
        targets: ['live-data-trigger', 'btn-specs'],
        color: 'cyan',
      },
    ],
    sustainTargets: ['live-data-trigger'],
    sustainColor: 'cyan',
  },

  briefing_lunar_surface: {
    id: 'briefing_lunar_surface',
    stepLabel: 'MOON · LANDERS',
    title: 'Apollo, Chandrayaan-3 & Artemis',
    category: 'missions',
    src: '/sounds/briefing_lunar_surface.mp3',
    durationSec: 22.06,
    cues: [
      {
        startTime: 0,
        endTime: 12.2,
        caption:
          "From Apollo's historic first footsteps at Tranquility Base to ISRO's Chandrayaan-3 touchdown near the lunar south pole and NASA's upcoming Artemis 3 base camp, lunar landers reveal how the Moon evolved.",
        targets: ['mission-dossier'],
        color: 'cyan',
      },
      {
        startTime: 12.2,
        endTime: 22.4,
        caption:
          'Open Live Mission Data to compare lunar soil temperatures, moonquake seismology, and south-pole water-ice discoveries.',
        targets: ['live-data-trigger', 'btn-specs'],
        color: 'amber',
      },
    ],
    sustainTargets: ['live-data-trigger'],
    sustainColor: 'amber',
  },

  hardware_specs: {
    id: 'hardware_specs',
    stepLabel: 'LAB · HARDWARE SPECS',
    title: 'NASA Hardware Specifications',
    category: 'data',
    src: '/sounds/hardware_specs.mp3',
    durationSec: 13.17,
    cues: [
      {
        startTime: 0,
        endTime: 13.4,
        caption:
          "This authentic NASA hardware dossier reveals the primary scientific purpose, onboard sensors, and NASA image gallery for your selected component. Close this window whenever you're ready to continue exploring.",
        targets: ['modal-hardware'],
        color: 'cyan',
      },
    ],
    sustainTargets: [],
    sustainColor: 'cyan',
  },

  story_and_lab: {
    id: 'story_and_lab',
    stepLabel: 'LAB · STORY & SIMULATORS',
    title: 'Mission Story & Science Lab',
    category: 'data',
    src: '/sounds/story_and_lab.mp3',
    durationSec: 12.83,
    cues: [
      {
        startTime: 0,
        endTime: 13.0,
        caption:
          'Explore the AI-generated narrative chronology of this expedition, or run hands-on physics experiments inside the interactive science simulators.',
        targets: ['modal-story', 'modal-lab'],
        color: 'amber',
      },
    ],
    sustainTargets: [],
    sustainColor: 'amber',
  },

  mission_quiz: {
    id: 'mission_quiz',
    stepLabel: 'LAB · SCIENCE QUIZ',
    title: 'Planetary Science Quiz',
    category: 'data',
    src: '/sounds/mission_quiz.mp3',
    durationSec: 14.03,
    cues: [
      {
        startTime: 0,
        endTime: 14.2,
        caption:
          "Test your knowledge with this mission science challenge. Each correct answer awards mission points and boosts your explorer's oxygen reserves.",
        targets: ['modal-quiz'],
        color: 'cyan',
      },
    ],
    sustainTargets: [],
    sustainColor: 'cyan',
  },
};

const DEEP_SPACE_SILENT_MISSIONS = new Set(['jwst', 'hubble', 'iss', 'voyager']);

const PRE_RECORDED_MISSION_TRACKS: Record<string, TourTrackId> = {
  perseverance: 'briefing_perseverance',
  curiosity: 'briefing_curiosity',
  mro: 'briefing_mro',
  lro: 'briefing_lro',
  apollo11: 'briefing_lunar_surface',
  chandrayaan3: 'briefing_lunar_surface',
  artemis3: 'briefing_lunar_surface',
};

export function hasPreRecordedMissionBriefing(missionId: string): boolean {
  return Boolean(PRE_RECORDED_MISSION_TRACKS[(missionId || '').toLowerCase()]);
}

export function getScreenTrackId(
  screen: ScreenType,
  destination: DestinationType
): TourTrackId | null {
  if (destination === 'DeepSpace' && screen !== 'home') return null;
  if (screen === 'home') return 'welcome_home';
  if (screen === 'destination') return destination === 'Moon' ? 'destination_moon' : 'destination_mars';
  if (screen === 'launch') return 'earth_launch';
  if (screen === 'landing') return 'planetary_landing';
  if (screen === 'exploration') return 'surface_telemetry';
  return null;
}

type TourListener = (state: TourState) => void;

class SynchronizedTourEngine {
  private audio: HTMLAudioElement | null = null;
  private listeners = new Set<TourListener>();
  private playedModals = new Set<TourTrackId>();
  private chainTimer: ReturnType<typeof setTimeout> | null = null;
  private hasUnlockListeners = false;
  private boundUnlockHandler: ((e: Event) => void) | null = null;
  private lastVoiceMuted = false;

  private tourEnabled = true;
  private currentTrackId: TourTrackId | null = null;
  private isPlaying = false;
  private isPaused = false;
  private hasEnded = false;
  private needsAutoplayUnlock = false;
  private currentTime = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TOUR_STORAGE_KEY);
      if (saved === 'false') {
        this.tourEnabled = false;
      }

      this.lastVoiceMuted = audioManager.getState().isVoiceMuted;

      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.syncVolume();

      this.audio.addEventListener('timeupdate', () => {
        if (!this.audio) return;
        this.currentTime = this.audio.currentTime || 0;
        this.notify();
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.isPaused = false;
        this.hasEnded = true;
        audioManager.setDucking(false, 'tour');

        const cfg = this.currentTrackId ? TOUR_TRACKS[this.currentTrackId] : null;
        this.notify();

        if (cfg?.nextTrack && this.tourEnabled && !audioManager.getState().isVoiceMuted) {
          this.clearChainTimer();
          this.chainTimer = setTimeout(() => {
            if (
              this.tourEnabled &&
              !audioManager.getState().isVoiceMuted &&
              this.currentTrackId === cfg.id &&
              this.hasEnded
            ) {
              this.playTrack(cfg.nextTrack!, { force: true });
            }
          }, 420);
        }
      });

      this.audio.addEventListener('error', () => {
        this.isPlaying = false;
        audioManager.setDucking(false, 'tour');
        this.notify();
      });

      audioManager.subscribe((audioState) => {
        this.syncVolume();
        const mutedNow = audioState.isVoiceMuted;
        if (mutedNow !== this.lastVoiceMuted) {
          this.lastVoiceMuted = mutedNow;
          if (mutedNow) {
            if (this.isPlaying) {
              this.pause();
            }
            if (elonVoice.isSpeaking()) {
              elonVoice.stop();
            }
            audioManager.setDucking(false, 'tour');
          }
        }
      });
    }
  }

  private clearChainTimer() {
    if (this.chainTimer) {
      clearTimeout(this.chainTimer);
      this.chainTimer = null;
    }
  }

  private syncVolume() {
    if (!this.audio) return;
    const audioState = audioManager.getState();
    this.audio.volume = audioState.isVoiceMuted
      ? 0
      : Math.max(0, Math.min(1, audioState.voiceVolume));
  }

  private installUnlockListeners() {
    if (this.hasUnlockListeners || typeof window === 'undefined') return;
    this.hasUnlockListeners = true;

    const unlock = (e: Event) => {
      this.removeUnlockListeners();
      if (!this.needsAutoplayUnlock || !this.tourEnabled || !this.currentTrackId) {
        return;
      }
      if (audioManager.getState().isVoiceMuted) {
        this.needsAutoplayUnlock = false;
        this.notify();
        return;
      }

      // Avoid brief flash of outgoing track if user clicked a navigation card/link
      const target = e.target as HTMLElement | null;
      if (e.type === 'pointerdown' && target?.closest('button, a')) {
        audioManager.handleUserGesture();
        this.installUnlockListeners();
        return;
      }

      this.needsAutoplayUnlock = false;
      audioManager.handleUserGesture();
      this.attemptPlay();
    };

    this.boundUnlockHandler = unlock;
    window.addEventListener('pointerdown', unlock, { capture: true, once: true });
    window.addEventListener('keydown', unlock, { capture: true, once: true });
  }

  private removeUnlockListeners() {
    if (typeof window !== 'undefined' && this.boundUnlockHandler) {
      window.removeEventListener('pointerdown', this.boundUnlockHandler, { capture: true });
      window.removeEventListener('keydown', this.boundUnlockHandler, { capture: true });
      this.boundUnlockHandler = null;
    }
    this.hasUnlockListeners = false;
  }

  private attemptPlay() {
    if (!this.audio || !this.currentTrackId) return;
    this.syncVolume();
    elonVoice.stop();

    if (audioManager.getState().isVoiceMuted) {
      this.isPlaying = false;
      this.isPaused = true;
      this.needsAutoplayUnlock = false;
      audioManager.setDucking(false, 'tour');
      this.notify();
      return;
    }

    const promise = this.audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          this.isPlaying = true;
          this.isPaused = false;
          this.hasEnded = false;
          this.needsAutoplayUnlock = false;
          this.removeUnlockListeners();
          audioManager.setDucking(true, 'tour');
          this.notify();
        })
        .catch(() => {
          this.isPlaying = false;
          this.isPaused = false;
          this.needsAutoplayUnlock = true;
          audioManager.setDucking(false, 'tour');
          this.installUnlockListeners();
          this.notify();
        });
    } else {
      this.isPlaying = true;
      this.isPaused = false;
      audioManager.setDucking(true, 'tour');
      this.notify();
    }
  }

  /**
   * Play a track cleanly by ID. Returns true if initiated/active, false if suppressed.
   */
  public playTrack(trackId: TourTrackId, options: { force?: boolean; oncePerSession?: boolean } = {}): boolean {
    if (!this.tourEnabled && !options.force) return false;
    if (options.oncePerSession && !options.force && this.playedModals.has(trackId)) {
      return false;
    }

    if (options.oncePerSession) {
      this.playedModals.add(trackId);
    }

    const cfg = TOUR_TRACKS[trackId];
    if (!cfg) return false;

    if (!options.force && this.currentTrackId === trackId && this.isPlaying) {
      return true;
    }

    this.clearChainTimer();
    this.removeUnlockListeners();
    elonVoice.stop();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTrackId = trackId;
    this.currentTime = 0;
    this.hasEnded = false;
    this.isPaused = false;
    this.needsAutoplayUnlock = false;

    if (!this.audio) return false;

    if (audioManager.getState().isVoiceMuted && !options.force) {
      this.isPlaying = false;
      this.isPaused = true;
      audioManager.setDucking(false, 'tour');
      this.notify();
      return false;
    }

    try {
      this.audio.pause();
      if (!this.audio.src.endsWith(cfg.src)) {
        this.audio.src = cfg.src;
        this.audio.load();
      } else {
        this.audio.currentTime = 0;
      }
      this.attemptPlay();
      return true;
    } catch (_) {
      this.isPlaying = false;
      this.needsAutoplayUnlock = true;
      this.installUnlockListeners();
      this.notify();
      return false;
    }
  }

  public stopTrackIfPlaying(trackId: TourTrackId) {
    if (this.currentTrackId === trackId && (this.isPlaying || this.needsAutoplayUnlock)) {
      this.stopAudioOnly();
    }
  }

  public pause() {
    this.clearChainTimer();
    this.removeUnlockListeners();
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this.isPaused = true;
      audioManager.setDucking(false, 'tour');
      this.notify();
    }
  }

  public resume() {
    if (!this.tourEnabled) {
      this.setTourEnabled(true);
    }
    if (audioManager.getState().isVoiceMuted) {
      audioManager.toggleVoice();
    }
    if (!this.currentTrackId) return;
    audioManager.handleUserGesture();
    if (this.hasEnded && this.audio) {
      this.audio.currentTime = 0;
      this.currentTime = 0;
    }
    this.attemptPlay();
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public replay(trackId?: TourTrackId) {
    const target = trackId || this.currentTrackId || 'welcome_home';
    if (audioManager.getState().isVoiceMuted) {
      audioManager.toggleVoice();
    }
    this.setTourEnabled(true);
    audioManager.handleUserGesture();
    this.playTrack(target, { force: true });
  }

  public seek(timeSec: number) {
    if (!this.audio) return;
    const cfg = this.currentTrackId ? TOUR_TRACKS[this.currentTrackId] : null;
    const maxTime = cfg?.durationSec || this.audio.duration || 0;
    const clamped = Math.max(0, Math.min(maxTime, timeSec));
    try {
      this.audio.currentTime = clamped;
      this.currentTime = clamped;
      this.notify();
    } catch (_) {}
  }

  public nextTrack() {
    const keys = Object.keys(TOUR_TRACKS) as TourTrackId[];
    if (keys.length === 0) return;
    const idx = this.currentTrackId ? keys.indexOf(this.currentTrackId) : -1;
    const nextIdx = (idx + 1) % keys.length;
    this.replay(keys[nextIdx]);
  }

  public prevTrack() {
    const keys = Object.keys(TOUR_TRACKS) as TourTrackId[];
    if (keys.length === 0) return;
    const idx = this.currentTrackId ? keys.indexOf(this.currentTrackId) : 0;
    const prevIdx = (idx - 1 + keys.length) % keys.length;
    this.replay(keys[prevIdx]);
  }

  public playScreenStage(
    screen: ScreenType,
    destination: DestinationType,
    options: { force?: boolean } = {}
  ): boolean {
    const trackId = getScreenTrackId(screen, destination);
    // Keep stages without dedicated studio voiceover (Deep Space & Orbital) completely silent
    if (!trackId) {
      this.stopAudioOnly();
      return false;
    }

    if (options.force) {
      this.replay(trackId);
      return true;
    }
    return this.playTrack(trackId);
  }

  public playMissionBriefing(missionId: string, options: { force?: boolean } = {}): boolean {
    const normalized = (missionId || '').toLowerCase();
    // Keep missions without dedicated studio MP3 files completely silent (no TTS synthesis fallback)
    if (DEEP_SPACE_SILENT_MISSIONS.has(normalized)) {
      this.stopAudioOnly();
      return false;
    }

    const trackId = PRE_RECORDED_MISSION_TRACKS[normalized];
    if (!trackId) {
      this.stopAudioOnly();
      return false;
    }

    const force = Boolean(options.force);
    if (!force && (!this.tourEnabled || audioManager.getState().isVoiceMuted)) {
      return false;
    }
    if (force) {
      if (audioManager.getState().isVoiceMuted) {
        audioManager.toggleVoice();
      }
      this.setTourEnabled(true);
      audioManager.handleUserGesture();
    }

    return this.playTrack(trackId, { force: true });
  }

  public dismissCurrent() {
    this.stopAudioOnly();
    this.setTourEnabled(false);
  }

  public stopAudioOnly() {
    this.clearChainTimer();
    this.removeUnlockListeners();
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    if (elonVoice.isSpeaking()) {
      elonVoice.stop();
    }
    this.currentTrackId = null;
    this.hasEnded = false;
    this.isPlaying = false;
    this.isPaused = false;
    this.needsAutoplayUnlock = false;
    audioManager.setDucking(false, 'tour');
    this.notify();
  }

  public setTourEnabled(enabled: boolean) {
    this.tourEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_KEY, String(enabled));
    }
    if (!enabled) {
      this.stopAudioOnly();
    } else {
      this.notify();
    }
  }

  public getState(): TourState {

    const cfg = this.currentTrackId ? TOUR_TRACKS[this.currentTrackId] : null;
    if (!cfg || !this.tourEnabled) {
      return {
        tourEnabled: this.tourEnabled,
        currentTrackId: this.currentTrackId,
        stepLabel: cfg?.stepLabel || 'VOICE GUIDE',
        title: cfg?.title || 'AstraVex Voice Guide',
        isPlaying: false,
        isPaused: false,
        hasEnded: this.hasEnded,
        needsAutoplayUnlock: false,
        currentTime: 0,
        duration: cfg?.durationSec || 0,
        caption: '',
        activeTargets: [],
        spotlightColor: 'cyan',
      };
    }

    // Determine active cue by timestamp
    const t = this.currentTime;
    let activeCue = cfg.cues[0];
    for (const cue of cfg.cues) {
      if (t >= cue.startTime && t < cue.endTime) {
        activeCue = cue;
        break;
      }
      if (t >= cue.endTime) {
        activeCue = cue;
      }
    }

    const activeTargets = this.hasEnded ? cfg.sustainTargets : activeCue?.targets || [];
    const spotlightColor = this.hasEnded ? cfg.sustainColor : activeCue?.color || 'cyan';

    return {
      tourEnabled: this.tourEnabled,
      currentTrackId: this.currentTrackId,
      stepLabel: cfg.stepLabel,
      title: cfg.title,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      hasEnded: this.hasEnded,
      needsAutoplayUnlock: this.needsAutoplayUnlock,
      currentTime: this.currentTime,
      duration: cfg.durationSec,
      caption: activeCue?.caption || '',
      activeTargets,
      spotlightColor,
    };
  }

  public subscribe(listener: TourListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public subscribeStore(listener: TourListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const snapshot = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (_) {}
    });
  }
}

export const tourEngine = new SynchronizedTourEngine();

export function useTourState(): TourState {
  const [state, setState] = useState<TourState>(() => tourEngine.getState());
  useEffect(() => tourEngine.subscribe(setState), []);
  return state;
}

export function useTourSpotlight(targetId: string): {
  isHighlighted: boolean;
  color: SpotlightColor;
  className: string;
} {
  const token = useSyncExternalStore(
    (onStoreChange) => tourEngine.subscribeStore(() => onStoreChange()),
    () => {
      const s = tourEngine.getState();
      return s.tourEnabled && s.activeTargets.includes(targetId) ? s.spotlightColor : '';
    },
    () => ''
  );

  const isHighlighted = token.length > 0;
  const color: SpotlightColor =
    token === 'rose' || token === 'amber' || token === 'cyan' ? token : 'cyan';
  const className = isHighlighted
    ? color === 'rose'
      ? 'tour-spotlight-rose'
      : color === 'amber'
        ? 'tour-spotlight-amber'
        : 'tour-spotlight-cyan'
    : '';
  return { isHighlighted, color, className };
}

