/**
 * Cosmological Engine — Response Generation
 *
 * Generates the symbolic-archetypal interpretation:
 * 1. Symbolic model of the universal question
 * 2. Archetypal map of forces and their roles
 * 3. Polarity analysis (generative sequences)
 * 4. System-level entropy assessment
 * 5. Disclaimer: "This is a symbolic-archetypal representation, not a scientific explanation."
 *
 * Constraints:
 * - No empirical cosmology claims
 * - No scientific authority tone
 * - No predictive phrasing
 * - Cards interpreted as archetypal forces, not events
 */
import type {
  CosmologicalQuery,
  ArchetypalConfiguration,
  CosmologicalInterpretation,
  PlacedCard,
} from '../../types';

// ─── Question-Type Framing ──────────────────────────

interface InterpretiveFraming {
  openingTemplate: string;
  forceVerb: string;
  entropyPreface: string;
}

const FRAMINGS: Record<string, InterpretiveFraming> = {
  'cosmogonic': {
    openingTemplate: 'The archetypal configuration maps origin and emergence through',
    forceVerb: 'emerges through the generative field of',
    entropyPreface: 'The cosmogonic landscape presents',
  },
  'structural-universal': {
    openingTemplate: 'The universal structure reveals an archetypal scaffolding grounded in',
    forceVerb: 'anchors the structural field within',
    entropyPreface: 'The structural-universal domain presents',
  },
  'archetypal-essence': {
    openingTemplate: 'The archetypal essence crystallises around a symbolic nucleus of',
    forceVerb: 'distils the essence through',
    entropyPreface: 'The archetypal essence field presents',
  },
  'symbolic-logic': {
    openingTemplate: 'The symbolic logic configures a coherent archetypal grammar through',
    forceVerb: 'articulates the symbolic order via',
    entropyPreface: 'The symbolic-logical field presents',
  },
  'consciousness': {
    openingTemplate: 'The archetypal mapping of consciousness reveals a configuration structured by',
    forceVerb: 'integrates the awareness field through',
    entropyPreface: 'The consciousness field presents',
  },
};

// ─── Section Generators ─────────────────────────────

function generateSymbolicModel(
  query: CosmologicalQuery,
  config: ArchetypalConfiguration,
  spread: PlacedCard[],
): string {
  const framing = FRAMINGS[query.questionType] ?? FRAMINGS['structural-universal'];
  const topForces = config.forces.slice(0, 3);

  const lines: string[] = [
    `## Symbolic Model — ${query.questionType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Inquiry`,
    '',
    `**Query**: "${query.rawQuestion}"`,
    `**Temporal Logic**: ${query.temporalLogic.formula} (${query.temporalLogic.scope} scope)`,
    `**Domain Nouns**: ${query.embedding.domainNouns.join(', ') || 'general abstract'}`,
    '',
    `${framing.openingTemplate} **${topForces[0]?.archetype ?? 'undefined'}** ` +
    `(${(topForces[0]?.weight ?? 0 * 100).toFixed(1)}% symbolic weight).`,
    '',
    `The spread of ${spread.length} cards maps onto ${config.forces.length} archetypal forces, ` +
    `with the primary symbolic channels being:`,
    '',
  ];

  for (const force of topForces) {
    const roleIcon = force.role === 'generative' ? '⊕'
      : force.role === 'structuring' ? '▣'
      : force.role === 'dissolving' ? '⊖' : '◎';
    lines.push(
      `- ${roleIcon} **${force.archetype}** (${force.cardName}) — ` +
      `weight: ${(force.weight * 100).toFixed(1)}% · ` +
      `${force.role} · keywords: *${force.keywords.join(', ')}*`,
    );
  }

  return lines.join('\n');
}

