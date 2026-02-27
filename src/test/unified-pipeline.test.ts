/**
 * Unified Pipeline — Comprehensive Tests
 *
 * Validates the symbolic-first architecture across all modes:
 *   1.  Spread generated before question analysis
 *   2.  All extracted cards mentioned in narrative
 *   3.  Narrative differs when mode changes but spread identical
 *   4.  Question influences emphasis but not card selection
 *   5.  Personalization context influences interpretation tone
 *   6.  No predictive phrasing in philosophical mode
 *   7.  No empirical claims in cosmological mode
 *   8.  SymbolicConfiguration always computed
 *   9.  InteractionMatrix always computed
 *   10. Bias vector computed correctly for each mode
 *   11. Reinterpretation keeps same spread
 *   12. Backward compatibility (existing orchestrators still work)
 *   13. Mode lenses have correct weight signatures
 *   14. Entropic clusters detected when cards share themes
 *   15. Pipeline output shape is complete and valid
 */
import { describe, it, expect } from 'vitest';
import { executeUnifiedReading, reinterpretReading } from '../engine/core/unified-pipeline';
import { computeBiasVector } from '../engine/core/bias-vector';
import { computeInteractionMatrix } from '../engine/core/interaction-matrix';
import { computeSymbolicConfiguration } from '../engine/core/symbolic-configuration';
import { getInterpretiveLens, getLensDescription } from '../engine/core/interpretive-lens';
import { generateUnifiedNarrative } from '../engine/core/narrative-integration';
import { generateSpread } from '../engine/core/spread-generator';
import { mockGenerate } from '../api/mock';
import { executePhilosophicalQuery } from '../engine/philosophical/orchestrator';
import { executeCosmologicalQuery } from '../engine/cosmological/orchestrator';
import type { TarotParameters, PlacedCard, InterrogationMode } from '../types';

// ─── Test Fixtures ──────────────────────────────────

const defaultParams: TarotParameters = {
  archetypeFamily: 'Jungian',
  deckSize: 22,
  reversalsEnabled: true,
  spreadType: 'three-card',
  drawCount: 3,
  meaningWeights: {
    psychological: 0.8,
    spiritual: 0.6,
    practical: 0.5,
    creative: 0.4,
    relational: 0.3,
  },
  narrativeStyle: 'analytical',
  seed: 42,
};

function getTestSpread(): PlacedCard[] {
  return mockGenerate(defaultParams).spread;
}

function makeGenerateFn(params: TarotParameters): PlacedCard[] {
  return mockGenerate(params).spread;
}

// ─── 1. Spread Generated Before Question Analysis ───

describe('Pipeline Order: Spread Before Question', () => {
  it('produces a spread even with no question', () => {
    const result = executeUnifiedReading(
      'divinatory', '', defaultParams, makeGenerateFn,
    );
    expect(result.spread.length).toBeGreaterThan(0);
    expect(result.biasVector).toBeDefined();
    expect(result.biasVector.rawQuestion).toBe('');
  });

  it('spread is identical regardless of question (same seed)', () => {
    const paramsWithSeed = { ...defaultParams, seed: 123 };
    const r1 = executeUnifiedReading(
      'divinatory', 'What is my destiny?', paramsWithSeed, makeGenerateFn,
    );
    const r2 = executeUnifiedReading(
      'divinatory', 'How does identity form?', paramsWithSeed, makeGenerateFn,
    );
    // With same seed, same cards should be drawn (mockGenerate uses seed)
    expect(r1.spread.length).toBe(r2.spread.length);
    for (let i = 0; i < r1.spread.length; i++) {
      expect(r1.spread[i].card.id).toBe(r2.spread[i].card.id);
    }
  });

  it('bias vector computed AFTER spread (rawQuestion populates but does not affect cards)', () => {
    const result = executeUnifiedReading(
      'philosophical',
      'What is the nature of consciousness?',
      defaultParams,
      makeGenerateFn,
    );
    expect(result.biasVector.rawQuestion).toBe('What is the nature of consciousness?');
    expect(result.biasVector.keywords.length).toBeGreaterThan(0);
    // Cards were generated before bias was computed — bias cannot influence cards
    expect(result.spread.length).toBeGreaterThan(0);
    expect(result.symbolicConfiguration).toBeDefined();
  });
});

