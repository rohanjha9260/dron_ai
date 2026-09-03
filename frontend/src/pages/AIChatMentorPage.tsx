import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Trash2, 
  RotateCcw, 
  Code2, 
  Check, 
  Copy, 
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  Award,
  Zap
} from 'lucide-react';
import { UserCareerProfile } from '../types';
import { chatService, ChatMessage } from '../services/chatService';

interface AIChatMentorPageProps {
  profile: UserCareerProfile;
}

export const AIChatMentorPage: React.FC<AIChatMentorPageProps> = ({ profile }) => {
  const personas = [
    { name: 'Career Strategy Coach', icon: '🎯', desc: 'Personalized roadmaps, role transitions & eligibility' },
    { name: 'FAANG Tech Interviewer', icon: '💻', desc: 'DSA deep dives, algorithm hints & complexity analysis' },
    { name: 'Resume & LinkedIn Mentor', icon: '📄', desc: 'Google XYZ bullet rewriting & cold referral outreach' },
    { name: 'Behavioral & HR Coach', icon: '🗣️', desc: 'Amazon 16 LPs, STAR stories & salary negotiation' }
  ];

  const [activePersona, setActivePersona] = useState(personas[0].name);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: `Hello **${profile.name}**! I am your personal **CareerAI Copilot & Mentor**.\n\nI have loaded your complete profile telemetry:\n• **Target Role**: ${profile.targetRole}\n• **Career Readiness**: 72% (On Track)\n• **Academics**: ${profile.cgpa} CGPA • ${profile.backlogs} Backlogs\n• **Coding Footprint**: 147 LeetCode Problems • 24 GitHub Repos\n\nAsk me anything about interview preparation, DSA problem solving, company hiring bars, or resume optimization!`,
      timestamp: 'Just now',
      suggestedFollowUps: [
        'How can I prepare for Google SDE-1 in 90 days?',
        'What should I practice today for DSA consistency?',
        'How do I answer "Tell me about a challenging project"?'
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const assistantMsg = await chatService.sendMessage(query, messages, profile, activePersona);
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init_${Date.now()}`,
        sender: 'assistant',
        text: `Chat cleared. Ready for your next career question, ${profile.name}!`,
        timestamp: 'Just now',
        suggestedFollowUps: [
          'How can I prepare for Google SDE-1 in 90 days?',
          'What are my biggest skill gaps right now?'
        ]
      }
    ]);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-Time AI Copilot & Career Mentor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          AI Career Coach & Mentor Chat
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Direct interactive conversational access to your career diagnostics. Ask specific questions about DSA algorithms, system design, mock interview answers, or company hiring bars.
        </p>
      </div>

      {/* Persona Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {personas.map((p) => {
          const isSelected = activePersona === p.name;
          return (
            <button
              key={p.name}
              onClick={() => setActivePersona(p.name)}
              className={`p-3.5 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500/50 shadow-md shadow-indigo-500/20'
                  : 'glass-panel border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{p.icon}</span>
                <span className="text-xs font-bold text-white font-display line-clamp-1">{p.name}</span>
              </div>
              <p className="text-[10.5px] text-slate-400 line-clamp-1">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Chat Conversation Container */}
      <div className="glass-panel rounded-3xl border border-white/10 flex flex-col h-[650px] shadow-2xl overflow-hidden bg-[#070913]/95">
        
        {/* Chat Room Top Bar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{activePersona}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Profile Calibrated • Context: {profile.targetRole}</span>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1.5 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 border border-white/10 text-cyan-400'
                }`}>
                  {isUser ? profile.name.charAt(0) : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className={`space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-tl-none shadow-sm'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Optional Code Snippet */}
                    {msg.codeSnippet && (
                      <div className="mt-3 rounded-xl bg-[#030408] border border-white/10 overflow-hidden">
                        <div className="p-2 bg-slate-950 flex justify-between items-center text-[10px] text-slate-400 font-mono border-b border-white/5">
                          <span>Java Solution</span>
                          <button
                            onClick={() => handleCopyCode(msg.codeSnippet!, msg.id)}
                            className="flex items-center gap-1 hover:text-white"
                          >
                            {copiedCodeId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCodeId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                          {msg.codeSnippet}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Follow-up Suggested Quick Questions */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedFollowUps.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-600/15 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 hover:text-white transition-all text-left"
                        >
                          ⚡ {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 font-mono block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-slate-400 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2 text-slate-400 text-[11px]">AI Copilot is formulating advice...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-slate-950/90 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${activePersona} about your career roadmap, DSA, or projects...`}
              className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isTyping || !inputMessage.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-100 transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
