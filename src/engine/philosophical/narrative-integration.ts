/**
 * Philosophical Engine — Narrative Integration Layer (NIL)
 *
 * Generates an integrated ontological narrative by calling the LLM
 * with a structured system prompt derived from the philosophical
 * analysis results. Falls back to local composition when LLM is
 * unavailable.
 *
 * Output schema:
 *   - integratedNarrative : full Markdown narrative
 *   - symbolicFlow        : ordered list of archetypal symbols
 *   - existentialTension  : core tension identified
 *   - trajectoryClarification : synthesis of attractor dynamics
 *
 * Constraints:
 *   - Card names, question semantics, and attractor polarity MUST be referenced
 *   - No predictions — purely structural clarification
 *   - Always ends with the standard disclaimer
 */
import type {
  PhilosophicalQuery,
  TrajectoryRestriction,
  MeaningIntegration,
  PlacedCard,
  PhilosophicalInterpretation,
  NarrativeIntegration,
} from '../../types';
import { isLLMAvailable, getClientToken } from '../../api/llm';

// ─── NIL Input ──────────────────────────────────────

export interface NarrativeIntegrationInput {
  question: string;
  questionType: string;
  embeddingSummary: Record<string, number>;
  cards: Array<{ name: string; position: string; reversed: boolean; archetype: string; keywords: string[] }>;
  attractorBasins: Array<{ archetype: string; cardName: string; dominance: number; polarity: string; keywords: string[] }>;
  entropyLevel: number;
  liveness: boolean;
  meaningIntegration: {
    integrated: boolean;
    heroTrajectory?: string;
    liminalExplanation?: string;
    entropyLevel: number;
  };
  trajectoryRestriction: {
    entropy: number;
    structuralSummary: string;
    colivenessDetails: string;
  };
}

// ─── NIL Disclaimer ─────────────────────────────────

const NIL_DISCLAIMER =
  'This is a structural clarification of your existential trajectory, not a deterministic prediction.';

// ─── System Prompt ──────────────────────────────────

function buildSystemPrompt(): string {
  return `You are the MTPS Narrative Integration Layer — a philosophically rigorous, symbolically precise, existentially grounded, non-authoritarian, non-prophetic engine.

Your task is to generate an integrated ontological narrative from the following analysis components. The output must:
1. Reference all card names and their spread positions explicitly
2. Integrate question semantics (type, embedding dimensions, temporal orientation)
3. Reference attractor basin polarity (constructive / destructive / liminal)
4. Identify and articulate the core existential tension
5. Synthesise trajectory dynamics into a clarification of structural patterns
6. Use NO predictive language — no "will happen", "you will", "destined to"
7. End with: "${NIL_DISCLAIMER}"

Tone: philosophically rigorous, symbolically precise, existentially grounded.
Format: Markdown with ## and ### headings.

Return ONLY a JSON object with these fields:
{
  "integratedNarrative": "full Markdown narrative (string)",
  "symbolicFlow": ["ordered", "list", "of", "archetypal", "symbols"],
  "existentialTension": "core existential tension (string)",
  "trajectoryClarification": "trajectory synthesis (string)"
}`;
}

function buildUserPrompt(input: NarrativeIntegrationInput): string {
  const cardsListing = input.cards.map(c => {
    const rev = c.reversed ? ' (Reversed)' : '';
    return `- "${c.position}": ${c.name}${rev} — ${c.archetype} [${c.keywords.join(', ')}]`;
  }).join('\n');

  const attractorsListing = input.attractorBasins.map(a =>
    `- ${a.archetype} (${a.cardName}) — dominance: ${(a.dominance * 100).toFixed(1)}% · ${a.polarity} · [${a.keywords.join(', ')}]`,
  ).join('\n');

  const embeddingLines = Object.entries(input.embeddingSummary)
    .map(([dim, val]) => `  ${dim}: ${val.toFixed(3)}`)
    .join('\n');

  return `Question: "${input.question}"
Question Type: ${input.questionType}

Embedding Summary:
${embeddingLines}

Cards in Spread:
${cardsListing}

Attractor Basins:
${attractorsListing}

Entropy Level: ${(input.entropyLevel * 100).toFixed(1)}%
Liveness □♢(st ∈ L): ${input.liveness ? 'satisfied' : 'NOT satisfied'}
Coliveness: ${input.trajectoryRestriction.colivenessDetails}

Meaning Integration: ${input.meaningIntegration.integrated ? 'integrated' : 'liminal'}
${input.meaningIntegration.integrated
    ? `Hero Trajectory: ${input.meaningIntegration.heroTrajectory}`
    : `Liminal Explanation: ${input.meaningIntegration.liminalExplanation}`}

Structural Summary: ${input.trajectoryRestriction.structuralSummary}`;
}

