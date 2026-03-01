/**
 * Tests for NarrativeQualityValidator.
 *
 * Verifies:
 * - Valid narrative passes cleanly
 * - Duplicate paragraphs are caught
 * - Repeated opening sentences are flagged
 * - Too-short / empty sections raise errors
 * - Banned jargon triggers warnings
 * - Safe fallback produces valid output
 */
import { describe, it, expect } from 'vitest';
import { validateNarrative, generateSafeFallback } from '../engine/core/narrative-quality-validator';
import type { QuestionTargetedNarrative, TransformationStep } from '../types';

// ─── Helpers ────────────────────────────────────────

function makeStep(
  cardName: string,
  role: 'anchor' | 'catalyst' | 'shadow' | 'bridge' = 'anchor',
  depth = 1,
): TransformationStep {
  return {
    depth,
    cardName,
    role,
    transformationMode: 'dialectical',
    thesis: `The ${cardName} asserts a thesis of surprising depth and philosophical weight here.`,
    destabilization: `But the ${cardName} also destabilizes, showing contradiction and shadow aspects.`,
    reconfiguration: `Through this tension the ${cardName} reconfigures understanding in new form.`,
    embodiment: { type: 'scene', content: `A scene of ${cardName}'s essence`, cardSource: cardName },
    existentialState: {
      currentThesis: 'test thesis',
      tensionAxis: 'test axis',
      unresolvedPolarity: null,
      ontologicalDirection: 'test direction',
    },
  };
}

function makeNarrative(overrides: Partial<QuestionTargetedNarrative> = {}): QuestionTargetedNarrative {
  const steps = overrides.transformationSteps ?? [
    makeStep('The Fool', 'anchor', 1),
    makeStep('The Tower', 'catalyst', 2),
    makeStep('The Star', 'bridge', 3),
  ];
  const synthesis = overrides.synthesis ?? 'The reading synthesizes the encounter into a deeper frame of understanding.';
  const fullNarrative = overrides.fullNarrative ?? [
    'Your question asks about the nature of truth.',
    '',
    ...steps.flatMap(s => [s.thesis, s.destabilization, s.reconfiguration, '']),
    synthesis,
    '',
    '---',
    '',
    '*This is a symbolic reflection.*',
  ].join('\n');

  return {
    questionRestatement: 'Your question asks about the nature of truth.',
    transformationMode: 'dialectical',
    transformationSteps: steps,
    existentialState: {
      currentThesis: 'final thesis',
      tensionAxis: 'axis',
      unresolvedPolarity: null,
      ontologicalDirection: 'direction',
    },
    resolutionArchetype: 'paradox-held',
    tensionType: 'dialectical-tension',
    completionStrategy: 'paradox-reframe',
    cardExplanations: steps.map(s => ({
      cardName: s.cardName,
      role: s.role,
      contribution: s.thesis,
    })),
    synthesis,
    embodiments: steps.map(s => s.embodiment),
    llmArticulation: null,
    fullNarrative,
    disclaimer: 'This is a symbolic reflection.',
    cardReferences: {},
    ...overrides,
  };
}

// ─── Validation Tests ───────────────────────────────

describe('validateNarrative', () => {
  it('passes for a well-formed narrative', () => {
    const result = validateNarrative(makeNarrative());
    expect(result.valid).toBe(true);
    // May have warnings but no errors
    const errors = result.violations.filter(v => v.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it('detects duplicate paragraphs across cards', () => {
    const duplicateThesis = 'Exactly the same thesis repeated verbatim.';
    const steps = [
      makeStep('The Fool', 'anchor', 1),
      makeStep('The Tower', 'catalyst', 2),
    ];
    steps[0].thesis = duplicateThesis;
    steps[1].thesis = duplicateThesis;

    const result = validateNarrative(makeNarrative({ transformationSteps: steps }));
    const dupes = result.violations.filter(v => v.code === 'DUPLICATE_PARAGRAPH');
    expect(dupes.length).toBeGreaterThan(0);
  });

  it('detects repeated first sentence across cards', () => {
    const steps = [
      makeStep('The Fool', 'anchor', 1),
      makeStep('The Tower', 'catalyst', 2),
    ];
    // Same first sentence but different remainder
    steps[0].thesis = 'The card reveals a hidden truth. And it is beautiful.';
    steps[1].thesis = 'The card reveals a hidden truth. But it is also terrible.';

    const result = validateNarrative(makeNarrative({ transformationSteps: steps }));
    const repeated = result.violations.filter(v => v.code === 'REPEATED_OPENING');
    expect(repeated.length).toBeGreaterThan(0);
  });

  it('detects empty sections', () => {
    const steps = [makeStep('The Fool', 'anchor', 1)];
    steps[0].thesis = '';

    const result = validateNarrative(makeNarrative({ transformationSteps: steps }));
    const empties = result.violations.filter(v => v.code === 'EMPTY_SECTION');
    expect(empties.length).toBeGreaterThan(0);
    expect(result.valid).toBe(false);
  });

  it('detects too-short sections', () => {
    const steps = [makeStep('The Fool', 'anchor', 1)];
    steps[0].thesis = 'Short.'; // < 30 chars

    const result = validateNarrative(makeNarrative({ transformationSteps: steps }));
    const short = result.violations.filter(v => v.code === 'SECTION_TOO_SHORT');
    expect(short.length).toBeGreaterThan(0);
    expect(result.valid).toBe(false);
  });

  it('detects too-short full narrative', () => {
    const result = validateNarrative(makeNarrative({ fullNarrative: 'Too short.' }));
    const short = result.violations.filter(v => v.code === 'NARRATIVE_TOO_SHORT');
    expect(short.length).toBeGreaterThan(0);
  });

  it('detects banned jargon phrases', () => {
    const result = validateNarrative(makeNarrative({
      fullNarrative: 'The reading survives its own contradiction and carries the weight of what was denied. ' +
        'Enough length to pass the minimum narrative length check by adding a lot more text here for padding.',
    }));
    const jargon = result.violations.filter(v => v.code === 'BANNED_JARGON');
    expect(jargon.length).toBeGreaterThanOrEqual(2);
  });

  it('empty synthesis triggers error', () => {
    const result = validateNarrative(makeNarrative({ synthesis: '' }));
    const empties = result.violations.filter(v => v.code === 'EMPTY_SYNTHESIS');
    expect(empties.length).toBe(1);
    expect(result.valid).toBe(false);
  });
});

// ─── Safe Fallback Tests ────────────────────────────

describe('generateSafeFallback', () => {
  it('produces a non-empty string', () => {
    const steps = [makeStep('The Fool', 'anchor', 1)];
    const result = generateSafeFallback('Your question restated.', steps, 'Disclaimer text.');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes question restatement', () => {
    const steps = [makeStep('Death', 'catalyst', 1)];
    const result = generateSafeFallback('What does death mean?', steps, 'Disclaimer.');
    expect(result).toContain('What does death mean?');
  });

  it('includes all card names', () => {
    const steps = [
      makeStep('The Fool', 'anchor', 1),
      makeStep('The Tower', 'catalyst', 2),
    ];
    const result = generateSafeFallback('Question.', steps, 'Disclaimer.');
    expect(result).toContain('The Fool');
    expect(result).toContain('The Tower');
  });

  it('includes disclaimer', () => {
    const steps = [makeStep('The Star', 'bridge', 1)];
    const result = generateSafeFallback('Question.', steps, 'This is symbolic.');
    expect(result).toContain('This is symbolic.');
  });
});
