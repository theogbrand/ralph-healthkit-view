import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const { getSyncStatusMock, saveFitnessScoreMock } = vi.hoisted(() => ({
  getSyncStatusMock: vi.fn(),
  saveFitnessScoreMock: vi.fn(),
}));

vi.mock('@/lib/db/queries', () => ({
  getSyncStatus: getSyncStatusMock,
  saveFitnessScore: saveFitnessScoreMock,
}));

vi.mock('@/lib/analytics/fitness-score', () => ({
  computeFitnessScoresForRange: vi.fn(() => []),
  computeScoreForWindow: vi.fn(() => null),
}));

vi.mock('@/lib/analytics/metrics', () => ({
  getRunningMetrics: vi.fn(() => []),
  getGymMetrics: vi.fn(() => []),
  getRunningWeekComparison: vi.fn(() => []),
  getGymWeekComparison: vi.fn(() => []),
}));

import { GET } from '@/app/api/analytics/route';

describe('GET /api/analytics', () => {
  const originalVercel = process.env.VERCEL;

  beforeEach(() => {
    getSyncStatusMock.mockReset();
    saveFitnessScoreMock.mockReset();
    process.env.VERCEL = originalVercel;
  });

  it('returns empty analytics payload when SQLite is unavailable', async () => {
    getSyncStatusMock.mockImplementation(() => {
      throw new Error('SqliteError: unable to open database file');
    });

    const req = new Request('http://localhost/api/analytics?range=30d') as unknown as NextRequest;
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.total_records).toBe(0);
    expect(body.overall_score).toBeNull();
    expect(body.last_sync).toBeNull();
    expect(body.categories.running.metrics).toEqual([]);
    expect(body.categories.gym.metrics).toEqual([]);
    expect(body.score_history).toEqual([]);
  });

  it('returns 500 for non-database errors', async () => {
    getSyncStatusMock.mockImplementation(() => {
      throw new Error('Unexpected analytics failure');
    });

    const req = new Request('http://localhost/api/analytics?range=30d') as unknown as NextRequest;
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain('Unexpected analytics failure');
  });

  it('returns empty analytics payload for non-database errors on Vercel', async () => {
    process.env.VERCEL = '1';
    getSyncStatusMock.mockImplementation(() => {
      throw new Error('Unexpected analytics failure');
    });

    const req = new Request('http://localhost/api/analytics?range=30d') as unknown as NextRequest;
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get('x-analytics-fallback')).toBe('1');
    expect(body.total_records).toBe(0);
    expect(body.overall_score).toBeNull();
  });
});
