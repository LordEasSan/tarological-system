import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, Send, RotateCcw, ShieldCheck, Eye,
  BookOpen, Compass, Fingerprint, HelpCircle, GitBranch,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SpreadVisualizer, TarotCardView } from '../components/cards';
import { LTLVerifier } from '../components/verify';
import { MeaningRadar } from '../components/charts';
import { InfoTooltip } from '../components/tutorial';
import { mockGenerate } from '../api';
import { executePhilosophicalQuery } from '../engine/philosophical';
import type { PhilosophicalResponse, PhilosophicalQuestionType } from '../types';

// ─── Question Type Icons & Labels ───────────────────

const QUESTION_TYPE_META: Record<PhilosophicalQuestionType, {
  icon: typeof Brain;
  label: string;
  color: string;
}> = {
  'ontological': { icon: Eye, label: 'Ontological', color: 'text-blue-400' },
  'teleological': { icon: Compass, label: 'Teleological', color: 'text-amber-400' },
  'identity': { icon: Fingerprint, label: 'Identity', color: 'text-purple-400' },
  'meaning-of-event': { icon: HelpCircle, label: 'Meaning of Event', color: 'text-emerald-400' },
  'counterfactual-existential': { icon: GitBranch, label: 'Counterfactual', color: 'text-rose-400' },
};

// ─── Example Questions ──────────────────────────────

const EXAMPLE_QUESTIONS = [
  'What does it mean that this happened to me?',
  'Who am I becoming?',
  'What kind of world am I inhabiting?',
  'What would it imply if I had chosen differently?',
  'What is the nature of the change I am experiencing?',
  'Where am I heading?',
];

