import React from 'react';
import { 
  Zap, 
  Sparkles, 
  Printer, 
  Calendar, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  Target,
  Award,
  Flame
} from 'lucide-react';
import { UserCareerProfile, ReadinessScoreBreakdown } from '../types';

interface FinalActionPlanPageProps {
  profile: UserCareerProfile;
  scores: ReadinessScoreBreakdown;
  setCurrentView: (view: string) => void;
}

export const FinalActionPlanPage: React.FC<FinalActionPlanPageProps> = ({
  profile,
  scores,
  setCurrentView
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
          Strategic Directive
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Your Next Best Move
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          A definitive synthesis of your profile telemetry and your prioritized 12-week execution schedule.
        </p>
      </div>

      {/* Main Directive Hero Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-indigo-500/40 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-[#070913] shadow-2xl space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI SYNTHESIS VERDICT</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-display leading-snug">
            You are currently <span className="text-cyan-400 font-extrabold">{scores.overall}% career-ready</span>.
            Your strongest areas are <span className="text-emerald-400">Java, full-stack projects, and GitHub</span>.
            Your biggest gaps are <span className="text-rose-400">DSA consistency, SQL indexing, and verbal communication</span>.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Focus aggressively on these three areas for the next 12 weeks while continuing to deploy real features. This closes your 18% deficit and places you comfortably in the 90th percentile for Tier-1 engineering offers.
          </p>
        </div>

        {/* THIS WEEK SPRINT GOALS */}
        <div className="pt-6 border-t border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-display block mb-4">
            THIS WEEK'S TARGET QUOTAS
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">DSA</span>
              <div className="text-xl font-bold font-mono text-cyan-400">10 problems</div>
              <span className="text-[10px] text-slate-500">Binary Search & Trees</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">SQL</span>
              <div className="text-xl font-bold font-mono text-indigo-400">5 problems</div>
              <span className="text-[10px] text-slate-500">Window Functions</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">GitHub</span>
              <div className="text-xl font-bold font-mono text-emerald-400">1 README</div>
              <span className="text-[10px] text-slate-500">CloudSync polish</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Communication</span>
              <div className="text-xl font-bold font-mono text-amber-400">90 mins</div>
              <span className="text-[10px] text-slate-500">15m daily drills</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mock Interview</span>
              <div className="text-xl font-bold font-mono text-purple-400">1 session</div>
              <span className="text-[10px] text-slate-500">STAR behavioral</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setCurrentView('roadmap')}
            className="px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-100 transition-all flex items-center justify-center gap-2"
          >
            <span>Start My Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Export Verified Passport</span>
          </button>
        </div>
      </div>

      {/* Holographic Digital Passport Card */}
      <div className="glass-panel rounded-3xl p-8 border border-cyan-500/40 bg-gradient-to-b from-slate-900 to-[#070913] text-center max-w-lg mx-auto space-y-4 shadow-2xl shadow-cyan-500/10">
        <div className="flex justify-between items-center text-xs text-slate-400 border-b border-white/10 pb-3 font-mono">
          <span>CAREERAI VERIFIED PASSPORT</span>
          <span className="text-cyan-400">ID: CAI-894210</span>
        </div>

        <div className="py-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 mx-auto flex items-center justify-center text-3xl font-extrabold text-white shadow-lg mb-3">
            ⚡
          </div>
          <h3 className="text-2xl font-bold text-white font-display">{profile.name}</h3>
          <p className="text-xs text-cyan-400 font-semibold">{profile.targetRole}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] block">Readiness</span>
            <strong className="text-white font-mono text-sm">{scores.overall}%</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">CGPA</span>
            <strong className="text-white font-mono text-sm">{profile.cgpa}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Backlogs</span>
            <strong className="text-emerald-400 font-mono text-sm">{profile.backlogs}</strong>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Neural Career Benchmark</span>
        </div>
      </div>

    </div>
  );
};
