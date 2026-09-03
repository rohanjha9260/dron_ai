import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Download, 
  Wand2, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  Trash2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { UserCareerProfile } from '../types';

interface ResumeStudioPageProps {
  profile: UserCareerProfile;
}

export const ResumeStudioPage: React.FC<ResumeStudioPageProps> = ({ profile }) => {
  const [headline, setHeadline] = useState('Software Developer | B.Tech CSE 2026 | Full Stack & Java Specialist');
  const [summary, setSummary] = useState(
    'Passionate Software Engineer with hands-on experience developing high-throughput REST APIs, collaborative WebSocket systems, and scalable full-stack web applications. Solved 147+ LeetCode algorithmic problems.'
  );

  const [bulletPoints, setBulletPoints] = useState([
    {
      id: 'b1',
      project: 'CloudSync (Real-Time Collaborative Canvas)',
      original: 'Used WebSockets and Node.js to build a drawing canvas for multiple users.',
      optimized: 'Architected real-time collaborative canvas handling 1,200+ concurrent WebSocket connections with <16ms sync latency using Redis Pub/Sub buffer layers.',
      isOptimized: true
    },
    {
      id: 'b2',
      project: 'FinLedger Transaction Microservice',
      original: 'Created a Java Spring Boot API for banking transactions with a SQL database.',
      optimized: 'Developed double-entry transaction microservice in Java Spring Boot with ACID compliance and optimized B-Tree SQL indexing, processing 1,500 RPS.',
      isOptimized: true
    },
    {
      id: 'b3',
      project: 'Algorithm Pathfinding Visualizer',
      original: 'Made a website in React to show Dijkstra and A* pathfinding.',
      optimized: 'Engineered responsive graph traversal visualizer in TypeScript/React demonstrating Dijkstra & A* algorithms, utilized by 2,000+ engineering students.',
      isOptimized: true
    }
  ]);

  const [atsScore, setAtsScore] = useState(91);

  const handlePrint = () => {
    window.print();
  };

  const handleOptimizeBullet = (id: string) => {
    setBulletPoints(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, isOptimized: true };
      }
      return b;
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Interactive Resume Studio & ATS Analyzer
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          AI Resume Builder & Google XYZ Optimizer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Top tech recruiters reject 70% of resumes because bullets describe responsibilities rather than measurable impact. Transform every bullet into the gold-standard <strong>Google XYZ format</strong>.
        </p>
      </div>

      {/* Top ATS Score Bar */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-[#070913] to-indigo-950/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl font-bold text-emerald-400 font-mono">
            {atsScore}
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">ATS Recruiter Index</span>
            <h3 className="text-base font-bold text-white font-display">91/100 • Tier-1 Shortlist Ready</h3>
            <p className="text-xs text-slate-400">All bullets include quantified metrics and action verbs.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25 flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Interactive Bullet Point Optimizer */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-display block">
              Google XYZ Formula Optimizer
            </span>
            <p className="text-xs text-slate-400 mt-1">
              <em>"Accomplished [X] as measured by [Y] by doing [Z]"</em>
            </p>
          </div>

          <div className="space-y-4">
            {bulletPoints.map((bullet) => (
              <div key={bullet.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2.5 text-xs">
                <span className="font-bold text-cyan-300 block">{bullet.project}</span>
                
                <div className="space-y-1 text-slate-400">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Standard Resume Bullet:</span>
                  <p className="line-through text-slate-500">{bullet.original}</p>
                </div>

                <div className="space-y-1 pt-1 border-t border-white/5">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Google XYZ Transformation:
                  </span>
                  <p className="text-slate-200 font-medium leading-relaxed">{bullet.optimized}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Single-Page Resume Preview (A4 Aspect Ratio) */}
        <div className="glass-panel rounded-3xl p-8 border border-white/15 bg-white text-slate-900 shadow-2xl space-y-4 text-xs select-none">
          
          {/* Resume Header */}
          <div className="text-center border-b border-slate-300 pb-3 space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">{profile.name}</h2>
            <p className="text-[11px] text-slate-600 font-medium">
              {profile.email} • github.com/{profile.githubUsername} • leetcode.com/{profile.leetCodeUsername}
            </p>
          </div>

          {/* Education */}
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">
              Education
            </h4>
            <div className="flex justify-between font-bold text-slate-900">
              <span>{profile.degree} in {profile.branch}</span>
              <span>2022 – {profile.graduationYear}</span>
            </div>
            <p className="text-slate-600 text-[10px]">CGPA: <strong>{profile.cgpa} / 10.0</strong> • Backlogs: <strong>0 (Clean Standing)</strong></p>
          </div>

          {/* Technical Skills */}
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">
              Technical Skills
            </h4>
            <p className="text-slate-700 text-[10.5px] leading-relaxed">
              <strong>Languages:</strong> Java, JavaScript, TypeScript, C++, Python, SQL<br />
              <strong>Frameworks & APIs:</strong> React.js, Node.js, Spring Boot, Express, RESTful APIs, WebSockets<br />
              <strong>Databases & Cloud:</strong> PostgreSQL, MongoDB, Redis, Docker, Git, CI/CD Actions
            </p>
          </div>

          {/* Projects */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">
              Featured Software Engineering Projects
            </h4>
            
            {bulletPoints.map(b => (
              <div key={b.id} className="space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{b.project}</span>
                  <span className="text-[10px] text-slate-500 font-mono">React, Node, Redis</span>
                </div>
                <p className="text-slate-700 text-[10.5px] leading-relaxed">
                  • {b.optimized}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
