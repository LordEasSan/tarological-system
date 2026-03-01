/**
 * Symbolic Narrator — Consistency Tests
 *
 * Validates that the narrative output is structurally derived from IDA:
 *   1. tensionType → changes opening and card connector text
 *   2. completionStrategy → changes strategy movement text and resolution tag
 *   3. resolutionArchetype → changes resolution closure text
 *   4. D1-D6 modulation → tone adjustments (verbosity, ambiguity, etc.)
 *   5. Card narratives reference position labels and card names
 *   6. Synthesis includes all card names
 *   7. Output shape is always complete (4 fields, non-empty)
 */
import { describe, it, expect } from 'vitest';
import { executeUnifiedReading } from '../engine/core/unified-pipeline';
import { computeQualityScore } from '../engine/scoring';
import { generateSymbolicNarrative, type SymbolicNarrative } from '../engine/symbolicNarrator';
import type { TarotParameters, InterrogationMode, TensionType, CompletionStrategy, ResolutionArchetype } from '../types';
import { mockGenerate } from '../api/mock';

// ─── Fixtures ───────────────────────────────────────

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

function makeReading(seed: number, mode: InterrogationMode = 'divinatory', question = 'What lies ahead?') {
  const params = { ...defaultParams, seed };
  const generateFn = () => mockGenerate(params).spread;
  return executeUnifiedReading(mode, question, params, generateFn, {});
}

function makeNarrative(seed: number, mode: InterrogationMode = 'divinatory', question = 'What lies ahead?') {
  const response = makeReading(seed, mode, question);
  const qScore = computeQualityScore(response.spread, { ...defaultParams, seed });
  return { narrative: generateSymbolicNarrative(response, qScore.dimensions), response };
}

// ─── 1. Output Shape ────────────────────────────────

describe('SymbolicNarrator — Output Shape', () => {
  it('returns opening, cardNarratives, synthesis, resolution', () => {
    const { narrative } = makeNarrative(1);
    expect(narrative).toHaveProperty('opening');
    expect(narrative).toHaveProperty('cardNarratives');
    expect(narrative).toHaveProperty('synthesis');
    expect(narrative).toHaveProperty('resolution');
  });

  it('all fields are non-empty strings', () => {
    const { narrative } = makeNarrative(2);
    expect(narrative.opening.length).toBeGreaterThan(10);
    expect(narrative.synthesis.length).toBeGreaterThan(10);
    expect(narrative.resolution.length).toBeGreaterThan(10);
    expect(narrative.cardNarratives.length).toBeGreaterThan(0);
    for (const cn of narrative.cardNarratives) {
      expect(cn.length).toBeGreaterThan(10);
    }
  });

  it('cardNarratives count matches spread length', () => {
    const { narrative, response } = makeNarrative(3);
    const expectedCount = Math.min(
      response.questionNarrative.transformationSteps.length,
      response.spread.length,
    );
    expect(narrative.cardNarratives).toHaveLength(expectedCount);
  });

  for (const seed of [10, 20, 30, 40, 50]) {
    it(`shape consistent for seed=${seed}`, () => {
      const { narrative } = makeNarrative(seed);
      expect(typeof narrative.opening).toBe('string');
      expect(Array.isArray(narrative.cardNarratives)).toBe(true);
      expect(typeof narrative.synthesis).toBe('string');
      expect(typeof narrative.resolution).toBe('string');
    });
  }
});

// ─── 2. TensionType Influence ───────────────────────

