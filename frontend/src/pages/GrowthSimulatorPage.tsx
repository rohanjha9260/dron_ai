import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { UserCareerProfile } from '../types';

interface GrowthSimulatorPageProps {
  profile: UserCareerProfile;
  setCurrentView: (view: string) => void;
}

export const GrowthSimulatorPage: React.FC<GrowthSimulatorPageProps> = ({
  profile,
  setCurrentView
}) => {
  const [selectedHoursOption, setSelectedHoursOption] = useState<'30m' | '1h' | '2h'>('1h');

  const options = {
    '30m': {
      label: '30 min / day',
      projectedScore: 76,
      delta: '+4%',
      outcome: 'Consistent maintenance: Clear 15 Medium DSA problems and improve basic project documentation.',
      timelinePoints: [72, 73, 74, 75, 76]
    },
    '1h': {
      label: '1 hour / day',
      projectedScore: 82,
      delta: '+10%',
      outcome: 'High growth sprint: Clear 40+ Medium LeetCode problems, polish system design basics, and complete 4 mock interviews.',
      timelinePoints: [72, 75, 77, 80, 82]
    },
    '2h': {
      label: '2 hours / day',
      projectedScore: 87,
      delta: '+15%',
      outcome: 'Tier-1 Accelerated Surge: Solve 80+ LeetCode problems (Graphs & DP), deploy 1 flagship full-stack system, and complete 8 mock interviews.',
      timelinePoints: [72, 76, 80, 84, 87]
    }
  };

  const currentOption = options[selectedHoursOption];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Predictive Trajectory Model
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          What Could Your Next 90 Days Look Like?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Simulate how consistent daily engineering time investments directly elevate your career readiness and company shortlisting probability.
        </p>
      </div>

      {/* Time Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['30m', '1h', '2h'] as const).map((optKey) => {
          const opt = options[optKey];
          const isSelected = selectedHoursOption === optKey;
          return (
            <button
              key={optKey}
              onClick={() => setSelectedHoursOption(optKey)}
              className={`p-6 rounded-3xl text-left border transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500/50 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500/30'
                  : 'glass-panel border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 font-mono">{opt.label}</span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {opt.delta}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white font-display my-1">
                72% → <span className="text-cyan-400">{opt.projectedScore}%</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                {opt.outcome}
              </p>
            </button>
          );
        })}
      </div>

      {/* Trajectory Timeline Simulation Chart */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Projected Trajectory Line</span>
            <h3 className="text-lg font-bold text-white font-display mt-0.5">
              Readiness Climb: Current (72%) to Estimated ({currentOption.projectedScore}%)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Simulated Estimate</span>
        </div>

        {/* Visual Line Points */}
        <div className="py-8 px-4">
          <div className="flex justify-between items-end h-40 border-b border-white/10 relative">
            {/* SVG Connecting curve line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <polyline
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="10,120 180,95 380,75 580,45 800,15"
                style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))' }}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Individual Stage Nodes */}
            {['Day 1 (Current)', 'Day 20', 'Day 45', 'Day 70', 'Day 90 (Target)'].map((day, idx) => {
              const score = currentOption.timelinePoints[idx];
              return (
                <div key={day} className="flex flex-col items-center gap-2 relative z-10">
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-cyan-500/30 shadow-md">
                    {score}%
                  </span>
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-md shadow-cyan-400/80" />
                  <span className="text-[10px] text-slate-400 font-mono">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Disclaimer Notice */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> Growth simulations are mathematical estimations based on consistent study compliance. Real outcomes depend on retention, mock interview performance, and active problem-solving quality.
          </span>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setCurrentView('roadmap')}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-100 transition-all flex items-center gap-2"
          >
            <span>Lock in This 90-Day Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
