/**
 * Philosophical Engine — Orchestrator
 *
 * Coordinates the full philosophical query pipeline:
 *   1. Question Parsing → Q = (C, ΦQ, Δ)
 *   2. Spread Generation (reuses existing mock/api layer)
 *   3. Trajectory Interpretation → ΠQ
 *   4. Meaning Integration → Meaning(e)
 *   5. Response Generation → Philosophical Interpretation
 *
 * This module provides the single entry-point for UI consumption.
 */
import type {
  TarotParameters,
  PlacedCard,
  PhilosophicalResponse,
} from '../../types';
import { parseQuestion } from './question-parser';
import { computeTrajectoryRestriction } from './trajectory';
import { computeMeaningIntegration } from './meaning-integration';
import { generatePhilosophicalInterpretation } from './response-generator';
import { verifyReading } from '../ltl';
import { IterationRunner } from '../iteration';

/**
 * Execute a complete philosophical query against a spread.
 *
 * If no spread is provided, one will be generated using the adaptive
 * iteration engine (same as divinatory mode).
 *
 * @param question — The free-form philosophical question
 * @param params — Tarot parameters (reused from configuration)
 * @param generateFn — Spread generation function (from mock/api)
 * @param existingSpread — Optional pre-existing spread to interpret
 */
export function executePhilosophicalQuery(
  question: string,
  params: TarotParameters,
  generateFn: (p: TarotParameters) => PlacedCard[],
  existingSpread?: PlacedCard[],
): PhilosophicalResponse {
  // 1. Parse the question into Q = (C, ΦQ, Δ)
  const query = parseQuestion(question);

  // 2. Generate or reuse spread
  let spread: PlacedCard[];
  if (existingSpread && existingSpread.length > 0) {
    spread = existingSpread;
  } else {
    // Use the adaptive iteration engine for quality generation
    const runner = new IterationRunner({
      qTarget: 0.55,
      maxIterations: 6,
      minIterations: 2,
      deltaThreshold: 0.02,
      consecutiveStops: 2,
    });
    const { bestSpread } = runner.run(generateFn, params);
    spread = bestSpread;
  }

  // 3. Compute trajectory-space restriction ΠQ
  const trajectory = computeTrajectoryRestriction(spread, query, params);

  // 4. Compute meaning integration
  const meaning = computeMeaningIntegration(spread, query, trajectory, params);

  // 5. Run LTL verification
  const verification = verifyReading(spread, params);

  // 6. Generate philosophical interpretation
  const interpretation = generatePhilosophicalInterpretation(
    query, trajectory, meaning, spread,
  );

  return {
    query,
    trajectory,
    meaning,
    spread,
    verification,
    interpretation,
    timestamp: new Date().toISOString(),
  };
}
