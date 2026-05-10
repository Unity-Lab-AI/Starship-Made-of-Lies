import { type CivId, type PlanetId } from '../types/index'

export type WorkforceCategory = 'food' | 'industry' | 'research' | 'military' | 'propaganda'

export interface WorkforceSliders {
  food: number
  industry: number
  research: number
  military: number
  propaganda: number
}

export interface ManualPin {
  readonly civId: CivId
  readonly planetId: PlanetId
  readonly category: WorkforceCategory
  readonly count: number
}

export interface PlanetWorkforce {
  readonly planetId: PlanetId
  sliders: WorkforceSliders
  manualPins: ManualPin[]
}

export function newPlanetWorkforce(planetId: PlanetId): PlanetWorkforce {
  return {
    planetId,
    sliders: {
      food: 0.4,
      industry: 0.2,
      research: 0.15,
      military: 0.1,
      propaganda: 0.15,
    },
    manualPins: [],
  }
}

export function pinManually(wf: PlanetWorkforce, pin: ManualPin): void {
  if (pin.planetId !== wf.planetId) {
    throw new Error(`pinManually: planetId mismatch (${pin.planetId} vs ${wf.planetId})`)
  }
  if (pin.count < 0) throw new Error(`pinManually: count must be non-negative, got ${pin.count}`)
  const existing = wf.manualPins.findIndex(
    (p) => p.civId === pin.civId && p.category === pin.category,
  )
  if (existing >= 0) wf.manualPins[existing] = pin
  else wf.manualPins.push(pin)
}

export function clearManualPin(
  wf: PlanetWorkforce,
  civId: CivId,
  category: WorkforceCategory,
): boolean {
  const idx = wf.manualPins.findIndex((p) => p.civId === civId && p.category === category)
  if (idx < 0) return false
  wf.manualPins.splice(idx, 1)
  return true
}

export function manualPinTotal(wf: PlanetWorkforce, category: WorkforceCategory): number {
  let total = 0
  for (const p of wf.manualPins) if (p.category === category) total += p.count
  return total
}

export function setSlider(wf: PlanetWorkforce, category: WorkforceCategory, value: number): void {
  if (value < 0 || value > 1) {
    throw new Error(`Workforce slider value must be 0-1, got ${value}`)
  }
  wf.sliders[category] = value
  normalizeSliders(wf.sliders)
}

export function normalizeSliders(sliders: WorkforceSliders): void {
  const total =
    sliders.food + sliders.industry + sliders.research + sliders.military + sliders.propaganda
  if (total <= 0) {
    sliders.food = 1
    sliders.industry = 0
    sliders.research = 0
    sliders.military = 0
    sliders.propaganda = 0
    return
  }
  sliders.food /= total
  sliders.industry /= total
  sliders.research /= total
  sliders.military /= total
  sliders.propaganda /= total
}

export function citizensAssignedTo(
  wf: PlanetWorkforce,
  category: WorkforceCategory,
  totalAvailable: number,
): number {
  const pinned = manualPinTotal(wf, category)
  const remainingAfterPins = Math.max(0, totalAvailable - totalManualPins(wf))
  const sliderShare = Math.round(remainingAfterPins * wf.sliders[category])
  return pinned + sliderShare
}

export function totalManualPins(wf: PlanetWorkforce): number {
  let total = 0
  for (const p of wf.manualPins) total += p.count
  return total
}

export function workforceCategorySummary(
  wf: PlanetWorkforce,
  totalAvailable: number,
): Readonly<Record<WorkforceCategory, number>> {
  return {
    food: citizensAssignedTo(wf, 'food', totalAvailable),
    industry: citizensAssignedTo(wf, 'industry', totalAvailable),
    research: citizensAssignedTo(wf, 'research', totalAvailable),
    military: citizensAssignedTo(wf, 'military', totalAvailable),
    propaganda: citizensAssignedTo(wf, 'propaganda', totalAvailable),
  }
}
