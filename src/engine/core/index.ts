/**
 * Core Engine — Barrel Exports
 *
 * Unified symbolic-first architecture:
 *   core/spread-generator.ts     → Mode-independent spread generation
 *   core/bias-vector.ts          → InterpretiveBiasVector from question
 *   core/interaction-matrix.ts   → CardInteractionMatrix M(i,j)
 *   core/symbolic-configuration.ts → SymbolicConfiguration S
 *   core/interpretive-lens.ts    → InterpretiveWeightVector per mode
 *   core/narrative-integration.ts → UnifiedNarrative generation
 *   core/unified-pipeline.ts     → Single entry-point pipeline
 */

export { generateSpread } from './spread-generator';
export type { SpreadResult } from './spread-generator';

export { computeBiasVector } from './bias-vector';

export { computeInteractionMatrix } from './interaction-matrix';

export { computeSymbolicConfiguration } from './symbolic-configuration';

export { getInterpretiveLens, getLensDescription, getAllLenses } from './interpretive-lens';

export { generateUnifiedNarrative } from './narrative-integration';

export { executeUnifiedReading, reinterpretReading } from './unified-pipeline';
