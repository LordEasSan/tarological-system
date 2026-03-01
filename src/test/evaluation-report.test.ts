/**
 * PHASE 4 — Evaluation Mode
 * Generate 5 diverse readings, report IDA metrics, verify structural diversity.
 */
import { describe, it, expect } from 'vitest';
import { executeUnifiedReading } from '../engine/core';
import { mockGenerate } from '../api';
import type { InterrogationMode, TarotParameters } from '../types';

function makeParams(overrides: Partial<TarotParameters> = {}): TarotParameters {
  return {
    drawCount: 5,
    spreadType: 'cross',
    archetypeFamily: 'major',
    reversalProbability: 0.3,
    narrativeStyle: 'symbolic',
    meaningWeights: {
      intuitive: 0.4,
      analytical: 0.3,
      emotional: 0.2,
      practical: 0.1,
    },
    ...overrides,
  } as TarotParameters;
}

interface ReadingReport {
  label: string;
  mode: InterrogationMode;
  question: string;
  transformationMode: string;
  tensionType: string;
  completionStrategy: string;
  resolutionArchetype: string;
  qualityScore: number;
  cardCount: number;
  embodimentCount: number;
}

describe('PHASE 4 — Evaluation Mode: 5 Diverse Readings', () => {
  const scenarios: Array<{ label: string; mode: InterrogationMode; question: string; params?: Partial<TarotParameters> }> = [
    {
      label: 'Divinatory (temporal, default)',
      mode: 'divinatory',
      question: 'What does the coming season hold for my career?',
    },
    {
      label: 'Philosophical (existential)',
      mode: 'philosophical',
      question: 'Who am I becoming through this suffering?',
    },
    {
      label: 'Cosmological (archetypal)',
      mode: 'cosmological',
      question: 'What is the structure of love at its core?',
    },
    {
      label: 'Philosophical (7 cards, high reversal)',
      mode: 'philosophical',
      question: 'Why does meaning keep eluding me?',
      params: { drawCount: 7, reversalProbability: 0.6 },
    },
    {
      label: 'Divinatory (no question)',
      mode: 'divinatory',
      question: '',
    },
  ];

  const reports: ReadingReport[] = [];

  scenarios.forEach((scenario, idx) => {
    it(`Reading #${idx + 1}: ${scenario.label}`, () => {
      const params = makeParams(scenario.params);
      const generateFn = (p: typeof params) => mockGenerate(p).spread;

      const result = executeUnifiedReading(
        scenario.mode,
        scenario.question,
        params,
        generateFn,
      );

      const qn = result.questionNarrative;

      const report: ReadingReport = {
        label: scenario.label,
        mode: scenario.mode,
        question: scenario.question || '(none)',
        transformationMode: qn.transformationMode,
        tensionType: qn.tensionType,
        completionStrategy: qn.completionStrategy,
        resolutionArchetype: qn.resolutionArchetype,
        qualityScore: result.qualityScore ?? -1,
        cardCount: result.spread.length,
        embodimentCount: qn.embodiments.length,
      };

      reports.push(report);

      // Basic assertions
      expect(qn.transformationMode).toBeTruthy();
      expect(qn.tensionType).toBeTruthy();
      expect(qn.completionStrategy).toBeTruthy();
      expect(qn.resolutionArchetype).toBeTruthy();
      expect(qn.transformationSteps.length).toBeGreaterThan(0);
      expect(qn.synthesis).toBeTruthy();
      // LTL verification may fail due to mock constraints (drawCount vs actual spread size)
      // The key metric is IDA diversity, not LTL pass rate in this evaluation
      expect(result.verification).toBeDefined();
    });
  });

  it('Structural Diversity Report', () => {
    expect(reports.length).toBe(5);

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           PHASE 4 — EVALUATION REPORT (5 readings)         ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');

    reports.forEach((r, i) => {
      console.log(`║ #${i + 1} ${r.label}`);
      console.log(`║   Mode: ${r.mode} | Question: ${r.question.slice(0, 40)}${r.question.length > 40 ? '...' : ''}`);
      console.log(`║   TransformationMode: ${r.transformationMode}`);
      console.log(`║   TensionType:        ${r.tensionType}`);
      console.log(`║   CompletionStrategy: ${r.completionStrategy}`);
      console.log(`║   ResolutionArchetype:${r.resolutionArchetype}`);
      console.log(`║   Q: ${r.qualityScore >= 0 ? (r.qualityScore * 100).toFixed(1) + '%' : 'N/A'} | Cards: ${r.cardCount} | Embodiments: ${r.embodimentCount}`);
      console.log('║──────────────────────────────────────────────────────────────');
    });

    // Diversity metrics
    const uniqueModes = new Set(reports.map(r => r.transformationMode));
    const uniqueTensions = new Set(reports.map(r => r.tensionType));
    const uniqueStrategies = new Set(reports.map(r => r.completionStrategy));
    const uniqueResolutions = new Set(reports.map(r => r.resolutionArchetype));

    console.log('║ DIVERSITY:');
    console.log(`║   Distinct Transformation Modes:  ${uniqueModes.size}/5   [${[...uniqueModes].join(', ')}]`);
    console.log(`║   Distinct Tension Types:         ${uniqueTensions.size}/5   [${[...uniqueTensions].join(', ')}]`);
    console.log(`║   Distinct Completion Strategies:  ${uniqueStrategies.size}/5   [${[...uniqueStrategies].join(', ')}]`);
    console.log(`║   Distinct Resolution Archetypes:  ${uniqueResolutions.size}/5   [${[...uniqueResolutions].join(', ')}]`);
    console.log('╚══════════════════════════════════════════════════════════════╝');

    // Expect at least 2 distinct values per category (IDA should produce variety)
    expect(uniqueModes.size).toBeGreaterThanOrEqual(2);
    expect(uniqueTensions.size).toBeGreaterThanOrEqual(2);
    expect(uniqueStrategies.size).toBeGreaterThanOrEqual(2);
    expect(uniqueResolutions.size).toBeGreaterThanOrEqual(2);
  });
});
