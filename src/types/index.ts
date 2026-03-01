/* ===================================================
 * MTPS — Meta-Tarological Positivist System
 * Core TypeScript Types & Interfaces
 * =================================================== */

// ─── Reading Mode ──────────────────────────────────

/** Reading mode — structural analysis or unified symbolic discourse */
export type ReadingMode = 'structural' | 'symbolic';

/** Language for the symbolic narrative text */
export type NarrativeLanguage = 'en' | 'it';

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

/** LLM-generated narrative integration output */
export interface NarrativeIntegration {
  /** Integrated ontological narrative (Markdown) */
  integratedNarrative: string;
  /** Ordered symbolic flow of archetypal symbols referenced */
  symbolicFlow: string[];
  /** Core existential tension identified */
  existentialTension: string;
  /** Trajectory clarification synthesising attractor dynamics */
  trajectoryClarification: string;
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
  /** Optional LLM-generated narrative integration */
  narrativeIntegration?: NarrativeIntegration;
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

export type InterrogationMode = 'divinatory' | 'philosophical' | 'cosmological';

export type AppView = 'welcome' | 'configure' | 'generate' | 'reading' | 'verify' | 'philosophical' | 'cosmological';

// ─── Cosmological / Universal Archetypal Mode ───────

/** Classification of cosmological question types */
export type CosmologicalQuestionType =
  | 'cosmogonic'
  | 'structural-universal'
  | 'archetypal-essence'
  | 'symbolic-logic'
  | 'consciousness';

/** Temporal logic for universal-scope questions */
export interface CosmologicalTemporalLogic {
  operator: 'G' | 'F' | 'GF' | 'FG';
  formula: string;
  scope: 'universal' | 'atemporal' | 'cyclic';
}

/** Embedding for cosmological questions Qᵤ */
export interface CosmologicalEmbedding {
  dimensionWeights: Record<keyof MeaningWeights, number>;
  archetypeAffinities: Record<string, number>;
  entropy: number;
  /** Abstract domain nouns detected */
  domainNouns: string[];
}

/**
 * Parsed cosmological query Qᵤ = (Cᵤ, Φᵤ, Δᵤ)
 */
export interface CosmologicalQuery {
  rawQuestion: string;
  questionType: CosmologicalQuestionType;
  embedding: CosmologicalEmbedding;
  temporalLogic: CosmologicalTemporalLogic;
  configurationOpenness: number;
}

/** An archetypal force in the configuration map */
export interface ArchetypalForce {
  archetype: string;
  cardName: string;
  cardId: string;
  /** Symbolic weight ∈ [0,1] */
  weight: number;
  /** Role in the generative sequence */
  role: 'generative' | 'structuring' | 'dissolving' | 'synthesising';
  keywords: string[];
}

/** Polarity sequence in the archetypal configuration */
export interface PolaritySequence {
  positive: string;
  negative: string;
  synthesis: string;
}

/** Archetypal Configuration Mapping ΨQᵤ */
export interface ArchetypalConfiguration {
  forces: ArchetypalForce[];
  emergenceOrder: string[];
  polaritySequences: PolaritySequence[];
  systemEntropy: number;
  configurationSummary: string;
}

/** Structured cosmological interpretation */
export interface CosmologicalInterpretation {
  symbolicModel: string;
  archetypalMap: string;
  polarityAnalysis: string;
  entropyAssessment: string;
  disclaimer: string;
  fullText: string;
}

/** Complete cosmological response */
export interface CosmologicalResponse {
  query: CosmologicalQuery;
  configuration: ArchetypalConfiguration;
  spread: PlacedCard[];
  verification: LTLVerification;
  interpretation: CosmologicalInterpretation;
  timestamp: string;
}

// ─── Unified Pipeline (Symbolic-First Architecture) ─────

/** Interpretive bias vector — question's constraint on interpretation weights */
export interface InterpretiveBiasVector {
  /** Dimension weight adjustments from question semantics */
  dimensionBias: Record<keyof MeaningWeights, number>;
  /** Archetypal affinity bias (card id → affinity ∈ [0,1]) */
  archetypeBias: Record<string, number>;
  /** Semantic keywords extracted from question */
  keywords: string[];
  /** Temporal orientation bias */
  temporalOrientation: 'past' | 'present' | 'future' | 'atemporal' | 'cyclic';
  /** Source question */
  rawQuestion: string;
  /** Entropy of the question space ∈ [0,1] */
  questionEntropy: number;
}

/** Pairwise interaction between two cards */
export interface CardInteraction {
  cardAIndex: number;
  cardBIndex: number;
  cardAName: string;
  cardBName: string;
  /** ∈ [-1, 1]: negative = reinforcing, positive = opposing */
  polarityTension: number;
  /** ∈ [0, 1] */
  archetypalReinforcement: number;
  keywordOverlap: number;
  symbolicMovement: string;
}

/** Full interaction matrix M(i,j) for the spread */
export interface CardInteractionMatrix {
  interactions: CardInteraction[];
  globalTension: number;
  globalReinforcement: number;
  entropicClusters: Array<{ theme: string; cardNames: string[] }>;
  size: number;
}

/** Symbolic role of a card in the configuration */
export type SymbolicRole = 'anchor' | 'catalyst' | 'shadow' | 'bridge';

/** Dominant archetype entry in symbolic configuration */
export interface DominantArchetype {
  archetype: string;
  cardName: string;
  cardId: string;
  score: number;
  role: SymbolicRole;
}

/** Tension pair — opposing archetypal forces */
export interface TensionPair {
  positive: { archetype: string; cardName: string };
  negative: { archetype: string; cardName: string };
  tensionScore: number;
}

/** Entropic cluster — group of cards forming a thematic unit */
export interface EntropicCluster {
  theme: string;
  cards: string[];
  entropy: number;
}

/** Symbolic Configuration S = f(cards, interactionMatrix) — primary epistemic source */
export interface SymbolicConfiguration {
  dominantArchetypes: DominantArchetype[];
  tensionPairs: TensionPair[];
  entropicClusters: EntropicCluster[];
  symbolicMovement: string[];
  entropy: number;
  interactionMatrix: CardInteractionMatrix;
}

/** Interpretive weight vector per mode */
export interface InterpretiveWeightVector {
  mode: InterrogationMode;
  temporalEmphasis: number;
  identityEmphasis: number;
  archetypalPolarityEmphasis: number;
  structuralPrincipleEmphasis: number;
  practicalEmphasis: number;
  lensDescription: string;
}

/** User profile context for personalization */
export interface UserProfileContext {
  priorReadings: Array<{
    timestamp: string;
    dominantArchetypes: string[];
    entropy: number;
    mode: InterrogationMode;
  }>;
  archetypeResonanceHistory: Record<string, number>;
  entropyPattern: number[];
  recurringAttractors: string[];
}

/** Unified narrative output — mandatory integration layer */
export interface UnifiedNarrative {
  existentialTension: string;
  symbolicMovement: string;
  archetypalDynamics: string;
  structuralResponse: string;
  opennessPreservation: string;
  disclaimer: string;
  fullNarrative: string;
  cardReferences: Record<string, string>;
}

/** Existential state — structured transformation state (no text accumulation) */
export interface ExistentialState {
  /** The current living existential thesis */
  currentThesis: string;
  /** Primary tension axis in the reading */
  tensionAxis: string;
  /** Unresolved polarity (null if resolved) */
  unresolvedPolarity: string | null;
  /** Direction of ontological movement */
  ontologicalDirection: string;
}

/** Transformation mode — how the EMDE engine processes each card */
export type TransformationMode =
  | 'dialectical'
  | 'irruptive'
  | 'revelatory'
  | 'inversional'
  | 'mythic'
  | 'ethical_directive'
  | 'definitional'
  | 'tragic_recognition'
  | 'relational_specific';

/** Resolution archetype — how the synthesis resolves, derived from Mode + TensionType + CompletionStrategy */
export type ResolutionArchetype =
  | 'paradox_as_ground'
  | 'irruptive_revelation'
  | 'mythic_cosmogony'
  | 'ethical_imperative'
  | 'definitional_arrival'
  | 'tragic_acceptance'
  | 'relational_reconfiguration';

/** Tension type — classifies the existential tension after all transformations */
export type TensionType =
  | 'polarity'
  | 'hierarchy'
  | 'illusion'
  | 'excess'
  | 'absence'
  | 'sacrifice'
  | 'identity_split'
  | 'creation_destruction';

/** Completion strategy — how the tension is to be resolved (with incompatibility constraints) */
export type CompletionStrategy =
  | 'integrate'
  | 'sever'
  | 'expose'
  | 'collapse'
  | 'demand'
  | 'embody'
  | 'limit'
  | 'reverse'
  | 'destabilize_further';

/** Symbolic embodiment — concrete image, relational dynamic, or mythic scene */
export interface SymbolicEmbodiment {
  /** Type of embodiment */
  type: 'concrete_image' | 'relational_dynamic' | 'mythic_scene';
  /** Embodied content — a concrete scene or image */
  content: string;
  /** Card that sourced this embodiment */
  cardSource: string;
}

/** A single transformation step — thesis → destabilization → reconfiguration */
export interface TransformationStep {
  /** 1-based depth in the sequence */
  depth: number;
  /** Card name at this step */
  cardName: string;
  /** Symbolic role */
  role: SymbolicRole;
  /** Transformation mode governing this step */
  transformationMode: TransformationMode;
  /** Provisional existential thesis answering Q */
  thesis: string;
  /** Destabilization via polarity or contradiction */
  destabilization: string;
  /** Reconfiguration of the thesis after destabilization */
  reconfiguration: string;
  /** Symbolic embodiment — concrete image, relational dynamic, or mythic scene */
  embodiment: SymbolicEmbodiment;
  /** Existential state AFTER this step */
  existentialState: ExistentialState;
}

/** Question-targeted narrative — Existential Mode Diversity Engine (EMDE) output */
export interface QuestionTargetedNarrative {
  /** Question restated in existential framing */
  questionRestatement: string;
  /** Transformation mode selected for this reading */
  transformationMode: TransformationMode;
  /** Transformation steps — thesis → destabilization → reconfiguration per card */
  transformationSteps: TransformationStep[];
  /** Final existential state after all transformations */
  existentialState: ExistentialState;
  /** How the synthesis resolves — derived from mode + tension + strategy */
  resolutionArchetype: ResolutionArchetype;
  /** Classified tension type from the final existential state */
  tensionType: TensionType;
  /** Completion strategy selected (with incompatibility constraints) */
  completionStrategy: CompletionStrategy;
  /** Card-by-card explanation (legacy compat) */
  cardExplanations: Array<{
    cardName: string;
    role: SymbolicRole;
    contribution: string;
  }>;
  /** Declarative synthesis — aligned with resolution archetype */
  synthesis: string;
  /** Symbolic embodiments across the reading */
  embodiments: SymbolicEmbodiment[];
  /** LLM-generated embodied articulation (null if no LLM available) */
  llmArticulation: string | null;
  /** Full rendered narrative */
  fullNarrative: string;
  /** Mode-appropriate disclaimer */
  disclaimer: string;
  /** Card references for validation */
  cardReferences: Record<string, string>;
}

/** Complete unified reading response */
export interface UnifiedReadingResponse {
  mode: InterrogationMode;
  question: string;
  biasVector: InterpretiveBiasVector;
  spread: PlacedCard[];
  symbolicConfiguration: SymbolicConfiguration;
  lens: InterpretiveWeightVector;
  narrative: UnifiedNarrative;
  /** Question-targeted narrative — Card Master voice */
  questionNarrative: QuestionTargetedNarrative;
  verification: LTLVerification;
  personalization: UserProfileContext;
  qualityScore?: number;
  timestamp: string;
}

export interface AppState {
  theme: ThemeMode;
  currentView: AppView;
  interrogationMode: InterrogationMode;
  readingMode: ReadingMode;
  narrativeLanguage: NarrativeLanguage;
  parameters: TarotParameters;
  currentReading: Reading | null;
  isLoading: boolean;
  error: string | null;
}
