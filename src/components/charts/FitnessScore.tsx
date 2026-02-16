'use client';

import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { getScoreHex, getTrendIcon, getTrendColor } from '@/lib/utils/formatters';

interface FitnessScoreProps {
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  size?: 'sm' | 'lg';
}

export function FitnessScore({ score, trend, size = 'lg' }: FitnessScoreProps) {
  const dimension = size === 'lg' ? 200 : 120;
  const trendSize = size === 'lg' ? 'text-lg' : 'text-sm';

  if (score === null) {
    return (
      <div
        className="flex items-center justify-center text-[#8E8E93]"
        style={{ width: dimension, height: dimension }}
      >
        No score
      </div>
    );
  }

  const color = getScoreHex(score);
  const data = [{ value: score, fill: color }];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="animate-ring-fill relative" style={{ width: dimension, height: dimension }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            startAngle={225}
            endAngle={-45}
            data={data}
            barSize={size === 'lg' ? 16 : 10}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={10}
              background={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`${size === 'lg' ? 'text-[34px]' : 'text-[22px]'} font-bold tracking-[-0.3px] tabular-nums`}
            style={{ color }}
          >
            {Math.round(score)}
          </span>
        </div>
      </div>
      <span className={`${trendSize} font-medium ${getTrendColor(trend)}`}>
        {getTrendIcon(trend)} {trend}
      </span>
    </div>
  );
}
