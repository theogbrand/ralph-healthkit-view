import type { DateRange } from '@/types/analytics';

export function getDateRangeBounds(range: DateRange): { start: string; end: string } {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '60d':
      start.setDate(start.getDate() - 60);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '365d':
      start.setDate(start.getDate() - 365);
      break;
  }

  return {
    start: formatDateISO(start),
    end: formatDateISO(end),
  };
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
