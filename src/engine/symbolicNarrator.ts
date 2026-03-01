/**
 * Symbolic Narrator v2 — Advanced Narrative Calibration
 *
 * Generates initiatic symbolic discourse from IDA output.
 * No explanation. No didacticism. Incarnation only.
 *
 * Architecture:
 *   1. Rhythm Engine — alternation of breath lengths, rhetorical pauses
 *   2. Archetypal Density Control — concrete image, implicit tension, symbolic movement per card
 *   3. Structural Tension Embodiment — tensionType governs rhythm, lexicon, assertiveness
 *   4. Strategy Movement — completionStrategy drives progressive discourse shape
 *   5. Resolution Elevation — archetypally embodied closure, never advice
 *   6. D1-D6 Tone Modulation — quality scores shape texture
 */

import type {
  UnifiedReadingResponse,
  TensionType,
  CompletionStrategy,
  ResolutionArchetype,
  TransformationStep,
  PlacedCard,
} from '../types';
import type { DimensionScore } from './scoring';

// ─── Output Types ───────────────────────────────────

export interface SymbolicNarrative {
  /** Opening — invokes the tension field, sets rhythm */
  opening: string;
  /** Per-card narrative blocks, in spread order */
  cardNarratives: string[];
  /** Unifying synthesis — structural tension made explicit */
  synthesis: string;
  /** Symbolic closure — archetypally embodied, never didactic */
  resolution: string;
}

// ─── Rhythm Engine ──────────────────────────────────

/**
 * Tension-specific rhythm profiles.
 * Each profile controls sentence pacing — short/medium alternation,
 * pause density, and syntactic assertiveness.
 */
interface RhythmProfile {
  /** Preferred sentence pattern: 's' = short (≤12 words), 'm' = medium, 'p' = pause (fragment/ellipsis) */
  pattern: ('s' | 'm' | 'p')[];
  /** Connector vocabulary between movements */
  connectors: string[];
  /** Whether to end card blocks with an open fragment */
  trailingFragment: boolean;
}

const TENSION_RHYTHM: Record<TensionType, RhythmProfile> = {
  absence: {
    pattern: ['m', 'p', 's', 'm', 'p'],
    connectors: ['And still —', 'What remains:', 'The gap widens.'],
    trailingFragment: true,
  },
  polarity: {
    pattern: ['m', 's', 'm', 's', 'm'],
    connectors: ['On the other hand,', 'Yet simultaneously,', 'Both at once.'],
    trailingFragment: false,
  },
  sacrifice: {
    pattern: ['s', 'm', 's', 's', 'm'],
    connectors: ['The cost:', 'What is offered:', 'Irreversibly.'],
    trailingFragment: false,
  },
  hierarchy: {
    pattern: ['m', 'm', 's', 'm', 's'],
    connectors: ['Beneath this,', 'The dominant voice:', 'In subordination,'],
    trailingFragment: false,
  },
  illusion: {
    pattern: ['m', 's', 'p', 'm', 's'],
    connectors: ['But look again.', 'Under the surface:', 'The mask slips.'],
    trailingFragment: true,
  },
  excess: {
    pattern: ['m', 'm', 'm', 's', 'p'],
    connectors: ['More still.', 'Overflowing:', 'Beyond measure,'],
    trailingFragment: true,
  },
  identity_split: {
    pattern: ['s', 'p', 'm', 's', 'p'],
    connectors: ['Or rather —', 'The other self:', 'Which one speaks?'],
    trailingFragment: true,
  },
  creation_destruction: {
    pattern: ['m', 's', 'm', 'm', 's'],
    connectors: ['From the ashes,', 'Simultaneously:', 'Born and burning,'],
    trailingFragment: false,
  },
};

/**
 * Apply rhythm to a sequence of raw sentences.
 * Breaks monolithic blocks into varied breath lengths.
 */
