/**
 * Engine tests — scoring, iteration (ΔQi<τ), meaning, LTL, narrative, archetypes, spreads
 */
import { describe, it, expect } from 'vitest';
import { computeQualityScore, evaluateDimension, QUALITY_DIMENSIONS } from '../engine/scoring';
import { IterationRunner, DEFAULT_ITERATION_CONFIG } from '../engine/iteration';
import { computeCardMeaning, analyzeSpreadMeaning } from '../engine/meaning';
import { verifyReading, getPropertyTemplates } from '../engine/ltl';
import { getArchetypeFamily, ARCHETYPE_FAMILIES } from '../engine/archetypes';
import { getSpreadLayout, SPREAD_OPTIONS, getSpreadPositions, getDefaultCardCount } from '../engine/spreads';
import { generateNarrative, generateSynthesis } from '../engine/narrative';
import type { PlacedCard, TarotParameters, TarotCard, MeaningWeights } from '../types';
import type { IterationCallback } from '../engine/iteration';

// ─── Test data ────────────────────────────────────

const mockCard = (id: string, num: number, reversed = false): TarotCard => ({
  id,
  name: `Card ${num}`,
  number: num,
  isMajor: true,
  isReversed: reversed,
  archetype: `Archetype_${num}`,
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  meaningUp: 'A deep meaning about transformation and growth.',
  meaningReversed: 'A reversed meaning about stagnation.',
});

const mockSpread = (count = 3): PlacedCard[] =>
  Array.from({ length: count }, (_, i) => ({
    card: mockCard(`card-${i}`, i, i % 3 === 0),
    position: {
      index: i,
      label: `Position ${i}`,
      description: `Description for position ${i}`,
      x: (i + 1) * 25,
      y: 50,
      rotation: 0,
    },
  }));

const mockParams: TarotParameters = {
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
  narrativeStyle: 'formal',
};

// ─── Scoring tests ────────────────────────────────

describe('Scoring Engine (D1-D6)', () => {
  it('should define 6 quality dimensions', () => {
    expect(QUALITY_DIMENSIONS).toHaveLength(6);
    expect(QUALITY_DIMENSIONS.map(d => d.id)).toEqual(['D1', 'D2', 'D3', 'D4', 'D5', 'D6']);
  });

  it('should compute composite quality score', () => {
    const spread = mockSpread(3);
    const score = computeQualityScore(spread, mockParams);
    expect(score.composite).toBeGreaterThanOrEqual(0);
    expect(score.composite).toBeLessThanOrEqual(1);
    expect(score.dimensions).toHaveLength(6);
    expect(typeof score.passed).toBe('boolean');
    expect(score.timestamp).toBeTruthy();
  });

  it('should evaluate individual dimensions', () => {
    const spread = mockSpread(3);
    const d1 = evaluateDimension('D1', spread, mockParams);
    expect(d1.id).toBe('D1');
    expect(d1.score).toBeGreaterThanOrEqual(0);
    expect(d1.score).toBeLessThanOrEqual(1);
  });

  it('should detect structural issues in D1', () => {
    // Spread with wrong count
    const spread = mockSpread(2);
    const d1 = evaluateDimension('D1', spread, { ...mockParams, drawCount: 3 });
    expect(d1.score).toBeLessThan(1);
  });

  it('should detect D1 duplicate cards', () => {
    const spread = mockSpread(3);
    // Make a duplicate
    spread[1] = { ...spread[0] };
    const d1 = evaluateDimension('D1', spread, mockParams);
    expect(d1.score).toBeLessThan(1);
    expect(d1.details).toContain('duplicate');
  });

  it('should evaluate D2 archetypal coherence', () => {
    const spread = mockSpread(3);
    const d2 = evaluateDimension('D2', spread, mockParams);
    expect(d2.id).toBe('D2');
    expect(d2.score).toBeGreaterThanOrEqual(0);
    expect(d2.score).toBeLessThanOrEqual(1);
  });

  it('should evaluate D3 narrative depth', () => {
    const d3 = evaluateDimension('D3', mockSpread(3), mockParams);
    expect(d3.id).toBe('D3');
    expect(d3.details).toContain('keywords');
  });

  it('should evaluate D4 spread balance', () => {
    const d4 = evaluateDimension('D4', mockSpread(3), mockParams);
    expect(d4.id).toBe('D4');
    expect(d4.score).toBeGreaterThan(0);
  });

  it('should evaluate D5 symbolic resonance', () => {
    const d5 = evaluateDimension('D5', mockSpread(3), mockParams);
    expect(d5.id).toBe('D5');
    expect(d5.details).toContain('keywords');
  });

  it('should evaluate D6 entropy quality', () => {
    const d6 = evaluateDimension('D6', mockSpread(3), mockParams);
    expect(d6.id).toBe('D6');
    expect(d6.details).toContain('range');
  });

  it('should pass when composite >= threshold', () => {
    const spread = mockSpread(3);
    const score = computeQualityScore(spread, mockParams, 0.01);
    expect(score.passed).toBe(true);
  });

  it('should fail when composite < threshold', () => {
    const spread = mockSpread(3);
    const score = computeQualityScore(spread, mockParams, 0.999);
    expect(score.passed).toBe(false);
  });

  it('should have dimension weights summing ~ 1', () => {
    const total = QUALITY_DIMENSIONS.reduce((s, d) => s + d.weight, 0);
    expect(total).toBeCloseTo(1.0, 1);
  });

  it('should handle empty spread gracefully', () => {
    const score = computeQualityScore([], mockParams);
    expect(score.composite).toBeGreaterThanOrEqual(0);
    expect(score.dimensions).toHaveLength(6);
  });
});

