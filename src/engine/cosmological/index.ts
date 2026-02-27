/**
 * Cosmological Engine — Barrel Exports
 *
 * All public API for the Cosmological / Universal Archetypal Mode.
 */
export {
  parseCosmologicalQuestion,
  classifyCosmologicalQuestion,
  isCosmologicalScope,
  hasPersonalPronouns,
  hasDecisionLanguage,
} from './question-parser';
export { computeArchetypalConfiguration } from './configuration';
export { generateCosmologicalInterpretation } from './response-generator';
export { executeCosmologicalQuery } from './orchestrator';
