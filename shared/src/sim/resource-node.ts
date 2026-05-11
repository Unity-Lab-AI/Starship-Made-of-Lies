import type { ResourceId, Vec3 } from '../types/index'

export type ResourceNodeTier = 'common' | 'rich' | 'motherlode'

export interface ResourceNode {
  readonly id: string
  readonly resourceId: ResourceId
  readonly initialAmount: number
  amountRemaining: number
  readonly tier: ResourceNodeTier
  readonly worldPosition: Vec3
  readonly tileFaceIndex: number
}

export function isDepleted(node: ResourceNode): boolean {
  return node.amountRemaining <= 0
}

export function tierYieldMultiplier(tier: ResourceNodeTier): number {
  switch (tier) {
    case 'common':
      return 1
    case 'rich':
      return 2.5
    case 'motherlode':
      return 6
  }
}

export function drillResourceNode(node: ResourceNode, requestedAmount: number): number {
  if (node.amountRemaining <= 0) return 0
  const drilled = Math.min(requestedAmount, node.amountRemaining)
  node.amountRemaining -= drilled
  return drilled
}

export interface BiomeDepositProfile {
  readonly minNodes: number
  readonly maxNodes: number
  readonly resourceWeights: ReadonlyArray<readonly [ResourceId, number]>
  readonly tierWeights: ReadonlyArray<readonly [ResourceNodeTier, number]>
}

export function defaultProfileForHostilityTier(
  hostilityTier: 0 | 1 | 2 | 3,
  catalog: {
    readonly stone: ResourceId
    readonly rareMetals: ResourceId
    readonly exoticAlloys: ResourceId
    readonly ancientTech: ResourceId
    readonly gas: ResourceId
    readonly scrap: ResourceId
    readonly components: ResourceId
  },
): BiomeDepositProfile {
  switch (hostilityTier) {
    case 0:
      return {
        minNodes: 0,
        maxNodes: 2,
        resourceWeights: [
          [catalog.stone, 1],
          [catalog.rareMetals, 0.15],
        ],
        tierWeights: [
          ['common', 1],
          ['rich', 0.1],
          ['motherlode', 0],
        ],
      }
    case 1:
      return {
        minNodes: 3,
        maxNodes: 5,
        resourceWeights: [
          [catalog.stone, 1.5],
          [catalog.rareMetals, 0.6],
          [catalog.gas, 0.4],
          [catalog.scrap, 0.3],
        ],
        tierWeights: [
          ['common', 1],
          ['rich', 0.3],
          ['motherlode', 0.05],
        ],
      }
    case 2:
      return {
        minNodes: 8,
        maxNodes: 15,
        resourceWeights: [
          [catalog.stone, 1],
          [catalog.rareMetals, 1.5],
          [catalog.exoticAlloys, 0.8],
          [catalog.gas, 1.2],
          [catalog.components, 0.6],
          [catalog.scrap, 0.5],
        ],
        tierWeights: [
          ['common', 1],
          ['rich', 0.6],
          ['motherlode', 0.15],
        ],
      }
    case 3:
      return {
        minNodes: 4,
        maxNodes: 8,
        resourceWeights: [
          [catalog.rareMetals, 1],
          [catalog.exoticAlloys, 1.8],
          [catalog.ancientTech, 1.5],
        ],
        tierWeights: [
          ['common', 0.3],
          ['rich', 1],
          ['motherlode', 0.5],
        ],
      }
  }
}

export function tierBaseAmount(tier: ResourceNodeTier): number {
  switch (tier) {
    case 'common':
      return 800
    case 'rich':
      return 2200
    case 'motherlode':
      return 6500
  }
}