function applyRhythm(raw: string, tensionType: TensionType): string {
  const profile = TENSION_RHYTHM[tensionType];
  // Split on sentence boundaries
  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0);

  if (sentences.length <= 1) return raw;

  const result: string[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const beat = profile.pattern[i % profile.pattern.length];
    const sentence = sentences[i].trim();

    if (beat === 'p' && i > 0) {
      // Insert a pause — rhetorical breath
      result.push('');
      result.push(sentence);
    } else if (beat === 's' && sentence.split(/\s+/).length > 14) {
      // Break long sentence at first natural pause
      const mid = sentence.indexOf(',');
      if (mid > 10 && mid < sentence.length - 10) {
        result.push(sentence.slice(0, mid + 1).trim());
        result.push(sentence.slice(mid + 1).trim());
      } else {
        result.push(sentence);
      }
    } else {
      result.push(sentence);
    }
  }

  return result.join('\n');
}

// ─── Tension → Narrative Texture Maps ───────────────

const TENSION_OPENING: Record<TensionType, string> = {
  polarity: 'Two forces occupy the same ground. Neither yields.\nThe question does not sit between them — it *is* the distance.',
  hierarchy: 'One voice here speaks louder than the rest. Not by right.\nBy weight. The others have not been silenced — they have been compressed.',
  illusion: 'The first thing the cards show is not what they mean.\nA surface, convincing. Beneath it, another reading entirely.',
  excess: 'Too much. The spread strains at its own edges.\nSomething here has overrun its banks — and the flood carries meaning with it.',
  absence: 'There is a silence in this spread.\nNot empty — hollowed. Something that should be here has withdrawn, and the remaining cards lean toward the gap.',
  sacrifice: 'The spread arranges itself around a wound.\nNot accidental. Deliberate. Something has been placed on the altar — or is about to be.',
  identity_split: 'Two readings coexist in the same spread.\nThey cannot both be true. And yet both are.',
  creation_destruction: 'Something is being born here.\nAnd something is dying at exactly the same rate. The cards do not separate the two — they insist on the simultaneity.',
};

const TENSION_CONNECTOR: Record<TensionType, string[]> = {
  polarity: ['Against this —', 'The counterweight:', 'From the opposite pole,'],
  hierarchy: ['Beneath that dominance,', 'In the shadow of that weight,', 'Subordinated but present,'],
  illusion: ['But look closer.', 'Behind this appearance,', 'What it actually shows:'],
  excess: ['Still more.', 'Added to this overflow,', 'Compounding the surplus,'],
  absence: ['Into that emptiness,', 'Where the void pulls,', 'Toward the missing center,'],
  sacrifice: ['Offered next:', 'The price continues.', 'Laid beside the first offering,'],
  identity_split: ['But the other self says —', 'Across the split,', 'The mirror responds:'],
  creation_destruction: ['Born from that destruction,', 'At the same threshold,', 'Where emergence meets dissolution,'],
};

// ─── Strategy → Progressive Discourse Movement ──────

interface StrategyMovement {
  /** How each successive card intensifies the movement */
  escalation: string[];
  /** The overall kinetic quality */
  kinesis: string;
}

const STRATEGY_MOVEMENT: Record<CompletionStrategy, StrategyMovement> = {
  integrate: {
    escalation: [
      'The first terms of a coalition.',
      'The holding deepens — what seemed incompatible begins to cohabit.',
      'And now the integration is complete: not fusion, but coexistence under pressure.',
    ],
    kinesis: 'The spread coheres. Not by eliminating difference, but by widening what can be held at once.',
  },
  sever: {
    escalation: [
      'The blade is visible.',
      'The cut deepens. What seemed continuous reveals a fracture line.',
      'The separation is complete. Clean. What remains belongs to what remains.',
    ],
    kinesis: 'Something here must be removed. Not negotiated — excised.',
  },
  expose: {
    escalation: [
      'A first layer peels back.',
      'Deeper now. What was assumed solid turns out to be a screen.',
      'Fully visible. Naked. What was concealed has nowhere left to hide.',
    ],
    kinesis: 'The spread moves toward nakedness. Layer by layer, the concealment dissolves.',
  },
  collapse: {
    escalation: [
      'The first fracture appears.',
      'The structure buckles. What was holding begins to give way.',
      'It falls. And in falling, reveals what was load-bearing all along.',
    ],
    kinesis: 'What has been sustained past its time now cedes. A controlled demolition.',
  },
  demand: {
    escalation: [
      'A claim is being made.',
      'The pressure increases. The reading will not soften this.',
      'The imperative is now absolute. No ambiguity remains.',
    ],
    kinesis: 'Pressure builds through the spread. Each card adds weight to a single demand.',
  },
  embody: {
    escalation: [
      'It enters the body.',
      'Deeper into flesh. The symbol becomes sensation.',
      'Fully incarnate. Not a concept anymore — a way of being in the room.',
    ],
    kinesis: 'The spread descends from thought into tissue. Each card roots the meaning further.',
  },
  limit: {
    escalation: [
      'A boundary appears.',
      'The containment tightens. What was sprawling begins to find its edges.',
      'The limit is drawn. Clear, non-negotiable. What is inside stays; what is outside stays.',
    ],
    kinesis: 'Edges are being drawn. The reading contracts to find what is essential.',
  },
  reverse: {
    escalation: [
      'The first inversion.',
      'What was dominant begins to recede. What was marginal rises.',
      'The polarity has fully shifted. The reading now speaks from the other side.',
    ],
    kinesis: 'A reversal courses through the spread. What seemed fixed turns on its axis.',
  },
  destabilize_further: {
    escalation: [
      'The ground shifts.',
      'Further. The disruption deepens, and the reading refuses to restabilize.',
      'Still open. Still moving. The cards reject closure.',
    ],
    kinesis: 'Stability is not the goal. The reading pushes deeper into upheaval, trusting what cannot yet be named.',
  },
};