function generateArchetypalMap(
  query: CosmologicalQuery,
  config: ArchetypalConfiguration,
): string {
  const framing = FRAMINGS[query.questionType] ?? FRAMINGS['structural-universal'];

  const byRole = {
    generative: config.forces.filter(f => f.role === 'generative'),
    structuring: config.forces.filter(f => f.role === 'structuring'),
    dissolving: config.forces.filter(f => f.role === 'dissolving'),
    synthesising: config.forces.filter(f => f.role === 'synthesising'),
  };

  const lines: string[] = [
    '### Archetypal Map — ΨQᵤ',
    '',
    `**Emergence Order**: ${config.emergenceOrder.join(' → ')}`,
    '',
  ];

  if (byRole.generative.length > 0) {
    lines.push(
      `**Generative Forces** (${byRole.generative.length}): ` +
      `The primary generative channel ${framing.forceVerb} ` +
      `${byRole.generative.map(f => `*${f.archetype}*`).join(', ')}. ` +
      `These represent the creative-emergent principle within the symbolic model.`,
    );
    lines.push('');
  }

  if (byRole.structuring.length > 0) {
    lines.push(
      `**Structuring Forces** (${byRole.structuring.length}): ` +
      `${byRole.structuring.map(f => `*${f.archetype}*`).join(', ')} ` +
      `provide the ordering principle — the symbolic scaffolding that ` +
      `gives form to the inquiry.`,
    );
    lines.push('');
  }

  if (byRole.dissolving.length > 0) {
    lines.push(
      `**Dissolving Forces** (${byRole.dissolving.length}): ` +
      `${byRole.dissolving.map(f => `*${f.archetype}*`).join(', ')} ` +
      `represent the entropy principle — transformative dissolution that ` +
      `clears space for new configuration. These are symbolic, not destructive events.`,
    );
    lines.push('');
  }

  if (byRole.synthesising.length > 0) {
    lines.push(
      `**Synthesising Forces** (${byRole.synthesising.length}): ` +
      `${byRole.synthesising.map(f => `*${f.archetype}*`).join(', ')} ` +
      `mediate the integration of polarity into coherent symbolic unity.`,
    );
    lines.push('');
  }

  return lines.join('\n');
}

function generatePolarityAnalysis(
  config: ArchetypalConfiguration,
): string {
  const lines: string[] = [
    '### Polarity Analysis — Generative Sequences',
    '',
  ];

  if (config.polaritySequences.length === 0) {
    lines.push('No polarised dyads detected — the configuration is homogeneous.');
    return lines.join('\n');
  }

  for (let i = 0; i < config.polaritySequences.length; i++) {
    const seq = config.polaritySequences[i];
    lines.push(
      `**Sequence ${i + 1}**: *${seq.positive}* ↔ *${seq.negative}* → *${seq.synthesis}*`,
    );
    lines.push(
      `The polarity between ${seq.positive} and ${seq.negative} resolves symbolically ` +
      `through ${seq.synthesis} — not as a causal mechanism, but as an archetypal pattern.`,
    );
    lines.push('');
  }

  return lines.join('\n');
}

function generateEntropyAssessment(
  query: CosmologicalQuery,
  config: ArchetypalConfiguration,
): string {
  const framing = FRAMINGS[query.questionType] ?? FRAMINGS['structural-universal'];
  const entropyLabel = config.systemEntropy > 0.7 ? 'high'
    : config.systemEntropy > 0.4 ? 'moderate' : 'low';

  const lines: string[] = [
    '### System Entropy Assessment',
    '',
    `${framing.entropyPreface} **${entropyLabel} entropy** (${(config.systemEntropy * 100).toFixed(1)}%).`,
    '',
  ];

  if (config.systemEntropy > 0.7) {
    lines.push(
      'High system entropy indicates a maximally open symbolic field — the archetypal ' +
      'configuration has not yet consolidated into a dominant pattern. This signals ' +
      'genuine ontological openness in the symbolic model, not a failure of interpretation.',
    );
  } else if (config.systemEntropy > 0.4) {
    lines.push(
      'Moderate entropy indicates partial archetypal consolidation — some forces ' +
      'have begun to dominate while others remain in symbolic flux.',
    );
  } else {
    lines.push(
      'Low entropy indicates a well-defined archetypal configuration — the symbolic ' +
      'forces have largely consolidated around dominant patterns.',
    );
  }

  return lines.join('\n');
}

const DISCLAIMER =
  '---\n\n' +
  '⚑ **This is a symbolic-archetypal representation, not a scientific explanation.** ' +
  'The analysis above maps your universal inquiry onto an archetypal configuration space. ' +
  'No empirical, causal, or scientific claims are made. Cards are interpreted as ' +
  'archetypal forces, not events or predictions. The symbolic model remains open.\n\n' +
  '*— Cosmological / Universal Archetypal Mode · MTPS Engine*';

// ─── Public API ─────────────────────────────────────

/**
 * Generate the complete cosmological interpretation.
 */
export function generateCosmologicalInterpretation(
  query: CosmologicalQuery,
  config: ArchetypalConfiguration,
  spread: PlacedCard[],
): CosmologicalInterpretation {
  const symbolicModel = generateSymbolicModel(query, config, spread);
  const archetypalMap = generateArchetypalMap(query, config);
  const polarityAnalysis = generatePolarityAnalysis(config);
  const entropyAssessment = generateEntropyAssessment(query, config);

  const fullText = [
    symbolicModel,
    '',
    archetypalMap,
    '',
    polarityAnalysis,
    '',
    entropyAssessment,
    '',
    DISCLAIMER,
  ].join('\n');

  return {
    symbolicModel,
    archetypalMap,
    polarityAnalysis,
    entropyAssessment,
    disclaimer: DISCLAIMER,
    fullText,
  };
}
