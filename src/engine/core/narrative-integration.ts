/**
 * Core — Narrative Integration Layer (Mandatory)
 *
 * Generates an integrated narrative THROUGH the card configuration.
 * The narrative must:
 *   - Explicitly reference every extracted card
 *   - Explain why that specific configuration answers the question
 *   - Map card interactions to question themes
 *   - Apply mode-specific vocabulary and emphasis
 *   - Avoid semantic-only reasoning (must ground in cards)
 *   - Preserve openness / avoid deterministic closure
 *   - Include mode-appropriate disclaimer
 *
 * Input:
 *   - SymbolicConfiguration S
 *   - Question + BiasVector
 *   - PersonalizationContext
 *   - InterpretiveWeightVector (mode lens)
 *
 * Output: UnifiedNarrative
 */
import type {
  PlacedCard,
  SymbolicConfiguration,
  InterpretiveBiasVector,
  InterpretiveWeightVector,
  UserProfileContext,
  UnifiedNarrative,
  InterrogationMode,
  DominantArchetype,
} from '../../types';

// ─── Mode-Specific Vocabulary ───────────────────────

interface ModeVocabulary {
  cardVerbs: string[];
  structureWords: string[];
  tensionFraming: string;
  roleLabels: Record<string, string>;
  responseOpening: string;
  opennessStatement: string;
}

const VOCABULARY: Record<InterrogationMode, ModeVocabulary> = {
  divinatory: {
    cardVerbs: ['indicates', 'reveals', 'signals', 'points toward', 'illuminates'],
    structureWords: ['path', 'journey', 'trajectory', 'unfolding', 'temporal arc'],
    tensionFraming: 'These opposing forces create a dynamic tension along the temporal trajectory, suggesting an active process of resolution.',
    roleLabels: {
      anchor: 'central influence',
      catalyst: 'driving force',
      shadow: 'hidden challenge',
      bridge: 'connecting thread',
    },
    responseOpening: 'The temporal arc of this configuration',
    opennessStatement: 'This reading maps a symbolic trajectory — a landscape of possible unfolding, not a fixed destination. The path remains open to the agency of the questioner.',
  },
  philosophical: {
    cardVerbs: ['maps', 'situates', 'grounds', 'structures', 'configures'],
    structureWords: ['attractor basin', 'trajectory space', 'existential topology', 'identity field', 'being-structure'],
    tensionFraming: 'This structural polarity does not resolve into prediction but maps the topological edges of the current trajectory space.',
    roleLabels: {
      anchor: 'primary attractor basin',
      catalyst: 'trajectory catalyst',
      shadow: 'shadow channel',
      bridge: 'liminal bridge',
    },
    responseOpening: 'The attractor topology of this configuration',
    opennessStatement: 'This is a structural clarification, not a deterministic prediction. The trajectory space remains open, and liveness constraints ensure that no interpretation constitutes a closed-future assertion.',
  },
  cosmological: {
    cardVerbs: ['embodies', 'manifests', 'configures', 'projects', 'instantiates'],
    structureWords: ['archetypal force', 'polarity field', 'emergence principle', 'symbolic structure', 'generative matrix'],
    tensionFraming: 'This polarity between symbolic forces represents an archetypal pattern — not a causal mechanism, but a structural principle of the symbolic field.',
    roleLabels: {
      anchor: 'primary archetypal force',
      catalyst: 'generative principle',
      shadow: 'dissolving principle',
      bridge: 'synthesising principle',
    },
    responseOpening: 'The archetypal configuration of these forces',
    opennessStatement: 'This is a symbolic-archetypal representation, not a scientific explanation. Cards are interpreted as archetypal forces, not events or empirical claims. The symbolic model remains open.',
  },
};

// ─── Disclaimers ────────────────────────────────────

const DISCLAIMERS: Record<InterrogationMode, string> = {
  divinatory:
    '---\n\n' +
    '⚑ **This reading offers a symbolic trajectory map, not a deterministic prediction.** ' +
    'The card configuration opens a space of interpretive possibility, grounded in the ' +
    'archetypal resonance of the drawn cards. No causal, prophetic, or fated claim is made. ' +
    'The trajectory space remains open to choice and agency.\n\n' +
    '*— Unified Symbolic Reading · Divinatory Lens · MTPS Engine*',
  philosophical:
    '---\n\n' +
    '⚑ **This is a structural clarification, not a deterministic prediction.** ' +
    'The analysis maps the topological structure of your question onto archetypal ' +
    'attractor basins within a formally verified trajectory space. No causal or prophetic ' +
    'claim is made. Liveness constraints ensure that no interpretation constitutes a ' +
    'closed-future assertion. The trajectory space remains open.\n\n' +
    '*— Unified Symbolic Reading · Philosophical Lens · MTPS Engine*',
  cosmological:
    '---\n\n' +
    '⚑ **This is a symbolic-archetypal representation, not a scientific explanation.** ' +
    'The analysis maps your universal inquiry onto an archetypal configuration space. ' +
    'No empirical, causal, or scientific claims are made. Cards are interpreted as ' +
    'archetypal forces, not events. The symbolic model remains open.\n\n' +
    '*— Unified Symbolic Reading · Cosmological Lens · MTPS Engine*',
};

