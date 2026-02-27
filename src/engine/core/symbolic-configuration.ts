/**
 * Core — Symbolic Configuration S
 *
 * Computes: SymbolicConfiguration S = f(cards, interactionMatrix)
 *
 * S is the PRIMARY interpretive input for all modes.
 * The question's bias vector adjusts emphasis within S,
 * but S is fundamentally derived from the card configuration.
 *
 * Components:
 *   - Dominant archetypes with symbolic roles (anchor/catalyst/shadow/bridge)
 *   - Tension pairs (opposing forces identified from M)
 *   - Entropic clusters (thematic groupings)
 *   - Sequential symbolic movement
 *   - Overall entropy
 */
import type {
  PlacedCard,
  InterpretiveBiasVector,
  CardInteractionMatrix,
  SymbolicConfiguration,
  DominantArchetype,
  SymbolicRole,
  TensionPair,
  EntropicCluster,
  TarotParameters,
} from '../../types';
import { computeCardMeaning } from '../meaning';

// ─── Role Classification ────────────────────────────

const SHADOW_ARCHETYPES = [
  'Shadow', 'Devil', 'Destroyer', 'Trickster', 'Tower',
  'Shadow Self', 'Dark', 'Death',
];

const CATALYST_ARCHETYPES = [
  'Wheel', 'Chariot', 'Star', 'Magician', 'Fool',
  'Lightning', 'Fortune', 'Change',
];

const BRIDGE_ARCHETYPES = [
  'Temperance', 'Lovers', 'World', 'Judgement',
  'Balance', 'Integration', 'Harmony', 'Mandala',
];

function classifyRole(
  card: PlacedCard,
  score: number,
  rank: number,
  allScores: number[],
): SymbolicRole {
  const { card: c } = card;

  // Shadow: reversed cards or shadow archetypes
  if (c.isReversed) return 'shadow';
  for (const sa of SHADOW_ARCHETYPES) {
    if (c.archetype.includes(sa) || c.name.includes(sa)) return 'shadow';
  }

  // Anchor: highest-scoring card
  if (rank === 0) return 'anchor';

  // Catalyst: archetype match or second-highest Major
  for (const ca of CATALYST_ARCHETYPES) {
    if (c.archetype.includes(ca) || c.name.includes(ca)) return 'catalyst';
  }
  if (rank === 1 && c.isMajor) return 'catalyst';

  // Bridge: connecting archetypes or mid-ranked cards
  for (const ba of BRIDGE_ARCHETYPES) {
    if (c.archetype.includes(ba) || c.name.includes(ba)) return 'bridge';
  }

  // Default: bridge for middle positions, catalyst for others
  const median = allScores.length > 0
    ? allScores[Math.floor(allScores.length / 2)]
    : 0;
  if (Math.abs(score - median) < 0.1) return 'bridge';

  return 'catalyst';
}

// ─── Scoring ────────────────────────────────────────

function computeCardScore(
  card: PlacedCard,
  biasVector: InterpretiveBiasVector,
  params: TarotParameters,
): number {
  // Base score from meaning function
  const meaningScore = computeCardMeaning(card.card, params.meaningWeights);
  let score = meaningScore.composite;

  // Bias vector weighting — adjusts emphasis but doesn't determine rank
  const affinity = biasVector.archetypeBias[card.card.id] ?? 0;
  score = score * 0.7 + affinity * 0.15 + (card.card.isMajor ? 0.15 : 0.05);

  return Math.min(1, score);
}

// ─── Tension Pair Extraction ────────────────────────

