import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Orbit, Sparkles, Send, RotateCcw, ShieldCheck,
  BookOpen, Compass, Eye, Flame, Zap, CircleDot,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SpreadVisualizer, TarotCardView } from '../components/cards';
import { LTLVerifier } from '../components/verify';
import { MeaningRadar } from '../components/charts';
import { InfoTooltip } from '../components/tutorial';
import { mockGenerate } from '../api';
import { executeCosmologicalQuery } from '../engine/cosmological';
import type { CosmologicalResponse, CosmologicalQuestionType } from '../types';

// ─── Question Type Icons & Labels ───────────────────

const QUESTION_TYPE_META: Record<CosmologicalQuestionType, {
  icon: typeof Eye;
  label: string;
  color: string;
}> = {
  'cosmogonic': { icon: Flame, label: 'Cosmogonic', color: 'text-orange-400' },
  'structural-universal': { icon: CircleDot, label: 'Structural-Universal', color: 'text-blue-400' },
  'archetypal-essence': { icon: Eye, label: 'Archetypal Essence', color: 'text-purple-400' },
  'symbolic-logic': { icon: Compass, label: 'Symbolic Logic', color: 'text-emerald-400' },
  'consciousness': { icon: Zap, label: 'Consciousness', color: 'text-amber-400' },
};

// ─── Example Questions ──────────────────────────────

const EXAMPLE_QUESTIONS = [
  'How did the universe emerge?',
  'What is the archetypal structure of love?',
  'What is the symbolic logic of creation?',
  'What is the structure of consciousness?',
  'What holds reality together?',
  'What is the nature of time?',
];