// ─── Card Narrative Generation ──────────────────────

function selectVerb(mode: InterrogationMode, index: number): string {
  const verbs = VOCABULARY[mode].cardVerbs;
  return verbs[index % verbs.length];
}

function generateCardParagraph(
  card: PlacedCard,
  archetype: DominantArchetype,
  mode: InterrogationMode,
  biasVector: InterpretiveBiasVector,
  cardIndex: number,
): string {
  const { card: c, position } = card;
  const reversed = c.isReversed ? ' (reversed)' : '';
  const meaning = c.isReversed ? c.meaningReversed : c.meaningUp;
  const vocab = VOCABULARY[mode];
  const verb = selectVerb(mode, cardIndex);
  const roleLabel = vocab.roleLabels[archetype.role];

  // Find relevant question keywords that resonate with this card
  const resonantKeywords = biasVector.keywords.filter(kw =>
    c.keywords.some(ck => ck.toLowerCase().includes(kw) || kw.includes(ck.toLowerCase())),
  );
  const keywordNote = resonantKeywords.length > 0
    ? ` This resonates directly with the question's focus on *${resonantKeywords.join(', ')}*.`
    : '';

  return `**${c.name}**${reversed} at *${position.label}* — As the ${roleLabel}, ` +
    `this card ${verb} the presence of the ${c.archetype} archetype ` +
    `(score: ${(archetype.score * 100).toFixed(1)}%). ${meaning}${keywordNote} ` +
    `Keywords: *${c.keywords.join(', ')}*.`;
}

// ─── Section Generators ─────────────────────────────

function generateOpeningSection(
  mode: InterrogationMode,
  question: string,
  _lens: InterpretiveWeightVector,
  config: SymbolicConfiguration,
  spread: PlacedCard[],
): string {
  const entropyLabel = config.entropy > 0.7 ? 'high' : config.entropy > 0.4 ? 'moderate' : 'low';
  const modeLabel = mode === 'divinatory' ? 'Temporal-Unfolding'
    : mode === 'philosophical' ? 'Identity-Trajectory' : 'Archetypal-Polarity';

  const questionLine = question
    ? `**Question**: "${question}"\n`
    : '**Open Reading** — No specific question constrains the interpretation.\n';

  return [
    `## Unified Symbolic Reading — ${modeLabel} Lens`,
    '',
    questionLine,
    `**Mode Lens**: ${modeLabel} · **Spread**: ${spread.length} cards · ` +
    `**Entropy**: ${entropyLabel} (${(config.entropy * 100).toFixed(1)}%)`,
    '',
    `The ${spread.length}-card configuration presents a symbolic field with ` +
    `${config.tensionPairs.length} tension pair${config.tensionPairs.length !== 1 ? 's' : ''}, ` +
    `${config.entropicClusters.length} thematic cluster${config.entropicClusters.length !== 1 ? 's' : ''}, ` +
    `and ${entropyLabel} structural entropy.`,
  ].join('\n');
}

function generateSymbolicMovementSection(
  config: SymbolicConfiguration,
  mode: InterrogationMode,
): string {
  const vocab = VOCABULARY[mode];
  const movement = config.symbolicMovement;

  return [
    '### Symbolic Movement',
    '',
    `The sequential ${vocab.structureWords[0]} through the spread traces:`,
    '',
    movement.map((m, i) => `${i + 1}. ${m}`).join('\n'),
  ].join('\n');
}

function generateCardConfigSection(
  spread: PlacedCard[],
  config: SymbolicConfiguration,
  mode: InterrogationMode,
  biasVector: InterpretiveBiasVector,
): { section: string; cardRefs: Record<string, string> } {
  const cardRefs: Record<string, string> = {};

  const paragraphs: string[] = [
    '### Card Configuration',
    '',
  ];

  // Match each card to its dominant archetype entry
  for (let i = 0; i < spread.length; i++) {
    const card = spread[i];
    const archEntry = config.dominantArchetypes.find(a => a.cardId === card.card.id);
    if (!archEntry) continue;

    const para = generateCardParagraph(card, archEntry, mode, biasVector, i);
    paragraphs.push(para);
    paragraphs.push('');

    cardRefs[card.card.name] = para;
  }

  return { section: paragraphs.join('\n'), cardRefs };
}