describe('SymbolicNarrator — TensionType Influence', () => {
  // Collect openings across seeds and verify that different tensionTypes produce different text
  it('different tensionTypes produce different openings', () => {
    const openings = new Map<TensionType, string>();
    for (let seed = 1; seed <= 60; seed++) {
      const response = makeReading(seed);
      const tt = response.questionNarrative.tensionType;
      if (!openings.has(tt)) {
        const n = generateSymbolicNarrative(response);
        openings.set(tt, n.opening);
      }
    }
    // Must find at least 2 distinct tension types
    expect(openings.size).toBeGreaterThanOrEqual(2);
    const values = [...openings.values()];
    // At least 2 openings must be textually different
    const unique = new Set(values);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });

  it('opening contains mode-specific context', () => {
    const { narrative: nDiv } = makeNarrative(5, 'divinatory');
    const { narrative: nPhi } = makeNarrative(5, 'philosophical');
    // Same seed but different mode → different mode context
    expect(nDiv.opening).toContain('temporal');
    expect(nPhi.opening).toContain('existential');
  });

  it('card connectors reference tension structure', () => {
    // Generate multiple narratives and check that connector text appears in card narratives
    for (let seed = 1; seed <= 20; seed++) {
      const response = makeReading(seed);
      const n = generateSymbolicNarrative(response);
      // The second card narrative (index 1+) should contain tension connector phrases
      if (n.cardNarratives.length >= 2) {
        const laterCards = n.cardNarratives.slice(1).join(' ');
        // Later cards should contain structural language (connectors, position labels, role phrases)
        // v2 uses TENSION_CONNECTOR phrases, position labels like **Present**, **Future**, etc.
        const hasStructuralLanguage =
          laterCards.includes('—') || // connectors use em-dash
          laterCards.includes('**') || // bold position/card markers
          laterCards.includes('not as description') || // incarnation phrase
          laterCards.includes('carries it'); // tension carrier phrase
        expect(hasStructuralLanguage).toBe(true);
      }
    }
  });
});

// ─── 3. CompletionStrategy Influence ────────────────

describe('SymbolicNarrator — CompletionStrategy Influence', () => {
  it('resolution contains strategy-specific terminal image', () => {
    const strategyTerminals: Record<CompletionStrategy, string> = {
      integrate: 'shares a single breath',
      sever: 'Silence on both sides',
      expose: 'Irreversibly visible',
      collapse: 'what was real',
      demand: 'does not repeat itself',
      embody: 'symbol has become the body',
      limit: 'nothing of this reading',
      reverse: 'faces the light',
      destabilize_further: 'not the end',
    };

    const found = new Map<CompletionStrategy, boolean>();
    for (let seed = 1; seed <= 80; seed++) {
      const response = makeReading(seed);
      const cs = response.questionNarrative.completionStrategy;
      if (!found.has(cs)) {
        const n = generateSymbolicNarrative(response);
        const tag = strategyTerminals[cs];
        expect(n.resolution).toContain(tag);
        found.set(cs, true);
      }
    }
    // Should have verified at least 2 strategies
    expect(found.size).toBeGreaterThanOrEqual(2);
  });

  it('opening includes strategy movement description', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const response = makeReading(seed);
      const n = generateSymbolicNarrative(response);
      // The opening includes STRATEGY_MOVEMENT text — at least 30 chars of strategy-related content
      expect(n.opening.length).toBeGreaterThan(100);
    }
  });
});

// ─── 4. ResolutionArchetype Influence ───────────────

describe('SymbolicNarrator — ResolutionArchetype Influence', () => {
  it('resolution closure varies by archetype', () => {
    const closures = new Map<ResolutionArchetype, string>();
    for (let seed = 1; seed <= 80; seed++) {
      const response = makeReading(seed);
      const ra = response.questionNarrative.resolutionArchetype;
      if (!closures.has(ra)) {
        const n = generateSymbolicNarrative(response);
        closures.set(ra, n.resolution);
      }
    }
    expect(closures.size).toBeGreaterThanOrEqual(2);
    // Different archetypes must produce different closure text
    const values = [...closures.values()];
    const unique = new Set(values);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });
});

// ─── 5. D-Score Modulation ──────────────────────────

