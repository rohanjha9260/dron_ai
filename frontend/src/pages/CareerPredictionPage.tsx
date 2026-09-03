import React from 'react';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Flame,
  Info
} from 'lucide-react';
import { CareerRoleMatch, UserCareerProfile } from '../types';

interface CareerPredictionPageProps {
  roleMatches: CareerRoleMatch[];
  profile: UserCareerProfile;
  setCurrentView: (view: string) => void;
}

export const CareerPredictionPage: React.FC<CareerPredictionPageProps> = ({
  roleMatches,
  profile,
  setCurrentView
}) => {
  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest font-mono">
          Predictive Role Analysis
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Your Best Career Paths
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Multi-layer algorithms evaluate your technical skills, code repositories, academic eligibility, and soft skills to predict your highest-probability career destinations.
        </p>
      </div>

      {/* AI Guidance Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/25 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <span>
          <strong>Important Guidance Notice:</strong> Career predictions are probabilistic estimates based on your current profile and should be used as guidance, not guarantees. Your actual interview outcomes are determined by consistency and execution.
        </span>
      </div>

      {/* Role Cards List */}
      <div className="space-y-6">
        {roleMatches.map((role) => (
          <div
            key={role.id}
            className="glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/20 hover:border-teal-500/50 transition-all space-y-6"
          >
            {/* Role Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">{role.category}</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">{role.title}</h3>
                <span className="text-xs text-slate-400 font-mono mt-1 block">Expected Compensation: {role.averageSalary}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-semibold block">Match Probability</span>
                  <div className="text-3xl font-extrabold text-teal-400 font-display">{role.matchPercentage}%</div>
                </div>
                <div className="text-right border-l border-white/10 pl-4">
                  <span className="text-xs text-slate-400 uppercase font-semibold block">Est. Prep Sprint</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{role.estimatedPrepTime}</div>
                </div>
              </div>
            </div>

            {/* Why it matches & Strengths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Why it matches */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Why It Matches
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {role.whyMatches.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Skills */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Needs Improvement / Missing Skills
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {role.missingSkills.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400">!</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Required Preparation Directives */}
            <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/20 text-xs space-y-2">
              <span className="font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-400" /> Preparation Directives ({role.estimatedPrepTime})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-300">
                {role.preparationRequired.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-teal-400">▸</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex justify-end">
              <button
                onClick={() => setCurrentView('job-simulator')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-teal-200 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 hover:border-teal-500/50 flex items-center gap-2 transition-all"
              >
                <span>Simulate Profile Against This Role</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