function extractTensionPairs(
  spread: PlacedCard[],
  matrix: CardInteractionMatrix,
): TensionPair[] {
  // Find interactions with highest positive tension (opposing forces)
  const tensionInteractions = [...matrix.interactions]
    .filter(i => i.polarityTension > 0.1)
    .sort((a, b) => b.polarityTension - a.polarityTension);

  const pairs: TensionPair[] = [];
  const usedIndices = new Set<number>();

  for (const interaction of tensionInteractions) {
    if (usedIndices.has(interaction.cardAIndex) || usedIndices.has(interaction.cardBIndex)) {
      continue;
    }

    const cardA = spread[interaction.cardAIndex];
    const cardB = spread[interaction.cardBIndex];

    // Determine which is "positive" and which is "negative"
    const aIsNegative = cardA.card.isReversed ||
      SHADOW_ARCHETYPES.some(s => cardA.card.archetype.includes(s));

    const positive = aIsNegative ? cardB : cardA;
    const negative = aIsNegative ? cardA : cardB;

    pairs.push({
      positive: { archetype: positive.card.archetype, cardName: positive.card.name },
      negative: { archetype: negative.card.archetype, cardName: negative.card.name },
      tensionScore: interaction.polarityTension,
    });

    usedIndices.add(interaction.cardAIndex);
    usedIndices.add(interaction.cardBIndex);

    if (pairs.length >= 3) break;
  }

  return pairs;
}

// ─── Entropic Cluster Enrichment ────────────────────

function enrichEntropicClusters(
  matrixClusters: CardInteractionMatrix['entropicClusters'],
  spread: PlacedCard[],
): EntropicCluster[] {
  return matrixClusters.map(cluster => {
    // Compute cluster entropy from card score distribution
    const clusterCards = spread.filter(p => cluster.cardNames.includes(p.card.name));
    const keywords = clusterCards.flatMap(p => p.card.keywords);
    const uniqueKw = new Set(keywords);
    const entropy = uniqueKw.size > 0
      ? Math.min(1, uniqueKw.size / (keywords.length || 1))
      : 0.5;

    return {
      theme: cluster.theme,
      cards: cluster.cardNames,
      entropy,
    };
  });
}

// ─── Symbolic Movement ──────────────────────────────

function computeSymbolicMovement(spread: PlacedCard[]): string[] {
  // Sequential archetype names in spread position order
  return spread
    .sort((a, b) => a.position.index - b.position.index)
    .map(p => `${p.card.archetype} (${p.position.label})`);
}

// ─── Public API ─────────────────────────────────────

/**
 * Compute the Symbolic Configuration S from cards and interaction matrix.
 *
 * S is the primary epistemic source for all interpretive modes.
 * The bias vector adjusts emphasis weights but does not determine
 * the configuration itself.
 */
export function computeSymbolicConfiguration(
  spread: PlacedCard[],
  matrix: CardInteractionMatrix,
  biasVector: InterpretiveBiasVector,
  params: TarotParameters,
): SymbolicConfiguration {
  // Score each card
  const scored = spread.map((card, _idx) => ({
    card,
    score: computeCardScore(card, biasVector, params),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  const allScores = scored.map(s => s.score);

  // Classify roles
  const dominantArchetypes: DominantArchetype[] = scored.map((entry, rank) => ({
    archetype: entry.card.card.archetype,
    cardName: entry.card.card.name,
    cardId: entry.card.card.id,
    score: entry.score,
    role: classifyRole(entry.card, entry.score, rank, allScores),
  }));

  // Extract tension pairs from interaction matrix
  const tensionPairs = extractTensionPairs(spread, matrix);

  // Enrich entropic clusters
  const entropicClusters = enrichEntropicClusters(matrix.entropicClusters, spread);

  // Symbolic movement through spread positions
  const symbolicMovement = computeSymbolicMovement(spread);

  // Overall entropy from dominant archetype score distribution
  const scoreSum = allScores.reduce((a, b) => a + b, 0);
  const normalised = allScores.map(v => v / (scoreSum || 1));
  const shannonEntropy = -normalised.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum + p * Math.log2(p);
  }, 0);
  const maxEntropy = Math.log2(allScores.length || 1);
  const entropy = maxEntropy > 0 ? shannonEntropy / maxEntropy : 0.5;

  return {
    dominantArchetypes,
    tensionPairs,
    entropicClusters,
    symbolicMovement,
    entropy,
    interactionMatrix: matrix,
  };
}
