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

// ─── Philosophical-Ontological Query Mode ───────────

/** Classification of philosophical question types */
export type PhilosophicalQuestionType =
  | 'ontological'
  | 'teleological'
  | 'identity'
  | 'meaning-of-event'
  | 'counterfactual-existential';

/** Temporal logic property inferred from the question */
export interface InferredTemporalLogic {
  /** Primary temporal operator applicable */
  operator: 'G' | 'F' | 'GF' | 'FG';
  /** Human-readable formula */
  formula: string;
  /** Orientation: past, present, future, or atemporal */
  orientation: 'past' | 'present' | 'future' | 'atemporal';
}

/** Embedding vector representation of the question */
export interface QuestionEmbedding {
  /** Dimensional weights derived from question semantics */
  dimensionWeights: Record<keyof MeaningWeights, number>;
  /** Archetypal affinity scores (card id → affinity ∈ [0,1]) */
  archetypeAffinities: Record<string, number>;
  /** Entropy level of the question space ∈ [0,1] */
  entropy: number;
}

/**
 * Parsed philosophical query Q = (C, ΦQ, Δ)
 *   C  = embedding vector
 *   ΦQ = inferred temporal logic properties
 *   Δ  = trajectory pruning transformation
 */
export interface PhilosophicalQuery {
  /** Raw user question */
  rawQuestion: string;
  /** Classified question type */
  questionType: PhilosophicalQuestionType;
  /** C — embedding vector */
  embedding: QuestionEmbedding;
  /** ΦQ — inferred temporal logic properties */
  temporalLogic: InferredTemporalLogic;
  /** Δ — trajectory pruning factor ∈ [0,1], 0 = maximum pruning */
  trajectoryPruning: number;
}

/** An archetypal attractor basin in trajectory space */
export interface AttractorBasin {
  /** Archetype name (e.g. "The Shadow", "The Hero") */
  archetype: string;
  /** Card that embodies this attractor */
  cardName: string;
  cardId: string;
  /** Dominance score ∈ [0,1] */
  dominance: number;
  /** Basin keywords describing the gravitational pull */
  keywords: string[];
  /** Whether this is a constructive or destructive attractor */
  polarity: 'constructive' | 'destructive' | 'liminal';
}

/** Trajectory-space restriction result */
export interface TrajectoryRestriction {
  /** Dominant attractor basins ranked by dominance */
  attractors: AttractorBasin[];
  /** Overall entropy of the restricted space ∈ [0,1] */
  entropy: number;
  /** Whether the liveness constraint □♢(st ∈ L) is satisfied */
  livenessHolds: boolean;
  /** Coliveness assessment for destructive loop detection */
  colivenessCheck: {
    passed: boolean;
    details: string;
  };
  /** Structural summary of the trajectory space */
  structuralSummary: string;
}

/** Result from the meaning integration engine */
export interface MeaningIntegration {
  /** Whether meaning integration was successful */
  integrated: boolean;
  /** If integrated: the heroic trajectory found */
  heroTrajectory?: string;
  /** If integrated: properties satisfied */
  propertiesSatisfied: {
    heroPattern: boolean;
    cosafety: boolean;
    liveness: boolean;
  };
  /** If not integrated: liminal zone explanation */
  liminalExplanation?: string;
  /** Entropy level of the meaning space ∈ [0,1] */
  entropyLevel: number;
}

/** Complete philosophical response */
export interface PhilosophicalResponse {
  /** The parsed query */
  query: PhilosophicalQuery;
  /** Trajectory restriction analysis */
  trajectory: TrajectoryRestriction;
  /** Meaning integration result */
  meaning: MeaningIntegration;
  /** Cards drawn for this philosophical reading */
  spread: PlacedCard[];
  /** LTL verification of the structural properties */
  verification: LTLVerification;
  /** Generated interpretation sections */
  interpretation: PhilosophicalInterpretation;
  /** Timestamp */
  timestamp: string;
}

/** Structured philosophical interpretation */
export interface PhilosophicalInterpretation {
  /** Opening structural clarification */
  structuralClarification: string;
  /** Dominant attractor analysis */
  attractorAnalysis: string;
  /** Entropy and trajectory assessment */
  entropyAssessment: string;
  /** Meaning integration narrative */
  meaningNarrative: string;
  /** Safety disclaimer — always present */
  disclaimer: string;
  /** Full rendered text */
  fullText: string;
}

// ─── UI State ───────────────────────────────────────

export type ThemeMode = 'dark' | 'light';

export type InterrogationMode = 'divinatory' | 'philosophical';

export type AppView = 'welcome' | 'configure' | 'generate' | 'reading' | 'verify' | 'philosophical';

export interface AppState {
  theme: ThemeMode;
  currentView: AppView;
  interrogationMode: InterrogationMode;
  parameters: TarotParameters;
  currentReading: Reading | null;
  isLoading: boolean;
  error: string | null;
}
