/**
 * Cosmological Engine — Comprehensive Tests
 *
 * Tests the full cosmological / universal archetypal query pipeline:
 *   1. Question scope detection (personal pronouns, decision language)
 *   2. Question classification
 *   3. Question parsing → Qᵤ = (Cᵤ, Φᵤ, Δᵤ)
 *   4. Archetypal configuration mapping ΨQᵤ
 *   5. Response generation (symbolic model)
 *   6. Full orchestration
 *   7. Safeguards (no empirical claims, no predictions, disclaimer)
 *   8. Backward compatibility (divinatory + philosophical untouched)
 */
import { describe, it, expect } from 'vitest';
import {
  parseCosmologicalQuestion,
  classifyCosmologicalQuestion,
  isCosmologicalScope,
  hasPersonalPronouns,
  hasDecisionLanguage,
} from '../engine/cosmological/question-parser';
import { computeArchetypalConfiguration } from '../engine/cosmological/configuration';
import { generateCosmologicalInterpretation } from '../engine/cosmological/response-generator';
import { executeCosmologicalQuery } from '../engine/cosmological/orchestrator';
import { mockGenerate } from '../api/mock';
import { verifyReading } from '../engine/ltl';
import { computeQualityScore } from '../engine/scoring';
import { executePhilosophicalQuery } from '../engine/philosophical/orchestrator';
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

// ─── 1. Personal Pronoun & Decision Detection ───────

describe('Cosmological Scope Detection', () => {
  it('detects personal pronouns', () => {
    expect(hasPersonalPronouns('Who am I becoming?')).toBe(true);
    expect(hasPersonalPronouns('What should I do?')).toBe(true);
    expect(hasPersonalPronouns('Where am I heading?')).toBe(true);
    expect(hasPersonalPronouns('What is my purpose?')).toBe(true);
  });

  it('does not flag universal questions as personal', () => {
    expect(hasPersonalPronouns('How did the universe emerge?')).toBe(false);
    expect(hasPersonalPronouns('What is the nature of love?')).toBe(false);
    expect(hasPersonalPronouns('What is consciousness?')).toBe(false);
    expect(hasPersonalPronouns('What is the symbolic logic of creation?')).toBe(false);
  });

  it('detects decision-seeking language', () => {
    expect(hasDecisionLanguage('Should I take this job?')).toBe(true);
    expect(hasDecisionLanguage('What should I choose?')).toBe(true);
    expect(hasDecisionLanguage('Help me decide')).toBe(true);
  });

  it('does not flag non-decision questions', () => {
    expect(hasDecisionLanguage('What is the structure of reality?')).toBe(false);
    expect(hasDecisionLanguage('How did the universe emerge?')).toBe(false);
  });

  it('isCosmologicalScope returns true for universal questions', () => {
    expect(isCosmologicalScope('How did the universe emerge?')).toBe(true);
    expect(isCosmologicalScope('What is the nature of love?')).toBe(true);
    expect(isCosmologicalScope('What is the structure of consciousness?')).toBe(true);
  });

  it('isCosmologicalScope returns false for personal questions', () => {
    expect(isCosmologicalScope('Who am I becoming?')).toBe(false);
    expect(isCosmologicalScope('What does it mean that this happened to me?')).toBe(false);
    expect(isCosmologicalScope('Should I change my career?')).toBe(false);
  });
});

// ─── 2. Question Classification ─────────────────────

describe('Cosmological Question Classification', () => {
  it('classifies cosmogonic questions', () => {
    expect(classifyCosmologicalQuestion('How did the universe emerge?').type).toBe('cosmogonic');
    expect(classifyCosmologicalQuestion('What is the origin of the cosmos?').type).toBe('cosmogonic');
  });

  it('classifies consciousness questions', () => {
    expect(classifyCosmologicalQuestion('What is the structure of consciousness?').type).toBe('consciousness');
    expect(classifyCosmologicalQuestion('What is the nature of awareness?').type).toBe('consciousness');
  });

  it('classifies symbolic-logic questions', () => {
    expect(classifyCosmologicalQuestion('What is the symbolic logic of creation?').type).toBe('symbolic-logic');
    expect(classifyCosmologicalQuestion('What are the laws of the universe?').type).toBe('symbolic-logic');
  });

  it('classifies archetypal-essence questions', () => {
    expect(classifyCosmologicalQuestion('What is the archetypal structure of love?').type).toBe('archetypal-essence');
    expect(classifyCosmologicalQuestion('What is the essence of beauty?').type).toBe('archetypal-essence');
  });

  it('classifies structural-universal questions', () => {
    expect(classifyCosmologicalQuestion('What is the structure of reality?').type).toBe('structural-universal');
    expect(classifyCosmologicalQuestion('What is the fundamental structure of the universe?').type).toBe('structural-universal');
  });
});