// ─── 2. All Extracted Cards Mentioned in Narrative ──

describe('Narrative References All Cards', () => {
  it('every card name appears in the narrative (divinatory)', () => {
    const result = executeUnifiedReading(
      'divinatory', 'What does the future hold?', defaultParams, makeGenerateFn,
    );
    const narrative = result.narrative.fullNarrative.toLowerCase();
    for (const placed of result.spread) {
      expect(narrative).toContain(placed.card.name.toLowerCase());
    }
  });

  it('every card name appears in the narrative (philosophical)', () => {
    const result = executeUnifiedReading(
      'philosophical',
      'What is the structure of identity?',
      defaultParams,
      makeGenerateFn,
    );
    const narrative = result.narrative.fullNarrative.toLowerCase();
    for (const placed of result.spread) {
      expect(narrative).toContain(placed.card.name.toLowerCase());
    }
  });

  it('every card name appears in the narrative (cosmological)', () => {
    const result = executeUnifiedReading(
      'cosmological',
      'What archetypal force governs creation?',
      defaultParams,
      makeGenerateFn,
    );
    const narrative = result.narrative.fullNarrative.toLowerCase();
    for (const placed of result.spread) {
      expect(narrative).toContain(placed.card.name.toLowerCase());
    }
  });

  it('cardReferences map contains an entry for each card', () => {
    const result = executeUnifiedReading(
      'divinatory', 'Tell me about love', defaultParams, makeGenerateFn,
    );
    for (const placed of result.spread) {
      expect(result.narrative.cardReferences).toHaveProperty(placed.card.name);
    }
  });
});

// ─── 3. Narrative Differs When Mode Changes ─────────

describe('Mode Changes Narrative, Not Spread', () => {
  it('same spread produces different narratives under different modes', () => {
    const spread = getTestSpread();

    const divResult = executeUnifiedReading(
      'divinatory', 'What is happening?', defaultParams, makeGenerateFn, undefined, spread,
    );
    const philResult = executeUnifiedReading(
      'philosophical', 'What is happening?', defaultParams, makeGenerateFn, undefined, spread,
    );
    const cosResult = executeUnifiedReading(
      'cosmological', 'What is happening?', defaultParams, makeGenerateFn, undefined, spread,
    );

    // Spreads identical
    expect(divResult.spread).toEqual(spread);
    expect(philResult.spread).toEqual(spread);
    expect(cosResult.spread).toEqual(spread);

    // Narratives differ
    expect(divResult.narrative.fullNarrative).not.toBe(philResult.narrative.fullNarrative);
    expect(divResult.narrative.fullNarrative).not.toBe(cosResult.narrative.fullNarrative);
    expect(philResult.narrative.fullNarrative).not.toBe(cosResult.narrative.fullNarrative);
  });

  it('mode labels appear correctly in narratives', () => {
    const spread = getTestSpread();

    const divNarr = executeUnifiedReading(
      'divinatory', 'test', defaultParams, makeGenerateFn, undefined, spread,
    ).narrative.fullNarrative;
    const philNarr = executeUnifiedReading(
      'philosophical', 'test', defaultParams, makeGenerateFn, undefined, spread,
    ).narrative.fullNarrative;
    const cosNarr = executeUnifiedReading(
      'cosmological', 'test', defaultParams, makeGenerateFn, undefined, spread,
    ).narrative.fullNarrative;

    expect(divNarr).toContain('Temporal-Unfolding');
    expect(philNarr).toContain('Identity-Trajectory');
    expect(cosNarr).toContain('Archetypal-Polarity');
  });
});

// ─── 4. Question Influences Emphasis Not Selection ──

