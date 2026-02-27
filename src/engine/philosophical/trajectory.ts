/**
 * Philosophical Engine — Trajectory Interpretation Layer
 *
 * Instead of predicting future events, this module:
 * 1. Computes trajectory-space restriction ΠQ
 * 2. Evaluates which archetypal attractors become dominant
 * 3. Preserves liveness constraint □♢(st ∈ L)
 * 4. Checks coliveness for destructive loop detection
 *
 * Reuses the existing archetypal embedding space and LTL verification engine.
 */
import type {
  PhilosophicalQuery,
  PlacedCard,
  AttractorBasin,
  TrajectoryRestriction,
  TarotParameters,
} from '../../types';
import { verifyReading } from '../ltl';
import { computeCardMeaning } from '../meaning';

/**
 * Determine attractor polarity based on card properties
 */
function determinePolarity(
  card: PlacedCard,
  dominance: number,
): 'constructive' | 'destructive' | 'liminal' {
  const destructiveArchetypes = [
    'Shadow', 'Destroyer', 'Devil', 'Shadow Self', 'Trickster',
  ];
  const constructiveArchetypes = [
    'Hero', 'Healer', 'Guide', 'Self', 'Spirit', 'Child', 'Sage',
  ];

  const archetype = card.card.archetype;

  if (card.card.isReversed) {
    // Reversed cards tend toward liminal or destructive
    if (dominance > 0.6) return 'destructive';
    return 'liminal';
  }

  for (const d of destructiveArchetypes) {
    if (archetype.includes(d)) return dominance > 0.5 ? 'destructive' : 'liminal';
  }
  for (const c of constructiveArchetypes) {
    if (archetype.includes(c)) return 'constructive';
  }

  return dominance > 0.7 ? 'constructive' : 'liminal';
}

/**
 * Compute archetypal attractor basins from the spread,
 * filtered and weighted by the philosophical query embedding.
 */
function computeAttractorBasins(
  spread: PlacedCard[],
  query: PhilosophicalQuery,
  weights: PhilosophicalQuery['embedding']['dimensionWeights'],
): AttractorBasin[] {
  const attractors: AttractorBasin[] = [];

  for (const placed of spread) {
    const { card } = placed;
    const affinity = query.embedding.archetypeAffinities[card.id] ?? 0;

    // Compute meaning score using existing engine
    const meaningScore = computeCardMeaning(card, weights);

    // Dominance = affinity * composite meaning * trajectory pruning bias
    const dominance = Math.min(1,
      affinity * 0.3 +
      meaningScore.composite * 0.4 +
      (1 - query.trajectoryPruning) * 0.1 +
      (card.isMajor ? 0.2 : 0.05),
    );

    const polarity = determinePolarity(placed, dominance);

    attractors.push({
      archetype: card.archetype,
      cardName: card.name,
      cardId: card.id,
      dominance,
      keywords: card.keywords,
      polarity,
    });
  }

  // Sort by dominance descending
  attractors.sort((a, b) => b.dominance - a.dominance);

  return attractors;
}

/**
 * Check the liveness constraint: □♢(st ∈ L)
 * Ensures no output violates the liveness property —
 * there must always be the possibility of reaching a live state.
 */
function checkLiveness(attractors: AttractorBasin[]): boolean {
  // Liveness holds if at least one constructive or liminal attractor
  // has non-negligible dominance
  const liveAttractors = attractors.filter(
    a => a.polarity !== 'destructive' && a.dominance > 0.15,
  );
  return liveAttractors.length > 0;
}

/**
 * Check coliveness: FG(¬destructive_loop)
 * Ensures no closed destructive loops dominate the trajectory space.
 */
