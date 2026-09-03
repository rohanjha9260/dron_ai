import React from 'react';
import { 
  FolderGit2, 
  Sparkles, 
  Star, 
  GitCommit, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { GitHubStats } from '../types';

interface GitHubIntelligencePageProps {
  stats: GitHubStats;
}

export const GitHubIntelligencePage: React.FC<GitHubIntelligencePageProps> = ({ stats }) => {
  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Open-Source & Repository Diagnostics
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          GitHub Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Deep analysis of your public GitHub activity, commit frequency, repository documentation health, and language diversity.
        </p>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Public Repositories</span>
          <div className="text-3xl font-extrabold text-white font-display">{stats.repositoriesCount}</div>
          <span className="text-[11px] text-indigo-400 font-semibold">Active & Maintained</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Annual Contributions</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-display">{stats.contributionsThisYear}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">32-day streak</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Stars Earned</span>
          <div className="text-3xl font-extrabold text-amber-400 font-display">{stats.totalStars}</div>
          <span className="text-[11px] text-slate-400 font-semibold">Community Impact</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">GitHub Health Score</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-display">{stats.healthScore} <span className="text-xs text-slate-500 font-normal">/100</span></div>
          <span className="text-[11px] text-cyan-400 font-semibold">Top 20% tier</span>
        </div>

      </div>

      {/* Commit Activity Heatmap Bar Chart (16 Weeks) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Contribution Velocity</span>
            <h3 className="text-base font-bold text-white font-display mt-0.5">16-Week Commit Frequency</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">avg 24 commits/week</span>
        </div>

        <div className="flex items-end justify-between gap-1.5 h-32 pt-6">
          {stats.recentActivityWeeks.map((val, idx) => {
            const heightPct = Math.min(100, Math.max(15, (val / 55) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[9px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {val}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[8px] text-slate-500 font-mono">W{idx + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Languages & Strengths vs Improvement Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Languages Breakdown */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display block">
            Language Composition
          </span>

          <div className="space-y-3">
            {stats.languages.map((lang) => (
              <div key={lang.name} className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                    {lang.name}
                  </span>
                  <span className="font-mono text-slate-400">{lang.percentage}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths vs Improve Feedback */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 text-xs">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display block">
            AI GitHub Diagnostic Feedback
          </span>

          {/* Strengths */}
          <div className="space-y-2">
            <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
            </span>
            <ul className="space-y-1 text-slate-300">
              {stats.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" /> Areas to Improve
            </span>
            <ul className="space-y-1 text-slate-300">
              {stats.improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400">!</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
