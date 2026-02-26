/* ===================================================
 * MTPS Mock API — Local development mock data
 * Provides realistic mock responses for all endpoints
 * =================================================== */

import type {
  TarotCard,
  PlacedCard,
  SpreadPosition,
  MeaningWeights,
  TarotParameters,
  GenerateResponse,
  VerifyResponse,
  ReadingResponse,
  ArchetypesResponse,
} from '../types';

// ─── Major Arcana Data ──────────────────────────────

const MAJOR_ARCANA: Omit<TarotCard, 'isReversed'>[] = [
  { id: 'major-0', name: 'The Fool', number: 0, isMajor: true, archetype: 'The Innocent', keywords: ['beginnings', 'freedom', 'innocence'], meaningUp: 'New beginnings, spontaneity, a free spirit', meaningReversed: 'Recklessness, risk-taking, foolishness' },
  { id: 'major-1', name: 'The Magician', number: 1, isMajor: true, archetype: 'The Creator', keywords: ['willpower', 'manifestation', 'resourcefulness'], meaningUp: 'Manifestation, resourcefulness, power', meaningReversed: 'Manipulation, poor planning, untapped talents' },
  { id: 'major-2', name: 'The High Priestess', number: 2, isMajor: true, archetype: 'The Sage', keywords: ['intuition', 'mystery', 'subconscious'], meaningUp: 'Intuition, sacred knowledge, divine feminine', meaningReversed: 'Secrets, withdrawal, silence' },
  { id: 'major-3', name: 'The Empress', number: 3, isMajor: true, archetype: 'The Mother', keywords: ['fertility', 'nature', 'abundance'], meaningUp: 'Femininity, beauty, nature, abundance', meaningReversed: 'Creative block, dependence, emptiness' },
  { id: 'major-4', name: 'The Emperor', number: 4, isMajor: true, archetype: 'The Father', keywords: ['authority', 'structure', 'control'], meaningUp: 'Authority, establishment, structure', meaningReversed: 'Tyranny, rigidity, coldness' },
  { id: 'major-5', name: 'The Hierophant', number: 5, isMajor: true, archetype: 'The Teacher', keywords: ['tradition', 'conformity', 'education'], meaningUp: 'Spiritual wisdom, tradition, conformity', meaningReversed: 'Rebellion, subversiveness, new approaches' },
  { id: 'major-6', name: 'The Lovers', number: 6, isMajor: true, archetype: 'The Lover', keywords: ['love', 'harmony', 'relationships'], meaningUp: 'Love, harmony, relationships, alignment', meaningReversed: 'Disharmony, imbalance, misalignment' },
  { id: 'major-7', name: 'The Chariot', number: 7, isMajor: true, archetype: 'The Warrior', keywords: ['determination', 'willpower', 'victory'], meaningUp: 'Control, willpower, determination, victory', meaningReversed: 'Lack of direction, aggression, powerlessness' },
  { id: 'major-8', name: 'Strength', number: 8, isMajor: true, archetype: 'The Hero', keywords: ['courage', 'patience', 'inner strength'], meaningUp: 'Courage, persuasion, patience, inner strength', meaningReversed: 'Self-doubt, weakness, insecurity' },
  { id: 'major-9', name: 'The Hermit', number: 9, isMajor: true, archetype: 'The Seeker', keywords: ['introspection', 'solitude', 'guidance'], meaningUp: 'Soul-searching, introspection, being alone', meaningReversed: 'Isolation, loneliness, withdrawal' },
  { id: 'major-10', name: 'Wheel of Fortune', number: 10, isMajor: true, archetype: 'The Trickster', keywords: ['fate', 'cycles', 'turning point'], meaningUp: 'Good luck, karma, life cycles, destiny', meaningReversed: 'Bad luck, resistance to change, breaking cycles' },
  { id: 'major-11', name: 'Justice', number: 11, isMajor: true, archetype: 'The Judge', keywords: ['fairness', 'truth', 'law'], meaningUp: 'Justice, fairness, truth, law', meaningReversed: 'Unfairness, dishonesty, unaccountability' },
  { id: 'major-12', name: 'The Hanged Man', number: 12, isMajor: true, archetype: 'The Martyr', keywords: ['sacrifice', 'release', 'new perspective'], meaningUp: 'Pause, surrender, letting go, new perspectives', meaningReversed: 'Delays, resistance, stalling' },
  { id: 'major-13', name: 'Death', number: 13, isMajor: true, archetype: 'The Transformer', keywords: ['endings', 'change', 'transformation'], meaningUp: 'Endings, change, transformation, transition', meaningReversed: 'Resistance to change, fear of change' },
  { id: 'major-14', name: 'Temperance', number: 14, isMajor: true, archetype: 'The Healer', keywords: ['balance', 'moderation', 'patience'], meaningUp: 'Balance, moderation, patience, purpose', meaningReversed: 'Imbalance, excess, lack of purpose' },
  { id: 'major-15', name: 'The Devil', number: 15, isMajor: true, archetype: 'The Shadow', keywords: ['bondage', 'materialism', 'shadow self'], meaningUp: 'Shadow self, attachment, addiction, materialism', meaningReversed: 'Releasing limiting beliefs, exploring self' },
  { id: 'major-16', name: 'The Tower', number: 16, isMajor: true, archetype: 'The Destroyer', keywords: ['upheaval', 'revelation', 'awakening'], meaningUp: 'Sudden change, upheaval, chaos, revelation', meaningReversed: 'Avoiding disaster, fear of suffering' },
  { id: 'major-17', name: 'The Star', number: 17, isMajor: true, archetype: 'The Guide', keywords: ['hope', 'faith', 'renewal'], meaningUp: 'Hope, faith, purpose, renewal, spirituality', meaningReversed: 'Lack of faith, despair, disconnection' },
  { id: 'major-18', name: 'The Moon', number: 18, isMajor: true, archetype: 'The Dreamer', keywords: ['illusion', 'fear', 'subconscious'], meaningUp: 'Illusion, fear, anxiety, subconscious, intuition', meaningReversed: 'Release of fear, repressed emotion, clarity' },
  { id: 'major-19', name: 'The Sun', number: 19, isMajor: true, archetype: 'The Child', keywords: ['joy', 'success', 'vitality'], meaningUp: 'Positivity, fun, warmth, success, vitality', meaningReversed: 'Inner child, feeling down, overly optimistic' },
  { id: 'major-20', name: 'Judgement', number: 20, isMajor: true, archetype: 'The Awakener', keywords: ['reflection', 'reckoning', 'awakening'], meaningUp: 'Judgement, rebirth, inner calling, absolution', meaningReversed: 'Self-doubt, refusal of self-examination' },
  { id: 'major-21', name: 'The World', number: 21, isMajor: true, archetype: 'The Whole', keywords: ['completion', 'integration', 'accomplishment'], meaningUp: 'Completion, integration, accomplishment, travel', meaningReversed: 'Incompletion, stagnation, emptiness' },
];

