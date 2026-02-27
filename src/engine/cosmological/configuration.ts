/**
 * Cosmological Engine — Archetypal Configuration Mapping ΨQᵤ
 *
 * Instead of trajectory pruning (ΠQ from philosophical mode),
 * this module computes:
 *
 *   ΨQᵤ = Archetypal Configuration Mapping
 *
 * Which:
 *   1. Selects dominant archetypal forces
 *   2. Identifies generative polarity sequences
 *   3. Computes archetypal emergence order
 *   4. Evaluates entropy at system-level (not personal)
 *
 * Cards are interpreted as archetypal forces, not personal events.
 */
import type {
  CosmologicalQuery,
  PlacedCard,
  ArchetypalForce,
  ArchetypalConfiguration,
  PolaritySequence,
  TarotParameters,
} from '../../types';
import { computeCardMeaning } from '../meaning';

// ─── Force Role Classification ──────────────────────

const GENERATIVE_ARCHETYPES = [
  'Fool', 'Magician', 'Empress', 'Star', 'Sun', 'World',
  'Creator', 'Mother', 'Child', 'Anima',
];

const STRUCTURING_ARCHETYPES = [
  'Emperor', 'Hierophant', 'Justice', 'Hermit', 'Wheel',
  'Father', 'Sage', 'Guide', 'Ruler',
];

const DISSOLVING_ARCHETYPES = [
  'Death', 'Tower', 'Devil', 'Moon',
  'Shadow', 'Destroyer', 'Trickster',
];

const SYNTHESISING_ARCHETYPES = [
  'Temperance', 'Judgement', 'Lovers', 'Strength',
  'Self', 'Mandala', 'Healer', 'Individuation',
];

function classifyRole(
  card: PlacedCard,
): 'generative' | 'structuring' | 'dissolving' | 'synthesising' {
  const archetype = card.card.archetype;
  const name = card.card.name;

  for (const g of GENERATIVE_ARCHETYPES) {
    if (archetype.includes(g) || name.includes(g)) return 'generative';
  }
  for (const s of STRUCTURING_ARCHETYPES) {
    if (archetype.includes(s) || name.includes(s)) return 'structuring';
  }
  for (const d of DISSOLVING_ARCHETYPES) {
    if (archetype.includes(d) || name.includes(d)) return 'dissolving';
  }
  for (const sy of SYNTHESISING_ARCHETYPES) {
    if (archetype.includes(sy) || name.includes(sy)) return 'synthesising';
  }

  // Default by card properties
  if (card.card.isReversed) return 'dissolving';
  if (card.card.isMajor) return 'structuring';
  return 'generative';
}

// ─── Archetypal Force Computation ───────────────────

function computeArchetypalForces(
  spread: PlacedCard[],
  query: CosmologicalQuery,
): ArchetypalForce[] {
  const forces: ArchetypalForce[] = [];

  for (const placed of spread) {
    const { card } = placed;
    const affinity = query.embedding.archetypeAffinities[card.id] ?? 0;
    const meaningScore = computeCardMeaning(card, query.embedding.dimensionWeights);
    const role = classifyRole(placed);

    // Weight = affinity * meaning * openness factor + major arcana bonus
    const weight = Math.min(1,
      affinity * 0.3 +
      meaningScore.composite * 0.35 +
      query.configurationOpenness * 0.1 +
      (card.isMajor ? 0.25 : 0.05),
    );

    forces.push({
      archetype: card.archetype,
      cardName: card.name,
      cardId: card.id,
      weight,
      role,
      keywords: card.keywords,
    });
  }

  forces.sort((a, b) => b.weight - a.weight);
  return forces;
}

// ─── Emergence Order ────────────────────────────────

/**
 * Compute the archetypal emergence order:
 * Generative → Structuring → Dissolving → Synthesising
 * Each role contributes its dominant archetype in sequence.
 */
function computeEmergenceOrder(forces: ArchetypalForce[]): string[] {
  const roleOrder: ArchetypalForce['role'][] = [
    'generative', 'structuring', 'dissolving', 'synthesising',
  ];
  const emergence: string[] = [];

  for (const role of roleOrder) {
    const roleForces = forces.filter(f => f.role === role);
    if (roleForces.length > 0) {
      emergence.push(roleForces[0].archetype);
    }
  }

  // If any roles are empty, fill with top overall forces
  if (emergence.length < 2) {
    for (const f of forces) {
      if (!emergence.includes(f.archetype)) {
        emergence.push(f.archetype);
      }
      if (emergence.length >= 4) break;
    }
  }

  return emergence;
}

