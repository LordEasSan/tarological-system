/**
 * Regression tests for extractQuestionCore() — the noun-phrase extraction
 * that replaces the broken "keyword.join(' and ')" approach.
 *
 * These tests verify that questions produce natural, grammatically coherent
 * core phrases for template insertion (e.g., "the true friend" instead of
 * "true and friend").
 */
import { describe, it, expect } from 'vitest';
import { extractQuestionCore } from '../engine/core/question-narrative';
import { executeUnifiedReading } from '../engine/core/unified-pipeline';
import { mockGenerate } from '../api/mock';
import type { TarotParameters, InterrogationMode } from '../types';

// ─── Unit Tests: extractQuestionCore ───────────────

describe('extractQuestionCore — noun phrase extraction', () => {
  it('"what is the true friend?" → "the true friend"', () => {
    expect(extractQuestionCore('what is the true friend?')).toBe('the true friend');
  });

  it('"What is love?" → "love"', () => {
    expect(extractQuestionCore('What is love?')).toBe('love');
  });

  it('"how does love transform?" → "love"', () => {
    expect(extractQuestionCore('how does love transform?')).toBe('love');
  });

  it('"what does this moment hold?" → "this moment"', () => {
    expect(extractQuestionCore('what does this moment hold?')).toBe('this moment');
  });

  it('"what lies ahead?" → "what lies ahead" (keeps WH-word when verb follows)', () => {
    expect(extractQuestionCore('what lies ahead?')).toBe('what lies ahead');
  });

  it('"who am I becoming?" → "becoming"', () => {
    expect(extractQuestionCore('who am I becoming?')).toBe('becoming');
  });

  it('"will I find love?" → "love"', () => {
    expect(extractQuestionCore('will I find love?')).toBe('love');
  });

  it('"am I ready?" → "ready"', () => {
    expect(extractQuestionCore('am I ready?')).toBe('ready');
  });

  it('"what is the meaning of suffering?" → "the meaning of suffering"', () => {
    expect(extractQuestionCore('what is the meaning of suffering?')).toBe('the meaning of suffering');
  });

  it('empty string → "this"', () => {
    expect(extractQuestionCore('')).toBe('this');
  });

  it('strips question marks and punctuation', () => {
    const result = extractQuestionCore('What is love???');
    expect(result).not.toContain('?');
    expect(result).toBe('love');
  });

  it('preserves articles in noun phrases', () => {
    const result = extractQuestionCore('What is the hidden truth?');
    expect(result).toBe('the hidden truth');
  });

  it('removes trailing filler phrases', () => {
    const result = extractQuestionCore('what does this moment hold for me?');
    expect(result).toBe('this moment');
  });

  it('handles "where" questions', () => {
    const result = extractQuestionCore('where does the path lead?');
    expect(result).toBe('the path');
  });

  it('handles "why" questions', () => {
    const result = extractQuestionCore('why does love hurt?');
    expect(result).toBe('love');
  });

  it('caps very long results at 6 words', () => {
    const result = extractQuestionCore('what is the very long and complex philosophical question about existence?');
    const words = result.split(/\s+/);
    expect(words.length).toBeLessThanOrEqual(6);
  });

  it('never produces "true and friend" for compound questions', () => {
    const result = extractQuestionCore('what is the true friend?');
    expect(result).not.toContain('true and friend');
    expect(result).not.toContain(' and ');
  });

  it('produces a grammatically usable noun phrase', () => {
    const result = extractQuestionCore('what is the true friend?');
    // Should work in template: "The question of {qCore} lives..."
    const template = `The question of ${result} lives in the space between self and other.`;
    expect(template).toContain('the true friend');
  });
});

// ─── Integration Tests: narrative output quality ───

describe('narrative output — no cryptic keyword joins', () => {
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

  function getResult(question: string, seed = 42) {
    const params = { ...defaultParams, seed };
    return executeUnifiedReading('philosophical', question, params, makeGenerateFn);
  }

  it('full narrative for "what is the true friend?" does NOT contain "true and friend"', () => {
    const result = getResult('what is the true friend?');
    const fullText = result.questionNarrative.fullNarrative;
    expect(fullText).not.toContain('true and friend');
  });

  it('full narrative for "what is the true friend?" contains "the true friend" as qCore', () => {
    const result = getResult('what is the true friend?');
    const fullText = result.questionNarrative.fullNarrative;
    expect(fullText).toContain('the true friend');
  });

  it('synthesis does NOT contain bare keyword "true" as qCore placeholder', () => {
    const result = getResult('what is the true friend?');
    const synth = result.questionNarrative.synthesis;
    // Should not start with bare "true" as subject — should use "the true friend"
    expect(synth).not.toMatch(/\btrue\b(?!\s+friend)/);
  });

  it('reconfiguration steps use coherent noun phrases, not keyword fragments', () => {
    const result = getResult('what is the true friend?');
    for (const step of result.questionNarrative.transformationSteps) {
      expect(step.reconfiguration).not.toContain('true and friend');
      // Each reconfiguration should contain the natural core phrase
      expect(step.reconfiguration.toLowerCase()).toContain('the true friend');
    }
  });

  it('existential state currentThesis uses the question core phrase', () => {
    const result = getResult('what is the true friend?');
    const thesis = result.questionNarrative.existentialState.currentThesis;
    expect(thesis.toLowerCase()).toContain('the true friend');
  });

  it('single-word questions still work: "What is love?"', () => {
    const result = getResult('What is love?');
    const fullText = result.questionNarrative.fullNarrative;
    expect(fullText.toLowerCase()).toContain('love');
    expect(fullText).not.toContain('love and');
  });

  it('multi-word core preserved: "What is the meaning of suffering?"', () => {
    const result = getResult('What is the meaning of suffering?');
    const fullText = result.questionNarrative.fullNarrative;
    expect(fullText.toLowerCase()).toContain('the meaning of suffering');
  });
});
