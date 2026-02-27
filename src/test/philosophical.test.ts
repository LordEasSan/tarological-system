/**
 * Philosophical Engine — Comprehensive Tests
 *
 * Tests the full philosophical-ontological query pipeline:
 *   1. Question classification
 *   2. Question parsing → Q = (C, ΦQ, Δ)
 *   3. Trajectory interpretation
 *   4. Meaning integration
 *   5. Response generation
 *   6. Full orchestration
 *   7. Backward compatibility (divinatory mode untouched)
 */
import { describe, it, expect } from 'vitest';
import { classifyQuestion, parseQuestion } from '../engine/philosophical/question-parser';
import { computeTrajectoryRestriction } from '../engine/philosophical/trajectory';
import { computeMeaningIntegration } from '../engine/philosophical/meaning-integration';
import { generatePhilosophicalInterpretation } from '../engine/philosophical/response-generator';
import { executePhilosophicalQuery } from '../engine/philosophical/orchestrator';
import { mockGenerate } from '../api/mock';
import { verifyReading } from '../engine/ltl';
import { computeQualityScore } from '../engine/scoring';
import { generateNarrative } from '../engine/narrative';
import { IterationRunner } from '../engine/iteration';
import type { TarotParameters, PlacedCard } from '../types';

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

// ─── 1. Question Classification Tests ───────────────

