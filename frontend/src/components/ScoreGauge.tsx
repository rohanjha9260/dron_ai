import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  statusText?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 180,
  strokeWidth = 12,
  label = 'CAREER READINESS',
  statusText = 'On Track'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const isMini = size < 70;
  const isCompact = size >= 70 && size < 120;

  return (
    <div className="relative flex flex-col items-center justify-center select-none shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Dynamic Glowing Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 0 10px rgba(45, 212, 191, 0.6))'
          }}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="50%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Values scaled to size */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-0.5 pointer-events-none">
        {isMini ? (
          <span className="text-[11px] font-extrabold text-white font-mono leading-none">
            {clampedScore}%
          </span>
        ) : isCompact ? (
          <>
            <span className="text-base sm:text-lg font-extrabold text-white font-display leading-tight">
              {clampedScore}%
            </span>
            {label && (
              <span className="text-[8px] font-bold uppercase tracking-wider text-teal-300 line-clamp-1">
                {label}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-none">
              {clampedScore}<span className="text-sm font-semibold text-slate-400 font-sans">/100</span>
            </span>
            {label && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mt-1">
                {label}
              </span>
            )}
            {statusText && (
              <span className="mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {statusText}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
