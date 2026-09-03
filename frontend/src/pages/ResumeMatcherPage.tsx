import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Upload, 
  FileCheck,
  ShieldCheck,
  Layers,
  Zap
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { ResumeMatchResult } from '../types';

export const ResumeMatcherPage: React.FC = () => {
  const [resumeText, setResumeText] = useState<string>(
    `Aman Sharma | Software Developer
B.Tech CSE (8.2 CGPA) | 2026
Skills: Java, React, JavaScript, SQL, Node.js, Git, HTML/CSS, REST API
Projects:
- CloudSync: Real-time collaborative canvas with WebSockets and Redis.
- FinLedger: Java Spring Boot REST API for processing banking ledger transactions.`
  );

  const [jdText, setJdText] = useState<string>(
    `Software Development Engineer (SDE-1)
Requirements:
- Strong proficiency in Java or C++, Object-Oriented Programming, and Data Structures.
- Hands-on experience with SQL, REST APIs, Git, and Spring Boot microservices.
- Experience with Docker and AWS cloud deployments is a plus.
- Excellent problem-solving and communication skills.`
  );

  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<ResumeMatchResult | null>({
    matchPercentage: 76,
    matchedSkills: ['Java', 'SQL', 'Git', 'REST API', 'JavaScript', 'React'],
    missingSkills: ['Spring Boot (Deep)', 'Docker', 'AWS'],
    keywordMatchPercentage: 81,
    experienceMatchPercentage: 72,
    projectRelevancePercentage: 78,
    actionableFeedback: [
      'Incorporate quantitative metrics in your FinLedger project description (e.g. "processes 1,500 RPS with ACID compliance").',
      'Explicitly declare Spring Boot microservices and Docker containerization under your skills.',
      'Highlight database query indexing and transaction safety experience.'
    ]
  });

  const handleRunMatcher = async () => {
    setIsMatching(true);
    try {
      const res = await resumeService.matchResumeWithJobDescription(resumeText, jdText);
      setMatchResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          ATS & Recruiter Alignment
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Resume vs Job Description Matcher
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Paste your resume text alongside a target job description to evaluate ATS keyword match, project relevance, and missing technology signals.
        </p>
      </div>

      {/* 2-Column Input Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Resume Input */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <FileText className="w-4 h-4" /> Your Resume Content
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Plain text format</span>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={8}
            className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="Paste your resume text here..."
          />
        </div>

        {/* Right: Job Description Input */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <FileCheck className="w-4 h-4" /> Target Job Description
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Paste from LinkedIn/Indeed</span>
          </div>

          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={8}
            className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Paste company job description here..."
          />
        </div>

      </div>

      {/* Run Button */}
      <div className="text-center">
        <button
          onClick={handleRunMatcher}
          disabled={isMatching}
          className="px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
        >
          {isMatching ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Analyzing Match Telemetry...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run AI Resume Compatibility Match</span>
            </>
          )}
        </button>
      </div>

      {/* Results Overview */}
      {matchResult && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 animate-in fade-in duration-300">
          
          {/* Main Score Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">ATS Compatibility Index</span>
              <h3 className="text-2xl font-bold text-white font-display mt-0.5">Overall Resume Match: {matchResult.matchPercentage}%</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-semibold">Keyword Match</span>
                <span className="text-base font-bold text-cyan-400 font-mono">{matchResult.keywordMatchPercentage}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-semibold">Experience</span>
                <span className="text-base font-bold text-indigo-400 font-mono">{matchResult.experienceMatchPercentage}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-semibold">Project Relevance</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{matchResult.projectRelevancePercentage}%</span>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            
            {/* Matched */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
              <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Matched Skills & Keywords ({matchResult.matchedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.matchedSkills.map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
              <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Missing Keywords in Resume ({matchResult.missingSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.missingSkills.map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
                    ! {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* AI Actionable Recommendations */}
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-2 text-xs">
            <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> AI Resume Tailoring Recommendations
            </span>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed pt-1">
              {matchResult.actionableFeedback.map((fb, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400">▸</span>
                  <span>{fb}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ethical Notice */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>
              <strong>Ethical AI Guardrail:</strong> Always accurately represent your real project experience. Never falsely claim skills you have not practiced.
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
