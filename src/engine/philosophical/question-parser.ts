/**
 * Philosophical Engine — Question Parsing Layer
 *
 * Maps a free-form philosophical/ontological question into the structured form:
 *   Q = (C, ΦQ, Δ)
 * where:
 *   C  = QuestionEmbedding vector
 *   ΦQ = InferredTemporalLogic properties
 *   Δ  = trajectory pruning transformation
 *
 * Classification taxonomy:
 *   - Ontological: "What is X?", "What kind of world..."
 *   - Teleological: "What is the purpose of...", "Where am I heading..."
 *   - Identity: "Who am I...", "What am I becoming..."
 *   - Meaning-of-event: "What does it mean that X happened..."
 *   - Counterfactual-existential: "What if X had...", "What would it imply..."
 */
import type {
  PhilosophicalQuery,
  PhilosophicalQuestionType,
  QuestionEmbedding,
  InferredTemporalLogic,
  MeaningWeights,
} from '../../types';

// ─── Question Classification Patterns ───────────────

interface ClassificationRule {
  type: PhilosophicalQuestionType;
  patterns: RegExp[];
  /** Weight boost for this classification ∈ [0, 1] */
  confidence: number;
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    type: 'identity',
    patterns: [
      /\bwho\s+am\s+i\b/i,
      /\bwhat\s+am\s+i\s+(becoming|turning|evolving)/i,
      /\bchi\s+sono\b/i,
      /\bidentit[àa]/i,
      /\bbecoming\b/i,
      /\bself\b.*\bdef(ine|inition)\b/i,
      /\bmy\s+(true|real|essential)\s+(self|nature)\b/i,
      /\bwhat\s+defines\s+me\b/i,
    ],
    confidence: 0.9,
  },
  {
    type: 'meaning-of-event',
    patterns: [
      /\bwhat\s+does\s+it\s+mean\s+that\b/i,
      /\bwhat\s+does\s+it\s+imply\s+that\b/i,
      /\bmeaning\s+of\b/i,
      /\bsignificance\s+of\b/i,
      /\bwhy\s+did\s+.+\s+happen\b/i,
      /\bwhat\s+happened\b/i,
      /\bcosa\s+significa\b/i,
      /\bperch[ée]\s+[èe]\s+successo\b/i,
      /\bimpl(y|ies|ied|ication)\b.*\bfollow(ed|s)?\b/i,
      /\bfollow(ed|s)?\b.*\bimpl(y|ies|ied|ication)\b/i,
    ],
    confidence: 0.85,
  },
  {
    type: 'teleological',
    patterns: [
      /\bpurpose\b/i,
      /\bwhere\s+(am\s+i|are\s+we)\s+(head|going|moving)/i,
      /\bdestination\b/i,
      /\btelos\b/i,
      /\bwhat\s+is\s+the\s+(end|goal|aim)\b/i,
      /\bfinalit[àa]\b/i,
      /\bscopo\b/i,
      /\bul?timate\s+(purpose|meaning)\b/i,
      /\bwhat\s+(for|toward)\b/i,
    ],
    confidence: 0.85,
  },
  {
    type: 'counterfactual-existential',
    patterns: [
      /\bwhat\s+if\b/i,
      /\bwhat\s+would\b.*\bif\b/i,
      /\bhad\s+(not|never)\b/i,
      /\bcould\s+have\s+been\b/i,
      /\balternative\b/i,
      /\bcounterfactual\b/i,
      /\bse\s+(non\s+)?fosse\b/i,
      /\bwhat\s+would\s+it\s+imply\b/i,
      /\bimagine\s+(that|if)\b/i,
    ],
    confidence: 0.8,
  },
  {
    type: 'ontological',
    patterns: [
      /\bwhat\s+is\b/i,
      /\bwhat\s+kind\s+of\s+(world|reality|being|existence)\b/i,
      /\bnature\s+of\s+(reality|being|existence)\b/i,
      /\bontolog/i,
      /\bexist(ence|ential)/i,
      /\brealt[àa]/i,
      /\bcos['']?[èe]\b/i,
      /\bche\s+cos['']?[èe]\b/i,
      /\bwhat\s+does\s+it\s+mean\s+to\s+be\b/i,
      /\bwhat\s+world\b/i,
    ],
    confidence: 0.75,
  },
];

// ─── Temporal Logic Inference ───────────────────────

interface TemporalProfile {
  type: PhilosophicalQuestionType;
  temporalLogic: InferredTemporalLogic;
}

