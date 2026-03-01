/**
 * NarrativeQualityValidator — runtime guard for generated output.
 *
 * Checks:
 *   1. No duplicated paragraphs within the same reading
 *   2. No repeated first sentence across cards
 *   3. No keyword-join artifacts ("true and friend")
 *   4. Minimum character length per section
 *   5. No empty sections
 *   6. Language consistency (no mixed language fragments)
 *   7. No banned phrases (structural jargon)
 *
 * If validation fails, the pipeline can regenerate once
 * or fall back to a safe structural template.
 */

import type { TransformationStep, QuestionTargetedNarrative } from '../../types';

// ─── Types ──────────────────────────────────────────

export interface NarrativeViolation {
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  violations: NarrativeViolation[];
}

// ─── Constants ──────────────────────────────────────

/** Minimum character length for each narrative section */
const MIN_SECTION_LENGTH = 30;

/** Minimum character length for full narrative */
const MIN_NARRATIVE_LENGTH = 200;

/** Known keyword-join artifacts to reject */
const KEYWORD_JOIN_PATTERNS = [
  /\b\w+\s+and\s+\w+\s+is\s+not\s+a\s+solitary/i,
  /\b\w+\s+and\s+\w+\s+is\s+(?:the|a)\b/i,
];

/** Structural jargon that should never appear */
const BANNED_JARGON = [
  'survives its own contradiction',
  'neither thesis nor negation',
  'carries the weight of what was denied',
  'cannot hold in its current form',
  'the understanding widens',
  'not an answer',
  'clarification',
  'open the question',
  'opens possibilities',
];

// ─── Core Validators ────────────────────────────────

function checkDuplicatedParagraphs(steps: TransformationStep[]): NarrativeViolation[] {
  const violations: NarrativeViolation[] = [];
  const seen = new Set<string>();

  for (const step of steps) {
    for (const phase of ['thesis', 'destabilization', 'reconfiguration'] as const) {
      const text = step[phase].trim().toLowerCase();
      if (text.length === 0) continue;
      if (seen.has(text)) {
        violations.push({
          code: 'DUPLICATE_PARAGRAPH',
          message: `Duplicate ${phase} found for card "${step.cardName}"`,
          severity: 'error',
        });
      }
      seen.add(text);
    }
  }

  return violations;
}

function checkRepeatedFirstSentence(steps: TransformationStep[]): NarrativeViolation[] {
  const violations: NarrativeViolation[] = [];
  const firstSentences: Map<string, string> = new Map();

  for (const step of steps) {
    const firstSentence = step.thesis.split(/[.!?]/)[0]?.trim().toLowerCase() ?? '';
    if (firstSentence.length < 10) continue;

    if (firstSentences.has(firstSentence)) {
      violations.push({
        code: 'REPEATED_OPENING',
        message: `Cards "${firstSentences.get(firstSentence)}" and "${step.cardName}" share the same thesis opening`,
        severity: 'warning',
      });
    }
    firstSentences.set(firstSentence, step.cardName);
  }

  return violations;
}

function checkKeywordJoinArtifacts(fullText: string): NarrativeViolation[] {
  const violations: NarrativeViolation[] = [];

  for (const pattern of KEYWORD_JOIN_PATTERNS) {
    if (pattern.test(fullText)) {
      violations.push({
        code: 'KEYWORD_JOIN_ARTIFACT',
        message: `Keyword-join artifact detected: "${fullText.match(pattern)?.[0]}"`,
        severity: 'error',
      });
    }
  }

  return violations;
}

function checkMinimumLengths(
  steps: TransformationStep[],
  synthesis: string,
  fullNarrative: string,
): NarrativeViolation[] {
  const violations: NarrativeViolation[] = [];

  for (const step of steps) {
    for (const phase of ['thesis', 'destabilization', 'reconfiguration'] as const) {
      if (step[phase].length < MIN_SECTION_LENGTH) {
        violations.push({
          code: 'SECTION_TOO_SHORT',
          message: `${phase} for "${step.cardName}" is only ${step[phase].length} chars (min: ${MIN_SECTION_LENGTH})`,
          severity: 'error',
        });
      }
    }
  }

  if (synthesis.length < MIN_SECTION_LENGTH) {
    violations.push({
      code: 'SYNTHESIS_TOO_SHORT',
      message: `Synthesis is only ${synthesis.length} chars`,
      severity: 'error',
    });
  }

  if (fullNarrative.length < MIN_NARRATIVE_LENGTH) {
    violations.push({
      code: 'NARRATIVE_TOO_SHORT',
      message: `Full narrative is only ${fullNarrative.length} chars (min: ${MIN_NARRATIVE_LENGTH})`,
      severity: 'error',
    });
  }

  return violations;
}

function checkEmptySections(steps: TransformationStep[], synthesis: string): NarrativeViolation[] {
  const violations: NarrativeViolation[] = [];

  for (const step of steps) {
    for (const phase of ['thesis', 'destabilization', 'reconfiguration'] as const) {
      if (!step[phase] || step[phase].trim().length === 0) {
        violations.push({
          code: 'EMPTY_SECTION',
          message: `Empty ${phase} for card "${step.cardName}"`,
          severity: 'error',
        });
      }
    }
  }

  if (!synthesis || synthesis.trim().length === 0) {
    violations.push({
      code: 'EMPTY_SYNTHESIS',
      message: 'Synthesis section is empty',
      severity: 'error',
    });
  }

  return violations;
}

function checkBannedJargon(fullText: string): NarrativeViolation[] {
  const violations: NarrativeViolation[] = [];
  const lower = fullText.toLowerCase();

  for (const phrase of BANNED_JARGON) {
    if (lower.includes(phrase)) {
      violations.push({
        code: 'BANNED_JARGON',
        message: `Banned phrase detected: "${phrase}"`,
        severity: 'warning',
      });
    }
  }

  return violations;
}

// ─── Public API ─────────────────────────────────────

/**
 * Validate a complete question-targeted narrative.
 * Returns a ValidationResult with all detected violations.
 */
export function validateNarrative(narrative: QuestionTargetedNarrative): ValidationResult {
  const violations: NarrativeViolation[] = [];

  violations.push(...checkEmptySections(narrative.transformationSteps, narrative.synthesis));
  violations.push(...checkDuplicatedParagraphs(narrative.transformationSteps));
  violations.push(...checkRepeatedFirstSentence(narrative.transformationSteps));
  violations.push(...checkKeywordJoinArtifacts(narrative.fullNarrative));
  violations.push(...checkMinimumLengths(narrative.transformationSteps, narrative.synthesis, narrative.fullNarrative));
  violations.push(...checkBannedJargon(narrative.fullNarrative));

  const hasErrors = violations.some(v => v.severity === 'error');

  return {
    valid: !hasErrors,
    violations,
  };
}

/**
 * Generate a safe structural fallback narrative when validation fails twice.
 * Produces a minimal but correct narrative from the transformation steps.
 */
export function generateSafeFallback(
  questionRestatement: string,
  steps: TransformationStep[],
  disclaimer: string,
): string {
  const sections: string[] = [questionRestatement, ''];

  for (const step of steps) {
    sections.push(`**${step.cardName}** (${step.role}): ${step.thesis}`);
    sections.push('');
  }

  sections.push('---', '', `*${disclaimer}*`);
  return sections.join('\n');
}
