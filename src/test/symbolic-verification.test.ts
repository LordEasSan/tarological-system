/**
 * Phase 5 — Symbolic Reading Live Verification (v2 — Full Output)
 *
 * Generates 3 symbolic readings with distinct tensionType / completionStrategy
 * and outputs the COMPLETE narrative text for quality evaluation.
 */
import { describe, it, expect } from 'vitest';
import { executeUnifiedReading } from '../engine/core/unified-pipeline';
import { computeQualityScore } from '../engine/scoring';
import { generateSymbolicNarrative, type SymbolicNarrative } from '../engine/symbolicNarrator';
import type { TarotParameters, InterrogationMode } from '../types';
import { mockGenerate } from '../api/mock';

const baseParams: TarotParameters = {
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
};

interface FullVerificationReading {
  label: string;
  seed: number;
  mode: InterrogationMode;
  question: string;
  tensionType: string;
  completionStrategy: string;
  resolutionArchetype: string;
  transformationMode: string;
  cardNames: string[];
  qualityComposite: number;
  narrative: SymbolicNarrative;
}

function generateFullReading(
  label: string,
  seed: number,
  mode: InterrogationMode,
  question: string,
): FullVerificationReading {
  const params = { ...baseParams, seed };
  const generateFn = () => mockGenerate(params).spread;
  const response = executeUnifiedReading(mode, question, params, generateFn, {});
  const qScore = computeQualityScore(response.spread, params);
  const narrative = generateSymbolicNarrative(response, qScore.dimensions);

  const qn = response.questionNarrative;
  const steps = qn.transformationSteps;
  const cardCount = Math.min(steps.length, response.spread.length);

  return {
    label,
    seed,
    mode,
    question,
    tensionType: qn.tensionType,
    completionStrategy: qn.completionStrategy,
    resolutionArchetype: qn.resolutionArchetype,
    transformationMode: qn.transformationMode,
    cardNames: steps.slice(0, cardCount).map(s => s.cardName),
    qualityComposite: qScore.composite,
    narrative,
  };
}

function printFullReading(r: FullVerificationReading) {
  const div = '═'.repeat(60);
  const subdiv = '─'.repeat(60);
  console.log(`\n${div}`);
  console.log(`  ${r.label}  (seed=${r.seed})`);
  console.log(div);
  console.log(`  Mode:        ${r.mode}`);
  console.log(`  Question:    ${r.question}`);
  console.log(`  Cards:       ${r.cardNames.join(', ')}`);
  console.log(`  Tension:     ${r.tensionType}`);
  console.log(`  Strategy:    ${r.completionStrategy}`);
  console.log(`  Resolution:  ${r.resolutionArchetype}`);
  console.log(`  Transform:   ${r.transformationMode}`);
  console.log(`  Quality Q:   ${(r.qualityComposite * 100).toFixed(1)}%`);
  console.log(subdiv);

  console.log('\n  ── OPENING ──\n');
  console.log(r.narrative.opening);

  console.log('\n  ── CARDS ──\n');
  for (let i = 0; i < r.narrative.cardNarratives.length; i++) {
    console.log(`  [Card ${i + 1}: ${r.cardNames[i]}]`);
    console.log(r.narrative.cardNarratives[i]);
    console.log('');
  }

  console.log('  ── SYNTHESIS ──\n');
  console.log(r.narrative.synthesis);

  console.log('\n  ── RESOLUTION ──\n');
  console.log(r.narrative.resolution);

  console.log(`\n${div}\n`);
}

describe('Phase 5 — Symbolic Reading Full Verification', () => {
  const readings: FullVerificationReading[] = [];

  it('Reading 1 — Divinatory / temporal question', () => {
    const r = generateFullReading(
      'R1 Divinatory',
      17,
      'divinatory',
      'What does this moment hold for me?',
    );
    readings.push(r);

    expect(r.tensionType).toBeTruthy();
    expect(r.completionStrategy).toBeTruthy();
    expect(r.resolutionArchetype).toBeTruthy();
    expect(r.cardNames.length).toBeGreaterThanOrEqual(2);
    expect(r.narrative.opening).toContain('temporal');
    expect(r.qualityComposite).toBeGreaterThan(0);

    printFullReading(r);
  });

  it('Reading 2 — Philosophical / existential question', () => {
    const r = generateFullReading(
      'R2 Philosophical',
      53,
      'philosophical',
      'Who am I becoming?',
    );
    readings.push(r);

    expect(r.tensionType).toBeTruthy();
    expect(r.completionStrategy).toBeTruthy();
    expect(r.resolutionArchetype).toBeTruthy();
    expect(r.cardNames.length).toBeGreaterThanOrEqual(2);
    expect(r.narrative.opening).toContain('existential');
    expect(r.qualityComposite).toBeGreaterThan(0);

    printFullReading(r);
  });

  it('Reading 3 — Cosmological / archetypal question', () => {
    const r = generateFullReading(
      'R3 Cosmological',
      88,
      'cosmological',
      'What is the archetypal structure of change?',
    );
    readings.push(r);

    expect(r.tensionType).toBeTruthy();
    expect(r.completionStrategy).toBeTruthy();
    expect(r.resolutionArchetype).toBeTruthy();
    expect(r.cardNames.length).toBeGreaterThanOrEqual(2);
    expect(r.narrative.opening).toContain('archetypal');
    expect(r.qualityComposite).toBeGreaterThan(0);

    printFullReading(r);
  });

  it('Cross-reading validation: structural diversity', () => {
    expect(readings.length).toBe(3);
    const tensionSet = new Set(readings.map(r => r.tensionType));
    const strategySet = new Set(readings.map(r => r.completionStrategy));
    const resolutionSet = new Set(readings.map(r => r.resolutionArchetype));

    const totalDiversity = tensionSet.size + strategySet.size + resolutionSet.size;
    expect(totalDiversity).toBeGreaterThanOrEqual(4);

    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║     SYMBOLIC READING DIVERSITY REPORT        ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Unique Tensions:    ${tensionSet.size}/3  [${[...tensionSet].join(', ')}]`);
    console.log(`║  Unique Strategies:  ${strategySet.size}/3  [${[...strategySet].join(', ')}]`);
    console.log(`║  Unique Resolutions: ${resolutionSet.size}/3  [${[...resolutionSet].join(', ')}]`);
    console.log(`║  Total Diversity:    ${totalDiversity}/9`);
    console.log('╚══════════════════════════════════════════════╝');
  });
});
