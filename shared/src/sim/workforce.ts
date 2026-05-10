import { type PlanetId } from '../types/index'

export type WorkforceCategory = 'food' | 'industry' | 'research' | 'military' | 'propaganda'

export interface WorkforceSliders {
  food: number
  industry: number
  research: number
  military: number
  propaganda: number
}

export interface PlanetWorkforce {
  readonly planetId: PlanetId
  sliders: WorkforceSliders
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
  }
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
  return Math.round(totalAvailable * wf.sliders[category])
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
