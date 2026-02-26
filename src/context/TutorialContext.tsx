import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

/* ─── Tour‑step definition ────────────────────────── */

export interface TourStep {
  /** Unique identifier */
  id: string;
  /** CSS selector or element ID (without #) to highlight */
  target: string;
  /** Title shown in the tooltip */
  title: string;
  /** Explanatory body text */
  content: string;
  /** Preferred placement relative to the target */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Route the step belongs to — used for page‑specific tours */
  route?: string;
}

/* ─── Page tour sequences ─────────────────────────── */

export const TOUR_STEPS: TourStep[] = [
  // ── Welcome ──
  {
    id: 'welcome-hero',
    target: 'tour-welcome-hero',
    title: 'Dashboard Principale',
    content: 'Benvenuto nel Meta-Tarological Positivist System! Questa è la pagina iniziale con una panoramica del framework.',
    placement: 'bottom',
    route: '/',
  },
  {
    id: 'welcome-begin',
    target: 'tour-welcome-begin',
    title: 'Inizia la Configurazione',
    content: 'Clicca qui per avviare il wizard di configurazione dei parametri θ ∈ Θ.',
    placement: 'bottom',
    route: '/',
  },
  {
    id: 'welcome-features',
    target: 'tour-welcome-features',
    title: 'Funzionalità Principali',
    content: 'Esplora le tre aree: Configurazione parametri, Generazione lettura e Verifica LTL.',
    placement: 'top',
    route: '/',
  },

  // ── Configure ──
  {
    id: 'config-archetype',
    target: 'tour-config-archetype',
    title: 'Profilo Culturale',
    content: 'Scegli la famiglia archetipale: Jungiana, Mitologica, Alchemica, Qabalistica o Astrologica.',
    placement: 'bottom',
    route: '/configure',
  },
  {
    id: 'config-spread',
    target: 'tour-config-step-indicator',
    title: 'Step del Wizard',
    content: 'Naviga tra i 4 step: Framework Culturale → Entropia → Narrazione → Revisione.',
    placement: 'bottom',
    route: '/configure',
  },
  {
    id: 'config-finish',
    target: 'tour-config-next',
    title: 'Avanza nel Wizard',
    content: 'Usa Next/Back per spostarti tra i passi, oppure clicca "Generate Reading" dall\'ultimo step.',
    placement: 'top',
    route: '/configure',
  },

  // ── Generate ──
  {
    id: 'gen-header',
    target: 'tour-gen-generate-btn',
    title: 'Genera il Mazzo',
    content: 'Clicca per generare una lettura. Il motore adattivo iterativo (ΔQi < τ) cerca la qualità ottimale.',
    placement: 'bottom',
    route: '/generate',
  },
  {
    id: 'gen-views',
    target: 'tour-gen-view-tabs',
    title: 'Visualizza i Risultati',
    content: 'Scegli tra Spread (layout), Cards (griglia), Narrative (testo) e Quality (radar D1-D6).',
    placement: 'bottom',
    route: '/generate',
  },
  {
    id: 'gen-actions',
    target: 'tour-gen-actions',
    title: 'Azioni sulla Lettura',
    content: 'Richiedi narrazione LLM/locale, verifica LTL, affina la lettura o rigenerala.',
    placement: 'top',
    route: '/generate',
  },

  // ── Verify ──
  {
    id: 'verify-info',
    target: 'tour-verify-info',
    title: 'Classi di Proprietà LTL',
    content: 'Qui sono spiegate le 4 classi temporali: Safety, Co-safety, Liveness, Co-liveness.',
    placement: 'bottom',
    route: '/verify',
  },
  {
    id: 'verify-run',
    target: 'tour-verify-run',
    title: 'Avvia Verifica',
    content: 'Clicca per eseguire il model-checking LTL con 6 proprietà sulla lettura corrente.',
    placement: 'bottom',
    route: '/verify',
  },
  {
    id: 'verify-results',
    target: 'tour-verify-results',
    title: 'Interpreta Risultati',
    content: 'I risultati mostrano pass/fail per ogni proprietà, con dettagli sulla formula verificata.',
    placement: 'top',
    route: '/verify',
  },
];

/* ─── State ───────────────────────────────────────── */

