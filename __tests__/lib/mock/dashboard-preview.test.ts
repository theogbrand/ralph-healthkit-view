import { describe, it, expect } from 'vitest';
import type { DateRange } from '@/types/analytics';
import {
  getMockDashboardData,
  hasRealDashboardData,
} from '@/lib/mock/dashboard-preview';

const RANGES: DateRange[] = ['30d', '60d', '90d', '365d'];
const EXPECTED_HISTORY_LENGTH: Record<DateRange, number> = {
  '30d': 30,
  '60d': 60,
  '90d': 90,
  '365d': 365,
};

function formatLocalISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('dashboard preview mock data', () => {
  it('returns valid mock shape for every range', () => {
    for (const range of RANGES) {
      const data = getMockDashboardData(range);

      expect(data.total_records).toBe(0);
      expect(data.last_sync).toBeNull();
      expect(typeof data.overall_score).toBe('number');
      expect(data.overall_score).toBeGreaterThan(0);
      expect(data.categories.running.metrics.length).toBeGreaterThan(0);
      expect(data.categories.gym.metrics.length).toBeGreaterThan(0);
      expect(data.categories.running.weekComparison?.length).toBeGreaterThan(0);
      expect(data.categories.gym.weekComparison?.length).toBeGreaterThan(0);
    }
  });

  it('returns score_history sized to date range', () => {
    for (const range of RANGES) {
      const data = getMockDashboardData(range);

      expect(data.score_history).toHaveLength(EXPECTED_HISTORY_LENGTH[range]);
      expect(data.score_history.every((entry) => Number.isFinite(entry.value))).toBe(true);
      expect(data.score_history.every((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.date))).toBe(true);
    }
  });

  it('returns non-empty sparkline data for all metrics', () => {
    const data = getMockDashboardData('90d');
    const allMetrics = [...data.categories.running.metrics, ...data.categories.gym.metrics];

    expect(allMetrics.length).toBeGreaterThan(0);
    expect(allMetrics.every((metric) => metric.sparkline_data.length > 0)).toBe(true);
  });

  it('ends score history on today in local calendar date', () => {
    const data = getMockDashboardData('30d');
    const lastPoint = data.score_history.at(-1);

    expect(lastPoint).toBeDefined();
    expect(lastPoint?.date).toBe(formatLocalISO(new Date()));
  });
});

describe('hasRealDashboardData', () => {
  it('returns false when both overall score and total records are empty', () => {
    expect(hasRealDashboardData({ overall_score: null, total_records: 0 })).toBe(false);
  });

  it('returns true when overall score exists', () => {
    expect(hasRealDashboardData({ overall_score: 76, total_records: 0 })).toBe(true);
  });

  it('returns true when records exist even if overall score is null', () => {
    expect(hasRealDashboardData({ overall_score: null, total_records: 5 })).toBe(true);
  });
});
