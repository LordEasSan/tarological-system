/* ===================================================
 * MTPS — Meta-Tarological Positivist System
 * Core TypeScript Types & Interfaces
 * =================================================== */

// ─── Parameter Space Θ ─────────────────────────────

/** Archetype families for the Major Arcana mapping */
export type ArchetypeFamily =
  | 'Jungian'
  | 'Mythological'
  | 'Alchemical'
  | 'Qabalistic'
  | 'Astrological'
  | 'Custom';

/** Spread layout types */
export type SpreadType =
  | 'celtic-cross'
  | 'three-card'
  | 'horseshoe'
  | 'star'
  | 'custom';

/** The user-configurable parameter space θ ∈ Θ */
export interface TarotParameters {
  /** Archetype family for Major Arcana interpretation */
  archetypeFamily: ArchetypeFamily;
  /** Number of cards in the deck (22 Major only, 56 Minor, or full 78) */
  deckSize: 22 | 56 | 78;
  /** Whether reversals are enabled */
  reversalsEnabled: boolean;
  /** Spread layout type */
  spreadType: SpreadType;
  /** Number of cards to draw */
  drawCount: number;
  /** Semantic weight for each meaning dimension [0..1] */
  meaningWeights: MeaningWeights;
  /** Narrative style */
  narrativeStyle: 'formal' | 'poetic' | 'analytical' | 'mystical';
  /** Optional seed for deterministic generation */
  seed?: number;
}

/** Meaning function dimension weights */
export interface MeaningWeights {
  psychological: number;
  spiritual: number;
  practical: number;
  creative: number;
  relational: number;
}

// ─── Card Model ─────────────────────────────────────

/** Suit for Minor Arcana */
export type Suit = 'Wands' | 'Cups' | 'Swords' | 'Pentacles';

/** A single tarot card */
export interface TarotCard {
  id: string;
  name: string;
  number: number;
  suit?: Suit;
  isMajor: boolean;
  isReversed: boolean;
  archetype: string;
  keywords: string[];
  meaningUp: string;
  meaningReversed: string;
  imageUrl?: string;
}

// ─── Spread & Reading ───────────────────────────────

/** A position in a spread layout */
export interface SpreadPosition {
  index: number;
  label: string;
  description: string;
  x: number;  // relative position 0-100
  y: number;  // relative position 0-100
  rotation: number; // degrees
}

/** A spread layout definition */
export interface SpreadLayout {
  type: SpreadType;
  name: string;
  positions: SpreadPosition[];
}

/** A card placed in a spread position */
export interface PlacedCard {
  card: TarotCard;
  position: SpreadPosition;
}

/** A complete reading */
export interface Reading {
  id: string;
  timestamp: string;
  parameters: TarotParameters;
  spread: PlacedCard[];
  narrative: string;
  verification: LTLVerification;
}

// ─── LTL Verification ──────────────────────────────

/** Types of LTL properties */
export type LTLPropertyType = 'safety' | 'cosafety' | 'liveness' | 'coliveness';

/** A single LTL property check result */
export interface LTLProperty {
  name: string;
  type: LTLPropertyType;
  formula: string;
  passed: boolean;
  details?: string;
}

/** Complete LTL verification result */
export interface LTLVerification {
  overallPassed: boolean;
  timestamp: string;
  properties: LTLProperty[];
  executionTimeMs: number;
}

// ─── API Types ──────────────────────────────────────

export interface GenerateRequest {
  parameters: TarotParameters;
}

export interface GenerateResponse {
  deck: TarotCard[];
  spread: PlacedCard[];
}

export interface VerifyRequest {
  reading: Reading;
}

export interface VerifyResponse {
  verification: LTLVerification;
}

export interface ReadingRequest {
  parameters: TarotParameters;
  spread: PlacedCard[];
}

export interface ReadingResponse {
  narrative: string;
}

export interface ArchetypesResponse {
  archetypes: Array<{
    family: ArchetypeFamily;
    name: string;
    description: string;
    majorArcana: Array<{ number: number; archetype: string }>;
  }>;
}

// ─── UI State ───────────────────────────────────────

export type ThemeMode = 'dark' | 'light';

export type AppView = 'welcome' | 'configure' | 'generate' | 'reading' | 'verify';

export interface AppState {
  theme: ThemeMode;
  currentView: AppView;
  parameters: TarotParameters;
  currentReading: Reading | null;
  isLoading: boolean;
  error: string | null;
}
