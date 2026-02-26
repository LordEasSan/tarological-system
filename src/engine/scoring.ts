/**
 * Engine — Scoring Module (D1-D6 Quality Dimensions)
 *
 * Defines 6 quality dimensions for evaluating generated readings:
 *   D1: Structural Integrity — card uniqueness, valid positions
 *   D2: Archetypal Coherence — archetype diversity and relevance
 *   D3: Narrative Depth — semantic richness of interpretations
 *   D4: Spread Balance — positional distribution quality
 *   D5: Symbolic Resonance — keyword and meaning coherence
 *   D6: Entropy Quality — randomness and surprisingness
 *
 * Each dimension yields a score ∈ [0, 1].
 * The composite quality Q ∈ [0, 1] is the weighted mean.
 */
import type { PlacedCard, TarotParameters, MeaningWeights } from '../types';

/** Identifiers for the 6 quality dimensions */
export type QualityDimensionId = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6';

/** Dimension definition */
export interface QualityDimension {
  id: QualityDimensionId;
  name: string;
  description: string;
  weight: number; // default weight for composite
}

/** Score for a single dimension */
export interface DimensionScore {
  id: QualityDimensionId;
  name: string;
  score: number; // [0, 1]
  details: string;
}

/** Composite quality score */
export interface QualityScore {
  dimensions: DimensionScore[];
  composite: number; // [0, 1]
  passed: boolean; // composite >= threshold
  timestamp: string;
}

/** The 6 quality dimensions with default weights */
export const QUALITY_DIMENSIONS: QualityDimension[] = [
  { id: 'D1', name: 'Structural Integrity', description: 'Card uniqueness, valid positions, correct count', weight: 0.20 },
  { id: 'D2', name: 'Archetypal Coherence', description: 'Archetype diversity and family relevance', weight: 0.18 },
  { id: 'D3', name: 'Narrative Depth', description: 'Semantic richness and interpretation quality', weight: 0.18 },
  { id: 'D4', name: 'Spread Balance', description: 'Positional distribution and layout utilisation', weight: 0.15 },
  { id: 'D5', name: 'Symbolic Resonance', description: 'Keyword coherence and meaning function alignment', weight: 0.15 },
  { id: 'D6', name: 'Entropy Quality', description: 'Randomness, surprisingness, and non-triviality', weight: 0.14 },
];

/**
 * Evaluate a single dimension
 */
export function evaluateDimension(
  id: QualityDimensionId,
  spread: PlacedCard[],
  params: TarotParameters,
): DimensionScore {
  const dim = QUALITY_DIMENSIONS.find(d => d.id === id)!;

  switch (id) {
    case 'D1': return evaluateD1(spread, params, dim);
    case 'D2': return evaluateD2(spread, dim);
    case 'D3': return evaluateD3(spread, dim);
    case 'D4': return evaluateD4(spread, params, dim);
    case 'D5': return evaluateD5(spread, params.meaningWeights, dim);
    case 'D6': return evaluateD6(spread, dim);
  }
}

/** D1: Structural Integrity */
function evaluateD1(spread: PlacedCard[], params: TarotParameters, dim: QualityDimension): DimensionScore {
  let score = 1.0;
  const issues: string[] = [];

  // Card uniqueness
  const ids = spread.map(s => s.card.id);
  const unique = new Set(ids).size;
  if (unique < ids.length) {
    score -= 0.4;
    issues.push(`${ids.length - unique} duplicate(s)`);
  }

  // Correct count
  if (spread.length !== params.drawCount) {
    score -= 0.3;
    issues.push(`Expected ${params.drawCount}, got ${spread.length}`);
  }

  // Valid positions
  const invalidPos = spread.filter(s => s.position.index < 0).length;
  if (invalidPos > 0) {
    score -= 0.3;
    issues.push(`${invalidPos} invalid position(s)`);
  }

  return {
    id: 'D1', name: dim.name,
    score: Math.max(0, score),
    details: issues.length > 0 ? issues.join('; ') : 'All structural checks passed',
  };
}

/** D2: Archetypal Coherence */
function evaluateD2(spread: PlacedCard[], dim: QualityDimension): DimensionScore {
  const archetypes = new Set(spread.map(s => s.card.archetype));
  const diversity = spread.length > 0 ? archetypes.size / spread.length : 0;
  const hasMajor = spread.some(s => s.card.isMajor);

  let score = diversity * 0.7 + (hasMajor ? 0.3 : 0);

  return {
    id: 'D2', name: dim.name,
    score: Math.min(1, score),
    details: `${archetypes.size} unique archetypes (${(diversity * 100).toFixed(0)}% diversity)${hasMajor ? ', Major Arcana present' : ''}`,
  };
}

