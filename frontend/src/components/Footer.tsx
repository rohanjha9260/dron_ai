import React from 'react';
import { Sparkles, Heart, ShieldCheck, FolderGit2, Globe } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  return (
    <footer className="border-t border-white/10 bg-[#030408]/90 backdrop-blur-md pt-12 pb-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-rose-400 p-[1px]">
              <div className="w-full h-full bg-[#070c14] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-teal-400" />
              </div>
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight text-white">
                DRON<span className="glow-gradient-text">_AI</span>
              </span>
              <p className="text-[11px] text-slate-500">Autonomous 3D AI Intelligence & Career Simulation Platform</p>
            </div>
          </div>

          {/* Product Philosophy */}
          <div className="text-center md:text-right">
            <p className="text-xs sm:text-sm font-semibold text-teal-300 font-mono">
              "Don't just predict your future. Build the path to it."
            </p>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              DRON_AI Product Philosophy
            </span>
          </div>

        </div>

        {/* Links Grid */}
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <button onClick={() => setCurrentView('landing')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => setCurrentView('how-it-works')} className="hover:text-white transition-colors">How It Works</button>
            <button onClick={() => setCurrentView('dashboard')} className="hover:text-white transition-colors">Dashboard</button>
            <button onClick={() => setCurrentView('career-prediction')} className="hover:text-white transition-colors">Career Matches</button>
            <button onClick={() => setCurrentView('job-simulator')} className="hover:text-white transition-colors">Role Simulator</button>
            <button onClick={() => setCurrentView('skill-gap')} className="hover:text-white transition-colors">Skill Gap</button>
            <button onClick={() => setCurrentView('roadmap')} className="hover:text-white transition-colors">90-Day Roadmap</button>
            <button onClick={() => setCurrentView('mock-interview')} className="hover:text-white transition-colors">Mock Interview</button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">DRON_AI Engine Active</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-[11px] text-slate-600 pt-4 border-t border-white/5">
          © {new Date().getFullYear()} DRON_AI Inc. All rights reserved. Autonomous 3D Career Intelligence.
        </div>

      </div>
    </footer>
  );
};
