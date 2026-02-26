/* ===================================================
 * MTPS Cloudflare Worker — Serverless API Handler
 * Full engine-aware endpoints for generation, LTL verification,
 * D1-D6 scoring, archetype families, and narrative generation.
 * Deployed at edge globally via Cloudflare Workers.
 * =================================================== */

// ─── CORS Headers ───────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function corsResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ─── Major Arcana Data ──────────────────────────────

const MAJOR_ARCANA = [
  { id: 'major-0', name: 'The Fool', number: 0, isMajor: true, archetype: 'The Innocent', keywords: ['beginnings', 'freedom', 'innocence'], meaningUp: 'New beginnings, spontaneity, a free spirit', meaningReversed: 'Recklessness, risk-taking, foolishness' },
  { id: 'major-1', name: 'The Magician', number: 1, isMajor: true, archetype: 'The Creator', keywords: ['willpower', 'manifestation', 'resourcefulness'], meaningUp: 'Manifestation, resourcefulness, power', meaningReversed: 'Manipulation, poor planning, untapped talents' },
  { id: 'major-2', name: 'The High Priestess', number: 2, isMajor: true, archetype: 'The Sage', keywords: ['intuition', 'mystery', 'subconscious'], meaningUp: 'Intuition, sacred knowledge, divine feminine', meaningReversed: 'Secrets, withdrawal, silence' },
  { id: 'major-3', name: 'The Empress', number: 3, isMajor: true, archetype: 'The Mother', keywords: ['fertility', 'nature', 'abundance'], meaningUp: 'Femininity, beauty, nature, abundance', meaningReversed: 'Creative block, dependence, emptiness' },
  { id: 'major-4', name: 'The Emperor', number: 4, isMajor: true, archetype: 'The Father', keywords: ['authority', 'structure', 'control'], meaningUp: 'Authority, establishment, structure', meaningReversed: 'Tyranny, rigidity, coldness' },
  { id: 'major-5', name: 'The Hierophant', number: 5, isMajor: true, archetype: 'The Teacher', keywords: ['tradition', 'conformity', 'education'], meaningUp: 'Spiritual wisdom, tradition, conformity', meaningReversed: 'Rebellion, subversiveness, new approaches' },
  { id: 'major-6', name: 'The Lovers', number: 6, isMajor: true, archetype: 'The Lover', keywords: ['love', 'harmony', 'relationships'], meaningUp: 'Love, harmony, relationships, alignment', meaningReversed: 'Disharmony, imbalance, misalignment' },
  { id: 'major-7', name: 'The Chariot', number: 7, isMajor: true, archetype: 'The Warrior', keywords: ['determination', 'willpower', 'victory'], meaningUp: 'Control, willpower, determination, victory', meaningReversed: 'Lack of direction, aggression, powerlessness' },
  { id: 'major-8', name: 'Strength', number: 8, isMajor: true, archetype: 'The Hero', keywords: ['courage', 'patience', 'inner strength'], meaningUp: 'Courage, persuasion, patience, inner strength', meaningReversed: 'Self-doubt, weakness, insecurity' },
  { id: 'major-9', name: 'The Hermit', number: 9, isMajor: true, archetype: 'The Seeker', keywords: ['introspection', 'solitude', 'guidance'], meaningUp: 'Soul-searching, introspection, being alone', meaningReversed: 'Isolation, loneliness, withdrawal' },
  { id: 'major-10', name: 'Wheel of Fortune', number: 10, isMajor: true, archetype: 'The Trickster', keywords: ['fate', 'cycles', 'turning point'], meaningUp: 'Good luck, karma, life cycles, destiny', meaningReversed: 'Bad luck, resistance to change, breaking cycles' },
  { id: 'major-11', name: 'Justice', number: 11, isMajor: true, archetype: 'The Judge', keywords: ['fairness', 'truth', 'law'], meaningUp: 'Justice, fairness, truth, law', meaningReversed: 'Unfairness, dishonesty, unaccountability' },
  { id: 'major-12', name: 'The Hanged Man', number: 12, isMajor: true, archetype: 'The Martyr', keywords: ['sacrifice', 'release', 'new perspective'], meaningUp: 'Pause, surrender, letting go, new perspectives', meaningReversed: 'Delays, resistance, stalling' },
  { id: 'major-13', name: 'Death', number: 13, isMajor: true, archetype: 'The Transformer', keywords: ['endings', 'change', 'transformation'], meaningUp: 'Endings, change, transformation, transition', meaningReversed: 'Resistance to change, fear of change' },
  { id: 'major-14', name: 'Temperance', number: 14, isMajor: true, archetype: 'The Healer', keywords: ['balance', 'moderation', 'patience'], meaningUp: 'Balance, moderation, patience, purpose', meaningReversed: 'Imbalance, excess, lack of purpose' },
  { id: 'major-15', name: 'The Devil', number: 15, isMajor: true, archetype: 'The Shadow', keywords: ['bondage', 'materialism', 'shadow self'], meaningUp: 'Shadow self, attachment, addiction, materialism', meaningReversed: 'Releasing limiting beliefs, exploring self' },
  { id: 'major-16', name: 'The Tower', number: 16, isMajor: true, archetype: 'The Destroyer', keywords: ['upheaval', 'revelation', 'awakening'], meaningUp: 'Sudden change, upheaval, chaos, revelation', meaningReversed: 'Avoiding disaster, fear of suffering' },
  { id: 'major-17', name: 'The Star', number: 17, isMajor: true, archetype: 'The Guide', keywords: ['hope', 'faith', 'renewal'], meaningUp: 'Hope, faith, purpose, renewal, spirituality', meaningReversed: 'Lack of faith, despair, disconnection' },
  { id: 'major-18', name: 'The Moon', number: 18, isMajor: true, archetype: 'The Dreamer', keywords: ['illusion', 'fear', 'subconscious'], meaningUp: 'Illusion, fear, anxiety, subconscious, intuition', meaningReversed: 'Release of fear, repressed emotion, clarity' },
  { id: 'major-19', name: 'The Sun', number: 19, isMajor: true, archetype: 'The Child', keywords: ['joy', 'success', 'vitality'], meaningUp: 'Positivity, fun, warmth, success, vitality', meaningReversed: 'Inner child, feeling down, overly optimistic' },
  { id: 'major-20', name: 'Judgement', number: 20, isMajor: true, archetype: 'The Awakener', keywords: ['reflection', 'reckoning', 'awakening'], meaningUp: 'Judgement, rebirth, inner calling, absolution', meaningReversed: 'Self-doubt, refusal of self-examination' },
  { id: 'major-21', name: 'The World', number: 21, isMajor: true, archetype: 'The Whole', keywords: ['completion', 'integration', 'accomplishment'], meaningUp: 'Completion, integration, accomplishment, travel', meaningReversed: 'Incompletion, stagnation, emptiness' },
];

