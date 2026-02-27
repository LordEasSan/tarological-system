/**
 * MTPS Engine — Modular Architecture
 *
 * Exports all engine modules:
 * - archetypes: Archetype families & mappings
 * - spreads: Spread layouts & positions
 * - narrative: Narrative generation & synthesis
 * - ltl: LTL temporal-logic verification
 * - meaning: Meaning function μ(c, θ)
 * - scoring: D1-D6 quality dimensions
 * - iteration: Adaptive stopping & iteration logging
 */
export { ARCHETYPE_FAMILIES, getArchetypeFamily, getArchetypeForCard } from './archetypes';
export type { ArchetypeMapping, ArchetypeFamilyDef } from './archetypes';

export { SPREAD_LAYOUTS, SPREAD_OPTIONS, getSpreadLayout, getSpreadPositions, getDefaultCardCount } from './spreads';

export { generateNarrative, generateSynthesis } from './narrative';
export type { NarrativeConfig, GeneratedNarrative, NarrativeSection } from './narrative';

export { verifyReading, getPropertyTemplates } from './ltl';

export { computeCardMeaning, analyzeSpreadMeaning } from './meaning';
export type { CardMeaningScore, SpreadMeaningAnalysis } from './meaning';

export { computeQualityScore, evaluateDimension, QUALITY_DIMENSIONS } from './scoring';
export type { QualityScore, DimensionScore, QualityDimension } from './scoring';

export { IterationRunner, DEFAULT_ITERATION_CONFIG } from './iteration';
export type { IterationLog, IterationEntry, IterationConfig, IterationCallback, DimensionTrend } from './iteration';

// Philosophical-Ontological Query Mode (parallel interpretive layer)
export {
  parseQuestion,
  classifyQuestion,
  computeTrajectoryRestriction,
  computeMeaningIntegration,
  generatePhilosophicalInterpretation,
  generateNarrativeIntegration,
  generateNarrativeIntegrationSync,
  generateLocalNarrative,
  buildNarrativeInput,
  executePhilosophicalQuery,
} from './philosophical';
export type { NarrativeIntegrationInput } from './philosophical';
