// PHASE 17.L.D.13.I (2026-05-13) — shared display formatters. Extracted from TopToolbar.tsx
// + TechTreePanel.tsx after the research-accrual fix (17.L.D.12) introduced a duplicate
// formatRate definition. Single source of truth; future formatting changes only touch this
// file.

/**
 * Formats a per-tick rate for display, with decimal precision proportional to magnitude so
 * sub-1 rates remain visible (e.g. 2 starter Labs accrue 0.16 research points / tick — a
 * naive `Math.floor` rendering would lie with "+0/t" and make the toolbar chip look stuck).
 *
 * PHASE 17.L.D.21 (2026-05-13) — extended to handle NEGATIVE rates so the TopToolbar
 * delta chip can render net-consumption (e.g. "-1.4/t" when farms can't keep up with
 * citizen demand). Caller prepends "+" for positive; magnitude is unsigned here for
 * positives, signed with "-" prefix for negatives.
 *
 * - 0     → "0"
 * - |x|<1 → 2 decimal places  (e.g. "0.16" / "-0.16")
 * - <10   → 1 decimal place   (e.g. "5.4" / "-5.4")
 * - ≥10   → integer with locale separators (e.g. "47" or "-1,234")
 */
export function formatRate(rate: number): string {
  if (rate === 0) return '0'
  const abs = Math.abs(rate)
  const sign = rate < 0 ? '-' : ''
  if (abs < 1) return sign + abs.toFixed(2)
  if (abs < 10) return sign + abs.toFixed(1)
  return sign + Math.floor(abs).toLocaleString()
}