/** D3: Narrative Depth */
function evaluateD3(spread: PlacedCard[], dim: QualityDimension): DimensionScore {
  let totalKeywords = 0;
  let hasMeanings = 0;

  for (const s of spread) {
    totalKeywords += s.card.keywords.length;
    if (s.card.meaningUp && s.card.meaningUp.length > 20) hasMeanings++;
  }

  const avgKeywords = spread.length > 0 ? totalKeywords / spread.length : 0;
  const meaningCoverage = spread.length > 0 ? hasMeanings / spread.length : 0;
  const score = Math.min(1, (avgKeywords / 5) * 0.5 + meaningCoverage * 0.5);

  return {
    id: 'D3', name: dim.name,
    score,
    details: `Avg ${avgKeywords.toFixed(1)} keywords/card, ${(meaningCoverage * 100).toFixed(0)}% with rich meanings`,
  };
}

/** D4: Spread Balance */
function evaluateD4(spread: PlacedCard[], params: TarotParameters, dim: QualityDimension): DimensionScore {
  const completeness = params.drawCount > 0 ? Math.min(1, spread.length / params.drawCount) : 0;
  const positionsUsed = new Set(spread.map(s => s.position.index)).size;
  const positionCoverage = spread.length > 0 ? positionsUsed / spread.length : 0;

  const score = completeness * 0.6 + positionCoverage * 0.4;

  return {
    id: 'D4', name: dim.name,
    score: Math.min(1, score),
    details: `${(completeness * 100).toFixed(0)}% complete, ${positionsUsed} unique positions used`,
  };
}

/** D5: Symbolic Resonance */
function evaluateD5(spread: PlacedCard[], weights: MeaningWeights, dim: QualityDimension): DimensionScore {
  // Check if the spread has thematic coherence via keyword overlap
  const allKeywords = spread.flatMap(s => s.card.keywords);
  const uniqueKeywords = new Set(allKeywords);
  const repetitions = allKeywords.length - uniqueKeywords.size;
  const resonance = allKeywords.length > 0 ? repetitions / allKeywords.length : 0;

  // Weight balance (how evenly distributed the meaning weights are)
  const values = Object.values(weights);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const balance = 1 - Math.min(1, variance * 4); // lower variance = more balanced

  const score = Math.min(1, resonance * 0.4 + balance * 0.3 + (uniqueKeywords.size > 3 ? 0.3 : 0.1));

  return {
    id: 'D5', name: dim.name,
    score,
    details: `${uniqueKeywords.size} unique keywords, ${(resonance * 100).toFixed(0)}% resonance, weight balance: ${(balance * 100).toFixed(0)}%`,
  };
}

/** D6: Entropy Quality */
function evaluateD6(spread: PlacedCard[], dim: QualityDimension): DimensionScore {
  // Measure card number distribution spread
  const numbers = spread.map(s => s.card.number);
  const range = numbers.length > 0 ? Math.max(...numbers) - Math.min(...numbers) : 0;
  const maxPossibleRange = 21; // 0-21 for Major Arcana
  const rangScore = Math.min(1, range / maxPossibleRange);

  // Reversal distribution (if any)
  const reversals = spread.filter(s => s.card.isReversed).length;
  const reversalRatio = spread.length > 0 ? reversals / spread.length : 0;
  const reversalEntropy = 1 - Math.abs(reversalRatio - 0.5) * 2; // max at 50%

  const score = rangScore * 0.6 + reversalEntropy * 0.4;

  return {
    id: 'D6', name: dim.name,
    score: Math.min(1, score),
    details: `Number range: ${range}/${maxPossibleRange}, reversal ratio: ${(reversalRatio * 100).toFixed(0)}%`,
  };
}

/**
 * Compute the full quality score Q(reading) across all D1-D6 dimensions
 * @param threshold — minimum composite to pass (default 0.6)
 */
export function computeQualityScore(
  spread: PlacedCard[],
  params: TarotParameters,
  threshold = 0.6,
): QualityScore {
  const dimensions = QUALITY_DIMENSIONS.map(dim => evaluateDimension(dim.id, spread, params));

  const totalWeight = QUALITY_DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
  const composite = dimensions.reduce((sum, d, i) => sum + d.score * QUALITY_DIMENSIONS[i].weight, 0) / totalWeight;

  return {
    dimensions,
    composite,
    passed: composite >= threshold,
    timestamp: new Date().toISOString(),
  };
}