export function PhilosophicalPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<PhilosophicalResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<'interpretation' | 'spread' | 'cards' | 'verification'>('interpretation');

  const handleSubmit = useCallback(() => {
    if (!question.trim() || isProcessing) return;
    setIsProcessing(true);
    setResponse(null);

    setTimeout(() => {
      const generateFn = (p: typeof state.parameters) => mockGenerate(p).spread;
      const result = executePhilosophicalQuery(
        question.trim(),
        state.parameters,
        generateFn,
      );
      setResponse(result);
      setIsProcessing(false);
    }, 500);
  }, [question, state.parameters, isProcessing]);

  const handleExampleClick = (q: string) => {
    setQuestion(q);
  };

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
            <Brain className="w-8 h-8" />
            Philosophical Mode
          </h1>
          <p className="text-sm dark:text-mtps-muted text-mtps-muted mt-1">
            Philosophical-Ontological Query · Trajectory-space restructuring · Q = (C, ΦQ, Δ)
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
          dark:bg-mtps-violet/10 dark:border-mtps-violet/30
          bg-indigo-50 border-indigo-200"
      >
        <p className="text-xs dark:text-mtps-silver text-indigo-700 leading-relaxed">
          <strong>Philosophical Mode</strong> treats your question as <em>trajectory-space restructuring</em>,
          not prediction. It maps your query onto archetypal attractor basins, evaluates structural
          entropy, and verifies liveness constraints — ensuring no deterministic fatalism.{' '}
          <InfoTooltip text="La modalità filosofica non predice eventi futuri. Analizza la struttura topologica della domanda nel space degli attrattori archetipali, garantendo il vincolo di liveness □♢(st ∈ L)." />
        </p>
      </motion.div>

      {/* Question Input */}
      <div className="mb-8">
        <div className="p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
          border-mtps-border-light bg-white">
          <label className="block text-sm font-semibold dark:text-mtps-gold text-mtps-purple mb-3">
            Your Philosophical Question
          </label>
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any philosophical, ontological, or existential question..."
              rows={3}
              className="w-full p-4 pr-14 rounded-xl text-sm resize-none
                dark:bg-mtps-surface dark:text-mtps-text dark:placeholder-mtps-muted
                dark:border-mtps-border dark:focus:border-mtps-violet
                bg-gray-50 text-mtps-text-light placeholder-gray-400
                border border-mtps-border-light focus:border-mtps-violet
                focus:outline-none focus:ring-1 focus:ring-mtps-violet/30
                transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || isProcessing}
              className="absolute right-3 bottom-3 p-2.5 rounded-lg
                bg-gradient-to-r from-mtps-accent to-mtps-accent-alt text-white
                hover:from-mtps-accent-alt hover:to-mtps-accent
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-md shadow-mtps-accent/10 transition-all"
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
                      dark:bg-mtps-surface dark:text-mtps-silver dark:hover:bg-mtps-purple/20
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
            <Brain className="w-12 h-12 text-mtps-violet" />
          </motion.div>
          <p className="mt-4 text-sm dark:text-mtps-muted text-mtps-muted font-display">
            Analysing trajectory space...
          </p>
          <p className="mt-1 text-[10px] font-mono dark:text-mtps-muted/60 text-mtps-muted/60">
            Q = (C, ΦQ, Δ) → ΠQ → Meaning(e)
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
              dark:bg-mtps-card dark:text-mtps-accent bg-gray-100 text-mtps-violet
              border dark:border-mtps-border border-mtps-border-light">
              {response.query.temporalLogic.formula}
            </div>

            {/* Entropy */}
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium
              dark:bg-mtps-card bg-gray-100 border dark:border-mtps-border border-mtps-border-light
              ${response.trajectory.entropy > 0.7 ? 'dark:text-amber-400 text-amber-600' :
                response.trajectory.entropy > 0.4 ? 'dark:text-mtps-gold text-yellow-600' :
                'dark:text-mtps-accent text-emerald-600'}`}>
              Entropy: {(response.trajectory.entropy * 100).toFixed(1)}%
            </div>

            {/* Liveness */}
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium
              dark:bg-mtps-card bg-gray-100 border dark:border-mtps-border border-mtps-border-light
              ${response.trajectory.livenessHolds ? 'dark:text-mtps-teal text-emerald-600' : 'text-red-400'}`}>
              □♢(st ∈ L): {response.trajectory.livenessHolds ? '✓' : '✗'}
            </div>

            {/* Integration */}
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium
              dark:bg-mtps-card bg-gray-100 border dark:border-mtps-border border-mtps-border-light
              ${response.meaning.integrated ? 'dark:text-mtps-accent text-emerald-600' : 'dark:text-amber-400 text-amber-600'}`}>
              {response.meaning.integrated ? 'Integrated' : 'Liminal'}
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-1 p-1 rounded-xl dark:bg-mtps-card bg-gray-100 w-fit overflow-x-auto max-w-full">
            {(['interpretation', 'spread', 'cards', 'verification'] as const).map((v) => (
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

          {/* Interpretation View */}
          <AnimatePresence mode="wait">
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
                      return <h3 key={i} className="font-display dark:text-mtps-gold text-mtps-purple text-base mt-6 mb-2">{line.slice(4)}</h3>;
                    if (line.startsWith('> '))
                      return (
                        <blockquote key={i} className="border-l-2 dark:border-mtps-violet border-mtps-accent-alt
                          pl-4 italic dark:text-mtps-silver text-mtps-text-light text-sm my-3">
                          {line.slice(2)}
                        </blockquote>
                      );
                    if (line.startsWith('- ◈') || line.startsWith('- ◆') || line.startsWith('- ◇'))
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
                  const attractor = response.trajectory.attractors.find(a => a.cardId === placed.card.id);
                  return (
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
                      {attractor && (
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full
                          ${attractor.polarity === 'constructive'
                            ? 'dark:bg-mtps-accent/10 dark:text-mtps-accent bg-emerald-50 text-emerald-600'
                            : attractor.polarity === 'destructive'
                            ? 'dark:bg-red-400/10 dark:text-red-400 bg-red-50 text-red-500'
                            : 'dark:bg-amber-400/10 dark:text-amber-400 bg-amber-50 text-amber-600'
                          }`}>
                          {attractor.polarity} · {(attractor.dominance * 100).toFixed(0)}%
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

          {/* Sidebar: Attractor Basins + Meaning Weights */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Attractor Basins */}
            <div className="lg:col-span-2 p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
              border-mtps-border-light bg-white">
              <h3 className="font-display text-sm font-bold dark:text-mtps-gold text-mtps-purple mb-3">
                Attractor Basins — ΠQ
              </h3>
              <div className="space-y-2">
                {response.trajectory.attractors.map((attractor, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg
                    dark:bg-mtps-surface/50 bg-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${attractor.polarity === 'constructive'
                        ? 'dark:bg-mtps-accent/20 dark:text-mtps-accent bg-emerald-100 text-emerald-600'
                        : attractor.polarity === 'destructive'
                        ? 'dark:bg-red-400/20 dark:text-red-400 bg-red-100 text-red-500'
                        : 'dark:bg-amber-400/20 dark:text-amber-400 bg-amber-100 text-amber-600'
                      }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold dark:text-mtps-text text-mtps-text-light truncate">
                          {attractor.archetype}
                        </span>
                        <span className="text-[10px] font-mono dark:text-mtps-muted text-mtps-muted ml-2">
                          {(attractor.dominance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-[10px] dark:text-mtps-muted text-mtps-muted">
                        {attractor.cardName} · {attractor.keywords.join(', ')}
                      </span>
                      {/* Dominance bar */}
                      <div className="mt-1 h-1 rounded-full dark:bg-mtps-border bg-gray-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all
                            ${attractor.polarity === 'constructive'
                              ? 'bg-mtps-accent'
                              : attractor.polarity === 'destructive'
                              ? 'bg-red-400'
                              : 'bg-amber-400'
                            }`}
                          style={{ width: `${attractor.dominance * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meaning Weights */}
            <div className="p-4 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
              border-mtps-border-light bg-white">
              <h3 className="font-display text-sm font-bold dark:text-mtps-gold text-mtps-purple mb-3">
                Query Embedding C
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
                bg-gradient-to-r from-mtps-violet to-mtps-purple text-white
                hover:from-mtps-purple hover:to-mtps-violet
                disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Brain className="w-3.5 h-3.5" /> Re-analyse
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
              onClick={() => setView('interpretation')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                dark:bg-mtps-card dark:text-mtps-gold dark:hover:bg-mtps-purple/40
                bg-white text-mtps-purple hover:bg-gray-50
                border dark:border-mtps-border border-mtps-border-light transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" /> Interpretation
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
            <Brain className="w-10 h-10 dark:text-mtps-violet text-indigo-300" />
          </div>
          <h2 className="font-display text-xl font-bold dark:text-mtps-text text-mtps-text-light mb-2">
            Ask a Philosophical Question
          </h2>
          <p className="text-sm dark:text-mtps-muted text-mtps-muted text-center max-w-md">
            Enter any philosophical, ontological, or existential question above.
            The system will map it onto trajectory space, identify attractor basins,
            and provide a structural clarification — not a prediction.
          </p>
        </motion.div>
      )}
    </div>
  );
}
