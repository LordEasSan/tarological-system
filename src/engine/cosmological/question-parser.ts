/**
 * Cosmological Engine — Question Parser
 *
 * Maps a universal/metaphysical question into:
 *   Qᵤ = (Cᵤ, Φᵤ, Δᵤ)
 *
 * Classification taxonomy (cosmological scope):
 *   - Cosmogonic: "How did the universe emerge?", "What is the origin of…"
 *   - Structural-Universal: "What is the structure of…", "What holds reality together?"
 *   - Archetypal-Essence: "What is the archetypal structure of love?"
 *   - Symbolic-Logic: "What is the symbolic logic of creation?"
 *   - Consciousness: "What is the structure of consciousness?"
 *
 * Detection criteria:
 *   - No personal pronouns (I/me/my/you) → universal scope
 *   - Abstract domain nouns (universe, love, being, consciousness…)
 *   - No decision-seeking language (should/choose/decide)
 */
import type {
  CosmologicalQuery,
  CosmologicalQuestionType,
  CosmologicalEmbedding,
  CosmologicalTemporalLogic,
  MeaningWeights,
} from '../../types';

// ─── Personal-Pronoun & Decision Detection ──────────

const PERSONAL_PRONOUN_PATTERNS = [
  /\b(i|me|my|mine|myself)\b/i,
  /\b(you|your|yours|yourself)\b/i,
  /\b(we|us|our|ours|ourselves)\b/i,
  /\b(io|mi|mio|mia|miei|mie)\b/i,
];

const DECISION_PATTERNS = [
  /\bshould\s+i\b/i,
  /\bwhat\s+should\b/i,
  /\bchoose\b/i,
  /\bdecide\b/i,
  /\bdecision\b/i,
  /\bwhat\s+do\s+i\s+do\b/i,
  /\bcosa\s+(devo|dovrei)\b/i,
];

/** Check if a question has personal pronouns */
export function hasPersonalPronouns(question: string): boolean {
  return PERSONAL_PRONOUN_PATTERNS.some(p => p.test(question));
}

/** Check if a question has decision-seeking language */
export function hasDecisionLanguage(question: string): boolean {
  return DECISION_PATTERNS.some(p => p.test(question));
}

// ─── Abstract Domain Nouns ──────────────────────────

const DOMAIN_NOUNS = [
  'universe', 'cosmos', 'creation', 'reality', 'existence', 'being',
  'consciousness', 'love', 'time', 'origin', 'space', 'infinity',
  'eternity', 'entropy', 'order', 'chaos', 'god', 'divine', 'sacred',
  'logos', 'archetype', 'myth', 'symbol', 'soul', 'spirit', 'matter',
  'energy', 'light', 'darkness', 'death', 'life', 'nature', 'law',
  'harmony', 'beauty', 'truth', 'unity', 'duality', 'polarity',
  'emergence', 'evolution', 'dissolution', 'structure', 'pattern',
  'form', 'formlessness', 'void', 'plenum', 'nothing', 'everything',
  'absolute', 'relative', 'transcendence', 'immanence',
  // Italian
  'universo', 'cosmo', 'creazione', 'realtà', 'coscienza', 'amore',
  'tempo', 'origine', 'spazio', 'eternità', 'infinito',
];

function detectDomainNouns(question: string): string[] {
  const lower = question.toLowerCase();
  return DOMAIN_NOUNS.filter(n => lower.includes(n));
}

// ─── Classification Rules ───────────────────────────