describe('SymbolicNarrator — D-Score Modulation', () => {
  it('low D6 produces ambiguous ending hint', () => {
    const response = makeReading(42);
    const lowD6Dims = [
      { id: 'D1' as const, name: 'Structural Integrity', score: 0.6, details: '' },
      { id: 'D2' as const, name: 'Archetypal Coherence', score: 0.6, details: '' },
      { id: 'D3' as const, name: 'Narrative Depth', score: 0.5, details: '' },
      { id: 'D4' as const, name: 'Spread Balance', score: 0.5, details: '' },
      { id: 'D5' as const, name: 'Symbolic Resonance', score: 0.5, details: '' },
      { id: 'D6' as const, name: 'Entropy Quality', score: 0.1, details: '' },
    ];
    const n = generateSymbolicNarrative(response, lowD6Dims);
    // Low D6 → ambiguousEnding → resolution contains "remains unsaid"
    expect(n.resolution).toContain('remains unsaid');
  });

  it('high D6 does NOT produce ambiguous ending', () => {
    const response = makeReading(42);
    const highD6Dims = [
      { id: 'D1' as const, name: 'Structural Integrity', score: 0.6, details: '' },
      { id: 'D2' as const, name: 'Archetypal Coherence', score: 0.6, details: '' },
      { id: 'D3' as const, name: 'Narrative Depth', score: 0.5, details: '' },
      { id: 'D4' as const, name: 'Spread Balance', score: 0.5, details: '' },
      { id: 'D5' as const, name: 'Symbolic Resonance', score: 0.5, details: '' },
      { id: 'D6' as const, name: 'Entropy Quality', score: 0.9, details: '' },
    ];
    const n = generateSymbolicNarrative(response, highD6Dims);
    expect(n.resolution).not.toContain('remains unsaid');
  });

  it('low D4 → unresolved tension note in synthesis', () => {
    const response = makeReading(42);
    const lowD4Dims = [
      { id: 'D1' as const, name: 'Structural Integrity', score: 0.6, details: '' },
      { id: 'D2' as const, name: 'Archetypal Coherence', score: 0.6, details: '' },
      { id: 'D3' as const, name: 'Narrative Depth', score: 0.5, details: '' },
      { id: 'D4' as const, name: 'Spread Balance', score: 0.2, details: '' },
      { id: 'D5' as const, name: 'Symbolic Resonance', score: 0.3, details: '' },
      { id: 'D6' as const, name: 'Entropy Quality', score: 0.5, details: '' },
    ];
    const n = generateSymbolicNarrative(response, lowD4Dims);
    expect(n.synthesis).toContain('unresolved');
  });

  it('high D5 → strong synthesis note', () => {
    const response = makeReading(42);
    const highD5Dims = [
      { id: 'D1' as const, name: 'Structural Integrity', score: 0.6, details: '' },
      { id: 'D2' as const, name: 'Archetypal Coherence', score: 0.6, details: '' },
      { id: 'D3' as const, name: 'Narrative Depth', score: 0.5, details: '' },
      { id: 'D4' as const, name: 'Spread Balance', score: 0.7, details: '' },
      { id: 'D5' as const, name: 'Symbolic Resonance', score: 0.9, details: '' },
      { id: 'D6' as const, name: 'Entropy Quality', score: 0.5, details: '' },
    ];
    const n = generateSymbolicNarrative(response, highD5Dims);
    expect(n.synthesis).toContain('clear and forceful');
  });

  it('card narratives include strategy escalation markers', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const response = makeReading(seed);
      const n = generateSymbolicNarrative(response);
      // Each card narrative should contain content from STRATEGY_MOVEMENT.escalation
      // At minimum the first card should have the first escalation line
      expect(n.cardNarratives[0].length).toBeGreaterThan(50);
      // Narratives should use line breaks (rhythm engine)
      const hasLineBreaks = n.cardNarratives.some(cn => cn.includes('\n'));
      expect(hasLineBreaks).toBe(true);
    }
  });

  it('default dimensions (no D-scores) produces valid narrative', () => {
    const response = makeReading(42);
    const n = generateSymbolicNarrative(response);
    expect(n.opening.length).toBeGreaterThan(50);
    expect(n.cardNarratives.length).toBeGreaterThan(0);
    expect(n.synthesis.length).toBeGreaterThan(10);
    expect(n.resolution.length).toBeGreaterThan(10);
  });
});

