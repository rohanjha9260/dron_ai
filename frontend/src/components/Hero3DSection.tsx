import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  TrendingUp, 
  Cpu,
  Orbit,
  Zap,
  ShieldCheck,
  Flame,
  Activity
} from 'lucide-react';
import { Hero3DCanvas } from './Hero3DCanvas';
import { ScoreGauge } from './ScoreGauge';

interface Hero3DSectionProps {
  onAnalyze: () => void;
  onExploreDemo: () => void;
  setCurrentView: (view: string) => void;
}

export const Hero3DSection: React.FC<Hero3DSectionProps> = ({
  onAnalyze,
  onExploreDemo,
  setCurrentView
}) => {
  const [activeFrame, setActiveFrame] = useState<number>(0);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-14 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[850px] h-[350px] bg-gradient-to-tr from-teal-500/25 via-rose-500/20 to-teal-400/15 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Top Launch Pill */}
      <div className="flex justify-center mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-teal-500/10 hover:border-teal-500/50 transition-all cursor-pointer group">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
          </span>
          <span className="font-mono tracking-wide text-teal-200 group-hover:text-teal-100 transition-colors text-[11px] sm:text-xs">
            DRON_AI 3D INTELLIGENCE ENGINE v2.5
          </span>
          <Sparkles className="w-3.5 h-3.5 text-teal-400 group-hover:rotate-12 transition-transform" />
        </div>
      </div>

      {/* Hero Headline & Subtitle */}
      <div className="text-center max-w-4xl mx-auto space-y-4 mb-8">
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold font-display tracking-tight text-white leading-[1.1] sm:leading-[1.08] break-words">
          Know Where You Stand.<br />
          <span className="glow-gradient-text">Experience DRON_AI 3D Intelligence.</span>
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal px-2">
          Autonomous AI career simulation analyzing your academics, GitHub commits, LeetCode metrics, technical skills and communication to build your personalized career roadmap.
        </p>

        {/* Philosophy Motto */}
        <div className="pt-0.5">
          <span className="inline-block text-xs sm:text-sm font-semibold text-teal-300 font-mono tracking-wide px-3.5 py-1 rounded-full bg-teal-950/40 border border-teal-500/30 max-w-full truncate">
            "Don't just predict your future. Build the path to it."
          </span>
        </div>

        {/* Hero CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            onClick={onAnalyze}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-black bg-gradient-to-r from-teal-400 via-teal-500 to-rose-400 hover:shadow-glow-teal hover:scale-[1.02] active:scale-100 transition-all shadow-xl shadow-teal-500/25 cursor-pointer"
          >
            <span>Launch DRON_AI Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-semibold text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all backdrop-blur-md cursor-pointer"
          >
            <Play className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>Interactive 3D Demo</span>
          </button>
        </div>
      </div>

      {/* 3D ANIMATION HERO STAGE */}
      <div className="relative max-w-5xl mx-auto mt-4 px-1 sm:px-0">
        
        {/* Glowing Aura Frame */}
        <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-teal-500/25 via-rose-500/20 to-teal-500/25 rounded-3xl blur-2xl opacity-75 animate-pulse-slow pointer-events-none" />

        {/* Floating Futuristic Hologram Card (Top Left) */}
        <div className="hidden xl:flex absolute -top-4 -left-6 z-30 flex-col gap-1 p-3 rounded-2xl bg-[#0c1320]/95 border border-teal-500/30 backdrop-blur-xl shadow-xl animate-float-slow max-w-[210px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-teal-300 uppercase tracking-wider">3D Hologram Stream</span>
          </div>
          <div className="text-xs font-bold text-white font-display">240 Frame Sequence</div>
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-teal-400" /> 60 FPS Buttery Smooth
          </div>
        </div>

        {/* Floating Futuristic Hologram Card (Top Right - AI Match Index) */}
        <div className="hidden xl:flex absolute -top-4 -right-6 z-30 items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#0c1320]/95 border border-teal-500/30 backdrop-blur-xl shadow-xl animate-float-reverse min-w-[210px]">
          <ScoreGauge score={88} size={46} strokeWidth={4} label="" statusText="" />
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-teal-300 uppercase tracking-wider block truncate">AI Match Index</span>
            <div className="text-xs font-bold text-white truncate">Full Stack AI Dev</div>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 shrink-0" /> +14% Readiness
            </span>
          </div>
        </div>

        {/* Floating Responsive Status Bars below Canvas on Mobile / Floating on Desktop */}
        <div className="hidden lg:flex absolute -bottom-4 left-4 z-30 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#070c14]/90 border border-teal-500/20 backdrop-blur-md text-[11px] font-mono text-slate-300">
          <Orbit className="w-3.5 h-3.5 text-teal-400 animate-spin-slow" />
          <span>Interactive 3D Orbit: <span className="text-teal-300 font-semibold">Hover / Drag</span></span>
        </div>

        <div className="hidden lg:flex absolute -bottom-4 right-4 z-30 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#070c14]/90 border border-teal-500/20 backdrop-blur-md text-[11px] font-mono text-slate-300">
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          <span>Active Telemetry: <span className="text-rose-300 font-semibold">Frame {activeFrame + 1}/240</span></span>
        </div>

        {/* Main 3D Canvas Centerpiece */}
        <Hero3DCanvas 
          totalFrames={240}
          framePathPrefix="/frames/ezgif-frame-"
          fps={30}
          autoPlay={true}
          interactive={true}
          showHUD={true}
          onFrameChange={(frame) => setActiveFrame(frame)}
          className="shadow-[0_20px_60px_-15px_rgba(45,212,191,0.25)]"
        />

      </div>

      {/* MOBILE-FRIENDLY QUICK TELEMETRY PILLS */}
      <div className="flex lg:hidden flex-wrap items-center justify-center gap-2 mt-4 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/40 border border-teal-500/30 text-[11px] font-mono text-teal-300">
          <Orbit className="w-3 h-3 text-teal-400" /> 3D Orbit Enabled
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono text-rose-300">
          <Zap className="w-3 h-3 text-rose-400" /> Frame {activeFrame + 1} / 240
        </span>
      </div>

      {/* QUICK VALUE PROPOSITIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mt-10">
        
        <div className="glass-panel p-3.5 rounded-2xl border border-teal-500/20 text-center hover:border-teal-500/40 transition-all">
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-teal-400 font-display">240+</div>
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">3D HD Frames</div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-teal-500/20 text-center hover:border-teal-500/40 transition-all">
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-rose-400 font-display">60 FPS</div>
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Silky Smooth Playback</div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-teal-500/20 text-center hover:border-teal-500/40 transition-all">
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-teal-300 font-display">500+</div>
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Tech Roles Mapped</div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-teal-500/20 text-center hover:border-teal-500/40 transition-all">
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-400 font-display">94.8%</div>
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">AI Prediction Accuracy</div>
        </div>

      </div>

    </section>
  );
};
