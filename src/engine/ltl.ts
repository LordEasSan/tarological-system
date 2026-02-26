/**
 * Engine — LTL Verification Module
 *
 * Implements Linear Temporal Logic property checking for tarot readings.
 * Four property classes: Safety G(φ), Co-safety F(φ), Liveness GF(φ), Co-liveness FG(φ).
 */
import type { PlacedCard, LTLProperty, LTLVerification, LTLPropertyType, TarotParameters } from '../types';

/** Property definition template */
interface PropertyTemplate {
  name: string;
  type: LTLPropertyType;
  formula: string;
  check: (spread: PlacedCard[], params: TarotParameters) => { passed: boolean; details: string };
}

/** Core LTL property templates */
const PROPERTY_TEMPLATES: PropertyTemplate[] = [
  // Safety: G(φ) — invariants that must hold in every state
  {
    name: 'Card Uniqueness',
    type: 'safety',
    formula: 'G(∀i,j: i≠j → card(i) ≠ card(j))',
    check: (spread) => {
      const ids = spread.map(s => s.card.id);
      const unique = new Set(ids).size === ids.length;
      return {
        passed: unique,
        details: unique
          ? `All ${ids.length} cards are unique`
          : `Duplicate cards detected: ${ids.filter((id, i) => ids.indexOf(id) !== i).join(', ')}`,
      };
    },
  },
  {
    name: 'Valid Positions',
    type: 'safety',
    formula: 'G(∀c: position(c) ∈ Layout)',
    check: (spread) => {
      const allValid = spread.every(s => s.position.index >= 0 && s.position.label.length > 0);
      return {
        passed: allValid,
        details: allValid ? 'All positions are valid' : 'Invalid position detected',
      };
    },
  },

  // Co-safety: F(φ) — properties achieved at some finite point
  {
    name: 'Spread Completeness',
    type: 'cosafety',
    formula: 'F(|placed| = |positions|)',
    check: (spread, params) => {
      const complete = spread.length >= params.drawCount;
      return {
        passed: complete,
        details: `${spread.length}/${params.drawCount} positions filled`,
      };
    },
  },
  {
    name: 'Major Arcana Present',
    type: 'cosafety',
    formula: 'F(∃c: isMajor(c))',
    check: (spread) => {
      const hasMajor = spread.some(s => s.card.isMajor);
      return {
        passed: hasMajor,
        details: hasMajor
          ? `Major Arcana found: ${spread.filter(s => s.card.isMajor).map(s => s.card.name).join(', ')}`
          : 'No Major Arcana in spread',
      };
    },
  },

  // Liveness: GF(φ) — properties recurring infinitely
  {
    name: 'Archetype Diversity',
    type: 'liveness',
    formula: 'GF(diverse(archetypes))',
    check: (spread) => {
      const archetypes = new Set(spread.map(s => s.card.archetype));
      const ratio = archetypes.size / spread.length;
      const passed = ratio >= 0.5;
      return {
        passed,
        details: `${archetypes.size} unique archetypes across ${spread.length} cards (${(ratio * 100).toFixed(0)}% diversity)`,
      };
    },
  },

  // Co-liveness: FG(φ) — eventual stability
  {
    name: 'Narrative-Spread Coherence',
    type: 'coliveness',
    formula: 'FG(coherent(narrative, spread))',
    check: (spread) => {
      // Heuristic: check that cards have keywords and meanings
      const allHaveMeaning = spread.every(s => s.card.meaningUp && s.card.meaningUp.length > 0);
      return {
        passed: allHaveMeaning,
        details: allHaveMeaning
          ? 'All cards have narrative-ready meanings'
          : 'Some cards lack meaning data for narrative coherence',
      };
    },
  },
];

/**
 * Run all LTL property checks against a reading
 */
export function verifyReading(
  spread: PlacedCard[],
  params: TarotParameters,
): LTLVerification {
  const startTime = performance.now();

  const properties: LTLProperty[] = PROPERTY_TEMPLATES.map(template => {
    const result = template.check(spread, params);
    return {
      name: template.name,
      type: template.type,
      formula: template.formula,
      passed: result.passed,
      details: result.details,
    };
  });

  const endTime = performance.now();

  return {
    overallPassed: properties.every(p => p.passed),
    timestamp: new Date().toISOString(),
    properties,
    executionTimeMs: Math.round(endTime - startTime),
  };
}

/**
 * Get property templates for display/configuration
 */
export function getPropertyTemplates(): Array<{ name: string; type: LTLPropertyType; formula: string }> {
  return PROPERTY_TEMPLATES.map(({ name, type, formula }) => ({ name, type, formula }));
}