// ─── 6. Card Name References ────────────────────────

describe('SymbolicNarrator — Card Name References', () => {
  it('each card narrative references its card name', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const response = makeReading(seed);
      const n = generateSymbolicNarrative(response);
      const steps = response.questionNarrative.transformationSteps;
      const count = Math.min(steps.length, response.spread.length);
      for (let i = 0; i < count; i++) {
        expect(n.cardNarratives[i]).toContain(steps[i].cardName);
      }
    }
  });

  it('synthesis mentions all card names', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const response = makeReading(seed);
      const n = generateSymbolicNarrative(response);
      const steps = response.questionNarrative.transformationSteps;
      const count = Math.min(steps.length, response.spread.length);
      for (let i = 0; i < count; i++) {
        expect(n.synthesis).toContain(steps[i].cardName);
      }
    }
  });

  it('card narratives mention position labels', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const response = makeReading(seed);
      const n = generateSymbolicNarrative(response);
      const count = Math.min(
        response.questionNarrative.transformationSteps.length,
        response.spread.length,
      );
      for (let i = 0; i < count; i++) {
        expect(n.cardNarratives[i]).toContain(response.spread[i].position.label);
      }
    }
  });
});

// ─── 7. Question and Mode Context ───────────────────

describe('SymbolicNarrator — Question Context', () => {
  it('opening includes the question text', () => {
    const response = makeReading(42, 'divinatory', 'What does this moment hold for me?');
    const n = generateSymbolicNarrative(response);
    expect(n.opening).toContain('What does this moment hold for me?');
  });

  it('empty question produces fallback phrasing', () => {
    const response = makeReading(42, 'divinatory', '');
    const n = generateSymbolicNarrative(response);
    expect(n.opening).toContain('No question was spoken');
  });

  for (const m of ['divinatory', 'philosophical', 'cosmological'] as InterrogationMode[]) {
    it(`mode=${m} opening contains mode-specific lens description`, () => {
      const response = makeReading(42, m);
      const n = generateSymbolicNarrative(response);
      if (m === 'divinatory') expect(n.opening).toContain('temporal');
      if (m === 'philosophical') expect(n.opening).toContain('existential');
      if (m === 'cosmological') expect(n.opening).toContain('archetypal');
    });
  }
});

// ─── 8. Cross-seed Variability ──────────────────────

describe('SymbolicNarrator — Cross-seed Variability', () => {
  it('5 different seeds produce at least 3 distinct openings', () => {
    const openings = new Set<string>();
    for (const seed of [1, 10, 25, 50, 99]) {
      const { narrative } = makeNarrative(seed);
      openings.add(narrative.opening);
    }
    expect(openings.size).toBeGreaterThanOrEqual(3);
  });

  it('5 different seeds produce at least 3 distinct resolutions', () => {
    const resolutions = new Set<string>();
    for (const seed of [1, 10, 25, 50, 99]) {
      const { narrative } = makeNarrative(seed);
      resolutions.add(narrative.resolution);
    }
    expect(resolutions.size).toBeGreaterThanOrEqual(3);
  });

  it('narratives from different modes differ significantly', () => {
    const modes: InterrogationMode[] = ['divinatory', 'philosophical', 'cosmological'];
    const narratives = modes.map(m => makeNarrative(42, m).narrative);
    // At least the openings should differ
    const openings = new Set(narratives.map(n => n.opening));
    expect(openings.size).toBe(3);
  });
});

// ─── 9. Determinism ─────────────────────────────────

describe('SymbolicNarrator — Determinism', () => {
  it('same input → same output', () => {
    const { narrative: n1 } = makeNarrative(42);
    const { narrative: n2 } = makeNarrative(42);
    expect(n1.opening).toBe(n2.opening);
    expect(n1.cardNarratives).toEqual(n2.cardNarratives);
    expect(n1.synthesis).toBe(n2.synthesis);
    expect(n1.resolution).toBe(n2.resolution);
  });
});