// ─── Archetype Family Data ──────────────────────────

const ARCHETYPE_FAMILIES_DATA = {
  Jungian: {
    family: 'Jungian', name: 'Jungian Archetypes',
    description: "Based on Carl Jung's archetypal theory of the collective unconscious",
    mappings: {
      0: 'The Divine Child', 1: 'The Trickster', 2: 'The Anima', 3: 'The Great Mother',
      4: 'The Father', 5: 'The Sage', 6: 'The Syzygy', 7: 'The Hero',
      8: 'The Self', 9: 'The Wise Old Man', 10: 'The Mandala', 11: 'The Judge',
      12: 'The Martyr', 13: 'The Shadow', 14: 'The Healer', 15: 'The Shadow Self',
      16: 'The Destroyer', 17: 'The Spirit', 18: 'The Unconscious', 19: 'The Persona',
      20: 'The Resurrection', 21: 'The Individuation',
    },
  },
  Mythological: {
    family: 'Mythological', name: 'World Mythology',
    description: 'Archetypes drawn from cross-cultural mythological figures',
    mappings: {
      0: 'Hermes/Trickster', 1: 'Thoth/Mercury', 2: 'Isis/Artemis', 3: 'Demeter/Gaia',
      4: 'Zeus/Jupiter', 5: 'Chiron/Mentor', 6: 'Eros/Aphrodite', 7: 'Ares/Mars',
      8: 'Heracles/Samson', 9: 'Merlin/Odin', 10: 'Fortuna/Moirai', 11: 'Themis/Ma\'at',
      12: 'Odin/Prometheus', 13: 'Hades/Anubis', 14: 'Asclepius/Hygieia', 15: 'Pan/Set',
      16: 'Shiva/Thor', 17: 'Astraea/Nuit', 18: 'Selene/Hecate', 19: 'Apollo/Ra',
      20: 'Osiris/Phoenix', 21: 'Brahma/World-Tree',
    },
  },
  Alchemical: {
    family: 'Alchemical', name: 'Alchemical Stages',
    description: 'Mapped to the stages of the alchemical Great Work (Opus Magnum)',
    mappings: {
      0: 'Prima Materia', 1: 'Mercurius', 2: 'Luna', 3: 'Venus',
      4: 'Sol Rex', 5: 'Sal Philosophorum', 6: 'Coniunctio', 7: 'Citrinitas',
      8: 'Viriditas', 9: 'Nigredo/Putrefactio', 10: 'Rota', 11: 'Sublimatio',
      12: 'Solve', 13: 'Mortificatio', 14: 'Coagula', 15: 'Calcinatio',
      16: 'Separatio', 17: 'Albedo', 18: 'Fermentatio', 19: 'Rubedo',
      20: 'Multiplicatio', 21: 'Lapis Philosophorum',
    },
  },
  Qabalistic: {
    family: 'Qabalistic', name: 'Qabalistic Paths',
    description: 'Qabalistic Tree of Life paths and sephiroth correspondences',
    mappings: {
      0: 'Aleph/Air', 1: 'Beth/Mercury', 2: 'Gimel/Moon', 3: 'Daleth/Venus',
      4: 'Heh/Aries', 5: 'Vav/Taurus', 6: 'Zayin/Gemini', 7: 'Cheth/Cancer',
      8: 'Teth/Leo', 9: 'Yod/Virgo', 10: 'Kaph/Jupiter', 11: 'Lamed/Libra',
      12: 'Mem/Water', 13: 'Nun/Scorpio', 14: 'Samekh/Sagittarius', 15: 'Ayin/Capricorn',
      16: 'Peh/Mars', 17: 'Tzaddi/Aquarius', 18: 'Qoph/Pisces', 19: 'Resh/Sun',
      20: 'Shin/Fire', 21: 'Tau/Saturn',
    },
  },
  Astrological: {
    family: 'Astrological', name: 'Astrological',
    description: 'Zodiacal and planetary correspondences',
    mappings: {
      0: 'Uranus/Air', 1: 'Mercury', 2: 'Moon', 3: 'Venus',
      4: 'Aries', 5: 'Taurus', 6: 'Gemini', 7: 'Cancer',
      8: 'Leo', 9: 'Virgo', 10: 'Jupiter', 11: 'Libra',
      12: 'Neptune/Water', 13: 'Scorpio', 14: 'Sagittarius', 15: 'Capricorn',
      16: 'Mars', 17: 'Aquarius', 18: 'Pisces', 19: 'Sun',
      20: 'Pluto/Fire', 21: 'Saturn/Earth',
    },
  },
};