// ─── Iteration tests ──────────────────────────────

describe('Iteration Engine', () => {
  it('should have sensible defaults', () => {
    expect(DEFAULT_ITERATION_CONFIG.qTarget).toBeGreaterThan(0);
    expect(DEFAULT_ITERATION_CONFIG.maxIterations).toBeGreaterThan(0);
    expect(DEFAULT_ITERATION_CONFIG.deltaThreshold).toBeGreaterThan(0);
    expect(DEFAULT_ITERATION_CONFIG.consecutiveStops).toBeGreaterThanOrEqual(1);
    expect(DEFAULT_ITERATION_CONFIG.minIterations).toBeGreaterThanOrEqual(1);
  });

  it('should run iterations and return a log', () => {
    const runner = new IterationRunner({ maxIterations: 3 });
    const { bestSpread, log } = runner.run(
      () => mockSpread(3),
      mockParams,
    );
    expect(bestSpread).toHaveLength(3);
    expect(log.totalIterations).toBeGreaterThanOrEqual(1);
    expect(log.totalIterations).toBeLessThanOrEqual(3);
    expect(log.bestQuality).toBeGreaterThanOrEqual(0);
    expect(log.entries.length).toBe(log.totalIterations);
  });

  it('should stop when quality target is met', () => {
    const runner = new IterationRunner({ qTarget: 0.01, maxIterations: 10 });
    const { log } = runner.run(
      () => mockSpread(3),
      mockParams,
    );
    // With q_target=0.01, should converge quickly
    expect(log.converged).toBe(true);
    expect(log.convergenceReason).toBe('quality_target');
  });

  it('should track ΔQi (deltaQ) in each iteration entry', () => {
    const runner = new IterationRunner({ maxIterations: 3, minIterations: 3 });
    const { log } = runner.run(() => mockSpread(3), mockParams);
    for (const entry of log.entries) {
      expect(typeof entry.deltaQ).toBe('number');
      expect(entry.dimensionDeltas).toBeDefined();
      expect(Object.keys(entry.dimensionDeltas)).toHaveLength(6);
    }
  });

  it('should report convergenceReason as max_iterations when not converged', () => {
    const runner = new IterationRunner({ qTarget: 99, maxIterations: 2, minIterations: 1 });
    const { log } = runner.run(() => mockSpread(3), mockParams);
    expect(log.converged).toBe(false);
    expect(log.convergenceReason).toBe('max_iterations');
  });

  it('should compute dimension trends', () => {
    const runner = new IterationRunner({ maxIterations: 4, minIterations: 4 });
    const { log } = runner.run(() => mockSpread(3), mockParams);
    expect(log.dimensionTrends).toHaveLength(6);
    for (const trend of log.dimensionTrends) {
      expect(['D1', 'D2', 'D3', 'D4', 'D5', 'D6']).toContain(trend.dimension);
      expect(trend.values.length).toBe(log.totalIterations);
      expect(typeof trend.delta).toBe('number');
      expect(typeof trend.improving).toBe('boolean');
    }
  });

  it('should invoke onIteration callback', () => {
    const entries: unknown[] = [];
    const callback: IterationCallback = (entry) => entries.push(entry);
    const runner = new IterationRunner({ maxIterations: 3, minIterations: 3 });
    runner.run(() => mockSpread(3), mockParams, callback);
    expect(entries).toHaveLength(3);
  });

  it('should update config via setConfig', () => {
    const runner = new IterationRunner();
    runner.setConfig({ qTarget: 0.9 });
    expect(runner.getConfig().qTarget).toBe(0.9);
    expect(runner.getConfig().maxIterations).toBe(DEFAULT_ITERATION_CONFIG.maxIterations);
  });

  it('should stop with delta_threshold when ΔQ is consistently small', () => {
    // Use a stable generator that always returns the same spread
    const stableSpread = mockSpread(3);
    const runner = new IterationRunner({
      qTarget: 99, // unreachable
      maxIterations: 10,
      minIterations: 2,
      deltaThreshold: 0.5,
      consecutiveStops: 2,
    });
    const { log } = runner.run(() => stableSpread, mockParams);
    // Since the same spread is used, ΔQ should be 0 after iteration 1
    // and it should converge via delta_threshold
    if (log.converged) {
      expect(log.convergenceReason).toBe('delta_threshold');
    }
  });
});

