import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ResolvedNasaPayload } from '../../types';
import { Send, Settings, Key, Check, Loader2, Compass, Cpu, Sparkles, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { sendAIChat } from '../../services/api';
import { DrawerShell, Button, IconButton, Badge } from '../ui';
import { useTourSpotlight } from '../../guide/tourEngine';
import { soundFx } from '../../utils/soundEffects';

interface AIChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resolvedData: ResolvedNasaPayload | null;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  source?: string;
}

const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="font-semibold text-white text-sm mt-1.5 mb-1">
              {parseBold(headerText)}
            </h4>
          );
        }

        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[•\-*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-slate-400 font-bold">•</span>
              <span>{parseBold(bulletText)}</span>
            </div>
          );
        }

        return <p key={idx}>{parseBold(trimmed)}</p>;
      })}
    </div>
  );
};

function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const AIChatbotDrawer: React.FC<AIChatbotDrawerProps> = ({
  isOpen,
  onClose,
  resolvedData,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [inputMsg, setInputMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      const legacy = localStorage.getItem('gemini_api_key');
      if (legacy) {
        sessionStorage.setItem('gemini_api_key', legacy);
        localStorage.removeItem('gemini_api_key');
        return legacy;
      }
      return sessionStorage.getItem('gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [keySavedMessage, setKeySavedMessage] = useState<string>('');
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const currentMission = resolvedData?.mission;
  const currentHardware = resolvedData?.hardware;
  const currentDestination = resolvedData?.destination || currentMission?.destination || 'Mars';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const lastContextKeyRef = useRef<string>('');
  const keySavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chipsSpotlight = useTourSpotlight('gemini-explain-chips');
  const inputSpotlight = useTourSpotlight('gemini-chat-input');

  useEffect(() => {
    const missionName = currentMission?.name || 'Perseverance Rover';
    const hardwareName = currentHardware?.name || 'SuperCam Spectrometer';
    const contextKey = `${currentDestination}::${currentMission?.id || 'perseverance'}::${currentHardware?.id || 'supercam'}`;

    setMessages((prev) => {
      if (prev.length === 0) {
        lastContextKeyRef.current = contextKey;
        return [
          {
            id: 'init-1',
            sender: 'ai',
            text: `Welcome to Astra (powered by Google Gemini AI).\n\nActive context: **${missionName}** on **${currentDestination}** (${hardwareName}). Ask about mission findings, scientific instruments, orbital telemetry, or planetary conditions.`,
            source: 'NASA Mission Knowledge Base',
          },
        ];
      }

      if (lastContextKeyRef.current === contextKey) {
        return prev;
      }
      lastContextKeyRef.current = contextKey;

      const hasConversation = prev.some((m) => m.sender === 'user');
      if (!hasConversation) {
        return [
          {
            id: `init-${Date.now()}`,
            sender: 'ai',
            text: `Welcome to Astra (powered by Google Gemini AI).\n\nActive context: **${missionName}** on **${currentDestination}** (${hardwareName}). Ask about mission findings, scientific instruments, orbital telemetry, or planetary conditions.`,
            source: 'NASA Mission Knowledge Base',
          },
        ];
      }

      return [
        ...prev,
        {
          id: `ctx-${Date.now()}`,
          sender: 'ai',
          text: `Context updated to **${missionName}** (${hardwareName}) on **${currentDestination}**. Ask any follow-up question!`,
          source: 'Context Sync',
        },
      ];
    });
  }, [currentMission?.id, currentHardware?.id, currentDestination, currentMission?.name, currentHardware?.name]);

  useEffect(() => {
    return () => {
      if (keySavedTimerRef.current) {
        clearTimeout(keySavedTimerRef.current);
      }
    };
  }, []);

  const handleSendMessage = useCallback(
    async (msgText?: string, displayLabel?: string) => {
      const textToSend = (msgText || inputMsg).trim();
      if (!textToSend) return;

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: displayLabel || textToSend,
      };

      setMessages((prev) => [...prev, userMessage]);
      if (!msgText) setInputMsg('');
      setIsLoading(true);

      try {
        const data = await sendAIChat(
          textToSend,
          {
            destination: currentDestination,
            mission: currentMission,
            hardware: currentHardware,
          },
          apiKey.trim() || undefined
        );

        const authWarning =
          data.geminiErrorStatus === 400 || data.geminiErrorStatus === 401 || data.geminiErrorStatus === 403
            ? `Notice: Custom/server Gemini API key returned HTTP ${data.geminiErrorStatus}. Check your key or quota — responding with grounded NASA archives.\n\n`
            : data.geminiErrorStatus
              ? `Notice: Gemini upstream responded HTTP ${data.geminiErrorStatus} — showing grounded NASA offline synthesis.\n\n`
              : '';

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: `${authWarning}${data.reply}`,
            source: data.source,
          },
        ]);
      } catch (err) {
        const reason = err instanceof Error && err.message ? ` (${err.message})` : '';
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'ai',
            text: `Offline Fallback${reason} — Regarding "${displayLabel || textToSend}": ${
              currentHardware?.purpose ||
              currentMission?.nasaConfirmedStatus ||
              'Astra uses verified NASA mission archives and live telemetry to explain spacecraft instruments and planetary discoveries.'
            }`,
            source: 'NASA Mission Knowledge Base (Offline)',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputMsg, currentDestination, currentMission, currentHardware, apiKey]
  );

  // Automatically process initialPrompt passed from LiveTelemetryDrawer
  useEffect(() => {
    if (isOpen && initialPrompt) {
      const promptToRun = initialPrompt;
      onClearInitialPrompt?.();
      // If prompt has an embedded context block, show a clean user bubble label
      const matchQuestion = promptToRun.match(/Question:\s*(.+)/i);
      const displayQuestion = matchQuestion ? matchQuestion[1].trim() : promptToRun;
      handleSendMessage(promptToRun, displayQuestion);
    }
  }, [isOpen, initialPrompt, onClearInitialPrompt, handleSendMessage]);

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSaveKey = () => {
    try {
      const cleaned = apiKey.trim();
      if (cleaned) {
        sessionStorage.setItem('gemini_api_key', cleaned);
      } else {
        sessionStorage.removeItem('gemini_api_key');
      }
      localStorage.removeItem('gemini_api_key');
    } catch (_) {}
    setKeySavedMessage(apiKey.trim() ? 'API key stored for session' : 'API key cleared');
    if (keySavedTimerRef.current) clearTimeout(keySavedTimerRef.current);
    keySavedTimerRef.current = setTimeout(() => setKeySavedMessage(''), 3000);
  };

  const handleClearKey = () => {
    setApiKey('');
    try {
      sessionStorage.removeItem('gemini_api_key');
      localStorage.removeItem('gemini_api_key');
    } catch (_) {}
    setKeySavedMessage('API key cleared');
    if (keySavedTimerRef.current) clearTimeout(keySavedTimerRef.current);
    keySavedTimerRef.current = setTimeout(() => setKeySavedMessage(''), 3000);
  };

  const handleResetChat = () => {
    soundFx.playClick();
    const missionName = currentMission?.name || 'Perseverance Rover';
    const hardwareName = currentHardware?.name || 'SuperCam Spectrometer';
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: `Welcome to Astra (powered by Google Gemini AI).\n\nActive context: **${missionName}** on **${currentDestination}** (${hardwareName}). Ask about mission findings, scientific instruments, orbital telemetry, or planetary conditions.`,
        source: 'NASA Mission Knowledge Base',
      },
    ]);
  };

  const quickPrompts = [
    {
      label: `How does ${currentHardware?.name?.split(' ')[0] || 'this instrument'} work?`,
      prompt: `How does ${currentHardware?.name || 'this scientific instrument'} work and what does it measure on ${currentMission?.name || 'this mission'}?`,
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
    {
      label: `${currentMission?.name || 'Mission'} key findings`,
      prompt: `Summarize the primary scientific discoveries and mission objectives of ${currentMission?.name || 'this mission'} on ${currentDestination}.`,
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      label: `${currentDestination} surface conditions`,
      prompt: `Explain the surface environment, temperature extremes, and radiation conditions at ${currentMission?.locationName || currentDestination}.`,
      icon: <Compass className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <DrawerShell
      id="astra-ai-drawer"
      isOpen={isOpen}
      onClose={onClose}
      width="sm"
      eyebrow="AI mission assistant"
      title="Astra"
      subtitle="Powered by Gemini · NASA mission knowledge"
      headerActions={
        <div className="flex items-center gap-1">
          <IconButton
            label="Reset conversation"
            size="sm"
            onClick={handleResetChat}
          >
            <RotateCcw className="w-4 h-4" />
          </IconButton>
          <IconButton
            label="Configure Gemini API key"
            size="sm"
            active={showSettings}
            onClick={() => setShowSettings((v) => !v)}
          >
            <Settings className="w-4 h-4" />
          </IconButton>
        </div>
      }
      footer={
        <div className="space-y-2.5">
          {/* Contextual Mission Suggestion Pills */}
          <div className={`flex flex-wrap gap-1.5 rounded-xl p-1 -m-1 ${chipsSpotlight.className}`}>
            {quickPrompts.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleSendMessage(chip.prompt, chip.label)}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {chip.icon}
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`flex items-center gap-2 rounded-xl ${inputSpotlight.className}`}
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={`Ask about ${currentMission?.name || 'missions'}, hardware, or telemetry...`}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputMsg.trim() || isLoading}
              icon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </form>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Optional Gemini API Key Settings Panel */}
        {showSettings && (
          <div className="p-3.5 rounded-xl hud-well text-xs space-y-2.5">
            <div className="flex items-center justify-between text-slate-200 font-medium">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Google Gemini API key (optional)</span>
              </span>
              {keySavedMessage && <Badge tone="success">{keySavedMessage}</Badge>}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provide a Gemini API key for live LLM synthesis, or leave blank to use the built-in NASA mission knowledge engine.
            </p>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveKey}
                icon={<Check className="w-3.5 h-3.5" />}
              >
                Save
              </Button>
              {apiKey && (
                <Button variant="ghost" size="sm" onClick={handleClearKey}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Active Mission Context Bar */}
        <div className="p-3 rounded-xl hud-well text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge tone="accent">{currentDestination}</Badge>
            <span className="text-white font-medium">
              {currentMission?.name || 'Perseverance Rover'}
            </span>
          </div>
          <span className="text-slate-400 font-mono truncate">
            {currentHardware?.name || 'SuperCam Spectrometer'}
          </span>
        </div>

        {/* Conversation Messages */}
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] p-3.5 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-slate-100 text-slate-950 rounded-br-sm'
                    : 'hud-well text-slate-100 rounded-bl-sm'
                }`}
              >
                <FormattedMessage text={msg.text} />
                {msg.source && msg.sender === 'ai' && (
                  <span className="block text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-1.5 mt-2">
                    Source: {msg.source}
                  </span>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-300 p-2 font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span>Consulting NASA mission archives...</span>
            </div>
          )}
          <div ref={scrollEndRef} />
        </div>
      </div>
    </DrawerShell>
  );
};

export default AIChatbotDrawer;
