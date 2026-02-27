/**
 * Core — Interpretive Bias Vector
 *
 * Computes the InterpretiveBiasVector from a question string.
 * The bias vector constrains interpretation emphasis — it does NOT
 * pre-generate conclusions or determine attractor dominance.
 *
 * The question provides:
 *   - Dimension weight biasing (which meaning dimensions to emphasize)
 *   - Archetypal affinity biasing (which archetypes resonate with the question)
 *   - Keyword extraction (for narrative integration)
 *   - Temporal orientation
 *   - Question entropy (how open/constrained the question is)
 *
 * The bias vector is computed AFTER the spread is generated.
 * It cannot influence card selection.
 */
import type {
  InterpretiveBiasVector,
  MeaningWeights,
  InterrogationMode,
} from '../../types';

// ─── Dimension Keyword Affinities ───────────────────

const DIMENSION_KEYWORDS: Record<keyof MeaningWeights, string[]> = {
  psychological: [
    'self', 'identity', 'becoming', 'mind', 'consciousness', 'ego',
    'shadow', 'persona', 'psyche', 'fear', 'desire', 'dream',
    'trauma', 'heal', 'growth', 'transform', 'inner', 'anxiety',
    'depression', 'emotion', 'feeling', 'thought', 'belief',
  ],
  spiritual: [
    'soul', 'spirit', 'divine', 'sacred', 'transcend', 'universe',
    'cosmic', 'eternal', 'infinite', 'purpose', 'destiny', 'fate',
    'meaning', 'existence', 'being', 'metaphysical', 'beyond',
    'enlightenment', 'awakening', 'meditation', 'prayer',
  ],
  practical: [
    'action', 'decision', 'choose', 'path', 'direction', 'material',
    'concrete', 'real', 'world', 'circumstance', 'situation', 'happen',
    'event', 'result', 'consequence', 'effect', 'change', 'work',
    'career', 'money', 'health', 'daily', 'practical',
  ],
  creative: [
    'create', 'imagine', 'vision', 'possibility', 'alternative',
    'transform', 'new', 'become', 'emerge', 'potential', 'birth',
    'genesis', 'origin', 'inspire', 'express', 'art', 'beauty',
    'innovation', 'invention', 'dream',
  ],
  relational: [
    'other', 'relationship', 'connection', 'love', 'bond', 'together',
    'between', 'follow', 'lead', 'community', 'human', 'social',
    'empathy', 'trust', 'belong', 'share', 'family', 'friend',
    'partner', 'group', 'collective',
  ],
};

// ─── Archetype Keyword Mappings ─────────────────────

const ARCHETYPE_KEYWORDS: Record<string, string[]> = {
  'major-0': ['beginning', 'leap', 'innocence', 'freedom', 'fool', 'new', 'void', 'zero'],
  'major-1': ['power', 'creation', 'will', 'manifest', 'resource', 'magic', 'skill'],
  'major-2': ['intuition', 'mystery', 'hidden', 'subconscious', 'secret', 'inner', 'veil'],
  'major-3': ['nurture', 'abundance', 'fertility', 'nature', 'growth', 'mother', 'earth'],
  'major-4': ['authority', 'structure', 'control', 'order', 'father', 'rule', 'law'],
  'major-5': ['tradition', 'wisdom', 'teaching', 'guidance', 'spiritual', 'conform', 'institution'],
  'major-6': ['love', 'union', 'choice', 'harmony', 'relationship', 'bond', 'duality'],
  'major-7': ['will', 'triumph', 'determination', 'victory', 'control', 'drive', 'conquest'],
  'major-8': ['courage', 'strength', 'patience', 'inner', 'endure', 'fortitude', 'gentle'],
  'major-9': ['solitude', 'introspection', 'search', 'wisdom', 'guidance', 'hermit', 'retreat'],
  'major-10': ['fate', 'cycle', 'change', 'fortune', 'turn', 'destiny', 'karma'],
  'major-11': ['justice', 'balance', 'truth', 'fairness', 'law', 'karma', 'cause'],
  'major-12': ['sacrifice', 'surrender', 'perspective', 'pause', 'let go', 'suspend', 'reversal'],
  'major-13': ['death', 'transform', 'ending', 'rebirth', 'change', 'transition', 'release'],
  'major-14': ['balance', 'moderate', 'patience', 'harmony', 'heal', 'temperance', 'flow'],
  'major-15': ['shadow', 'bondage', 'temptation', 'material', 'chain', 'dark', 'attachment'],
  'major-16': ['upheaval', 'revelation', 'sudden', 'destruction', 'awaken', 'shock', 'collapse'],
  'major-17': ['hope', 'faith', 'renew', 'inspire', 'star', 'serenity', 'clarity'],
  'major-18': ['illusion', 'fear', 'subconscious', 'dream', 'moon', 'unknown', 'deception'],
  'major-19': ['joy', 'success', 'vital', 'clarity', 'sun', 'warmth', 'celebration'],
  'major-20': ['judgement', 'rebirth', 'calling', 'absolv', 'awaken', 'reckon', 'evaluation'],
  'major-21': ['completion', 'integration', 'whole', 'world', 'accomplishment', 'end', 'fulfillment'],
};

// ─── Temporal Orientation Keywords ──────────────────

