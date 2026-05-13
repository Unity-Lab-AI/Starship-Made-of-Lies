// PHASE 17.L.D.13.I (2026-05-13) — shared display formatters. Extracted from TopToolbar.tsx
// + TechTreePanel.tsx after the research-accrual fix (17.L.D.12) introduced a duplicate
// formatRate definition. Single source of truth; future formatting changes only touch this
// file.

/**
 * Formats a per-tick rate for display, with decimal precision proportional to magnitude so
 * sub-1 rates remain visible (e.g. 2 starter Labs accrue 0.16 research points / tick — a
 * naive `Math.floor` rendering would lie with "+0/t" and make the toolbar chip look stuck).
 *
 * - 0 or negative → "0"
 * - <1            → 2 decimal places (e.g. "0.16")
 * - 1 to <10      → 1 decimal place  (e.g. "5.4")
 * - ≥10           → integer with locale separators (e.g. "47" or "1,234")
 */
export function formatRate(rate: number): string {
  if (rate <= 0) return '0'
  if (rate < 1) return rate.toFixed(2)
  if (rate < 10) return rate.toFixed(1)
  return Math.floor(rate).toLocaleString()
}
