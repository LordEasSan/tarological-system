import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, BookOpen, ShieldCheck, RefreshCcw, Zap, Bot, Cpu, Brain, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SpreadVisualizer, TarotCardView } from '../components/cards';
import { LTLVerifier } from '../components/verify';
import { MeaningRadar, QualityRadar, IterationChart } from '../components/charts';
import { InfoTooltip } from '../components/tutorial';
import { DebugPanel } from '../components/debug/DebugPanel';
import { mockGenerate } from '../api';
import { computeQualityScore } from '../engine/scoring';
import { verifyReading } from '../engine/ltl';
import { generateNarrative } from '../engine/narrative';
import { IterationRunner } from '../engine/iteration';
import { generateLLMNarrative, isLLMAvailable } from '../api/llm';
import type { PlacedCard, LTLVerification } from '../types';
import type { QualityScore } from '../engine/scoring';
import type { IterationLog } from '../engine/iteration';

export function GeneratePage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [spread, setSpread] = useState<PlacedCard[] | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [verification, setVerification] = useState<LTLVerification | null>(null);
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [iterationLog, setIterationLog] = useState<IterationLog | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);
  const [narrativeSource, setNarrativeSource] = useState<'llm' | 'local' | null>(null);
  const [view, setView] = useState<'spread' | 'cards' | 'narrative' | 'quality'>('spread');

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setNarrative(null);
    setNarrativeSource(null);
    setVerification(null);

    // Use adaptive iteration engine with ΔQi<τ stopping
    setTimeout(() => {
      const runner = new IterationRunner({
        qTarget: 0.6,
        maxIterations: 8,
        minIterations: 2,
        deltaThreshold: 0.02,
        consecutiveStops: 2,
      });
      const generateFn = (p: typeof state.parameters) => mockGenerate(p).spread;
      const { bestSpread, log } = runner.run(generateFn, state.parameters);

      setSpread(bestSpread);
      setIterationLog(log);

      // Compute quality score for the best spread
      const score = computeQualityScore(bestSpread, state.parameters);
      setQualityScore(score);

      // Auto-run LTL verification
      const ltlResult = verifyReading(bestSpread, state.parameters);
      setVerification(ltlResult);

      setIsGenerating(false);
    }, 400);
  }, [state.parameters]);

  const handleRefine = useCallback(() => {
    if (!spread) return;
    setIsGenerating(true);

    setTimeout(() => {
      const runner = new IterationRunner({
        qTarget: Math.min(0.9, (qualityScore?.composite ?? 0.6) + 0.1),
        maxIterations: 5,
        minIterations: 1,
        deltaThreshold: 0.01,
        consecutiveStops: 2,
      });
      const generateFn = (p: typeof state.parameters) => mockGenerate(p).spread;
      const { bestSpread, log } = runner.run(generateFn, state.parameters);

      // Only accept if quality improved
      const newScore = computeQualityScore(bestSpread, state.parameters);
      if (newScore.composite > (qualityScore?.composite ?? 0)) {
        setSpread(bestSpread);
        setQualityScore(newScore);
        setIterationLog(log);
        const ltlResult = verifyReading(bestSpread, state.parameters);
        setVerification(ltlResult);
        setNarrative(null);
        setNarrativeSource(null);
      }

      setIsGenerating(false);
    }, 300);
  }, [spread, state.parameters, qualityScore]);

  const handleVerify = useCallback(() => {
    if (!spread) return;
    const result = verifyReading(spread, state.parameters);
    setVerification(result);
  }, [spread, state.parameters]);

  const handleNarrative = useCallback(async () => {
    if (!spread) return;
    setIsNarrativeLoading(true);
    setView('narrative');

    try {
      // Try LLM first, falls back to local engine internally
      const text = await generateLLMNarrative(spread, state.parameters);
      setNarrative(text);
      setNarrativeSource(isLLMAvailable() ? 'llm' : 'local');
    } catch {
      // Final fallback to local engine
      const result = generateNarrative(spread, {
        style: state.parameters.narrativeStyle,
        weights: state.parameters.meaningWeights,
        includePositionContext: true,
      });
      setNarrative(result.summary);
      setNarrativeSource('local');
    }

    setIsNarrativeLoading(false);
  }, [spread, state.parameters]);

  const handleLocalNarrative = useCallback(() => {
    if (!spread) return;
    const result = generateNarrative(spread, {
      style: state.parameters.narrativeStyle,
      weights: state.parameters.meaningWeights,
      includePositionContext: true,
    });
    setNarrative(result.summary);
    setNarrativeSource('local');
    setView('narrative');
  }, [spread, state.parameters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-display text-3xl font-bold gradient-text">Generate Reading</h1>
          <p className="text-sm dark:text-mtps-muted text-mtps-muted mt-1">
            D(θ) = ⟨ C, Σ, μ, ρ, A ⟩ — {state.parameters.archetypeFamily} · {state.parameters.spreadType} · {state.parameters.drawCount} cards
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/configure')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
              dark:bg-mtps-card dark:text-mtps-silver dark:hover:bg-mtps-purple/40
              bg-white text-mtps-muted hover:bg-gray-100
              border dark:border-mtps-border border-mtps-border-light transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reconfigure
          </button>
          <button
            onClick={() => navigate('/philosophical')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
              dark:bg-mtps-violet/20 dark:text-mtps-silver dark:hover:bg-mtps-violet/40
              bg-indigo-50 text-indigo-700 hover:bg-indigo-100
              border dark:border-mtps-violet/30 border-indigo-200 transition-all"
          >
            <Brain className="w-3.5 h-3.5" /> Philosophical
          </button>
          <button
            id="tour-gen-generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold
              bg-gradient-to-r from-mtps-accent to-mtps-accent-alt text-white
              hover:from-mtps-accent-alt hover:to-mtps-accent
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-md shadow-mtps-accent/10 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? 'Generating...' : spread ? 'Regenerate' : 'Generate'}
          </button>
        </div>
      </motion.div>

      {/* Loading */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-12 h-12 text-mtps-gold" />
          </motion.div>
          <p className="mt-4 text-sm dark:text-mtps-muted text-mtps-muted font-display">
            Consulting the archetypes...
          </p>
        </motion.div>
      )}

      {/* Results */}
      {spread && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* View Tabs */}
          <div id="tour-gen-view-tabs" className="flex gap-1 p-1 rounded-xl dark:bg-mtps-card bg-gray-100 w-fit overflow-x-auto max-w-full">
            {(['spread', 'cards', 'narrative', 'quality'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
                  ${view === v
                    ? 'dark:bg-mtps-violet/30 dark:text-mtps-gold bg-white text-mtps-purple shadow-sm'
                    : 'dark:text-mtps-muted text-mtps-muted hover:dark:text-mtps-silver'
                  }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Spread View */}
          {view === 'spread' && (
            <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
              border-mtps-border-light bg-white">
              <SpreadVisualizer spread={spread} />
            </div>
          )}

          {/* Cards Grid View */}
          {view === 'cards' && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {spread.map((placed) => (
                <motion.div
                  key={placed.card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <TarotCardView card={placed.card} size="md" showMeaning />
                  <span className="text-[10px] font-display dark:text-mtps-gold text-mtps-purple font-semibold">
                    {placed.position.label}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Narrative View */}
          {view === 'narrative' && (
            <div className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
              border-mtps-border-light bg-white">
              {isNarrativeLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Bot className="w-10 h-10 text-mtps-accent" />
                  </motion.div>
                  <p className="mt-3 text-sm dark:text-mtps-muted text-mtps-muted font-display">
                    {isLLMAvailable() ? 'Consulting GitHub LLM...' : 'Generating with local engine...'}
                  </p>
                </div>
              ) : narrative ? (
                <div>
                  {/* Source indicator */}
                  {narrativeSource && (
                    <div className="flex items-center gap-1.5 mb-4 text-[10px] font-mono uppercase tracking-wider">
                      {narrativeSource === 'llm' ? (
                        <><Bot className="w-3 h-3 text-mtps-accent" /><span className="text-mtps-accent">GitHub LLM</span></>
                      ) : (
                        <><Cpu className="w-3 h-3 text-mtps-violet" /><span className="dark:text-mtps-violet text-mtps-purple">Local Engine</span></>
                      )}
                    </div>
                  )}
                  <div className="prose prose-sm dark:prose-invert max-w-none
                    dark:text-mtps-text text-mtps-text-light">
                    {narrative.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) return <h2 key={i} className="font-display gradient-text">{line.slice(3)}</h2>;
                      if (line.startsWith('### ')) return <h3 key={i} className="font-display dark:text-mtps-gold text-mtps-purple">{line.slice(4)}</h3>;
                      if (line.startsWith('*—')) return <p key={i} className="italic dark:text-mtps-muted text-mtps-muted text-xs mt-6">{line}</p>;
                      if (line.startsWith('**')) return <p key={i} className="dark:text-mtps-text text-mtps-text-light text-sm leading-relaxed">{line}</p>;
                      if (line.trim() === '') return <br key={i} />;
                      return <p key={i} className="text-sm leading-relaxed">{line}</p>;
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <BookOpen className="w-10 h-10 dark:text-mtps-muted text-gray-300 mx-auto mb-3" />
                  <p className="text-sm dark:text-mtps-muted text-mtps-muted mb-4">
                    No narrative generated yet
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handleNarrative}
                      className="px-4 py-2 rounded-lg text-xs font-medium
                        bg-gradient-to-r from-mtps-accent to-mtps-accent-alt text-mtps-void
                        hover:from-mtps-accent-alt hover:to-mtps-accent transition-all"
                    >
                      <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> {isLLMAvailable() ? 'Generate with LLM' : 'Generate Narrative'}</span>
                    </button>
                    <button
                      onClick={handleLocalNarrative}
                      className="px-4 py-2 rounded-lg text-xs font-medium
                        dark:bg-mtps-card dark:text-mtps-silver dark:hover:bg-mtps-purple/40
                        bg-white text-mtps-muted hover:bg-gray-100
                        border dark:border-mtps-border border-mtps-border-light transition-all"
                    >
                      <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Local Engine</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quality View — D1-D6 Radar + Iteration Chart */}
          {view === 'quality' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* D1-D6 Radar */}
                {qualityScore && (
                  <div className="p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
                    border-mtps-border-light bg-white">
                    <h3 className="font-display text-sm font-bold dark:text-mtps-gold text-mtps-purple mb-3">
                      D1-D6 Quality Dimensions <InfoTooltip text="Sei dimensioni di qualità: D1 Arcana Uniqueness, D2 Positional Coherence, D3 Elemental Balance, D4 Symbolic Density, D5 Narrative Flow, D6 Spread Harmony." />
                    </h3>
                    <QualityRadar score={qualityScore} />
                    {/* Dimension details */}
                    <div className="mt-4 space-y-1.5">
                      {qualityScore.dimensions.map(d => (
                        <div key={d.id} className="flex items-center justify-between text-[11px]">
                          <span className="font-mono dark:text-mtps-muted text-mtps-muted">{d.id}: {d.name}</span>
                          <span className={`font-mono font-bold ${
                            d.score >= 0.7 ? 'text-mtps-accent' :
                            d.score >= 0.4 ? 'text-mtps-gold' : 'text-red-400'
                          }`}>{(d.score * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meaning Weights */}
                <div className="p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
                  border-mtps-border-light bg-white">
                  <h3 className="font-display text-sm font-bold dark:text-mtps-gold text-mtps-purple mb-3">
                    Meaning Weights μ(c, θ)
                  </h3>
                  <MeaningRadar weights={state.parameters.meaningWeights} />
                </div>
              </div>

              {/* Iteration Chart */}
              {iterationLog && (
                <div className="p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
                  border-mtps-border-light bg-white">
                  <h3 className="font-display text-sm font-bold dark:text-mtps-gold text-mtps-purple mb-3">
                    Iteration History — Adaptive Loop <InfoTooltip text="Grafico dell'evoluzione della qualità Q(i) e del delta ΔQ(i) ad ogni iterazione. L'engine si ferma quando ΔQi < τ per 2 iterazioni consecutive." />
                  </h3>
                  <IterationChart log={iterationLog} />
                </div>
              )}
            </div>
          )}

          {/* Actions & Sidebar */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Actions */}
            <div className="lg:col-span-2 space-y-4">
              <div id="tour-gen-actions" className="flex flex-wrap gap-2">
                <button
                  onClick={handleNarrative}
                  disabled={isNarrativeLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                    dark:bg-mtps-card dark:text-mtps-gold dark:hover:bg-mtps-purple/40
                    bg-white text-mtps-purple hover:bg-gray-50
                    border dark:border-mtps-border border-mtps-border-light transition-all
                    disabled:opacity-50"
                >
                  <BookOpen className="w-3.5 h-3.5" /> {isLLMAvailable() ? 'LLM Narrative' : 'Generate Narrative'}
                </button>
                <button
                  onClick={handleLocalNarrative}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                    dark:bg-mtps-card dark:text-mtps-silver dark:hover:bg-mtps-purple/40
                    bg-white text-mtps-muted hover:bg-gray-50
                    border dark:border-mtps-border border-mtps-border-light transition-all"
                >
                  <Cpu className="w-3.5 h-3.5" /> Local Narrative
                </button>
                <button
                  onClick={handleVerify}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                    dark:bg-mtps-card dark:text-mtps-teal dark:hover:bg-mtps-purple/40
                    bg-white text-emerald-600 hover:bg-gray-50
                    border dark:border-mtps-border border-mtps-border-light transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Run Verification
                </button>
                <button
                  onClick={handleRefine}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold
                    bg-gradient-to-r from-mtps-violet to-mtps-purple text-white
                    hover:from-mtps-purple hover:to-mtps-violet
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Zap className="w-3.5 h-3.5" /> Refine Reading
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                    dark:bg-mtps-card dark:text-mtps-muted dark:hover:bg-mtps-purple/40
                    bg-white text-mtps-muted hover:bg-gray-50
                    border dark:border-mtps-border border-mtps-border-light transition-all
                    disabled:opacity-50"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Regenerate
                </button>
              </div>

              {/* Verification Results */}
              {verification && <LTLVerifier verification={verification} />}

              {/* Quality Summary (inline) with animated D1-D6 bars */}
              {qualityScore && view !== 'quality' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl dark:bg-mtps-void/40 bg-gray-50
                    border dark:border-mtps-border border-mtps-border-light">
                    <span className={`font-mono text-sm font-bold ${
                      qualityScore.composite >= 0.7 ? 'text-mtps-accent' :
                      qualityScore.composite >= 0.4 ? 'text-mtps-gold' : 'text-red-400'
                    }`}>
                      Q = {(qualityScore.composite * 100).toFixed(1)}%
                    </span>
                    <div className="flex gap-1">
                      {qualityScore.dimensions.map(d => (
                        <div key={d.id} className="group relative">
                          <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: 24 }}
                            transition={{ duration: 0.4 }}
                            className={`block h-1.5 rounded-full ${
                              d.score >= 0.7 ? 'bg-mtps-accent' :
                              d.score >= 0.4 ? 'bg-mtps-gold' : 'bg-red-400'
                            }`}
                            style={{ opacity: 0.4 + d.score * 0.6 }}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1
                            rounded text-[9px] font-mono whitespace-nowrap
                            dark:bg-mtps-deep dark:text-mtps-text dark:border dark:border-mtps-border
                            bg-gray-800 text-white
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {d.id}: {d.name} — {(d.score * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                    {iterationLog && (
                      <span className="text-[10px] font-mono dark:text-mtps-muted text-mtps-muted">
                        {iterationLog.totalIterations}iter · {iterationLog.totalDurationMs}ms
                        {iterationLog.converged && ` · ${iterationLog.convergenceReason === 'delta_threshold' ? 'ΔQ<τ' : 'Q≥Q*'}`}
                      </span>
                    )}
                    {/* ΔQ from last iteration */}
                    {iterationLog && iterationLog.entries.length > 1 && (() => {
                      const last = iterationLog.entries[iterationLog.entries.length - 1];
                      const prev = iterationLog.entries[iterationLog.entries.length - 2];
                      const delta = last.quality.composite - prev.quality.composite;
                      return (
                        <span className={`text-[10px] font-mono font-bold ${
                          delta > 0 ? 'dark:text-emerald-400 text-emerald-600' :
                          delta < 0 ? 'dark:text-rose-400 text-rose-600' :
                          'dark:text-mtps-muted text-mtps-muted'
                        }`}>
                          ΔQ={delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
                        </span>
                      );
                    })()}
                    <button
                      onClick={() => setView('quality')}
                      className="ml-auto text-[10px] font-mono dark:text-mtps-accent text-mtps-purple hover:underline"
                    >
                      Details →
                    </button>
                  </div>

                  {/* Expandable D1-D6 quick bars */}
                  <QualityQuickBars score={qualityScore} />
                </div>
              )}
            </div>

            {/* Radar Chart */}
            <div className="p-4 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
              border-mtps-border-light bg-white">
              <h3 className="font-display text-sm font-bold dark:text-mtps-gold text-mtps-purple mb-3">
                Meaning Weights μ(c, θ)
              </h3>
              <MeaningRadar weights={state.parameters.meaningWeights} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!spread && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-24 h-24 rounded-2xl dark:bg-mtps-card bg-gray-100 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 dark:text-mtps-muted text-gray-300" />
          </div>
          <h2 className="font-display text-xl font-bold dark:text-mtps-text text-mtps-text-light mb-2">
            Ready to Generate
          </h2>
          <p className="text-sm dark:text-mtps-muted text-mtps-muted text-center max-w-md mb-6">
            Click the Generate button to create a new reading based on your current parameter configuration.
          </p>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
              bg-gradient-to-r from-mtps-accent to-mtps-accent-alt text-white
              hover:from-mtps-accent-alt hover:to-mtps-accent
              shadow-lg shadow-mtps-accent/15 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Generate Reading
          </button>
        </motion.div>
      )}

      {/* Debug Panel */}
      <DebugPanel
        params={state.parameters}
        spread={spread}
        qualityScore={qualityScore}
        iterationLog={iterationLog}
      />
    </div>
  );
}

/** Expandable D1-D6 animated bars with labels */
function QualityQuickBars({ score }: { score: QualityScore }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border dark:border-mtps-border/50 dark:bg-mtps-deep/20
      border-mtps-border-light/50 bg-gray-50/30 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-left
          dark:hover:bg-mtps-card/40 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider dark:text-mtps-muted text-mtps-muted">
          <BarChart3 className="w-3 h-3" />
          D1–D6 Details
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 dark:text-mtps-muted text-mtps-muted" />
          : <ChevronDown className="w-3.5 h-3.5 dark:text-mtps-muted text-mtps-muted" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5">
              {score.dimensions.map((d, i) => (
                <div key={d.id} className="flex items-center gap-2 text-[10px]">
                  <span className="w-6 font-mono font-bold dark:text-mtps-muted text-mtps-muted">{d.id}</span>
                  <span className="w-28 truncate dark:text-mtps-silver text-mtps-text-light text-[9px]">{d.name}</span>
                  <div className="flex-1 h-1.5 rounded-full dark:bg-mtps-deep bg-gray-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.score * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.06 }}
                      className={`h-full rounded-full ${
                        d.score >= 0.7 ? 'bg-emerald-500' :
                        d.score >= 0.4 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                  <span className={`w-8 text-right font-mono font-bold ${
                    d.score >= 0.7 ? 'dark:text-emerald-400 text-emerald-600' :
                    d.score >= 0.4 ? 'dark:text-amber-400 text-amber-600' :
                    'dark:text-rose-400 text-rose-600'
                  }`}>
                    {(d.score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
              <p className="text-[9px] dark:text-mtps-muted/50 text-mtps-muted/40 pt-1 italic">
                {score.dimensions.reduce((min, dim) => dim.score < min.score ? dim : min).details}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
