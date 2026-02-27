/**
 * Philosophical Engine — Barrel Exports
 *
 * All public API for the Philosophical-Ontological Query Mode.
 */
export { parseQuestion, classifyQuestion } from './question-parser';
export { computeTrajectoryRestriction } from './trajectory';
export { computeMeaningIntegration } from './meaning-integration';
export { generatePhilosophicalInterpretation } from './response-generator';
export {
  generateNarrativeIntegration,
  generateNarrativeIntegrationSync,
  generateLocalNarrative,
  buildNarrativeInput,
} from './narrative-integration';
export type { NarrativeIntegrationInput } from './narrative-integration';
export { executePhilosophicalQuery } from './orchestrator';