// ─── Resolution → Symbolic Closure (embodied, never moral) ──

const RESOLUTION_CLOSURE: Record<ResolutionArchetype, string> = {
  paradox_as_ground: 'The contradiction holds.\nNot as a problem to solve, but as the ground itself — the place where the question lives and does not need to be answered.\nTwo truths. One spread. The tension is the foundation.',
  irruptive_revelation: 'Something has torn through.\nWhat was compressed erupts — not gradually, not gently. The concealment was a pressure vessel, and now the reading stands in the aftermath of its own unveiling.',
  mythic_cosmogony: 'A genesis.\nFrom the raw material of these cards, an origin story assembles itself. Not the memory of what was — the architecture of what is becoming.\nThe first day of a world that did not exist before this reading.',
  ethical_imperative: 'The reading hardens into a single point.\nNot counsel. Not suggestion. Something that does not bend, does not soften, does not wait.\nThe demand stands. It has been standing since the first card was drawn.',
  definitional_arrival: 'A name.\nWhat was fluid has crystallized. What refused definition now submits to it — not by force but by accumulated precision.\nThe word is exact. And once spoken, it cannot be unspoken.',
  tragic_acceptance: 'What is lost stays lost.\nThe reading does not console. It does not offer meaning as compensation. It witnesses.\nFrom that witnessing — not despite the loss but through it — a severe clarity.',
  relational_reconfiguration: 'The bonds have shifted.\nWhat was central has moved to the periphery. What was invisible now carries weight.\nThe map of connections is redrawn. The same nodes, different lines between them.',
};

// ─── Strategy Terminal Image (final symbolic mark) ──

const STRATEGY_TERMINAL: Record<CompletionStrategy, string> = {
  integrate: 'What was separate now shares a single breath.',
  sever: 'The cut is clean. Silence on both sides.',
  expose: 'Visible. Irreversibly visible.',
  collapse: 'The dust settles. What endures is what was real.',
  demand: 'The imperative stands. It does not repeat itself.',
  embody: 'Flesh. Bone. The symbol has become the body.',
  limit: 'The edge is drawn. Beyond it, nothing of this reading.',
  reverse: 'What was underneath now faces the light.',
  destabilize_further: 'Still open. Still moving. This is not the end.',
};

// ─── D-Score Tone Modulation ────────────────────────

interface ToneModulation {
  /** Overall tonal quality — affects intricacy of prose */
  verbosity: 'terse' | 'moderate' | 'elaborate';
  /** Whether to leave endings open (low D6) */
  ambiguousEnding: boolean;
  /** Whether synthesis should feel authoritative (high D5) */
  strongSynthesis: boolean;
  /** Whether tension is left visibly unresolved (low D4) */
  unresolvedTension: boolean;
}

