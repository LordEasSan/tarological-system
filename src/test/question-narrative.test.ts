/**
 * Progressive Existential Narrative — Comprehensive Tests
 *
 * Validates:
 *   1.  Progressive accumulation: each step builds on previous
 *   2.  Narrative contains question keywords
 *   3.  Narrative references all card names
 *   4.  Narrative differs per mode for same spread
 *   5.  Narrative NOT identical to structural explanation
 *   6.  Narrative length above minimum threshold
 *   7.  No predictive phrasing in non-divinatory modes
 *   8.  No structural jargon in primary narrative
 *   9.  Cosmological disclaimer in cosmological mode
 *  10.  Progressive step count matches spread length
 *  11.  Each step introduces new content (no cloning)
 *  12.  Synthesis is non-empty and emergent
 *  13.  Card order affects meaning (progressive memory)
 *  14.  Smoke: "Who is the true friend?" — philosophical
 *  15.  Smoke: "How was the universe born?" — cosmological
 *  16.  Smoke: Arbitrary ontological — progressive coherence
 */
import { describe, it, expect } from 'vitest';
import { executeUnifiedReading } from '../engine/core/unified-pipeline';
import type { TarotParameters, InterrogationMode } from '../types';
import { mockGenerate } from '../api/mock';

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

function getResult(mode: InterrogationMode, question: string, seed?: number) {
  const params = seed !== undefined ? { ...defaultParams, seed } : defaultParams;
  return executeUnifiedReading(mode, question, params, makeGenerateFn);
}

// ─── STRUCTURAL JARGON BLACKLIST ────────────────────
const STRUCTURAL_JARGON = [
  'topology',
  'attractor basin',
  'trajectory space',
  'entropic cluster',
  'liveness constraint',
  'existential topology',
  'trajectory catalyst',
  'configuration entropy',
  'structural ground',
  'attractor dynamics',
];

// ─── 1. Progressive Accumulation ────────────────────

describe('Progressive Accumulation', () => {
  it('generates progressive steps equal to spread length', () => {
    const r = getResult('philosophical', 'What is the meaning of freedom?');
    expect(r.questionNarrative.progressiveSteps.length).toBe(r.spread.length);
  });

  it('progressive steps have increasing depth', () => {
    const r = getResult('divinatory', 'What path should I take?');
    const depths = r.questionNarrative.progressiveSteps.map(s => s.depth);
    expect(depths).toEqual([1, 2, 3]);
  });

  it('each step has unique partialResponse (no cloning)', () => {
    const r = getResult('philosophical', 'What is identity?');
    const responses = r.questionNarrative.progressiveSteps.map(s => s.partialResponse);
    const unique = new Set(responses);
    expect(unique.size).toBe(responses.length);
  });

  it('later steps reference themes from earlier steps (cumulative insight)', () => {
    const r = getResult('philosophical', 'What is consciousness?');
    const steps = r.questionNarrative.progressiveSteps;
    // Step 2+ should have non-empty cumulativeInsight that differs from step 1
    if (steps.length >= 2) {
      expect(steps[1].cumulativeInsight).not.toBe(steps[0].cumulativeInsight);
      expect(steps[1].cumulativeInsight.length).toBeGreaterThan(
        steps[0].cumulativeInsight.length,
      );
    }
  });

  it('card order affects narrative content (progressive memory)', () => {
    // Two readings with same question, different seeds → different card order
    const r1 = getResult('philosophical', 'What is truth?', 42);
    const r2 = getResult('philosophical', 'What is truth?', 99);
    // If spreads differ, narratives must differ
    if (r1.spread[0].card.id !== r2.spread[0].card.id) {
      expect(r1.questionNarrative.fullNarrative).not.toBe(
        r2.questionNarrative.fullNarrative,
      );
    }
  });
});

// ─── 2. Question Keyword Presence ───────────────────

