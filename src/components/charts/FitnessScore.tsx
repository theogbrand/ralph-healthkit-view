'use client';

import { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { getTrendIcon, getTrendColor } from '@/lib/utils/formatters';
import { getScoreHex, TRACK_LIGHT } from '@/lib/utils/chart-colors';

interface FitnessScoreProps {
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  size?: 'sm' | 'lg';
}

function useCountUp(target: number, duration: number = 1000, enabled: boolean = true) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!enabled || hasAnimated.current) {
      return;
    }
    hasAnimated.current = true;

    const startTime = performance.now();
    let animationId: number;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    }

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [target, duration, enabled]);

  return value;
}

export function FitnessScore({ score, trend, size = 'lg' }: FitnessScoreProps) {
  const dimension = size === 'lg' ? 200 : 120;
  const fontSize = size === 'lg' ? 'text-5xl' : 'text-2xl';
  const [showTrend, setShowTrend] = useState(false);
  const animatedScore = useCountUp(score ?? 0, 1000, score !== null);

  useEffect(() => {
    if (score !== null) {
      const timer = setTimeout(() => setShowTrend(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [score]);

  if (score === null) {
    return (
      <div
        className="flex flex-col items-center justify-center text-muted-foreground"
        style={{ width: dimension, height: dimension }}
      >
        <div
          className="rounded-full border-4 border-dashed border-muted flex items-center justify-center"
          style={{ width: dimension, height: dimension }}
        >
          <span className="text-2xl font-bold">&mdash;</span>
        </div>
        <span className="mt-2 text-xs text-muted-foreground">Not enough data yet</span>
      </div>
    );
  }

  const color = getScoreHex(score);
  const data = [{ value: score, fill: color }];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            startAngle={225}
            endAngle={-45}
            data={data}
            barSize={size === 'lg' ? 14 : 10}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: TRACK_LIGHT }}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-bold font-mono tabular-nums`} style={{ color }}>
            {animatedScore}
          </span>
        </div>
      </div>
      <span
        className={`text-xs font-semibold uppercase tracking-wide ${getTrendColor(trend)} transition-opacity duration-300`}
        style={{ opacity: showTrend ? 1 : 0 }}
      >
        {getTrendIcon(trend)} {trend}
      </span>
    </div>
  );
}
