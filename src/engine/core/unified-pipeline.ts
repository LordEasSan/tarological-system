/**
 * Core — Unified Reading Pipeline
 *
 * Single entry-point: UnifiedReadingPipeline(mode, question, personalizationContext)
 *
 * Pipeline order MUST be:
 *   1. Personalization Context Load
 *   2. Spread Configuration Generation (MODE-INDEPENDENT)
 *   3. Card Extraction (from spread)
 *   4. Archetypal Interaction Analysis (CardInteractionMatrix M)
 *   5. Symbolic Configuration (S = f(cards, M))
 *   6. Mode-Specific Constraint Layer (InterpretiveWeightVector W_mode)
 *   7. Narrative Integration Layer (unified narrative through cards)
 *   8. Verification + Structured Response
 *
 * INVARIANT: Question analysis NEVER precedes spread generation.
 * INVARIANT: Cards are the generative symbolic engine.
 * INVARIANT: The question constrains interpretation, not the other way around.
 */
import type {
  TarotParameters,
  PlacedCard,
  InterrogationMode,
  UserProfileContext,
  UnifiedReadingResponse,
} from '../../types';
import { generateSpread } from './spread-generator';
import { computeBiasVector } from './bias-vector';
import { computeInteractionMatrix } from './interaction-matrix';
import { computeSymbolicConfiguration } from './symbolic-configuration';
import { getInterpretiveLens } from './interpretive-lens';
import { generateUnifiedNarrative } from './narrative-integration';
import { verifyReading } from '../ltl';

// ─── Personalization Context Builder ────────────────

function buildPersonalizationContext(
  partial?: Partial<UserProfileContext>,
): UserProfileContext {
  const defaults: UserProfileContext = {
    priorReadings: [],
    archetypeResonanceHistory: {},
    entropyPattern: [],
    recurringAttractors: [],
  };

  if (!partial) return defaults;

  const context = { ...defaults, ...partial };

  // Auto-detect recurring attractors from prior readings
  if (context.priorReadings.length >= 2 && context.recurringAttractors.length === 0) {
    const archetypeCounts: Record<string, number> = {};
    for (const reading of context.priorReadings) {
      for (const arch of reading.dominantArchetypes) {
        archetypeCounts[arch] = (archetypeCounts[arch] ?? 0) + 1;
      }
    }
    context.recurringAttractors = Object.entries(archetypeCounts)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([archetype]) => archetype);
  }

  return context;
}

// ─── Output Validation ──────────────────────────────

interface ValidationResult {
  valid: boolean;
  issues: string[];
}

