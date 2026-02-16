'use client';

import { useEffect, useState } from 'react';

interface FitnessScoreProps {
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  size?: 'sm' | 'lg';
}

function getScoreRingColor(score: number): string {
  if (score < 50) return 'var(--ring-move)';
  if (score < 70) return 'var(--chart-amber)';
  return 'var(--ring-exercise)';
}

function getTrendLabel(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return 'Improving';
    case 'stable': return 'Stable';
    case 'declining': return 'Declining';
  }
}

function getTrendChevron(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return '▲';
    case 'stable': return '●';
    case 'declining': return '▼';
  }
}

export function FitnessScore({ score, trend, size = 'lg' }: FitnessScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const dimension = size === 'lg' ? 200 : 120;
  const strokeWidth = size === 'lg' ? 16 : 10;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = dimension / 2;

  useEffect(() => {
    if (score !== null) {
      // Trigger animation on mount by setting score after a frame
      const timer = requestAnimationFrame(() => {
        setAnimatedScore(score);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setAnimatedScore(0);
    }
  }, [score]);

  const progress = Math.min(Math.max(animatedScore / 100, 0), 1);
  const dashOffset = circumference * (1 - progress);

  if (score === null) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative" style={{ width: dimension, height: dimension }}>
          <svg
            width={dimension}
            height={dimension}
            viewBox={`0 0 ${dimension} ${dimension}`}
            className="-rotate-90"
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-muted-foreground">&mdash;</span>
          </div>
        </div>
      </div>
    );
  }

  const color = getScoreRingColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.08}
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
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`${size === 'lg' ? 'text-5xl' : 'text-2xl'} font-bold tracking-tight`}
            style={{ color, fontVariantNumeric: 'tabular-nums' }}
          >
            {Math.round(score)}
          </span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5" style={{ color }}>
        <span className="text-[10px]">{getTrendChevron(trend)}</span>
        <span className={`${size === 'lg' ? 'text-sm' : 'text-xs'} font-medium`}>
          {getTrendLabel(trend)}
        </span>
      </div>
    </div>
  );
}