describe('Question Keyword Presence', () => {
  it('contains keywords from the question (philosophical)', () => {
    const r = getResult('philosophical', 'What is the nature of consciousness?');
    const narrative = r.questionNarrative.fullNarrative.toLowerCase();
    expect(narrative).toContain('consciousness');
  });

  it('contains keywords from the question (divinatory)', () => {
    const r = getResult('divinatory', 'What does love mean in my future?');
    const narrative = r.questionNarrative.fullNarrative.toLowerCase();
    expect(narrative).toContain('love');
  });

  it('question restatement reflects the original question', () => {
    const r = getResult('divinatory', 'How can I find balance?');
    const restatement = r.questionNarrative.questionRestatement.toLowerCase();
    expect(restatement).toContain('balance');
  });
});

// ─── 3. All Card Names Referenced ───────────────────

describe('Card Name References', () => {
  it('every card name appears in the full narrative (divinatory)', () => {
    const r = getResult('divinatory', 'What is my path?');
    const narrative = r.questionNarrative.fullNarrative.toLowerCase();
    for (const placed of r.spread) {
      expect(narrative).toContain(placed.card.name.toLowerCase());
    }
  });

  it('every card name appears in progressive steps', () => {
    const r = getResult('philosophical', 'What is identity?');
    const stepNames = r.questionNarrative.progressiveSteps.map(
      s => s.cardName.toLowerCase(),
    );
    for (const placed of r.spread) {
      expect(stepNames).toContain(placed.card.name.toLowerCase());
    }
  });
});

// ─── 4. Mode-Dependent Voice ────────────────────────

describe('Mode-Dependent Narrative Voice', () => {
  it('philosophical and divinatory produce different narratives', () => {
    const r1 = getResult('divinatory', 'What lies ahead?', 777);
    const r2 = getResult('philosophical', 'What lies ahead?', 777);
    expect(r1.questionNarrative.fullNarrative).not.toBe(
      r2.questionNarrative.fullNarrative,
    );
  });

  it('cosmological and divinatory produce different narratives', () => {
    const r1 = getResult('cosmological', 'What is my role?', 777);
    const r2 = getResult('divinatory', 'What is my role?', 777);
    expect(r1.questionNarrative.fullNarrative).not.toBe(
      r2.questionNarrative.fullNarrative,
    );
  });
});

// ─── 5. Not Identical to Structural Explanation ─────

describe('Progressive vs Structural Explanation', () => {
  it('question narrative differs from structural narrative', () => {
    const r = getResult('divinatory', 'What should I focus on?');
    expect(r.questionNarrative.fullNarrative).not.toBe(
      r.narrative.fullNarrative,
    );
  });
});

// ─── 6. Narrative Length ────────────────────────────

describe('Narrative Length', () => {
  it('exceeds 200 chars (divinatory)', () => {
    const r = getResult('divinatory', 'What is coming?');
    expect(r.questionNarrative.fullNarrative.length).toBeGreaterThan(200);
  });

  it('exceeds 200 chars (philosophical)', () => {
    const r = getResult('philosophical', 'What is truth?');
    expect(r.questionNarrative.fullNarrative.length).toBeGreaterThan(200);
  });

  it('exceeds 200 chars (cosmological)', () => {
    const r = getResult('cosmological', 'What is my cosmic position?');
    expect(r.questionNarrative.fullNarrative.length).toBeGreaterThan(200);
  });
});

// ─── 7. No Predictive Phrasing ──────────────────────

describe('Phrasing Constraints', () => {
  it('philosophical avoids predictive language', () => {
    const r = getResult('philosophical', 'What is freedom?');
    const n = r.questionNarrative.fullNarrative.toLowerCase();
    expect(n).not.toMatch(/you will definitely/);
    expect(n).not.toMatch(/this will happen/);
    expect(n).not.toMatch(/your fate is/);
  });

  it('cosmological avoids empirical prediction', () => {
    const r = getResult('cosmological', 'What is the structure of existence?');
    const n = r.questionNarrative.fullNarrative.toLowerCase();
    expect(n).not.toMatch(/science proves/);
    expect(n).not.toMatch(/empirically proven/);
  });
});

// ─── 8. No Structural Jargon in Primary Narrative ───

