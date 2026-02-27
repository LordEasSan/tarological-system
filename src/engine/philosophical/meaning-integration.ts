/**
 * Philosophical Engine — Meaning Integration Module
 *
 * For event-related questions, computes:
 *
 *   Meaning(e) := ∃ τ' satisfying
 *     - φ_hero (heroic trajectory pattern)
 *     - cosafety
 *     - liveness
 *
 * If no integration found, returns structured interpretation:
 * "Event currently resides in high-entropy liminal zone."
 *
 * Reuses the existing Msig meaning function and LTL verification engine.
 */
import type {
  PhilosophicalQuery,
  PlacedCard,
  MeaningIntegration,
  TrajectoryRestriction,
  TarotParameters,
} from '../../types';
import { analyzeSpreadMeaning } from '../meaning';
import { verifyReading } from '../ltl';

/**
 * Hero archetypes — cards whose presence suggests a heroic trajectory pattern
 */
const HERO_ARCHETYPES = [
  'The Hero', 'The Warrior', 'The Self', 'The Individuation',
  'The Resurrection', 'The Persona', 'The Healer', 'The Guide',
  'Hero', 'Warrior', 'Self', 'Individuation',
];

/**
 * Transformation archetypes — cards suggesting meaningful transition
 */
const TRANSFORMATION_ARCHETYPES = [
  'The Shadow', 'The Transformer', 'The Destroyer', 'The Mandala',
  'Shadow', 'Transformer', 'Destroyer', 'Mandala',
  'Death', 'The Tower',
];

/**
 * Check if the spread contains a heroic trajectory pattern (φ_hero)
 * A heroic pattern requires presence of:
 *   - At least one hero/self archetype
 *   - Evidence of challenge or transformation
 *   - A constructive resolution direction
 */
function checkHeroPattern(
  spread: PlacedCard[],
  attractors: TrajectoryRestriction['attractors'],
): { satisfied: boolean; trajectory?: string } {
  const hasHero = spread.some(p =>
    HERO_ARCHETYPES.some(h => p.card.archetype.includes(h)),
  );
  const hasTransformation = spread.some(p =>
    TRANSFORMATION_ARCHETYPES.some(t => p.card.archetype.includes(t) || p.card.name.includes(t)),
  );

  const constructiveAttractors = attractors.filter(a => a.polarity === 'constructive');

  if (hasHero && constructiveAttractors.length > 0) {
    const heroCard = spread.find(p =>
      HERO_ARCHETYPES.some(h => p.card.archetype.includes(h)),
    )!;
    const parts = [heroCard.card.archetype];
    if (hasTransformation) {
      const transformCard = spread.find(p =>
        TRANSFORMATION_ARCHETYPES.some(t => p.card.archetype.includes(t) || p.card.name.includes(t)),
      );
      if (transformCard) parts.push(transformCard.card.archetype);
    }
    parts.push(constructiveAttractors[0].archetype);

    return {
      satisfied: true,
      trajectory: `${parts.join(' → ')} (heroic integration trajectory)`,
    };
  }

  if (hasHero || constructiveAttractors.length >= 2) {
    return {
      satisfied: true,
      trajectory: `Emergent heroic pattern via ${constructiveAttractors.map(a => a.archetype).join(', ')}`,
    };
  }

  return { satisfied: false };
}

/**
 * Check cosafety property: F(meaningful_state)
 * At some finite point, a meaningful interpretation can be reached.
 */
function checkCosafety(
  spread: PlacedCard[],
  params: TarotParameters,
): boolean {
  const verification = verifyReading(spread, params);
  const cosafety = verification.properties.filter(p => p.type === 'cosafety');
  return cosafety.length > 0 && cosafety.some(p => p.passed);
}

/**
 * Check liveness property from trajectory restriction
 */
function checkLiveness(trajectory: TrajectoryRestriction): boolean {
  return trajectory.livenessHolds;
}

/**
 * Determine liminal zone explanation when integration fails
 */
function getLiminalExplanation(
  query: PhilosophicalQuery,
  trajectory: TrajectoryRestriction,
  spread: PlacedCard[],
): string {
  const entropy = trajectory.entropy;
  const entropyLabel = entropy > 0.7 ? 'high' : entropy > 0.4 ? 'moderate' : 'low';

  const liminalCards = spread.filter(p => {
    const attractor = trajectory.attractors.find(a => a.cardId === p.card.id);
    return attractor?.polarity === 'liminal';
  });

  const typeLabels: Record<string, string> = {
    'ontological': 'The ontological question',
    'teleological': 'The teleological inquiry',
    'identity': 'The identity question',
    'meaning-of-event': 'The event',
    'counterfactual-existential': 'The counterfactual scenario',
  };

  const label = typeLabels[query.questionType] ?? 'The query';

  const lines: string[] = [
    `${label} currently resides in a ${entropyLabel}-entropy liminal zone.`,
  ];

  if (liminalCards.length > 0) {
    lines.push(
      `The liminal channels are held by: ${liminalCards.map(c => c.card.name).join(', ')}.`,
    );
  }

  lines.push(
    'No complete heroic integration trajectory was found — this does not indicate ' +
    'impossibility, but rather that the structural pattern is still forming.',
  );

  if (!trajectory.livenessHolds) {
    lines.push(
      '⚠ Liveness constraint is not satisfied — the trajectory space may need ' +
      'external intervention or reframing of the question.',
    );
  }

  lines.push(
    'The question may benefit from further decomposition or a shift in temporal framing.',
  );

  return lines.join(' ');
}

// ─── Public API ─────────────────────────────────────

/**
 * Compute meaning integration for a philosophical query.
 *
 * Attempts to find τ' satisfying:
 *   - φ_hero (heroic trajectory pattern)
 *   - cosafety
 *   - liveness
 *
 * Returns structured result with either an integration or liminal explanation.
 */
export function computeMeaningIntegration(
  spread: PlacedCard[],
  query: PhilosophicalQuery,
  trajectory: TrajectoryRestriction,
  params: TarotParameters,
): MeaningIntegration {
  // Use existing meaning function Msig
  const meaningAnalysis = analyzeSpreadMeaning(spread, query.embedding.dimensionWeights);

  // Check the three required properties
  const heroCheck = checkHeroPattern(spread, trajectory.attractors);
  const cosafetyHolds = checkCosafety(spread, params);
  const livenessHolds = checkLiveness(trajectory);

  const propertiesSatisfied = {
    heroPattern: heroCheck.satisfied,
    cosafety: cosafetyHolds,
    liveness: livenessHolds,
  };

  // If all properties satisfied → integration found
  const allSatisfied = heroCheck.satisfied && cosafetyHolds && livenessHolds;

  // Compute entropy from mean meaning composite
  const entropyLevel = 1 - meaningAnalysis.overallComposite;

  if (allSatisfied) {
    return {
      integrated: true,
      heroTrajectory: heroCheck.trajectory,
      propertiesSatisfied,
      entropyLevel,
    };
  }

  // Not all properties satisfied → liminal zone
  return {
    integrated: false,
    propertiesSatisfied,
    liminalExplanation: getLiminalExplanation(query, trajectory, spread),
    entropyLevel,
  };
}
