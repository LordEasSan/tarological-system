/**
 * Engine — Archetypes Module
 *
 * Manages archetype family definitions and Major Arcana mappings.
 * Each family provides a different interpretive lens for the 22 Major Arcana.
 */
import type { ArchetypeFamily } from '../types';

export interface ArchetypeMapping {
  number: number;
  name: string;
  archetype: string;
  keywords: string[];
}

export interface ArchetypeFamilyDef {
  family: ArchetypeFamily;
  label: string;
  description: string;
  mappings: ArchetypeMapping[];
}

/** Jungian archetype mappings for the 22 Major Arcana */
const JUNGIAN_MAPPINGS: ArchetypeMapping[] = [
  { number: 0, name: 'The Fool', archetype: 'The Divine Child', keywords: ['innocence', 'new beginnings', 'leap of faith'] },
  { number: 1, name: 'The Magician', archetype: 'The Trickster', keywords: ['power', 'manifestation', 'resourcefulness'] },
  { number: 2, name: 'The High Priestess', archetype: 'The Anima', keywords: ['intuition', 'mystery', 'inner knowledge'] },
  { number: 3, name: 'The Empress', archetype: 'The Great Mother', keywords: ['fertility', 'nurturing', 'abundance'] },
  { number: 4, name: 'The Emperor', archetype: 'The Father', keywords: ['authority', 'structure', 'stability'] },
  { number: 5, name: 'The Hierophant', archetype: 'The Sage', keywords: ['tradition', 'wisdom', 'spiritual guidance'] },
  { number: 6, name: 'The Lovers', archetype: 'The Syzygy', keywords: ['union', 'harmony', 'choice'] },
  { number: 7, name: 'The Chariot', archetype: 'The Hero', keywords: ['willpower', 'triumph', 'determination'] },
  { number: 8, name: 'Strength', archetype: 'The Self', keywords: ['courage', 'inner strength', 'patience'] },
  { number: 9, name: 'The Hermit', archetype: 'The Wise Old Man', keywords: ['solitude', 'introspection', 'guidance'] },
  { number: 10, name: 'Wheel of Fortune', archetype: 'The Mandala', keywords: ['cycles', 'fate', 'turning point'] },
  { number: 11, name: 'Justice', archetype: 'The Judge', keywords: ['balance', 'fairness', 'truth'] },
  { number: 12, name: 'The Hanged Man', archetype: 'The Martyr', keywords: ['sacrifice', 'surrender', 'new perspective'] },
  { number: 13, name: 'Death', archetype: 'The Shadow', keywords: ['transformation', 'endings', 'rebirth'] },
  { number: 14, name: 'Temperance', archetype: 'The Healer', keywords: ['balance', 'moderation', 'patience'] },
  { number: 15, name: 'The Devil', archetype: 'The Shadow Self', keywords: ['bondage', 'materialism', 'temptation'] },
  { number: 16, name: 'The Tower', archetype: 'The Destroyer', keywords: ['upheaval', 'revelation', 'sudden change'] },
  { number: 17, name: 'The Star', archetype: 'The Spirit', keywords: ['hope', 'inspiration', 'serenity'] },
  { number: 18, name: 'The Moon', archetype: 'The Unconscious', keywords: ['illusion', 'fear', 'subconscious'] },
  { number: 19, name: 'The Sun', archetype: 'The Persona', keywords: ['joy', 'success', 'vitality'] },
  { number: 20, name: 'Judgement', archetype: 'The Resurrection', keywords: ['rebirth', 'absolution', 'inner calling'] },
  { number: 21, name: 'The World', archetype: 'The Individuation', keywords: ['completion', 'integration', 'accomplishment'] },
];

/** All supported archetype families */
export const ARCHETYPE_FAMILIES: ArchetypeFamilyDef[] = [
  {
    family: 'Jungian',
    label: 'Jungian Archetypes',
    description: 'Carl Jung\'s collective unconscious archetypes mapped to the Major Arcana',
    mappings: JUNGIAN_MAPPINGS,
  },
  {
    family: 'Mythological',
    label: 'Mythological',
    description: 'Classical mythological figures and narrative patterns',
    mappings: JUNGIAN_MAPPINGS.map(m => ({ ...m, archetype: `Myth:${m.archetype}` })),
  },
  {
    family: 'Alchemical',
    label: 'Alchemical',
    description: 'Hermetic alchemical stages and transmutation symbols',
    mappings: JUNGIAN_MAPPINGS.map(m => ({ ...m, archetype: `Alch:${m.archetype}` })),
  },
  {
    family: 'Qabalistic',
    label: 'Qabalistic',
    description: 'Qabalistic Tree of Life paths and sephiroth correspondences',
    mappings: JUNGIAN_MAPPINGS.map(m => ({ ...m, archetype: `Qab:${m.archetype}` })),
  },
  {
    family: 'Astrological',
    label: 'Astrological',
    description: 'Zodiacal and planetary correspondences',
    mappings: JUNGIAN_MAPPINGS.map(m => ({ ...m, archetype: `Astro:${m.archetype}` })),
  },
  {
    family: 'Custom',
    label: 'Custom',
    description: 'User-defined archetype mappings',
    mappings: JUNGIAN_MAPPINGS,
  },
];

/**
 * Get archetype family definition by family name
 */
export function getArchetypeFamily(family: ArchetypeFamily): ArchetypeFamilyDef {
  return ARCHETYPE_FAMILIES.find(f => f.family === family) ?? ARCHETYPE_FAMILIES[0];
}

/**
 * Get archetype mapping for a specific card number in a given family
 */
export function getArchetypeForCard(
  family: ArchetypeFamily,
  cardNumber: number,
): ArchetypeMapping | undefined {
  const familyDef = getArchetypeFamily(family);
  return familyDef.mappings.find(m => m.number === cardNumber);
}