function computeToneModulation(dimensions: DimensionScore[]): ToneModulation {
  const getScore = (id: string) => dimensions.find(d => d.id === id)?.score ?? 0.5;
  const d3 = getScore('D3'); // Narrative Depth
  const d4 = getScore('D4'); // Spread Balance
  const d5 = getScore('D5'); // Symbolic Resonance
  const d6 = getScore('D6'); // Entropy Quality

  return {
    verbosity: d3 >= 0.7 ? 'elaborate' : d3 >= 0.4 ? 'moderate' : 'terse',
    ambiguousEnding: d6 < 0.45,
    strongSynthesis: d5 >= 0.6,
    unresolvedTension: d4 < 0.45,
  };
}

// ─── Card Narrative Generation (Archetypal Density) ─

function generateCardNarrative(
  step: TransformationStep,
  placed: PlacedCard,
  index: number,
  totalCards: number,
  tensionType: TensionType,
  completionStrategy: CompletionStrategy,
  tone: ToneModulation,
  prevCardName?: string,
): string {
  const { cardName, role, thesis, destabilization, reconfiguration, embodiment } = step;
  const posLabel = placed.position.label;
  const reversed = placed.card.isReversed;
  const keywords = placed.card.keywords;
  const rhythm = TENSION_RHYTHM[tensionType];
  const strategyMov = STRATEGY_MOVEMENT[completionStrategy];

  // ── 1. Position entry — minimal, rhythmic ──
  const reversalMark = reversed ? ', inverted' : '';
  const positionEntry = index === 0
    ? `**${posLabel}**. ${cardName}${reversalMark}.`
    : index === totalCards - 1
      ? `**${posLabel}**, the final position. ${cardName}${reversalMark}.`
      : `**${posLabel}**. ${cardName}${reversalMark}.`;

  // ── 2. Connection to previous card via tension connector ──
  const connectorIdx = Math.min(index - 1, rhythm.connectors.length - 1);
  const connectionPhrase = (prevCardName && index > 0)
    ? `${TENSION_CONNECTOR[tensionType][Math.max(0, connectorIdx)]}`
    : '';

  // ── 3. Role — incarnated, not explained ──
  const roleIncarnation: Record<string, string> = {
    anchor: `${cardName} holds. Everything else orbits this.`,
    catalyst: `${cardName} does not rest. It ignites.`,
    shadow: `What is not spoken out loud — ${cardName} carries it.`,
    bridge: `Between what came before and what follows, ${cardName} spans the interval.`,
  };

  // ── 4. Concrete image from card material ──
  const keywordFragment = keywords.length >= 2
    ? `${keywords[0]} and ${keywords[1]} —`
    : keywords.length === 1
      ? `${keywords[0]} —`
      : '';
  const concreteImage = keywordFragment
    ? `${keywordFragment} not as description, but as presence.`
    : '';

  // ── 5. Strategy escalation marker ──
  const escalationMark = strategyMov.escalation[Math.min(index, strategyMov.escalation.length - 1)];

  // ── 6. Compose: image → tension → movement ──
  const lines: string[] = [];

  // Entry
  if (connectionPhrase) {
    lines.push(`${connectionPhrase} ${positionEntry}`);
  } else {
    lines.push(positionEntry);
  }

  // Role (brief)
  lines.push(roleIncarnation[role] ?? `${cardName} speaks from here.`);

  // Concrete image
  if (concreteImage) {
    lines.push(concreteImage);
  }

  // Thesis — what the card first propounds (the EMDE-generated text)
  lines.push(thesis);

  // Destabilization — the disruption
  lines.push(destabilization);

  // Reconfiguration
  lines.push(reconfiguration);

  // Embodiment (always include if present — archetypally dense)
  if (embodiment) {
    lines.push(`*${embodiment.content}*`);
  }

  // Strategy escalation — progressive movement marker
  lines.push(escalationMark);

  // Trailing fragment for certain tensions
  if (rhythm.trailingFragment && index < totalCards - 1) {
    lines.push('');
  }

  // Apply tension-aware rhythm to the composed block
  const rawBlock = lines.join('\n');
  return applyRhythm(rawBlock, tensionType);
}

// ─── Main Generator ─────────────────────────────────

