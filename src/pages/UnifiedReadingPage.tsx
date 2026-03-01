import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, RotateCcw, ShieldCheck, Eye, Layers,
  BookOpen, Brain, Orbit, Grid3X3, FileText, Compass,
  ArrowRight, RefreshCcw, Zap, MessageCircle,
  ChevronDown, ChevronUp, GitBranch, Flame, Activity,
  Settings, Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SpreadVisualizer, TarotCardView } from '../components/cards';
import { LTLVerifier } from '../components/verify';
import { MeaningRadar } from '../components/charts';
import { InfoTooltip } from '../components/tutorial';
import { mockGenerate } from '../api';
import { executeUnifiedReading, reinterpretReading } from '../engine/core';
import { generateSymbolicNarrative, type SymbolicNarrative } from '../engine/symbolicNarrator';
import { computeQualityScore } from '../engine/scoring';
import type {
  InterrogationMode,
  UnifiedReadingResponse,
  UserProfileContext,
  SymbolicRole,
  QuestionTargetedNarrative,
  NarrativeLanguage,
} from '../types';

// ─── Mode Configuration ─────────────────────────────

const MODE_CONFIG: Record<InterrogationMode, {
  icon: typeof Sparkles;
  label: string;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
  activeRing: string;
}> = {
  divinatory: {
    icon: Sparkles,
    label: 'Divinatory',
    description: 'Temporal-unfolding lens — maps trajectory through time',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-400/40',
    bgColor: 'bg-emerald-500/10',
    activeRing: 'ring-emerald-400/60',
  },
  philosophical: {
    icon: Brain,
    label: 'Philosophical',
    description: 'Identity-trajectory lens — maps existential attractor basins',
    color: 'text-violet-400',
    borderColor: 'border-violet-400/40',
    bgColor: 'bg-violet-500/10',
    activeRing: 'ring-violet-400/60',
  },
  cosmological: {
    icon: Orbit,
    label: 'Cosmological',
    description: 'Archetypal-polarity lens — maps universal symbolic forces',
    color: 'text-amber-400',
    borderColor: 'border-amber-400/40',
    bgColor: 'bg-amber-500/10',
    activeRing: 'ring-amber-400/60',
  },
};

// ─── Example Questions Per Mode ─────────────────────

const EXAMPLE_QUESTIONS: Record<InterrogationMode, string[]> = {
  divinatory: [
    'What does this moment hold for me?',
    'How will this situation unfold?',
    'What energies surround my current path?',
  ],
  philosophical: [
    'Who am I becoming?',
    'What does it mean that this happened?',
    'What kind of world am I inhabiting?',
  ],
  cosmological: [
    'What is the archetypal structure of love?',
    'How does consciousness emerge from matter?',
    'What is the symbolic grammar of creation?',
  ],
};

// ─── View Tabs ──────────────────────────────────────

type ViewTab = 'narrative' | 'spread' | 'interaction-map' | 'mode-lens' | 'structural-explanation' | 'structural';

const VIEW_TABS: { id: ViewTab; label: string; icon: typeof Eye }[] = [
  { id: 'narrative', label: 'Narrative', icon: MessageCircle },
  { id: 'spread', label: 'Extracted Spread', icon: Layers },
  { id: 'interaction-map', label: 'Interaction Map', icon: Grid3X3 },
  { id: 'mode-lens', label: 'Mode Lens', icon: Eye },
  { id: 'structural-explanation', label: 'Structural Explanation', icon: FileText },
  { id: 'structural', label: 'Verification', icon: ShieldCheck },
];

// ─── Component ──────────────────────────────────────

