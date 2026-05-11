export type HostilityTier = 0 | 1 | 2 | 3

export interface BiomeDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly hostilityTier: HostilityTier
  readonly resourceHints: Readonly<Record<string, number>>
  readonly description: string
}

export const BIOMES: ReadonlyArray<BiomeDef> = [
  {
    id: 'terran',
    name: 'Terran',
    emoji: '🌍',
    hostilityTier: 0,
    resourceHints: { food: 1.5, wood: 1.2, stone: 1.0, water: 1.4 },
    description:
      'Earthlike biosphere — plentiful food, fresh water, hardwood. Default home-planet biome.',
  },
  {
    id: 'archipelago',
    name: 'Archipelago',
    emoji: '🏝️',
    hostilityTier: 0,
    resourceHints: { food: 1.3, water: 1.8, fish: 1.6, sand: 1.2 },
    description: 'Tropical island chains. Strong fishing + water. Limited large-scale agriculture.',
  },
  {
    id: 'jungle',
    name: 'Jungle',
    emoji: '🌴',
    hostilityTier: 1,
    resourceHints: { wood: 2.0, food: 1.1, exoticFlora: 1.5, water: 1.3 },
    description:
      'Dense tropical rainforest. Hardwood + exotic-flora abundance. Disease + heat hostility.',
  },
  {
    id: 'desert',
    name: 'Desert',
    emoji: '🏜️',
    hostilityTier: 1,
    resourceHints: { food: 0.4, energy: 1.7, rareMetals: 0.9, sand: 1.5 },
    description: 'Arid wasteland. Solar abundance. Limited food. Rare-metal traces near surface.',
  },
  {
    id: 'arctic',
    name: 'Arctic',
    emoji: '❄️',
    hostilityTier: 1,
    resourceHints: { food: 0.5, water: 1.5, gas: 1.2 },
    description: 'Frozen tundra. Permafrost reservoir of trapped gases. Survival tech needed.',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    hostilityTier: 1,
    resourceHints: { food: 1.6, water: 2.0, fish: 1.8, gas: 0.8 },
    description: 'Surface oceans dominate. Aquaculture + hydrothermal vents.',
  },
  {
    id: 'swamp',
    name: 'Swamp',
    emoji: '🐊',
    hostilityTier: 2,
    resourceHints: { wood: 1.5, gas: 1.8, exoticFlora: 1.3, food: 0.7 },
    description: 'Boggy lowlands. Methane + alchemic flora. Disease pressure.',
  },
  {
    id: 'volcanic',
    name: 'Volcanic',
    emoji: '🌋',
    hostilityTier: 2,
    resourceHints: { rareMetals: 2.0, energy: 1.5, food: 0.3, stone: 1.4 },
    description: 'Active vulcanism. Rare-metal seeps. Geothermal energy. Constant impact hazard.',
  },
  {
    id: 'gasGiantMoon',
    name: 'Gas Giant Moon',
    emoji: '🪐',
    hostilityTier: 2,
    resourceHints: { gas: 3.0, exoticAlloys: 1.5, energy: 1.3, food: 0.0 },
    description:
      'Tidally-locked moon orbiting a gas giant. Atmospheric mining boom. No native ecosystem.',
  },
  {
    id: 'asteroid',
    name: 'Asteroid Belt',
    emoji: '☄️',
    hostilityTier: 2,
    resourceHints: { rareMetals: 2.5, stone: 2.0, energy: 0.8, food: 0.0 },
    description: 'Cluster of mineral-rich asteroids. Zero atmosphere. Mining colonies only.',
  },
  {
    id: 'crystalline',
    name: 'Crystalline',
    emoji: '💎',
    hostilityTier: 2,
    resourceHints: { rareMetals: 2.0, exoticAlloys: 2.2, ancientTech: 1.0, food: 0.2 },
    description: 'Crystal-lattice surface. Optical-tech abundance. Hostile to organic life.',
  },
  {
    id: 'junkyard',
    name: 'Junkyard',
    emoji: '🚛',
    hostilityTier: 1,
    resourceHints: { components: 2.5, scrap: 3.0, ancientTech: 1.4, food: 0.5 },
    description:
      'Surface littered with crashed ancient civilization ruins + dead ships. Salvage abundance.',
  },
  {
    id: 'lava',
    name: 'Lava',
    emoji: '🔥',
    hostilityTier: 3,
    resourceHints: { rareMetals: 3.0, exoticAlloys: 2.5, energy: 2.0, food: 0.0 },
    description:
      'Surface molten. Heat-resistant alloys + exotic-element abundance. End-game tech only.',
  },
  {
    id: 'ringworld',
    name: 'Ringworld Fragment',
    emoji: '⭕',
    hostilityTier: 3,
    resourceHints: { exoticAlloys: 3.0, ancientTech: 2.5, food: 0.6, energy: 1.6 },
    description: 'Megastructure remnant. Ancient-civ tech traces. End-game prize.',
  },
]

export function getBiome(id: string): BiomeDef {
  const biome = BIOMES.find((b) => b.id === id)
  if (!biome) throw new Error(`Unknown biome id: ${id}`)
  return biome
}

export function biomesByTier(tier: HostilityTier): ReadonlyArray<BiomeDef> {
  return BIOMES.filter((b) => b.hostilityTier === tier)
}
