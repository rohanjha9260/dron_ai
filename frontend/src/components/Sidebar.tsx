import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Cpu, 
  Compass, 
  FolderGit2, 
  Code2, 
  UserCheck, 
  FileText, 
  MessagesSquare, 
  GitBranch, 
  CheckSquare, 
  TrendingUp, 
  UserPlus, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Zap,
  Building2,
  Wand2,
  Terminal,
  Send,
  DollarSign,
  Network,
  Bot
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isCollapsed,
  setIsCollapsed
}) => {
  const menuSections = [
    {
      title: 'CORE INTELLIGENCE',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'ai-chat-mentor', label: 'AI Career Copilot', icon: Bot, badge: 'Chat' },
        { id: 'company-predictor', label: 'Company Radar', icon: Building2, badge: 'Pro' },
        { id: 'career-prediction', label: 'Career Prediction', icon: Target },
        { id: 'job-simulator', label: 'Job Role Simulator', icon: Cpu },
        { id: 'skill-gap', label: 'Skill Gap Analysis', icon: Compass }
      ]
    },
    {
      title: 'DEVELOPER SUITE',
      items: [
        { id: 'code-playground', label: 'Code Playground', icon: Terminal, badge: 'IDE' },
        { id: 'system-design', label: 'System Design Canvas', icon: Network },
        { id: 'github', label: 'GitHub Intelligence', icon: FolderGit2 },
        { id: 'leetcode', label: 'LeetCode Intelligence', icon: Code2 }
      ]
    },
    {
      title: 'APPLICATION & OUTREACH',
      items: [
        { id: 'resume-studio', label: 'AI Resume Studio', icon: Wand2, badge: 'XYZ' },
        { id: 'referral-generator', label: 'Referral Generator', icon: Send },
        { id: 'resume-matcher', label: 'Resume vs JD Matcher', icon: FileText },
        { id: 'salary-calculator', label: 'Salary Calculator', icon: DollarSign }
      ]
    },
    {
      title: 'PREPARATION & ACTION',
      items: [
        { id: 'mock-interview', label: 'AI Mock Interview', icon: MessagesSquare, badge: 'AI' },
        { id: 'roadmap', label: '30/60/90 Day Roadmap', icon: GitBranch },
        { id: 'daily-plan', label: 'Daily Action Plan', icon: CheckSquare },
        { id: 'growth-simulator', label: 'Growth Simulator', icon: TrendingUp },
        { id: 'career-twin', label: 'Career Twin Model', icon: UserPlus },
        { id: 'final-action-plan', label: 'Next Best Move', icon: Zap }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className={`fixed top-16 left-0 bottom-0 z-30 bg-[#030408]/95 border-r border-white/10 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between hidden md:flex ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Menu List */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 font-display">
                {section.title}
              </span>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-teal-200 hover:bg-teal-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-300'
                    }`} />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate font-mono">DRON_AI Active</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors mx-auto"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
