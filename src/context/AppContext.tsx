import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { TarotParameters, Reading, AppState, AppView, InterrogationMode, ReadingMode } from '../types';

const defaultParameters: TarotParameters = {
  archetypeFamily: 'Jungian',
  deckSize: 22,
  reversalsEnabled: true,
  spreadType: 'three-card',
  drawCount: 3,
  meaningWeights: {
    psychological: 0.8,
    spiritual: 0.6,
    practical: 0.5,
    creative: 0.4,
    relational: 0.3,
  },
  narrativeStyle: 'poetic',
};

const initialState: AppState = {
  theme: 'dark',
  currentView: 'welcome',
  interrogationMode: 'divinatory',
  readingMode: 'structural',
  parameters: defaultParameters,
  currentReading: null,
  isLoading: false,
  error: null,
};

type AppAction =
  | { type: 'SET_VIEW'; payload: AppView }
  | { type: 'SET_PARAMETERS'; payload: Partial<TarotParameters> }
  | { type: 'SET_READING'; payload: Reading }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INTERROGATION_MODE'; payload: InterrogationMode }
  | { type: 'SET_READING_MODE'; payload: ReadingMode }
  | { type: 'RESET' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_PARAMETERS':
      return { ...state, parameters: { ...state.parameters, ...action.payload } };
    case 'SET_READING':
      return { ...state, currentReading: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_INTERROGATION_MODE':
      return { ...state, interrogationMode: action.payload };
    case 'SET_READING_MODE':
      return { ...state, readingMode: action.payload };
    case 'RESET':
      return { ...initialState, theme: state.theme };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { defaultParameters };
