export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatMetricValue(value: number, unit: string): string {
  switch (unit) {
    case 'count':
      return formatNumber(value);
    case 'kcal':
      return `${formatNumber(value)} kcal`;
    case 'bpm':
      return `${formatNumber(value)} bpm`;
    case 'ms':
      return `${formatNumber(value)} ms`;
    case 'mL/min/kg':
      return `${formatNumber(value, 1)} mL/min/kg`;
    case 'kg':
      return `${formatNumber(value, 1)} kg`;
    case '%':
      return `${formatNumber(value, 1)}%`;
    case 'km':
      return `${formatNumber(value, 2)} km`;
    case 'min':
      return `${formatNumber(value)} min`;
    case 'hr':
      return `${formatNumber(value, 1)} hr`;
    case 'mmHg':
      return `${formatNumber(value)} mmHg`;
    case 'breaths/min':
      return `${formatNumber(value, 1)} breaths/min`;
    case 'min/km':
      return formatPace(value);
    case 'kcal/min':
      return `${formatNumber(value, 1)} kcal/min`;
    default:
      return `${formatNumber(value, 1)} ${unit}`;
  }
}

export function formatPace(minutesPerKm: number): string {
  const wholeMinutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - wholeMinutes) * 60);
  return `${wholeMinutes}:${seconds.toString().padStart(2, '0')} min/km`;
}

export function getScoreColor(score: number): string {
  if (score < 50) return 'text-negative';
  if (score < 70) return 'text-warning';
  return 'text-positive';
}

export function getScoreBgColor(score: number): string {
  if (score < 50) return 'bg-negative';
  if (score < 70) return 'bg-warning';
  return 'bg-positive';
}

export function getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return '↑';
    case 'stable': return '→';
    case 'declining': return '↓';
  }
}

export function getTrendColor(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return 'text-positive';
    case 'stable': return 'text-stable';
    case 'declining': return 'text-negative';
  }
}