/**
 * Generate a unified symbolic narrative from a complete reading response.
 *
 * @param response — Full UnifiedReadingResponse (contains spread, IDA output, quality)
 * @param dimensions — D1–D6 quality dimension scores (optional, defaults to neutral tone)
 */
export function generateSymbolicNarrative(
  response: UnifiedReadingResponse,
  dimensions?: DimensionScore[],
): SymbolicNarrative {
  const qn = response.questionNarrative;
  const { tensionType, completionStrategy, resolutionArchetype, transformationSteps } = qn;
  const spread = response.spread;

  // Compute tone modulation from D-scores
  const defaultDimensions: DimensionScore[] = [
    { id: 'D1', name: 'Structural Integrity', score: 0.5, details: '' },
    { id: 'D2', name: 'Archetypal Coherence', score: 0.5, details: '' },
    { id: 'D3', name: 'Narrative Depth', score: 0.5, details: '' },
    { id: 'D4', name: 'Spread Balance', score: 0.5, details: '' },
    { id: 'D5', name: 'Symbolic Resonance', score: 0.5, details: '' },
    { id: 'D6', name: 'Entropy Quality', score: 0.5, details: '' },
  ];
  const dims = dimensions ?? defaultDimensions;
  const tone = computeToneModulation(dims);

  const strategyMov = STRATEGY_MOVEMENT[completionStrategy];

  // ── Opening ────────────────────────────────
  const questionLine = response.question
    ? `"${response.question}"`
    : 'No question was spoken, yet the cards have arranged themselves into a pattern that demands attention.';

  const modeVoice = response.mode === 'divinatory'
    ? 'Through the temporal lens, the cards trace a trajectory.'
    : response.mode === 'philosophical'
      ? 'Through the existential lens, the cards interrogate the ground of being.'
      : 'Through the archetypal lens, the cards map universal symbolic forces.';

  const tensionOpening = TENSION_OPENING[tensionType];
  const kineticLine = strategyMov.kinesis;

  const openingLines = response.question
    ? [questionLine, '', modeVoice, '', tensionOpening, '', kineticLine]
    : [questionLine, '', modeVoice, '', tensionOpening, '', kineticLine];

  const opening = openingLines.join('\n');

  // ── Card Narratives ────────────────────────
  const cardNarratives: string[] = [];
  const steps = transformationSteps;
  const cardsUsed = Math.min(steps.length, spread.length);

  for (let i = 0; i < cardsUsed; i++) {
    const step = steps[i];
    const placed = spread[i];
    const prevName = i > 0 ? steps[i - 1].cardName : undefined;

    cardNarratives.push(
      generateCardNarrative(step, placed, i, cardsUsed, tensionType, completionStrategy, tone, prevName),
    );
  }

  // ── Synthesis ──────────────────────────────
  const cardNames = steps.slice(0, cardsUsed).map(s => s.cardName);
  const joinedCards = cardNames.length <= 2
    ? cardNames.join(' and ')
    : `${cardNames.slice(0, -1).join(', ')}, and ${cardNames[cardNames.length - 1]}`;

  const synthLines: string[] = [];

  synthLines.push(`${joinedCards}. A single structure.`);
  synthLines.push('');
  synthLines.push(qn.synthesis);

  if (tone.unresolvedTension) {
    synthLines.push('');
    synthLines.push('The tension remains partially unresolved — these cards do not offer a clean conclusion, and the dissonance is itself part of the meaning.');
  } else if (tone.strongSynthesis) {
    synthLines.push('');
    synthLines.push('The convergence is clear and forceful. What these cards say together cannot be easily dismissed.');
  }

  const synthesis = synthLines.join('\n');

  // ── Resolution ─────────────────────────────
  const resolutionLines: string[] = [];

  resolutionLines.push(RESOLUTION_CLOSURE[resolutionArchetype]);

  if (tone.ambiguousEnding) {
    resolutionLines.push('');
    resolutionLines.push('And yet — something remains unsaid. The ending is not fully sealed. This reading may circle back, demanding to be read again from a different angle.');
  }

  // Terminal image — not a moral, a symbolic mark
  resolutionLines.push('');
  resolutionLines.push(STRATEGY_TERMINAL[completionStrategy]);

  const resolution = resolutionLines.join('\n');

  return { opening, cardNarratives, synthesis, resolution };
}