// ─── 3. Question Parsing ────────────────────────────

describe('Cosmological Question Parsing — Qᵤ = (Cᵤ, Φᵤ, Δᵤ)', () => {
  it('produces a valid CosmologicalQuery', () => {
    const q = parseCosmologicalQuestion('How did the universe emerge?');
    expect(q.rawQuestion).toBe('How did the universe emerge?');
    expect(q.questionType).toBeDefined();
    expect(q.embedding).toBeDefined();
    expect(q.temporalLogic).toBeDefined();
    expect(q.configurationOpenness).toBeGreaterThanOrEqual(0);
    expect(q.configurationOpenness).toBeLessThanOrEqual(1);
  });

  it('embedding has dimension weights and archetype affinities', () => {
    const q = parseCosmologicalQuestion('What is the nature of love?');
    expect(q.embedding.dimensionWeights).toBeDefined();
    expect(q.embedding.archetypeAffinities).toBeDefined();
    expect(q.embedding.entropy).toBeGreaterThanOrEqual(0);
    expect(q.embedding.entropy).toBeLessThanOrEqual(1);
  });

  it('detects domain nouns', () => {
    const q = parseCosmologicalQuestion('What is the structure of consciousness and love?');
    expect(q.embedding.domainNouns).toContain('consciousness');
    expect(q.embedding.domainNouns).toContain('love');
  });

  it('temporal logic has valid scope and operator', () => {
    const q = parseCosmologicalQuestion('How did the universe emerge?');
    expect(['G', 'F', 'GF', 'FG']).toContain(q.temporalLogic.operator);
    expect(['universal', 'atemporal', 'cyclic']).toContain(q.temporalLogic.scope);
  });
});

// ─── 4. Archetypal Configuration Mapping ────────────

describe('Archetypal Configuration — ΨQᵤ', () => {
  it('produces forces, emergence order, and polarity sequences', () => {
    const spread = getTestSpread();
    const query = parseCosmologicalQuestion('How did the universe emerge?');
    const config = computeArchetypalConfiguration(spread, query, defaultParams);

    expect(config.forces.length).toBe(spread.length);
    expect(config.emergenceOrder.length).toBeGreaterThan(0);
    expect(config.polaritySequences.length).toBeGreaterThan(0);
    expect(config.systemEntropy).toBeGreaterThanOrEqual(0);
    expect(config.systemEntropy).toBeLessThanOrEqual(1);
    expect(config.configurationSummary.length).toBeGreaterThan(0);
  });

  it('forces have valid roles', () => {
    const spread = getTestSpread();
    const query = parseCosmologicalQuestion('What is consciousness?');
    const config = computeArchetypalConfiguration(spread, query, defaultParams);

    const validRoles = ['generative', 'structuring', 'dissolving', 'synthesising'];
    for (const force of config.forces) {
      expect(validRoles).toContain(force.role);
      expect(force.weight).toBeGreaterThanOrEqual(0);
      expect(force.weight).toBeLessThanOrEqual(1);
    }
  });

  it('forces are sorted by weight descending', () => {
    const spread = getTestSpread();
    const query = parseCosmologicalQuestion('What is the symbolic logic of creation?');
    const config = computeArchetypalConfiguration(spread, query, defaultParams);

    for (let i = 1; i < config.forces.length; i++) {
      expect(config.forces[i].weight).toBeLessThanOrEqual(config.forces[i - 1].weight);
    }
  });

  it('polarity sequences have positive/negative/synthesis', () => {
    const spread = getTestSpread();
    const query = parseCosmologicalQuestion('What is the nature of love?');
    const config = computeArchetypalConfiguration(spread, query, defaultParams);

    for (const seq of config.polaritySequences) {
      expect(seq.positive).toBeDefined();
      expect(seq.negative).toBeDefined();
      expect(seq.synthesis).toBeDefined();
    }
  });
});

// ─── 5. Response Generation ─────────────────────────