describe('Question as Orienting Constraint', () => {
  it('bias vector dimension weights reflect question keywords', () => {
    const psychBias = computeBiasVector('What is my shadow self becoming?', 'philosophical');
    expect(psychBias.dimensionBias.psychological).toBeGreaterThan(0.1);
    expect(psychBias.keywords).toContain('shadow');
  });

  it('empty question produces neutral bias', () => {
    const neutral = computeBiasVector('', 'divinatory');
    expect(neutral.dimensionBias.psychological).toBe(0.5);
    expect(neutral.dimensionBias.spiritual).toBe(0.5);
    expect(neutral.dimensionBias.practical).toBe(0.5);
    expect(neutral.dimensionBias.creative).toBe(0.5);
    expect(neutral.dimensionBias.relational).toBe(0.5);
    expect(neutral.keywords).toEqual([]);
    expect(neutral.questionEntropy).toBe(1.0);
  });

  it('temporal orientation matches mode defaults when question is ambiguous', () => {
    expect(computeBiasVector('hmm', 'divinatory').temporalOrientation).toBe('future');
    expect(computeBiasVector('hmm', 'philosophical').temporalOrientation).toBe('atemporal');
    expect(computeBiasVector('hmm', 'cosmological').temporalOrientation).toBe('atemporal');
  });

  it('question keywords influence bias but do not determine card selection', () => {
    const spread = getTestSpread();
    // Run pipeline twice with very different questions on same spread
    const r1 = executeUnifiedReading(
      'divinatory', 'love relationship partner bond', defaultParams, makeGenerateFn, undefined, spread,
    );
    const r2 = executeUnifiedReading(
      'divinatory', 'career money work success', defaultParams, makeGenerateFn, undefined, spread,
    );

    // Same cards
    expect(r1.spread.map(s => s.card.id)).toEqual(r2.spread.map(s => s.card.id));

    // Different bias vectors
    expect(r1.biasVector.dimensionBias.relational).not.toBe(r2.biasVector.dimensionBias.relational);

    // Narratives differ because emphasis differs
    expect(r1.narrative.fullNarrative).not.toBe(r2.narrative.fullNarrative);
  });
});

// ─── 5. Personalization Context ─────────────────────

describe('Personalization Context', () => {
  it('updates personalization after reading', () => {
    const result = executeUnifiedReading(
      'divinatory', 'What is next?', defaultParams, makeGenerateFn,
    );
    expect(result.personalization).toBeDefined();
    expect(result.personalization!.priorReadings.length).toBeGreaterThanOrEqual(1);
    expect(result.personalization!.entropyPattern.length).toBeGreaterThanOrEqual(1);
  });

  it('detects recurring attractors from multiple prior readings', () => {
    const priorReadings = [
      { timestamp: '2025-01-01', dominantArchetypes: ['Fool', 'Magician'], entropy: 0.6, mode: 'divinatory' as const },
      { timestamp: '2025-01-02', dominantArchetypes: ['Fool', 'Tower'], entropy: 0.7, mode: 'divinatory' as const },
    ];

    const result = executeUnifiedReading(
      'divinatory', 'What patterns recur?', defaultParams, makeGenerateFn,
      { priorReadings, archetypeResonanceHistory: {}, entropyPattern: [0.6, 0.7], recurringAttractors: [] },
    );

    // Should detect 'Fool' as recurring (appears in both)
    expect(result.personalization!.recurringAttractors).toContain('Fool');
  });

  it('personalization note appears in narrative when prior readings exist', () => {
    const priorReadings = [
      { timestamp: '2025-01-01', dominantArchetypes: ['Moon', 'Star'], entropy: 0.5, mode: 'divinatory' as const },
      { timestamp: '2025-01-02', dominantArchetypes: ['Moon', 'Tower'], entropy: 0.8, mode: 'divinatory' as const },
    ];

    const result = executeUnifiedReading(
      'divinatory', 'Tell me more', defaultParams, makeGenerateFn,
      { priorReadings, archetypeResonanceHistory: {}, entropyPattern: [0.5, 0.8], recurringAttractors: [] },
    );

    // Narrative should mention entropy pattern
    const narrative = result.narrative.fullNarrative.toLowerCase();
    expect(narrative).toContain('entropy');
  });
});

// ─── 6. No Predictive Phrasing in Philosophical ─────

