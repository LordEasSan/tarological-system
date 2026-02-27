/**
 * Core — Interpretive Lens
 *
 * Mode does NOT change the engine.
 * Mode changes the InterpretiveWeightVector W_mode.
 *
 * All modes interpret the SAME spread differently,
 * not generate different pipelines.
 *
 * Divinatory: Temporal unfolding, future trajectory restriction, practical emphasis.
 * Philosophical: Identity, attractor basin shifts, existential trajectory.
 * Cosmological: Archetypal polarity emergence, structural principles.
 */
import type { InterrogationMode, InterpretiveWeightVector } from '../../types';

// ─── Predefined Lens Vectors ────────────────────────

const LENSES: Record<InterrogationMode, InterpretiveWeightVector> = {
  divinatory: {
    mode: 'divinatory',
    temporalEmphasis: 0.9,
    identityEmphasis: 0.3,
    archetypalPolarityEmphasis: 0.4,
    structuralPrincipleEmphasis: 0.3,
    practicalEmphasis: 0.8,
    lensDescription:
      'Temporal-Unfolding Lens — Emphasizes the sequential flow of symbolic time: ' +
      'past influences, present dynamics, and future trajectory. Cards are read as ' +
      'waypoints in a temporal arc, mapping how symbolic forces unfold across the ' +
      'reading\'s structure. Practical connections to lived experience are prioritized. ' +
      'The configuration is interpreted as a map of possible trajectories, ' +
      'not as a deterministic forecast.',
  },
  philosophical: {
    mode: 'philosophical',
    temporalEmphasis: 0.4,
    identityEmphasis: 0.9,
    archetypalPolarityEmphasis: 0.6,
    structuralPrincipleEmphasis: 0.7,
    practicalEmphasis: 0.2,
    lensDescription:
      'Identity-Trajectory Lens — Emphasizes identity formation, being, and the ' +
      'topology of self-construction. Cards are read as attractor basins in an ' +
      'existential trajectory space. The reading maps structural possibilities ' +
      'rather than events, with focus on how archetypes shape the becoming-process. ' +
      'No predictive claims are made — all output is structural clarification.',
  },
  cosmological: {
    mode: 'cosmological',
    temporalEmphasis: 0.3,
    identityEmphasis: 0.2,
    archetypalPolarityEmphasis: 0.9,
    structuralPrincipleEmphasis: 0.9,
    practicalEmphasis: 0.1,
    lensDescription:
      'Archetypal-Polarity Lens — Emphasizes universal principles, archetypal ' +
      'polarities, and structural emergence. Cards are read as symbolic forces in ' +
      'a cosmological configuration — generative, structuring, dissolving, and ' +
      'synthesizing principles. No personal or temporal framing is applied; ' +
      'interpretation operates at the purely universal-abstract level. ' +
      'No empirical or scientific claims are made.',
  },
};

// ─── Public API ─────────────────────────────────────

/**
 * Get the InterpretiveWeightVector for a given mode.
 * Returns a defensive copy.
 */
export function getInterpretiveLens(mode: InterrogationMode): InterpretiveWeightVector {
  return { ...LENSES[mode] };
}

/**
 * Get the lens description for display purposes.
 */
export function getLensDescription(mode: InterrogationMode): string {
  return LENSES[mode].lensDescription;
}

/**
 * Get all available lenses with their mode identifiers.
 */
export function getAllLenses(): InterpretiveWeightVector[] {
  return Object.values(LENSES).map(l => ({ ...l }));
}