const TEMPORAL_KEYWORDS = {
  past: ['was', 'happened', 'did', 'past', 'before', 'used to', 'once', 'ago', 'former', 'previous', 'history'],
  present: ['am', 'is', 'now', 'currently', 'being', 'experiencing', 'today', 'moment', 'here'],
  future: ['will', 'going to', 'future', 'ahead', 'next', 'tomorrow', 'become', 'heading', 'forward'],
  atemporal: ['what is', 'nature of', 'essence', 'meaning', 'structure', 'principle', 'universal', 'eternal', 'always'],
  cyclic: ['cycle', 'return', 'recur', 'pattern', 'repeat', 'rhythm', 'spiral', 'again', 'eternal return'],
};

// ─── Internal Helpers ───────────────────────────────

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function computeDimensionBias(question: string): Record<keyof MeaningWeights, number> {
  const lower = question.toLowerCase();
  const words = lower.split(/\s+/);
  const scores: Record<string, number> = {
    psychological: 0,
    spiritual: 0,
    practical: 0,
    creative: 0,
    relational: 0,
  };

  for (const word of words) {
    for (const [dim, keywords] of Object.entries(DIMENSION_KEYWORDS)) {
      for (const kw of keywords) {
        if (word.includes(kw) || kw.includes(word)) {
          scores[dim] += 1;
        }
      }
    }
  }

  // Normalize to [0, 1]
  const max = Math.max(...Object.values(scores), 1);
  for (const dim of Object.keys(scores)) {
    scores[dim] = scores[dim] / max;
    scores[dim] = Math.max(0.1, scores[dim]);
  }

  return scores as Record<keyof MeaningWeights, number>;
}

function computeArchetypeBias(question: string): Record<string, number> {
  const lower = question.toLowerCase();
  const affinities: Record<string, number> = {};

  for (const [cardId, keywords] of Object.entries(ARCHETYPE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1;
    }
    const cardHash = hashString(cardId + lower);
    const base = (cardHash % 30) / 100;
    affinities[cardId] = Math.min(1, (score / keywords.length) * 0.7 + base);
  }

  return affinities;
}

function extractKeywords(question: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'must', 'to', 'of', 'in',
    'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between', 'out',
    'up', 'down', 'then', 'than', 'too', 'very', 'just', 'about',
    'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
    'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
    'other', 'some', 'such', 'only', 'own', 'same', 'no', 'that',
    'this', 'these', 'those', 'it', 'its', 'i', 'me', 'my', 'we',
    'our', 'you', 'your', 'he', 'she', 'they', 'them', 'what', 'which',
    'who', 'whom', 'how', 'when', 'where', 'why', 'if',
  ]);

  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

function detectTemporalOrientation(
  question: string,
  mode: InterrogationMode,
): InterpretiveBiasVector['temporalOrientation'] {
  const lower = question.toLowerCase();

  // Mode-level defaults
  const modeDefaults: Record<InterrogationMode, InterpretiveBiasVector['temporalOrientation']> = {
    divinatory: 'future',
    philosophical: 'atemporal',
    cosmological: 'atemporal',
  };

  // Score each orientation
  const scores: Record<string, number> = { past: 0, present: 0, future: 0, atemporal: 0, cyclic: 0 };
  for (const [orientation, keywords] of Object.entries(TEMPORAL_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[orientation] += 1;
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return modeDefaults[mode];

  const best = Object.entries(scores).find(([, v]) => v === maxScore)!;
  return best[0] as InterpretiveBiasVector['temporalOrientation'];
}

function computeQuestionEntropy(archetypeBias: Record<string, number>): number {
  const values = Object.values(archetypeBias);
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum === 0) return 0.5;
  const normalised = values.map(v => v / sum);
  const shannonEntropy = -normalised.reduce((s, p) => {
    if (p <= 0) return s;
    return s + p * Math.log2(p);
  }, 0);
  const maxEntropy = Math.log2(values.length || 1);
  return maxEntropy > 0 ? shannonEntropy / maxEntropy : 0.5;
}

// ─── Public API ─────────────────────────────────────

/**
 * Compute the InterpretiveBiasVector from a question and mode.
 *
 * If no question is provided (divinatory mode, empty string),
 * returns a neutral bias vector that doesn't constrain interpretation.
 */
export function computeBiasVector(
  question: string,
  mode: InterrogationMode,
): InterpretiveBiasVector {
  const trimmed = question.trim();

  if (!trimmed) {
    // Neutral bias — no question constrains interpretation
    return {
      dimensionBias: {
        psychological: 0.5,
        spiritual: 0.5,
        practical: 0.5,
        creative: 0.5,
        relational: 0.5,
      },
      archetypeBias: {},
      keywords: [],
      temporalOrientation: mode === 'divinatory' ? 'future' : 'atemporal',
      rawQuestion: '',
      questionEntropy: 1.0, // Maximum openness
    };
  }

  const dimensionBias = computeDimensionBias(trimmed);
  const archetypeBias = computeArchetypeBias(trimmed);
  const keywords = extractKeywords(trimmed);
  const temporalOrientation = detectTemporalOrientation(trimmed, mode);
  const questionEntropy = computeQuestionEntropy(archetypeBias);

  return {
    dimensionBias,
    archetypeBias,
    keywords,
    temporalOrientation,
    rawQuestion: trimmed,
    questionEntropy,
  };
}
