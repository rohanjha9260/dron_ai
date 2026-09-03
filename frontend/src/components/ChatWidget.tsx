import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  Maximize2, 
  Minimize2,
  Trash2
} from 'lucide-react';
import { UserCareerProfile } from '../types';
import { chatService, ChatMessage } from '../services/chatService';

interface ChatWidgetProps {
  profile: UserCareerProfile;
  onOpenFullScreen: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ profile, onOpenFullScreen }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'cw_init',
      sender: 'assistant',
      text: `Hi ${profile.name}! 👋 I am your CareerAI Copilot. How can I assist your prep today?`,
      timestamp: 'Just now',
      suggestedFollowUps: [
        'How to prepare for Google SDE-1 in 90 days?',
        'What should I practice today for DSA consistency?'
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputMessage;
    if (!q.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `cw_u_${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const resp = await chatService.sendMessage(q, messages, profile, 'Quick Assistant');
      setMessages(prev => [...prev, resp]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Closed Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold text-xs shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-100 transition-all border border-white/20 group"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span>Ask CareerAI Copilot</span>
        </button>
      )}

      {/* Open Floating Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl glass-panel bg-[#070913]/98 border border-white/15 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-display">CareerAI Copilot</h4>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Connected
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullScreen();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                title="Expand to Full Screen Chat"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                title="Close Window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>

                  {/* Suggested Prompts */}
                  {m.suggestedFollowUps && (
                    <div className="flex flex-col gap-1 mt-2">
                      {m.suggestedFollowUps.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(p)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30 text-left transition-all"
                        >
                          ⚡ {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 text-slate-400 text-[11px] animate-pulse">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about your roadmap..."
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isTyping || !inputMessage.trim()}
              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
