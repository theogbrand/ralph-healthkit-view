'use client';

import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { getTrendIcon, getTrendColor } from '@/lib/utils/formatters';

interface FitnessScoreProps {
  score: number | null;
  trend: 'improving' | 'stable' | 'declining';
  size?: 'sm' | 'lg';
}

function getScoreHex(score: number): string {
  if (score < 50) return '#c07070';
  if (score < 70) return '#c4a855';
  return '#7ba886';
}

export function FitnessScore({ score, trend, size = 'lg' }: FitnessScoreProps) {
  const dimension = size === 'lg' ? 200 : 120;
  const fontSize = size === 'lg' ? 'text-4xl' : 'text-2xl';
  const trendSize = size === 'lg' ? 'text-lg' : 'text-sm';

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
              background={{ fill: '#d5d0c8' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-bold`} style={{ color }}>
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
