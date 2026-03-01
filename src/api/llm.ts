/**
 * API — GitHub LLM Integration
 *
 * Interface for GitHub Models (Azure AI) narrative generation.
 * Falls back to the local narrative engine when no token is provided.
 *
 * Token is supplied at runtime from the client-side TokenContext
 * (stored in localStorage, never from env vars in production).
 *
 * Uses the GitHub Models inference API:
 *   POST https://models.inference.ai.azure.com/chat/completions
 */
import type { PlacedCard, TarotParameters } from '../types';
import { generateNarrative } from '../engine/narrative';
import type { NarrativeConfig } from '../engine/narrative';

const LLM_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';

// ─── Runtime token bridge ───────────────────────────
// Set by the React layer via setClientToken(); read by the API functions.

let _clientToken: string | null = null;

/** Called by TokenContext provider to keep the runtime token in sync. */
export function setClientToken(token: string | null): void {
  _clientToken = token;
}

/** Get the current runtime token. */
export function getClientToken(): string | null {
  return _clientToken;
}

/** Check if LLM is available (token is configured). */
export function isLLMAvailable(): boolean {
  return !!_clientToken;
}

/** Get configured model name */
function getModel(): string {
  return import.meta.env.VITE_GITHUB_LLM_MODEL || 'gpt-4o-mini';
}

/** Build prompt for the LLM */
function buildPrompt(spread: PlacedCard[], params: TarotParameters): string {
  const cards = spread.map(s => {
    const rev = s.card.isReversed ? ' (Reversed)' : '';
    return `- Position "${s.position.label}": ${s.card.name}${rev} — ${s.card.archetype} [${s.card.keywords.join(', ')}]`;
  }).join('\n');

  return `You are the MTPS (Meta-Tarological Positivist System) narrative engine.
Generate a ${params.narrativeStyle} reading interpretation for the following tarot spread:

Archetype Family: ${params.archetypeFamily}
Spread Type: ${params.spreadType}
Meaning emphasis: ${JSON.stringify(params.meaningWeights)}

Cards:
${cards}

Format the narrative with Markdown headings (## for title, ### for each card section).
End with a synthesis paragraph.`;
}

/**
 * Generate narrative via GitHub Models LLM
 * Falls back to local engine on failure or when unconfigured
 */
export async function generateLLMNarrative(
  spread: PlacedCard[],
  params: TarotParameters,
): Promise<string> {
  if (!isLLMAvailable()) {
    // Fallback to local engine
    const config: NarrativeConfig = {
      style: params.narrativeStyle,
      weights: params.meaningWeights,
      includePositionContext: true,
    };
    return generateNarrative(spread, config).summary;
  }

  try {
    const response = await fetch(LLM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_clientToken}`,
      },
      body: JSON.stringify({
        model: getModel(),
        messages: [
          { role: 'system', content: 'You are the MTPS narrative engine. Generate tarot reading interpretations in Markdown format.' },
          { role: 'user', content: buildPrompt(spread, params) },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? 'No response from LLM.';
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[MTPS] LLM fallback to local engine:', error);
    const config: NarrativeConfig = {
      style: params.narrativeStyle,
      weights: params.meaningWeights,
      includePositionContext: true,
    };
    return generateNarrative(spread, config).summary;
  }
}