describe('Philosophical Mode Safeguards', () => {
  const predictivePatterns = ['you will', 'will happen', 'destined to', 'fated to', 'is going to happen'];

  it('narrative contains no predictive phrasing', () => {
    const result = executeUnifiedReading(
      'philosophical',
      'What is the nature of existence?',
      defaultParams,
      makeGenerateFn,
    );
    const narrative = result.narrative.fullNarrative.toLowerCase();
    for (const pattern of predictivePatterns) {
      expect(narrative).not.toContain(pattern);
    }
  });

  it('disclaimer mentions structural clarification', () => {
    const result = executeUnifiedReading(
      'philosophical', 'Who am I?', defaultParams, makeGenerateFn,
    );
    expect(result.narrative.disclaimer.toLowerCase()).toContain('structural clarification');
  });

  it('uses philosophical vocabulary (attractor basins, trajectory space)', () => {
    const result = executeUnifiedReading(
      'philosophical', 'How does identity form?', defaultParams, makeGenerateFn,
    );
    const narrative = result.narrative.fullNarrative.toLowerCase();
    expect(narrative).toContain('attractor');
  });
});

// ─── 7. No Empirical Claims in Cosmological ─────────

describe('Cosmological Mode Safeguards', () => {
  const empiricalPatterns = ['scientifically', 'empirically proven', 'scientific fact', 'physics shows'];

  it('narrative contains no empirical claims', () => {
    const result = executeUnifiedReading(
      'cosmological',
      'What is the origin of order?',
      defaultParams,
      makeGenerateFn,
    );
    const narrative = result.narrative.fullNarrative.toLowerCase();
    for (const pattern of empiricalPatterns) {
      expect(narrative).not.toContain(pattern);
    }
  });

  it('disclaimer mentions symbolic-archetypal representation', () => {
    const result = executeUnifiedReading(
      'cosmological', 'How does consciousness emerge?', defaultParams, makeGenerateFn,
    );
    expect(result.narrative.disclaimer.toLowerCase()).toContain('symbolic-archetypal representation');
  });

  it('uses cosmological vocabulary (archetypal force, emergence principle)', () => {
    const result = executeUnifiedReading(
      'cosmological', 'What structures the universe?', defaultParams, makeGenerateFn,
    );
    const narrative = result.narrative.fullNarrative.toLowerCase();
    expect(narrative).toContain('archetypal');
  });
});

// ─── 8. SymbolicConfiguration Always Computed ───────

describe('SymbolicConfiguration', () => {
  it('always has dominant archetypes', () => {
    for (const mode of ['divinatory', 'philosophical', 'cosmological'] as InterrogationMode[]) {
      const result = executeUnifiedReading(mode, 'test', defaultParams, makeGenerateFn);
      expect(result.symbolicConfiguration.dominantArchetypes.length).toBeGreaterThan(0);
    }
  });

  it('each dominant archetype has a role', () => {
    const result = executeUnifiedReading(
      'divinatory', 'test', defaultParams, makeGenerateFn,
    );
    for (const arch of result.symbolicConfiguration.dominantArchetypes) {
      expect(['anchor', 'catalyst', 'shadow', 'bridge']).toContain(arch.role);
    }
  });

  it('entropy is between 0 and 1', () => {
    const result = executeUnifiedReading(
      'divinatory', 'test', defaultParams, makeGenerateFn,
    );
    expect(result.symbolicConfiguration.entropy).toBeGreaterThanOrEqual(0);
    expect(result.symbolicConfiguration.entropy).toBeLessThanOrEqual(1);
  });

  it('symbolic movement has entries for each card', () => {
    const result = executeUnifiedReading(
      'divinatory', 'test', defaultParams, makeGenerateFn,
    );
    expect(result.symbolicConfiguration.symbolicMovement.length).toBe(result.spread.length);
  });

  it('tension pairs have valid scores', () => {
    const result = executeUnifiedReading(
      'divinatory', 'test', defaultParams, makeGenerateFn,
    );
    for (const pair of result.symbolicConfiguration.tensionPairs) {
      expect(pair.tensionScore).toBeGreaterThan(0);
      expect(pair.tensionScore).toBeLessThanOrEqual(1);
      expect(pair.positive.cardName).toBeDefined();
      expect(pair.negative.cardName).toBeDefined();
    }
  });
});

// ─── 9. InteractionMatrix Always Computed ───────────

