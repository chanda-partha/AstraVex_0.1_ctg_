import React, { useState, useEffect, useRef } from 'react';
import { ResolvedNasaPayload } from '../../types';
import { X, Send, Bot, Sparkles, Settings, Key, Check, Loader2, Globe, Cpu, History } from 'lucide-react';
import { sendAIChat } from '../../services/api';

interface AIChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resolvedData: ResolvedNasaPayload | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  source?: string;
}

// Simple Helper to Render Markdown Text with Bold, Bullet Points, and Code
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header rendering
        if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="font-bold text-sky-300 text-sm mt-1.5 mb-1">
              {parseBold(headerText)}
            </h4>
          );
        }

        // Bullet point rendering
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-sky-400 font-bold">•</span>
              <span>{parseBold(bulletText)}</span>
            </div>
          );
        }

        return <p key={idx}>{parseBold(trimmed)}</p>;
      })}
    </div>
  );
};

// Parse bold markdown **text**
function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-sky-200">
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
}) => {
  const [inputMsg, setInputMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [keySavedMessage, setKeySavedMessage] = useState<string>('');

  const currentMission = resolvedData?.mission;
  const currentHardware = resolvedData?.hardware;
  const currentDestination = resolvedData?.destination || currentMission?.destination || 'Mars';

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Update welcome message dynamically whenever resolvedData changes
  useEffect(() => {
    setMessages([
      {
        id: 'init-1',
        sender: 'ai',
        text: `Greetings Explorer! 🚀 I am your Multi-Field AI Assistant (powered like ChatGPT & Gemini).\n\nAsk me ANYTHING in any field — history (e.g. Bangladesh 1971 independence), quantum physics, world geography, space missions, hardware, or programming!`,
        source: 'Generative Multi-Field AI Engine'
      }
    ]);
  }, [resolvedData?.mission?.id, resolvedData?.hardware?.id, resolvedData?.destination]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setKeySavedMessage('API Key saved successfully!');
    setTimeout(() => setKeySavedMessage(''), 3000);
  };

  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || inputMsg;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
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

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          source: data.source
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Regarding "${textToSend}": I am here as your AI assistant. Feel free to ask about space science, history, geography, tech, or general knowledge!`,
          source: 'AI Knowledge Engine'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#0c101a]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl flex flex-col justify-between p-4 sm:p-5 select-none animate-fade-in">
      
      {/* Drawer Header */}
      <div className="space-y-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                NASA AI Copilot
              </h3>
              <span className="text-[10px] text-slate-400 block font-normal">
                Multi-Mission Knowledge Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Configure Gemini API Key"
              className={`p-2 rounded-full transition-colors ${
                showSettings ? 'bg-blue-600 text-white' : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Optional Gemini API Key Settings Panel */}
        {showSettings && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-blue-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Key className="w-3.5 h-3.5" /> Google Gemini API Key (Optional)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Enter your Gemini API key for native LLM responses, or leave blank to use our built-in offline NASA knowledge engine.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 rounded-lg nasa-button-primary font-medium text-xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
            </div>
            {keySavedMessage && (
              <span className="text-[10px] text-emerald-400 block font-mono">{keySavedMessage}</span>
            )}
          </div>
        )}

        {/* Active Context Bar */}
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] space-y-0.5">
          <div className="text-slate-400 flex justify-between">
            <span>Destination: <strong className="text-slate-200">{currentDestination}</strong></span>
            <span>Mission: <strong className="text-slate-200">{currentMission?.name || 'Perseverance'}</strong></span>
          </div>
          <div className="text-blue-400/90 truncate text-[10px]">
            Active Target: {currentHardware?.name || 'SuperCam Spectrometer'}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 my-2 pr-1 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                  : 'bg-white/[0.04] text-slate-100 border border-white/[0.08] rounded-bl-none'
              }`}
            >
              <FormattedMessage text={msg.text} />
              {msg.source && (
                <span className="block text-[9px] font-mono text-slate-400 border-t border-white/[0.08] pt-1.5 mt-2">
                  Source: {msg.source}
                </span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Consulting NASA knowledge base...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts & Input Box */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800">
        
        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSendMessage('When did Bangladesh get freedom?')}
            className="px-2.5 py-1 rounded-lg bg-space-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-mono border border-slate-700 flex items-center gap-1 transition-colors"
          >
            🇧🇩 BD Freedom 1971
          </button>
          <button
            onClick={() => handleSendMessage('What is Quantum Computing?')}
            className="px-2.5 py-1 rounded-lg bg-space-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-mono border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <Cpu className="w-3 h-3" /> Quantum Computing
          </button>
          <button
            onClick={() => handleSendMessage(`Why was ${currentHardware?.name || 'this hardware'} important?`)}
            className="px-2.5 py-1 rounded-lg bg-space-800 hover:bg-slate-700 text-sky-300 text-[10px] font-mono border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <Globe className="w-3 h-3" /> Hardware Purpose
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask AI anything in any field (e.g. history, science, space)..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-space-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans transition-all"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white shadow-glow-cyan transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};

export default AIChatbotDrawer;