describe('No Structural Jargon', () => {
  it('philosophical narrative has no structural jargon', () => {
    const r = getResult('philosophical', 'What shapes identity?');
    const n = r.questionNarrative.fullNarrative.toLowerCase();
    for (const jargon of STRUCTURAL_JARGON) {
      expect(n).not.toContain(jargon);
    }
  });

  it('cosmological narrative has no structural jargon', () => {
    const r = getResult('cosmological', 'How does the cosmos unfold?');
    const n = r.questionNarrative.fullNarrative.toLowerCase();
    for (const jargon of STRUCTURAL_JARGON) {
      expect(n).not.toContain(jargon);
    }
  });

  it('divinatory narrative has no structural jargon', () => {
    const r = getResult('divinatory', 'What does the future hold?');
    const n = r.questionNarrative.fullNarrative.toLowerCase();
    for (const jargon of STRUCTURAL_JARGON) {
      expect(n).not.toContain(jargon);
    }
  });
});

// ─── 9. Disclaimer Presence ────────────────────────

describe('Disclaimer Presence', () => {
  it('cosmological mode has a disclaimer without empirical claims', () => {
    const r = getResult('cosmological', 'What is the origin?');
    expect(r.questionNarrative.disclaimer.length).toBeGreaterThan(0);
    expect(r.questionNarrative.disclaimer.toLowerCase()).toContain('not');
  });

  it('philosophical disclaimer mentions clarification, not prediction', () => {
    const r = getResult('philosophical', 'What is reality?');
    const d = r.questionNarrative.disclaimer.toLowerCase();
    expect(d).toContain('clarification');
    expect(d).not.toContain('liveness');
    expect(d).not.toContain('trajectory space');
  });

  it('divinatory disclaimer present', () => {
    const r = getResult('divinatory', 'What awaits?');
    expect(r.questionNarrative.disclaimer.length).toBeGreaterThan(0);
  });
});

// ─── 10. Synthesis ─────────────────────────────────

describe('Emergent Synthesis', () => {
  it('synthesis is non-empty and substantial', () => {
    const r = getResult('divinatory', 'Where do I go from here?');
    expect(r.questionNarrative.synthesis.length).toBeGreaterThan(30);
  });

  it('synthesis mentions card names', () => {
    const r = getResult('philosophical', 'What is the good?');
    const syn = r.questionNarrative.synthesis.toLowerCase();
    const someCardMentioned = r.spread.some(p =>
      syn.includes(p.card.name.toLowerCase()),
    );
    expect(someCardMentioned).toBe(true);
  });

  it('synthesis differs from any single progressive step', () => {
    const r = getResult('philosophical', 'What is change?');
    for (const step of r.questionNarrative.progressiveSteps) {
      expect(r.questionNarrative.synthesis).not.toBe(step.partialResponse);
    }
  });
});

// ─── 11. No Duplicated Content ──────────────────────

describe('No Duplicated Content', () => {
  it('no two progressive steps share the same opening sentence', () => {
    const r = getResult('philosophical', 'What is being?');
    const openings = r.questionNarrative.progressiveSteps.map(
      s => s.partialResponse.split('.')[0],
    );
    const unique = new Set(openings);
    expect(unique.size).toBe(openings.length);
  });

  it('full narrative does not repeat any paragraph verbatim', () => {
    const r = getResult('divinatory', 'What matters?');
    const paragraphs = r.questionNarrative.fullNarrative
      .split('\n\n')
      .filter(p => p.trim().length > 20);
    const unique = new Set(paragraphs);
    expect(unique.size).toBe(paragraphs.length);
  });
});

// ─── 12. Pipeline Integration ───────────────────────

describe('Pipeline Integration', () => {
  it('questionNarrative is present with all required fields', () => {
    const r = getResult('divinatory', 'Test question');
    expect(r.questionNarrative).toBeDefined();
    expect(r.questionNarrative.questionRestatement).toBeDefined();
    expect(r.questionNarrative.progressiveSteps).toBeDefined();
    expect(r.questionNarrative.cardExplanations).toBeDefined();
    expect(r.questionNarrative.synthesis).toBeDefined();
    expect(r.questionNarrative.disclaimer).toBeDefined();
    expect(r.questionNarrative.cardReferences).toBeDefined();
    expect(r.questionNarrative.fullNarrative).toBeDefined();
  });

  it('questionNarrative coexists with structural narrative', () => {
    const r = getResult('divinatory', 'Dual narrative check');
    expect(r.narrative.fullNarrative.length).toBeGreaterThan(0);
    expect(r.questionNarrative.fullNarrative.length).toBeGreaterThan(0);
    expect(r.questionNarrative.fullNarrative).not.toBe(
      r.narrative.fullNarrative,
    );
  });
});

