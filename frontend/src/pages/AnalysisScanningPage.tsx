import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Zap, BrainCircuit } from 'lucide-react';

interface AnalysisScanningPageProps {
  onComplete: () => void;
}

export const AnalysisScanningPage: React.FC<AnalysisScanningPageProps> = ({ onComplete }) => {
  const stages = [
    'Academic profile & CGPA analyzed',
    'Technical skills & frameworks evaluated',
    'GitHub repositories & commit telemetry parsed',
    'LeetCode problem distributions calibrated',
    'Projects & production architecture scored',
    'Soft skills & behavioral poise assessed',
    'Generating personalized 30/60/90 day roadmap'
  ];

  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStageIndex(prev => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 700);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(timer);
  }, [onComplete, stages.length]);

  return (
    <div className="fixed inset-0 z-50 bg-[#030408] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      
      {/* Outer Glowing Scanner Orb */}
      <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-indigo-500 border-b-purple-500 border-l-transparent animate-spin duration-1000" />
        <div className="w-24 h-24 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
          <BrainCircuit className="w-10 h-10 text-cyan-400 animate-pulse" />
        </div>
      </div>

      {/* Main Status Text */}
      <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-2">
        Analyzing Your Career Profile...
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-8">
        CareerAI neural heuristics are cross-referencing your baseline against 500+ tech hiring bars.
      </p>

      {/* Checklist of Stages */}
      <div className="w-full max-w-md bg-slate-950/80 border border-white/10 rounded-2xl p-6 text-left space-y-3">
        {stages.map((stage, idx) => {
          const isDone = idx < activeStageIndex;
          const isCurrent = idx === activeStageIndex;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                isDone 
                  ? 'text-emerald-400' 
                  : isCurrent 
                  ? 'text-cyan-300 font-bold' 
                  : 'text-slate-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 border ${
                isDone 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                  : isCurrent 
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 animate-pulse' 
                  : 'border-slate-800 bg-slate-900 text-slate-600'
              }`}>
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : isCurrent ? '●' : '○'}
              </div>
              <span className={isDone ? 'text-slate-300' : ''}>{stage}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};