// ─── Spread Layouts ─────────────────────────────────

const SPREADS: Record<string, SpreadPosition[]> = {
  'three-card': [
    { index: 0, label: 'Past', description: 'Influences from the past', x: 20, y: 50, rotation: 0 },
    { index: 1, label: 'Present', description: 'Current situation', x: 50, y: 50, rotation: 0 },
    { index: 2, label: 'Future', description: 'Potential outcome', x: 80, y: 50, rotation: 0 },
  ],
  'celtic-cross': [
    { index: 0, label: 'Present', description: 'Current situation', x: 35, y: 50, rotation: 0 },
    { index: 1, label: 'Challenge', description: 'Immediate challenge', x: 35, y: 50, rotation: 90 },
    { index: 2, label: 'Foundation', description: 'Root cause', x: 35, y: 80, rotation: 0 },
    { index: 3, label: 'Recent Past', description: 'Recent influence', x: 15, y: 50, rotation: 0 },
    { index: 4, label: 'Crown', description: 'Best possible outcome', x: 35, y: 20, rotation: 0 },
    { index: 5, label: 'Near Future', description: 'What is approaching', x: 55, y: 50, rotation: 0 },
    { index: 6, label: 'Self', description: 'Your attitude', x: 78, y: 80, rotation: 0 },
    { index: 7, label: 'Environment', description: 'External influences', x: 78, y: 60, rotation: 0 },
    { index: 8, label: 'Hopes', description: 'Hopes and fears', x: 78, y: 40, rotation: 0 },
    { index: 9, label: 'Outcome', description: 'Final outcome', x: 78, y: 20, rotation: 0 },
  ],
  'horseshoe': [
    { index: 0, label: 'Past', description: 'Past influences', x: 10, y: 70, rotation: 0 },
    { index: 1, label: 'Present', description: 'Current situation', x: 25, y: 40, rotation: 0 },
    { index: 2, label: 'Hidden', description: 'Hidden influences', x: 40, y: 20, rotation: 0 },
    { index: 3, label: 'Obstacle', description: 'Main obstacle', x: 55, y: 20, rotation: 0 },
    { index: 4, label: 'External', description: 'External factors', x: 70, y: 40, rotation: 0 },
    { index: 5, label: 'Advice', description: 'Suggested approach', x: 85, y: 55, rotation: 0 },
    { index: 6, label: 'Outcome', description: 'Likely outcome', x: 90, y: 75, rotation: 0 },
  ],
  'star': [
    { index: 0, label: 'Center', description: 'Core theme', x: 50, y: 50, rotation: 0 },
    { index: 1, label: 'North', description: 'Aspiration', x: 50, y: 15, rotation: 0 },
    { index: 2, label: 'East', description: 'Action', x: 82, y: 38, rotation: 0 },
    { index: 3, label: 'South-East', description: 'Resources', x: 70, y: 78, rotation: 0 },
    { index: 4, label: 'South-West', description: 'Challenge', x: 30, y: 78, rotation: 0 },
    { index: 5, label: 'West', description: 'Wisdom', x: 18, y: 38, rotation: 0 },
  ],
};

