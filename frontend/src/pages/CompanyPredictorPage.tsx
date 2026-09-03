import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Flame,
  Award,
  Zap
} from 'lucide-react';
import { CompanyHiringProbability, UserCareerProfile, ReadinessScoreBreakdown } from '../types';

interface CompanyPredictorPageProps {
  profile: UserCareerProfile;
  scores: ReadinessScoreBreakdown;
  setCurrentView: (view: string) => void;
}

export const CompanyPredictorPage: React.FC<CompanyPredictorPageProps> = ({
  profile,
  scores,
  setCurrentView
}) => {
  const companies: CompanyHiringProbability[] = [
    {
      id: 'comp_google',
      companyName: 'Google',
      tier: 'FAANG / Tier-1 Global',
      logoEmoji: '🔴',
      clearanceProbability: 64,
      averagePackage: '₹32 - ₹48 LPA',
      rounds: [
        { name: 'Online Assessment (OA)', probability: 82, description: '2 Graph/DP algorithmic problems within 90 minutes.' },
        { name: 'Technical Round 1 (DSA)', probability: 68, description: 'Deep dive into Binary Search, Trees, and $O(N)$ space optimization.' },
        { name: 'Technical Round 2 (DSA & Concurrency)', probability: 60, description: 'Complex Graph traversal with edge-case handling.' },
        { name: 'Googleyness & Leadership', probability: 88, description: 'Navigating ambiguity and ethical team dilemmas.' }
      ],
      criticalFocus: [
        'Master Hard Dynamic Programming on Trees and Graphs',
        'Practice articulating optimal time/space trade-offs without hints',
        'Solve 50+ Google tagged LeetCode questions'
      ],
      shortlistingTip: 'High CGPA (8.0+) and clean GitHub open-source PRs bypass recruiter filters.'
    },
    {
      id: 'comp_amazon',
      companyName: 'Amazon',
      tier: 'FAANG / Tier-1 Global',
      logoEmoji: '📦',
      clearanceProbability: 78,
      averagePackage: '₹28 - ₹45 LPA',
      rounds: [
        { name: 'Online Assessment (OA)', probability: 88, description: '2 LeetCode Mediums + Work Simulation Behavioral.' },
        { name: 'Technical Round 1', probability: 80, description: 'Arrays, Trees, Hash Maps + 15m Amazon LP questions.' },
        { name: 'Technical Round 2 (LLD/OOP)', probability: 72, description: 'Object-Oriented Design (e.g. Parking Lot / Locker System).' },
        { name: 'Bar Raiser Round', probability: 74, description: 'Deep probe into Customer Obsession & Bias for Action.' }
      ],
      criticalFocus: [
        'Prepare 2 concrete STAR stories for all 16 Amazon Leadership Principles',
        'Revise Low-Level Design (LLD) Design Patterns (Factory, Strategy, Observer)',
        'Maintain high coding speed in Trees and PriorityQueues'
      ],
      shortlistingTip: 'Amazon actively recruits via employee referrals and AWS hackathons.'
    },
    {
      id: 'comp_microsoft',
      companyName: 'Microsoft',
      tier: 'FAANG / Tier-1 Global',
      logoEmoji: '🟦',
      clearanceProbability: 72,
      averagePackage: '₹26 - ₹42 LPA',
      rounds: [
        { name: 'Online Coding Round', probability: 85, description: '3 Medium problems on Codility platform.' },
        { name: 'Technical Interview 1', probability: 76, description: 'Data structures & clean modular code quality.' },
        { name: 'Technical Interview 2', probability: 70, description: 'Core CS fundamentals (OS Memory, Locks, Threads, DBMS).' },
        { name: 'Director / AA Round', probability: 82, description: 'Project deep dive and cultural mindset.' }
      ],
      criticalFocus: [
        'Revise Operating Systems (Paging, Deadlocks, Mutex vs Semaphore)',
        'Focus on writing production-ready, readable code with zero memory leaks',
        'Polish your CloudSync project architecture explanation'
      ],
      shortlistingTip: 'Highlight your Java & C++ foundational depth.'
    },
    {
      id: 'comp_razorpay',
      companyName: 'Razorpay',
      tier: 'High Growth FinTech',
      logoEmoji: '💳',
      clearanceProbability: 82,
      averagePackage: '₹24 - ₹38 LPA',
      rounds: [
        { name: 'Machine Coding Round', probability: 86, description: 'Build a working in-memory system with clean OOP in 90 mins.' },
        { name: 'Problem Solving & DSA', probability: 80, description: 'Medium Tree/Graph problem with scale constraints.' },
        { name: 'Architecture & System Design', probability: 78, description: 'Idempotent payment transactions & Redis caching.' },
        { name: 'Culture Fit Round', probability: 90, description: 'Product ownership and customer empathy.' }
      ],
      criticalFocus: [
        'Practice timed 90-minute Machine Coding (Splitwise, Snake & Ladder)',
        'Deep dive into SQL ACID properties and payment idempotency',
        'Understand Redis distributed locks for financial concurrency'
      ],
      shortlistingTip: 'Your FinLedger banking microservice gives you an immediate competitive edge here.'
    },
    {
      id: 'comp_swiggy',
      companyName: 'Swiggy',
      tier: 'Top Tier Unicorn',
      logoEmoji: '🛵',
      clearanceProbability: 86,
      averagePackage: '₹22 - ₹36 LPA',
      rounds: [
        { name: 'HackerEarth OA', probability: 92, description: '2 Medium coding problems + SQL queries.' },
        { name: 'DSA & Coding Round', probability: 85, description: 'Data structures and optimized algorithmic complexity.' },
        { name: 'LLD & Machine Coding', probability: 82, description: 'Designing high-throughput food delivery order matching.' },
        { name: 'HM Round', probability: 88, description: 'Past projects and high-scale problem-solving.' }
      ],
      criticalFocus: [
        'Master geospatial indexes and sliding window algorithms',
        'Solidify REST API design and Node.js/Java concurrency'
      ],
      shortlistingTip: 'Highlight WebSocket real-time delivery and location tracking experience.'
    },
    {
      id: 'comp_atlassian',
      companyName: 'Atlassian',
      tier: 'FAANG / Tier-1 Global',
      logoEmoji: '🔷',
      clearanceProbability: 74,
      averagePackage: '₹35 - ₹55 LPA',
      rounds: [
        { name: 'OA Assessment', probability: 84, description: 'Algorithmic DSA + Code analysis.' },
        { name: 'Data Structures Round', probability: 76, description: 'Live coding on CoderPad with clean unit tests.' },
        { name: 'System Design / Code Craft', probability: 70, description: 'Writing extensible, testable clean code with design patterns.' },
        { name: 'Values Interview', probability: 88, description: 'Open Company, No Bullshit & Build with Heart and Balance.' }
      ],
      criticalFocus: [
        'Write clean unit tests (JUnit / Jest) while live coding',
        'Study Atlassian core company values and real teamwork examples'
      ],
      shortlistingTip: 'Atlassian values candidates who ask thoughtful questions and communicate proactively.'
    }
  ];

  const [selectedCompany, setSelectedCompany] = useState<CompanyHiringProbability>(companies[0]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Tier-1 Company Radar
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Company-Specific Hiring Probability Radar
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Benchmarked against real interview transcripts, hiring bars, and round-by-round elimination criteria for top tech companies.
        </p>
      </div>

      {/* Company Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {companies.map((comp) => {
          const isSelected = selectedCompany.id === comp.id;
          return (
            <button
              key={comp.id}
              onClick={() => setSelectedCompany(comp)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                  : 'glass-panel border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xl">{comp.logoEmoji}</span>
                <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                  comp.clearanceProbability >= 80 ? 'bg-emerald-500/20 text-emerald-300' :
                  comp.clearanceProbability >= 70 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {comp.clearanceProbability}%
                </span>
              </div>
              <h4 className="text-xs font-bold text-white font-display line-clamp-1">{comp.companyName}</h4>
              <span className="text-[10px] text-slate-500 block truncate">{comp.averagePackage}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Company Deep Dive Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl shadow-lg">
              {selectedCompany.logoEmoji}
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{selectedCompany.tier}</span>
              <h2 className="text-2xl font-bold text-white font-display mt-0.5">{selectedCompany.companyName} Clearance Index</h2>
              <span className="text-xs text-slate-400 font-mono">Average CTC: {selectedCompany.averagePackage}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estimated Clearance</span>
              <div className="text-3xl font-extrabold text-cyan-400 font-display">{selectedCompany.clearanceProbability}%</div>
            </div>
            <div className="text-right border-l border-white/10 pl-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Shortlist Odds</span>
              <div className="text-sm font-bold text-emerald-400 font-mono">High Probability</div>
            </div>
          </div>
        </div>

        {/* Round-by-Round Breakdown */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display block">
            Round-by-Round Clearance Probability
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedCompany.rounds.map((rnd, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {rnd.name}
                  </span>
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {rnd.probability}% Pass Rate
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{rnd.description}</p>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    style={{ width: `${rnd.probability}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Focus Areas & Recruiter Shortlisting Tip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
          
          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
            <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-cyan-400" /> Company-Specific Preparation Directives
            </span>
            <ul className="space-y-1.5 text-slate-300 pt-1">
              {selectedCompany.criticalFocus.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400">▸</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Recruiter Shortlisting Secret
            </span>
            <p className="text-slate-300 leading-relaxed pt-1">
              {selectedCompany.shortlistingTip}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('referral-generator')}
                className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Generate {selectedCompany.companyName} Referral Message</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
