'use client';

import { getTrendIcon, getTrendColor } from '@/lib/utils/formatters';

interface FitnessScoreProps {
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  size?: 'sm' | 'lg';
}

function getScoreColorHex(score: number): string {
  if (score < 50) return 'var(--apple-declining)';
  if (score < 70) return 'var(--apple-steps)';
  return 'var(--apple-improving)';
}

export function FitnessScore({ score, trend, size = 'lg' }: FitnessScoreProps) {
  const dimension = size === 'lg' ? 180 : 120;
  const strokeWidth = size === 'lg' ? 14 : 10;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (score === null) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ width: dimension, height: dimension }}
      >
        No score
      </div>
    );
  }

  const color = getScoreColorHex(score);
  const normalizedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (normalizedScore / 100) * circumference;
  const center = dimension / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          style={
            {
              '--ring-full': `${circumference}`,
              '--ring-target': `${offset}`,
            } as React.CSSProperties
          }
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--apple-ring-red)"
            strokeWidth={strokeWidth}
            opacity={0.2}
          />
          {/* Foreground arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${center} ${center})`}
            style={{
              animation: 'ring-fill 800ms cubic-bezier(0.65, 0, 0.35, 1) forwards',
            }}
          />
        </svg>
        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="apple-large-number" style={{ color }}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      {/* Trend label */}
      <span className={`apple-caption flex items-center gap-1 ${getTrendColor(trend)}`}>
        <span>{getTrendIcon(trend)}</span> {trend}
      </span>
    </div>
  );
}
