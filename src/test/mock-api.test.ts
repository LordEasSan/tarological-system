import { describe, it, expect } from 'vitest';
import { mockGenerate, mockVerify, mockNarrative, mockArchetypes } from '../api/mock';
import type { TarotParameters } from '../types';

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
  narrativeStyle: 'poetic',
};

describe('Mock API', () => {
  describe('mockGenerate', () => {
    it('should generate a deck and spread', () => {
      const result = mockGenerate(defaultParams);
      expect(result.deck).toBeDefined();
      expect(result.deck.length).toBeGreaterThan(0);
      expect(result.spread).toBeDefined();
      expect(result.spread.length).toBe(3);
    });

    it('should respect draw count', () => {
      const params = { ...defaultParams, spreadType: 'celtic-cross' as const, drawCount: 10 };
      const result = mockGenerate(params);
      expect(result.spread.length).toBe(10);
    });

    it('should generate unique cards in spread', () => {
      const result = mockGenerate(defaultParams);
      const ids = result.spread.map((pc) => pc.card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should generate deterministic results with seed', () => {
      const params = { ...defaultParams, seed: 42 };
      const result1 = mockGenerate(params);
      const result2 = mockGenerate(params);
      expect(result1.spread.map((p) => p.card.id)).toEqual(
        result2.spread.map((p) => p.card.id)
      );
    });
  });

  describe('mockVerify', () => {
    it('should return verification with properties', () => {
      const result = mockVerify();
      expect(result.verification).toBeDefined();
      expect(result.verification.properties.length).toBeGreaterThan(0);
      expect(result.verification.timestamp).toBeDefined();
      expect(result.verification.executionTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should include all LTL property types', () => {
      const result = mockVerify();
      const types = result.verification.properties.map((p) => p.type);
      expect(types).toContain('safety');
      expect(types).toContain('cosafety');
      expect(types).toContain('liveness');
      expect(types).toContain('coliveness');
    });
  });

  describe('mockNarrative', () => {
    it('should generate a narrative string', () => {
      const spread = mockGenerate(defaultParams).spread;
      const result = mockNarrative(defaultParams.meaningWeights, spread);
      expect(result.narrative).toBeDefined();
      expect(result.narrative.length).toBeGreaterThan(0);
    });

    it('should reference drawn cards in narrative', () => {
      const spread = mockGenerate({ ...defaultParams, seed: 42 }).spread;
      const result = mockNarrative(defaultParams.meaningWeights, spread);
      for (const placed of spread) {
        expect(result.narrative).toContain(placed.card.name);
      }
    });
  });

  describe('mockArchetypes', () => {
    it('should return archetype families', () => {
      const result = mockArchetypes();
      expect(result.archetypes.length).toBeGreaterThan(0);
      expect(result.archetypes[0].family).toBe('Jungian');
    });
  });
});