// ─── 13. SMOKE TESTS ───────────────────────────────

describe('Smoke Test 1: "Who is the true friend?" — philosophical', () => {
  const r = getResult('philosophical', 'Who is the true friend?');

  it('produces a coherent existential response', () => {
    expect(r.questionNarrative.fullNarrative.length).toBeGreaterThan(300);
  });

  it('contains the word "friend" in the narrative', () => {
    expect(r.questionNarrative.fullNarrative.toLowerCase()).toContain('friend');
  });

  it('has progressive steps that deepen sequentially', () => {
    const steps = r.questionNarrative.progressiveSteps;
    expect(steps.length).toBe(3);
    // Each step's cumulative insight should grow
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].cumulativeInsight.length).toBeGreaterThan(
        steps[i - 1].cumulativeInsight.length,
      );
    }
  });

  it('has no structural jargon', () => {
    const n = r.questionNarrative.fullNarrative.toLowerCase();
    for (const jargon of STRUCTURAL_JARGON) {
      expect(n).not.toContain(jargon);
    }
  });

  it('synthesis resolves or reframes the question', () => {
    expect(r.questionNarrative.synthesis.length).toBeGreaterThan(30);
  });
});

describe('Smoke Test 2: "How was the universe born?" — cosmological', () => {
  const r = getResult('cosmological', 'How was the universe born?');

  it('produces a symbolic cosmogonic unfolding', () => {
    expect(r.questionNarrative.fullNarrative.length).toBeGreaterThan(300);
  });

  it('contains the word "universe" or "cosmos" in narrative', () => {
    const n = r.questionNarrative.fullNarrative.toLowerCase();
    expect(n.includes('universe') || n.includes('cosmos')).toBe(true);
  });

  it('uses mythic/archetypal language, not structural', () => {
    const n = r.questionNarrative.fullNarrative.toLowerCase();
    // Should contain mythic language
    const mythicTerms = ['symbol', 'archetype', 'force', 'myth'];
    const hasMythic = mythicTerms.some(t => n.includes(t));
    expect(hasMythic).toBe(true);

    // Should not contain structural jargon
    for (const jargon of STRUCTURAL_JARGON) {
      expect(n).not.toContain(jargon);
    }
  });

  it('progressive steps show cosmogonic deepening', () => {
    const steps = r.questionNarrative.progressiveSteps;
    expect(steps.length).toBe(3);
    // Each step should be unique
    const unique = new Set(steps.map(s => s.partialResponse));
    expect(unique.size).toBe(3);
  });
});

describe('Smoke Test 3: Arbitrary ontological — progressive coherence', () => {
  const r = getResult('philosophical', 'What makes something real?', 123);

  it('produces coherent progressive deepening', () => {
    const steps = r.questionNarrative.progressiveSteps;
    expect(steps.length).toBeGreaterThan(0);

    // All steps non-empty
    for (const step of steps) {
      expect(step.partialResponse.length).toBeGreaterThan(50);
    }

    // Synthesis non-empty
    expect(r.questionNarrative.synthesis.length).toBeGreaterThan(30);
  });

  it('the word "real" appears in the narrative', () => {
    expect(r.questionNarrative.fullNarrative.toLowerCase()).toContain('real');
  });

  it('no duplication across steps', () => {
    const firstSentences = r.questionNarrative.progressiveSteps.map(
      s => s.partialResponse.split('.')[0],
    );
    const unique = new Set(firstSentences);
    expect(unique.size).toBe(firstSentences.length);
  });

  it('synthesis references the full configuration', () => {
    const syn = r.questionNarrative.synthesis.toLowerCase();
    // At least one card name appears in synthesis
    const someCard = r.spread.some(p =>
      syn.includes(p.card.name.toLowerCase()),
    );
    expect(someCard).toBe(true);
  });
});