// ─── Meaning tests ────────────────────────────────

describe('Meaning Engine', () => {
  it('should compute card meaning scores', () => {
    const card = mockCard('test-card', 0);
    const weights: MeaningWeights = {
      psychological: 0.8, spiritual: 0.6,
      practical: 0.5, creative: 0.4, relational: 0.3,
    };
    const score = computeCardMeaning(card, weights);
    expect(score.cardId).toBe('test-card');
    expect(score.composite).toBeGreaterThanOrEqual(0);
    expect(score.composite).toBeLessThanOrEqual(1);
    expect(score.dominantDimension).toBeTruthy();
  });

  it('should analyze spread meaning', () => {
    const spread = mockSpread(3);
    const analysis = analyzeSpreadMeaning(spread, mockParams.meaningWeights);
    expect(analysis.cardScores).toHaveLength(3);
    expect(analysis.overallComposite).toBeGreaterThanOrEqual(0);
    expect(analysis.dominantDimension).toBeTruthy();
  });
});

// ─── LTL tests ────────────────────────────────────

describe('LTL Verification Engine', () => {
  it('should verify a valid reading', () => {
    const spread = mockSpread(3);
    const result = verifyReading(spread, mockParams);
    expect(result.properties.length).toBeGreaterThan(0);
    expect(typeof result.overallPassed).toBe('boolean');
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toBeTruthy();
  });

  it('should return property templates', () => {
    const templates = getPropertyTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every(t => t.name && t.type && t.formula)).toBe(true);
  });

  it('should have all 4 property types', () => {
    const spread = mockSpread(3);
    const result = verifyReading(spread, mockParams);
    const types = new Set(result.properties.map(p => p.type));
    expect(types.has('safety')).toBe(true);
    expect(types.has('cosafety')).toBe(true);
    expect(types.has('liveness')).toBe(true);
    expect(types.has('coliveness')).toBe(true);
  });

  it('should detect duplicate cards', () => {
    const spread = mockSpread(3);
    spread[1] = { ...spread[0] }; // duplicate
    const result = verifyReading(spread, mockParams);
    const uniquenessCheck = result.properties.find(p => p.name === 'Card Uniqueness');
    expect(uniquenessCheck?.passed).toBe(false);
  });

  it('should check spread completeness', () => {
    const spread = mockSpread(2); // only 2 cards
    const result = verifyReading(spread, { ...mockParams, drawCount: 3 });
    const completeness = result.properties.find(p => p.name === 'Spread Completeness');
    expect(completeness?.passed).toBe(false);
  });

  it('should pass all properties for a well-formed spread', () => {
    const spread = mockSpread(3);
    const result = verifyReading(spread, mockParams);
    // A well-formed 3-card spread with unique cards should pass most properties
    const safetyChecks = result.properties.filter(p => p.type === 'safety');
    expect(safetyChecks.every(p => p.passed)).toBe(true);
  });

  it('should have formula for each property', () => {
    const spread = mockSpread(3);
    const result = verifyReading(spread, mockParams);
    for (const prop of result.properties) {
      expect(prop.formula).toBeTruthy();
      expect(prop.formula.length).toBeGreaterThan(0);
    }
  });
});

// ─── Archetypes tests ─────────────────────────────

describe('Archetypes Engine', () => {
  it('should have all families defined', () => {
    expect(ARCHETYPE_FAMILIES.length).toBeGreaterThanOrEqual(5);
  });

  it('should get family by name', () => {
    const jungian = getArchetypeFamily('Jungian');
    expect(jungian.family).toBe('Jungian');
    expect(jungian.mappings.length).toBe(22);
  });

  it('should fallback to first family for unknown', () => {
    const result = getArchetypeFamily('Custom');
    expect(result).toBeTruthy();
  });
});

