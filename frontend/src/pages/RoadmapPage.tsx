import React, { useState } from 'react';
import { 
  GitBranch, 
  Calendar, 
  Check, 
  Sparkles, 
  Code2, 
  Layers, 
  UserCheck, 
  Send, 
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { RoadmapPhase } from '../types';
import { initialRoadmapPhases } from '../data/mockUserData';

interface RoadmapPageProps {
  setCurrentView: (view: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ setCurrentView }) => {
  const [phases, setPhases] = useState<RoadmapPhase[]>(initialRoadmapPhases);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);

  const activePhase = phases[activePhaseIndex] || phases[0];

  const toggleTask = (phaseNum: number, taskId: string) => {
    setPhases(prevPhases => prevPhases.map(p => {
      if (p.phaseNumber === phaseNum) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              return { ...t, completed: !t.completed };
            }
            return t;
          })
        };
      }
      return p;
    }));
  };

  const completedTasksCount = activePhase.tasks.filter(t => t.completed).length;
  const phaseProgressPct = Math.round((completedTasksCount / activePhase.tasks.length) * 100);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest font-mono">
          Phased Execution Sprint
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          30 / 60 / 90-Day Personalized Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          An actionable, milestone-driven curriculum designed to eliminate your critical skill gaps and elevate you to Tier-1 readiness.
        </p>
      </div>

      {/* Phase Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {phases.map((p, idx) => {
          const isActive = activePhaseIndex === idx;
          const completedInThis = p.tasks.filter(t => t.completed).length;
          const pct = Math.round((completedInThis / p.tasks.length) * 100);

          return (
            <button
              key={p.phaseNumber}
              onClick={() => setActivePhaseIndex(idx)}
              className={`p-6 rounded-3xl text-left border transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-teal-950/70 via-[#0c1320] to-slate-900 border-teal-500/50 shadow-xl shadow-teal-500/15 ring-1 ring-teal-500/30'
                  : 'glass-panel border-white/10 hover:border-teal-500/30'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  Phase {p.phaseNumber} • {p.daysSpan}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{pct}% Done</span>
              </div>

              <h3 className="text-base font-bold text-white font-display line-clamp-1">{p.title}</h3>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {p.focusAreas.map(f => (
                  <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950/30 text-teal-300/90 border border-teal-500/20 font-mono">{f}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Phase Deep Dive */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/20 space-y-6">
        
        {/* Phase Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Active Sprint Details</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
              Phase {activePhase.phaseNumber}: {activePhase.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Sprint Progress:</span>
            <div className="w-32 bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-teal-400 via-teal-500 to-rose-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${phaseProgressPct}%` }}
              />
            </div>
            <span className="text-xs font-bold font-mono text-teal-400">{phaseProgressPct}%</span>
          </div>
        </div>

        {/* Phase Key Goals Banner */}
        <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/25 space-y-2">
          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block font-display">
            🎯 Phase Goals Checklist
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
            {activePhase.goals.map((g, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-teal-400">▸</span>
                <span>{g}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Actionable Tasks */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display block">
            Milestone Tasks (Click to Mark Complete)
          </span>

          <div className="space-y-2.5">
            {activePhase.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(activePhase.phaseNumber, task.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                  task.completed
                    ? 'bg-slate-900/30 border-white/5 opacity-60'
                    : 'bg-slate-900/80 border-white/10 hover:border-teal-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                    task.completed 
                      ? 'bg-teal-400 border-teal-300 text-black font-bold' 
                      : 'border-slate-600 bg-slate-800'
                  }`}>
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}>
                      {task.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Category: {task.category}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono px-2 py-0.5 rounded bg-white/5">
                  {task.timeEstimate}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
