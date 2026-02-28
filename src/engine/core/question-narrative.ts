/**
 * Core — Question-Targeted Narrative (Card Master Voice)
 *
 * Generates a flowing narrative that directly addresses the user's question
 * THROUGH the card configuration. This is NOT a structural explanation —
 * it is the voice of an experienced symbolic master speaking through the cards.
 *
 * The narrative is DISTINCT from the structural explanation (narrative-integration.ts).
 * Both use the same SymbolicConfiguration S as primary input.
 *
 * Core Principle:
 *   Cards are the argument.
 *   The narrative is the voice.
 *   The question is the target.
 *
 * Guarantees:
 *   - Question explicitly restated in interpretive form
 *   - Every extracted card referenced by name
 *   - Each card's contribution to answering the question explained
 *   - Symbolic reasoning (not semantic analysis alone)
 *   - Mode-appropriate constraints enforced
 *   - Coherent flowing prose (no bullet lists, no therapy-speak)
 *   - Closing synthesis paragraph
 *   - Mode-appropriate disclaimer
 */
import type {
  PlacedCard,
  SymbolicConfiguration,
  InterpretiveBiasVector,
  InterpretiveWeightVector,
  UserProfileContext,
  QuestionTargetedNarrative,
  InterrogationMode,
  DominantArchetype,
  SymbolicRole,
} from '../../types';

// ─── Card Master Voice Configuration ────────────────

interface MasterVoice {
  /** How the question is restated */
  questionFrame: (q: string) => string;
  /** Opening sentence pattern */
  opening: (anchorName: string, spreadSize: number) => string;
  /** Transition phrases between card explanations */
  transitions: string[];
  /** How tension is described */
  tensionVoice: string;
  /** Synthesis opening */
  synthesisOpening: string;
  /** Closing cadence */
  closingCadence: string;
  /** Card role verb per role */
  roleVerbs: Record<SymbolicRole, string[]>;
  /** Connector to question */
  questionConnectors: string[];
}

const MASTER_VOICES: Record<InterrogationMode, MasterVoice> = {
  divinatory: {
    questionFrame: (q) =>
      q ? `You ask: "${q}" — let us see what the cards reveal about this unfolding.`
        : 'No specific question constrains this reading. The cards speak freely of the forces at play.',
    opening: (anchor, size) =>
      `The ${size} cards drawn form a configuration centred on ${anchor}. This is where the reading\'s gravity lies — the symbolic anchor around which all other forces orbit.`,
    transitions: [
      'Alongside this,',
      'Moving deeper into the spread,',
      'The configuration shifts as we encounter',
      'There is also the presence of',
      'Completing the symbolic field,',
    ],
    tensionVoice: 'The tension between these forces is not a problem to solve but a dynamic to navigate — the cards ask you to hold both poles as the trajectory unfolds.',
    synthesisOpening: 'Reading these cards together as a single symbolic event,',
    closingCadence: 'The cards have spoken. What remains is the space between their meaning and your action — that space is yours alone.',
    roleVerbs: {
      anchor: ['anchors', 'grounds', 'centres', 'holds the weight of'],
      catalyst: ['propels', 'energises', 'catalyses', 'drives'],
      shadow: ['challenges', 'inverts', 'shadows', 'complicates'],
      bridge: ['connects', 'mediates', 'bridges', 'links'],
    },
    questionConnectors: [
      'In relation to your question,',
      'Regarding what you ask,',
      'For the trajectory you inquire about,',
      'As it pertains to your inquiry,',
    ],
  },
  philosophical: {
    questionFrame: (q) =>
      q ? `The question you bring — "${q}" — is not one that admits a simple answer. It opens a structural space. Let us map it through the cards.`
        : 'This reading operates without a constraining question, allowing the archetypal configuration to speak in its own structural terms.',
    opening: (anchor, size) =>
      `Across these ${size} positions, the configuration reveals its topology. At the centre of this existential mapping lies ${anchor}, functioning as the primary attractor basin — the structural ground from which all other trajectories depart.`,
    transitions: [
      'The trajectory space extends as',
      'Within this existential topology,',
      'Structurally adjacent to this,',
      'The configuration deepens with',
      'At the edges of this attractor basin,',
    ],
    tensionVoice: 'This structural polarity is not contradiction — it is the very shape of the trajectory space itself, marking the edges within which identity can move without collapse.',
    synthesisOpening: 'Taken as a structural whole,',
    closingCadence: 'This is not a prediction but a map. The trajectory space remains open. Liveness is preserved — no reading constitutes a closed-future assertion.',
    roleVerbs: {
      anchor: ['grounds the existential topology in', 'serves as the primary attractor for', 'structurally centres'],
      catalyst: ['restructures the trajectory through', 'introduces dynamism via', 'catalyses movement toward'],
      shadow: ['maps the shadow boundary of', 'marks the structural limit through', 'inverts the polarity via'],
      bridge: ['mediates the existential distance between', 'bridges the structural gap through', 'connects attractor basins via'],
    },
    questionConnectors: [
      'In the topology of your question,',
      'For the existential terrain you ask about,',
      'Structurally,',
      'Within the trajectory space of your inquiry,',
    ],
  },
  cosmological: {
    questionFrame: (q) =>
      q ? `You pose a question about the structure of things: "${q}". The cards do not answer empirically — they answer symbolically, through archetypal configuration.`
        : 'This reading addresses no specific question, instead revealing the archetypal forces present in the configuration as universal principles.',
    opening: (anchor, size) =>
      `The ${size}-card configuration embodies an archetypal field. The primary generative principle is ${anchor} — the force from which the symbolic order of this reading emerges.`,
    transitions: [
      'The archetypal field extends through',
      'As a complementary symbolic force,',
      'The configuration further instantiates',
      'Projected alongside this,',
      'Completing the archetypal schema,',
    ],
    tensionVoice: 'This polarity between archetypal forces represents a structural principle of the symbolic field — not a causal mechanism, not an empirical claim, but the grammar through which these forces articulate themselves.',
    synthesisOpening: 'When these archetypal forces are read as a unified configuration,',
    closingCadence: 'This is a symbolic-archetypal representation. Cards are interpreted as universal forces, not as events or empirical claims. The symbolic model remains open to further structural articulation.',
    roleVerbs: {
      anchor: ['embodies the primary generative principle of', 'instantiates the archetypal ground for', 'manifests the central force of'],
      catalyst: ['activates the generative dynamic of', 'projects the emergent principle of', 'drives the symbolic emergence of'],
      shadow: ['represents the dissolving counter-principle to', 'inverts the polarity of', 'marks the entropic boundary of'],
      bridge: ['synthesises the dialectical tension between', 'bridges the archetypal polarity of', 'integrates the structural complementarity of'],
    },
    questionConnectors: [
      'In the symbolic grammar of your question,',
      'As archetypal structure,',
      'For the universal principle you inquire about,',
      'Within this archetypal configuration,',
    ],
  },
};

