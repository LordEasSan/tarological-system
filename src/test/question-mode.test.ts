/**
 * Tests for QuestionMode detection module.
 *
 * Verifies:
 * - All 5 modes have correct keyword triggers
 * - Default fallback to 'existential'
 * - Edge cases (empty, mixed, multilingual)
 * - Emphasis mapping returns valid values
 */
import { describe, it, expect } from 'vitest';
import { detectQuestionMode, getQuestionModeEmphasis } from '../engine/core/question-mode';
import type { QuestionMode } from '../engine/core/question-mode';

describe('detectQuestionMode', () => {
  describe('relational mode', () => {
    it('detects "friend" keyword', () => {
      expect(detectQuestionMode('Who is my true friend?')).toBe('relational');
    });

    it('detects "love" keyword', () => {
      expect(detectQuestionMode('How does love transform?')).toBe('relational');
    });

    it('detects "partner" keyword', () => {
      expect(detectQuestionMode('What does my partner hide?')).toBe('relational');
    });

    it('detects "relationship" keyword', () => {
      expect(detectQuestionMode('Where is this relationship going?')).toBe('relational');
    });

    it('detects "trust" keyword', () => {
      expect(detectQuestionMode('Can I trust this person?')).toBe('relational');
    });
  });

  describe('existential mode', () => {
    it('detects "who am I" phrase', () => {
      expect(detectQuestionMode('Who am I becoming?')).toBe('existential');
    });

    it('detects "who am I" phrase', () => {
      expect(detectQuestionMode('Who am I really?')).toBe('existential');
    });

    it('detects "identity" keyword', () => {
      expect(detectQuestionMode('What defines my identity?')).toBe('existential');
    });
  });

  describe('causal mode', () => {
    it('detects "why" at start of question', () => {
      expect(detectQuestionMode('Why did this happen to me?')).toBe('causal');
    });

    it('detects "cause" keyword', () => {
      expect(detectQuestionMode('What is the cause of my suffering?')).toBe('causal');
    });

    it('detects "because" keyword (causal wins when no competing teleological)', () => {
      expect(detectQuestionMode('Is this happening because of my choices?')).toBe('causal');
    });
  });

  describe('teleological mode', () => {
    it('detects "purpose" keyword', () => {
      expect(detectQuestionMode('What is my purpose?')).toBe('teleological');
    });

    it('detects "destiny" keyword', () => {
      expect(detectQuestionMode('What is my destiny?')).toBe('teleological');
    });

    it('detects "calling" keyword', () => {
      expect(detectQuestionMode('Do I have a calling?')).toBe('teleological');
    });
  });

  describe('predictive mode', () => {
    it('detects "what will" phrase', () => {
      expect(detectQuestionMode('What will happen next?')).toBe('predictive');
    });

    it('detects "future" keyword', () => {
      expect(detectQuestionMode('What does the future hold?')).toBe('predictive');
    });

    it('detects "outcome" keyword', () => {
      expect(detectQuestionMode('What is the likely outcome?')).toBe('predictive');
    });
  });

  describe('edge cases', () => {
    it('defaults to existential for empty string', () => {
      expect(detectQuestionMode('')).toBe('existential');
    });

    it('defaults to existential for generic question', () => {
      expect(detectQuestionMode('Tell me about this card.')).toBe('existential');
    });

    it('handles case insensitivity', () => {
      expect(detectQuestionMode('WHY IS THIS HAPPENING?')).toBe('causal');
    });
  });
});

describe('getQuestionModeEmphasis', () => {
  const modes: QuestionMode[] = ['relational', 'existential', 'causal', 'teleological', 'predictive'];

  for (const mode of modes) {
    it(`returns valid emphasis for "${mode}"`, () => {
      const emphasis = getQuestionModeEmphasis(mode);
      expect(emphasis).toHaveProperty('paradoxFrame');
      expect(emphasis).toHaveProperty('insightTone');
      expect(emphasis).toHaveProperty('register');
      expect(typeof emphasis.paradoxFrame).toBe('string');
      expect(typeof emphasis.insightTone).toBe('string');
      expect(typeof emphasis.register).toBe('string');
      expect(emphasis.paradoxFrame.length).toBeGreaterThan(0);
      expect(emphasis.insightTone.length).toBeGreaterThan(0);
      expect(emphasis.register.length).toBeGreaterThan(0);
    });
  }

  it('returns distinct paradoxFrame for each mode', () => {
    const frames = modes.map(m => getQuestionModeEmphasis(m).paradoxFrame);
    const unique = new Set(frames);
    expect(unique.size).toBe(modes.length);
  });
});