function generateTensionSection(
  config: SymbolicConfiguration,
  mode: InterrogationMode,
): string {
  const vocab = VOCABULARY[mode];

  if (config.tensionPairs.length === 0) {
    return [
      '### Polarity Dynamics',
      '',
      'No significant polarity tensions detected — the symbolic field presents a ' +
      'relatively harmonious configuration.',
    ].join('\n');
  }

  const lines: string[] = [
    '### Polarity Dynamics',
    '',
  ];

  for (const pair of config.tensionPairs) {
    lines.push(
      `**${pair.positive.cardName}** (${pair.positive.archetype}) ↔ ` +
      `**${pair.negative.cardName}** (${pair.negative.archetype}) — ` +
      `tension: ${(pair.tensionScore * 100).toFixed(0)}%`,
    );
  }

  lines.push('');
  lines.push(vocab.tensionFraming);

  return lines.join('\n');
}

function generateArchetypalDynamicsSection(
  config: SymbolicConfiguration,
  mode: InterrogationMode,
): string {
  const vocab = VOCABULARY[mode];
  const anchor = config.dominantArchetypes.find(a => a.role === 'anchor');
  const catalysts = config.dominantArchetypes.filter(a => a.role === 'catalyst');
  const shadows = config.dominantArchetypes.filter(a => a.role === 'shadow');
  const bridges = config.dominantArchetypes.filter(a => a.role === 'bridge');

  const lines: string[] = ['### Archetypal Dynamics', ''];

  if (anchor) {
    lines.push(
      `The **${vocab.roleLabels.anchor}** is held by *${anchor.cardName}* (${anchor.archetype}), ` +
      `scoring ${(anchor.score * 100).toFixed(1)}% — the gravitational centre of this configuration.`,
    );
    lines.push('');
  }

  if (catalysts.length > 0) {
    lines.push(
      `**${vocab.roleLabels.catalyst}${catalysts.length > 1 ? 's' : ''}**: ` +
      `${catalysts.map(c => `*${c.cardName}* (${c.archetype})`).join(', ')} — ` +
      `providing dynamic energy to the symbolic field.`,
    );
    lines.push('');
  }

  if (shadows.length > 0) {
    lines.push(
      `**${vocab.roleLabels.shadow}${shadows.length > 1 ? 's' : ''}**: ` +
      `${shadows.map(s => `*${s.cardName}* (${s.archetype})`).join(', ')} — ` +
      `these do not indicate fate but map structural tensions.`,
    );
    lines.push('');
  }

  if (bridges.length > 0) {
    lines.push(
      `**${vocab.roleLabels.bridge}${bridges.length > 1 ? 's' : ''}**: ` +
      `${bridges.map(b => `*${b.cardName}* (${b.archetype})`).join(', ')} — ` +
      `mediating connections between the dominant forces.`,
    );
    lines.push('');
  }

  // Entropic clusters
  if (config.entropicClusters.length > 0) {
    lines.push('**Thematic Clusters**:');
    for (const cluster of config.entropicClusters) {
      lines.push(`- *${cluster.theme}*: ${cluster.cards.join(', ')} (entropy: ${(cluster.entropy * 100).toFixed(0)}%)`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function generateStructuralResponseSection(
  config: SymbolicConfiguration,
  biasVector: InterpretiveBiasVector,
  mode: InterrogationMode,
  _lens: InterpretiveWeightVector,
): string {
  const vocab = VOCABULARY[mode];
  const anchor = config.dominantArchetypes[0];
  const question = biasVector.rawQuestion;

  const lines: string[] = ['### Structural Response', ''];

  if (question) {
    lines.push(
      `${vocab.responseOpening} addresses your inquiry "${question}" ` +
      `through the symbolic configuration centered on **${anchor?.cardName ?? 'the spread'}**.`,
    );
  } else {
    lines.push(
      `${vocab.responseOpening} presents a complete symbolic field ` +
      `centered on **${anchor?.cardName ?? 'the spread'}**.`,
    );
  }
  lines.push('');

  // Mode-specific structural analysis
  if (mode === 'divinatory') {
    const temporal = biasVector.temporalOrientation;
    lines.push(
      `The temporal orientation is **${temporal}**, and the symbolic movement ` +
      `traces a ${config.symbolicMovement.length}-step arc. ` +
      `The primary trajectory unfolds from the anchor force toward ` +
      `${config.dominantArchetypes.length > 1 ? config.dominantArchetypes[1].cardName : 'the configuration\'s resolution'}.`,
    );
  } else if (mode === 'philosophical') {
    lines.push(
      `The identity-space topology reveals ${config.tensionPairs.length} active tension pair${config.tensionPairs.length !== 1 ? 's' : ''}, ` +
      `with the primary attractor basin at *${anchor?.archetype ?? 'undefined'}*. ` +
      `The existential trajectory is framed by the polarity between ` +
      `${config.tensionPairs[0]?.positive.archetype ?? 'the dominant force'} ` +
      `and ${config.tensionPairs[0]?.negative.archetype ?? 'its shadow'}.`,
    );
  } else {
    lines.push(
      `The archetypal configuration maps ${config.dominantArchetypes.length} forces ` +
      `across the symbolic field. The emergence order begins with ` +
      `*${anchor?.archetype ?? 'undefined'}* as the primary generative principle, ` +
      `with polarity dynamics structured around ${config.tensionPairs.length} active dialectical pairs.`,
    );
  }

  return lines.join('\n');
}

function generatePersonalizationNote(
  context: UserProfileContext,
  config: SymbolicConfiguration,
  mode: InterrogationMode,
): string {
  if (context.priorReadings.length === 0) {
    return '';
  }

  const lines: string[] = ['### Personalization Context', ''];

  // Detect recurring archetypes
  const currentArchetypes = config.dominantArchetypes.map(a => a.archetype);
  const recurring = currentArchetypes.filter(a => context.recurringAttractors.includes(a));

  if (recurring.length > 0) {
    const label = mode === 'cosmological' ? 'cognitive resonance' : 'symbolic history';
    lines.push(
      `**Recurring archetypes** in your ${label}: ${recurring.map(a => `*${a}*`).join(', ')}. ` +
      `This recurring presence suggests a sustained symbolic pattern across your readings.`,
    );
    lines.push('');
  }

  // Entropy pattern
  if (context.entropyPattern.length >= 2) {
    const recent = context.entropyPattern[context.entropyPattern.length - 1];
    const previous = context.entropyPattern[context.entropyPattern.length - 2];
    const trend = recent > previous ? 'increasing' : recent < previous ? 'decreasing' : 'stable';
    lines.push(
      `Your symbolic entropy pattern shows **${trend}** complexity over recent readings.`,
    );
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Public API ─────────────────────────────────────

/**
 * Generate the complete UnifiedNarrative from the symbolic configuration.
 *
 * The narrative integrates:
 *   - SymbolicConfiguration S (primary input)
 *   - Question + BiasVector (orienting constraint)
 *   - Mode lens (interpretive emphasis)
 *   - PersonalizationContext (historical resonance)
 *
 * Guarantees:
 *   - Every card is referenced by name
 *   - Question keywords appear in narrative
 *   - Mode-appropriate vocabulary and framing
 *   - Disclaimer included
 */
export function generateUnifiedNarrative(
  config: SymbolicConfiguration,
  spread: PlacedCard[],
  biasVector: InterpretiveBiasVector,
  lens: InterpretiveWeightVector,
  context: UserProfileContext,
  question: string,
): UnifiedNarrative {
  const mode = lens.mode;

  // Generate each section
  const opening = generateOpeningSection(mode, question, lens, config, spread);
  const movement = generateSymbolicMovementSection(config, mode);
  const { section: cardConfig, cardRefs } = generateCardConfigSection(spread, config, mode, biasVector);
  const tension = generateTensionSection(config, mode);
  const dynamics = generateArchetypalDynamicsSection(config, mode);
  const structuralResp = generateStructuralResponseSection(config, biasVector, mode, lens);
  const personalizationNote = generatePersonalizationNote(context, config, mode);
  const vocab = VOCABULARY[mode];
  const disclaimer = DISCLAIMERS[mode];

  // Compose full narrative
  const sections = [
    opening,
    '',
    movement,
    '',
    cardConfig,
    tension,
    '',
    dynamics,
    structuralResp,
  ];

  if (personalizationNote) {
    sections.push('', personalizationNote);
  }

  sections.push(
    '',
    `### Openness & Epistemic Boundaries`,
    '',
    vocab.opennessStatement,
    '',
    disclaimer,
  );

  const fullNarrative = sections.join('\n');

  // Extract structured fields
  const existentialTension = config.tensionPairs.length > 0
    ? `The core tension lies between ${config.tensionPairs[0].positive.cardName} ` +
      `(${config.tensionPairs[0].positive.archetype}) and ${config.tensionPairs[0].negative.cardName} ` +
      `(${config.tensionPairs[0].negative.archetype}), scoring ${(config.tensionPairs[0].tensionScore * 100).toFixed(0)}% tension.`
    : 'No dominant tension pair — the symbolic field is relatively harmonious.';

  const symbolicMovementText = config.symbolicMovement.join(' → ');

  const archetypalDynamicsText = config.dominantArchetypes
    .slice(0, 3)
    .map(a => `${a.cardName} (${a.archetype}, ${a.role})`)
    .join('; ');

  return {
    existentialTension,
    symbolicMovement: symbolicMovementText,
    archetypalDynamics: archetypalDynamicsText,
    structuralResponse: structuralResp,
    opennessPreservation: vocab.opennessStatement,
    disclaimer,
    fullNarrative,
    cardReferences: cardRefs,
  };
}
