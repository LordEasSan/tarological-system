/**
 * EMDE Benchmark v1.0 — Epistemic Performance Benchmark
 * Generates raw data for Modules A–D.
 * Run: npx vitest run src/test/emde-benchmark.test.ts
 */
import { describe, it } from 'vitest';
import { executeUnifiedReading } from '../engine/core/unified-pipeline';
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
  seed: 42,
};

function makeGenerateFn(params: TarotParameters) {
  return mockGenerate(params).spread;
}

function run(mode: InterrogationMode, question: string, seed: number) {
  const params = { ...baseParams, seed };
  return executeUnifiedReading(mode, question, params, makeGenerateFn);
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// Dialectical signature detection
const DIALECTICAL_MARKERS = [
  'contradiction', 'thesis', 'negation', 'survives its own',
  'neither thesis nor', 'dialectic', 'sublat', 'aufheb',
  'synthesis of opposites', 'negation of negation',
  'tension between', 'polarity', 'collision of',
];

function hasDialecticalSignature(text: string): boolean {
  const lower = text.toLowerCase();
  let count = 0;
  for (const m of DIALECTICAL_MARKERS) {
    if (lower.includes(m)) count++;
  }
  return count >= 2;
}

function hasConcreteImage(text: string): boolean {
  // Concrete images: physical objects, body, landscape, material things
  const markers = [
    'hand', 'hands', 'eye', 'eyes', 'door', 'gate', 'tower', 'river',
    'stone', 'fire', 'water', 'blood', 'bone', 'mountain', 'sea', 'sun',
    'moon', 'mirror', 'sword', 'cup', 'wheel', 'throne', 'bridge',
    'shadow', 'light', 'flame', 'lightning', 'storm', 'star', 'crown',
    'wall', 'chain', 'garden', 'tree', 'root', 'wound', 'body', 'face',
    'mask', 'path', 'road', 'desert', 'shore', 'vessel', 'key', 'lock',
    'temple', 'cliff', 'edge', 'abyss', 'pit', 'cave', 'lantern',
  ];
  const lower = text.toLowerCase();
  return markers.some(m => lower.includes(m));
}

function hasRelationalDynamic(text: string): boolean {
  const markers = [
    'between', 'encounter', 'other', 'bond', 'relation',
    'trust', 'betray', 'mutual', 'asymmetr', 'intimacy',
    'distance', 'gift', 'demand', 'presence', 'absence',
    'companion', 'friend', 'lover', 'stranger', 'enemy',
    'together', 'apart', 'share', 'withhold', 'witness',
  ];
  const lower = text.toLowerCase();
  let count = 0;
  for (const m of markers) {
    if (lower.includes(m)) count++;
  }
  return count >= 2;
}

function hasMythicScene(text: string): boolean {
  const markers = [
    'cosmos', 'cosmic', 'myth', 'primordial', 'creation',
    'void', 'genesis', 'cosmogon', 'origin', 'god', 'divine',
    'sacred', 'ritual', 'archetype', 'eternal', 'cycle',
    'fate', 'destiny', 'oracle', 'prophecy', 'revelation',
    'apocalypse', 'underworld', 'heaven', 'hell', 'spirit',
  ];
  const lower = text.toLowerCase();
  let count = 0;
  for (const m of markers) {
    if (lower.includes(m)) count++;
  }
  return count >= 2;
}

function hasEthicalImperative(text: string): boolean {
  const markers = [
    'must', 'should', 'ought', 'duty', 'obligation', 'demand',
    'imperative', 'command', 'responsibility', 'commit', 'action',
    'choose', 'decide', 'enact', 'moral', 'ethical', 'justice',
    'right', 'wrong', 'cost', 'price', 'sacrifice',
  ];
  const lower = text.toLowerCase();
  let count = 0;
  for (const m of markers) {
    if (lower.includes(m)) count++;
  }
  return count >= 2;
}

// ==========================================================
// MODULE A — MODE BLIND TEST
// ==========================================================

describe('MODULE_A', () => {
  const question = 'Who is the true friend?';
  const seeds = [7, 23, 51, 88, 142];

  const results = seeds.map(seed => {
    const r = run('philosophical', question, seed);
    return {
      seed,
      llm: r.questionNarrative.llmArticulation!,
      mode: r.questionNarrative.transformationMode,
      archetype: r.questionNarrative.resolutionArchetype,
    };
  });

  // Print blind articulations
  it('BLIND_OUTPUTS', () => {
    console.log('\n══════════════════════════════════════════');
    console.log('MODULE A — BLIND ARTICULATIONS');
    console.log('══════════════════════════════════════════');
    for (let i = 0; i < results.length; i++) {
      console.log(`\n────── OUTPUT ${i + 1} ──────\n`);
      console.log(results[i].llm);
    }
    console.log('\n══════════════════════════════════════════');
  });

  // Print metadata separately
  it('METADATA', () => {
    console.log('\n══════════════════════════════════════════');
    console.log('MODULE A — METADATA');
    console.log('══════════════════════════════════════════');
    console.log('Seed | TransformationMode       | ResolutionArchetype');
    console.log('-----|-------------------------|----------------------------');
    for (const r of results) {
      console.log(
        `${String(r.seed).padStart(4)} | ${r.mode.padEnd(23)} | ${r.archetype}`,
      );
    }
    const distinctModes = new Set(results.map(r => r.mode));
    console.log(`\nDistinct modes: ${distinctModes.size} — ${[...distinctModes].join(', ')}`);
    console.log('══════════════════════════════════════════');
  });
});

// ==========================================================
// MODULE B — ONTOLOGICAL SPREAD TEST
// ==========================================================

describe('MODULE_B', () => {
  const questions: Array<{ q: string; mode: InterrogationMode }> = [
    { q: 'Who is the true friend?', mode: 'philosophical' },
    { q: 'What makes something real?', mode: 'philosophical' },
    { q: 'How was the universe born?', mode: 'cosmological' },
    { q: 'What is freedom?', mode: 'philosophical' },
    { q: 'Why do we suffer?', mode: 'philosophical' },
  ];
  const seeds = [11, 47, 93];

  interface BRow {
    idx: number;
    question: string;
    seed: number;
    articulation: string;
    mode: string;
    archetype: string;
    wc: number;
  }

  const rows: BRow[] = [];
  let idx = 1;
  for (const { q, mode } of questions) {
    for (const seed of seeds) {
      const r = run(mode, q, seed);
      rows.push({
        idx: idx++,
        question: q,
        seed,
        articulation: r.questionNarrative.llmArticulation!,
        mode: r.questionNarrative.transformationMode,
        archetype: r.questionNarrative.resolutionArchetype,
        wc: wordCount(r.questionNarrative.llmArticulation!),
      });
    }
  }

  it('ARTICULATIONS', () => {
    console.log('\n══════════════════════════════════════════');
    console.log('MODULE B — 15 ARTICULATIONS');
    console.log('══════════════════════════════════════════');
    for (const row of rows) {
      console.log(`\n────── #${row.idx} | "${row.question}" | seed=${row.seed} ──────`);
      console.log(`Mode: ${row.mode} | Archetype: ${row.archetype} | Words: ${row.wc}`);
      console.log('');
      console.log(row.articulation);
    }
    console.log('\n══════════════════════════════════════════');
  });

  it('TABLE', () => {
    console.log('\n══════════════════════════════════════════');
    console.log('MODULE B — SUMMARY TABLE');
    console.log('══════════════════════════════════════════');
    console.log(' #  | Seed | Mode                    | Archetype                    | WC');
    console.log('----|------|-------------------------|------------------------------|----');
    for (const row of rows) {
      console.log(
        `${String(row.idx).padStart(2)}  | ${String(row.seed).padStart(4)} | ${row.mode.padEnd(23)} | ${row.archetype.padEnd(28)} | ${row.wc}`,
      );
    }
    console.log('══════════════════════════════════════════');
  });

  // ==========================================================
  // MODULE C — EMBODIMENT ANALYSIS
  // ==========================================================

  it('MODULE_C', () => {
    console.log('\n══════════════════════════════════════════');
    console.log('MODULE C — EMBODIMENT ANALYSIS');
    console.log('══════════════════════════════════════════');
    console.log(' #  | concrete | relational | mythic | ethical | emb_score | dialect_sig');
    console.log('----|----------|------------|--------|---------|-----------|------------');

    const cRows: Array<{
      idx: number;
      ci: boolean;
      rd: boolean;
      ms: boolean;
      ei: boolean;
      score: number;
      ds: boolean;
    }> = [];

    for (const row of rows) {
      const text = row.articulation;
      const ci = hasConcreteImage(text);
      const rd = hasRelationalDynamic(text);
      const ms = hasMythicScene(text);
      const ei = hasEthicalImperative(text);
      const score = [ci, rd, ms, ei].filter(Boolean).length;
      const ds = hasDialecticalSignature(text);
      cRows.push({ idx: row.idx, ci, rd, ms, ei, score, ds });

      const b = (v: boolean) => (v ? 'YES' : 'no ').padEnd(6);
      console.log(
        `${String(row.idx).padStart(2)}  | ${b(ci)}   | ${b(rd)}     | ${b(ms)} | ${b(ei)}  | ${score}         | ${b(ds)}`,
      );
    }

    // ==========================================================
    // MODULE D — DIVERSITY METRICS
    // ==========================================================

    console.log('\n══════════════════════════════════════════');
    console.log('MODULE D — DIVERSITY METRICS');
    console.log('══════════════════════════════════════════');

    // Mode distribution
    const modeCounts = new Map<string, number>();
    for (const row of rows) {
      modeCounts.set(row.mode, (modeCounts.get(row.mode) || 0) + 1);
    }
    console.log('\nMode Distribution:');
    for (const [mode, count] of [...modeCounts.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${mode.padEnd(25)} ${count}/${rows.length}  (${((count / rows.length) * 100).toFixed(1)}%)`);
    }

    // Archetype distribution
    const archCounts = new Map<string, number>();
    for (const row of rows) {
      archCounts.set(row.archetype, (archCounts.get(row.archetype) || 0) + 1);
    }
    console.log('\nResolutionArchetype Distribution:');
    for (const [arch, count] of [...archCounts.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${arch.padEnd(30)} ${count}/${rows.length}  (${((count / rows.length) * 100).toFixed(1)}%)`);
    }

    // RDI — Resolution Diversity Index: distinct archetypes / total possible (7)
    const distinctArchetypes = archCounts.size;
    const totalPossibleArchetypes = 7;
    const rdi = distinctArchetypes / totalPossibleArchetypes;
    console.log(`\nRDI (distinct archetypes / total possible): ${distinctArchetypes}/${totalPossibleArchetypes} = ${rdi.toFixed(4)}`);

    // Dialectical signature %
    const dsCount = cRows.filter(r => r.ds).length;
    const dsPct = (dsCount / rows.length) * 100;
    console.log(`Dialectical signature present: ${dsCount}/${rows.length} (${dsPct.toFixed(1)}%)`);

    // Average embodiment score
    const avgEmb = cRows.reduce((sum, r) => sum + r.score, 0) / cRows.length;
    console.log(`Average embodiment score: ${avgEmb.toFixed(2)}`);

    // SOTA checks
    console.log('\n──────────────────────────────');
    console.log('SOTA CRITERIA CHECK');
    console.log('──────────────────────────────');

    // Module A distinct modes (computed from Module A data)
    const moduleASeeds = [7, 23, 51, 88, 142];
    const moduleAModes = new Set<string>();
    for (const seed of moduleASeeds) {
      const r = run('philosophical', 'Who is the true friend?', seed);
      moduleAModes.add(r.questionNarrative.transformationMode);
    }
    const aDistinct = moduleAModes.size;

    console.log(`Module A distinct modes:    ${aDistinct}  (threshold: ≥3)  ${aDistinct >= 3 ? 'PASS' : 'FAIL'}`);
    console.log(`RDI:                        ${rdi.toFixed(4)}  (threshold: ≥0.6)  ${rdi >= 0.6 ? 'PASS' : 'FAIL'}`);
    console.log(`Avg embodiment score:       ${avgEmb.toFixed(2)}  (threshold: ≥2.2)  ${avgEmb >= 2.2 ? 'PASS' : 'FAIL'}`);
    console.log(`Dialectical signature:      ${dsPct.toFixed(1)}%  (threshold: ≤35%)  ${dsPct <= 35 ? 'PASS' : 'FAIL'}`);

    console.log('══════════════════════════════════════════');
  });
});