const TEMPORAL_PROFILES: TemporalProfile[] = [
  {
    type: 'ontological',
    temporalLogic: {
      operator: 'G',
      formula: 'G(being(s) ∈ Structure)',
      orientation: 'atemporal',
    },
  },
  {
    type: 'teleological',
    temporalLogic: {
      operator: 'GF',
      formula: 'GF(trajectory(s) → telos)',
      orientation: 'future',
    },
  },
  {
    type: 'identity',
    temporalLogic: {
      operator: 'FG',
      formula: 'FG(self(s) → integrated)',
      orientation: 'present',
    },
  },
  {
    type: 'meaning-of-event',
    temporalLogic: {
      operator: 'F',
      formula: 'F(∃τ′: φ_hero(τ′) ∧ meaning(e) > 0)',
      orientation: 'past',
    },
  },
  {
    type: 'counterfactual-existential',
    temporalLogic: {
      operator: 'GF',
      formula: 'GF(∃τ_alt: divergence(τ, τ_alt) ∧ liveness(τ_alt))',
      orientation: 'atemporal',
    },
  },
];

// ─── Embedding Generation ───────────────────────────

/**
 * Keyword-to-dimension affinity mappings for semantic embedding
 */
const DIMENSION_KEYWORDS: Record<keyof MeaningWeights, string[]> = {
  psychological: [
    'self', 'identity', 'becoming', 'mind', 'consciousness', 'ego',
    'shadow', 'persona', 'psyche', 'fear', 'desire', 'dream',
    'trauma', 'heal', 'growth', 'transform', 'inner',
  ],
  spiritual: [
    'soul', 'spirit', 'divine', 'sacred', 'transcend', 'universe',
    'cosmic', 'eternal', 'infinite', 'purpose', 'destiny', 'fate',
    'meaning', 'existence', 'being', 'metaphysical', 'beyond',
  ],
  practical: [
    'action', 'decision', 'choose', 'path', 'direction', 'material',
    'concrete', 'real', 'world', 'circumstance', 'situation', 'happen',
    'event', 'result', 'consequence', 'effect', 'change',
  ],
  creative: [
    'create', 'imagine', 'vision', 'possibility', 'alternative',
    'transform', 'new', 'become', 'emerge', 'potential', 'birth',
    'genesis', 'origin', 'inspire', 'express', 'art',
  ],
  relational: [
    'other', 'relationship', 'connection', 'love', 'bond', 'together',
    'between', 'follow', 'lead', 'community', 'human', 'social',
    'empathy', 'trust', 'belong', 'share',
  ],
};

/**
 * Generate a pseudo-deterministic hash for embedding computation
 */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Compute dimension weights from question text via keyword matching
 */
function computeDimensionWeights(question: string): Record<keyof MeaningWeights, number> {
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
    // Ensure minimum baseline
    scores[dim] = Math.max(0.1, scores[dim]);
  }

  return scores as Record<keyof MeaningWeights, number>;
}

/**
 * Compute archetype affinities from question text
 * Uses keyword overlap between question and archetype keywords
 */
function computeArchetypeAffinities(question: string): Record<string, number> {
  const lower = question.toLowerCase();
  const affinities: Record<string, number> = {};

  // Major Arcana archetypes with associated keyword sets
  const ARCHETYPE_KEYWORDS: Record<string, string[]> = {
    'major-0': ['beginning', 'leap', 'innocence', 'freedom', 'fool', 'new'],
    'major-1': ['power', 'creation', 'will', 'manifest', 'resource', 'magic'],
    'major-2': ['intuition', 'mystery', 'hidden', 'subconscious', 'secret', 'inner'],
    'major-3': ['nurture', 'abundance', 'fertility', 'nature', 'growth', 'mother'],
    'major-4': ['authority', 'structure', 'control', 'order', 'father', 'rule'],
    'major-5': ['tradition', 'wisdom', 'teaching', 'guidance', 'spiritual', 'conform'],
    'major-6': ['love', 'union', 'choice', 'harmony', 'relationship', 'bond'],
    'major-7': ['will', 'triumph', 'determination', 'victory', 'control', 'drive'],
    'major-8': ['courage', 'strength', 'patience', 'inner', 'endure', 'fortitude'],
    'major-9': ['solitude', 'introspection', 'search', 'wisdom', 'guidance', 'hermit'],
    'major-10': ['fate', 'cycle', 'change', 'fortune', 'turn', 'destiny'],
    'major-11': ['justice', 'balance', 'truth', 'fairness', 'law', 'karma'],
    'major-12': ['sacrifice', 'surrender', 'perspective', 'pause', 'let go', 'suspend'],
    'major-13': ['death', 'transform', 'ending', 'rebirth', 'change', 'transition'],
    'major-14': ['balance', 'moderate', 'patience', 'harmony', 'heal', 'temperance'],
    'major-15': ['shadow', 'bondage', 'temptation', 'material', 'chain', 'dark'],
    'major-16': ['upheaval', 'revelation', 'sudden', 'destruction', 'awaken', 'shock'],
    'major-17': ['hope', 'faith', 'renew', 'inspire', 'star', 'serenity'],
    'major-18': ['illusion', 'fear', 'subconscious', 'dream', 'moon', 'unknown'],
    'major-19': ['joy', 'success', 'vital', 'clarity', 'sun', 'warmth'],
    'major-20': ['judgement', 'rebirth', 'calling', 'absolv', 'awaken', 'reckon'],
    'major-21': ['completion', 'integration', 'whole', 'world', 'accomplishment', 'end'],
  };

  for (const [cardId, keywords] of Object.entries(ARCHETYPE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1;
    }
    // Add a pseudo-random base affinity
    const cardHash = hashString(cardId + lower);
    const base = (cardHash % 30) / 100; // 0 to 0.29
    affinities[cardId] = Math.min(1, (score / keywords.length) * 0.7 + base);
  }

  return affinities;
}

