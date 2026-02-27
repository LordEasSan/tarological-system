/**
 * Philosophical Engine — Response Generation
 *
 * Generates the final philosophical response that:
 * 1. Clarifies existential structure
 * 2. Identifies dominant attractor basins
 * 3. Indicates entropy level
 * 4. Explicitly states: "This is a structural clarification, not a deterministic prediction."
 *
 * Suppresses predictive phrasing, emphasises structure, trajectory, meaning, attractors.
 * Guarantees no deterministic fatalism, no closed-future interpretations.
 */
import type {
  PhilosophicalQuery,
  TrajectoryRestriction,
  MeaningIntegration,
  PhilosophicalInterpretation,
  PlacedCard,
} from '../../types';

// ─── Question-Type Specific Framing ─────────────────

interface InterpretiveFraming {
  openingTemplate: string;
  attractorVerb: string;
  entropyPreface: string;
  meaningVerb: string;
}

const FRAMINGS: Record<string, InterpretiveFraming> = {
  'ontological': {
    openingTemplate: 'The structural topology of the question reveals',
    attractorVerb: 'grounds itself in',
    entropyPreface: 'The ontological landscape presents',
    meaningVerb: 'The being-structure integrates through',
  },
  'teleological': {
    openingTemplate: 'The trajectory-space analysis shows a directional pull toward',
    attractorVerb: 'draws the trajectory toward',
    entropyPreface: 'The teleological horizon presents',
    meaningVerb: 'Purpose crystallises along',
  },
  'identity': {
    openingTemplate: 'The self-mapping reveals an identity space structured around',
    attractorVerb: 'shapes the becoming through',
    entropyPreface: 'The identity-space presents',
    meaningVerb: 'Integration of self proceeds through',
  },
  'meaning-of-event': {
    openingTemplate: 'The event-structure analysis reveals that the event',
    attractorVerb: 'anchors the event\'s significance in',
    entropyPreface: 'The meaning-space of the event presents',
    meaningVerb: 'Event integration follows the trajectory of',
  },
  'counterfactual-existential': {
    openingTemplate: 'The counterfactual trajectory-space bifurcation reveals',
    attractorVerb: 'would reconfigure around',
    entropyPreface: 'The alternative possibility space presents',
    meaningVerb: 'The divergent path integrates through',
  },
};

// ─── Section Generators ─────────────────────────────

function generateStructuralClarification(
  query: PhilosophicalQuery,
  trajectory: TrajectoryRestriction,
  spread: PlacedCard[],
): string {
  const framing = FRAMINGS[query.questionType] ?? FRAMINGS['ontological'];
  const topAttractors = trajectory.attractors.slice(0, 3);

  const lines: string[] = [
    `## Structural Clarification — ${query.questionType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Analysis`,
    '',
    `**Query**: "${query.rawQuestion}"`,
    `**Temporal Logic**: ${query.temporalLogic.formula} (${query.temporalLogic.orientation} orientation)`,
    '',
    `${framing.openingTemplate} a configuration dominated by **${topAttractors[0]?.archetype ?? 'undefined'}** ` +
    `(${(topAttractors[0]?.dominance ?? 0 * 100).toFixed(1)}% dominance).`,
    '',
    `The spread of ${spread.length} cards maps onto ${trajectory.attractors.length} attractor basins, ` +
    `with the primary archetypal channels being:`,
    '',
  ];

  for (const attractor of topAttractors) {
    const polarityIcon = attractor.polarity === 'constructive' ? '◈'
      : attractor.polarity === 'destructive' ? '◆' : '◇';
    lines.push(
      `- ${polarityIcon} **${attractor.archetype}** (${attractor.cardName}) — ` +
      `dominance: ${(attractor.dominance * 100).toFixed(1)}% · ` +
      `${attractor.polarity} · keywords: *${attractor.keywords.join(', ')}*`,
    );
  }

  return lines.join('\n');
}

function generateAttractorAnalysis(
  query: PhilosophicalQuery,
  trajectory: TrajectoryRestriction,
): string {
  const framing = FRAMINGS[query.questionType] ?? FRAMINGS['ontological'];
  const constructive = trajectory.attractors.filter(a => a.polarity === 'constructive');
  const destructive = trajectory.attractors.filter(a => a.polarity === 'destructive');
  const liminal = trajectory.attractors.filter(a => a.polarity === 'liminal');

  const lines: string[] = [
    '### Attractor Basin Analysis',
    '',
  ];

  if (constructive.length > 0) {
    lines.push(
      `**Constructive basins** (${constructive.length}): ` +
      `The primary constructive force ${framing.attractorVerb} ` +
      `${constructive.map(a => `*${a.archetype}*`).join(', ')}.`,
    );
    lines.push('');
  }

  if (destructive.length > 0) {
    lines.push(
      `**Destructive basins** (${destructive.length}): ` +
      `Shadow-channels active through ${destructive.map(a => `*${a.archetype}*`).join(', ')}. ` +
      `These do not indicate fate — they represent structural tensions that remain navigable.`,
    );
    lines.push('');
  }

  if (liminal.length > 0) {
    lines.push(
      `**Liminal basins** (${liminal.length}): ` +
      `Threshold archetypes ${liminal.map(a => `*${a.archetype}*`).join(', ')} ` +
      `occupy transitional positions — neither resolved nor collapsed.`,
    );
    lines.push('');
  }

  // Coliveness assessment
  lines.push(`**Coliveness**: ${trajectory.colivenessCheck.details}`);

  return lines.join('\n');
}