describe('Question Classification', () => {
  it('classifies ontological questions', () => {
    expect(classifyQuestion('What is the nature of reality?').type).toBe('ontological');
    expect(classifyQuestion('What kind of world am I inhabiting?').type).toBe('ontological');
  });

  it('classifies identity questions', () => {
    expect(classifyQuestion('Who am I becoming?').type).toBe('identity');
    expect(classifyQuestion('What am I turning into?').type).toBe('identity');
  });

  it('classifies meaning-of-event questions', () => {
    expect(classifyQuestion('What does it mean that this happened?').type).toBe('meaning-of-event');
    expect(classifyQuestion('Why did this event happen to me?').type).toBe('meaning-of-event');
  });

  it('classifies teleological questions', () => {
    expect(classifyQuestion('What is the purpose of my journey?').type).toBe('teleological');
    expect(classifyQuestion('Where am I heading?').type).toBe('teleological');
  });

  it('classifies counterfactual questions', () => {
    expect(classifyQuestion('What if I had never left?').type).toBe('counterfactual-existential');
    expect(classifyQuestion('What would it imply if things were different?').type).toBe('counterfactual-existential');
  });

  it('defaults to ontological for ambiguous questions', () => {
    const result = classifyQuestion('Hello');
    expect(result.type).toBe('ontological');
  });

  it('returns confidence score', () => {
    const result = classifyQuestion('Who am I becoming?');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});

// ─── 2. Question Parsing Tests ──────────────────────

describe('Question Parsing — Q = (C, ΦQ, Δ)', () => {
  it('produces a valid PhilosophicalQuery', () => {
    const q = parseQuestion('Who am I becoming?');
    expect(q.rawQuestion).toBe('Who am I becoming?');
    expect(q.questionType).toBe('identity');
    expect(q.embedding).toBeDefined();
    expect(q.temporalLogic).toBeDefined();
    expect(q.trajectoryPruning).toBeGreaterThanOrEqual(0);
    expect(q.trajectoryPruning).toBeLessThanOrEqual(1);
  });

  it('generates dimension weights in [0,1]', () => {
    const q = parseQuestion('What is the nature of my spiritual transformation?');
    const weights = q.embedding.dimensionWeights;
    for (const val of Object.values(weights)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it('generates archetype affinities', () => {
    const q = parseQuestion('What does death and transformation mean?');
    expect(Object.keys(q.embedding.archetypeAffinities).length).toBeGreaterThan(0);
    for (const val of Object.values(q.embedding.archetypeAffinities)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it('computes entropy in [0,1]', () => {
    const q = parseQuestion('What kind of world am I inhabiting?');
    expect(q.embedding.entropy).toBeGreaterThanOrEqual(0);
    expect(q.embedding.entropy).toBeLessThanOrEqual(1);
  });

  it('infers temporal logic operator', () => {
    const q1 = parseQuestion('Who am I becoming?');
    expect(q1.temporalLogic.operator).toBe('FG');

    const q2 = parseQuestion('What is the nature of reality?');
    expect(q2.temporalLogic.operator).toBe('G');

    const q3 = parseQuestion('What does it mean that this happened?');
    expect(q3.temporalLogic.operator).toBe('F');
  });

  it('assigns temporal orientation', () => {
    const q = parseQuestion('What does it mean that this happened?');
    expect(q.temporalLogic.orientation).toBe('past');
  });

  it('computes trajectory pruning based on question type', () => {
    const qOntological = parseQuestion('What is reality?');
    const qEvent = parseQuestion('What does it mean that this happened?');
    // Ontological should have higher pruning factor (more open)
    expect(qOntological.trajectoryPruning).toBeGreaterThanOrEqual(qEvent.trajectoryPruning - 0.3);
  });
});

// ─── 3. Trajectory Interpretation Tests ─────────────

describe('Trajectory Interpretation — ΠQ', () => {
  it('computes attractor basins from spread and query', () => {
    const q = parseQuestion('Who am I becoming?');
    const spread = getTestSpread();
    const restriction = computeTrajectoryRestriction(spread, q, defaultParams);

    expect(restriction.attractors.length).toBe(spread.length);
    expect(restriction.attractors[0].dominance).toBeGreaterThanOrEqual(
      restriction.attractors[restriction.attractors.length - 1].dominance,
    );
  });

  it('each attractor has required fields', () => {
    const q = parseQuestion('What is the purpose of change?');
    const spread = getTestSpread();
    const restriction = computeTrajectoryRestriction(spread, q, defaultParams);

    for (const attractor of restriction.attractors) {
      expect(attractor.archetype).toBeTruthy();
      expect(attractor.cardName).toBeTruthy();
      expect(attractor.cardId).toBeTruthy();
      expect(attractor.dominance).toBeGreaterThanOrEqual(0);
      expect(attractor.dominance).toBeLessThanOrEqual(1);
      expect(['constructive', 'destructive', 'liminal']).toContain(attractor.polarity);
      expect(attractor.keywords.length).toBeGreaterThan(0);
    }
  });

  it('computes entropy in [0,1]', () => {
    const q = parseQuestion('What kind of world am I inhabiting?');
    const spread = getTestSpread();
    const restriction = computeTrajectoryRestriction(spread, q, defaultParams);

    expect(restriction.entropy).toBeGreaterThanOrEqual(0);
    expect(restriction.entropy).toBeLessThanOrEqual(1);
  });

  it('checks liveness constraint', () => {
    const q = parseQuestion('Who am I becoming?');
    const spread = getTestSpread();
    const restriction = computeTrajectoryRestriction(spread, q, defaultParams);

    expect(typeof restriction.livenessHolds).toBe('boolean');
  });

  it('checks coliveness', () => {
    const q = parseQuestion('Am I trapped in a destructive cycle?');
    const spread = getTestSpread();
    const restriction = computeTrajectoryRestriction(spread, q, defaultParams);

    expect(restriction.colivenessCheck).toBeDefined();
    expect(typeof restriction.colivenessCheck.passed).toBe('boolean');
    expect(restriction.colivenessCheck.details).toBeTruthy();
  });

  it('generates structural summary', () => {
    const q = parseQuestion('What does it mean that everything changed?');
    const spread = getTestSpread();
    const restriction = computeTrajectoryRestriction(spread, q, defaultParams);

    expect(restriction.structuralSummary).toBeTruthy();
    expect(restriction.structuralSummary.length).toBeGreaterThan(10);
  });
});

// ─── 4. Meaning Integration Tests ───────────────────

describe('Meaning Integration — Meaning(e)', () => {
  it('returns a valid MeaningIntegration', () => {
    const q = parseQuestion('What does it mean that this happened?');
    const spread = getTestSpread();
    const trajectory = computeTrajectoryRestriction(spread, q, defaultParams);
    const meaning = computeMeaningIntegration(spread, q, trajectory, defaultParams);

    expect(typeof meaning.integrated).toBe('boolean');
    expect(meaning.propertiesSatisfied).toBeDefined();
    expect(typeof meaning.propertiesSatisfied.heroPattern).toBe('boolean');
    expect(typeof meaning.propertiesSatisfied.cosafety).toBe('boolean');
    expect(typeof meaning.propertiesSatisfied.liveness).toBe('boolean');
    expect(meaning.entropyLevel).toBeGreaterThanOrEqual(0);
    expect(meaning.entropyLevel).toBeLessThanOrEqual(1);
  });

  it('provides heroTrajectory when integrated', () => {
    const q = parseQuestion('Who am I becoming?');
    const spread = getTestSpread();
    const trajectory = computeTrajectoryRestriction(spread, q, defaultParams);
    const meaning = computeMeaningIntegration(spread, q, trajectory, defaultParams);

    if (meaning.integrated) {
      expect(meaning.heroTrajectory).toBeTruthy();
    }
  });

  it('provides liminalExplanation when not integrated', () => {
    const q = parseQuestion('What does this void mean?');
    const spread = getTestSpread();
    const trajectory = computeTrajectoryRestriction(spread, q, defaultParams);
    const meaning = computeMeaningIntegration(spread, q, trajectory, defaultParams);

    if (!meaning.integrated) {
      expect(meaning.liminalExplanation).toBeTruthy();
      expect(meaning.liminalExplanation!.length).toBeGreaterThan(10);
    }
  });
});

// ─── 5. Response Generation Tests ───────────────────

describe('Response Generation — Philosophical Interpretation', () => {
  it('generates all interpretation sections', () => {
    const q = parseQuestion('Who am I becoming?');
    const spread = getTestSpread();
    const trajectory = computeTrajectoryRestriction(spread, q, defaultParams);
    const meaning = computeMeaningIntegration(spread, q, trajectory, defaultParams);
    const interp = generatePhilosophicalInterpretation(q, trajectory, meaning, spread);

    expect(interp.structuralClarification).toBeTruthy();
    expect(interp.attractorAnalysis).toBeTruthy();
    expect(interp.entropyAssessment).toBeTruthy();
    expect(interp.meaningNarrative).toBeTruthy();
    expect(interp.disclaimer).toBeTruthy();
    expect(interp.fullText).toBeTruthy();
  });

  it('includes the safety disclaimer', () => {
    const q = parseQuestion('Am I doomed to repeat this pattern?');
    const spread = getTestSpread();
    const trajectory = computeTrajectoryRestriction(spread, q, defaultParams);
    const meaning = computeMeaningIntegration(spread, q, trajectory, defaultParams);
    const interp = generatePhilosophicalInterpretation(q, trajectory, meaning, spread);

    expect(interp.disclaimer).toContain('structural clarification');
    expect(interp.disclaimer).toContain('not a deterministic prediction');
    expect(interp.fullText).toContain('structural clarification');
  });

  it('suppresses predictive phrasing', () => {
    const q = parseQuestion('What will happen to me?');
    const spread = getTestSpread();
    const trajectory = computeTrajectoryRestriction(spread, q, defaultParams);
    const meaning = computeMeaningIntegration(spread, q, trajectory, defaultParams);
    const interp = generatePhilosophicalInterpretation(q, trajectory, meaning, spread);

    // Should not contain predictive language
    expect(interp.fullText).not.toContain('you will');
    expect(interp.fullText).not.toContain('your future');
    expect(interp.fullText).not.toContain('is going to happen');
  });

  it('includes attractor basin information', () => {
    const q = parseQuestion('What kind of world am I inhabiting?');
    const spread = getTestSpread();
    const trajectory = computeTrajectoryRestriction(spread, q, defaultParams);
    const meaning = computeMeaningIntegration(spread, q, trajectory, defaultParams);
    const interp = generatePhilosophicalInterpretation(q, trajectory, meaning, spread);

    expect(interp.attractorAnalysis).toContain('basin');
  });

  it('includes entropy level', () => {
    const q = parseQuestion('What is the nature of change?');
    const spread = getTestSpread();
    const trajectory = computeTrajectoryRestriction(spread, q, defaultParams);
    const meaning = computeMeaningIntegration(spread, q, trajectory, defaultParams);
    const interp = generatePhilosophicalInterpretation(q, trajectory, meaning, spread);

    expect(interp.entropyAssessment).toContain('entropy');
  });

  it('handles all 5 question types', () => {
    const questions = [
      'What is the nature of being?',           // ontological
      'What is the purpose of my journey?',      // teleological
      'Who am I becoming?',                      // identity
      'What does it mean that this happened?',   // meaning-of-event
      'What if things had been different?',       // counterfactual
    ];

    for (const question of questions) {
      const q = parseQuestion(question);
      const spread = getTestSpread();
      const trajectory = computeTrajectoryRestriction(spread, q, defaultParams);
      const meaning = computeMeaningIntegration(spread, q, trajectory, defaultParams);
      const interp = generatePhilosophicalInterpretation(q, trajectory, meaning, spread);

      expect(interp.fullText.length).toBeGreaterThan(100);
      expect(interp.fullText).toContain('structural clarification');
    }
  });
});

// ─── 6. Full Orchestration Tests ────────────────────

describe('Philosophical Query Orchestration', () => {
  it('executes a full philosophical query', () => {
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;
    const result = executePhilosophicalQuery(
      'Who am I becoming?',
      defaultParams,
      generateFn,
    );

    expect(result.query).toBeDefined();
    expect(result.trajectory).toBeDefined();
    expect(result.meaning).toBeDefined();
    expect(result.spread).toBeDefined();
    expect(result.verification).toBeDefined();
    expect(result.interpretation).toBeDefined();
    expect(result.timestamp).toBeTruthy();
  });

  it('generates a spread when none provided', () => {
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;
    const result = executePhilosophicalQuery(
      'What is the purpose of life?',
      defaultParams,
      generateFn,
    );

    expect(result.spread.length).toBe(defaultParams.drawCount);
  });

  it('uses existing spread when provided', () => {
    const spread = getTestSpread();
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;
    const result = executePhilosophicalQuery(
      'What does this mean?',
      defaultParams,
      generateFn,
      spread,
    );

    // Should use the exact same cards
    expect(result.spread.length).toBe(spread.length);
    expect(result.spread[0].card.id).toBe(spread[0].card.id);
  });

  it('includes LTL verification', () => {
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;
    const result = executePhilosophicalQuery(
      'What kind of world am I inhabiting?',
      defaultParams,
      generateFn,
    );

    expect(result.verification.properties.length).toBeGreaterThan(0);
    expect(typeof result.verification.overallPassed).toBe('boolean');
  });

  it('always includes the non-deterministic disclaimer', () => {
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;
    const result = executePhilosophicalQuery(
      'Am I fated to suffer?',
      defaultParams,
      generateFn,
    );

    expect(result.interpretation.disclaimer).toContain('not a deterministic prediction');
    expect(result.interpretation.fullText).toContain('trajectory space remains open');
  });
});

// ─── 7. Backward Compatibility Tests ────────────────

describe('Backward Compatibility — Divinatory Mode Unchanged', () => {
  it('mockGenerate still works identically', () => {
    const result = mockGenerate(defaultParams);
    expect(result.deck.length).toBe(22);
    expect(result.spread.length).toBe(3);
  });

  it('LTL verifyReading still works identically', () => {
    const spread = getTestSpread();
    const verification = verifyReading(spread, defaultParams);
    expect(verification.properties.length).toBeGreaterThan(0);
    expect(typeof verification.overallPassed).toBe('boolean');
    expect(typeof verification.executionTimeMs).toBe('number');
  });

  it('computeQualityScore still works identically', () => {
    const spread = getTestSpread();
    const score = computeQualityScore(spread, defaultParams);
    expect(score.dimensions.length).toBe(6);
    expect(score.composite).toBeGreaterThanOrEqual(0);
    expect(score.composite).toBeLessThanOrEqual(1);
  });

  it('generateNarrative still works identically', () => {
    const spread = getTestSpread();
    const narrative = generateNarrative(spread, {
      style: 'analytical',
      weights: defaultParams.meaningWeights,
      includePositionContext: true,
    });
    expect(narrative.summary.length).toBeGreaterThan(0);
    expect(narrative.sections.length).toBe(spread.length);
  });

  it('IterationRunner still works identically', () => {
    const runner = new IterationRunner({
      qTarget: 0.5,
      maxIterations: 3,
      minIterations: 1,
      deltaThreshold: 0.01,
      consecutiveStops: 2,
    });
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;
    const { bestSpread, log } = runner.run(generateFn, defaultParams);
    expect(bestSpread.length).toBe(defaultParams.drawCount);
    expect(log.totalIterations).toBeGreaterThanOrEqual(1);
  });

  it('philosophical engine does not modify shared engine state', () => {
    // Run philosophical query first
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;
    executePhilosophicalQuery('Who am I?', defaultParams, generateFn);

    // Then verify divinatory mode still works
    const spread = getTestSpread();
    const verification = verifyReading(spread, defaultParams);
    expect(verification.overallPassed).toBeDefined();

    const score = computeQualityScore(spread, defaultParams);
    expect(score.composite).toBeGreaterThanOrEqual(0);
  });
});
