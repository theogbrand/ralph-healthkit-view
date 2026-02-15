/**
 * Hex color constants that match the oklch theme palette.
 * Recharts requires hex/rgb values and cannot use CSS custom properties directly.
 */

// Semantic score colors (hex equivalents of oklch theme values)
export const SCORE_RED = '#dc3545';    // oklch(0.63 0.22 25) - negative/declining
export const SCORE_AMBER = '#e5a30d';  // oklch(0.80 0.16 85) - warning/fair
export const SCORE_GREEN = '#2daa57';  // oklch(0.72 0.19 155) - positive/improving

// Brand accent
export const ACCENT = '#e06434';       // oklch(0.72 0.19 40) - coral-orange

// Chart palette
export const CHART_1 = '#e06434';      // coral-orange (accent)
export const CHART_2 = '#2da89e';      // teal
export const CHART_3 = '#4338ca';      // indigo
export const CHART_4 = '#e5a30d';      // amber
export const CHART_5 = '#d94066';      // rose

// Track/background colors
export const TRACK_LIGHT = '#e8e5e0';  // oklch(0.92 0.005 80) - border equivalent
export const TRACK_DARK = '#3a3836';   // oklch(0.30 0.01 60) - dark mode border

export function getScoreHex(score: number): string {
  if (score < 50) return SCORE_RED;
  if (score < 70) return SCORE_AMBER;
  return SCORE_GREEN;
}