interface ClassificationRule {
  type: CosmologicalQuestionType;
  patterns: RegExp[];
  confidence: number;
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    type: 'cosmogonic',
    patterns: [
      /\b(how|why)\s+did\s+.*(universe|world|reality|everything|cosmos)\s+(emerge|begin|start|come\s+into)/i,
      /\borigin\s+of\s+(the\s+)?(universe|cosmos|creation|everything|world|reality)/i,
      /\bcreation\b/i,
      /\bgenesis\b/i,
      /\bbig\s+bang\b/i,
      /\bcosmogon/i,
      /\bfirst\s+cause\b/i,
      /\bbeginning\s+of\s+(all|everything|the|time)/i,
      /\bhow\s+.*(exist|begin|emerge|originate)/i,
    ],
    confidence: 0.9,
  },
  {
    type: 'consciousness',
    patterns: [
      /\bconsciousness\b/i,
      /\bawareness\b/i,
      /\bmind\b.*\b(nature|structure|essence)\b/i,
      /\bsentien(ce|t)\b/i,
      /\bqualia\b/i,
      /\bsubjective\s+experience\b/i,
      /\bperception\b.*\b(nature|structure)\b/i,
      /\bcoscienza\b/i,
    ],
    confidence: 0.85,
  },
  {
    type: 'symbolic-logic',
    patterns: [
      /\bsymbolic\s+(logic|structure|language|order)\b/i,
      /\blogic\s+of\s+(creation|existence|being|reality|the\s+universe)/i,
      /\bsymbolic\s+meaning\b/i,
      /\blogica\s+simbolica\b/i,
      /\bstructure\s+of\s+(meaning|symbol|myth)/i,
      /\blaw(s)?\s+of\s+(the\s+)?(universe|cosmos|existence|nature|reality)/i,
      /\bprinciple(s)?\s+of\s+(the\s+)?(universe|cosmos|creation)/i,
    ],
    confidence: 0.85,
  },
  {
    type: 'archetypal-essence',
    patterns: [
      /\barchety(pe|pal)\s+(structure|essence|nature|pattern|form)\b/i,
      /\b(essence|nature)\s+of\s+(love|beauty|truth|justice|evil|good|death|life|time|harmony)\b/i,
      /\bwhat\s+is\s+(love|beauty|truth|death|life|time|evil|good)\b/i,
      /\barchetypal\s+meaning\b/i,
      /\bessence\s+of\b/i,
      /\bcos['']?[èe]\s+(l['']amore|la\s+bellezza|la\s+verità)\b/i,
    ],
    confidence: 0.8,
  },
  {
    type: 'structural-universal',
    patterns: [
      /\bstructure\s+of\s+(the\s+)?(universe|reality|cosmos|existence|the\s+world)\b/i,
      /\bwhat\s+(holds|binds|connects)\b/i,
      /\bfundamental\s+(structure|pattern|order|form)\b/i,
      /\buniversal\s+(structure|pattern|order|principle|law)\b/i,
      /\bfabric\s+of\s+(reality|existence|the\s+universe)\b/i,
      /\bstruttura\s+(dell|del|della)/i,
    ],
    confidence: 0.75,
  },
];

// ─── Temporal Logic Profiles ────────────────────────

const TEMPORAL_PROFILES: Record<CosmologicalQuestionType, CosmologicalTemporalLogic> = {
  'cosmogonic': {
    operator: 'F',
    formula: 'F(∃Ψ: emergence(Ψ) ∧ configuration(Ψ))',
    scope: 'universal',
  },
  'structural-universal': {
    operator: 'G',
    formula: 'G(structure(U) ∈ ArchetypalField)',
    scope: 'atemporal',
  },
  'archetypal-essence': {
    operator: 'G',
    formula: 'G(essence(X) → ΨArchetype(X))',
    scope: 'atemporal',
  },
  'symbolic-logic': {
    operator: 'GF',
    formula: 'GF(symbolic_order(Σ) ∧ coherence(Σ))',
    scope: 'cyclic',
  },
  'consciousness': {
    operator: 'FG',
    formula: 'FG(awareness(C) → integrated_field(C))',
    scope: 'atemporal',
  },
};

// ─── Embedding Generation ───────────────────────────