function checkColiveness(attractors: AttractorBasin[]): {
  passed: boolean;
  details: string;
} {
  const destructive = attractors.filter(a => a.polarity === 'destructive');
  const totalDominance = attractors.reduce((s, a) => s + a.dominance, 0);
  const destructiveDominance = destructive.reduce((s, a) => s + a.dominance, 0);

  if (totalDominance === 0) {
    return { passed: true, details: 'No attractor basins detected — trajectory space is empty' };
  }

  const destructiveRatio = destructiveDominance / totalDominance;

  if (destructiveRatio > 0.7) {
    return {
      passed: false,
      details: `Destructive attractors dominate at ${(destructiveRatio * 100).toFixed(0)}% — ` +
        `coliveness at risk. Destructive loop archetypes: ${destructive.map(d => d.archetype).join(', ')}`,
    };
  }

  if (destructiveRatio > 0.4) {
    return {
      passed: true,
      details: `Moderate destructive presence at ${(destructiveRatio * 100).toFixed(0)}% — ` +
        `coliveness maintained, but vigilance advised. ` +
        `Active destructive channels: ${destructive.map(d => d.archetype).join(', ')}`,
    };
  }

  return {
    passed: true,
    details: `Healthy trajectory space — destructive presence at ${(destructiveRatio * 100).toFixed(0)}%. ` +
      `Coliveness constraint fully satisfied.`,
  };
}

/**
 * Generate a structural summary of the trajectory restriction
 */
function generateStructuralSummary(
  attractors: AttractorBasin[],
  entropy: number,
  livenessHolds: boolean,
  query: PhilosophicalQuery,
): string {
  const topAttractors = attractors.slice(0, 3);
  const attractorNames = topAttractors.map(a => a.archetype).join(', ');

  const entropyLabel = entropy > 0.7 ? 'high' : entropy > 0.4 ? 'moderate' : 'low';
  const questionLabel = query.questionType.replace(/-/g, ' ');

  const lines: string[] = [
    `Trajectory-space restriction ΠQ applied for ${questionLabel} query.`,
    `Dominant attractor basins: ${attractorNames}.`,
    `Entropy level: ${entropyLabel} (${(entropy * 100).toFixed(1)}%).`,
  ];

  if (!livenessHolds) {
    lines.push('⚠ Liveness constraint violated — all constructive pathways suppressed.');
    lines.push('Interpretation must be treated as structurally incomplete.');
  } else {
    lines.push('Liveness constraint □♢(st ∈ L) satisfied — open trajectories remain accessible.');
  }

  return lines.join(' ');
}

// ─── Public API ─────────────────────────────────────

/**
 * Compute trajectory-space restriction for a philosophical query
 * given a spread of cards and the parsed query.
 *
 * This is the core of the trajectory interpretation layer:
 * it transforms the spread into an analysis of attractor basins
 * rather than a predictive reading.
 */
export function computeTrajectoryRestriction(
  spread: PlacedCard[],
  query: PhilosophicalQuery,
  params: TarotParameters,
): TrajectoryRestriction {
  // Compute attractor basins using query embedding
  const attractors = computeAttractorBasins(
    spread,
    query,
    query.embedding.dimensionWeights,
  );

  // Compute restricted entropy
  const dominanceValues = attractors.map(a => a.dominance);
  const domSum = dominanceValues.reduce((a, b) => a + b, 0);
  const normalised = dominanceValues.map(v => v / (domSum || 1));
  const shannonEntropy = -normalised.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum + p * Math.log2(p);
  }, 0);
  const maxEntropy = Math.log2(attractors.length || 1);
  const entropy = maxEntropy > 0 ? shannonEntropy / maxEntropy : 0.5;

  // Check liveness and coliveness
  const livenessHolds = checkLiveness(attractors);
  const colivenessCheck = checkColiveness(attractors);

  // Run LTL verification on the spread for structural integrity
  verifyReading(spread, params);

  // Generate structural summary
  const structuralSummary = generateStructuralSummary(
    attractors,
    entropy,
    livenessHolds,
    query,
  );

  return {
    attractors,
    entropy,
    livenessHolds,
    colivenessCheck,
    structuralSummary,
  };
}
