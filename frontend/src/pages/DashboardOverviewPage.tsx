import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Code2, 
  GraduationCap, 
  FolderGit2, 
  Layers, 
  UserCheck, 
  MessagesSquare, 
  Briefcase, 
  Flame, 
  Target, 
  CheckCircle2, 
  Calendar,
  Zap,
  Play
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { UserCareerProfile, ReadinessScoreBreakdown, CareerRoleMatch } from '../types';

interface DashboardOverviewPageProps {
  profile: UserCareerProfile;
  scores: ReadinessScoreBreakdown;
  roleMatches: CareerRoleMatch[];
  setCurrentView: (view: string) => void;
}

export const DashboardOverviewPage: React.FC<DashboardOverviewPageProps> = ({
  profile,
  scores,
  roleMatches,
  setCurrentView
}) => {
  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest font-mono">
            Intelligence Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-0.5">
            Good morning, {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here's where you stand today. AI heuristics have updated your baseline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('daily-plan')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-teal-400 via-teal-500 to-rose-400 shadow-md shadow-teal-500/30 flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Today's Plan</span>
          </button>
        </div>
      </div>

      {/* Main Readiness Gauge & 7 Dimension Breakdown Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/25 bg-gradient-to-r from-slate-900/90 via-[#070c14] to-teal-950/30 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Main Score Ring Column */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-r border-white/10">
            <ScoreGauge 
              score={scores.overall} 
              size={175} 
              strokeWidth={13} 
              label="CAREER READINESS" 
              statusText={scores.statusLabel} 
            />
            <p className="text-xs text-slate-400 mt-4 max-w-xs leading-relaxed">
              Based on academics, 147 LeetCode problems, 24 GitHub repos, and soft skills calibration.
            </p>
          </div>

          {/* 7 Core Score Breakdown Dimension Bars */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-teal-200 uppercase tracking-wider font-display">
                Multi-Dimensional Competency Telemetry
              </span>
              <span className="text-xs text-teal-400 font-mono">7 Signals Verified</span>
            </div>

            {[
              { label: 'Academic Strength', val: scores.academic, icon: GraduationCap, color: 'from-teal-400 to-teal-500' },
              { label: 'Coding Strength', val: scores.coding, icon: Code2, color: 'from-rose-500 to-pink-500' },
              { label: 'Projects & Architecture', val: scores.projects, icon: Briefcase, color: 'from-teal-500 to-cyan-500' },
              { label: 'GitHub Footprint', val: scores.github, icon: FolderGit2, color: 'from-emerald-500 to-teal-400' },
              { label: 'Technical Skills Depth', val: scores.technical, icon: Layers, color: 'from-teal-400 to-emerald-400' },
              { label: 'Soft Skills & Articulation', val: scores.softSkills, icon: UserCheck, color: 'from-rose-400 to-orange-400' },
              { label: 'Interview Readiness', val: scores.interviewReadiness, icon: MessagesSquare, color: 'from-rose-400 to-pink-500' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Icon className="w-3.5 h-3.5 text-teal-400/80" />
                      <span>{item.label}</span>
                    </span>
                    <span className="font-mono font-bold text-white">{item.val} / 100</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`}
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* HIGHLIGHTED SECTION: "YOUR NEXT BEST MOVE" */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/35 bg-gradient-to-br from-teal-950/60 via-slate-900/95 to-[#070c14] shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>YOUR NEXT BEST MOVE</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              Your biggest opportunity right now is DSA consistency.
            </h3>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <span className="text-teal-400">▸</span> Solve <strong>2 Medium LeetCode problems</strong> today (Binary Search & Trees).
              </p>
              <p className="flex items-center gap-2">
                <span className="text-teal-400">▸</span> Spend <strong>30 minutes</strong> reviewing Binary Search on answer space.
              </p>
              <p className="flex items-center gap-2">
                <span className="text-teal-400">▸</span> Practice explaining your solution aloud for <strong>10 minutes</strong> using the STAR method.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('daily-plan')}
              className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-teal-400 via-teal-500 to-rose-400 shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-100 transition-all flex items-center justify-center gap-2"
            >
              <span>Start Today's Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView('growth-simulator')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-teal-200 bg-white/5 hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/30 text-center transition-all"
            >
              Simulate 90-Day Trajectory
            </button>
          </div>
        </div>
      </div>

      {/* CAREER MATCH SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Recommended Career Matches</h3>
            <p className="text-xs text-slate-400">Calculated by benchmarking against hiring bars.</p>
          </div>
          <button
            onClick={() => setCurrentView('career-prediction')}
            className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>View Career Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {roleMatches.map((role) => (
            <div
              key={role.id}
              onClick={() => setCurrentView('career-prediction')}
              className="glass-panel p-5 rounded-2xl border border-teal-500/20 hover:border-teal-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] text-teal-400/80 uppercase font-semibold">{role.category}</span>
                <h4 className="text-sm font-bold text-white font-display mt-0.5 group-hover:text-teal-300 transition-colors">
                  {role.title}
                </h4>
                <div className="text-2xl font-extrabold font-display text-teal-400 my-2">
                  {role.matchPercentage}% <span className="text-xs text-slate-400 font-sans font-normal">Match</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{role.estimatedPrepTime} required</p>
              </div>

              <div className="pt-3 border-t border-white/5 mt-3 flex justify-between items-center text-[10px] text-slate-500">
                <span>Details ➔</span>
                <span className="text-rose-300/80 font-mono font-semibold">{role.averageSalary}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Matrix to All Dashboard Tools */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        
        <button
          onClick={() => setCurrentView('job-simulator')}
          className="p-4 rounded-2xl glass-panel text-left border border-teal-500/20 hover:border-teal-500/40 transition-all group"
        >
          <Target className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-white">Job Role Simulator</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Compare skills vs requirements</p>
        </button>

        <button
          onClick={() => setCurrentView('resume-matcher')}
          className="p-4 rounded-2xl glass-panel text-left border border-teal-500/20 hover:border-teal-500/40 transition-all group"
        >
          <Briefcase className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-white">Resume vs JD Matcher</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">ATS keyword match %</p>
        </button>

        <button
          onClick={() => setCurrentView('mock-interview')}
          className="p-4 rounded-2xl glass-panel text-left border border-teal-500/20 hover:border-teal-500/40 transition-all group"
        >
          <MessagesSquare className="w-5 h-5 text-teal-300 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-white">AI Mock Interview</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Live STAR answer scoring</p>
        </button>

        <button
          onClick={() => setCurrentView('career-twin')}
          className="p-4 rounded-2xl glass-panel text-left border border-teal-500/20 hover:border-teal-500/40 transition-all group"
        >
          <Sparkles className="w-5 h-5 text-rose-300 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-white">Career Twin Model</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">AI-generated digital twin</p>
        </button>

      </div>

    </div>
  );
};