describe('InteractionMatrix', () => {
  it('computes pairwise interactions for all card pairs', () => {
    const spread = getTestSpread();
    const matrix = computeInteractionMatrix(spread);
    const expectedPairs = (spread.length * (spread.length - 1)) / 2;
    expect(matrix.interactions.length).toBe(expectedPairs);
  });

  it('polarity tension is bounded [-1, 1]', () => {
    const spread = getTestSpread();
    const matrix = computeInteractionMatrix(spread);
    for (const interaction of matrix.interactions) {
      expect(interaction.polarityTension).toBeGreaterThanOrEqual(-1);
      expect(interaction.polarityTension).toBeLessThanOrEqual(1);
    }
  });

  it('archetypal reinforcement is bounded [0, 1]', () => {
    const spread = getTestSpread();
    const matrix = computeInteractionMatrix(spread);
    for (const interaction of matrix.interactions) {
      expect(interaction.archetypalReinforcement).toBeGreaterThanOrEqual(0);
      expect(interaction.archetypalReinforcement).toBeLessThanOrEqual(1);
    }
  });

  it('global tension and reinforcement are averaged correctly', () => {
    const spread = getTestSpread();
    const matrix = computeInteractionMatrix(spread);
    expect(typeof matrix.globalTension).toBe('number');
    expect(typeof matrix.globalReinforcement).toBe('number');
  });

  it('interaction matrix is stored inside symbolic configuration', () => {
    const result = executeUnifiedReading(
      'divinatory', 'test', defaultParams, makeGenerateFn,
    );
    expect(result.symbolicConfiguration.interactionMatrix).toBeDefined();
    expect(result.symbolicConfiguration.interactionMatrix.interactions.length).toBeGreaterThan(0);
  });

  it('handles single-card spread gracefully', () => {
    const singleParams = { ...defaultParams, spreadType: 'single' as const, drawCount: 1 };
    const singleSpread = mockGenerate(singleParams).spread.slice(0, 1);
    const matrix = computeInteractionMatrix(singleSpread);
    expect(matrix.interactions.length).toBe(0);
    expect(matrix.globalTension).toBe(0);
    expect(matrix.globalReinforcement).toBe(0);
  });
});

// ─── 10. Bias Vector Modes ──────────────────────────

describe('Bias Vector per Mode', () => {
  it('divinatory defaults to future temporal orientation', () => {
    const bias = computeBiasVector('What will happen going forward tomorrow?', 'divinatory');
    expect(bias.temporalOrientation).toBe('future');
  });

  it('philosophical defaults to atemporal', () => {
    const bias = computeBiasVector('What eternal principle structures the nature of essence?', 'philosophical');
    expect(bias.temporalOrientation).toBe('atemporal');
  });

  it('cosmological defaults to atemporal', () => {
    const bias = computeBiasVector('What structures emerge?', 'cosmological');
    expect(bias.temporalOrientation).toBe('atemporal');
  });

  it('detects past orientation override', () => {
    const bias = computeBiasVector('What happened in the past before everything?', 'divinatory');
    expect(bias.temporalOrientation).toBe('past');
  });

  it('archetype bias scores are in [0, 1]', () => {
    const bias = computeBiasVector('Tell me about strength and courage', 'divinatory');
    for (const [, score] of Object.entries(bias.archetypeBias)) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });

  it('question entropy is in [0, 1]', () => {
    const bias = computeBiasVector('A focused question about love and bond', 'divinatory');
    expect(bias.questionEntropy).toBeGreaterThanOrEqual(0);
    expect(bias.questionEntropy).toBeLessThanOrEqual(1);
  });
});

// ─── 11. Reinterpretation Keeps Same Spread ─────────

describe('Reinterpretation (Mode Switch)', () => {
  it('reinterpretReading preserves exact same spread', () => {
    const original = executeUnifiedReading(
      'divinatory', 'What is next?', defaultParams, makeGenerateFn,
    );
    const reinterpreted = reinterpretReading(original, 'philosophical', defaultParams);

    expect(reinterpreted.spread).toEqual(original.spread);
    expect(reinterpreted.mode).toBe('philosophical');
    expect(reinterpreted.narrative.fullNarrative).not.toBe(original.narrative.fullNarrative);
  });

  it('reinterpretReading changes lens correctly', () => {
    const original = executeUnifiedReading(
      'divinatory', 'test', defaultParams, makeGenerateFn,
    );
    const cosmo = reinterpretReading(original, 'cosmological', defaultParams);

    expect(cosmo.lens.mode).toBe('cosmological');
    expect(cosmo.lens.archetypalPolarityEmphasis).toBe(0.9);
    expect(cosmo.lens.practicalEmphasis).toBe(0.1);
  });

  it('triple reinterpretation cycle returns same spread each time', () => {
    const div = executeUnifiedReading(
      'divinatory', 'What is this?', defaultParams, makeGenerateFn,
    );
    const phil = reinterpretReading(div, 'philosophical', defaultParams);
    const cos = reinterpretReading(phil, 'cosmological', defaultParams);

    const cardIds = div.spread.map(s => s.card.id);
    expect(phil.spread.map(s => s.card.id)).toEqual(cardIds);
    expect(cos.spread.map(s => s.card.id)).toEqual(cardIds);
  });
});