function generateEntropyAssessment(
  query: PhilosophicalQuery,
  trajectory: TrajectoryRestriction,
  meaning: MeaningIntegration,
): string {
  const framing = FRAMINGS[query.questionType] ?? FRAMINGS['ontological'];
  const trajectoryEntropy = trajectory.entropy;
  const meaningEntropy = meaning.entropyLevel;
  const averageEntropy = (trajectoryEntropy + meaningEntropy) / 2;

  const entropyLabel = averageEntropy > 0.7 ? 'high'
    : averageEntropy > 0.4 ? 'moderate' : 'low';

  const lines: string[] = [
    '### Entropy & Trajectory Assessment',
    '',
    `${framing.entropyPreface} **${entropyLabel} entropy** (${(averageEntropy * 100).toFixed(1)}%).`,
    '',
    `- Trajectory-space entropy: ${(trajectoryEntropy * 100).toFixed(1)}%`,
    `- Meaning-space entropy: ${(meaningEntropy * 100).toFixed(1)}%`,
    '',
  ];

  if (averageEntropy > 0.7) {
    lines.push(
      'High entropy indicates a wide-open possibility space — the structural pattern ' +
      'has not yet crystallised. This is not a deficiency; it reflects genuine openness ' +
      'in the trajectory space.',
    );
  } else if (averageEntropy > 0.4) {
    lines.push(
      'Moderate entropy indicates partial structural definition — some attractor basins ' +
      'have begun to consolidate while others remain fluid.',
    );
  } else {
    lines.push(
      'Low entropy indicates a well-defined structural pattern — the attractor basins ' +
      'have largely consolidated around dominant themes.',
    );
  }

  lines.push('');

  // Liveness
  if (trajectory.livenessHolds) {
    lines.push(
      '**Liveness**: □♢(st ∈ L) — satisfied. Open trajectories remain accessible ' +
      'regardless of current basin dominance.',
    );
  } else {
    lines.push(
      '**Liveness**: □♢(st ∈ L) — ⚠ NOT satisfied. All constructive pathways appear ' +
      'suppressed in the current configuration. This signals a need for structural ' +
      'reframing rather than a deterministic conclusion.',
    );
  }

  return lines.join('\n');
}

function generateMeaningNarrative(
  query: PhilosophicalQuery,
  meaning: MeaningIntegration,
): string {
  const framing = FRAMINGS[query.questionType] ?? FRAMINGS['ontological'];

  const lines: string[] = [
    '### Meaning Integration',
    '',
  ];

  if (meaning.integrated) {
    lines.push(
      `${framing.meaningVerb} the identified heroic trajectory:`,
      '',
      `> ${meaning.heroTrajectory}`,
      '',
      'Properties satisfied:',
      `- φ_hero (heroic pattern): ${meaning.propertiesSatisfied.heroPattern ? '✓' : '✗'}`,
      `- Cosafety F(meaningful): ${meaning.propertiesSatisfied.cosafety ? '✓' : '✗'}`,
      `- Liveness GF(live): ${meaning.propertiesSatisfied.liveness ? '✓' : '✗'}`,
    );
  } else {
    lines.push(
      meaning.liminalExplanation ?? 'No integration path found.',
      '',
      'Properties status:',
      `- φ_hero (heroic pattern): ${meaning.propertiesSatisfied.heroPattern ? '✓' : '✗'}`,
      `- Cosafety F(meaningful): ${meaning.propertiesSatisfied.cosafety ? '✓' : '✗'}`,
      `- Liveness GF(live): ${meaning.propertiesSatisfied.liveness ? '✓' : '✗'}`,
    );
  }

  return lines.join('\n');
}

const DISCLAIMER =
  '---\n\n' +
  '⚑ **This is a structural clarification, not a deterministic prediction.** ' +
  'The analysis above maps the topological structure of your question onto archetypal ' +
  'attractor basins within a formally verified trajectory space. No causal or prophetic ' +
  'claim is made. Liveness constraints ensure that no interpretation constitutes a ' +
  'closed-future assertion. The trajectory space remains open.\n\n' +
  '*— Philosophical-Ontological Query Mode · MTPS Engine*';

// ─── Public API ─────────────────────────────────────

/**
 * Generate the complete philosophical interpretation from
 * the query, trajectory restriction, and meaning integration.
 */
export function generatePhilosophicalInterpretation(
  query: PhilosophicalQuery,
  trajectory: TrajectoryRestriction,
  meaning: MeaningIntegration,
  spread: PlacedCard[],
): PhilosophicalInterpretation {
  const structuralClarification = generateStructuralClarification(query, trajectory, spread);
  const attractorAnalysis = generateAttractorAnalysis(query, trajectory);
  const entropyAssessment = generateEntropyAssessment(query, trajectory, meaning);
  const meaningNarrative = generateMeaningNarrative(query, meaning);

  const fullText = [
    structuralClarification,
    '',
    attractorAnalysis,
    '',
    entropyAssessment,
    '',
    meaningNarrative,
    '',
    DISCLAIMER,
  ].join('\n');

  return {
    structuralClarification,
    attractorAnalysis,
    entropyAssessment,
    meaningNarrative,
    disclaimer: DISCLAIMER,
    fullText,
  };
}
