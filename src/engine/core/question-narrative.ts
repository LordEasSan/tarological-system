/**
 * Core — Progressive Existential Narrative Engine
 *
 * Generates meaning through PROGRESSIVE ACCUMULATION:
 *   For N cards extracted in order:
 *     Step 1: PartialResponse₁ = f(Q, Card₁)
 *     Step 2: PartialResponse₂ = f(Q, PartialResponse₁, Card₂)
 *     Step 3: PartialResponse₃ = f(Q, PartialResponse₂, Card₃)
 *     ...
 *     Final:  Synthesis = f(Q, all partials, full configuration)
 *
 * This creates:
 *   - Narrative Memory (each step knows what came before)
 *   - Temporal Emergence (meaning unfolds sequentially)
 *   - Sequential Meaning Construction (card order affects interpretation)
 *
 * Voice: Existential-hermeneutic. NOT structural. NOT analytical.
 *   - Philosophical: hermeneutic phenomenology + Jungian symbolic
 *   - Cosmological: archetypal metaphysical + universal symbolism
 *   - Divinatory: intuitive symbolic + trajectory mapping
 *
 * Guarantees:
 *   - Question explicitly restated in existential framing
 *   - Every card referenced by name
 *   - Each step introduces NEW symbolic movement (no verbatim repetition)
 *   - Previous meaning integrated semantically (not copied)
 *   - Continuous essay-like flow
 *   - Final synthesis resolves or reframes the question
 *   - Mode-appropriate disclaimer
 *   - NO structural jargon: no topology, attractor basin, entropy,
 *     liveness constraints, trajectory space, entropic clusters
 */
import type {
  PlacedCard,
  SymbolicConfiguration,
  InterpretiveBiasVector,
  InterpretiveWeightVector,
  UserProfileContext,
  QuestionTargetedNarrative,
  ProgressiveStep,
  InterrogationMode,
  DominantArchetype,
  SymbolicRole,
} from '../../types';

// ─── Existential Voice Configuration ────────────────

interface ExistentialVoice {
  /** Restate the question in existential-interpretive framing */
  questionFrame: (q: string) => string;
  /** Opening for the first card — how inquiry begins */
  firstCardOpening: (cardName: string, meaning: string, keywords: string[], question: string) => string;
  /** Deepening templates — how subsequent cards shift meaning */
  deepen: (cardName: string, meaning: string, keywords: string[], previousInsight: string, depth: number, role: SymbolicRole) => string;
  /** How tension between cards is experienced existentially */
  tensionExperienced: (card1: string, card2: string, tensionScore: number) => string;
  /** Synthesis voice — woven from accumulated insights */
  synthesize: (question: string, insights: string[], cardNames: string[]) => string;
  /** Closing sentence */
  closing: string;
  /** Disclaimer */
  disclaimer: string;
  /** Role verbs — existential, not structural */
  roleVerbs: Record<SymbolicRole, string[]>;
}

// ─── Helpers ────────────────────────────────────────