function validateOutput(
  narrative: UnifiedReadingResponse['narrative'],
  spread: PlacedCard[],
  question: string,
  lens: UnifiedReadingResponse['lens'],
): ValidationResult {
  const issues: string[] = [];
  const fullText = narrative.fullNarrative.toLowerCase();

  // 1. All cards referenced in narrative
  for (const card of spread) {
    if (!fullText.includes(card.card.name.toLowerCase())) {
      issues.push(`Card "${card.card.name}" not referenced in narrative`);
    }
  }

  // 2. Disclaimer present
  if (!narrative.disclaimer) {
    issues.push('Disclaimer missing');
  }

  // 3. Question keywords appear (if question provided)
  if (question.trim()) {
    const keywords = question.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const found = keywords.some(kw => fullText.includes(kw));
    if (keywords.length > 0 && !found) {
      issues.push('No question keywords found in narrative');
    }
  }

  // 4. No predictive phrasing in philosophical mode
  if (lens.mode === 'philosophical') {
    const predictivePatterns = ['you will', 'will happen', 'destined to', 'fated to', 'is going to happen'];
    for (const pat of predictivePatterns) {
      if (fullText.includes(pat)) {
        issues.push(`Predictive phrasing "${pat}" found in philosophical mode`);
      }
    }
  }

  // 5. No empirical claims in cosmological mode
  if (lens.mode === 'cosmological') {
    const empiricalPatterns = ['scientifically', 'empirically proven', 'scientific fact', 'physics shows'];
    for (const pat of empiricalPatterns) {
      if (fullText.includes(pat)) {
        issues.push(`Empirical claim "${pat}" found in cosmological mode`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// ─── Public API ─────────────────────────────────────

/**
 * Execute the Unified Reading Pipeline.
 *
 * This is the single entry-point for all interrogation modes.
 * The pipeline enforces symbolic-first epistemology:
 *   - Spread is always generated first (mode-independent)
 *   - Question constrains interpretation only
 *   - Cards are the primary epistemic source
 *   - Mode applies as an interpretive lens after symbolic synthesis
 *
 * @param mode — Interrogation mode (divinatory / philosophical / cosmological)
 * @param question — User question (empty for open divinatory readings)
 * @param params — Tarot parameters (from configuration)
 * @param generateFn — Spread generation function
 * @param personalization — Optional prior reading context
 * @param existingSpread — Optional pre-generated spread to reinterpret
 */
export function executeUnifiedReading(
  mode: InterrogationMode,
  question: string,
  params: TarotParameters,
  generateFn: (p: TarotParameters) => PlacedCard[],
  personalization?: Partial<UserProfileContext>,
  existingSpread?: PlacedCard[],
): UnifiedReadingResponse {
  // ── Step 1: Personalization Context Load ────────
  const context = buildPersonalizationContext(personalization);

  // ── Step 2: Spread Generation (ALWAYS FIRST, mode-independent) ────
  let spread: PlacedCard[];
  let qualityScore: number | undefined;

  if (existingSpread && existingSpread.length > 0) {
    spread = existingSpread;
  } else {
    const result = generateSpread(params, generateFn);
    spread = result.spread;
    qualityScore = result.qualityScore;
  }

  // ── Step 3: Bias Vector (question as orienting constraint) ────
  // This comes AFTER spread generation — cannot influence card selection
  const biasVector = computeBiasVector(question, mode);

  // ── Step 4: Interaction Matrix M(i,j) ────
  const matrix = computeInteractionMatrix(spread);

  // ── Step 5: Symbolic Configuration S ────
  const symbolicConfiguration = computeSymbolicConfiguration(
    spread, matrix, biasVector, params,
  );

  // ── Step 6: Mode-Specific Interpretive Lens ────
  const lens = getInterpretiveLens(mode);

  // ── Step 7: Narrative Integration (through cards) ────
  const narrative = generateUnifiedNarrative(
    symbolicConfiguration, spread, biasVector, lens, context, question,
  );

  // ── Step 8: Verification ────
  const verification = verifyReading(spread, params);

  // ── Validation ────
  const validation = validateOutput(narrative, spread, question, lens);
  if (!validation.valid) {
    console.warn('[MTPS Unified Pipeline] Validation issues:', validation.issues);
  }

  // ── Update personalization for future readings ────
  context.priorReadings.push({
    timestamp: new Date().toISOString(),
    dominantArchetypes: symbolicConfiguration.dominantArchetypes
      .slice(0, 3)
      .map(a => a.archetype),
    entropy: symbolicConfiguration.entropy,
    mode,
  });
  context.entropyPattern.push(symbolicConfiguration.entropy);

  // Update resonance history
  for (const da of symbolicConfiguration.dominantArchetypes) {
    context.archetypeResonanceHistory[da.archetype] =
      (context.archetypeResonanceHistory[da.archetype] ?? 0) + da.score;
  }

  return {
    mode,
    question,
    biasVector,
    spread,
    symbolicConfiguration,
    lens,
    narrative,
    verification,
    personalization: context,
    qualityScore,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Re-interpret an existing spread under a different mode.
 * The spread stays the same — only the interpretive lens changes.
 */
export function reinterpretReading(
  existingResponse: UnifiedReadingResponse,
  newMode: InterrogationMode,
  params: TarotParameters,
): UnifiedReadingResponse {
  return executeUnifiedReading(
    newMode,
    existingResponse.question,
    params,
    () => existingResponse.spread, // dummy — won't be called
    existingResponse.personalization,
    existingResponse.spread,
  );
}