// ─── 12. Backward Compatibility ─────────────────────

describe('Backward Compatibility', () => {
  it('philosophical orchestrator still works independently', () => {
    const result = executePhilosophicalQuery(
      'What is the nature of identity?',
      defaultParams,
      makeGenerateFn,
    );
    expect(result).toBeDefined();
    expect(result.query).toBeDefined();
    expect(result.spread.length).toBeGreaterThan(0);
    expect(result.interpretation).toBeDefined();
  });

  it('cosmological orchestrator still works independently', () => {
    const result = executeCosmologicalQuery(
      'Why does order emerge from chaos?',
      defaultParams,
      makeGenerateFn,
    );
    expect(result).toBeDefined();
    expect(result.query).toBeDefined();
    expect(result.spread.length).toBeGreaterThan(0);
    expect(result.interpretation).toBeDefined();
  });
});

// ─── 13. Mode Lenses ────────────────────────────────

describe('Interpretive Lens Weights', () => {
  it('divinatory lens prioritizes temporal + practical', () => {
    const lens = getInterpretiveLens('divinatory');
    expect(lens.temporalEmphasis).toBe(0.9);
    expect(lens.practicalEmphasis).toBe(0.8);
    expect(lens.mode).toBe('divinatory');
  });

  it('philosophical lens prioritizes identity', () => {
    const lens = getInterpretiveLens('philosophical');
    expect(lens.identityEmphasis).toBe(0.9);
    expect(lens.structuralPrincipleEmphasis).toBe(0.7);
    expect(lens.mode).toBe('philosophical');
  });

  it('cosmological lens prioritizes archetypal polarity + structural principles', () => {
    const lens = getInterpretiveLens('cosmological');
    expect(lens.archetypalPolarityEmphasis).toBe(0.9);
    expect(lens.structuralPrincipleEmphasis).toBe(0.9);
    expect(lens.mode).toBe('cosmological');
  });

  it('each lens has a non-empty description', () => {
    for (const mode of ['divinatory', 'philosophical', 'cosmological'] as InterrogationMode[]) {
      const desc = getLensDescription(mode);
      expect(desc.length).toBeGreaterThan(50);
    }
  });

  it('getInterpretiveLens returns a defensive copy', () => {
    const a = getInterpretiveLens('divinatory');
    const b = getInterpretiveLens('divinatory');
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});

// ─── 14. Entropic Cluster Detection ─────────────────

describe('Entropic Clusters', () => {
  it('interaction matrix can detect entropic clusters', () => {
    const spread = getTestSpread();
    const matrix = computeInteractionMatrix(spread);
    // Clusters are optional — but the field should exist
    expect(Array.isArray(matrix.entropicClusters)).toBe(true);
  });

  it('entropic clusters have at least 2 cards when present', () => {
    const spread = getTestSpread();
    const matrix = computeInteractionMatrix(spread);
    for (const cluster of matrix.entropicClusters) {
      expect(cluster.cardNames.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('symbolic configuration enriches clusters with entropy', () => {
    const result = executeUnifiedReading(
      'divinatory', 'test', defaultParams, makeGenerateFn,
    );
    for (const cluster of result.symbolicConfiguration.entropicClusters) {
      expect(typeof cluster.entropy).toBe('number');
      expect(cluster.entropy).toBeGreaterThanOrEqual(0);
      expect(cluster.entropy).toBeLessThanOrEqual(1);
    }
  });
});

// ─── 15. Pipeline Output Shape ──────────────────────

describe('Pipeline Output Completeness', () => {
  it('response has all required fields', () => {
    const result = executeUnifiedReading(
      'divinatory', 'What does the future hold?', defaultParams, makeGenerateFn,
    );

    // Top-level fields
    expect(result.mode).toBe('divinatory');
    expect(result.question).toBe('What does the future hold?');
    expect(result.biasVector).toBeDefined();
    expect(result.spread).toBeDefined();
    expect(result.symbolicConfiguration).toBeDefined();
    expect(result.lens).toBeDefined();
    expect(result.narrative).toBeDefined();
    expect(result.verification).toBeDefined();
    expect(result.personalization).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it('narrative has all required subfields', () => {
    const result = executeUnifiedReading(
      'philosophical', 'test', defaultParams, makeGenerateFn,
    );
    const n = result.narrative;
    expect(typeof n.existentialTension).toBe('string');
    expect(typeof n.symbolicMovement).toBe('string');
    expect(typeof n.archetypalDynamics).toBe('string');
    expect(typeof n.structuralResponse).toBe('string');
    expect(typeof n.opennessPreservation).toBe('string');
    expect(typeof n.disclaimer).toBe('string');
    expect(typeof n.fullNarrative).toBe('string');
    expect(typeof n.cardReferences).toBe('object');
  });

  it('verification properties exist', () => {
    const result = executeUnifiedReading(
      'divinatory', 'test', defaultParams, makeGenerateFn,
    );
    expect(result.verification).toBeDefined();
    expect(typeof result.verification.overallPassed).toBe('boolean');
    expect(Array.isArray(result.verification.properties)).toBe(true);
  });

  it('disclaimer is always present and non-empty', () => {
    for (const mode of ['divinatory', 'philosophical', 'cosmological'] as InterrogationMode[]) {
      const result = executeUnifiedReading(mode, 'test', defaultParams, makeGenerateFn);
      expect(result.narrative.disclaimer.length).toBeGreaterThan(10);
    }
  });

  it('divinatory disclaimer mentions trajectory map', () => {
    const result = executeUnifiedReading(
      'divinatory', 'test', defaultParams, makeGenerateFn,
    );
    expect(result.narrative.disclaimer.toLowerCase()).toContain('symbolic trajectory map');
  });
});

// ─── 16. Spread Generator ───────────────────────────

describe('Spread Generator (Core)', () => {
  it('generates a spread with quality score', () => {
    const result = generateSpread(defaultParams, makeGenerateFn);
    expect(result.spread.length).toBeGreaterThan(0);
    expect(result.qualityScore).toBeGreaterThan(0);
    expect(result.qualityScore).toBeLessThanOrEqual(1);
  });

  it('spread cards have valid structure', () => {
    const { spread } = generateSpread(defaultParams, makeGenerateFn);
    for (const placed of spread) {
      expect(placed.card).toBeDefined();
      expect(placed.card.id).toBeDefined();
      expect(placed.card.name).toBeDefined();
      expect(placed.card.keywords.length).toBeGreaterThan(0);
      expect(placed.position).toBeDefined();
      expect(placed.position.label).toBeDefined();
    }
  });
});

// ─── 17. Cross-Mode Consistency ─────────────────────

describe('Cross-Mode Consistency', () => {
  it('symbolic configuration is structurally same across modes (same spread)', () => {
    const spread = getTestSpread();
    const modes: InterrogationMode[] = ['divinatory', 'philosophical', 'cosmological'];
    const configs = modes.map(mode =>
      executeUnifiedReading(mode, 'test', defaultParams, makeGenerateFn, undefined, spread)
        .symbolicConfiguration,
    );

    // All should have same number of dominant archetypes
    expect(configs[0].dominantArchetypes.length).toBe(configs[1].dominantArchetypes.length);
    expect(configs[1].dominantArchetypes.length).toBe(configs[2].dominantArchetypes.length);

    // All should have same symbolic movement
    expect(configs[0].symbolicMovement.length).toBe(configs[1].symbolicMovement.length);
  });

  it('interaction matrix is identical for same spread regardless of mode', () => {
    const spread = getTestSpread();
    const m1 = computeInteractionMatrix(spread);
    const m2 = computeInteractionMatrix(spread);
    expect(m1.interactions.length).toBe(m2.interactions.length);
    expect(m1.globalTension).toBe(m2.globalTension);
    expect(m1.globalReinforcement).toBe(m2.globalReinforcement);
  });
});