// ─── Spread Layouts ─────────────────────────────────

const SPREADS = {
  'three-card': [
    { index: 0, label: 'Past', description: 'Influences from the past', x: 20, y: 50, rotation: 0 },
    { index: 1, label: 'Present', description: 'Current situation', x: 50, y: 50, rotation: 0 },
    { index: 2, label: 'Future', description: 'Potential outcome', x: 80, y: 50, rotation: 0 },
  ],
  'celtic-cross': [
    { index: 0, label: 'Present', description: 'Current situation', x: 35, y: 50, rotation: 0 },
    { index: 1, label: 'Challenge', description: 'Immediate challenge', x: 35, y: 50, rotation: 90 },
    { index: 2, label: 'Foundation', description: 'Root cause', x: 35, y: 80, rotation: 0 },
    { index: 3, label: 'Recent Past', description: 'Recent influence', x: 15, y: 50, rotation: 0 },
    { index: 4, label: 'Crown', description: 'Best possible outcome', x: 35, y: 20, rotation: 0 },
    { index: 5, label: 'Near Future', description: 'What is approaching', x: 55, y: 50, rotation: 0 },
    { index: 6, label: 'Self', description: 'Your attitude', x: 78, y: 80, rotation: 0 },
    { index: 7, label: 'Environment', description: 'External influences', x: 78, y: 60, rotation: 0 },
    { index: 8, label: 'Hopes', description: 'Hopes and fears', x: 78, y: 40, rotation: 0 },
    { index: 9, label: 'Outcome', description: 'Final outcome', x: 78, y: 20, rotation: 0 },
  ],
  horseshoe: [
    { index: 0, label: 'Past', description: 'Past influences', x: 10, y: 70, rotation: 0 },
    { index: 1, label: 'Present', description: 'Current situation', x: 25, y: 40, rotation: 0 },
    { index: 2, label: 'Hidden', description: 'Hidden influences', x: 40, y: 20, rotation: 0 },
    { index: 3, label: 'Obstacle', description: 'Main obstacle', x: 55, y: 20, rotation: 0 },
    { index: 4, label: 'External', description: 'External factors', x: 70, y: 40, rotation: 0 },
    { index: 5, label: 'Advice', description: 'Suggested approach', x: 85, y: 55, rotation: 0 },
    { index: 6, label: 'Outcome', description: 'Likely outcome', x: 90, y: 75, rotation: 0 },
  ],
  star: [
    { index: 0, label: 'Center', description: 'Core theme', x: 50, y: 50, rotation: 0 },
    { index: 1, label: 'North', description: 'Aspiration', x: 50, y: 15, rotation: 0 },
    { index: 2, label: 'East', description: 'Action', x: 82, y: 38, rotation: 0 },
    { index: 3, label: 'South-East', description: 'Resources', x: 70, y: 78, rotation: 0 },
    { index: 4, label: 'South-West', description: 'Challenge', x: 30, y: 78, rotation: 0 },
    { index: 5, label: 'West', description: 'Wisdom', x: 18, y: 38, rotation: 0 },
  ],
};