const DIMENSION_KEYWORDS: Record<keyof MeaningWeights, string[]> = {
  psychological: [
    'consciousness', 'awareness', 'mind', 'perception', 'psyche', 'experience',
    'qualia', 'sentience', 'subjective', 'observe', 'cognition',
  ],
  spiritual: [
    'soul', 'spirit', 'divine', 'sacred', 'transcend', 'universe', 'cosmos',
    'eternal', 'infinite', 'absolute', 'god', 'logos', 'metaphysical',
    'immanence', 'transcendence', 'plenum', 'void',
  ],
  practical: [
    'structure', 'law', 'principle', 'order', 'pattern', 'form', 'logic',
    'cause', 'effect', 'mechanism', 'foundation', 'fundamental',
  ],
  creative: [
    'creation', 'emergence', 'genesis', 'origin', 'birth', 'new', 'evolve',
    'transform', 'generate', 'manifest', 'potential', 'possibility',
  ],
  relational: [
    'love', 'harmony', 'unity', 'duality', 'polarity', 'connection',
    'bond', 'between', 'relation', 'beauty', 'balance', 'synthesis',
  ],
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function computeDimensionWeights(question: string): Record<keyof MeaningWeights, number> {
  const lower = question.toLowerCase();
  const words = lower.split(/\s+/);
  const scores: Record<string, number> = {
    psychological: 0, spiritual: 0, practical: 0, creative: 0, relational: 0,
  };

  for (const word of words) {
    for (const [dim, keywords] of Object.entries(DIMENSION_KEYWORDS)) {
      for (const kw of keywords) {
        if (word.includes(kw) || kw.includes(word)) scores[dim] += 1;
      }
    }
  }

  const max = Math.max(...Object.values(scores), 1);
  for (const dim of Object.keys(scores)) {
    scores[dim] = Math.max(0.1, scores[dim] / max);
  }

  return scores as Record<keyof MeaningWeights, number>;
}

function computeArchetypeAffinities(question: string): Record<string, number> {
  const lower = question.toLowerCase();
  const affinities: Record<string, number> = {};

  const ARCHETYPE_KEYWORDS: Record<string, string[]> = {
    'major-0': ['beginning', 'leap', 'innocence', 'freedom', 'potential', 'void'],
    'major-1': ['power', 'creation', 'will', 'manifest', 'logos', 'magic'],
    'major-2': ['intuition', 'mystery', 'hidden', 'subconscious', 'moon', 'inner'],
    'major-3': ['nurture', 'abundance', 'fertility', 'nature', 'growth', 'mother'],
    'major-4': ['authority', 'structure', 'control', 'order', 'law', 'rule'],
    'major-5': ['tradition', 'wisdom', 'teaching', 'guidance', 'spiritual', 'doctrine'],
    'major-6': ['love', 'union', 'harmony', 'bond', 'polarity', 'duality'],
    'major-7': ['will', 'triumph', 'determination', 'drive', 'force', 'mastery'],
    'major-8': ['courage', 'strength', 'patience', 'endure', 'fortitude', 'inner'],
    'major-9': ['solitude', 'search', 'wisdom', 'light', 'truth', 'hermit'],
    'major-10': ['fate', 'cycle', 'change', 'fortune', 'turn', 'wheel'],
    'major-11': ['justice', 'balance', 'truth', 'fairness', 'law', 'karma'],
    'major-12': ['sacrifice', 'surrender', 'perspective', 'suspend', 'reverse', 'letting'],
    'major-13': ['death', 'transform', 'ending', 'rebirth', 'dissolution', 'transition'],
    'major-14': ['balance', 'moderate', 'patience', 'harmony', 'synthesis', 'temperance'],
    'major-15': ['shadow', 'bondage', 'temptation', 'material', 'chain', 'dark'],
    'major-16': ['upheaval', 'revelation', 'sudden', 'destruction', 'awaken', 'collapse'],
    'major-17': ['hope', 'faith', 'renew', 'inspire', 'star', 'cosmos'],
    'major-18': ['illusion', 'fear', 'subconscious', 'dream', 'moon', 'unknown'],
    'major-19': ['joy', 'success', 'clarity', 'sun', 'light', 'consciousness'],
    'major-20': ['judgement', 'rebirth', 'calling', 'awaken', 'reckon', 'revelation'],
    'major-21': ['completion', 'integration', 'whole', 'universe', 'totality', 'cosmos'],
  };

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

// ─── Public API ─────────────────────────────────────

/**
 * Check if a question qualifies as cosmological scope.
 * Criteria: no personal pronouns, no decision language, has domain nouns.
 */
export function isCosmologicalScope(question: string): boolean {
  if (hasPersonalPronouns(question)) return false;
  if (hasDecisionLanguage(question)) return false;
  const nouns = detectDomainNouns(question);
  return nouns.length > 0;
}

/**
 * Classify a cosmological question type.
 */
export function classifyCosmologicalQuestion(question: string): {
  type: CosmologicalQuestionType;
  confidence: number;
} {
  let bestType: CosmologicalQuestionType = 'structural-universal';
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

  return { type: bestType, confidence: Math.min(1, bestScore) };
}

/**
 * Parse a cosmological question into Qᵤ = (Cᵤ, Φᵤ, Δᵤ)
 */
export function parseCosmologicalQuestion(question: string): CosmologicalQuery {
  const { type: questionType } = classifyCosmologicalQuestion(question);

  const dimensionWeights = computeDimensionWeights(question);
  const archetypeAffinities = computeArchetypeAffinities(question);
  const domainNouns = detectDomainNouns(question);

  // Compute entropy
  const affinityValues = Object.values(archetypeAffinities);
  const affinitySum = affinityValues.reduce((a, b) => a + b, 0);
  const normalised = affinityValues.map(v => v / (affinitySum || 1));
  const shannonEntropy = -normalised.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum + p * Math.log2(p);
  }, 0);
  const maxEntropy = Math.log2(affinityValues.length || 1);
  const entropy = maxEntropy > 0 ? shannonEntropy / maxEntropy : 0.5;

  const embedding: CosmologicalEmbedding = {
    dimensionWeights,
    archetypeAffinities,
    entropy,
    domainNouns,
  };

  const temporalLogic = TEMPORAL_PROFILES[questionType];

  // Configuration openness: cosmological questions are generally very open
  const configurationOpenness = Math.min(1, 0.7 + entropy * 0.3);

  return {
    rawQuestion: question,
    questionType,
    embedding,
    temporalLogic,
    configurationOpenness,
  };
}