describe('Cosmological Response Generation', () => {
  function getFullAnalysis() {
    const spread = getTestSpread();
    const query = parseCosmologicalQuestion('How did the universe emerge?');
    const config = computeArchetypalConfiguration(spread, query, defaultParams);
    return { spread, query, config };
  }

  it('generates all interpretation sections', () => {
    const { spread, query, config } = getFullAnalysis();
    const interp = generateCosmologicalInterpretation(query, config, spread);

    expect(interp.symbolicModel.length).toBeGreaterThan(0);
    expect(interp.archetypalMap.length).toBeGreaterThan(0);
    expect(interp.polarityAnalysis.length).toBeGreaterThan(0);
    expect(interp.entropyAssessment.length).toBeGreaterThan(0);
    expect(interp.disclaimer.length).toBeGreaterThan(0);
    expect(interp.fullText.length).toBeGreaterThan(100);
  });

  it('contains the symbolic-archetypal disclaimer', () => {
    const { spread, query, config } = getFullAnalysis();
    const interp = generateCosmologicalInterpretation(query, config, spread);

    expect(interp.disclaimer).toContain(
      'symbolic-archetypal representation, not a scientific explanation',
    );
    expect(interp.fullText).toContain(
      'symbolic-archetypal representation, not a scientific explanation',
    );
  });

  it('does NOT contain empirical or predictive language', () => {
    const { spread, query, config } = getFullAnalysis();
    const interp = generateCosmologicalInterpretation(query, config, spread);

    const forbidden = [
      'scientifically proven', 'science shows', 'empirically', 'will happen',
      'you will', 'destined to', 'fated to', 'prophetic',
      'it is certain', 'guaranteed',
    ];
    const fullLower = interp.fullText.toLowerCase();
    for (const phrase of forbidden) {
      expect(fullLower).not.toContain(phrase);
    }
  });

  it('references card names from the spread', () => {
    const { spread, query, config } = getFullAnalysis();
    const interp = generateCosmologicalInterpretation(query, config, spread);

    const cardNames = spread.map(p => p.card.name);
    const anyReferenced = cardNames.some(name => interp.fullText.includes(name));
    expect(anyReferenced).toBe(true);
  });

  it('interprets cards as archetypal forces, not events', () => {
    const { spread, query, config } = getFullAnalysis();
    const interp = generateCosmologicalInterpretation(query, config, spread);

    // Should contain force-related terms
    const forceTerms = ['force', 'archetype', 'symbolic', 'emergence'];
    const fullLower = interp.fullText.toLowerCase();
    const hasForceTerms = forceTerms.some(t => fullLower.includes(t));
    expect(hasForceTerms).toBe(true);

    // Should not contain personal-event terms
    const personalTerms = ['your life', 'your future', 'your relationship', 'you should'];
    for (const term of personalTerms) {
      expect(fullLower).not.toContain(term);
    }
  });
});

// ─── 6. Full Orchestration ──────────────────────────

describe('Cosmological Query Orchestration', () => {
  it('executes complete pipeline and returns valid response', () => {
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;
    const result = executeCosmologicalQuery(
      'What is the symbolic logic of creation?',
      defaultParams,
      generateFn,
    );

    expect(result.query).toBeDefined();
    expect(result.configuration).toBeDefined();
    expect(result.spread.length).toBe(defaultParams.drawCount);
    expect(result.verification).toBeDefined();
    expect(result.interpretation).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it('works with all 5 question types', () => {
    const questions = [
      'How did the universe emerge?',
      'What is the structure of reality?',
      'What is the archetypal structure of love?',
      'What is the symbolic logic of creation?',
      'What is the structure of consciousness?',
    ];
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;

    for (const q of questions) {
      const result = executeCosmologicalQuery(q, defaultParams, generateFn);
      expect(result.interpretation.fullText.length).toBeGreaterThan(100);
      expect(result.configuration.forces.length).toBe(defaultParams.drawCount);
      expect(result.interpretation.disclaimer).toContain('symbolic-archetypal representation');
    }
  });

  it('accepts an existing spread', () => {
    const spread = getTestSpread();
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;
    const result = executeCosmologicalQuery(
      'What is the nature of time?',
      defaultParams,
      generateFn,
      spread,
    );
    expect(result.spread).toBe(spread);
  });
});

// ─── 7. Backward Compatibility ──────────────────────

describe('Backward Compatibility — Other Modes Unchanged', () => {
  it('divinatory mode still works', () => {
    const spread = getTestSpread();
    const verification = verifyReading(spread, defaultParams);
    expect(verification.overallPassed).toBeDefined();

    const score = computeQualityScore(spread, defaultParams);
    expect(score.composite).toBeGreaterThanOrEqual(0);
  });

  it('philosophical mode still works', () => {
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;
    const result = executePhilosophicalQuery('Who am I becoming?', defaultParams, generateFn);
    expect(result.interpretation.fullText.length).toBeGreaterThan(100);
    expect(result.trajectory.attractors.length).toBeGreaterThan(0);
  });

  it('cosmological engine does not modify shared engine state', () => {
    const generateFn = (p: TarotParameters) => mockGenerate(p).spread;

    // Run cosmological query
    executeCosmologicalQuery('What is the nature of love?', defaultParams, generateFn);

    // Verify divinatory still works
    const spread = getTestSpread();
    const verification = verifyReading(spread, defaultParams);
    expect(verification.overallPassed).toBeDefined();

    // Verify philosophical still works
    const philResult = executePhilosophicalQuery('Who am I?', defaultParams, generateFn);
    expect(philResult.interpretation.fullText.length).toBeGreaterThan(0);
  });
});