interface TutorialState {
  /** Whether the tour is currently active/open */
  isActive: boolean;
  /** Index into the filtered steps array */
  currentStepIndex: number;
  /** Route filter — null = global tour, string = page-specific */
  activeRoute: string | null;
  /** Whether the user has completed the full tour at least once */
  hasCompletedTour: boolean;
}

const LS_KEY = 'mtps-tutorial';

function loadPersistedState(): Partial<TutorialState> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        hasCompletedTour: !!parsed.hasCompletedTour,
        currentStepIndex: typeof parsed.currentStepIndex === 'number' ? parsed.currentStepIndex : 0,
      };
    }
  } catch { /* noop */ }
  return {};
}

function persistState(state: TutorialState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      hasCompletedTour: state.hasCompletedTour,
      currentStepIndex: state.currentStepIndex,
    }));
  } catch { /* noop */ }
}

const initialState: TutorialState = {
  isActive: false,
  currentStepIndex: 0,
  activeRoute: null,
  hasCompletedTour: false,
};

/** Lazy initializer for useReducer — reads localStorage at mount time */
function initState(): TutorialState {
  return { ...initialState, ...loadPersistedState() };
}

/* ─── Actions ─────────────────────────────────────── */

type TutorialAction =
  | { type: 'START'; route: string | null }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GOTO'; index: number }
  | { type: 'SKIP' }
  | { type: 'FINISH' }
  | { type: 'RESET' };

function tutorialReducer(state: TutorialState, action: TutorialAction): TutorialState {
  switch (action.type) {
    case 'START':
      return { ...state, isActive: true, currentStepIndex: 0, activeRoute: action.route };
    case 'NEXT':
      return { ...state, currentStepIndex: state.currentStepIndex + 1 };
    case 'PREV':
      return { ...state, currentStepIndex: Math.max(0, state.currentStepIndex - 1) };
    case 'GOTO':
      return { ...state, currentStepIndex: action.index };
    case 'SKIP':
      return { ...state, isActive: false, currentStepIndex: 0 };
    case 'FINISH':
      return { ...state, isActive: false, currentStepIndex: 0, hasCompletedTour: true };
    case 'RESET':
      return { ...state, hasCompletedTour: false, currentStepIndex: 0 };
    default:
      return state;
  }
}

/* ─── Context ─────────────────────────────────────── */

interface TutorialContextValue {
  state: TutorialState;
  /** Steps filtered for the active route (or all if global) */
  steps: TourStep[];
  /** The step currently highlighted */
  currentStep: TourStep | null;
  /** Total steps in the active sequence */
  totalSteps: number;

  startTour: (route?: string | null) => void;
  startPageTour: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  resetTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextValue | undefined>(undefined);

/* ─── Provider ────────────────────────────────────── */

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tutorialReducer, undefined, initState);
  const location = useLocation();

  // Persist on every state change
  useEffect(() => {
    persistState(state);
  }, [state]);

  // Auto-start on first visit
  useEffect(() => {
    if (!state.hasCompletedTour && !state.isActive) {
      // Small delay so the page can render and mount elements
      const timer = setTimeout(() => {
        dispatch({ type: 'START', route: null });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter steps based on active route
  const steps = state.activeRoute !== null
    ? TOUR_STEPS.filter((s) => s.route === state.activeRoute)
    : TOUR_STEPS.filter((s) => s.route === location.pathname);

  const totalSteps = steps.length;
  const currentStep = state.isActive && state.currentStepIndex < totalSteps
    ? steps[state.currentStepIndex]
    : null;

  const startTour = useCallback((route?: string | null) => {
    dispatch({ type: 'START', route: route ?? null });
  }, []);

  const startPageTour = useCallback(() => {
    dispatch({ type: 'START', route: location.pathname });
  }, [location.pathname]);

  const next = useCallback(() => {
    if (state.currentStepIndex + 1 >= totalSteps) {
      dispatch({ type: 'FINISH' });
    } else {
      dispatch({ type: 'NEXT' });
    }
  }, [state.currentStepIndex, totalSteps]);

  const prev = useCallback(() => {
    dispatch({ type: 'PREV' });
  }, []);

  const skip = useCallback(() => {
    dispatch({ type: 'SKIP' });
  }, []);

  const resetTutorial = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        state,
        steps,
        currentStep,
        totalSteps,
        startTour,
        startPageTour,
        next,
        prev,
        skip,
        resetTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

/* ─── Hook ────────────────────────────────────────── */

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider');
  return ctx;
}
