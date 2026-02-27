/**
 * Core — Card Interaction Matrix M(i,j)
 *
 * Computes pairwise interactions between all cards in the spread:
 *   - Polarity tensions (opposing forces)
 *   - Archetypal reinforcement (resonant forces)
 *   - Keyword overlap (thematic connection)
 *   - Sequential symbolic movement (positional flow)
 *   - Entropic clusters (grouped thematic units)
 *
 * The interaction matrix is computed FROM THE CARDS ALONE.
 * The question bias vector is not used here — this is pure
 * symbolic analysis of the card configuration.
 */
import type {
  PlacedCard,
  CardInteraction,
  CardInteractionMatrix,
} from '../../types';

// ─── Semantic Opposition Pairs ──────────────────────

const OPPOSITIONS: [string, string][] = [
  ['creation', 'destruction'],
  ['beginning', 'ending'],
  ['light', 'dark'],
  ['hope', 'fear'],
  ['love', 'hate'],
  ['union', 'separation'],
  ['order', 'chaos'],
  ['growth', 'decay'],
  ['freedom', 'bondage'],
  ['joy', 'sorrow'],
  ['truth', 'illusion'],
  ['strength', 'weakness'],
  ['wisdom', 'folly'],
  ['courage', 'cowardice'],
  ['peace', 'conflict'],
  ['abundance', 'scarcity'],
  ['clarity', 'confusion'],
  ['manifest', 'hidden'],
  ['active', 'passive'],
  ['conscious', 'unconscious'],
];

// ─── Keyword Clusters for Theme Detection ───────────

const KEYWORD_CLUSTERS: Record<string, string[]> = {
  'Creation & Genesis': ['creation', 'beginning', 'birth', 'genesis', 'new', 'emergence', 'manifest', 'potential', 'seed'],
  'Transformation': ['change', 'death', 'rebirth', 'transition', 'transform', 'evolve', 'metamorphosis', 'cycle'],
  'Wisdom & Knowledge': ['wisdom', 'knowledge', 'insight', 'understanding', 'truth', 'clarity', 'teaching', 'guidance'],
  'Power & Authority': ['power', 'authority', 'control', 'strength', 'will', 'dominance', 'rule', 'mastery'],
  'Love & Connection': ['love', 'union', 'bond', 'harmony', 'relationship', 'connection', 'empathy', 'trust'],
  'Shadow & Challenge': ['shadow', 'dark', 'fear', 'bondage', 'temptation', 'destruction', 'chaos', 'trial'],
  'Spiritual Quest': ['soul', 'spirit', 'divine', 'sacred', 'transcend', 'eternal', 'purpose', 'destiny'],
  'Material World': ['material', 'earth', 'practical', 'concrete', 'resource', 'abundance', 'nurture', 'fertility'],
};

// ─── Pairwise Computation ───────────────────────────

function keywordIntersection(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(k => k.toLowerCase()));
  return a.filter(k => setB.has(k.toLowerCase()));
}

function hasOpposition(keywordsA: string[], keywordsB: string[]): number {
  let oppCount = 0;
  const lowerA = keywordsA.map(k => k.toLowerCase());
  const lowerB = keywordsB.map(k => k.toLowerCase());

  for (const [pos, neg] of OPPOSITIONS) {
    const aHasPos = lowerA.some(k => k.includes(pos));
    const aHasNeg = lowerA.some(k => k.includes(neg));
    const bHasPos = lowerB.some(k => k.includes(pos));
    const bHasNeg = lowerB.some(k => k.includes(neg));

    if ((aHasPos && bHasNeg) || (aHasNeg && bHasPos)) {
      oppCount++;
    }
  }

  return oppCount;
}

function computePolarityTension(cardA: PlacedCard, cardB: PlacedCard): number {
  let tension = 0;

  // Reversed vs upright creates tension
  if (cardA.card.isReversed !== cardB.card.isReversed) {
    tension += 0.3;
  }

  // Keyword oppositions
  const oppCount = hasOpposition(cardA.card.keywords, cardB.card.keywords);
  tension += Math.min(0.4, oppCount * 0.15);

  // Same archetype = strong reinforcement (negative tension)
  if (cardA.card.archetype === cardB.card.archetype) {
    tension -= 0.4;
  }

  // Same suit = mild reinforcement
  if (cardA.card.suit && cardA.card.suit === cardB.card.suit) {
    tension -= 0.15;
  }

  // Keyword overlap reduces tension
  const overlap = keywordIntersection(cardA.card.keywords, cardB.card.keywords);
  tension -= overlap.length * 0.1;

  return Math.max(-1, Math.min(1, tension));
}

