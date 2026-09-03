import React from 'react';
import { 
  UserCheck, 
  Sparkles, 
  Mic, 
  MessagesSquare, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { SoftSkillsProfile } from '../types';

interface SoftSkillsAnalysisPageProps {
  softSkills: SoftSkillsProfile;
  setCurrentView: (view: string) => void;
}

export const SoftSkillsAnalysisPage: React.FC<SoftSkillsAnalysisPageProps> = ({
  softSkills,
  setCurrentView
}) => {
  const items = [
    { key: 'communication', label: 'Communication & Verbal Fluency', val: softSkills.communication, desc: 'Explaining system trade-offs and code logic clearly without hesitation.' },
    { key: 'leadership', label: 'Leadership & Project Ownership', val: softSkills.leadership, desc: 'Taking initiative, leading discussions, and resolving technical bottlenecks.' },
    { key: 'teamwork', label: 'Teamwork & Code Review Etiquette', val: softSkills.teamwork, desc: 'Collaborating in Git workflows, accepting critique, and mentoring peers.' },
    { key: 'problemSolving', label: 'Problem Solving (STAR Method)', val: softSkills.problemSolving, desc: 'Decomposing ambiguous real-world requirements into systematic steps.' },
    { key: 'presentation', label: 'Presentation & Demo Communication', val: softSkills.presentation, desc: 'Demoing architecture to non-technical stakeholders and executive teams.' },
    { key: 'confidence', label: 'Confidence & Pressure Poise', val: softSkills.confidence, desc: 'Staying calm and composed during tough problem-solving sessions.' }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Behavioral & Articulation Diagnostics
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Soft Skills & Communication Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Technical brilliance without structured verbal articulation leads to high rejection rates in final round hiring bar-raiser interviews.
        </p>
      </div>

      {/* AI Behavioral Diagnostic Callout */}
      <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-[#070913] space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-display">
            <Sparkles className="w-4 h-4" /> AI Behavioral Diagnostic
          </span>
          <span className="font-mono text-slate-400">Calibration Result</span>
        </div>
        <p className="text-sm font-semibold text-white">
          "Your technical and project profile (76%) is currently significantly stronger than your communication profile (51%)."
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          While your algorithms and backend systems are solid, HR and Bar-Raiser interviewers prioritize candidates who can clearly articulate architecture trade-offs under pressure.
        </p>
      </div>

      {/* 6 Dimension Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.key} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-white line-clamp-1">{item.label}</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  item.val < 60 ? 'bg-rose-500/20 text-rose-300' :
                  item.val < 75 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {item.val}%
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>

            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5 mt-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  item.val >= 75 ? 'bg-emerald-400' :
                  item.val >= 60 ? 'bg-amber-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
                style={{ width: `${item.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Specific Daily Action Drills */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display block">
          Prescribed Daily Behavioral Action Drills
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4" /> 15 Min Speaking Practice Daily
            </h4>
            <p className="text-slate-300">Read system design articles aloud or record 1-minute summaries of what you learned today.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="font-bold text-indigo-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Explain One Coding Problem Aloud
            </h4>
            <p className="text-slate-300">Before coding any LeetCode problem, verbalize your brute force and optimal approaches out loud.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="font-bold text-purple-400 flex items-center gap-1.5">
              <MessagesSquare className="w-4 h-4" /> Weekly Mock Interview Session
            </h4>
            <p className="text-slate-300">Practice with the CareerAI Mock Interview simulator once every 7 days to calibrate STAR answers.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> 3-Minute Project Demo Walkthrough
            </h4>
            <p className="text-slate-300">Record a Loom video presenting CloudSync without notes. Review your filler words.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setCurrentView('mock-interview')}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-100 transition-all flex items-center gap-2"
          >
            <span>Practice in AI Mock Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
