/**
 * Narrative Variation Engine — controlled syntactic diversity across cards.
 *
 * Problem: The thesis/destabilization/reconfiguration templates produce
 * beautiful philosophical content but can exhibit syntactic repetition
 * across cards in the same spread (similar sentence openings, parallel
 * structures).
 *
 * Solution: Apply deterministic syntactic transformations after generation.
 * Each card receives a variation index derived from (card name, role, depth),
 * which selects a syntactic wrapper pattern. This produces lexical diversity
 * without altering philosophical content.
 *
 * Constraints:
 *   - 3-phase structure (thesis → destabilization → reconfiguration) preserved
 *   - Symbolic logic unchanged
 *   - Epistemic framework untouched
 *   - Deterministic (same inputs → same output)
 *   - No added verbosity
 *   - Tonal austerity maintained
 */

import type { SymbolicRole } from '../../types';
import type { QuestionMode } from './question-mode';

// ─── Internal hash (same as question-narrative.ts) ──

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// ─── Syntactic Openers ──────────────────────────────
// Each array has 5 entries — one per variation index.
// They wrap the FIRST SENTENCE of each phase to prevent
// identical syntactic openings across cards.

/**
 * Thesis openers — the claim phase.
 * Applied when the thesis begins with a card-name bold pattern.
 */
const THESIS_OPENERS: string[] = [
  '',                          // 0: no change (preserve original)
  'Here: ',                    // 1: deictic anchor
  'Mark this — ',              // 2: imperative declaration
  'At this position: ',        // 3: spatial reference
  'Now — ',                    // 4: temporal urgency
];

/**
 * Destabilization connectors — the tension/shadow phase.
 * Applied to vary the adversative transition.
 */
const DESTABILIZATION_CONNECTORS: string[] = [
  '',                          // 0: no change
  'And yet — ',                // 1: soft adversative
  'Against this: ',            // 2: structural opposition
  'The reversal: ',            // 3: inversion signal
  'Beneath the claim — ',     // 4: undermining
];

/**
 * Reconfiguration frames — the synthesis/new-ground phase.
 * Applied to vary the resolution opening.
 */
const RECONFIGURATION_FRAMES: string[] = [
  '',                          // 0: no change
  'What remains: ',            // 1: residual
  'The ground shifts — ',      // 2: movement
  'After this: ',              // 3: temporal aftermath
  'Reconfigured: ',            // 4: explicit transform
];

// ─── Role-Based Variation Seeds ─────────────────────
// Each role biases toward certain variation indices.
// This ensures anchor cards feel grounded, catalysts dynamic, etc.

const ROLE_VARIATION_BIAS: Record<SymbolicRole, number> = {
  anchor: 0,    // anchor → stable/grounded openers
  catalyst: 2,  // catalyst → imperative/dynamic
  shadow: 3,    // shadow → reversal/undermining
  bridge: 1,    // bridge → connective/soft
};

// ─── QuestionMode Skew ──────────────────────────────
// Slight adjustment to prevent all cards in the same mode from
// getting the same variation index by adding mode-based offset.

const MODE_SKEW: Record<QuestionMode, number> = {
  relational: 0,
  existential: 1,
  causal: 2,
  teleological: 3,
  predictive: 4,
};

// ─── Variation Index Computation ────────────────────

/**
 * Compute a variation index ∈ [0, 4] for a given card at a given phase.
 * Deterministic: same inputs always produce the same index.
 */
function variationIndex(
  cardName: string,
  role: SymbolicRole,
  depth: number,
  phase: 'thesis' | 'destabilization' | 'reconfiguration',
  questionMode: QuestionMode,
): number {
  const seed = hash(cardName + phase + String(depth));
  const roleBias = ROLE_VARIATION_BIAS[role];
  const modeSkew = MODE_SKEW[questionMode];
  return (seed + roleBias + modeSkew + depth) % 5;
}

// ─── Apply Variation ────────────────────────────────

/**
 * Apply syntactic variation to a thesis string.
 * Only prepends opener if the thesis doesn't already start with an
 * identical prefix. If idx === 0, returns original.
 */
export function varyThesis(
  thesis: string,
  cardName: string,
  role: SymbolicRole,
  depth: number,
  questionMode: QuestionMode,
): string {
  const idx = variationIndex(cardName, role, depth, 'thesis', questionMode);
  const opener = THESIS_OPENERS[idx];
  if (!opener) return thesis;

  // Don't double-prefix if the thesis already starts with the opener
  if (thesis.startsWith(opener)) return thesis;
  return opener + thesis;
}

/**
 * Apply syntactic variation to a destabilization string.
 */
export function varyDestabilization(
  destabilization: string,
  cardName: string,
  role: SymbolicRole,
  depth: number,
  questionMode: QuestionMode,
): string {
  const idx = variationIndex(cardName, role, depth, 'destabilization', questionMode);
  const connector = DESTABILIZATION_CONNECTORS[idx];
  if (!connector) return destabilization;
  if (destabilization.startsWith(connector)) return destabilization;
  return connector + destabilization;
}

/**
 * Apply syntactic variation to a reconfiguration string.
 */
export function varyReconfiguration(
  reconfiguration: string,
  cardName: string,
  role: SymbolicRole,
  depth: number,
  questionMode: QuestionMode,
): string {
  const idx = variationIndex(cardName, role, depth, 'reconfiguration', questionMode);
  const frame = RECONFIGURATION_FRAMES[idx];
  if (!frame) return reconfiguration;
  if (reconfiguration.startsWith(frame)) return reconfiguration;
  return frame + reconfiguration;
}

/**
 * Apply all three variations to a transformation step's text.
 * Returns { thesis, destabilization, reconfiguration } with variation applied.
 */
export function applyNarrativeVariation(
  thesis: string,
  destabilization: string,
  reconfiguration: string,
  cardName: string,
  role: SymbolicRole,
  depth: number,
  questionMode: QuestionMode,
): { thesis: string; destabilization: string; reconfiguration: string } {
  return {
    thesis: varyThesis(thesis, cardName, role, depth, questionMode),
    destabilization: varyDestabilization(destabilization, cardName, role, depth, questionMode),
    reconfiguration: varyReconfiguration(reconfiguration, cardName, role, depth, questionMode),
  };
}

/**
 * Check whether any two strings in a set share the same opening pattern
 * (first 30 characters). Used by the quality validator.
 */
export function hasRepeatedOpenings(texts: string[], windowSize = 30): boolean {
  const openings = texts.map(t => t.slice(0, windowSize).toLowerCase());
  return new Set(openings).size < openings.length;
}