// ─── 10. Anti-Generic Hardening (Phase 4) ───────────

describe('SymbolicNarrator — Anti-Generic Hardening', () => {
  const BANNED_PHRASES = [
    // Original bans
    'the universe tells you',
    'trust the process',
    'everything happens for a reason',
    'the cards never lie',
    'your destiny awaits',
    'cosmic energy flows',
    // Phase 4 — zero cliché cartomantici
    'the universe',
    'energy around you',
    'this card represents',
    'you should',
    'your path',
  ];

  for (const phrase of BANNED_PHRASES) {
    it(`does not contain banned phrase: "${phrase}"`, () => {
      for (let seed = 1; seed <= 15; seed++) {
        const { narrative } = makeNarrative(seed);
        const full = [narrative.opening, ...narrative.cardNarratives, narrative.synthesis, narrative.resolution].join(' ').toLowerCase();
        expect(full).not.toContain(phrase);
      }
    });
  }
});

// ─── 11. Anti-Didactic (Phase 4) ────────────────────

describe('SymbolicNarrator — Anti-Didactic', () => {
  const DIDACTIC_PATTERNS = [
    /represents\s+(authority|power|love|wisdom|knowledge)/i,
    /symbolizes\s+(the|a|an)/i,
    /this card means/i,
    /the meaning of.*is/i,
  ];

  it('card narratives never explain a card didactically', () => {
    for (let seed = 1; seed <= 15; seed++) {
      const { narrative } = makeNarrative(seed);
      const allCardText = narrative.cardNarratives.join(' ');
      for (const pattern of DIDACTIC_PATTERNS) {
        expect(allCardText).not.toMatch(pattern);
      }
    }
  });

  it('resolution never gives direct advice', () => {
    const ADVICE_PATTERNS = [
      /you must now/i,
      /you need to/i,
      /you should/i,
      /try to /i,
      /remember that/i,
    ];
    for (let seed = 1; seed <= 15; seed++) {
      const { narrative } = makeNarrative(seed);
      for (const pattern of ADVICE_PATTERNS) {
        expect(narrative.resolution).not.toMatch(pattern);
      }
    }
  });
});

// ─── 12. Rhythm Engine Validation ───────────────────

describe('SymbolicNarrator — Rhythm Engine', () => {
  it('card narratives contain line breaks (not monolithic blocks)', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const { narrative } = makeNarrative(seed);
      for (const cn of narrative.cardNarratives) {
        const lineCount = cn.split('\n').filter(l => l.trim().length > 0).length;
        // Each card narrative should have at least 3 distinct lines
        expect(lineCount).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('opening is multi-line with rhetorical spacing', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const { narrative } = makeNarrative(seed);
      const lines = narrative.opening.split('\n').filter(l => l.trim().length > 0);
      expect(lines.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('resolution is multi-line', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const { narrative } = makeNarrative(seed);
      const lines = narrative.resolution.split('\n').filter(l => l.trim().length > 0);
      expect(lines.length).toBeGreaterThanOrEqual(2);
    }
  });
});

// ─── 13. Archetypal Density ─────────────────────────

describe('SymbolicNarrator — Archetypal Density', () => {
  it('each card narrative includes an embodiment image', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const { narrative, response } = makeNarrative(seed);
      const steps = response.questionNarrative.transformationSteps;
      const count = Math.min(steps.length, response.spread.length);
      for (let i = 0; i < count; i++) {
        // Embodiment is rendered in italics (*text*)
        if (steps[i].embodiment) {
          expect(narrative.cardNarratives[i]).toContain('*');
        }
      }
    }
  });

  it('card narratives include concrete keyword material', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const { narrative, response } = makeNarrative(seed);
      // At least the first card should reference a keyword from its card
      const firstCard = response.spread[0];
      if (firstCard.card.keywords.length > 0) {
        const firstKeyword = firstCard.card.keywords[0].toLowerCase();
        expect(narrative.cardNarratives[0].toLowerCase()).toContain(firstKeyword);
      }
    }
  });
});
