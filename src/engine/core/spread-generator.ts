/**
 * Core — Spread Generator
 *
 * Clean wrapper around the adaptive IterationRunner.
 * Spread generation is MODE-INDEPENDENT — the same quality pipeline
 * runs regardless of interrogation mode. The question does NOT influence
 * card selection.
 */
import type { PlacedCard, TarotParameters } from '../../types';
import { IterationRunner } from '../iteration';
import { computeQualityScore } from '../scoring';

export interface SpreadResult {
  spread: PlacedCard[];
  qualityScore: number;
}

/**
 * Generate a high-quality spread using the adaptive iteration engine.
 * This is always step 1 — before any question analysis.
 */
export function generateSpread(
  params: TarotParameters,
  generateFn: (p: TarotParameters) => PlacedCard[],
): SpreadResult {
  const runner = new IterationRunner({
    qTarget: 0.55,
    maxIterations: 6,
    minIterations: 2,
    deltaThreshold: 0.02,
    consecutiveStops: 2,
  });

  const { bestSpread } = runner.run(generateFn, params);
  const quality = computeQualityScore(bestSpread, params);

  return {
    spread: bestSpread,
    qualityScore: quality.composite,
  };
}