export function CosmologicalPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<CosmologicalResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<'interpretation' | 'archetypal-map' | 'spread' | 'cards' | 'verification'>('interpretation');

  const handleSubmit = useCallback(() => {
    if (!question.trim() || isProcessing) return;
    setIsProcessing(true);
    setResponse(null);

    setTimeout(() => {
      const generateFn = (p: typeof state.parameters) => mockGenerate(p).spread;
      const result = executeCosmologicalQuery(
        question.trim(),
        state.parameters,
        generateFn,
      );
      setResponse(result);
      setIsProcessing(false);
    }, 500);
  }, [question, state.parameters, isProcessing]);

  const handleExampleClick = (q: string) => setQuestion(q);

  const handleReset = () => {
    setQuestion('');
    setResponse(null);
    setView('interpretation');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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
            <Orbit className="w-8 h-8" />
            Cosmological Mode
          </h1>
          <p className="text-sm dark:text-mtps-muted text-mtps-muted mt-1">
            Universal Archetypal Inquiry · Configuration Mapping ΨQᵤ · Symbolic-Archetypal Representation
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
            onClick={() => navigate('/generate')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
              dark:bg-mtps-card dark:text-mtps-silver dark:hover:bg-mtps-purple/40
              bg-white text-mtps-muted hover:bg-gray-100
              border dark:border-mtps-border border-mtps-border-light transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Divinatory Mode
          </button>
        </div>
      </motion.div>

      {/* Mode Explanation Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl mb-8 border
          dark:bg-orange-500/10 dark:border-orange-400/30
          bg-orange-50 border-orange-200"
      >
        <p className="text-xs dark:text-mtps-silver text-orange-700 leading-relaxed">
          <strong>Cosmological Mode</strong> treats your question as a <em>universal archetypal inquiry</em>,
          not a personal reading. It maps your query onto archetypal forces, identifies generative polarity
          sequences, and computes emergence order — producing a symbolic model, not a scientific explanation.{' '}
          <InfoTooltip text="La modalità cosmologica interpreta le carte come forze archetipali in un modello simbolico universale. Non fa affermazioni scientifiche, empiriche o predittive. Ogni output è una rappresentazione simbolico-archetipale." />
        </p>
      </motion.div>

      {/* Question Input */}
      <div className="mb-8">
        <div className="p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
          border-mtps-border-light bg-white">
          <label className="block text-sm font-semibold dark:text-mtps-gold text-mtps-purple mb-3">
            Your Universal / Metaphysical Question
          </label>
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any universal, metaphysical, or cosmological question..."
              rows={3}
              className="w-full p-4 pr-14 rounded-xl text-sm resize-none
                dark:bg-mtps-surface dark:text-mtps-text dark:placeholder-mtps-muted
                dark:border-mtps-border dark:focus:border-orange-400
                bg-gray-50 text-mtps-text-light placeholder-gray-400
                border border-mtps-border-light focus:border-orange-400
                focus:outline-none focus:ring-1 focus:ring-orange-400/30
                transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || isProcessing}
              className="absolute right-3 bottom-3 p-2.5 rounded-lg
                bg-gradient-to-r from-orange-500 to-amber-500 text-white
                hover:from-amber-500 hover:to-orange-500
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-md shadow-orange-500/10 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Example Questions */}
          {!response && (
            <div className="mt-4">
              <span className="text-[10px] uppercase tracking-wider dark:text-mtps-muted text-mtps-muted font-medium">
                Example Questions
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleExampleClick(q)}
                    className="px-3 py-1.5 rounded-lg text-[11px]
                      dark:bg-mtps-surface dark:text-mtps-silver dark:hover:bg-orange-500/20
                      bg-gray-100 text-mtps-muted hover:bg-gray-200
                      border dark:border-mtps-border border-transparent
                      transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Orbit className="w-12 h-12 text-orange-400" />
          </motion.div>
          <p className="mt-4 text-sm dark:text-mtps-muted text-mtps-muted font-display">
            Computing archetypal configuration...
          </p>
          <p className="mt-1 text-[10px] font-mono dark:text-mtps-muted/60 text-mtps-muted/60">
            Qᵤ = (Cᵤ, Φᵤ, Δᵤ) → ΨQᵤ
          </p>
        </motion.div>
      )}

      {/* Results */}
      {response && !isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Query Analysis Badge */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Question Type */}
            {(() => {
              const meta = QUESTION_TYPE_META[response.query.questionType];
              const Icon = meta.icon;
              return (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  dark:bg-mtps-card bg-gray-100 border dark:border-mtps-border border-mtps-border-light`}>
                  <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  <span className={meta.color}>{meta.label}</span>
                </div>
              );
            })()}

            {/* Temporal Logic */}
            <div className="px-3 py-1.5 rounded-lg text-[10px] font-mono
              dark:bg-mtps-card dark:text-orange-400 bg-gray-100 text-orange-600
              border dark:border-mtps-border border-mtps-border-light">
              {response.query.temporalLogic.formula}
            </div>

            {/* System Entropy */}
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium
              dark:bg-mtps-card bg-gray-100 border dark:border-mtps-border border-mtps-border-light
              ${response.configuration.systemEntropy > 0.7 ? 'dark:text-amber-400 text-amber-600' :
                response.configuration.systemEntropy > 0.4 ? 'dark:text-mtps-gold text-yellow-600' :
                'dark:text-mtps-accent text-emerald-600'}`}>
              System Entropy: {(response.configuration.systemEntropy * 100).toFixed(1)}%
            </div>

            {/* Domain Nouns */}
            {response.query.embedding.domainNouns.length > 0 && (
              <div className="px-3 py-1.5 rounded-lg text-xs font-medium
                dark:bg-mtps-card dark:text-mtps-silver bg-gray-100 text-mtps-muted
                border dark:border-mtps-border border-mtps-border-light">
                {response.query.embedding.domainNouns.slice(0, 3).join(', ')}
              </div>
            )}
          </div>

          {/* View Tabs */}
          <div className="flex gap-1 p-1 rounded-xl dark:bg-mtps-card bg-gray-100 w-fit overflow-x-auto max-w-full">
            {(['interpretation', 'archetypal-map', 'spread', 'cards', 'verification'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                  ${view === v
                    ? 'dark:bg-orange-500/30 dark:text-mtps-gold bg-white text-orange-600 shadow-sm'
                    : 'dark:text-mtps-muted text-mtps-muted hover:dark:text-mtps-silver'
                  }`}
              >
                {v === 'archetypal-map' ? 'Archetypal Map' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Interpretation View */}
            {view === 'interpretation' && (
              <motion.div
                key="interpretation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
                  border-mtps-border-light bg-white"
              >
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {response.interpretation.fullText.split('\n').map((line, i) => {
                    if (line.startsWith('## '))
                      return <h2 key={i} className="font-display gradient-text text-lg">{line.slice(3)}</h2>;
                    if (line.startsWith('### '))
                      return <h3 key={i} className="font-display dark:text-mtps-gold text-orange-600 text-base mt-6 mb-2">{line.slice(4)}</h3>;
                    if (line.startsWith('> '))
                      return (
                        <blockquote key={i} className="border-l-2 dark:border-orange-400 border-orange-300
                          pl-4 italic dark:text-mtps-silver text-mtps-text-light text-sm my-3">
                          {line.slice(2)}
                        </blockquote>
                      );
                    if (line.startsWith('- ⊕') || line.startsWith('- ▣') || line.startsWith('- ⊖') || line.startsWith('- ◎'))
                      return <p key={i} className="text-sm leading-relaxed ml-2 my-1 dark:text-mtps-text text-mtps-text-light">{line.slice(2)}</p>;
                    if (line.startsWith('- '))
                      return <p key={i} className="text-sm leading-relaxed ml-4 my-0.5 dark:text-mtps-silver text-mtps-muted">{line.slice(2)}</p>;
                    if (line.startsWith('**') && line.includes('**:'))
                      return <p key={i} className="text-sm leading-relaxed my-2 dark:text-mtps-text text-mtps-text-light"><strong>{line}</strong></p>;
                    if (line.startsWith('---'))
                      return <hr key={i} className="my-6 dark:border-mtps-border border-mtps-border-light" />;
                    if (line.startsWith('⚑'))
                      return <p key={i} className="text-xs leading-relaxed italic dark:text-mtps-muted text-mtps-muted mt-2">{line}</p>;
                    if (line.startsWith('*—'))
                      return <p key={i} className="text-[10px] italic dark:text-mtps-muted/60 text-mtps-muted/60 mt-4">{line}</p>;
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i} className="text-sm leading-relaxed dark:text-mtps-text text-mtps-text-light">{line}</p>;
                  })}
                </div>
              </motion.div>
            )}

            {/* Archetypal Map View */}
            {view === 'archetypal-map' && (
              <motion.div
                key="archetypal-map"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Emergence Order */}
                <div className="p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
                  border-mtps-border-light bg-white">
                  <h3 className="font-display text-sm font-bold dark:text-mtps-gold text-orange-600 mb-4">
                    Archetypal Emergence Order
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {response.configuration.emergenceOrder.map((archetype, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-medium
                          dark:bg-orange-500/15 dark:text-orange-300 bg-orange-50 text-orange-700
                          border dark:border-orange-400/20 border-orange-200">
                          {archetype}
                        </span>
                        {i < response.configuration.emergenceOrder.length - 1 && (
                          <span className="dark:text-mtps-muted text-mtps-muted text-xs">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Polarity Sequences */}
                <div className="p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
                  border-mtps-border-light bg-white">
                  <h3 className="font-display text-sm font-bold dark:text-mtps-gold text-orange-600 mb-4">
                    Polarity Sequences
                  </h3>
                  <div className="space-y-3">
                    {response.configuration.polaritySequences.map((seq, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg
                        dark:bg-mtps-surface/50 bg-gray-50">
                        <span className="px-2 py-1 rounded text-[11px] font-medium
                          dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-50 text-emerald-600">
                          {seq.positive}
                        </span>
                        <span className="dark:text-mtps-muted text-mtps-muted text-xs">↔</span>
                        <span className="px-2 py-1 rounded text-[11px] font-medium
                          dark:bg-red-400/20 dark:text-red-400 bg-red-50 text-red-500">
                          {seq.negative}
                        </span>
                        <span className="dark:text-mtps-muted text-mtps-muted text-xs">→</span>
                        <span className="px-2 py-1 rounded text-[11px] font-medium
                          dark:bg-amber-400/20 dark:text-amber-400 bg-amber-50 text-amber-600">
                          {seq.synthesis}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Forces by Role */}
                <div className="grid md:grid-cols-2 gap-4">
                  {(['generative', 'structuring', 'dissolving', 'synthesising'] as const).map((role) => {
                    const forces = response.configuration.forces.filter(f => f.role === role);
                    if (forces.length === 0) return null;
                    const roleColors = {
                      generative: 'dark:text-emerald-400 text-emerald-600',
                      structuring: 'dark:text-blue-400 text-blue-600',
                      dissolving: 'dark:text-red-400 text-red-500',
                      synthesising: 'dark:text-amber-400 text-amber-600',
                    };
                    return (
                      <div key={role} className="p-4 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
                        border-mtps-border-light bg-white">
                        <h4 className={`font-display text-xs font-bold mb-2 capitalize ${roleColors[role]}`}>
                          {role} Forces ({forces.length})
                        </h4>
                        <div className="space-y-1.5">
                          {forces.map((f, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px]">
                              <span className="dark:text-mtps-text text-mtps-text-light">
                                {f.archetype} ({f.cardName})
                              </span>
                              <span className="font-mono dark:text-mtps-muted text-mtps-muted">
                                {(f.weight * 100).toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Spread View */}
            {view === 'spread' && (
              <motion.div
                key="spread"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
                  border-mtps-border-light bg-white"
              >
                <SpreadVisualizer spread={response.spread} />
              </motion.div>
            )}

            {/* Cards Grid View */}
            {view === 'cards' && (
              <motion.div
                key="cards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
              >
                {response.spread.map((placed) => {
                  const force = response.configuration.forces.find(f => f.cardId === placed.card.id);
                  const roleColors = {
                    generative: 'dark:bg-emerald-500/10 dark:text-emerald-400 bg-emerald-50 text-emerald-600',
                    structuring: 'dark:bg-blue-400/10 dark:text-blue-400 bg-blue-50 text-blue-600',
                    dissolving: 'dark:bg-red-400/10 dark:text-red-400 bg-red-50 text-red-500',
                    synthesising: 'dark:bg-amber-400/10 dark:text-amber-400 bg-amber-50 text-amber-600',
                  };
                  return (
                    <motion.div
                      key={placed.card.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <TarotCardView card={placed.card} size="md" showMeaning />
                      <span className="text-[10px] font-display dark:text-mtps-gold text-orange-600 font-semibold">
                        {placed.position.label}
                      </span>
                      {force && (
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full
                          ${roleColors[force.role]}`}>
                          {force.role} · {(force.weight * 100).toFixed(0)}%
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Verification View */}
            {view === 'verification' && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LTLVerifier verification={response.verification} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar: Force Rankings + Embedding */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Force Rankings */}
            <div className="lg:col-span-2 p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
              border-mtps-border-light bg-white">
              <h3 className="font-display text-sm font-bold dark:text-mtps-gold text-orange-600 mb-3">
                Archetypal Forces — ΨQᵤ
              </h3>
              <div className="space-y-2">
                {response.configuration.forces.map((force, i) => {
                  const roleColors = {
                    generative: 'dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-100 text-emerald-600',
                    structuring: 'dark:bg-blue-400/20 dark:text-blue-400 bg-blue-100 text-blue-600',
                    dissolving: 'dark:bg-red-400/20 dark:text-red-400 bg-red-100 text-red-500',
                    synthesising: 'dark:bg-amber-400/20 dark:text-amber-400 bg-amber-100 text-amber-600',
                  };
                  const barColors = {
                    generative: 'bg-emerald-400',
                    structuring: 'bg-blue-400',
                    dissolving: 'bg-red-400',
                    synthesising: 'bg-amber-400',
                  };
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg
                      dark:bg-mtps-surface/50 bg-gray-50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${roleColors[force.role]}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold dark:text-mtps-text text-mtps-text-light truncate">
                            {force.archetype}
                          </span>
                          <span className="text-[10px] font-mono dark:text-mtps-muted text-mtps-muted ml-2">
                            {(force.weight * 100).toFixed(1)}%
                          </span>
                        </div>
                        <span className="text-[10px] dark:text-mtps-muted text-mtps-muted">
                          {force.cardName} · {force.role} · {force.keywords.join(', ')}
                        </span>
                        <div className="mt-1 h-1 rounded-full dark:bg-mtps-border bg-gray-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${barColors[force.role]}`}
                            style={{ width: `${force.weight * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Query Embedding */}
            <div className="p-4 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
              border-mtps-border-light bg-white">
              <h3 className="font-display text-sm font-bold dark:text-mtps-gold text-orange-600 mb-3">
                Query Embedding Cᵤ
              </h3>
              <MeaningRadar weights={response.query.embedding.dimensionWeights} />
              <div className="mt-3 space-y-1">
                {Object.entries(response.query.embedding.dimensionWeights).map(([dim, val]) => (
                  <div key={dim} className="flex items-center justify-between text-[10px]">
                    <span className="dark:text-mtps-muted text-mtps-muted capitalize">{dim}</span>
                    <span className="font-mono dark:text-mtps-silver text-mtps-text-light">
                      {(val as number).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                dark:bg-mtps-card dark:text-mtps-silver dark:hover:bg-mtps-purple/40
                bg-white text-mtps-muted hover:bg-gray-50
                border dark:border-mtps-border border-mtps-border-light transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New Question
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold
                bg-gradient-to-r from-orange-500 to-amber-500 text-white
                hover:from-amber-500 hover:to-orange-500
                disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Orbit className="w-3.5 h-3.5" /> Re-analyse
            </button>
            <button
              onClick={() => setView('verification')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                dark:bg-mtps-card dark:text-mtps-teal dark:hover:bg-mtps-purple/40
                bg-white text-emerald-600 hover:bg-gray-50
                border dark:border-mtps-border border-mtps-border-light transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Verification
            </button>
            <button
              onClick={() => setView('archetypal-map')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                dark:bg-mtps-card dark:text-orange-400 dark:hover:bg-mtps-purple/40
                bg-white text-orange-600 hover:bg-gray-50
                border dark:border-mtps-border border-mtps-border-light transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" /> Archetypal Map
            </button>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!response && !isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <div className="w-24 h-24 rounded-2xl dark:bg-mtps-card bg-gray-100 flex items-center justify-center mb-6">
            <Orbit className="w-10 h-10 dark:text-orange-400 text-orange-300" />
          </div>
          <h2 className="font-display text-xl font-bold dark:text-mtps-text text-mtps-text-light mb-2">
            Ask a Universal Question
          </h2>
          <p className="text-sm dark:text-mtps-muted text-mtps-muted text-center max-w-md">
            Enter any universal, metaphysical, or cosmological question above.
            The system will map it onto an archetypal configuration space,
            identify generative forces, and provide a symbolic-archetypal representation —
            not a scientific explanation.
          </p>
        </motion.div>
      )}
    </div>
  );
}
