'use client';

import { useEffect, useRef } from 'react';
import { getTrendIcon } from '@/lib/utils/formatters';

interface FitnessScoreProps {
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  size?: 'sm' | 'lg';
}

function getScoreHex(score: number): string {
  if (score < 50) return '#FF3B30';
  if (score < 70) return '#FF9500';
  return '#34C759';
}

function getTrendBadgeColors(trend: 'improving' | 'stable' | 'declining') {
  switch (trend) {
    case 'improving':
      return { bg: 'rgba(52, 199, 89, 0.1)', text: '#34C759' };
    case 'declining':
      return { bg: 'rgba(255, 59, 48, 0.1)', text: '#FF3B30' };
    case 'stable':
      return { bg: 'rgba(134, 134, 139, 0.1)', text: '#86868B' };
  }
}

export function FitnessScore({ score, trend, size = 'lg' }: FitnessScoreProps) {
  const ringRef = useRef<SVGCircleElement>(null);
  const dimension = size === 'lg' ? 200 : 120;
  const strokeWidth = size === 'lg' ? 14 : 10;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (ringRef.current && score !== null) {
      const target = circumference * (1 - score / 100);
      ringRef.current.style.setProperty('--ring-circumference', `${circumference}`);
      ringRef.current.style.setProperty('--ring-target', `${target}`);
      // Trigger animation
      ringRef.current.style.animation = 'none';
      ringRef.current.getBoundingClientRect();
      ringRef.current.style.animation = 'ringDraw 1s ease-out forwards';
    }
  }, [score, circumference]);

  if (score === null) {
    return (
      <div
        className="flex items-center justify-center text-[var(--text-tertiary)]"
        style={{ width: dimension, height: dimension }}
      >
        <span className={size === 'lg' ? 'text-4xl' : 'text-2xl'}>—</span>
      </div>
    );
  }

  const color = getScoreHex(score);
  const trendColors = getTrendBadgeColors(trend);
  const dashoffset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeOpacity={0.1}
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            ref={ringRef}
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{
              ['--ring-circumference' as string]: circumference,
              ['--ring-target' as string]: dashoffset,
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`${size === 'lg' ? 'text-[56px]' : 'text-[28px]'} font-bold tracking-[-0.01em]`}
            style={{ color, lineHeight: 1 }}
          >
            {Math.round(score)}
          </span>
          {size === 'lg' && (
            <span className="mt-1 text-[13px] font-medium text-[var(--text-secondary)]">
              Fitness Score
            </span>
          )}
        </div>
      </div>
      {/* Trend pill badge */}
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-medium"
        style={{ backgroundColor: trendColors.bg, color: trendColors.text }}
      >
        {getTrendIcon(trend)} {trend}
      </span>
    </div>
  );
}
