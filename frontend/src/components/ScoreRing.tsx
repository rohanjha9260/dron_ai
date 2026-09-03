import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  gradientId?: string;
  color?: 'primary' | 'cyan' | 'emerald' | 'amber' | 'rose';
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label = 'Score',
  sublabel,
  color = 'primary'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const colorMap = {
    primary: { stroke: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.5)', text: 'text-teal-400' },
    cyan: { stroke: '#fb7185', glow: 'rgba(251, 113, 133, 0.5)', text: 'text-rose-400' },
    emerald: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400' },
    amber: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-400' },
    rose: { stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', text: 'text-rose-400' }
  };

  const selectedColor = colorMap[color];

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={selectedColor.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 8px ${selectedColor.glow})`
          }}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
          {score}%
        </span>
        {label && (
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