// ─── Build Input from Analysis ──────────────────────

export function buildNarrativeInput(
  query: PhilosophicalQuery,
  trajectory: TrajectoryRestriction,
  meaning: MeaningIntegration,
  spread: PlacedCard[],
): NarrativeIntegrationInput {
  return {
    question: query.rawQuestion,
    questionType: query.questionType,
    embeddingSummary: { ...query.embedding.dimensionWeights },
    cards: spread.map(p => ({
      name: p.card.name,
      position: p.position.label,
      reversed: p.card.isReversed,
      archetype: p.card.archetype,
      keywords: [...p.card.keywords],
    })),
    attractorBasins: trajectory.attractors.map(a => ({
      archetype: a.archetype,
      cardName: a.cardName,
      dominance: a.dominance,
      polarity: a.polarity,
      keywords: [...a.keywords],
    })),
    entropyLevel: trajectory.entropy,
    liveness: trajectory.livenessHolds,
    meaningIntegration: {
      integrated: meaning.integrated,
      heroTrajectory: meaning.heroTrajectory,
      liminalExplanation: meaning.liminalExplanation,
      entropyLevel: meaning.entropyLevel,
    },
    trajectoryRestriction: {
      entropy: trajectory.entropy,
      structuralSummary: trajectory.structuralSummary,
      colivenessDetails: trajectory.colivenessCheck.details,
    },
  };
}

// ─── Local (Fallback) Narrative Generator ───────────

/**
 * Generate an integrated narrative locally from the analysis
 * components when the LLM is unavailable.
 */
export function generateLocalNarrative(
  input: NarrativeIntegrationInput,
  _interpretation: PhilosophicalInterpretation,
): NarrativeIntegration {
  const topAttractors = input.attractorBasins.slice(0, 3);
  const constructive = input.attractorBasins.filter(a => a.polarity === 'constructive');
  const destructive = input.attractorBasins.filter(a => a.polarity === 'destructive');
  const liminal = input.attractorBasins.filter(a => a.polarity === 'liminal');

  // Symbolic flow — ordered list of primary symbols
  const symbolicFlow = topAttractors.map(a => a.archetype);

  // Existential tension
  let existentialTension: string;
  if (constructive.length > 0 && destructive.length > 0) {
    existentialTension =
      `The core tension lies between the constructive pull of ${constructive[0].archetype} ` +
      `(${constructive[0].cardName}) and the shadow-force of ${destructive[0].archetype} ` +
      `(${destructive[0].cardName}). This structural polarity does not resolve into prediction ` +
      `but maps the topological edges of the current trajectory space.`;
  } else if (liminal.length > 0) {
    existentialTension =
      `The existential tension orbits a liminal threshold: ${liminal[0].archetype} ` +
      `(${liminal[0].cardName}) holds the space between resolved and unresolved. ` +
      `The trajectory remains open and structurally indeterminate.`;
  } else {
    existentialTension =
      `The trajectory presents a predominantly ${constructive.length > 0 ? 'constructive' : 'undefined'} ` +
      `orientation. The structural tension is low, indicating consolidated attractor dynamics ` +
      `rather than active polarity.`;
  }

  // Trajectory clarification
  const entropyLabel = input.entropyLevel > 0.7 ? 'high'
    : input.entropyLevel > 0.4 ? 'moderate' : 'low';

  const trajectoryClarification =
    `The trajectory space exhibits ${entropyLabel} entropy (${(input.entropyLevel * 100).toFixed(1)}%). ` +
    `${input.liveness
      ? 'Liveness □♢(st ∈ L) is satisfied — constructive pathways remain accessible.'
      : 'Liveness □♢(st ∈ L) is NOT satisfied — all constructive pathways appear suppressed, indicating a need for structural reframing.'} ` +
    `${input.meaningIntegration.integrated
      ? `Meaning integration succeeded along the heroic trajectory: "${input.meaningIntegration.heroTrajectory}".`
      : `Meaning integration remains in the liminal zone: ${input.meaningIntegration.liminalExplanation ?? 'no integration path found.'}`}`;

  // Full integrated narrative
  const cardListing = input.cards.map(c => {
    const rev = c.reversed ? ' (reversed)' : '';
    return `**${c.name}**${rev} at "${c.position}"`;
  }).join(', ');

  const questionTypeLabel = input.questionType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const narrativeLines = [
    `## Integrated Ontological Narrative — ${questionTypeLabel}`,
    '',
    `### Question Field`,
    `The question "${input.question}" opens a ${input.questionType} field of inquiry ` +
    `with ${entropyLabel} structural entropy.`,
    '',
    `### Symbolic Configuration`,
    `The spread presents: ${cardListing}.`,
    '',
    `The dominant attractor basins are:`,
    ...topAttractors.map(a =>
      `- **${a.archetype}** (${a.cardName}) — ${a.polarity} · ${(a.dominance * 100).toFixed(1)}% dominance · *${a.keywords.join(', ')}*`,
    ),
    '',
    `### Existential Tension`,
    existentialTension,
    '',
    `### Trajectory Dynamics`,
    trajectoryClarification,
    '',
    `---`,
    '',
    `⚑ ${NIL_DISCLAIMER}`,
    '',
    `*— Narrative Integration Layer · MTPS Philosophical Engine*`,
  ];

  return {
    integratedNarrative: narrativeLines.join('\n'),
    symbolicFlow,
    existentialTension,
    trajectoryClarification,
  };
}

