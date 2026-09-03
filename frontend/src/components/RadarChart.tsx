import React from 'react';

interface RadarAxis {
  label: string;
  value: number; // 0 to 100
}

interface RadarChartProps {
  axes: RadarAxis[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ axes, size = 320 }) => {
  const center = size / 2;
  const radius = (size - 70) / 2;
  const totalAxes = axes.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Concentric polygon levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (angle: number, distance: number) => {
    return {
      x: center + distance * Math.cos(angle - Math.PI / 2),
      y: center + distance * Math.sin(angle - Math.PI / 2)
    };
  };

  // Build points string for the data polygon
  const dataPoints = axes.map((axis, i) => {
    const angle = i * angleStep;
    const distance = (axis.value / 100) * radius;
    const { x, y } = getCoordinates(angle, distance);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric grid polygons */}
        {levels.map((level, idx) => {
          const levelPoints = axes.map((_, i) => {
            const angle = i * angleStep;
            const distance = level * radius;
            const { x, y } = getCoordinates(angle, distance);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={idx}
              points={levelPoints}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis spokes */}
        {axes.map((_, i) => {
          const angle = i * angleStep;
          const { x, y } = getCoordinates(angle, radius);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Data polygon filled with teal gradient glow */}
        <polygon
          points={dataPoints}
          fill="rgba(45, 212, 191, 0.25)"
          stroke="#2dd4bf"
          strokeWidth={2.5}
          style={{
            filter: 'drop-shadow(0 0 12px rgba(45, 212, 191, 0.6))',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />

        {/* Data points nodes */}
        {axes.map((axis, i) => {
          const angle = i * angleStep;
          const distance = (axis.value / 100) * radius;
          const { x, y } = getCoordinates(angle, distance);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill="#fb7185"
              stroke="#f0fdfa"
              strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 0 8px rgba(251, 113, 133, 0.9))' }}
            />
          );
        })}

        {/* Axis Labels */}
        {axes.map((axis, i) => {
          const angle = i * angleStep;
          const labelDist = radius + 22;
          const { x, y } = getCoordinates(angle, labelDist);

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] font-semibold fill-slate-300 font-sans"
            >
              {axis.label} ({axis.value}%)
            </text>
          );
        })}
      </svg>
    </div>
  );
};