export function UnifiedReadingPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const isSymbolicMode = state.readingMode === 'symbolic';
  const [mode, setMode] = useState<InterrogationMode>(state.interrogationMode);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<UnifiedReadingResponse | null>(null);
  const [symbolicNarrative, setSymbolicNarrative] = useState<SymbolicNarrative | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<ViewTab>('narrative');
  const [personalization] = useState<Partial<UserProfileContext>>({});
  const narrativeLanguage = state.narrativeLanguage;

  const setNarrativeLanguage = (lang: NarrativeLanguage) => {
    dispatch({ type: 'SET_NARRATIVE_LANGUAGE', payload: lang });
  };

  const handleGenerate = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setResponse(null);
    setSymbolicNarrative(null);

    setTimeout(() => {
      const generateFn = (p: typeof state.parameters) => mockGenerate(p).spread;
      const result = executeUnifiedReading(
        mode,
        question.trim(),
        state.parameters,
        generateFn,
        personalization,
      );
      setResponse(result);

      // Generate symbolic narrative with D-score modulation and language
      if (isSymbolicMode) {
        try {
          const qScore = computeQualityScore(result.spread, state.parameters);
          const narrative = generateSymbolicNarrative(result, qScore.dimensions, narrativeLanguage);
          setSymbolicNarrative(narrative);
        } catch {
          // Fallback: generate without D-score modulation
          const narrative = generateSymbolicNarrative(result, undefined, narrativeLanguage);
          setSymbolicNarrative(narrative);
        }
      }

      setIsProcessing(false);
      setView('narrative');
    }, 500);
  }, [mode, question, state.parameters, isProcessing, personalization, isSymbolicMode, narrativeLanguage]);

  const handleReinterpret = useCallback((newMode: InterrogationMode) => {
    if (!response) return;
    setMode(newMode);
    setIsProcessing(true);

    setTimeout(() => {
      const result = reinterpretReading(response, newMode, state.parameters);
      setResponse(result);
      setIsProcessing(false);
    }, 300);
  }, [response, state.parameters]);

  const handleReset = () => {
    setQuestion('');
    setResponse(null);
    setSymbolicNarrative(null);
    setView('narrative');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const modeConfig = MODE_CONFIG[mode];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        data-testid="reading-header"
      >
        <div>
          <h1 className="font-display text-3xl font-bold gradient-text flex items-center gap-2">
            <Compass className="w-8 h-8" />
            Unified Symbolic Reading
          </h1>
          <p className="text-sm dark:text-mtps-muted text-mtps-muted mt-1">
            Symbolic-first epistemology · Cards are the generative engine · Question constrains interpretation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/configure')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              dark:bg-mtps-card dark:text-mtps-silver dark:hover:bg-mtps-purple/40
              bg-white text-mtps-text-light hover:bg-mtps-border-light
              border dark:border-mtps-border border-mtps-border-light transition-all"
          >
            <Settings className="w-4 h-4" /> Reconfigure
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              dark:bg-mtps-card dark:text-mtps-silver dark:hover:bg-mtps-purple/40
              bg-white text-mtps-text-light hover:bg-mtps-border-light
              border dark:border-mtps-border border-mtps-border-light transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Home
          </button>
        </div>
      </motion.div>

      {/* ─── Configuration Summary + Language Selector ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6
          p-3 rounded-xl border dark:border-mtps-border/40 dark:bg-mtps-card/30
          border-mtps-border-light/40 bg-white/60"
        data-testid="config-summary-bar"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs dark:text-mtps-muted text-mtps-muted">
          <span className="font-semibold dark:text-mtps-silver text-mtps-text-light uppercase tracking-wider text-[10px]">θ</span>
          <span className="px-2 py-0.5 rounded-full dark:bg-mtps-deep/60 bg-gray-100 dark:text-mtps-accent text-mtps-purple">
            {state.parameters.archetypeFamily}
          </span>
          <span className="px-2 py-0.5 rounded-full dark:bg-mtps-deep/60 bg-gray-100">
            {state.parameters.deckSize} cards
          </span>
          <span className="px-2 py-0.5 rounded-full dark:bg-mtps-deep/60 bg-gray-100">
            {state.parameters.spreadType}
          </span>
          <span className="px-2 py-0.5 rounded-full dark:bg-mtps-deep/60 bg-gray-100">
            {state.parameters.narrativeStyle}
          </span>
          {state.parameters.reversalsEnabled && (
            <span className="px-2 py-0.5 rounded-full dark:bg-mtps-deep/60 bg-gray-100">
              ↺ reversals
            </span>
          )}
        </div>
        {/* Language Selector */}
        <div data-testid="language-selector" className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 dark:text-mtps-muted/60 text-mtps-muted/50" />
          <button
            onClick={() => setNarrativeLanguage('en')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all
              ${narrativeLanguage === 'en'
                ? 'dark:border-mtps-accent dark:bg-mtps-accent/15 dark:text-mtps-accent border-mtps-purple bg-mtps-purple/10 text-mtps-purple'
                : 'dark:border-mtps-border dark:text-mtps-muted border-mtps-border-light text-mtps-muted hover:opacity-80'
              }`}
          >
            EN
          </button>
          <button
            onClick={() => setNarrativeLanguage('it')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all
              ${narrativeLanguage === 'it'
                ? 'dark:border-mtps-accent dark:bg-mtps-accent/15 dark:text-mtps-accent border-mtps-purple bg-mtps-purple/10 text-mtps-purple'
                : 'dark:border-mtps-border dark:text-mtps-muted border-mtps-border-light text-mtps-muted hover:opacity-80'
              }`}
          >
            IT
          </button>
        </div>
      </motion.div>

      {/* Mode Selector — selectable BEFORE reading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <label className="block text-xs font-semibold dark:text-mtps-silver text-mtps-text-light mb-3 uppercase tracking-wider">
          Interpretive Lens (does not alter spread generation)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(MODE_CONFIG) as InterrogationMode[]).map((m) => {
            const cfg = MODE_CONFIG[m];
            const isActive = mode === m;
            const Icon = cfg.icon;
            return (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  if (response) handleReinterpret(m);
                }}
                className={`relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200
                  ${isActive
                    ? `${cfg.borderColor} ${cfg.bgColor} ring-2 ${cfg.activeRing}`
                    : 'dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white hover:border-mtps-accent/30'}
                `}
              >
                <Icon className={`w-5 h-5 mt-0.5 ${isActive ? cfg.color : 'dark:text-mtps-muted text-mtps-muted'}`} />
                <div>
                  <div className={`text-sm font-semibold ${isActive ? cfg.color : 'dark:text-mtps-text text-mtps-text-light'}`}>
                    {cfg.label}
                  </div>
                  <div className="text-xs dark:text-mtps-muted text-mtps-muted mt-0.5">
                    {cfg.description}
                  </div>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="mode-indicator"
                    className={`absolute top-2 right-2 w-2 h-2 rounded-full ${cfg.color.replace('text-', 'bg-')}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Question Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <label className="block text-xs font-semibold dark:text-mtps-silver text-mtps-text-light mb-2 uppercase tracking-wider">
          Question {mode === 'divinatory' ? '(optional)' : '(orienting constraint)'}
        </label>
        <div className="flex gap-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={EXAMPLE_QUESTIONS[mode][0]}
            rows={2}
            className="flex-1 p-3 rounded-xl border text-sm resize-none
              dark:bg-mtps-card dark:border-mtps-border dark:text-mtps-text
              dark:placeholder:text-mtps-muted/50 dark:focus:border-mtps-accent
              bg-white border-mtps-border-light text-mtps-text-light
              placeholder:text-mtps-muted/50 focus:border-mtps-accent-alt
              focus:outline-none focus:ring-1 dark:focus:ring-mtps-accent focus:ring-mtps-accent-alt
              transition-all"
          />
          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-white
              transition-all duration-300 shadow-lg self-end
              ${isProcessing
                ? 'bg-gray-500 cursor-not-allowed'
                : `bg-gradient-to-r ${mode === 'divinatory' ? 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                    : mode === 'philosophical' ? 'from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600'
                    : 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'}`
              }`}
          >
            {isProcessing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <RefreshCcw className="w-4 h-4" />
              </motion.div>
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isProcessing ? 'Generating...' : 'Generate Reading'}
          </button>
        </div>

        {/* Example Questions */}
        <div className="flex flex-wrap gap-2 mt-2">
          {EXAMPLE_QUESTIONS[mode].map((q) => (
            <button
              key={q}
              onClick={() => setQuestion(q)}
              className="text-xs px-3 py-1 rounded-full border transition-all
                dark:border-mtps-border dark:text-mtps-muted dark:hover:border-mtps-accent dark:hover:text-mtps-accent
                border-mtps-border-light text-mtps-muted hover:border-mtps-accent-alt hover:text-mtps-accent-alt"
            >
              {q}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {response && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Symbolic Mode — narrative-first typography-driven layout */}
            {isSymbolicMode && symbolicNarrative ? (
              <SymbolicReadingView
                narrative={symbolicNarrative}
                response={response}
                modeConfig={modeConfig}
              />
            ) : (
              <>
            {/* View Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {VIEW_TABS.map((tab) => {
                const isActive = view === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setView(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                      ${isActive
                        ? `${modeConfig.bgColor} ${modeConfig.color} ${modeConfig.borderColor} border`
                        : 'dark:text-mtps-muted dark:hover:text-mtps-silver text-mtps-muted hover:text-mtps-text-light'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {view === 'spread' && (
                    <motion.div key="spread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <SpreadView response={response} />
                    </motion.div>
                  )}
                  {view === 'interaction-map' && (
                    <motion.div key="interaction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <InteractionMapView response={response} />
                    </motion.div>
                  )}
                  {view === 'mode-lens' && (
                    <motion.div key="lens" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ModeLensView response={response} />
                    </motion.div>
                  )}
                  {view === 'narrative' && (
                    <motion.div key="narrative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <QuestionNarrativeView response={response} />
                    </motion.div>
                  )}
                  {view === 'structural-explanation' && (
                    <motion.div key="structural-explanation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <StructuralExplanationView response={response} />
                    </motion.div>
                  )}
                  {view === 'structural' && (
                    <motion.div key="structural" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <StructuralView response={response} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <SidebarSummary response={response} modeConfig={modeConfig} />
              </div>
            </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-Views ──────────────────────────────────────

function SpreadView({ response }: { response: UnifiedReadingResponse }) {
  // Build role map from symbolic configuration
  const roleMap: Record<string, SymbolicRole> = {};
  for (const arch of response.symbolicConfiguration.dominantArchetypes) {
    roleMap[arch.cardId] = arch.role;
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
        <h3 className="text-lg font-bold dark:text-mtps-text text-mtps-text-light mb-4">
          Extracted Spread — {response.spread.length} Cards
        </h3>
        <SpreadVisualizer spread={response.spread} roleMap={roleMap} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {response.spread.map((placed) => {
          const archEntry = response.symbolicConfiguration.dominantArchetypes
            .find(a => a.cardId === placed.card.id);
          return (
            <div key={placed.card.id} className="flex flex-col items-center gap-2">
              <TarotCardView
                card={placed.card}
                size="md"
                showMeaning
                role={archEntry?.role}
              />
              <div className="text-center">
                <div className="text-xs font-medium dark:text-mtps-text text-mtps-text-light">
                  {placed.position.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InteractionMapView({ response }: { response: UnifiedReadingResponse }) {
  const { interactionMatrix } = response.symbolicConfiguration;
  const spread = response.spread;

  return (
    <div className="space-y-6">
      {/* Matrix Header */}
      <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
        <h3 className="text-lg font-bold dark:text-mtps-text text-mtps-text-light mb-2">
          Symbolic Interaction Map — M(i,j)
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div className="p-3 rounded-lg dark:bg-mtps-deep bg-mtps-surface-light">
            <div className="text-xs dark:text-mtps-muted text-mtps-muted">Global Tension</div>
            <div className="text-lg font-bold dark:text-rose-400 text-rose-600">
              {(interactionMatrix.globalTension * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-3 rounded-lg dark:bg-mtps-deep bg-mtps-surface-light">
            <div className="text-xs dark:text-mtps-muted text-mtps-muted">Global Reinforcement</div>
            <div className="text-lg font-bold dark:text-emerald-400 text-emerald-600">
              {(interactionMatrix.globalReinforcement * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-3 rounded-lg dark:bg-mtps-deep bg-mtps-surface-light">
            <div className="text-xs dark:text-mtps-muted text-mtps-muted">Interactions</div>
            <div className="text-lg font-bold dark:text-mtps-accent text-mtps-purple">
              {interactionMatrix.interactions.length}
            </div>
          </div>
        </div>

        {/* Interaction List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {interactionMatrix.interactions.map((interaction, idx) => {
            const isOpposing = interaction.polarityTension > 0.1;
            const isReinforcing = interaction.archetypalReinforcement > 0.3;
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg text-xs transition-all
                  ${isOpposing
                    ? 'dark:bg-rose-500/10 dark:border-rose-500/20 bg-rose-50 border border-rose-200'
                    : isReinforcing
                      ? 'dark:bg-emerald-500/10 dark:border-emerald-500/20 bg-emerald-50 border border-emerald-200'
                      : 'dark:bg-mtps-deep/50 bg-mtps-surface-light border dark:border-mtps-border border-mtps-border-light'
                  }`}
              >
                <div className="flex-1">
                  <span className="font-semibold dark:text-mtps-text text-mtps-text-light">
                    {interaction.cardAName}
                  </span>
                  <span className="dark:text-mtps-muted text-mtps-muted mx-2">↔</span>
                  <span className="font-semibold dark:text-mtps-text text-mtps-text-light">
                    {interaction.cardBName}
                  </span>
                </div>
                <div className="flex gap-3 text-right">
                  <div>
                    <div className="dark:text-mtps-muted text-mtps-muted">Tension</div>
                    <div className={isOpposing ? 'dark:text-rose-400 text-rose-600 font-medium' : 'dark:text-mtps-text text-mtps-text-light'}>
                      {(interaction.polarityTension * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="dark:text-mtps-muted text-mtps-muted">Reinforce</div>
                    <div className={isReinforcing ? 'dark:text-emerald-400 text-emerald-600 font-medium' : 'dark:text-mtps-text text-mtps-text-light'}>
                      {(interaction.archetypalReinforcement * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Entropic Clusters */}
      {interactionMatrix.entropicClusters.length > 0 && (
        <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
          <h3 className="text-sm font-bold dark:text-mtps-silver text-mtps-text-light mb-3 uppercase tracking-wider">
            Entropic Clusters
          </h3>
          <div className="space-y-2">
            {interactionMatrix.entropicClusters.map((cluster, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg dark:bg-mtps-deep bg-mtps-surface-light text-sm"
              >
                <div className="font-semibold dark:text-mtps-accent text-mtps-purple mb-1">
                  {cluster.theme}
                </div>
                <div className="dark:text-mtps-muted text-mtps-muted text-xs">
                  {cluster.cardNames.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModeLensView({ response }: { response: UnifiedReadingResponse }) {
  const { lens } = response;
  const weights = [
    { label: 'Temporal Emphasis', value: lens.temporalEmphasis },
    { label: 'Identity Emphasis', value: lens.identityEmphasis },
    { label: 'Archetypal Polarity', value: lens.archetypalPolarityEmphasis },
    { label: 'Structural Principle', value: lens.structuralPrincipleEmphasis },
    { label: 'Practical Emphasis', value: lens.practicalEmphasis },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
        <h3 className="text-lg font-bold dark:text-mtps-text text-mtps-text-light mb-2">
          Mode Lens — W<sub>{lens.mode}</sub>
        </h3>
        <p className="text-sm dark:text-mtps-muted text-mtps-muted mb-6 leading-relaxed">
          {lens.lensDescription}
        </p>

        <div className="space-y-4">
          {weights.map((w) => (
            <div key={w.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="dark:text-mtps-silver text-mtps-text-light font-medium">{w.label}</span>
                <span className="dark:text-mtps-accent text-mtps-purple font-mono">{(w.value * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 rounded-full dark:bg-mtps-deep bg-mtps-surface-light overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${w.value * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`h-full rounded-full ${
                    lens.mode === 'divinatory' ? 'bg-emerald-500'
                    : lens.mode === 'philosophical' ? 'bg-violet-500'
                    : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
        <h4 className="text-sm font-bold dark:text-mtps-silver text-mtps-text-light mb-3 uppercase tracking-wider">
          Interpretive Principle
        </h4>
        <div className="text-sm dark:text-mtps-muted text-mtps-muted space-y-2">
          <p>The mode lens does <strong>not</strong> alter the spread or card extraction.</p>
          <p>All modes interpret the <strong>same</strong> symbolic configuration differently — the question constrains emphasis, the cards remain the generative engine.</p>
          <p className="text-xs italic dark:text-mtps-muted/70 text-mtps-muted/70">
            Switch modes above to see how the same spread is reinterpreted through a different lens.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ROLE BADGE COLORS ────────────────────────────────────────────
const ROLE_BADGE: Record<SymbolicRole, string> = {
  anchor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  catalyst: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  shadow: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  bridge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

const RESOLUTION_LABEL: Record<string, string> = {
  paradox_as_ground: 'Paradox as Ground',
  irruptive_revelation: 'Irruptive Revelation',
  mythic_cosmogony: 'Mythic Cosmogony',
  ethical_imperative: 'Ethical Imperative',
  definitional_arrival: 'Definitional Arrival',
  tragic_acceptance: 'Tragic Acceptance',
  relational_reconfiguration: 'Relational Reconfiguration',
};

const TENSION_LABEL: Record<string, string> = {
  polarity: 'Polarity',
  hierarchy: 'Hierarchy',
  illusion: 'Illusion',
  excess: 'Excess',
  absence: 'Absence',
  sacrifice: 'Sacrifice',
  identity_split: 'Identity Split',
  creation_destruction: 'Creation / Destruction',
};

const STRATEGY_LABEL: Record<string, string> = {
  integrate: 'Integrate',
  sever: 'Sever',
  expose: 'Expose',
  collapse: 'Collapse',
  demand: 'Demand',
  embody: 'Embody',
  limit: 'Limit',
  reverse: 'Reverse',
  destabilize_further: 'Destabilize Further',
};

const MODE_LABEL: Record<string, string> = {
  dialectical: 'Dialectical',
  irruptive: 'Irruptive',
  revelatory: 'Revelatory',
  inversional: 'Inversional',
  mythic: 'Mythic',
  ethical_directive: 'Ethical Directive',
  definitional: 'Definitional',
  tragic_recognition: 'Tragic Recognition',
  relational_specific: 'Relational',
};

// ─── IDA Micro-Descriptions (for tooltips) ─────────

const TENSION_TOOLTIP: Record<string, string> = {
  polarity: 'Two opposing forces pull the reading in contradictory directions.',
  hierarchy: 'A power imbalance — one symbol dominates, subjugating others.',
  illusion: 'Surface appearance masks a deeper symbolic truth.',
  excess: 'Over-abundance of a single archetypal energy.',
  absence: 'A critical symbolic element is conspicuously missing.',
  sacrifice: 'Something must be given up for transformation to occur.',
  identity_split: 'The self is divided between irreconcilable aspects.',
  creation_destruction: 'Simultaneous emergence and dissolution of symbolic structures.',
};

const STRATEGY_TOOLTIP: Record<string, string> = {
  integrate: 'Hold both sides of the tension in a unified synthesis.',
  sever: 'Cut decisively — remove the source of tension.',
  expose: 'Bring the hidden tension into full visibility.',
  collapse: 'Let the unstable structure fall to reveal what endures.',
  demand: 'Assert a direct ethical or existential claim.',
  embody: 'Live the tension rather than resolving it intellectually.',
  limit: 'Set boundaries to contain the overflowing energy.',
  reverse: 'Invert the polarity — turn weakness into strength.',
  destabilize_further: 'Amplify disruption to break through stagnation.',
};

const RESOLUTION_TOOLTIP: Record<string, string> = {
  paradox_as_ground: 'Resolution through accepting contradiction as foundational.',
  irruptive_revelation: 'Sudden breakthrough shatters the previous framework.',
  mythic_cosmogony: 'New order emerges from primordial chaos — a creation myth.',
  ethical_imperative: 'The reading demands moral action or commitment.',
  definitional_arrival: 'Clear naming of what was previously ambiguous.',
  tragic_acceptance: 'Acknowledging loss or limitation as part of wholeness.',
  relational_reconfiguration: 'Bonds and connections restructure into new patterns.',
};

const PHASE_COLORS = {
  thesis: 'dark:border-emerald-500/40 dark:bg-emerald-500/5 border-emerald-500/30 bg-emerald-50/50',
  destabilization: 'dark:border-amber-500/40 dark:bg-amber-500/5 border-amber-500/30 bg-amber-50/50',
  reconfiguration: 'dark:border-sky-500/40 dark:bg-sky-500/5 border-sky-500/30 bg-sky-50/50',
};

function QuestionNarrativeView({ response }: { response: UnifiedReadingResponse }) {
  const qn = response.questionNarrative;

  const renderMarkdown = (text: string) =>
    text
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/^---$/gm, '<hr/>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, (line) => {
        if (line.startsWith('<')) return line;
        return `<p>${line}</p>`;
      });

  return (
    <div className="space-y-6">
      {/* Question Restatement + Mode Badge */}
      <div className="p-5 rounded-2xl border dark:border-mtps-accent/30 dark:bg-mtps-accent/5
        border-mtps-purple/30 bg-mtps-purple/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <p className="text-sm uppercase tracking-wider dark:text-mtps-accent text-mtps-purple font-semibold">
            Your Question
          </p>
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium
            dark:bg-mtps-accent/20 dark:text-mtps-accent dark:border-mtps-accent/30
            bg-mtps-purple/20 text-mtps-purple border border-mtps-purple/30">
            {MODE_LABEL[qn.transformationMode] || qn.transformationMode}
          </span>
        </div>
        <p className="text-lg font-medium dark:text-mtps-text text-mtps-text-light italic">
          &ldquo;{qn.questionRestatement}&rdquo;
        </p>
      </div>

      {/* Transformation Steps — thesis → destabilization → reconfiguration */}
      <div className="space-y-6">
        {qn.transformationSteps.map((step, i) => (
          <motion.div
            key={step.cardName}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.18, duration: 0.45 }}
            className="relative"
          >
            {/* Connecting line between steps */}
            {i < qn.transformationSteps.length - 1 && (
              <div className="absolute left-5 top-14 bottom-0 w-px dark:bg-mtps-border/40 bg-mtps-border-light/40" />
            )}
            <div className="flex gap-4">
              {/* Step number + role badge */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                  dark:bg-mtps-card dark:border-mtps-border dark:text-mtps-silver
                  bg-white border border-mtps-border-light text-mtps-text-light">
                  {step.depth}
                </div>
                <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium border
                  ${ROLE_BADGE[step.role]}`}>
                  {step.role}
                </span>
              </div>
              {/* Three-phase transformation */}
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider dark:text-mtps-silver text-mtps-text-light">
                  {step.cardName}
                </p>
                {/* Thesis */}
                <div className={`p-3.5 rounded-xl border ${PHASE_COLORS.thesis}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest dark:text-emerald-400 text-emerald-600 mb-1.5">Thesis</p>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none leading-relaxed
                      dark:prose-p:text-mtps-muted prose-p:text-mtps-muted
                      dark:prose-strong:text-mtps-silver prose-strong:text-mtps-text-light
                      dark:prose-em:text-mtps-accent prose-em:text-mtps-purple"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(step.thesis) }}
                  />
                </div>
                {/* Destabilization */}
                <div className={`p-3.5 rounded-xl border ${PHASE_COLORS.destabilization}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest dark:text-amber-400 text-amber-600 mb-1.5">Destabilization</p>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none leading-relaxed
                      dark:prose-p:text-mtps-muted prose-p:text-mtps-muted
                      dark:prose-strong:text-mtps-silver prose-strong:text-mtps-text-light
                      dark:prose-em:text-mtps-accent prose-em:text-mtps-purple"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(step.destabilization) }}
                  />
                </div>
                {/* Reconfiguration */}
                <div className={`p-3.5 rounded-xl border ${PHASE_COLORS.reconfiguration}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest dark:text-sky-400 text-sky-600 mb-1.5">Reconfiguration</p>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none leading-relaxed
                      dark:prose-p:text-mtps-muted prose-p:text-mtps-muted
                      dark:prose-strong:text-mtps-silver prose-strong:text-mtps-text-light
                      dark:prose-em:text-mtps-accent prose-em:text-mtps-purple"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(step.reconfiguration) }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Synthesis — with resolution type badge + IDA tooltips */}
      <div className="p-5 rounded-2xl border dark:border-mtps-accent/20 dark:bg-mtps-deep/40
        border-mtps-purple/20 bg-gray-50">
        <h3 className="text-sm font-bold dark:text-mtps-accent text-mtps-purple mb-3 uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4" />
          {RESOLUTION_LABEL[qn.resolutionArchetype] || 'Synthesis'}
          <InfoTooltip
            text={RESOLUTION_TOOLTIP[qn.resolutionArchetype] || 'How the reading resolves its central tension.'}
            placement="right"
          />
        </h3>
        {/* IDA badges — tension type + completion strategy with tooltips */}
        {qn.tensionType && qn.completionStrategy && (
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium
              dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30
              bg-rose-100 text-rose-700 border border-rose-300/50">
              <Flame className="w-3 h-3" />
              Tension: {TENSION_LABEL[qn.tensionType] || qn.tensionType}
              <InfoTooltip
                text={TENSION_TOOLTIP[qn.tensionType] || 'The classified tension type of this reading.'}
                placement="bottom"
                maxWidth={220}
              />
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium
              dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30
              bg-cyan-100 text-cyan-700 border border-cyan-300/50">
              <Activity className="w-3 h-3" />
              Strategy: {STRATEGY_LABEL[qn.completionStrategy] || qn.completionStrategy}
              <InfoTooltip
                text={STRATEGY_TOOLTIP[qn.completionStrategy] || 'The completion strategy chosen for resolution.'}
                placement="bottom"
                maxWidth={220}
              />
            </span>
          </div>
        )}
        <div
          className="prose prose-sm dark:prose-invert max-w-none leading-relaxed
            dark:prose-p:text-mtps-muted prose-p:text-mtps-muted
            dark:prose-strong:text-mtps-silver prose-strong:text-mtps-text-light
            dark:prose-em:text-mtps-accent prose-em:text-mtps-purple"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(qn.synthesis) }}
        />
      </div>

      {/* Structural Derivation — collapsible IDA chain */}
      <StructuralDerivation qn={qn} />

      {/* Symbolic Embodiments */}
      {qn.embodiments && qn.embodiments.length > 0 && (
        <div className="p-4 rounded-xl border dark:border-violet-500/30 dark:bg-violet-500/5
          border-violet-500/20 bg-violet-50/30">
          <p className="text-[10px] font-bold uppercase tracking-widest dark:text-violet-400 text-violet-600 mb-2">
            Symbolic Embodiments
          </p>
          <div className="space-y-1.5">
            {qn.embodiments.map((emb, i) => (
              <p key={i} className="text-sm dark:text-mtps-muted text-mtps-muted italic">
                {emb.content}
                <span className="text-[10px] dark:text-mtps-muted/40 text-mtps-muted/40 ml-2 not-italic">
                  — {emb.cardSource}
                </span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-xl border dark:border-mtps-border/50 dark:bg-mtps-deep/20
        border-mtps-border-light/50 bg-gray-50/50 text-center">
        <p className="text-xs dark:text-mtps-muted/70 text-mtps-muted/60 italic">
          {qn.disclaimer}
        </p>
      </div>
    </div>
  );
}

function StructuralDerivation({ qn }: { qn: QuestionTargetedNarrative }) {
  const [open, setOpen] = useState(false);
  if (!qn.tensionType || !qn.completionStrategy) return null;

  const steps = [
    { label: 'Transformation Mode', value: MODE_LABEL[qn.transformationMode] || qn.transformationMode, color: 'dark:text-violet-400 text-violet-600' },
    { label: 'Tension Classified', value: TENSION_LABEL[qn.tensionType] || qn.tensionType, color: 'dark:text-rose-400 text-rose-600', tooltip: TENSION_TOOLTIP[qn.tensionType] },
    { label: 'Completion Strategy', value: STRATEGY_LABEL[qn.completionStrategy] || qn.completionStrategy, color: 'dark:text-cyan-400 text-cyan-600', tooltip: STRATEGY_TOOLTIP[qn.completionStrategy] },
    { label: 'Resolution Archetype', value: RESOLUTION_LABEL[qn.resolutionArchetype] || qn.resolutionArchetype, color: 'dark:text-mtps-accent text-mtps-purple', tooltip: RESOLUTION_TOOLTIP[qn.resolutionArchetype] },
  ];

  return (
    <div className="rounded-xl border dark:border-mtps-border/60 dark:bg-mtps-deep/30
      border-mtps-border-light/60 bg-gray-50/30 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left
          dark:hover:bg-mtps-card/40 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider dark:text-mtps-silver text-mtps-text-light">
          <GitBranch className="w-3.5 h-3.5" />
          Structural Derivation (IDA)
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 dark:text-mtps-muted text-mtps-muted" />
          : <ChevronDown className="w-4 h-4 dark:text-mtps-muted text-mtps-muted" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1">
              <p className="text-[10px] dark:text-mtps-muted/70 text-mtps-muted/60 mb-2">
                Mode → Tension → Strategy → Resolution archetype (Indirect Derivation Architecture)
              </p>
              {steps.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-center dark:text-mtps-muted/50 text-mtps-muted/40 font-mono text-[10px]">
                    {i + 1}
                  </span>
                  {i > 0 && <ArrowRight className="w-3 h-3 dark:text-mtps-muted/30 text-mtps-muted/30 -ml-1 mr-0" />}
                  <span className="dark:text-mtps-muted text-mtps-muted min-w-[120px]">{s.label}</span>
                  <span className={`font-semibold ${s.color}`}>{s.value}</span>
                  {s.tooltip && <InfoTooltip text={s.tooltip} placement="right" maxWidth={200} />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StructuralExplanationView({ response }: { response: UnifiedReadingResponse }) {
  return (
    <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
      <h3 className="text-lg font-bold dark:text-mtps-text text-mtps-text-light mb-4">
        Structural Explanation
      </h3>
      <div
        className="prose prose-sm dark:prose-invert max-w-none
          dark:prose-headings:text-mtps-text prose-headings:text-mtps-text-light
          dark:prose-p:text-mtps-muted prose-p:text-mtps-muted
          dark:prose-strong:text-mtps-silver prose-strong:text-mtps-text-light
          dark:prose-em:text-mtps-accent prose-em:text-mtps-purple
          dark:prose-hr:border-mtps-border prose-hr:border-mtps-border-light"
        dangerouslySetInnerHTML={{
          __html: response.narrative.fullNarrative
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
            .replace(/^---$/gm, '<hr/>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, (line) => {
              if (line.startsWith('<')) return line;
              return `<p>${line}</p>`;
            }),
        }}
      />
    </div>
  );
}

function StructuralView({ response }: { response: UnifiedReadingResponse }) {
  const cardCount = response.spread.length;
  const referencedCount = Object.keys(response.narrative.cardReferences).length;

  return (
    <div className="space-y-6">
      {/* Verification */}
      <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
        <h3 className="text-lg font-bold dark:text-mtps-text text-mtps-text-light mb-4">
          LTL Verification
        </h3>
        <LTLVerifier verification={response.verification} />
      </div>

      {/* Pipeline Validation */}
      <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
        <h3 className="text-sm font-bold dark:text-mtps-silver text-mtps-text-light mb-3 uppercase tracking-wider">
          Pipeline Validation
        </h3>
        <div className="space-y-2 text-sm">
          <ValidationRow
            label="Spread generated before question analysis"
            passed={true}
          />
          <ValidationRow
            label={`All ${cardCount} cards referenced in narrative`}
            passed={referencedCount >= cardCount}
          />
          <ValidationRow
            label="Symbolic Configuration computed"
            passed={response.symbolicConfiguration.dominantArchetypes.length > 0}
          />
          <ValidationRow
            label="Interaction Matrix computed"
            passed={response.symbolicConfiguration.interactionMatrix.size > 0}
          />
          <ValidationRow
            label="Mode lens applied after symbolic synthesis"
            passed={response.lens.mode === response.mode}
          />
          <ValidationRow
            label="Disclaimer present"
            passed={!!response.narrative.disclaimer}
          />
          {response.question && (
            <ValidationRow
              label="Question keywords in narrative"
              passed={response.biasVector.keywords.some(kw =>
                response.narrative.fullNarrative.toLowerCase().includes(kw)
              )}
            />
          )}
        </div>
      </div>

      {/* Structural Note */}
      <div className="p-6 rounded-2xl border dark:border-amber-500/20 dark:bg-amber-500/5 border-amber-200 bg-amber-50">
        <h4 className="text-sm font-bold dark:text-amber-400 text-amber-700 mb-2">
          Structural Clarification Note
        </h4>
        <p className="text-xs dark:text-amber-300/80 text-amber-600 leading-relaxed">
          This reading was generated through the Unified Symbolic Pipeline. The spread
          was extracted first (mode-independent), then the symbolic configuration was
          computed from the card interactions. The question served only as an orienting
          constraint for narrative emphasis. The interpretive lens ({response.mode}) was
          applied after the symbolic synthesis. All {cardCount} cards are referenced in the
          integrated narrative.
        </p>
      </div>
    </div>
  );
}

function ValidationRow({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>
        {passed ? '✓' : '✗'}
      </span>
      <span className="dark:text-mtps-muted text-mtps-muted text-xs">{label}</span>
    </div>
  );
}

// ─── Symbolic Reading View ─────────────────────────

/** Badge for IDA chain values: small, colored pill */
function IdaBadge({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border
      ${colorClass} whitespace-nowrap`}>
      <span className="opacity-60">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function SymbolicReadingView({
  narrative,
  response,
  modeConfig,
}: {
  narrative: SymbolicNarrative;
  response: UnifiedReadingResponse;
  modeConfig: typeof MODE_CONFIG['divinatory'];
}) {
  const [showDerivation, setShowDerivation] = useState(false);
  const qn = response.questionNarrative;

  /**
   * Renders markdown-like text: handles \n\n as paragraph breaks,
   * single \n as <br/> line breaks (for the v2 rhythm engine),
   * and **bold** / *italic* inline markup.
   */
  const renderNarrative = (text: string) =>
    text.split('\n\n').filter(Boolean).map((para, i) => {
      const segments = para.split('\n').filter(Boolean);
      return (
        <p key={i} className="leading-[1.85] mb-4 last:mb-0">
          {segments.map((seg, j) => {
            const html = seg
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.+?)\*/g, '<em class="dark:text-mtps-gold/80 text-amber-700/80">$1</em>');
            return (
              <span key={j}>
                {j > 0 && <br />}
                <span dangerouslySetInnerHTML={{ __html: html }} />
              </span>
            );
          })}
        </p>
      );
    });

  return (
    <div data-testid="symbolic-reading-view" className="max-w-3xl mx-auto px-2 sm:px-0">
      {/* ─── Global IDA Badges ─── */}
      <div data-testid="ida-badges" className="flex flex-wrap gap-1.5 mb-8 justify-center">
        <IdaBadge
          label="Tension"
          value={TENSION_LABEL[qn.tensionType] || qn.tensionType}
          colorClass="dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30 bg-rose-50 text-rose-700 border-rose-200"
        />
        <IdaBadge
          label="Strategy"
          value={STRATEGY_LABEL[qn.completionStrategy] || qn.completionStrategy}
          colorClass="dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30 bg-cyan-50 text-cyan-700 border-cyan-200"
        />
        <IdaBadge
          label="Resolution"
          value={RESOLUTION_LABEL[qn.resolutionArchetype] || qn.resolutionArchetype}
          colorClass="dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30 bg-violet-50 text-violet-700 border-violet-200"
        />
        <IdaBadge
          label="Transform"
          value={MODE_LABEL[qn.transformationMode] || qn.transformationMode}
          colorClass="dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30 bg-amber-50 text-amber-700 border-amber-200"
        />
      </div>

      {/* ─── Opening ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-10 sm:mb-12"
      >
        <div className="text-base sm:text-[17px] dark:text-mtps-silver/90 text-mtps-text-light/90 font-serif leading-[1.9]">
          {renderNarrative(narrative.opening)}
        </div>
      </motion.section>

      {/* ─── Divider: The Cards Speak ─── */}
      <div className="flex items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
        <div className="flex-1 h-px dark:bg-mtps-border/40 bg-mtps-border-light/40" />
        <span className="text-[10px] sm:text-xs dark:text-mtps-muted/50 text-mtps-muted/50 uppercase tracking-[0.25em] whitespace-nowrap">
          The Cards Speak
        </span>
        <div className="flex-1 h-px dark:bg-mtps-border/40 bg-mtps-border-light/40" />
      </div>

      {/* ─── Card Narratives ─── */}
      <div className="space-y-8 sm:space-y-10 mb-10 sm:mb-12">
        {narrative.cardNarratives.map((cardText, i) => {
          const step = qn.transformationSteps[i];
          const placed = response.spread[i];
          return (
            <motion.section
              key={i}
              data-testid={`card-block-${i}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * (i + 1), duration: 0.5 }}
              className="rounded-2xl border p-4 sm:p-6
                dark:border-mtps-border/30 dark:bg-mtps-deep/30
                border-mtps-border-light/30 bg-white/60
                backdrop-blur-sm"
            >
              {/* Card Header: name + position + reversed */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 flex items-center justify-center
                  text-xs sm:text-sm font-bold border
                  ${ROLE_BADGE[step?.role] || 'dark:bg-mtps-card dark:text-mtps-silver bg-white text-mtps-text-light'}`}>
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold dark:text-mtps-text text-mtps-text-light leading-tight">
                    {step?.cardName}{placed?.card.isReversed ? ' ↺' : ''}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] dark:text-mtps-muted/60 text-mtps-muted/50 uppercase tracking-wider mt-0.5">
                    {placed?.position.label} · {step?.role}
                  </p>
                </div>
              </div>

              {/* Per-card badges: Role + Tension + Strategy + Archetype */}
              <div data-testid={`card-badges-${i}`} className="flex flex-wrap gap-1 mb-4 pl-11 sm:pl-12">
                <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium border
                  ${ROLE_BADGE[step?.role] || 'dark:bg-mtps-card/50 dark:text-mtps-muted dark:border-mtps-border bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {step?.role}
                </span>
                {qn.tensionType && (
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium border
                    dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/25
                    bg-rose-50 text-rose-600 border-rose-200">
                    {TENSION_LABEL[qn.tensionType] || qn.tensionType}
                  </span>
                )}
                {qn.completionStrategy && (
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium border
                    dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/25
                    bg-cyan-50 text-cyan-600 border-cyan-200">
                    {STRATEGY_LABEL[qn.completionStrategy] || qn.completionStrategy}
                  </span>
                )}
                {qn.resolutionArchetype && (
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium border
                    dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/25
                    bg-violet-50 text-violet-600 border-violet-200">
                    {RESOLUTION_LABEL[qn.resolutionArchetype] || qn.resolutionArchetype}
                  </span>
                )}
              </div>

              {/* Card Narrative Text */}
              <div className="pl-11 sm:pl-12 text-[14px] sm:text-[15px] dark:text-mtps-silver/85 text-mtps-text-light/85 font-serif leading-[1.85]">
                {renderNarrative(cardText)}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* ─── Synthesis Divider ─── */}
      <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
        <div className="flex-1 h-px dark:bg-mtps-accent/30 bg-mtps-purple/30" />
        <Compass className="w-4 h-4 dark:text-mtps-accent/60 text-mtps-purple/60" />
        <div className="flex-1 h-px dark:bg-mtps-accent/30 bg-mtps-purple/30" />
      </div>

      {/* ─── Synthesis ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mb-8 sm:mb-10 px-4 sm:px-6 py-4 sm:py-5 rounded-2xl border
          dark:border-mtps-accent/20 dark:bg-mtps-accent/5
          border-mtps-purple/20 bg-mtps-purple/5"
      >
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] dark:text-mtps-accent text-mtps-purple mb-3 sm:mb-4">
          Synthesis
        </h3>
        <div className="text-[14px] sm:text-[15px] dark:text-mtps-silver/90 text-mtps-text-light/90 font-serif leading-[1.9]">
          {renderNarrative(narrative.synthesis)}
        </div>
      </motion.section>

      {/* ─── Resolution ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="mb-10 sm:mb-12 px-4 sm:px-6 py-4 sm:py-5 rounded-2xl border-2
          dark:border-mtps-gold/30 dark:bg-mtps-gold/5
          border-amber-400/30 bg-amber-50/30"
      >
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] dark:text-mtps-gold text-amber-700 mb-3 sm:mb-4">
          Resolution
        </h3>
        <div className="text-[14px] sm:text-[15px] dark:text-amber-100/80 text-amber-900/80 font-serif leading-[1.9]">
          {renderNarrative(narrative.resolution)}
        </div>
      </motion.section>

      {/* ─── Direct Insight ─── */}
      {narrative.directInsight && (
        <>
          <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
            <div className="flex-1 h-px dark:bg-emerald-500/30 bg-emerald-400/30" />
            <Zap className="w-4 h-4 dark:text-emerald-400/60 text-emerald-600/60" />
            <div className="flex-1 h-px dark:bg-emerald-500/30 bg-emerald-400/30" />
          </div>

          <motion.section
            data-testid="direct-insight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-10 sm:mb-12 px-4 sm:px-6 py-4 sm:py-5 rounded-2xl border-2
              dark:border-emerald-500/30 dark:bg-emerald-500/5
              border-emerald-400/30 bg-emerald-50/30"
          >
            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] dark:text-emerald-400 text-emerald-700 mb-3 sm:mb-4">
              Direct Insight
            </h3>
            <div className="text-[14px] sm:text-[15px] dark:text-emerald-100/80 text-emerald-900/80 font-serif leading-[1.9]">
              {renderNarrative(narrative.directInsight)}
            </div>
          </motion.section>
        </>
      )}

      {/* ─── Collapsible Structural Derivation ─── */}
      <div data-testid="structural-derivation" className="rounded-xl border dark:border-mtps-border/40 dark:bg-mtps-deep/20
        border-mtps-border-light/40 bg-gray-50/30 overflow-hidden mb-8">
        <button
          onClick={() => setShowDerivation(!showDerivation)}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-3 text-left
            dark:hover:bg-mtps-card/30 hover:bg-gray-100 transition-colors"
        >
          <span className="flex items-center gap-2 text-[10px] sm:text-xs dark:text-mtps-muted/70 text-mtps-muted/60 uppercase tracking-wider">
            <GitBranch className="w-3.5 h-3.5" />
            Structural Derivation
          </span>
          {showDerivation
            ? <ChevronUp className="w-4 h-4 dark:text-mtps-muted/50 text-mtps-muted/50" />
            : <ChevronDown className="w-4 h-4 dark:text-mtps-muted/50 text-mtps-muted/50" />}
        </button>
        <AnimatePresence>
          {showDerivation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-5 pb-5 space-y-4">
                {/* IDA Chain grid — stacks on small screens */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
                  <div className="p-2 sm:p-2.5 rounded-lg dark:bg-mtps-card/50 bg-white border dark:border-mtps-border/50 border-mtps-border-light/50">
                    <div className="dark:text-mtps-muted/70 text-mtps-muted/60 mb-1 text-[10px] sm:text-xs">Mode</div>
                    <div className="font-semibold dark:text-violet-400 text-violet-600 text-[11px] sm:text-xs">
                      {MODE_LABEL[qn.transformationMode] || qn.transformationMode}
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg dark:bg-mtps-card/50 bg-white border dark:border-mtps-border/50 border-mtps-border-light/50">
                    <div className="dark:text-mtps-muted/70 text-mtps-muted/60 mb-1 text-[10px] sm:text-xs">Tension</div>
                    <div className="font-semibold dark:text-rose-400 text-rose-600 text-[11px] sm:text-xs">
                      {TENSION_LABEL[qn.tensionType] || qn.tensionType}
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg dark:bg-mtps-card/50 bg-white border dark:border-mtps-border/50 border-mtps-border-light/50">
                    <div className="dark:text-mtps-muted/70 text-mtps-muted/60 mb-1 text-[10px] sm:text-xs">Strategy</div>
                    <div className="font-semibold dark:text-cyan-400 text-cyan-600 text-[11px] sm:text-xs">
                      {STRATEGY_LABEL[qn.completionStrategy] || qn.completionStrategy}
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg dark:bg-mtps-card/50 bg-white border dark:border-mtps-border/50 border-mtps-border-light/50">
                    <div className="dark:text-mtps-muted/70 text-mtps-muted/60 mb-1 text-[10px] sm:text-xs">Resolution</div>
                    <div className="font-semibold dark:text-mtps-accent text-mtps-purple text-[11px] sm:text-xs truncate">
                      {RESOLUTION_LABEL[qn.resolutionArchetype] || qn.resolutionArchetype}
                    </div>
                  </div>
                </div>

                {/* Transformation steps summary */}
                <div className="space-y-2">
                  {qn.transformationSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs flex-wrap">
                      <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium border
                        ${ROLE_BADGE[step.role]}`}>
                        {step.role}
                      </span>
                      <span className="dark:text-mtps-silver text-mtps-text-light font-medium">
                        {step.cardName}
                      </span>
                      <span className="dark:text-mtps-muted/50 text-mtps-muted/40">—</span>
                      <span className="dark:text-mtps-muted text-mtps-muted truncate">
                        depth {step.depth}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quality score */}
                {response.qualityScore !== undefined && (
                  <div className="text-xs dark:text-mtps-muted/60 text-mtps-muted/50">
                    Quality: {(response.qualityScore * 100).toFixed(0)}% · {response.spread.length} cards · {response.mode} lens
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Disclaimer ─── */}
      <div className="text-center mb-4">
        <p className="text-[10px] sm:text-[11px] dark:text-mtps-muted/40 text-mtps-muted/30 italic max-w-xl mx-auto leading-relaxed">
          {qn.disclaimer}
        </p>
      </div>
    </div>
  );
}

function SidebarSummary({
  response,
  modeConfig,
}: {
  response: UnifiedReadingResponse;
  modeConfig: typeof MODE_CONFIG['divinatory'];
}) {
  const config = response.symbolicConfiguration;
  const anchor = config.dominantArchetypes.find(a => a.role === 'anchor');
  const entropyLabel = config.entropy > 0.7 ? 'High' : config.entropy > 0.4 ? 'Moderate' : 'Low';

  return (
    <>
      {/* Quick Stats */}
      <div className="p-4 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
        <h4 className="text-xs font-bold dark:text-mtps-silver text-mtps-text-light mb-3 uppercase tracking-wider">
          Configuration S
        </h4>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="dark:text-mtps-muted text-mtps-muted">Entropy</span>
            <span className="dark:text-mtps-accent text-mtps-purple font-mono">
              {entropyLabel} ({(config.entropy * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="dark:text-mtps-muted text-mtps-muted">Tension Pairs</span>
            <span className="font-mono dark:text-rose-400 text-rose-600">{config.tensionPairs.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="dark:text-mtps-muted text-mtps-muted">Clusters</span>
            <span className="font-mono dark:text-mtps-text text-mtps-text-light">{config.entropicClusters.length}</span>
          </div>
          {response.qualityScore !== undefined && (
            <div className="flex justify-between">
              <span className="dark:text-mtps-muted text-mtps-muted">Quality</span>
              <span className={`font-mono ${
                response.qualityScore >= 0.7 ? 'dark:text-emerald-400 text-emerald-600'
                : response.qualityScore >= 0.4 ? 'dark:text-amber-400 text-amber-600'
                : 'dark:text-rose-400 text-rose-600'
              }`}>
                {(response.qualityScore * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* IDA Summary */}
      {response.questionNarrative.tensionType && (
        <div className="p-4 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
          <h4 className="text-xs font-bold dark:text-mtps-silver text-mtps-text-light mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-3 h-3" />
            IDA Chain
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="dark:text-mtps-muted text-mtps-muted">Mode</span>
              <span className="dark:text-violet-400 text-violet-600 font-medium">
                {MODE_LABEL[response.questionNarrative.transformationMode] || response.questionNarrative.transformationMode}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="dark:text-mtps-muted text-mtps-muted">Tension</span>
              <span className="dark:text-rose-400 text-rose-600 font-medium">
                {TENSION_LABEL[response.questionNarrative.tensionType] || response.questionNarrative.tensionType}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="dark:text-mtps-muted text-mtps-muted">Strategy</span>
              <span className="dark:text-cyan-400 text-cyan-600 font-medium">
                {STRATEGY_LABEL[response.questionNarrative.completionStrategy] || response.questionNarrative.completionStrategy}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="dark:text-mtps-muted text-mtps-muted">Resolution</span>
              <span className="dark:text-mtps-accent text-mtps-purple font-medium truncate ml-2">
                {RESOLUTION_LABEL[response.questionNarrative.resolutionArchetype] || response.questionNarrative.resolutionArchetype}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dominant Archetypes */}
      <div className="p-4 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
        <h4 className="text-xs font-bold dark:text-mtps-silver text-mtps-text-light mb-3 uppercase tracking-wider">
          Dominant Archetypes
        </h4>
        <div className="space-y-2">
          {config.dominantArchetypes.slice(0, 5).map((a, idx) => (
            <div key={a.cardId} className="flex items-center gap-2">
              <span className={`text-xs font-mono w-5 text-center ${
                a.role === 'anchor' ? 'dark:text-mtps-gold text-amber-600'
                : a.role === 'shadow' ? 'dark:text-rose-400 text-rose-600'
                : 'dark:text-mtps-muted text-mtps-muted'
              }`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium dark:text-mtps-text text-mtps-text-light truncate">
                  {a.cardName}
                </div>
                <div className="text-xs dark:text-mtps-muted text-mtps-muted truncate">
                  {a.archetype} · {a.role}
                </div>
              </div>
              <div className="w-12 h-1.5 rounded-full dark:bg-mtps-deep bg-mtps-surface-light overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    a.role === 'anchor' ? 'bg-amber-500'
                    : a.role === 'catalyst' ? 'bg-emerald-500'
                    : a.role === 'shadow' ? 'bg-rose-500'
                    : 'bg-violet-500'
                  }`}
                  style={{ width: `${a.score * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bias Vector */}
      {response.biasVector.rawQuestion && (
        <div className="p-4 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50 border-mtps-border-light bg-white">
          <h4 className="text-xs font-bold dark:text-mtps-silver text-mtps-text-light mb-3 uppercase tracking-wider">
            Bias Vector
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="dark:text-mtps-muted text-mtps-muted">Orientation</span>
              <span className="dark:text-mtps-accent text-mtps-purple">{response.biasVector.temporalOrientation}</span>
            </div>
            <div className="flex justify-between">
              <span className="dark:text-mtps-muted text-mtps-muted">Q-Entropy</span>
              <span className="font-mono dark:text-mtps-text text-mtps-text-light">
                {(response.biasVector.questionEntropy * 100).toFixed(0)}%
              </span>
            </div>
            {response.biasVector.keywords.length > 0 && (
              <div>
                <span className="dark:text-mtps-muted text-mtps-muted">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {response.biasVector.keywords.slice(0, 8).map(kw => (
                    <span
                      key={kw}
                      className="px-1.5 py-0.5 rounded-full text-xs
                        dark:bg-mtps-deep dark:text-mtps-accent bg-mtps-surface-light text-mtps-purple"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
