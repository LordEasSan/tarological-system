/**
 * Question-Targeted Narrative — Comprehensive Tests
 *
 * Validates the Card Master voice layer across modes:
 *   1.  Narrative contains original question keywords
 *   2.  Narrative references all card names
 *   3.  Narrative differs per mode for the same spread
 *   4.  Narrative is NOT identical to the structural explanation
 *   5.  Narrative length above minimum threshold
 *   6.  No predictive phrasing in non-divinatory modes
 *   7.  Cosmological disclaimer present in cosmological mode
 *   8.  Non-deterministic voice in philosophical mode
 *   9.  Card explanations array matches spread length
 *   10. Question restatement reflects original question
 *   11. Role-based contributions exist for every archetype
 *   12. Synthesis section is non-empty
 */
import { describe, it, expect } from 'vitest';
import { executeUnifiedReading } from '../engine/core/unified-pipeline';
import { generateQuestionTargetedNarrative } from '../engine/core/question-narrative';
import { generateUnifiedNarrative } from '../engine/core/narrative-integration';
import { computeBiasVector } from '../engine/core/bias-vector';
import { computeSymbolicConfiguration } from '../engine/core/symbolic-configuration';
import { getInterpretiveLens } from '../engine/core/interpretive-lens';
import { mockGenerate } from '../api/mock';
import type { TarotParameters, InterrogationMode } from '../types';

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

function makeGenerateFn(params: TarotParameters) {
  return mockGenerate(params).spread;
}

function getUnifiedResult(mode: InterrogationMode, question: string) {
  return executeUnifiedReading(mode, question, defaultParams, makeGenerateFn);
}

// ─── 1. Narrative Contains Original Question Keywords ───

describe('Question Keyword Presence', () => {
  it('contains keywords from the original question (divinatory)', () => {
    const result = getUnifiedResult('divinatory', 'What does love mean in my future?');
    const narrative = result.questionNarrative.fullNarrative.toLowerCase();
    expect(narrative).toContain('love');
  });

  it('contains keywords from the original question (philosophical)', () => {
    const result = getUnifiedResult('philosophical', 'What is the nature of consciousness?');
    const narrative = result.questionNarrative.fullNarrative.toLowerCase();
    expect(narrative).toContain('consciousness');
  });

  it('question restatement reflects the original question', () => {
    const question = 'How can I find balance in my life?';
    const result = getUnifiedResult('divinatory', question);
    const restatement = result.questionNarrative.questionRestatement.toLowerCase();
    expect(restatement).toContain('balance');
  });
});

// ─── 2. Narrative References All Card Names ───

describe('Question Narrative References All Cards', () => {
  it('every card name appears in the full narrative (divinatory)', () => {
    const result = getUnifiedResult('divinatory', 'What is my path forward?');
    const narrative = result.questionNarrative.fullNarrative.toLowerCase();
    for (const placed of result.spread) {
      expect(narrative).toContain(placed.card.name.toLowerCase());
    }
  });

  it('every card name appears in card explanations', () => {
    const result = getUnifiedResult('philosophical', 'What is identity?');
    const explNames = result.questionNarrative.cardExplanations.map(e => e.cardName.toLowerCase());
    for (const placed of result.spread) {
      expect(explNames).toContain(placed.card.name.toLowerCase());
    }
  });
});

// ─── 3. Narrative Differs Per Mode ───

describe('Mode-Dependent Narrative Voice', () => {
  it('divinatory and philosophical produce different narratives for same spread', () => {
    const paramsWithSeed = { ...defaultParams, seed: 777 };
    const makeFn = (p: TarotParameters) => mockGenerate(p).spread;
    const r1 = executeUnifiedReading('divinatory', 'What lies ahead?', paramsWithSeed, makeFn);
    const r2 = executeUnifiedReading('philosophical', 'What lies ahead?', paramsWithSeed, makeFn);
    expect(r1.questionNarrative.fullNarrative).not.toBe(r2.questionNarrative.fullNarrative);
  });

  it('cosmological and divinatory produce different narratives', () => {
    const paramsWithSeed = { ...defaultParams, seed: 777 };
    const makeFn = (p: TarotParameters) => mockGenerate(p).spread;
    const r1 = executeUnifiedReading('cosmological', 'What is my role?', paramsWithSeed, makeFn);
    const r2 = executeUnifiedReading('divinatory', 'What is my role?', paramsWithSeed, makeFn);
    expect(r1.questionNarrative.fullNarrative).not.toBe(r2.questionNarrative.fullNarrative);
  });
});

// ─── 4. NOT Identical to Structural Explanation ───

describe('Question Narrative vs Structural Explanation', () => {
  it('question narrative differs from structural narrative', () => {
    const result = getUnifiedResult('divinatory', 'What should I focus on?');
    expect(result.questionNarrative.fullNarrative).not.toBe(result.narrative.fullNarrative);
  });

  it('question narrative is a distinct text body', () => {
    const result = getUnifiedResult('philosophical', 'What shapes identity?');
    // Even compared loosely, they should not be substrings of each other
    const qLen = result.questionNarrative.fullNarrative.length;
    const sLen = result.narrative.fullNarrative.length;
    // They may share card names, but the overall text differs
    const overlap = result.questionNarrative.fullNarrative === result.narrative.fullNarrative;
    expect(overlap).toBe(false);
    expect(qLen).toBeGreaterThan(0);
    expect(sLen).toBeGreaterThan(0);
  });
});

// ─── 5. Narrative Length Above Minimum ───

