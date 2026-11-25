import type { PortraitAbility } from '../portrait/PortraitAbilities'

/** Automatic import of the ability icons (`assets/abilities/*.webp`). */
const files = import.meta.glob<string>('../../assets/abilities/*.webp', {
  eager: true,
  import: 'default',
})

const ABILITY_SOURCES = new Map<string, string>()

for (const [path, source] of Object.entries(files)) {
  const name = /([^/]+)\.webp$/.exec(path)?.[1]
  if (name !== undefined) {
    ABILITY_SOURCES.set(name, source)
  }
}

/** URL of the icon (undefined if the file does not exist). */
export function getAbilitySource(ability: PortraitAbility): string | undefined {
  // ability_active.webp, ability_passive.webp, ability_special.webp, leader.webp
  return ABILITY_SOURCES.get(ability === 'leader' ? 'leader' : `ability_${ability}`)
}