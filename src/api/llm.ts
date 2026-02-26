/**
 * API — GitHub LLM Integration Placeholder
 *
 * Interface for GitHub Models (Azure AI) narrative generation.
 * Falls back to the local narrative engine when not configured.
 *
 * To enable:
 *   1. Set VITE_GITHUB_LLM_TOKEN in your .env
 *   2. Optionally set VITE_GITHUB_LLM_MODEL (default: gpt-4o-mini)
 *
 * Uses the GitHub Models inference API:
 *   POST https://models.inference.ai.azure.com/chat/completions
 */
import type { PlacedCard, TarotParameters } from '../types';
import { generateNarrative } from '../engine/narrative';
import type { NarrativeConfig } from '../engine/narrative';

const LLM_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';

/** Check if LLM is available */
export function isLLMAvailable(): boolean {
  return !!import.meta.env.VITE_GITHUB_LLM_TOKEN;
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
        'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_LLM_TOKEN}`,
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
    console.warn('[MTPS] LLM fallback to local engine:', error);
    const config: NarrativeConfig = {
      style: params.narrativeStyle,
      weights: params.meaningWeights,
      includePositionContext: true,
    };
    return generateNarrative(spread, config).summary;
  }
}