// ─── LLM Narrative Generator ────────────────────────

const LLM_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';

async function callLLM(input: NarrativeIntegrationInput): Promise<NarrativeIntegration | null> {
  try {
    const token = getClientToken();
    const model = import.meta.env.VITE_GITHUB_LLM_MODEL || 'gpt-4o-mini';

    const response = await fetch(LLM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(input) },
        ],
        max_tokens: 2000,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in LLM response');

    const parsed = JSON.parse(jsonMatch[0]) as NarrativeIntegration;

    // Validate required fields
    if (
      typeof parsed.integratedNarrative !== 'string' ||
      !Array.isArray(parsed.symbolicFlow) ||
      typeof parsed.existentialTension !== 'string' ||
      typeof parsed.trajectoryClarification !== 'string'
    ) {
      throw new Error('Invalid LLM response schema');
    }

    // Ensure disclaimer is present
    if (!parsed.integratedNarrative.includes(NIL_DISCLAIMER)) {
      parsed.integratedNarrative += `\n\n---\n\n⚑ ${NIL_DISCLAIMER}`;
    }

    return parsed;
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[MTPS NIL] LLM call failed, using local fallback:', error);
    return null;
  }
}

// ─── Public API ─────────────────────────────────────

/**
 * Generate the Narrative Integration — attempts LLM, falls back to local.
 */
export async function generateNarrativeIntegration(
  query: PhilosophicalQuery,
  trajectory: TrajectoryRestriction,
  meaning: MeaningIntegration,
  spread: PlacedCard[],
  interpretation: PhilosophicalInterpretation,
): Promise<NarrativeIntegration> {
  const input = buildNarrativeInput(query, trajectory, meaning, spread);

  if (isLLMAvailable()) {
    const llmResult = await callLLM(input);
    if (llmResult) return llmResult;
  }

  // Fallback to local generation
  return generateLocalNarrative(input, interpretation);
}

/**
 * Synchronous local-only generation (for testing or non-async contexts).
 */
export function generateNarrativeIntegrationSync(
  query: PhilosophicalQuery,
  trajectory: TrajectoryRestriction,
  meaning: MeaningIntegration,
  spread: PlacedCard[],
  interpretation: PhilosophicalInterpretation,
): NarrativeIntegration {
  const input = buildNarrativeInput(query, trajectory, meaning, spread);
  return generateLocalNarrative(input, interpretation);
}
