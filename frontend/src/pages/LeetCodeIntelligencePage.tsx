import React from 'react';
import { 
  Code2, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  ArrowRight, 
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { LeetCodeStats } from '../types';

interface LeetCodeIntelligencePageProps {
  stats: LeetCodeStats;
  setCurrentView: (view: string) => void;
}

export const LeetCodeIntelligencePage: React.FC<LeetCodeIntelligencePageProps> = ({
  stats,
  setCurrentView
}) => {
  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Algorithmic Problem Solving Telemetry
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          LeetCode Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Granular diagnosis of your algorithmic speed, difficulty distribution, topic mastery percentages, and daily streak consistency.
        </p>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Solved</span>
          <div className="text-3xl font-extrabold text-white font-display">{stats.totalSolved}</div>
          <span className="text-[11px] text-indigo-400 font-semibold">{stats.rankingPercentile} Global</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Acceptance Rate</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-display">{stats.acceptanceRate}%</div>
          <span className="text-[11px] text-slate-400 font-semibold">High first-pass rate</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Practice Consistency</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-display">{stats.consistencyRate}%</div>
          <span className="text-[11px] text-emerald-400 font-semibold">Active weekly streak</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Medium / Hard Focus</span>
          <div className="text-3xl font-extrabold text-amber-400 font-display">{stats.medium + stats.hard}</div>
          <span className="text-[11px] text-amber-400 font-semibold">{Math.round(((stats.medium + stats.hard) / stats.totalSolved) * 100)}% High Tier</span>
        </div>

      </div>

      {/* Difficulty Breakdown (Easy / Medium / Hard) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display block">
          Problem Difficulty Spectrum
        </span>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-400 uppercase block">Easy</span>
            <span className="text-2xl font-extrabold text-white font-display mt-1 block">{stats.easy}</span>
            <span className="text-[10px] text-slate-400">Foundations</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <span className="text-xs font-bold text-amber-400 uppercase block">Medium</span>
            <span className="text-2xl font-extrabold text-white font-display mt-1 block">{stats.medium}</span>
            <span className="text-[10px] text-slate-400">Core Hiring Bar</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
            <span className="text-xs font-bold text-rose-400 uppercase block">Hard</span>
            <span className="text-2xl font-extrabold text-white font-display mt-1 block">{stats.hard}</span>
            <span className="text-[10px] text-slate-400">MAANG Elite</span>
          </div>
        </div>
      </div>

      {/* Topic Mastery Progress Bars */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">DSA Topic Mastery</span>
            <h3 className="text-base font-bold text-white font-display mt-0.5">Topic Distribution Breakdown</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">6 Categories Benchmarked</span>
        </div>

        <div className="space-y-4">
          {stats.topics.map((t) => (
            <div key={t.name} className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">{t.name}</span>
                <span className="font-mono text-slate-400">
                  {t.solved} / {t.total} solved (<strong className={t.percentage < 50 ? 'text-rose-400' : 'text-cyan-400'}>{t.percentage}%</strong>)
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    t.percentage >= 70 ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' :
                    t.percentage >= 50 ? 'bg-indigo-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                  }`}
                  style={{ width: `${t.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI Recommendations */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 flex items-center justify-between gap-4">
          <div>
            <strong className="text-cyan-300">AI Topic Diagnostic: </strong>
            <span>Your strongest topics are Arrays and Strings. Your biggest opportunities for Tier-1 growth are Dynamic Programming (31%) and Graphs (38%).</span>
          </div>
          <button
            onClick={() => setCurrentView('daily-plan')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shrink-0"
          >
            Practice Plan
          </button>
        </div>
      </div>

      {/* TODAY'S CHALLENGE CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/40 bg-gradient-to-r from-indigo-950/80 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>TODAY'S DSA CHALLENGE</span>
          </div>

          <h4 className="text-lg font-bold text-white font-display">
            {stats.todayChallenge.title}
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            {stats.todayChallenge.description}
          </p>

          <div className="flex gap-2 pt-1 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              {stats.todayChallenge.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {stats.todayChallenge.topic}
            </span>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('daily-plan')}
          className="px-6 py-3.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-100 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <span>View Practice Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
