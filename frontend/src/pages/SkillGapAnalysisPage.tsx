import React from 'react';
import { 
  Compass, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Flame, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { SkillGapItem } from '../types';

interface SkillGapAnalysisPageProps {
  skillGaps: SkillGapItem[];
  setCurrentView: (view: string) => void;
}

export const SkillGapAnalysisPage: React.FC<SkillGapAnalysisPageProps> = ({
  skillGaps,
  setCurrentView
}) => {
  const topGaps = skillGaps.slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Deficit & Hiring Bar Calibration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Skill Gap Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Visual comparison of your current engineering profile against the 90th percentile industry hiring threshold for target software engineering roles.
        </p>
      </div>

      {/* HIGHLIGHT: BIGGEST GAPS */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-slate-900/90 to-[#070913] space-y-4">
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>CRITICAL BOTTLENECKS (TOP 3 HIGHEST IMPACT)</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">AI Priority Matrix</span>
        </div>

        <p className="text-xs text-slate-300">
          These three skills have the highest impact on your target role. Addressing them will yield an immediate surge in interview conversion rates:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {topGaps.map((gap, i) => (
            <div key={gap.id} className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono text-rose-400 font-bold">#{i + 1} Priority</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300">
                  -{gap.gap}% Deficit
                </span>
              </div>
              <h4 className="text-sm font-bold text-white font-display">{gap.skill}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{gap.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full Skill Comparators List */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">
            Current Level vs Industry Target
          </span>
          <span className="text-xs text-slate-400 font-mono">Benchmark: Tier-1 SDE Hiring Bar</span>
        </div>

        <div className="space-y-4">
          {skillGaps.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    item.priority === 'Critical' ? 'bg-rose-400 animate-pulse' :
                    item.priority === 'High' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`} />
                  {item.skill}
                </span>

                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400">Current: <strong className="text-white">{item.currentLevel}</strong></span>
                  <span className="text-cyan-400 font-bold">➔</span>
                  <span className="text-emerald-400">Target: <strong>{item.targetLevel}</strong></span>
                  <span className="text-rose-400 font-bold ml-2">(-{item.gap}%)</span>
                </div>
              </div>

              {/* Comparator Progress Track */}
              <div className="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.currentLevel}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-emerald-400 shadow-sm shadow-emerald-400"
                  style={{ left: `${item.targetLevel}%` }}
                />
              </div>

              <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                <span>{item.recommendation}</span>
                <span className="font-mono text-slate-500 shrink-0 ml-4">Impact Score: {item.impactScore}/100</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setCurrentView('roadmap')}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-100 transition-all flex items-center gap-2"
          >
            <span>Bridge Gaps via 90-Day Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