// ─── Helper Functions ───────────────────────────────

function shuffle<T>(arr: T[], seed?: number): T[] {
  const copy = [...arr];
  let s = seed ?? Math.floor(Math.random() * 100000);
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Mock Endpoints ─────────────────────────────────

export function mockGenerate(params: TarotParameters): GenerateResponse {
  const cards = MAJOR_ARCANA.map((c) => ({
    ...c,
    isReversed: params.reversalsEnabled && Math.random() > 0.5,
  }));
  const shuffled = shuffle(cards, params.seed);
  const positions = SPREADS[params.spreadType] ?? SPREADS['three-card'];
  const drawCount = Math.min(params.drawCount, positions.length, shuffled.length);

  const spread: PlacedCard[] = positions.slice(0, drawCount).map((pos, i) => ({
    card: shuffled[i],
    position: pos,
  }));

  return { deck: shuffled, spread };
}

export function mockVerify(): VerifyResponse {
  const properties = [
    { name: 'Card Uniqueness', type: 'safety' as const, formula: 'G(∀i,j: i≠j → card(i) ≠ card(j))', passed: true, details: 'All cards in spread are unique' },
    { name: 'Spread Completeness', type: 'cosafety' as const, formula: 'F(|spread| = drawCount)', passed: true, details: 'Spread contains the expected number of cards' },
    { name: 'Archetype Coverage', type: 'liveness' as const, formula: 'GF(archetype_diverse)', passed: Math.random() > 0.2, details: 'Meaningful archetype diversity across spread' },
    { name: 'Meaning Coherence', type: 'coliveness' as const, formula: 'FG(coherent(narrative, spread))', passed: Math.random() > 0.15, details: 'Narrative aligns with card meanings' },
    { name: 'Reversal Balance', type: 'safety' as const, formula: 'G(reversed_ratio ≤ 0.7)', passed: true, details: 'Reversal ratio within acceptable bounds' },
    { name: 'Positional Semantic Match', type: 'cosafety' as const, formula: 'F(∀p: semantic(card(p)) ∈ domain(p))', passed: Math.random() > 0.1, details: 'Cards semantically fit their spread positions' },
  ];

  const allPassed = properties.every((p) => p.passed);
  return {
    verification: {
      overallPassed: allPassed,
      timestamp: new Date().toISOString(),
      properties,
      executionTimeMs: Math.floor(Math.random() * 200) + 50,
    },
  };
}

export function mockNarrative(weights: MeaningWeights, spread: PlacedCard[]): ReadingResponse {
  const dominant = Object.entries(weights).sort((a, b) => b[1] - a[1])[0][0];
  const cardNames = spread.map((pc) => pc.card.name).join(', ');
  const narrative = `## Reading: ${dominant.charAt(0).toUpperCase() + dominant.slice(1)} Focus

The cards drawn — **${cardNames}** — weave a narrative of transformation and insight.

### Overview
${spread.map((pc) => `**${pc.position.label}** — *${pc.card.name}*${pc.card.isReversed ? ' (Reversed)' : ''}: ${pc.card.isReversed ? pc.card.meaningReversed : pc.card.meaningUp}`).join('\n\n')}

### Synthesis
The interplay between these archetypes suggests a period of ${dominant === 'psychological' ? 'deep self-reflection and inner growth' : dominant === 'spiritual' ? 'spiritual awakening and transcendence' : dominant === 'practical' ? 'concrete action and material progress' : dominant === 'creative' ? 'creative expression and innovation' : 'relationship deepening and connection'}.

The formal verification confirms the structural integrity of this reading, ensuring archetypal diversity and semantic coherence across all positions.

*— Generated by the Meta-Tarological Positivist System (MTPS)*`;

  return { narrative };
}

export function mockArchetypes(): ArchetypesResponse {
  return {
    archetypes: [
      {
        family: 'Jungian',
        name: 'Jungian Archetypes',
        description: 'Based on Carl Jung\'s archetypal theory of the collective unconscious',
        majorArcana: MAJOR_ARCANA.map((c) => ({ number: c.number, archetype: c.archetype })),
      },
      {
        family: 'Mythological',
        name: 'World Mythology',
        description: 'Archetypes drawn from cross-cultural mythological figures',
        majorArcana: [
          { number: 0, archetype: 'Hermes/Trickster' },
          { number: 1, archetype: 'Thoth/Mercury' },
          { number: 2, archetype: 'Isis/Artemis' },
          { number: 3, archetype: 'Demeter/Gaia' },
          { number: 4, archetype: 'Zeus/Jupiter' },
        ],
      },
      {
        family: 'Alchemical',
        name: 'Alchemical Stages',
        description: 'Mapped to the stages of the alchemical Great Work (Opus Magnum)',
        majorArcana: [
          { number: 0, archetype: 'Prima Materia' },
          { number: 1, archetype: 'Mercurius' },
          { number: 2, archetype: 'Luna' },
          { number: 3, archetype: 'Venus' },
          { number: 4, archetype: 'Sol Rex' },
        ],
      },
    ],
  };
}
