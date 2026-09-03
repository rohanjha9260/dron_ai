import React, { useState } from 'react';
import { 
  Cpu, 
  Target, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Code2
} from 'lucide-react';
import { UserCareerProfile } from '../types';
import { careerAnalysisService } from '../services/careerAnalysisService';

interface JobRoleSimulatorPageProps {
  profile: UserCareerProfile;
  setCurrentView: (view: string) => void;
}

export const JobRoleSimulatorPage: React.FC<JobRoleSimulatorPageProps> = ({
  profile,
  setCurrentView
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('Backend Developer');

  const availableRoles = [
    'Backend Developer',
    'Software Developer (SDE-1)',
    'Frontend Developer',
    'Full Stack Developer',
    'AI / ML Engineer',
    'DevOps Engineer',
    'Data Analyst'
  ];

  const simulation = careerAnalysisService.simulateRoleMatch(selectedRole, profile);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Interactive Role Simulator
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Job Role Competency Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Select any industry position to simulate your current competency baseline directly against senior technical hiring requirements.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {availableRoles.map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedRole === role
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10 hover:bg-white/5'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Main Simulation Comparison Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        
        {/* Top Match Score vs Threshold */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Simulated Target:</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">{simulation.roleTitle}</h2>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Your Overall Match</span>
              <span className="text-2xl font-extrabold font-display text-cyan-400">{simulation.overallMatch}%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center">
              <span className="text-emerald-400 text-[10px] uppercase font-bold block">Hiring Bar Target</span>
              <span className="text-2xl font-extrabold font-display text-emerald-400">{simulation.targetThreshold}%</span>
            </div>
          </div>
        </div>

        {/* Requirements Comparison List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
            <span>Skill Dimension</span>
            <span>Your Level vs Required Threshold</span>
          </div>

          <div className="space-y-3">
            {simulation.requirements.map((req, idx) => {
              const delta = req.requiredLevel - req.userLevel;
              const isMet = delta <= 0;

              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-slate-400" />
                      {req.skill}
                    </span>
                    <span className="font-mono text-xs">
                      Your Level: <strong className={isMet ? 'text-emerald-400' : 'text-amber-400'}>{req.userLevel}</strong>
                      <span className="text-slate-500 mx-1.5">/</span>
                      Required: <strong className="text-white">{req.requiredLevel}</strong>
                    </span>
                  </div>

                  {/* Dual Bar Display */}
                  <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isMet ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                      }`}
                      style={{ width: `${req.userLevel}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-emerald-400 shadow-md shadow-emerald-400 z-10"
                      style={{ left: `${req.requiredLevel}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Prompt */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white font-display">Ready to bridge the {simulation.targetThreshold - simulation.overallMatch}% gap?</h4>
            <p className="text-xs text-slate-400">Generate a custom preparation roadmap for {simulation.roleTitle}.</p>
          </div>

          <button
            onClick={() => setCurrentView('roadmap')}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-100 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <span>Build My Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