function pick(arr: string[], seed: number): string {
  return arr[Math.abs(seed) % arr.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function extractQuestionKeywords(question: string): string[] {
  const stops = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'what', 'how', 'who',
    'why', 'when', 'where', 'which', 'that', 'this', 'and', 'or', 'but',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'it',
    'its', 'my', 'your', 'our', 'can', 'do', 'does', 'did', 'has', 'have',
    'had', 'will', 'would', 'could', 'should', 'about', 'into', 'not', 'no',
    'been',
  ]);
  return question.toLowerCase()
    .replace(/[?.,!;:'"]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stops.has(w));
}

function findResonance(cardKeywords: string[], questionKeywords: string[]): string[] {
  return questionKeywords.filter(qk =>
    cardKeywords.some(ck =>
      ck.toLowerCase().includes(qk) || qk.includes(ck.toLowerCase()),
    ),
  );
}

// ─── Voice Definitions ──────────────────────────────

const VOICES: Record<InterrogationMode, ExistentialVoice> = {

  // ── DIVINATORY ─────────────────────────────────────
  divinatory: {
    questionFrame: (q) =>
      q
        ? `You ask: "${q}" — let us see what the cards reveal about this unfolding.`
        : 'No question constrains this reading. The cards speak freely of the forces at play.',

    firstCardOpening: (name, meaning, keywords, _question) => {
      const kw = keywords.slice(0, 2).join(' and ');
      return `The first symbol to emerge is **${name}**, carrying the energy of *${kw}*. ` +
        `${meaning}. In the context of what you ask, this card opens the reading ` +
        `by grounding you in what is already present — the force that precedes choice.`;
    },

    deepen: (name, meaning, keywords, prevInsight, depth, role) => {
      const kw = keywords.slice(0, 2).join(' and ');
      const openers = [
        `As **${name}** enters the reading, the meaning shifts.`,
        `Then **${name}** arrives, and what seemed settled begins to move.`,
        `Now **${name}** steps forward, bringing *${kw}* into the unfolding.`,
        `With **${name}**, the reading deepens — *${kw}* reshapes what came before.`,
        `**${name}** appears next, and the current of meaning turns.`,
      ];
      const opener = pick(openers, hash(name + String(depth)));
      const roleAction = role === 'shadow' ? 'complicates'
        : role === 'catalyst' ? 'energises'
        : role === 'bridge' ? 'connects'
        : 'deepens';
      const integration = prevInsight
        ? ` Where previously the reading spoke of ${prevInsight}, this card ${roleAction} that understanding.`
        : '';
      return `${opener}${integration} ${meaning}. ` +
        `Through *${kw}*, the cards are pointing toward something you may already sense but have not yet named.`;
    },

    tensionExperienced: (c1, c2) =>
      `Between **${c1}** and **${c2}**, there is a pull — not a contradiction to resolve, ` +
      `but a living tension to navigate. Both forces are real; the reading asks you to hold them.`,

    synthesize: (question, insights, cardNames) => {
      const names = cardNames.join(', ');
      const lastInsight = insights[insights.length - 1];
      return `Reading ${names} together as a single symbolic moment: ` +
        `the cards do not answer "${question}" with certainty. They answer with a landscape — ` +
        `a field of forces already in motion. ` +
        `${lastInsight ? `What emerges most clearly is ${lastInsight}.` : ''} ` +
        `The direction is visible; the choice remains yours.`;
    },

    closing:
      'The cards have spoken. What remains is the space between their meaning and your action — that space is yours alone.',

    disclaimer:
      'This reading offers a symbolic reflection, not a deterministic prediction. ' +
      'No causal, prophetic, or fated claim is made. The meaning remains open to your agency.',

    roleVerbs: {
      anchor: ['grounds', 'holds', 'centres', 'roots'],
      catalyst: ['propels', 'energises', 'ignites', 'drives'],
      shadow: ['challenges', 'shadows', 'unsettles', 'inverts'],
      bridge: ['connects', 'bridges', 'mediates', 'weaves'],
    },
  },

  // ── PHILOSOPHICAL ──────────────────────────────────
  philosophical: {
    questionFrame: (q) =>
      q
        ? `The question you bring — "${q}" — does not ask for an answer. It asks to be dwelt in. Let us enter it through the cards.`
        : 'This reading speaks without a constraining question — the cards open a clearing for reflection.',

    firstCardOpening: (name, meaning, keywords, _question) => {
      const kw = keywords.slice(0, 2).join(' and ');
      return `The first encounter is with **${name}** — the archetype of *${kw}*. ` +
        `Before analysis, before interpretation, this card simply presents itself. ` +
        `${meaning}. If your question is a door, this card is what you find on the threshold — ` +
        `not yet the answer, but the ground from which understanding might arise.`;
    },

    deepen: (name, meaning, keywords, prevInsight, depth, role) => {
      const kw = keywords.slice(0, 2).join(' and ');
      const movements: Record<SymbolicRole, string> = {
        anchor: 'deepens the ground on which the question rests',
        catalyst: 'sets the understanding in motion, unsettling what seemed stable',
        shadow: 'casts a shadow across the emerging meaning, asking what has been left unseen',
        bridge: 'reaches across what seemed separate, drawing a line of connection',
      };
      const movement = movements[role];
      const openers = [
        `Then **${name}** appears — and ${movement}.`,
        `**${name}** enters the reading, and the question changes shape.`,
        `With **${name}**, carrying *${kw}*, something shifts.`,
        `Now **${name}** arrives. ${meaning.split('.')[0]}.`,
      ];
      const opener = pick(openers, hash(name + String(depth)));
      const weave = prevInsight
        ? ` What the reading previously disclosed — ${prevInsight} — is now seen from a different angle.`
        : '';
      const tone = role === 'shadow'
        ? 'This is not a comfortable deepening'
        : 'The understanding widens';
      return `${opener}${weave} ${tone}. ` +
        `Through the symbolism of *${kw}*, the question is no longer the same question it was ` +
        `before this card appeared.`;
    },

    tensionExperienced: (c1, c2) =>
      `Between **${c1}** and **${c2}**, there is not contradiction but *polarity* — ` +
      `the kind of tension that makes a question worth asking. Neither card cancels the other; ` +
      `together they hold a space larger than either alone could open.`,

    synthesize: (question, insights, cardNames) => {
      const last = insights[insights.length - 1] || 'a deepened encounter with the question itself';
      return `What has emerged through ${cardNames.join(', ')} is not an answer to "${question}" ` +
        `but a clarification of what the question truly asks. ` +
        `${last.charAt(0).toUpperCase() + last.slice(1)}. ` +
        `The cards do not close the question — they open it further, ` +
        `revealing dimensions that were not visible before the reading began.`;
    },

    closing:
      'This is not a conclusion but a clearing — a place from which to see the question anew. ' +
      'What you do with this sight is the next act of understanding.',

    disclaimer:
      'This is a reflective clarification through symbolic encounter, not a prediction. ' +
      'The reading opens possibilities for understanding — it does not prescribe outcomes ' +
      'or assert facts.',

    roleVerbs: {
      anchor: ['grounds', 'holds open', 'sustains', 'bears'],
      catalyst: ['sets in motion', 'unsettles', 'opens', 'transforms'],
      shadow: ['conceals', 'inverts', 'darkens', 'questions'],
      bridge: ['relates', 'connects', 'draws together', 'spans'],
    },
  },

  // ── COSMOLOGICAL ───────────────────────────────────
  cosmological: {
    questionFrame: (q) =>
      q
        ? `You ask about the nature of things: "${q}". The cards respond not with facts ` +
          `but with symbols — the oldest language there is.`
        : 'This reading addresses no particular question. The cards reveal the archetypal ' +
          'forces present, as universal principles speaking through symbol.',

    firstCardOpening: (name, meaning, keywords, _question) => {
      const kw = keywords.slice(0, 2).join(' and ');
      return `The first force to manifest is **${name}** — embodying *${kw}*. ` +
        `In the symbolic grammar of this reading, this is the primordial gesture: ` +
        `the first movement before all others. ${meaning}. ` +
        `This archetype speaks of something older than the question — the ground of the cosmos itself.`;
    },

    deepen: (name, meaning, keywords, prevInsight, depth, role) => {
      const kw = keywords.slice(0, 2).join(' and ');
      const cosmicMoves: Record<SymbolicRole, string> = {
        anchor: 'reveals the enduring principle beneath the surface',
        catalyst: 'introduces the creative force that sets the symbolic world in motion',
        shadow: 'brings forth the dissolving counter-principle — what unmakes so that something new can begin',
        bridge: 'weaves the sacred connection between what seemed separate',
      };
      const move = cosmicMoves[role];
      const openers = [
        `Then **${name}** emerges, and the symbolic field expands.`,
        `**${name}** enters — *${kw}* — and the meaning deepens.`,
        `With **${name}**, a deeper layer of the symbolic order reveals itself.`,
        `Now **${name}** appears, and what was one principle becomes a dialogue.`,
      ];
      const opener = pick(openers, hash(name + String(depth)));
      const weave = prevInsight
        ? ` Where previously the reading spoke of ${prevInsight}, now a new dimension opens.`
        : '';
      return `${opener} This archetype ${move}.${weave} ${meaning}. ` +
        `Through *${kw}*, the cards speak of universal forces — ` +
        `not as explanation, but as mythic recognition.`;
    },

    tensionExperienced: (c1, c2) =>
      `The polarity between **${c1}** and **${c2}** is not a problem but a *creative tension* — ` +
      `the kind that generates worlds. In every cosmogony, opposition precedes creation. ` +
      `These two forces hold the reading in their dynamic embrace.`,

    synthesize: (question, insights, cardNames) => {
      const last = insights[insights.length - 1]
        || 'a symbolic encounter with the forces that shape reality';
      return `Together, ${cardNames.join(', ')} form a symbolic configuration ` +
        `that speaks to "${question}" not as science speaks — through explanation — ` +
        `but as myth speaks — through recognition. ` +
        `${last.charAt(0).toUpperCase() + last.slice(1)}. ` +
        `What the cards reveal is not how the cosmos works, but how it *means*.`;
    },

    closing:
      'This is a symbolic-mythic reflection. The cards speak as archetypal forces ' +
      'in a language older than fact — what they reveal is pattern, not mechanism.',

    disclaimer:
      'This is a symbolic-mythic reflection, not a scientific or empirical explanation. ' +
      'No empirical, causal, or scientific claims are made. ' +
      'The cards speak as archetypal forces — what they reveal is pattern and resonance, not fact.',

    roleVerbs: {
      anchor: ['embodies', 'manifests', 'sustains', 'grounds'],
      catalyst: ['ignites', 'generates', 'creates', 'births'],
      shadow: ['dissolves', 'unmakes', 'inverts', 'returns to darkness'],
      bridge: ['unifies', 'synthesises', 'weaves', 'consecrates'],
    },
  },
};

// ─── Progressive Accumulation Engine ────────────────

interface ProgressiveContext {
  question: string;
  questionKeywords: string[];
  mode: InterrogationMode;
  voice: ExistentialVoice;
  /** Running thematic summary — semantic direction, NOT repeated text */
  currentInsight: string;
  /** All previous insights (for synthesis) */
  allInsights: string[];
  /** Cards seen so far (for avoiding repetition) */
  seenCards: string[];
  /** Tension pairs involving seen cards */
  activeTensions: Array<{ card1: string; card2: string; score: number }>;
}

/**
 * Generate one progressive step.
 *
 * Guardrails:
 *   - Does NOT repeat previous text verbatim
 *   - Integrates previous narrative semantically
 *   - Introduces new symbolic movement
 *   - Preserves coherence
 *   - Avoids contradiction
 */
function generateProgressiveStep(
  card: PlacedCard,
  archetype: DominantArchetype,
  depth: number,
  ctx: ProgressiveContext,
  config: SymbolicConfiguration,
): ProgressiveStep {
  const c = card.card;
  const meaning = c.isReversed ? c.meaningReversed : c.meaningUp;
  const keywords = [...c.keywords];
  if (c.isReversed) keywords.push('reversal');

  const resonance = findResonance(c.keywords, ctx.questionKeywords);

  let partialResponse: string;

  if (depth === 1) {
    // First card — open the inquiry
    partialResponse = ctx.voice.firstCardOpening(c.name, meaning, keywords, ctx.question);
  } else {
    // Subsequent cards — deepen, shift, or complicate
    partialResponse = ctx.voice.deepen(
      c.name, meaning, keywords, ctx.currentInsight, depth, archetype.role,
    );
  }

  // Add resonance with question keywords (if any, and not first step)
  if (resonance.length > 0 && depth > 1) {
    partialResponse += ` The resonance with *${resonance.join('* and *')}* from your question ` +
      `is not coincidence — it is the reading finding its voice.`;
  }

  // Add tension context (if this card is in a tension pair with a previously seen card)
  const newTensions = config.tensionPairs.filter(tp =>
    (tp.positive.cardName === c.name && ctx.seenCards.includes(tp.negative.cardName)) ||
    (tp.negative.cardName === c.name && ctx.seenCards.includes(tp.positive.cardName)),
  );
  if (newTensions.length > 0) {
    const tp = newTensions[0];
    const otherCard = tp.positive.cardName === c.name
      ? tp.negative.cardName
      : tp.positive.cardName;
    partialResponse += ' ' + ctx.voice.tensionExperienced(c.name, otherCard, tp.tensionScore);
  }

  // Derive cumulative insight — short thematic summary for the next step
  const cumulativeInsight = deriveCumulativeInsight(
    c, keywords, ctx.currentInsight, depth, archetype.role,
  );

  return {
    depth,
    cardName: c.name,
    role: archetype.role,
    partialResponse,
    cumulativeInsight,
  };
}

/**
 * Derive a short thematic insight from the current card and accumulated meaning.
 * This is passed forward semantically — NOT the text that appears in the narrative.
 */
function deriveCumulativeInsight(
  card: { name: string; keywords: string[]; archetype: string },
  keywords: string[],
  previousInsight: string,
  depth: number,
  role: SymbolicRole,
): string {
  const primaryKw = keywords[0] || card.archetype;

  if (depth === 1) {
    return `the presence of ${primaryKw} as a ground for understanding`;
  }

  const verb: Record<SymbolicRole, string> = {
    anchor: 'deepened by',
    catalyst: 'set in motion by',
    shadow: 'complicated by',
    bridge: 'connected through',
  };

  if (previousInsight) {
    return `${previousInsight}, now ${verb[role]} the arrival of ${card.name} ` +
      `and its quality of *${primaryKw}*`;
  }

  return `the emerging understanding, ${verb[role]} ${card.name}'s *${primaryKw}*`;
}

// ─── Public API ─────────────────────────────────────

/**
 * Generate a progressive existential narrative.
 *
 * This is the default narrative generation strategy.
 * Cards are processed in order; each step builds on the previous,
 * creating narrative memory and temporal emergence.
 *
 * The voice is existential-hermeneutic:
 *   - Philosophical: hermeneutic phenomenology, no system exposition
 *   - Cosmological: archetypal metaphysical, no physics lecture
 *   - Divinatory: intuitive symbolic, no fortune-telling
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
  const voice = VOICES[mode];
  const questionKeywords = extractQuestionKeywords(question);

  // 1. Restate the question
  const questionRestatement = voice.questionFrame(question);

  // 2. Progressive accumulation
  const progressiveSteps: ProgressiveStep[] = [];
  const cardExplanations: QuestionTargetedNarrative['cardExplanations'] = [];
  const ctx: ProgressiveContext = {
    question,
    questionKeywords,
    mode,
    voice,
    currentInsight: '',
    allInsights: [],
    seenCards: [],
    activeTensions: [],
  };

  for (let i = 0; i < spread.length; i++) {
    const card = spread[i];
    const archEntry = config.dominantArchetypes.find(a => a.cardId === card.card.id);
    if (!archEntry) continue;

    const step = generateProgressiveStep(card, archEntry, i + 1, ctx, config);
    progressiveSteps.push(step);

    // Update progressive context for next step
    ctx.currentInsight = step.cumulativeInsight;
    ctx.allInsights.push(step.cumulativeInsight);
    ctx.seenCards.push(card.card.name);

    // Track newly revealed tensions
    const newTensions = config.tensionPairs.filter(tp =>
      (tp.positive.cardName === card.card.name &&
        ctx.seenCards.includes(tp.negative.cardName)) ||
      (tp.negative.cardName === card.card.name &&
        ctx.seenCards.includes(tp.positive.cardName)),
    );
    for (const tp of newTensions) {
      ctx.activeTensions.push({
        card1: tp.positive.cardName,
        card2: tp.negative.cardName,
        score: tp.tensionScore,
      });
    }

    // Card explanation (for the contributions panel)
    cardExplanations.push({
      cardName: card.card.name,
      role: archEntry.role,
      contribution: step.partialResponse,
    });
  }

  // 3. Synthesis — emerges from accumulated progressive context
  const synthesis = voice.synthesize(question, ctx.allInsights, ctx.seenCards);

  // 4. Personalization note
  let personalizationNote = '';
  if (context.recurringAttractors.length > 0) {
    const currentArchetypes = config.dominantArchetypes.map(a => a.archetype);
    const recurring = currentArchetypes.filter(
      a => context.recurringAttractors.includes(a),
    );
    if (recurring.length > 0) {
      personalizationNote =
        `*${recurring.join('* and *')}* ` +
        `${recurring.length === 1 ? 'has' : 'have'} appeared in your readings before. ` +
        `This recurrence is not repetition — it is deepening. ` +
        `Some symbols return because their meaning has not yet been fully received.`;
    }
  }

  // 5. Compose full narrative as continuous essay
  const sections: string[] = [questionRestatement, ''];

  // Progressive steps as flowing paragraphs
  for (const step of progressiveSteps) {
    sections.push(step.partialResponse);
    sections.push('');
  }

  // Synthesis
  sections.push(synthesis);

  // Personalization
  if (personalizationNote) {
    sections.push('', personalizationNote);
  }

  // Closing
  sections.push('', voice.closing);

  // Disclaimer
  sections.push('', '---', '', `*${voice.disclaimer}*`);

  const fullNarrative = sections.join('\n');

  // Card references
  const cardReferences: Record<string, string> = {};
  for (const expl of cardExplanations) {
    cardReferences[expl.cardName] = expl.contribution;
  }

  return {
    questionRestatement,
    progressiveSteps,
    cardExplanations,
    synthesis,
    fullNarrative,
    disclaimer: voice.disclaimer,
    cardReferences,
  };
}