function computeReinforcement(cardA: PlacedCard, cardB: PlacedCard): number {
  let reinforcement = 0;

  // Same suit
  if (cardA.card.suit && cardA.card.suit === cardB.card.suit) {
    reinforcement += 0.3;
  }

  // Same archetype
  if (cardA.card.archetype === cardB.card.archetype) {
    reinforcement += 0.4;
  }

  // Both Major Arcana
  if (cardA.card.isMajor && cardB.card.isMajor) {
    reinforcement += 0.15;
  }

  // Keyword overlap
  const overlap = keywordIntersection(cardA.card.keywords, cardB.card.keywords);
  reinforcement += Math.min(0.3, overlap.length * 0.1);

  // Same orientation (both upright or both reversed)
  if (cardA.card.isReversed === cardB.card.isReversed) {
    reinforcement += 0.05;
  }

  return Math.min(1, reinforcement);
}

function describeMovement(cardA: PlacedCard, cardB: PlacedCard): string {
  const nameA = cardA.card.name;
  const nameB = cardB.card.name;
  const posA = cardA.position.label;
  const posB = cardB.position.label;

  const tension = computePolarityTension(cardA, cardB);
  const reinforcement = computeReinforcement(cardA, cardB);

  if (tension > 0.3) {
    return `${nameA} (${posA}) → ${nameB} (${posB}): opposition — archetypal tension`;
  } else if (reinforcement > 0.4) {
    return `${nameA} (${posA}) → ${nameB} (${posB}): resonance — archetypal reinforcement`;
  } else {
    return `${nameA} (${posA}) → ${nameB} (${posB}): transition — symbolic flow`;
  }
}

// ─── Entropic Cluster Detection ─────────────────────

function detectEntropicClusters(
  spread: PlacedCard[],
): Array<{ theme: string; cardNames: string[] }> {
  const clusters: Array<{ theme: string; cardNames: string[] }> = [];

  for (const [theme, clusterKeywords] of Object.entries(KEYWORD_CLUSTERS)) {
    const matchingCards: string[] = [];

    for (const placed of spread) {
      const cardKeywords = placed.card.keywords.map(k => k.toLowerCase());
      const hasMatch = clusterKeywords.some(ck =>
        cardKeywords.some(k => k.includes(ck) || ck.includes(k)),
      );
      if (hasMatch) {
        matchingCards.push(placed.card.name);
      }
    }

    if (matchingCards.length >= 2) {
      clusters.push({ theme, cardNames: matchingCards });
    }
  }

  return clusters;
}

// ─── Public API ─────────────────────────────────────

/**
 * Compute the full Card Interaction Matrix M(i,j) from a spread.
 *
 * This is a purely card-based computation — no question influence.
 * The matrix captures all pairwise relationships:
 *   - Polarity tensions
 *   - Archetypal reinforcements
 *   - Keyword overlaps
 *   - Sequential symbolic movement
 *   - Entropic clusters
 */
export function computeInteractionMatrix(
  spread: PlacedCard[],
): CardInteractionMatrix {
  const interactions: CardInteraction[] = [];

  for (let i = 0; i < spread.length; i++) {
    for (let j = i + 1; j < spread.length; j++) {
      const cardA = spread[i];
      const cardB = spread[j];

      interactions.push({
        cardAIndex: i,
        cardBIndex: j,
        cardAName: cardA.card.name,
        cardBName: cardB.card.name,
        polarityTension: computePolarityTension(cardA, cardB),
        archetypalReinforcement: computeReinforcement(cardA, cardB),
        keywordOverlap: keywordIntersection(cardA.card.keywords, cardB.card.keywords).length,
        symbolicMovement: describeMovement(cardA, cardB),
      });
    }
  }

  // Global metrics
  const globalTension = interactions.length > 0
    ? interactions.reduce((s, i) => s + i.polarityTension, 0) / interactions.length
    : 0;

  const globalReinforcement = interactions.length > 0
    ? interactions.reduce((s, i) => s + i.archetypalReinforcement, 0) / interactions.length
    : 0;

  const entropicClusters = detectEntropicClusters(spread);

  return {
    interactions,
    globalTension,
    globalReinforcement,
    entropicClusters,
    size: spread.length,
  };
}