// ─── Helpers ────────────────────────────────────────

function shuffle(arr, seed) {
  const copy = [...arr];
  let s = seed ?? Math.floor(Math.random() * 100000);
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pseudoMeaningScore(cardId, dimension) {
  let hash = 0;
  const str = `${cardId}:${dimension}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 100) / 100;
}

// ─── D1-D6 Scoring Engine (mirrors src/engine/scoring.ts) ───

function evaluateD1(spread, params) {
  let score = 1.0;
  const issues = [];
  const ids = spread.map(s => s.card.id);
  const unique = new Set(ids).size;
  if (unique < ids.length) { score -= 0.4; issues.push(`${ids.length - unique} duplicate(s)`); }
  if (spread.length !== (params.drawCount || spread.length)) { score -= 0.3; issues.push(`Count mismatch`); }
  const invalidPos = spread.filter(s => s.position.index < 0).length;
  if (invalidPos > 0) { score -= 0.3; issues.push(`${invalidPos} invalid pos`); }
  return { id: 'D1', name: 'Structural Integrity', score: Math.max(0, score), details: issues.join('; ') || 'OK' };
}

function evaluateD2(spread) {
  const archetypes = new Set(spread.map(s => s.card.archetype));
  const diversity = spread.length > 0 ? archetypes.size / spread.length : 0;
  const hasMajor = spread.some(s => s.card.isMajor);
  return { id: 'D2', name: 'Archetypal Coherence', score: Math.min(1, diversity * 0.7 + (hasMajor ? 0.3 : 0)), details: `${archetypes.size} archetypes` };
}

function evaluateD3(spread) {
  let totalKw = 0, hasMeanings = 0;
  for (const s of spread) { totalKw += s.card.keywords.length; if (s.card.meaningUp?.length > 20) hasMeanings++; }
  const avg = spread.length > 0 ? totalKw / spread.length : 0;
  const cov = spread.length > 0 ? hasMeanings / spread.length : 0;
  return { id: 'D3', name: 'Narrative Depth', score: Math.min(1, (avg / 5) * 0.5 + cov * 0.5), details: `Avg ${avg.toFixed(1)} kw/card` };
}

function evaluateD4(spread, params) {
  const comp = (params.drawCount || spread.length) > 0 ? Math.min(1, spread.length / (params.drawCount || spread.length)) : 0;
  const posUsed = new Set(spread.map(s => s.position.index)).size;
  const posCov = spread.length > 0 ? posUsed / spread.length : 0;
  return { id: 'D4', name: 'Spread Balance', score: Math.min(1, comp * 0.6 + posCov * 0.4), details: `${posUsed} positions` };
}

function evaluateD5(spread, weights) {
  const allKw = spread.flatMap(s => s.card.keywords);
  const unique = new Set(allKw);
  const reps = allKw.length - unique.size;
  const res = allKw.length > 0 ? reps / allKw.length : 0;
  const vals = Object.values(weights || {});
  const mean = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const variance = vals.length > 0 ? vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length : 0;
  const balance = 1 - Math.min(1, variance * 4);
  return { id: 'D5', name: 'Symbolic Resonance', score: Math.min(1, res * 0.4 + balance * 0.3 + (unique.size > 3 ? 0.3 : 0.1)), details: `${unique.size} unique kw` };
}

function evaluateD6(spread) {
  const nums = spread.map(s => s.card.number);
  const range = nums.length > 0 ? Math.max(...nums) - Math.min(...nums) : 0;
  const rangeScore = Math.min(1, range / 21);
  const revs = spread.filter(s => s.card.isReversed).length;
  const ratio = spread.length > 0 ? revs / spread.length : 0;
  const revEntropy = 1 - Math.abs(ratio - 0.5) * 2;
  return { id: 'D6', name: 'Entropy Quality', score: Math.min(1, rangeScore * 0.6 + revEntropy * 0.4), details: `Range ${range}/21` };
}

function computeServerQuality(spread, params) {
  const weights = [0.20, 0.18, 0.18, 0.15, 0.15, 0.14];
  const dims = [
    evaluateD1(spread, params),
    evaluateD2(spread),
    evaluateD3(spread),
    evaluateD4(spread, params),
    evaluateD5(spread, params.meaningWeights || {}),
    evaluateD6(spread),
  ];
  const totalW = weights.reduce((a, b) => a + b, 0);
  const composite = dims.reduce((sum, d, i) => sum + d.score * weights[i], 0) / totalW;
  return { dimensions: dims, composite, passed: composite >= 0.6, timestamp: new Date().toISOString() };
}

// ─── LTL Verification Engine (mirrors src/engine/ltl.ts) ────

function verifyLTL(spread, params) {
  const startTime = Date.now();

  const properties = [];

  // Safety: Card Uniqueness — G(∀i,j: i≠j → card(i) ≠ card(j))
  const ids = spread.map(s => s.card.id);
  const uniqueIds = new Set(ids).size === ids.length;
  properties.push({
    name: 'Card Uniqueness', type: 'safety',
    formula: 'G(∀i,j: i≠j → card(i) ≠ card(j))',
    passed: uniqueIds,
    details: uniqueIds ? `All ${ids.length} cards unique` : 'Duplicate cards detected',
  });

  // Safety: Valid Positions — G(∀c: position(c) ∈ Layout)
  const allValid = spread.every(s => s.position.index >= 0 && s.position.label?.length > 0);
  properties.push({
    name: 'Valid Positions', type: 'safety',
    formula: 'G(∀c: position(c) ∈ Layout)',
    passed: allValid,
    details: allValid ? 'All positions valid' : 'Invalid position detected',
  });

  // Co-safety: Spread Completeness — F(|placed| = |positions|)
  const complete = spread.length >= (params.drawCount || 3);
  properties.push({
    name: 'Spread Completeness', type: 'cosafety',
    formula: 'F(|placed| = |positions|)',
    passed: complete,
    details: `${spread.length}/${params.drawCount || 3} positions filled`,
  });

  // Co-safety: Major Arcana Present — F(∃c: isMajor(c))
  const hasMajor = spread.some(s => s.card.isMajor);
  properties.push({
    name: 'Major Arcana Present', type: 'cosafety',
    formula: 'F(∃c: isMajor(c))',
    passed: hasMajor,
    details: hasMajor
      ? `Major Arcana: ${spread.filter(s => s.card.isMajor).map(s => s.card.name).join(', ')}`
      : 'No Major Arcana in spread',
  });

  // Liveness: Archetype Diversity — GF(diverse(archetypes))
  const archetypes = new Set(spread.map(s => s.card.archetype));
  const divRatio = spread.length > 0 ? archetypes.size / spread.length : 0;
  properties.push({
    name: 'Archetype Diversity', type: 'liveness',
    formula: 'GF(diverse(archetypes))',
    passed: divRatio >= 0.5,
    details: `${archetypes.size} unique archetypes (${(divRatio * 100).toFixed(0)}% diversity)`,
  });

  // Co-liveness: Narrative-Spread Coherence — FG(coherent(narrative, spread))
  const allHaveMeaning = spread.every(s => s.card.meaningUp?.length > 0);
  properties.push({
    name: 'Narrative-Spread Coherence', type: 'coliveness',
    formula: 'FG(coherent(narrative, spread))',
    passed: allHaveMeaning,
    details: allHaveMeaning ? 'All cards have narrative-ready meanings' : 'Some cards lack meaning data',
  });

  const executionTimeMs = Date.now() - startTime;
  return {
    overallPassed: properties.every(p => p.passed),
    timestamp: new Date().toISOString(),
    properties,
    executionTimeMs,
  };
}

// ─── Route Handlers ─────────────────────────────────

async function handleGenerate(request) {
  const body = await request.json();
  const params = body.parameters || {};
  const reversals = params.reversalsEnabled ?? true;
  const spreadType = params.spreadType || 'three-card';
  const drawCount = params.drawCount || 3;
  const seed = params.seed;
  const family = params.archetypeFamily || 'Jungian';

  // Apply archetype family mappings
  const familyData = ARCHETYPE_FAMILIES_DATA[family] || ARCHETYPE_FAMILIES_DATA.Jungian;
  const cards = MAJOR_ARCANA.map((c) => ({
    ...c,
    archetype: familyData.mappings[c.number] || c.archetype,
    isReversed: reversals && Math.random() > 0.5,
  }));

  const shuffled = shuffle(cards, seed);
  const positions = SPREADS[spreadType] || SPREADS['three-card'];
  const count = Math.min(drawCount, positions.length, shuffled.length);

  const spread = positions.slice(0, count).map((pos, i) => ({
    card: shuffled[i],
    position: pos,
  }));

  // Compute D1-D6 quality score
  const quality = computeServerQuality(spread, params);

  // Compute per-card meaning scores
  const meaningScores = spread.map(s => {
    const weights = params.meaningWeights || { psychological: 0.5, spiritual: 0.5, practical: 0.5, creative: 0.5, relational: 0.5 };
    const dims = Object.keys(weights);
    const scores = {};
    let wSum = 0, tWeight = 0;
    for (const dim of dims) {
      const raw = pseudoMeaningScore(s.card.id, dim);
      scores[dim] = raw * weights[dim];
      wSum += scores[dim];
      tWeight += weights[dim];
    }
    return { cardId: s.card.id, dimensionScores: scores, composite: tWeight > 0 ? wSum / tWeight : 0 };
  });

  return corsResponse({ deck: shuffled, spread, quality, meaningScores });
}

async function handleVerify(request) {
  const body = await request.json();
  const spread = body.reading?.spread || body.spread || [];
  const params = body.reading?.parameters || body.parameters || {};

  const verification = verifyLTL(spread, params);
  return corsResponse({ verification });
}

async function handleArchetypes() {
  const archetypes = Object.values(ARCHETYPE_FAMILIES_DATA).map(f => ({
    family: f.family,
    name: f.name,
    description: f.description,
    majorArcana: Object.entries(f.mappings).map(([num, arch]) => ({
      number: parseInt(num), archetype: arch,
    })),
  }));
  return corsResponse({ archetypes });
}

async function handleReadings(request) {
  const body = await request.json();
  const spread = body.spread || [];
  const params = body.parameters || {};
  const weights = params.meaningWeights || {};
  const style = params.narrativeStyle || 'formal';

  const dominant = Object.entries(weights).sort((a, b) => b[1] - a[1])[0]?.[0] || 'psychological';

  const STYLE_PREFIXES = {
    formal: '## Reading Analysis',
    poetic: '## The Tapestry Unfolds',
    analytical: '## Analytical Breakdown',
    mystical: '## Whispers of the Arcana',
  };

  const sections = spread.map(pc => {
    const c = pc.card;
    const rev = c.isReversed ? ' (Reversed)' : '';
    const meaning = c.isReversed ? c.meaningReversed : c.meaningUp;
    if (style === 'formal') {
      return `### ${pc.position.label}: ${c.name}${rev}\n\n**Position ${pc.position.index + 1}** — ${pc.position.description}\nThe ${c.archetype} archetype manifests in the ${dominant} dimension.\n${meaning}`;
    } else if (style === 'poetic') {
      return `### ${pc.position.label}: ${c.name}${rev}\n\n*In the space of ${pc.position.description.toLowerCase()}...*\n${c.name} emerges as ${c.archetype}, speaking through the language of ${dominant}.\n${meaning}`;
    } else if (style === 'analytical') {
      return `### ${pc.position.label}: ${c.name}${rev}\n\n**[${pc.position.label}]** Archetype: ${c.archetype} | Keywords: ${c.keywords.join(', ')}\nPrimary dimension: ${dominant} | ${meaning}`;
    } else {
      return `### ${pc.position.label}: ${c.name}${rev}\n\nThe veil parts at the ${pc.position.label} position...\n${c.archetype} reveals: ${meaning}\n*Keywords: ${c.keywords.join(', ')}*`;
    }
  });

  const narrative = [
    STYLE_PREFIXES[style] || STYLE_PREFIXES.formal,
    '',
    ...sections,
    '',
    '### Synthesis',
    `The interplay between ${spread.map(pc => pc.card.name).join(', ')} creates a rich tapestry of ${dominant}-focused insight.`,
    `The reading path ${spread.map(pc => pc.card.name).join(' → ')} reveals the underlying archetypal pattern.`,
    '',
    `*— Generated by the MTPS ${style} narrative engine*`,
  ].join('\n\n');

  return corsResponse({ narrative });
}

// ─── Main Handler ───────────────────────────────────

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/generate' && request.method === 'POST') {
        return await handleGenerate(request);
      }

      if (path === '/api/verify' && request.method === 'POST') {
        return await handleVerify(request);
      }

      if (path === '/api/archetypes' && request.method === 'GET') {
        return await handleArchetypes();
      }

      if (path === '/api/readings' && request.method === 'POST') {
        return await handleReadings(request);
      }

      // Health check
      if (path === '/api/health') {
        return corsResponse({ status: 'ok', service: 'mtps-api', version: '0.1.0' });
      }

      return corsResponse({ error: 'Not Found' }, 404);
    } catch (err) {
      return corsResponse({ error: 'Internal Server Error', message: err.message }, 500);
    }
  },
};