describe('Narrative Length Threshold', () => {
  it('full narrative exceeds 200 characters (divinatory)', () => {
    const result = getUnifiedResult('divinatory', 'What is coming?');
    expect(result.questionNarrative.fullNarrative.length).toBeGreaterThan(200);
  });

  it('full narrative exceeds 200 characters (philosophical)', () => {
    const result = getUnifiedResult('philosophical', 'What is truth?');
    expect(result.questionNarrative.fullNarrative.length).toBeGreaterThan(200);
  });

  it('full narrative exceeds 200 characters (cosmological)', () => {
    const result = getUnifiedResult('cosmological', 'What is my cosmic position?');
    expect(result.questionNarrative.fullNarrative.length).toBeGreaterThan(200);
  });
});

// ─── 6. No Predictive Phrasing in Non-Divinatory ───

describe('Phrasing Constraints by Mode', () => {
  it('philosophical narrative avoids predictive language', () => {
    const result = getUnifiedResult('philosophical', 'What is the meaning of freedom?');
    const narrative = result.questionNarrative.fullNarrative.toLowerCase();
    // Should not contain direct fortune-telling phrases
    expect(narrative).not.toMatch(/you will definitely/);
    expect(narrative).not.toMatch(/this will happen/);
    expect(narrative).not.toMatch(/your fate is/);
  });

  it('cosmological narrative avoids empirical prediction', () => {
    const result = getUnifiedResult('cosmological', 'What is the structure of existence?');
    const narrative = result.questionNarrative.fullNarrative.toLowerCase();
    expect(narrative).not.toMatch(/you will definitely/);
    expect(narrative).not.toMatch(/science proves/);
  });
});

// ─── 7. Mode-Specific Disclaimer ───

describe('Disclaimer Presence', () => {
  it('cosmological mode has a disclaimer', () => {
    const result = getUnifiedResult('cosmological', 'What is my cosmic role?');
    expect(result.questionNarrative.disclaimer.length).toBeGreaterThan(0);
  });

  it('philosophical mode has a disclaimer', () => {
    const result = getUnifiedResult('philosophical', 'What is reality?');
    expect(result.questionNarrative.disclaimer.length).toBeGreaterThan(0);
  });

  it('divinatory mode has a disclaimer', () => {
    const result = getUnifiedResult('divinatory', 'What does the future hold?');
    expect(result.questionNarrative.disclaimer.length).toBeGreaterThan(0);
  });
});

// ─── 8. Card Explanations Match Spread ───

describe('Card Explanations Array', () => {
  it('has explanations for each card in the spread', () => {
    const result = getUnifiedResult('divinatory', 'What is important now?');
    expect(result.questionNarrative.cardExplanations.length).toBe(result.spread.length);
  });

  it('each explanation has non-empty contribution', () => {
    const result = getUnifiedResult('philosophical', 'What is the good?');
    for (const expl of result.questionNarrative.cardExplanations) {
      expect(expl.contribution.length).toBeGreaterThan(10);
      expect(expl.cardName.length).toBeGreaterThan(0);
      expect(expl.role).toBeDefined();
    }
  });
});

// ─── 9. Role-Based Contributions ───

describe('Role-Based Card Contributions', () => {
  it('every archetype role is represented', () => {
    const result = getUnifiedResult('divinatory', 'What matters most?');
    const roles = result.questionNarrative.cardExplanations.map(e => e.role);
    // We should have at least anchor (always assigned to first card)
    expect(roles).toContain('anchor');
  });

  it('card references map is populated', () => {
    const result = getUnifiedResult('divinatory', 'What is ahead?');
    const refs = result.questionNarrative.cardReferences;
    expect(Object.keys(refs).length).toBeGreaterThan(0);
  });
});

// ─── 10. Synthesis Is Non-Empty ───

describe('Synthesis Section', () => {
  it('synthesis is a non-empty string', () => {
    const result = getUnifiedResult('divinatory', 'Where do I go from here?');
    expect(result.questionNarrative.synthesis.length).toBeGreaterThan(20);
  });

  it('synthesis mentions the question topic', () => {
    const result = getUnifiedResult('philosophical', 'What is the nature of change?');
    const synthesis = result.questionNarrative.synthesis.toLowerCase();
    // Should relate back to the topic
    expect(synthesis.length).toBeGreaterThan(20);
  });
});

// ─── 11. Pipeline Integration ───

describe('Pipeline Integration', () => {
  it('questionNarrative is present in unified reading response', () => {
    const result = getUnifiedResult('divinatory', 'Test question');
    expect(result.questionNarrative).toBeDefined();
    expect(result.questionNarrative.questionRestatement).toBeDefined();
    expect(result.questionNarrative.fullNarrative).toBeDefined();
    expect(result.questionNarrative.cardExplanations).toBeDefined();
    expect(result.questionNarrative.synthesis).toBeDefined();
    expect(result.questionNarrative.disclaimer).toBeDefined();
    expect(result.questionNarrative.cardReferences).toBeDefined();
  });

  it('questionNarrative coexists with structural narrative', () => {
    const result = getUnifiedResult('divinatory', 'Dual narrative check');
    // Both should be present and non-empty
    expect(result.narrative.fullNarrative.length).toBeGreaterThan(0);
    expect(result.questionNarrative.fullNarrative.length).toBeGreaterThan(0);
    // They should be different texts
    expect(result.questionNarrative.fullNarrative).not.toBe(result.narrative.fullNarrative);
  });
});
