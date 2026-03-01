import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useApp, defaultParameters } from '../context/AppContext';
import { MeaningRadar } from '../components/charts';
import { InfoTooltip } from '../components/tutorial';
import type { TarotParameters, ArchetypeFamily, SpreadType, ReadingMode } from '../types';

const STEPS = ['Cultural Framework', 'Entropy & Randomness', 'Narrative Engine', 'Reading Mode', 'Review'];

export function ConfigurePage() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [params, setParams] = useState<TarotParameters>({ ...defaultParameters });
  const [readingMode, setReadingMode] = useState<ReadingMode>('structural');

  const updateParam = <K extends keyof TarotParameters>(key: K, value: TarotParameters[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const updateWeight = (key: string, value: number) => {
    setParams((prev) => ({
      ...prev,
      meaningWeights: { ...prev.meaningWeights, [key]: value },
    }));
  };

  const handleFinish = () => {
    dispatch({ type: 'SET_PARAMETERS', payload: params });
    dispatch({ type: 'SET_READING_MODE', payload: readingMode });
    // Navigate to unified reading page for symbolic mode, generate page for structural
    navigate(readingMode === 'symbolic' ? '/reading' : '/generate');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">
          Configuration Wizard
        </h1>
        <p className="text-sm dark:text-mtps-muted text-mtps-muted">
          Define your parameter space θ ∈ Θ
        </p>
      </motion.div>

      {/* Step Indicator */}
      <div id="tour-config-step-indicator" className="flex items-center justify-start sm:justify-center gap-2 mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className="flex items-center gap-1.5 group"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i === step
                ? 'bg-gradient-to-br from-mtps-accent to-mtps-accent-alt text-white scale-110'
                : i < step
                  ? 'dark:bg-mtps-teal/20 dark:text-mtps-teal bg-emerald-100 text-emerald-600'
                  : 'dark:bg-mtps-card dark:text-mtps-muted bg-gray-100 text-gray-400'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`hidden sm:inline text-xs transition-colors
              ${i === step
                ? 'dark:text-mtps-gold text-mtps-purple font-semibold'
                : 'dark:text-mtps-muted text-mtps-muted'
              }`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-1 ${i < step ? 'dark:bg-mtps-teal bg-emerald-300' : 'dark:bg-mtps-border bg-gray-200'}`} />
            )}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/50
        border-mtps-border-light bg-white min-h-[320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <Step1
                archetypeFamily={params.archetypeFamily}
                deckSize={params.deckSize}
                reversalsEnabled={params.reversalsEnabled}
                onArchetypeChange={(v) => updateParam('archetypeFamily', v)}
                onDeckSizeChange={(v) => updateParam('deckSize', v)}
                onReversalsChange={(v) => updateParam('reversalsEnabled', v)}
              />
            )}
            {step === 1 && (
              <Step2
                spreadType={params.spreadType}
                drawCount={params.drawCount}
                onSpreadChange={(v) => updateParam('spreadType', v)}
                onDrawCountChange={(v) => updateParam('drawCount', v)}
              />
            )}
            {step === 2 && (
              <Step3
                weights={params.meaningWeights}
                onWeightChange={updateWeight}
              />
            )}
            {step === 3 && (
              <StepReadingMode
                readingMode={readingMode}
                onReadingModeChange={setReadingMode}
              />
            )}
            {step === 4 && (
              <StepReview
                params={params}
                readingMode={readingMode}
                onNarrativeChange={(v) => updateParam('narrativeStyle', v)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
            dark:text-mtps-silver dark:hover:bg-mtps-purple/20
            text-mtps-muted hover:bg-gray-100
            disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            id="tour-config-next"
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
              bg-gradient-to-r from-mtps-accent to-mtps-accent-alt text-white
              hover:from-mtps-accent-alt hover:to-mtps-accent transition-all
              shadow-md shadow-mtps-accent/10"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-6 py-2 rounded-lg text-sm font-bold
              bg-gradient-to-r from-mtps-accent to-mtps-accent-alt text-mtps-void
              hover:from-mtps-accent-alt hover:to-mtps-accent transition-all
              shadow-md shadow-mtps-accent/10"
          >
            <Sparkles className="w-4 h-4" /> Generate Reading
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Step Components ─────────────────────────────── */

function Step1(props: {
  archetypeFamily: ArchetypeFamily;
  deckSize: 22 | 56 | 78;
  reversalsEnabled: boolean;
  onArchetypeChange: (v: ArchetypeFamily) => void;
  onDeckSizeChange: (v: 22 | 56 | 78) => void;
  onReversalsChange: (v: boolean) => void;
}) {
  const families: ArchetypeFamily[] = ['Jungian', 'Mythological', 'Alchemical', 'Qabalistic', 'Astrological', 'Custom'];
  const deckSizes: (22 | 56 | 78)[] = [22, 56, 78];
  const deckLabels: Record<number, string> = { 22: 'Major Arcana Only', 56: 'Minor Arcana Only', 78: 'Full Deck' };

  return (
    <div className="space-y-6">
      <div id="tour-config-archetype">
        <label className="block text-sm font-semibold dark:text-mtps-gold text-mtps-purple mb-3">
          Archetype Family <InfoTooltip text="Sistema simbolico di riferimento per l'interpretazione degli Arcani. Determina il mapping carta→archetipo nella struttura D(θ)." />
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {families.map((f) => (
            <button
              key={f}
              onClick={() => props.onArchetypeChange(f)}
              className={`p-3 rounded-xl text-xs font-medium border transition-all
                ${props.archetypeFamily === f
                  ? 'dark:border-mtps-gold dark:bg-mtps-gold/10 dark:text-mtps-gold border-mtps-violet bg-mtps-violet/10 text-mtps-violet'
                  : 'dark:border-mtps-border dark:text-mtps-silver dark:hover:border-mtps-violet/40 border-mtps-border-light text-mtps-muted hover:border-mtps-accent-alt/30'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold dark:text-mtps-gold text-mtps-purple mb-3">
          Deck Size
        </label>
        <div className="flex gap-2">
          {deckSizes.map((s) => (
            <button
              key={s}
              onClick={() => props.onDeckSizeChange(s)}
              className={`flex-1 p-3 rounded-xl text-center border transition-all
                ${props.deckSize === s
                  ? 'dark:border-mtps-gold dark:bg-mtps-gold/10 border-mtps-violet bg-mtps-violet/10'
                  : 'dark:border-mtps-border dark:hover:border-mtps-violet/40 border-mtps-border-light hover:border-mtps-accent-alt/30'
                }`}
            >
              <span className="block text-lg font-bold dark:text-mtps-text text-mtps-text-light">{s}</span>
              <span className="text-[10px] dark:text-mtps-muted text-mtps-muted">{deckLabels[s]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl border
        dark:border-mtps-border dark:bg-mtps-surface/50
        border-mtps-border-light bg-gray-50">
        <div>
          <span className="text-sm font-medium dark:text-mtps-text text-mtps-text-light">
            Enable Reversals
          </span>
          <p className="text-xs dark:text-mtps-muted text-mtps-muted">
            Cards can appear upside-down with alternate meanings
          </p>
        </div>
        <button
          onClick={() => props.onReversalsChange(!props.reversalsEnabled)}
          className={`relative w-12 h-6 rounded-full transition-colors
            ${props.reversalsEnabled
              ? 'bg-gradient-to-r from-mtps-accent to-mtps-accent-alt'
              : 'dark:bg-mtps-border bg-gray-300'
            }`}
        >
          <motion.div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
            animate={{ left: props.reversalsEnabled ? '26px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </div>
  );
}

function Step2(props: {
  spreadType: SpreadType;
  drawCount: number;
  onSpreadChange: (v: SpreadType) => void;
  onDrawCountChange: (v: number) => void;
}) {
  const spreads: { type: SpreadType; label: string; cards: number; desc: string }[] = [
    { type: 'three-card', label: 'Three Card', cards: 3, desc: 'Past, Present, Future' },
    { type: 'celtic-cross', label: 'Celtic Cross', cards: 10, desc: 'Classic 10-card spread' },
    { type: 'horseshoe', label: 'Horseshoe', cards: 7, desc: '7-card arc spread' },
    { type: 'star', label: 'Star', cards: 6, desc: '6-point star layout' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold dark:text-mtps-gold text-mtps-purple mb-3">
          Spread Layout <InfoTooltip text="Disposizione spaziale delle carte (ρ). Ogni layout definisce posizioni con coordinate e significati contestuali." />
        </label>
        <div className="grid grid-cols-2 gap-3">
          {spreads.map((s) => (
            <button
              key={s.type}
              onClick={() => {
                props.onSpreadChange(s.type);
                props.onDrawCountChange(s.cards);
              }}
              className={`p-4 rounded-xl text-left border transition-all
                ${props.spreadType === s.type
                  ? 'dark:border-mtps-gold dark:bg-mtps-gold/10 border-mtps-violet bg-mtps-violet/10'
                  : 'dark:border-mtps-border dark:hover:border-mtps-violet/40 border-mtps-border-light hover:border-mtps-accent-alt/30'
                }`}
            >
              <span className="block text-sm font-bold dark:text-mtps-text text-mtps-text-light">
                {s.label}
              </span>
              <span className="block text-xs dark:text-mtps-muted text-mtps-muted mt-0.5">
                {s.desc}
              </span>
              <span className="block text-xs dark:text-mtps-accent-alt text-mtps-violet mt-1">
                {s.cards} cards
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold dark:text-mtps-gold text-mtps-purple mb-2">
          Draw Count: <span className="font-display">{props.drawCount}</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={props.drawCount}
          onChange={(e) => props.onDrawCountChange(Number(e.target.value))}
          className="w-full accent-mtps-violet"
        />
        <div className="flex justify-between text-[10px] dark:text-mtps-muted text-mtps-muted">
          <span>1</span><span>10</span>
        </div>
      </div>
    </div>
  );
}

function Step3(props: {
  weights: TarotParameters['meaningWeights'];
  onWeightChange: (key: string, value: number) => void;
}) {
  const dimensions = Object.entries(props.weights) as [string, number][];

  return (
    <div className="space-y-6">
      <p className="text-sm dark:text-mtps-muted text-mtps-muted">
        Adjust the semantic weight for each dimension of the meaning function μ(c, θ). <InfoTooltip text="Pesi semantici che modulano il contributo di ciascuna dimensione nel calcolo del significato μ(c, θ). Valori più alti enfatizzano la dimensione corrispondente." />
      </p>

      <MeaningRadar weights={props.weights} />

      <div className="space-y-3">
        {dimensions.map(([key, val]) => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium dark:text-mtps-silver text-mtps-text-light capitalize">
                {key}
              </span>
              <span className="text-xs dark:text-mtps-gold text-mtps-violet font-mono">
                {val.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={val}
              onChange={(e) => props.onWeightChange(key, Number(e.target.value))}
              className="w-full accent-mtps-violet"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepReadingMode(props: {
  readingMode: ReadingMode;
  onReadingModeChange: (v: ReadingMode) => void;
}) {
  const modes: { value: ReadingMode; label: string; icon: string; desc: string }[] = [
    {
      value: 'structural',
      label: 'Structural Analysis',
      icon: '🔬',
      desc: 'Focus on formal structure, tensions and resolution logic. Shows D1–D6 dimensions, LTL verification, and iteration metrics.',
    },
    {
      value: 'symbolic',
      label: 'Symbolic Reading',
      icon: '🔮',
      desc: 'Narrativa simbolica completa, come farebbe un cartomante esperto. Full symbolic narrative derived from the IDA engine — dense, initiatic, structurally grounded.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold dark:text-mtps-gold text-mtps-purple mb-1">
          Reading Mode
        </label>
        <p className="text-xs dark:text-mtps-muted text-mtps-muted mb-4">
          Choose how the reading is presented. Structural mode exposes the engine internals; Symbolic mode delivers a unified narrative.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => props.onReadingModeChange(m.value)}
              className={`p-5 rounded-2xl text-left border transition-all duration-200
                ${props.readingMode === m.value
                  ? 'dark:border-mtps-gold dark:bg-mtps-gold/10 border-mtps-violet bg-mtps-violet/10 ring-2 dark:ring-mtps-gold/40 ring-mtps-violet/40'
                  : 'dark:border-mtps-border dark:hover:border-mtps-violet/40 border-mtps-border-light hover:border-mtps-accent-alt/30'
                }`}
            >
              <span className="text-2xl mb-2 block">{m.icon}</span>
              <span className="block text-sm font-bold dark:text-mtps-text text-mtps-text-light mb-1">
                {m.label}
              </span>
              <span className="block text-xs dark:text-mtps-muted text-mtps-muted leading-relaxed">
                {m.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepReview(props: {
  params: TarotParameters;
  readingMode: ReadingMode;
  onNarrativeChange: (v: TarotParameters['narrativeStyle']) => void;
}) {
  const styles: { value: TarotParameters['narrativeStyle']; label: string; desc: string }[] = [
    { value: 'formal', label: 'Formal', desc: 'Academic and structured' },
    { value: 'poetic', label: 'Poetic', desc: 'Lyrical and evocative' },
    { value: 'analytical', label: 'Analytical', desc: 'Data-driven and precise' },
    { value: 'mystical', label: 'Mystical', desc: 'Esoteric and symbolic' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold dark:text-mtps-gold text-mtps-purple mb-3">
          Narrative Style <InfoTooltip text="Tono del testo narrativo generato. Influenza lunghezza, figure retoriche e registro linguistico della sintesi finale." />
        </label>
        <div className="grid grid-cols-2 gap-2">
          {styles.map((s) => (
            <button
              key={s.value}
              onClick={() => props.onNarrativeChange(s.value)}
              className={`p-3 rounded-xl text-left border transition-all
                ${props.params.narrativeStyle === s.value
                  ? 'dark:border-mtps-gold dark:bg-mtps-gold/10 border-mtps-violet bg-mtps-violet/10'
                  : 'dark:border-mtps-border dark:hover:border-mtps-violet/40 border-mtps-border-light hover:border-mtps-accent-alt/30'
                }`}
            >
              <span className="text-sm font-bold dark:text-mtps-text text-mtps-text-light">{s.label}</span>
              <span className="block text-[10px] dark:text-mtps-muted text-mtps-muted mt-0.5">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl dark:bg-mtps-surface bg-gray-50 border dark:border-mtps-border border-mtps-border-light">
        <h4 className="text-xs font-display font-bold dark:text-mtps-gold text-mtps-purple mb-3">
          Configuration Summary — θ
        </h4>
        <dl className="grid grid-cols-2 gap-y-2 text-xs">
          <dt className="dark:text-mtps-muted text-mtps-muted">Archetype</dt>
          <dd className="dark:text-mtps-text text-mtps-text-light font-medium">{props.params.archetypeFamily}</dd>
          <dt className="dark:text-mtps-muted text-mtps-muted">Deck Size</dt>
          <dd className="dark:text-mtps-text text-mtps-text-light font-medium">{props.params.deckSize} cards</dd>
          <dt className="dark:text-mtps-muted text-mtps-muted">Spread</dt>
          <dd className="dark:text-mtps-text text-mtps-text-light font-medium">{props.params.spreadType}</dd>
          <dt className="dark:text-mtps-muted text-mtps-muted">Draw Count</dt>
          <dd className="dark:text-mtps-text text-mtps-text-light font-medium">{props.params.drawCount}</dd>
          <dt className="dark:text-mtps-muted text-mtps-muted">Reversals</dt>
          <dd className="dark:text-mtps-text text-mtps-text-light font-medium">{props.params.reversalsEnabled ? 'Yes' : 'No'}</dd>
          <dt className="dark:text-mtps-muted text-mtps-muted">Narrative</dt>
          <dd className="dark:text-mtps-text text-mtps-text-light font-medium">{props.params.narrativeStyle}</dd>
          <dt className="dark:text-mtps-muted text-mtps-muted">Reading Mode</dt>
          <dd className={`font-medium ${props.readingMode === 'symbolic' ? 'dark:text-mtps-gold text-mtps-violet' : 'dark:text-mtps-text text-mtps-text-light'}`}>
            {props.readingMode === 'symbolic' ? '🔮 Unified Symbolic' : '🔬 Structural'}
          </dd>
        </dl>
      </div>
    </div>
  );
}
