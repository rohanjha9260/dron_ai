import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bell, 
  Settings, 
  Menu, 
  X, 
  ArrowRight, 
  Compass, 
  Target, 
  GitBranch, 
  BrainCircuit, 
  LayoutDashboard, 
  User,
  ShieldAlert
} from 'lucide-react';
import { UserCareerProfile } from '../types';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenWizard: () => void;
  onToggleNotifications: () => void;
  unreadCount: number;
  user: UserCareerProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenWizard,
  onToggleNotifications,
  unreadCount,
  user
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'career-prediction', label: 'Career' },
    { id: 'skill-gap', label: 'Skill Gap' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'mock-interview', label: 'Interview' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#030408]/92 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl shadow-black/60' 
        : 'bg-[#030408]/60 backdrop-blur-md border-b border-white/5 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-rose-400 p-[1px] shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-all">
            <div className="w-full h-full bg-[#070c14] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tight text-white leading-none">
              DRON<span className="glow-gradient-text">_AI</span>
            </span>
            <span className="text-[9px] font-semibold text-teal-400/90 tracking-widest uppercase mt-0.5 font-mono">
              3D Intelligence Core
            </span>
          </div>
        </div>

        {/* Desktop Global Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0c1320]/80 p-1.5 rounded-full border border-teal-500/20 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentView(link.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-black shadow-md shadow-teal-500/30 font-bold'
                    : 'text-slate-400 hover:text-teal-200 hover:bg-teal-500/10'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Notifications, Settings, User Avatar, CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Notification Button */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded-xl text-slate-300 hover:text-teal-300 bg-white/5 hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/30 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-extrabold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setCurrentView('settings')}
            className={`p-2 rounded-xl transition-colors ${
              currentView === 'settings' 
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                : 'text-slate-300 hover:text-teal-300 bg-white/5 hover:bg-teal-500/10 border border-white/10'
            }`}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar Pill */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white/5 hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/30 transition-all text-xs font-semibold text-slate-200"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-400 to-rose-400 flex items-center justify-center text-[11px] font-bold text-black">
              {user.name.charAt(0)}
            </div>
            <span>{user.name}</span>
          </button>

          {/* Primary CTA */}
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-teal-400 via-teal-500 to-rose-400 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <span>Analyze Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-teal-300 hover:bg-teal-500/10"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070c14]/95 border-b border-teal-500/20 backdrop-blur-2xl px-4 py-4 mt-2 space-y-1 animate-in fade-in duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentView(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === link.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold'
                  : 'text-slate-300 hover:bg-teal-500/10 hover:text-teal-200'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