/**
 * Compute trajectory pruning factor Δ ∈ [0, 1]
 * Lower Δ = more pruning (more constrained trajectory space)
 * Higher Δ = less pruning (more open interpretation space)
 */
function computeTrajectoryPruning(
  questionType: PhilosophicalQuestionType,
  embedding: QuestionEmbedding,
): number {
  // Base pruning depends on question specificity
  const baseByType: Record<PhilosophicalQuestionType, number> = {
    'ontological': 0.8,            // Very open — large trajectory space
    'teleological': 0.6,           // Moderately constrained by teleological direction
    'identity': 0.5,               // Constrained around self-related trajectories
    'meaning-of-event': 0.4,       // More constrained — tied to specific event
    'counterfactual-existential': 0.7, // Open — many possible alternative worlds
  };

  // Adjust by entropy: higher entropy = less pruning
  const base = baseByType[questionType];
  return Math.min(1, Math.max(0, base + (embedding.entropy - 0.5) * 0.3));
}

// ─── Public API ─────────────────────────────────────

/**
 * Classify a question into a PhilosophicalQuestionType
 */
export function classifyQuestion(question: string): {
  type: PhilosophicalQuestionType;
  confidence: number;
} {
  let bestType: PhilosophicalQuestionType = 'ontological';
  let bestScore = 0;

  for (const rule of CLASSIFICATION_RULES) {
    let matches = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(question)) matches++;
    }
    const score = matches > 0 ? rule.confidence * (matches / rule.patterns.length + 0.5) : 0;
    if (score > bestScore) {
      bestScore = score;
      bestType = rule.type;
    }
  }

  return {
    type: bestType,
    confidence: Math.min(1, bestScore),
  };
}

/**
 * Parse a free-form question into a structured PhilosophicalQuery
 *
 * Q = (C, ΦQ, Δ)
 */
export function parseQuestion(question: string): PhilosophicalQuery {
  // Step 1: Classify question type
  const { type: questionType } = classifyQuestion(question);

  // Step 2: Compute embedding vector C
  const dimensionWeights = computeDimensionWeights(question);
  const archetypeAffinities = computeArchetypeAffinities(question);

  // Compute entropy from affinity distribution
  const affinityValues = Object.values(archetypeAffinities);
  const affinitySum = affinityValues.reduce((a, b) => a + b, 0);
  const normalised = affinityValues.map(v => v / (affinitySum || 1));
  const shannonEntropy = -normalised.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum + p * Math.log2(p);
  }, 0);
  const maxEntropy = Math.log2(affinityValues.length || 1);
  const entropy = maxEntropy > 0 ? shannonEntropy / maxEntropy : 0.5;

  const embedding: QuestionEmbedding = {
    dimensionWeights,
    archetypeAffinities,
    entropy,
  };

  // Step 3: Infer temporal logic properties ΦQ
  const temporalProfile = TEMPORAL_PROFILES.find(p => p.type === questionType)
    ?? TEMPORAL_PROFILES[0];
  const temporalLogic = temporalProfile.temporalLogic;

  // Step 4: Compute trajectory pruning Δ
  const trajectoryPruning = computeTrajectoryPruning(questionType, embedding);

  return {
    rawQuestion: question,
    questionType,
    embedding,
    temporalLogic,
    trajectoryPruning,
  };
}