// ─── Polarity Sequences ─────────────────────────────

/**
 * Identify generative polarity sequences:
 * Each sequence is (positive, negative, synthesis)
 */
function computePolaritySequences(forces: ArchetypalForce[]): PolaritySequence[] {
  const generative = forces.filter(f => f.role === 'generative');
  const dissolving = forces.filter(f => f.role === 'dissolving');
  const synthesising = forces.filter(f => f.role === 'synthesising');
  const structuring = forces.filter(f => f.role === 'structuring');

  const sequences: PolaritySequence[] = [];

  // Pair generative ↔ dissolving → synthesising
  const pairCount = Math.min(
    Math.max(generative.length, structuring.length),
    Math.max(dissolving.length, 1),
    3,
  );

  for (let i = 0; i < pairCount; i++) {
    const positive = generative[i] ?? structuring[i] ?? forces[i];
    const negative = dissolving[i] ?? forces[forces.length - 1 - i];
    const synthesis = synthesising[i] ?? structuring[i] ?? forces[Math.floor(forces.length / 2)];

    if (positive && negative && synthesis) {
      sequences.push({
        positive: positive.archetype,
        negative: negative.archetype,
        synthesis: synthesis.archetype,
      });
    }
  }

  // Guarantee at least one
  if (sequences.length === 0 && forces.length >= 2) {
    sequences.push({
      positive: forces[0].archetype,
      negative: forces[forces.length - 1].archetype,
      synthesis: forces[Math.floor(forces.length / 2)].archetype,
    });
  }

  return sequences;
}

// ─── Configuration Summary ──────────────────────────

function generateConfigurationSummary(
  forces: ArchetypalForce[],
  emergenceOrder: string[],
  systemEntropy: number,
  query: CosmologicalQuery,
): string {
  const topForces = forces.slice(0, 3);
  const forceNames = topForces.map(f => f.archetype).join(', ');
  const entropyLabel = systemEntropy > 0.7 ? 'high' : systemEntropy > 0.4 ? 'moderate' : 'low';
  const typeLabel = query.questionType.replace(/-/g, ' ');

  const roleDistribution = {
    generative: forces.filter(f => f.role === 'generative').length,
    structuring: forces.filter(f => f.role === 'structuring').length,
    dissolving: forces.filter(f => f.role === 'dissolving').length,
    synthesising: forces.filter(f => f.role === 'synthesising').length,
  };

  return [
    `Archetypal Configuration ΨQᵤ computed for ${typeLabel} inquiry.`,
    `Dominant forces: ${forceNames}.`,
    `Emergence order: ${emergenceOrder.join(' → ')}.`,
    `System entropy: ${entropyLabel} (${(systemEntropy * 100).toFixed(1)}%).`,
    `Role distribution: ${roleDistribution.generative} generative, ` +
      `${roleDistribution.structuring} structuring, ` +
      `${roleDistribution.dissolving} dissolving, ` +
      `${roleDistribution.synthesising} synthesising.`,
  ].join(' ');
}

// ─── Public API ─────────────────────────────────────

/**
 * Compute the Archetypal Configuration Mapping ΨQᵤ for a cosmological query.
 *
 * This maps the spread into a symbolic model of archetypal forces,
 * emergence sequences, and polarity dynamics — NOT personal trajectories.
 */
export function computeArchetypalConfiguration(
  spread: PlacedCard[],
  query: CosmologicalQuery,
  _params: TarotParameters,
): ArchetypalConfiguration {
  const forces = computeArchetypalForces(spread, query);
  const emergenceOrder = computeEmergenceOrder(forces);
  const polaritySequences = computePolaritySequences(forces);

  // Compute system-level entropy
  const weightValues = forces.map(f => f.weight);
  const weightSum = weightValues.reduce((a, b) => a + b, 0);
  const normalised = weightValues.map(v => v / (weightSum || 1));
  const shannonEntropy = -normalised.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum + p * Math.log2(p);
  }, 0);
  const maxEntropy = Math.log2(forces.length || 1);
  const systemEntropy = maxEntropy > 0 ? shannonEntropy / maxEntropy : 0.5;

  const configurationSummary = generateConfigurationSummary(
    forces, emergenceOrder, systemEntropy, query,
  );

  return {
    forces,
    emergenceOrder,
    polaritySequences,
    systemEntropy,
    configurationSummary,
  };
}
