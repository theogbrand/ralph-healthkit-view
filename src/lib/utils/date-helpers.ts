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
    end: formatDateISO(end) + ' 23:59:59',
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

/**
 * Returns ISO 8601 week key "YYYY-WNN" for a date string, matching Python's isocalendar().
 */
export function getISOWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  // ISO week: week containing Thursday determines the year
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Returns all ISO week keys between two dates (inclusive), for filling zero-count weeks.
 */
export function getISOWeekRange(startDate: string, endDate: string): string[] {
  const weeks: string[] = [];
  const seen = new Set<string>();
  const d = new Date(startDate);
  const end = new Date(endDate);
  while (d <= end) {
    const key = getISOWeekKey(d.toISOString());
    if (!seen.has(key)) {
      seen.add(key);
      weeks.push(key);
    }
    d.setDate(d.getDate() + 1);
  }
  return weeks;
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
