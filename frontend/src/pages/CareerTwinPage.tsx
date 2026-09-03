import React from 'react';
import { 
  UserPlus, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Code2, 
  BookOpen, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CareerTwinData, UserCareerProfile } from '../types';

interface CareerTwinPageProps {
  twin: CareerTwinData;
  profile: UserCareerProfile;
  setCurrentView: (view: string) => void;
}

export const CareerTwinPage: React.FC<CareerTwinPageProps> = ({
  twin,
  profile,
  setCurrentView
}) => {
  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Autonomous Digital Persona
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Your AI Career Twin
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Your AI Career Twin represents your synthetic engineering persona. It continuously learns and updates as you solve problems, push commits, and complete mock interviews.
        </p>
      </div>

      {/* Main Career Twin Persona Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-indigo-500/40 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-[#070913] shadow-2xl relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-400 p-[1px] shadow-2xl shadow-indigo-500/40">
              <div className="w-full h-full bg-[#070913] rounded-[23px] flex items-center justify-center text-3xl font-extrabold text-white">
                🤖
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-white font-display">{profile.name}'s Twin</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {twin.level} Persona
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Calibrated Target: <strong className="text-white">{twin.bestCareer}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Twin Readiness</span>
              <span className="text-3xl font-extrabold text-cyan-400 font-display">{twin.careerReadiness}%</span>
            </div>
            <div className="text-right border-l border-white/10 pl-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Next Milestone</span>
              <span className="text-xl font-bold text-emerald-400 font-display">{twin.nextMilestone}</span>
            </div>
          </div>
        </div>

        {/* 6 Key Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-8 text-xs">
          
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Strongest Tech Signal</span>
            <h4 className="text-sm font-bold text-emerald-400 font-display flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> {twin.strongestSkill}
            </h4>
            <p className="text-slate-400 text-[11px]">Consistently high execution in projects & code.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Primary Growth Bottleneck</span>
            <h4 className="text-sm font-bold text-rose-400 font-display flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> {twin.biggestGap}
            </h4>
            <p className="text-slate-400 text-[11px]">Primary risk factor for final interview rounds.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Recommended Learning Style</span>
            <h4 className="text-sm font-bold text-indigo-300 font-display flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> {twin.recommendedLearningStyle}
            </h4>
            <p className="text-slate-400 text-[11px]">Highest retention achieved by building real features.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Estimated Preparation Sprint</span>
            <h4 className="text-sm font-bold text-cyan-300 font-display flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {twin.estimatedPreparation}
            </h4>
            <p className="text-slate-400 text-[11px]">Under 1.5 - 2 hrs/day focused study schedule.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Algorithmic Index</span>
            <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-400" /> {twin.codingStrength}% Solved Efficiency
            </h4>
            <p className="text-slate-400 text-[11px]">147 problems verified on LeetCode.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Neural Twin Status</span>
            <h4 className="text-sm font-bold text-emerald-400 font-display flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Live Synchronized
            </h4>
            <p className="text-slate-400 text-[11px]">Updates with every commit and completed task.</p>
          </div>

        </div>

      </div>

      {/* CTA Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => setCurrentView('final-action-plan')}
          className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all flex items-center gap-2"
        >
          <span>View Next Best Move Directive</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
