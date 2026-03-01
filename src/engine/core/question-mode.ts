/**
 * QuestionMode Detection — lightweight semantic classification of user questions.
 *
 * Modes:
 *   relational   — who, friend, love, bond, trust, partner, family
 *   existential  — who am I, what am I becoming, identity, purpose of self
 *   causal       — why, what caused, reason, because, due to
 *   teleological — purpose, meaning, what for, destiny, goal
 *   predictive   — what will, future, happen, outcome, ahead, next
 *
 * Classification is deterministic, keyword-based, with ordered priority.
 * Multiple signals are weighted; highest-signal mode wins.
 */

export type QuestionMode = 'relational' | 'existential' | 'causal' | 'teleological' | 'predictive';

/**
 * Detect the semantic mode of a question.
 * Returns the highest-confidence mode based on keyword signals.
 */
export function detectQuestionMode(question: string): QuestionMode {
  const q = question.toLowerCase().replace(/[?.,!;:'"]/g, '');

  const scores: Record<QuestionMode, number> = {
    relational: 0,
    existential: 0,
    causal: 0,
    teleological: 0,
    predictive: 0,
  };

  // ─── Relational signals ───────────────────────
  if (/\b(?:friend|friends|friendship)\b/.test(q)) scores.relational += 3;
  if (/\b(?:love|lover|loving|beloved)\b/.test(q)) scores.relational += 3;
  if (/\b(?:partner|relationship|marriage|bond|trust|betray|betrayal)\b/.test(q)) scores.relational += 3;
  if (/\b(?:family|mother|father|brother|sister|child|children)\b/.test(q)) scores.relational += 2;
  if (/\b(?:enemy|rival|conflict|forgive|forgiveness)\b/.test(q)) scores.relational += 2;
  if (/\bwho\b/.test(q) && !/\bwho\s+am\s+i\b/.test(q)) scores.relational += 1;
  if (/\b(?:between|together|apart|connection|disconnect)\b/.test(q)) scores.relational += 1;

  // ─── Existential signals ──────────────────────
  if (/\bwho\s+am\s+i\b/.test(q)) scores.existential += 4;
  if (/\bwhat\s+am\s+i\s+(?:becoming|meant)\b/.test(q)) scores.existential += 4;
  if (/\b(?:identity|self|myself|authentic|authenticity)\b/.test(q)) scores.existential += 3;
  if (/\b(?:becoming|transformation|transform|evolve|evolving)\b/.test(q)) scores.existential += 2;
  if (/\b(?:exist|existence|being|am\s+i)\b/.test(q)) scores.existential += 2;
  if (/\b(?:real|reality|illusion|truth|true\s+self)\b/.test(q)) scores.existential += 1;
  if (/\b(?:freedom|free|liberate|liberation)\b/.test(q)) scores.existential += 1;

  // ─── Causal signals ──────────────────────────
  if (/^why\b/.test(q)) scores.causal += 4;
  if (/\bwhat\s+(?:caused|causes|made)\b/.test(q)) scores.causal += 3;
  if (/\b(?:cause|reason|because|due\s+to|origin|source|root)\b/.test(q)) scores.causal += 2;
  if (/\b(?:how\s+did|led\s+to|result\s+of)\b/.test(q)) scores.causal += 2;
  if (/\bwhy\b/.test(q)) scores.causal += 1;

  // ─── Teleological signals ────────────────────
  if (/\b(?:purpose|meaning\s+of|what\s+is\s+the\s+meaning)\b/.test(q)) scores.teleological += 4;
  if (/\b(?:destiny|destined|fate|mission|calling)\b/.test(q)) scores.teleological += 3;
  if (/\b(?:goal|aim|direction|what\s+for|meant\s+to)\b/.test(q)) scores.teleological += 2;
  if (/\b(?:lesson|teach|teaching|significance)\b/.test(q)) scores.teleological += 2;
  if (/\b(?:should\s+i|ought|point)\b/.test(q)) scores.teleological += 1;

  // ─── Predictive signals ─────────────────────
  if (/\bwhat\s+will\b/.test(q)) scores.predictive += 4;
  if (/\b(?:will\s+i|am\s+i\s+going\s+to)\b/.test(q)) scores.predictive += 3;
  if (/\b(?:future|ahead|outcome|next|happen|coming)\b/.test(q)) scores.predictive += 2;
  if (/\b(?:expect|await|awaiting|soon)\b/.test(q)) scores.predictive += 2;
  if (/\b(?:when\s+will|how\s+long|will\s+it)\b/.test(q)) scores.predictive += 2;

  // Find the highest-scoring mode
  let best: QuestionMode = 'existential'; // default
  let bestScore = 0;
  for (const [mode, score] of Object.entries(scores) as [QuestionMode, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = mode;
    }
  }

  return best;
}

/**
 * Narrative emphasis adjustments per QuestionMode.
 * Used by the variation engine and Direct Insight to subtly shift tone.
 */
export interface QuestionModeEmphasis {
  /** Emphasis label for paradox framing */
  paradoxFrame: string;
  /** Emphasis label for direct insight tone */
  insightTone: string;
  /** Preferred narrative register (affects word choice) */
  register: 'intimate' | 'structural' | 'speculative' | 'purposive' | 'confrontational';
}

const MODE_EMPHASIS: Record<QuestionMode, QuestionModeEmphasis> = {
  relational: {
    paradoxFrame: 'the space between self and other',
    insightTone: 'What the cards say about the bond',
    register: 'intimate',
  },
  existential: {
    paradoxFrame: 'what you are becoming versus what you are',
    insightTone: 'What the cards say about who you are',
    register: 'confrontational',
  },
  causal: {
    paradoxFrame: 'the cause that hides inside its effect',
    insightTone: 'What the cards say about why',
    register: 'structural',
  },
  teleological: {
    paradoxFrame: 'the purpose that may not justify the cost',
    insightTone: 'What the cards say about meaning',
    register: 'purposive',
  },
  predictive: {
    paradoxFrame: 'the future that exists only in the present act',
    insightTone: 'What the cards indicate about what comes next',
    register: 'speculative',
  },
};

export function getQuestionModeEmphasis(mode: QuestionMode): QuestionModeEmphasis {
  return MODE_EMPHASIS[mode];
}
