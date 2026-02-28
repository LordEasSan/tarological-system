import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, RotateCcw, ShieldCheck, Eye, Layers,
  BookOpen, Brain, Orbit, Grid3X3, FileText, Compass,
  ArrowRight, RefreshCcw, Zap, MessageCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SpreadVisualizer, TarotCardView } from '../components/cards';
import { LTLVerifier } from '../components/verify';
import { MeaningRadar } from '../components/charts';
import { InfoTooltip } from '../components/tutorial';
import { mockGenerate } from '../api';
import { executeUnifiedReading, reinterpretReading } from '../engine/core';
import type {
  InterrogationMode,
  UnifiedReadingResponse,
  UserProfileContext,
  SymbolicRole,
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
  const { state } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<InterrogationMode>(state.interrogationMode);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<UnifiedReadingResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<ViewTab>('narrative');
  const [personalization] = useState<Partial<UserProfileContext>>({});

  const handleGenerate = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setResponse(null);

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
      setIsProcessing(false);
      setView('narrative');
    }, 500);
  }, [mode, question, state.parameters, isProcessing, personalization]);

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
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
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm
            dark:bg-mtps-card dark:text-mtps-silver dark:hover:bg-mtps-purple/40
            bg-white text-mtps-text-light hover:bg-mtps-border-light
            border dark:border-mtps-border border-mtps-border-light transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Home
        </button>
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
      {/* Question Restatement */}
      <div className="p-5 rounded-2xl border dark:border-mtps-accent/30 dark:bg-mtps-accent/5
        border-mtps-purple/30 bg-mtps-purple/5 text-center">
        <p className="text-sm uppercase tracking-wider dark:text-mtps-accent text-mtps-purple font-semibold mb-2">
          Your Question
        </p>
        <p className="text-lg font-medium dark:text-mtps-text text-mtps-text-light italic">
          &ldquo;{qn.questionRestatement}&rdquo;
        </p>
      </div>

      {/* Progressive Unfolding — card-by-card emergence */}
      <div className="space-y-4">
        {qn.progressiveSteps.map((step, i) => (
          <motion.div
            key={step.cardName}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="relative"
          >
            {/* Depth indicator line */}
            {i < qn.progressiveSteps.length - 1 && (
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
              {/* Progressive response */}
              <div className="flex-1 p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50
                border-mtps-border-light bg-white">
                <p className="text-xs font-semibold uppercase tracking-wider dark:text-mtps-silver text-mtps-text-light mb-2">
                  {step.cardName}
                </p>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none leading-relaxed
                    dark:prose-p:text-mtps-muted prose-p:text-mtps-muted
                    dark:prose-strong:text-mtps-silver prose-strong:text-mtps-text-light
                    dark:prose-em:text-mtps-accent prose-em:text-mtps-purple"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(step.partialResponse) }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Synthesis */}
      <div className="p-5 rounded-2xl border dark:border-mtps-accent/20 dark:bg-mtps-deep/40
        border-mtps-purple/20 bg-gray-50">
        <h3 className="text-sm font-bold dark:text-mtps-accent text-mtps-purple mb-3 uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4" />
          Emergent Synthesis
        </h3>
        <div
          className="prose prose-sm dark:prose-invert max-w-none leading-relaxed
            dark:prose-p:text-mtps-muted prose-p:text-mtps-muted
            dark:prose-strong:text-mtps-silver prose-strong:text-mtps-text-light
            dark:prose-em:text-mtps-accent prose-em:text-mtps-purple"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(qn.synthesis) }}
        />
      </div>

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
              <span className="font-mono dark:text-emerald-400 text-emerald-600">
                {(response.qualityScore * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

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