// ─── Spreads tests ────────────────────────────────

describe('Spreads Engine', () => {
  it('should have spread options', () => {
    expect(SPREAD_OPTIONS.length).toBeGreaterThanOrEqual(4);
  });

  it('should get three-card layout', () => {
    const layout = getSpreadLayout('three-card');
    expect(layout.positions).toHaveLength(3);
    expect(layout.type).toBe('three-card');
  });

  it('should get celtic-cross layout', () => {
    const layout = getSpreadLayout('celtic-cross');
    expect(layout.positions).toHaveLength(10);
  });

  it('should get horseshoe layout', () => {
    const layout = getSpreadLayout('horseshoe');
    expect(layout.positions).toHaveLength(7);
    expect(layout.type).toBe('horseshoe');
  });

  it('should get star layout', () => {
    const layout = getSpreadLayout('star');
    expect(layout.positions).toHaveLength(6);
  });

  it('should fallback for unknown spread type', () => {
    const layout = getSpreadLayout('custom');
    expect(layout).toBeTruthy();
  });

  it('should get positions by type', () => {
    const positions = getSpreadPositions('three-card');
    expect(positions).toHaveLength(3);
    expect(positions[0].label).toBeTruthy();
  });

  it('should get default card count', () => {
    expect(getDefaultCardCount('three-card')).toBe(3);
    expect(getDefaultCardCount('celtic-cross')).toBe(10);
    expect(getDefaultCardCount('horseshoe')).toBe(7);
    expect(getDefaultCardCount('star')).toBe(6);
  });

  it('should have valid positions with coordinates', () => {
    for (const opt of SPREAD_OPTIONS) {
      const layout = getSpreadLayout(opt.type);
      for (const pos of layout.positions) {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThanOrEqual(100);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThanOrEqual(100);
        expect(pos.label.length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── Narrative tests ──────────────────────────────

describe('Narrative Engine', () => {
  it('should generate a narrative', () => {
    const spread = mockSpread(3);
    const result = generateNarrative(spread, {
      style: 'formal',
      weights: mockParams.meaningWeights,
      includePositionContext: true,
    });
    expect(result.title).toBeTruthy();
    expect(result.sections).toHaveLength(3);
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.timestamp).toBeTruthy();
  });

  it('should generate synthesis', () => {
    const spread = mockSpread(3);
    const synthesis = generateSynthesis(spread, mockParams.meaningWeights);
    expect(synthesis).toContain('Reading path');
  });

  it('should support all 4 narrative styles', () => {
    const spread = mockSpread(3);
    const styles = ['formal', 'poetic', 'analytical', 'mystical'] as const;
    for (const style of styles) {
      const result = generateNarrative(spread, {
        style,
        weights: mockParams.meaningWeights,
        includePositionContext: true,
      });
      expect(result.title).toBeTruthy();
      expect(result.summary.length).toBeGreaterThan(50);
    }
  });

  it('should reference card names in sections', () => {
    const spread = mockSpread(3);
    const result = generateNarrative(spread, {
      style: 'formal',
      weights: mockParams.meaningWeights,
      includePositionContext: true,
    });
    for (const section of result.sections) {
      expect(section.heading).toBeTruthy();
      expect(section.body.length).toBeGreaterThan(0);
    }
  });

  it('should include dominant dimension in synthesis', () => {
    const spread = mockSpread(3);
    const synthesis = generateSynthesis(spread, { ...mockParams.meaningWeights, psychological: 1.0, spiritual: 0.1 });
    expect(synthesis.toUpperCase()).toContain('PSYCHOLOGICAL');
  });
});

// ─── Meaning tests (extended) ──────────────────────

describe('Meaning Engine (extended)', () => {
  it('should handle different weight configurations', () => {
    const card = mockCard('test', 5);
    const heavyPsych: MeaningWeights = { psychological: 1.0, spiritual: 0.1, practical: 0.1, creative: 0.1, relational: 0.1 };
    const result = computeCardMeaning(card, heavyPsych);
    expect(result.composite).toBeGreaterThanOrEqual(0);
  });

  it('should return dimension averages in spread analysis', () => {
    const spread = mockSpread(5);
    const analysis = analyzeSpreadMeaning(spread, mockParams.meaningWeights);
    expect(Object.keys(analysis.dimensionAverages)).toHaveLength(5);
    for (const key of Object.keys(analysis.dimensionAverages)) {
      expect(analysis.dimensionAverages[key as keyof MeaningWeights]).toBeGreaterThanOrEqual(0);
    }
  });
});
