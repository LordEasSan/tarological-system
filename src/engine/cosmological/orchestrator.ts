/**
 * Cosmological Engine — Orchestrator
 *
 * Coordinates the full cosmological query pipeline:
 *   1. Question Parsing → Qᵤ = (Cᵤ, Φᵤ, Δᵤ)
 *   2. Spread Generation (reuses existing mock/api layer)
 *   3. Archetypal Configuration Mapping → ΨQᵤ
 *   4. LTL Verification (structural integrity)
 *   5. Response Generation → Cosmological Interpretation
 *
 * This module provides the single entry-point for UI consumption.
 */
import type {
  TarotParameters,
  PlacedCard,
  CosmologicalResponse,
} from '../../types';
import { parseCosmologicalQuestion } from './question-parser';
import { computeArchetypalConfiguration } from './configuration';
import { generateCosmologicalInterpretation } from './response-generator';
import { verifyReading } from '../ltl';
import { IterationRunner } from '../iteration';

/**
 * Execute a complete cosmological query against a spread.
 *
 * @param question — The free-form universal/metaphysical question
 * @param params — Tarot parameters (reused from configuration)
 * @param generateFn — Spread generation function (from mock/api)
 * @param existingSpread — Optional pre-existing spread to interpret
 */
export function executeCosmologicalQuery(
  question: string,
  params: TarotParameters,
  generateFn: (p: TarotParameters) => PlacedCard[],
  existingSpread?: PlacedCard[],
): CosmologicalResponse {
  // 1. Parse the question into Qᵤ = (Cᵤ, Φᵤ, Δᵤ)
  const query = parseCosmologicalQuestion(question);

  // 2. Generate or reuse spread
  let spread: PlacedCard[];
  if (existingSpread && existingSpread.length > 0) {
    spread = existingSpread;
  } else {
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

  // 3. Compute Archetypal Configuration ΨQᵤ
  const configuration = computeArchetypalConfiguration(spread, query, params);

  // 4. Run LTL verification
  const verification = verifyReading(spread, params);

  // 5. Generate cosmological interpretation
  const interpretation = generateCosmologicalInterpretation(query, configuration, spread);

  return {
    query,
    configuration,
    spread,
    verification,
    interpretation,
    timestamp: new Date().toISOString(),
  };
}
