/**
 * Engine — Meaning Function Module
 *
 * Implements the parameterised meaning function μ(c, θ) that maps cards
 * to semantic interpretations weighted by the 5 meaning dimensions.
 */
import type { TarotCard, MeaningWeights, PlacedCard } from '../types';

/** Computed meaning score for a single card */
export interface CardMeaningScore {
  cardId: string;
  cardName: string;
  dimensionScores: Record<keyof MeaningWeights, number>;
  composite: number;
  dominantDimension: keyof MeaningWeights;
}

/** Spread-level meaning analysis */
export interface SpreadMeaningAnalysis {
  cardScores: CardMeaningScore[];
  overallComposite: number;
  dominantDimension: keyof MeaningWeights;
  dimensionAverages: Record<keyof MeaningWeights, number>;
}

/**
 * Pseudo-hash function for deterministic scoring based on card ID and dimension
 */
function pseudoScore(cardId: string, dimension: string): number {
  let hash = 0;
  const str = `${cardId}:${dimension}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash % 100) / 100;
}

/**
 * Compute the meaning score μ(c, θ) for a single card
 * Scores are weighted by the meaning dimensions
 */
export function computeCardMeaning(
  card: TarotCard,
  weights: MeaningWeights,
): CardMeaningScore {
  const dimensions = Object.keys(weights) as (keyof MeaningWeights)[];

  const dimensionScores: Record<string, number> = {};
  let weightedSum = 0;
  let totalWeight = 0;

  for (const dim of dimensions) {
    const rawScore = pseudoScore(card.id, dim);
    const weighted = rawScore * weights[dim];
    dimensionScores[dim] = weighted;
    weightedSum += weighted;
    totalWeight += weights[dim];
  }

  const composite = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Find dominant dimension
  let maxScore = -1;
  let dominant: keyof MeaningWeights = 'psychological';
  for (const dim of dimensions) {
    if (dimensionScores[dim] > maxScore) {
      maxScore = dimensionScores[dim];
      dominant = dim;
    }
  }

  return {
    cardId: card.id,
    cardName: card.name,
    dimensionScores: dimensionScores as Record<keyof MeaningWeights, number>,
    composite,
    dominantDimension: dominant,
  };
}

/**
 * Analyze meaning across an entire spread
 */
export function analyzeSpreadMeaning(
  spread: PlacedCard[],
  weights: MeaningWeights,
): SpreadMeaningAnalysis {
  const cardScores = spread.map(s => computeCardMeaning(s.card, weights));
  const dimensions = Object.keys(weights) as (keyof MeaningWeights)[];

  // Compute averages per dimension
  const dimensionAverages: Record<string, number> = {};
  for (const dim of dimensions) {
    const avg = cardScores.reduce((sum, s) => sum + s.dimensionScores[dim], 0) / cardScores.length;
    dimensionAverages[dim] = avg;
  }

  // Overall composite
  const overallComposite = cardScores.reduce((sum, s) => sum + s.composite, 0) / cardScores.length;

  // Dominant dimension
  let maxAvg = -1;
  let dominant: keyof MeaningWeights = 'psychological';
  for (const dim of dimensions) {
    if (dimensionAverages[dim] > maxAvg) {
      maxAvg = dimensionAverages[dim];
      dominant = dim;
    }
  }

  return {
    cardScores,
    overallComposite,
    dominantDimension: dominant,
    dimensionAverages: dimensionAverages as Record<keyof MeaningWeights, number>,
  };
}