// ─── Disclaimers (must match narrative-integration.ts) ─

const DISCLAIMERS: Record<InterrogationMode, string> = {
  divinatory:
    'This reading offers a symbolic trajectory map, not a deterministic prediction. ' +
    'No causal, prophetic, or fated claim is made. The trajectory space remains open to choice and agency.',
  philosophical:
    'This is a structural clarification, not a deterministic prediction. ' +
    'Liveness constraints ensure that no interpretation constitutes a closed-future assertion. ' +
    'The trajectory space remains open.',
  cosmological:
    'This is a symbolic-archetypal representation, not a scientific explanation. ' +
    'No empirical, causal, or scientific claims are made. ' +
    'Cards are interpreted as archetypal forces, not events. The symbolic model remains open.',
};

// ─── Internal Helpers ───────────────────────────────

function selectFrom(arr: string[], seed: number): string {
  return arr[Math.abs(seed) % arr.length];
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function generateCardContribution(
  card: PlacedCard,
  archetype: DominantArchetype,
  mode: InterrogationMode,
  voice: MasterVoice,
  biasVector: InterpretiveBiasVector,
  cardIndex: number,
  totalCards: number,
  config: SymbolicConfiguration,
): string {
  const c = card.card;
  const reversed = c.isReversed ? ', in its reversed aspect,' : '';
  const meaning = c.isReversed ? c.meaningReversed : c.meaningUp;
  const roleVerb = selectFrom(voice.roleVerbs[archetype.role], hashSeed(c.id));
  const transition = cardIndex === 0 ? '' : selectFrom(voice.transitions, cardIndex);
  const connector = selectFrom(voice.questionConnectors, hashSeed(c.name + mode));

  // Find resonant question keywords
  const resonant = biasVector.keywords.filter(kw =>
    c.keywords.some(ck => ck.toLowerCase().includes(kw) || kw.includes(ck.toLowerCase())),
  );

  // Find tension partners
  const tensionPartners = config.tensionPairs
    .filter(tp => tp.positive.cardName === c.name || tp.negative.cardName === c.name)
    .map(tp => tp.positive.cardName === c.name ? tp.negative.cardName : tp.positive.cardName);

  const lines: string[] = [];

  if (transition) {
    lines.push(transition);
  }

  // Core card sentence — flowing prose, not structured description
  lines.push(
    `**${c.name}**${reversed} ${roleVerb} this reading's response to your inquiry. ` +
    `Situated at *${card.position.label}*, the ${c.archetype} archetype ${meaning}`
  );

  // Connect to question
  if (resonant.length > 0) {
    lines.push(
      `${connector} the presence of ${c.name} speaks directly to the themes of *${resonant.join('* and *')}* ` +
      `that your question raises.`
    );
  } else if (biasVector.rawQuestion) {
    lines.push(
      `${connector} ${c.name} contributes the symbolic weight of *${c.keywords.slice(0, 2).join('* and *')}* ` +
      `to the field through which your question is interpreted.`
    );
  }

  // Tension context
  if (tensionPartners.length > 0) {
    lines.push(
      `The polarity between ${c.name} and ${tensionPartners[0]} creates a dynamic tension ` +
      `that shapes how this card's meaning materialises within the reading.`
    );
  }

  return lines.join(' ');
}

// ─── Public API ─────────────────────────────────────

/**
 * Generate a question-targeted narrative — the Card Master voice.
 *
 * This is DISTINCT from generateUnifiedNarrative (structural explanation).
 * Both use the same SymbolicConfiguration S.
 *
 * The Card Master:
 *   - Restates the question interpretively
 *   - Addresses the question THROUGH each card
 *   - Weaves cards into flowing prose
 *   - Ends with a synthesis paragraph
 *   - Includes mode-appropriate disclaimer
 */
export function generateQuestionTargetedNarrative(
  config: SymbolicConfiguration,
  spread: PlacedCard[],
  biasVector: InterpretiveBiasVector,
  lens: InterpretiveWeightVector,
  context: UserProfileContext,
  question: string,
): QuestionTargetedNarrative {
  const mode = lens.mode;
  const voice = MASTER_VOICES[mode];
  const anchor = config.dominantArchetypes.find(a => a.role === 'anchor');
  const anchorName = anchor?.cardName ?? spread[0]?.card.name ?? 'the spread';

  // 1. Restate the question
  const questionRestatement = voice.questionFrame(question);

  // 2. Opening
  const opening = voice.opening(anchorName, spread.length);

  // 3. Per-card woven explanations
  const cardExplanations: QuestionTargetedNarrative['cardExplanations'] = [];
  const cardParagraphs: string[] = [];

  for (let i = 0; i < spread.length; i++) {
    const card = spread[i];
    const archEntry = config.dominantArchetypes.find(a => a.cardId === card.card.id);
    if (!archEntry) continue;

    const contribution = generateCardContribution(
      card, archEntry, mode, voice, biasVector, i, spread.length, config,
    );

    cardExplanations.push({
      cardName: card.card.name,
      role: archEntry.role,
      contribution,
    });

    cardParagraphs.push(contribution);
  }

  // 4. Tension section (if present)
  let tensionSection = '';
  if (config.tensionPairs.length > 0) {
    const tensionLines = config.tensionPairs.map(tp =>
      `The polarity between **${tp.positive.cardName}** and **${tp.negative.cardName}** ` +
      `(tension: ${(tp.tensionScore * 100).toFixed(0)}%) ` +
      `marks a fundamental dynamic within this configuration.`
    );
    tensionSection = tensionLines.join(' ') + ' ' + voice.tensionVoice;
  }

  // 5. Synthesis
  const synthesisLines: string[] = [voice.synthesisOpening];

  if (question) {
    synthesisLines.push(
      `the cards respond to "${question}" not with a single answer but with a configuration — ` +
      `a symbolic field centred on **${anchorName}**`
    );

    if (config.tensionPairs.length > 0) {
      synthesisLines.push(
        `, shaped by the dynamic tension between ` +
        `**${config.tensionPairs[0].positive.cardName}** and **${config.tensionPairs[0].negative.cardName}**`
      );
    }

    synthesisLines.push(
      `, with an overall entropy of ${(config.entropy * 100).toFixed(0)}% ` +
      `${config.entropy > 0.6 ? '— suggesting an open, multi-valent field of possibility' : '— suggesting a more focused, convergent symbolic structure'}.`
    );
  } else {
    synthesisLines.push(
      `the configuration presents a symbolic field centred on **${anchorName}** ` +
      `with ${config.dominantArchetypes.length} active archetypal forces and ` +
      `an entropy of ${(config.entropy * 100).toFixed(0)}%.`
    );
  }

  const synthesis = synthesisLines.join(' ');

  // 6. Personalization note (if applicable)
  let personalizationNote = '';
  if (context.recurringAttractors.length > 0) {
    const currentArchetypes = config.dominantArchetypes.map(a => a.archetype);
    const recurring = currentArchetypes.filter(a => context.recurringAttractors.includes(a));
    if (recurring.length > 0) {
      personalizationNote = `It is worth noting that *${recurring.join('* and *')}* ` +
        `${recurring.length === 1 ? 'has' : 'have'} appeared in your symbolic history before — ` +
        `this recurrence suggests a sustained archetypal pattern that deepens with each reading.`;
    }
  }

  // 7. Closing
  const closing = voice.closingCadence;

  // 8. Disclaimer
  const disclaimer = DISCLAIMERS[mode];

  // Compose full narrative
  const sections = [
    questionRestatement,
    '',
    opening,
    '',
    ...cardParagraphs.map(p => p + '\n'),
  ];

  if (tensionSection) {
    sections.push(tensionSection, '');
  }

  sections.push(synthesis);

  if (personalizationNote) {
    sections.push('', personalizationNote);
  }

  sections.push('', closing, '', '---', '', `*${disclaimer}*`);

  const fullNarrative = sections.join('\n');

  // Card references
  const cardReferences: Record<string, string> = {};
  for (const expl of cardExplanations) {
    cardReferences[expl.cardName] = expl.contribution;
  }

  return {
    questionRestatement,
    cardExplanations,
    synthesis,
    fullNarrative,
    disclaimer,
    cardReferences,
  };
}
