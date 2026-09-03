import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Layers, 
  Code2, 
  BrainCircuit, 
  Compass, 
  Flame, 
  TrendingUp
} from 'lucide-react';
import { Hero3DSection } from '../components/Hero3DSection';
import { ScoreGauge } from '../components/ScoreGauge';
import { UserCareerProfile, ReadinessScoreBreakdown } from '../types';

interface LandingPageProps {
  onAnalyze: () => void;
  onExploreDemo: () => void;
  profile: UserCareerProfile;
  scores: ReadinessScoreBreakdown;
  setCurrentView: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onAnalyze,
  onExploreDemo,
  profile,
  scores,
  setCurrentView
}) => {
  const steps = [
    {
      num: '01',
      title: 'Build Your Profile',
      desc: 'Declare your academic baseline, CGPA, backlogs, technical stack, and projects.',
      icon: Layers
    },
    {
      num: '02',
      title: 'Connect GitHub & LeetCode',
      desc: 'Link repository commits and problem-solving telemetry without manual logging.',
      icon: Code2
    },
    {
      num: '03',
      title: 'AI Analyzes Your Skills',
      desc: 'Neural heuristics benchmark your profile against 500+ real tech hiring criteria.',
      icon: BrainCircuit
    },
    {
      num: '04',
      title: 'Discover Your Best Career Path',
      desc: 'Get precise match probabilities for Software Developer, Backend, Frontend, and AI roles.',
      icon: Compass
    },
    {
      num: '05',
      title: 'Follow Your Personalized Roadmap',
      desc: 'Execute a structured 30/60/90 day sprint with daily goals and accountability checklists.',
      icon: Flame
    }
  ];

  return (
    <div className="relative pt-20 pb-20 overflow-hidden">
      
      {/* 3D ANIMATION HERO SECTION */}
      <Hero3DSection 
        onAnalyze={onAnalyze}
        onExploreDemo={onExploreDemo}
        setCurrentView={setCurrentView}
      />

      {/* DASHBOARD PREVIEW TELEMETRY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative max-w-5xl mx-auto">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500/20 via-rose-500/15 to-teal-500/20 rounded-3xl blur-2xl opacity-75 pointer-events-none" />

          {/* Dashboard Preview Window */}
          <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/30 shadow-2xl bg-[#070c14]/95">
            
            {/* Window bar */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400">dron-ai://intelligence-engine/v2.5/teal-coral-active</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Real-Time Calibration
              </span>
            </div>

            {/* Core Metrics Grid Mockup */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              
              {/* Career Readiness: 72% */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-teal-950/40 via-[#0c1320] to-black/80 p-5 rounded-2xl border border-teal-500/30 flex items-center justify-between shadow-lg shadow-teal-950/30">
                <div>
                  <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block mb-1">Career Readiness</span>
                  <div className="text-3xl font-extrabold text-white font-display">72%</div>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> On Track
                  </span>
                </div>
                <ScoreGauge score={72} size={84} strokeWidth={8} label="Readiness" statusText="72%" />
              </div>

              {/* Academic Strength: 81% */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Academic</span>
                <div className="text-2xl font-bold text-teal-400 font-display">81%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-full" style={{ width: '81%' }} />
                </div>
              </div>

              {/* Coding Strength: 68% */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Coding</span>
                <div className="text-2xl font-bold text-rose-400 font-display">68%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              {/* GitHub Strength: 74% */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">GitHub</span>
                <div className="text-2xl font-bold text-emerald-400 font-display">74%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '74%' }} />
                </div>
              </div>

              {/* Soft Skills: 55% */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Soft Skills</span>
                <div className="text-2xl font-bold text-teal-300 font-display">55%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-teal-300 h-full rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

            </div>

            {/* Bottom Row: Recommended Role & Skill Gap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
              
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-teal-500/20 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 uppercase font-semibold block mb-0.5">Recommended Career</span>
                  <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    Software Developer
                  </h4>
                  <span className="text-teal-300 font-medium">82% Match Percentage</span>
                </div>
                <button
                  onClick={() => setCurrentView('career-prediction')}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-200 font-bold"
                >
                  View Details
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 uppercase font-semibold block mb-0.5">Top Skill Gap Opportunity</span>
                  <h4 className="text-base font-bold text-rose-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400" />
                    DSA Consistency & Communication
                  </h4>
                  <span className="text-slate-400 font-medium">+15 min speaking & 2 Medium LC daily</span>
                </div>
                <button
                  onClick={() => setCurrentView('skill-gap')}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold"
                >
                  Inspect Gap
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Small Trust-Style Metrics */}
        <div className="text-center mt-12 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-400/80 mb-6 font-display">
            Built for students who want to become industry-ready.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            
            <div className="glass-panel p-4 rounded-2xl border border-teal-500/20 text-center">
              <div className="text-2xl font-extrabold text-white font-display">10+</div>
              <span className="text-xs text-slate-400 font-medium">Career Paths Mapped</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-teal-500/20 text-center">
              <div className="text-2xl font-extrabold text-teal-400 font-display">50+</div>
              <span className="text-xs text-slate-400 font-medium">Skill Signals Analyzed</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-teal-500/20 text-center">
              <div className="text-2xl font-extrabold text-rose-400 font-display">AI-Powered</div>
              <span className="text-xs text-slate-400 font-medium">Multi-Layer Heuristics</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-teal-500/20 text-center">
              <div className="text-2xl font-extrabold text-emerald-400 font-display">30/60/90</div>
              <span className="text-xs text-slate-400 font-medium">Personalized Roadmaps</span>
            </div>

          </div>
        </div>

      </section>

      {/* SECTION 2: HOW IT WORKS (5 Steps Timeline) */}
      <section id="how-it-works-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-teal-500/15">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400 font-mono">
            Structured 5-Stage Protocol
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
            How DRON_AI Delivers Predictive Clarity
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From raw profile inputs to deterministic offers in structured, actionable phases.
          </p>
        </div>

        {/* 5 Cards Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-5 sm:p-6 border border-teal-500/20 hover:border-teal-500/50 transition-all duration-300 group hover:-translate-y-1 relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-rose-400 flex items-center justify-center text-black shadow-lg shadow-teal-500/20 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-mono font-extrabold text-teal-500/40 group-hover:text-teal-400 transition-colors">
                    {item.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 font-display break-words">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed break-words">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </section>

      {/* SECTION 3: PRODUCT STORY FLOW (Problem -> Solution -> Insight -> Prediction -> Action -> Result) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-panel rounded-3xl p-6 sm:p-12 border border-teal-500/20 bg-gradient-to-b from-slate-900/60 to-black/90">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400 font-mono">
              The DRON_AI Journey
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              From Uncertainty to Industry-Ready
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-center text-xs">
            
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-rose-400 font-bold block">PROBLEM</span>
              <p className="text-slate-300 font-semibold break-words">Students don't know if they are truly job-ready.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-teal-400 font-bold block">SOLUTION</span>
              <p className="text-slate-300 font-semibold break-words">DRON_AI analyzes your complete 360° profile.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-rose-400 font-bold block">INSIGHT</span>
              <p className="text-slate-300 font-semibold break-words">Discover your strongest skills & biggest gaps.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-teal-300 font-bold block">PREDICTION</span>
              <p className="text-slate-300 font-semibold break-words">See which career paths fit your credentials best.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-rose-300 font-bold block">ACTION</span>
              <p className="text-slate-300 font-semibold break-words">Get a personalized 30/60/90 day roadmap.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold block">RESULT</span>
              <p className="text-emerald-300 font-semibold break-words">Become career-ready, one step at a time.</p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="rounded-3xl p-6 sm:p-14 border border-teal-500/40 bg-gradient-to-br from-teal-950/60 via-slate-900/90 to-[#070c14] text-center shadow-2xl shadow-teal-950/40 space-y-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight break-words">
              Ready to Uncover Your True Career Readiness?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto break-words">
              Join students who stopped relying on random advice and started preparing with DRON_AI precision.
            </p>
            <div className="pt-2">
              <button
                onClick={onAnalyze}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm sm:text-base font-bold text-black bg-gradient-to-r from-teal-400 via-teal-500 to-rose-400 shadow-xl shadow-teal-500/30 hover:shadow-glow-teal hover:scale-105 active:scale-100 transition-all cursor-pointer"
              >
                <span>Launch DRON_AI Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
