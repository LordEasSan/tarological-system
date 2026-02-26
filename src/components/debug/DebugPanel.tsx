/**
 * DebugPanel — Developer tools for inspecting cards, spreads, and scoring
 *
 * Provides raw data views for:
 * - Current parameters θ
 * - Card data (JSON)
 * - Spread positions
 * - D1-D6 quality scores
 * - Iteration logs
 *
 * Toggled via keyboard shortcut (Ctrl+Shift+D) or debug button.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import type { PlacedCard, TarotParameters } from '../../types';
import type { QualityScore } from '../../engine/scoring';
import type { IterationLog } from '../../engine/iteration';

interface DebugPanelProps {
  params: TarotParameters;
  spread?: PlacedCard[] | null;
  qualityScore?: QualityScore | null;
  iterationLog?: IterationLog | null;
}

function CollapsibleSection({ title, children, defaultOpen = false }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b dark:border-mtps-border/50 border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 px-3 text-xs font-mono font-semibold
          dark:text-mtps-accent text-mtps-purple hover:dark:bg-mtps-surface hover:bg-gray-50
          transition-colors"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {title}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function JsonView({ data, label }: { data: unknown; label: string }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-1 right-1 p-1 rounded dark:bg-mtps-surface bg-gray-100
          dark:text-mtps-muted text-gray-400 hover:dark:text-mtps-accent hover:text-mtps-purple
          transition-colors"
        title={`Copy ${label}`}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </button>
      <pre className="text-[10px] font-mono dark:text-mtps-text/80 text-gray-700
        dark:bg-mtps-void/50 bg-gray-50 rounded p-2 overflow-auto max-h-64">
        {json}
      </pre>
    </div>
  );
}

export function DebugPanel({ params, spread, qualityScore, iterationLog }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-2 rounded-lg
          dark:bg-mtps-surface dark:text-mtps-accent dark:border-mtps-border
          bg-white text-mtps-purple border border-gray-200
          shadow-lg hover:scale-105 transition-transform"
        title="Debug Panel (Ctrl+Shift+D)"
      >
        <Bug className="w-4 h-4" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 bottom-0 w-80 z-50 overflow-y-auto
              dark:bg-mtps-deep dark:border-l dark:border-mtps-border
              bg-white border-l border-gray-200 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-3
              dark:bg-mtps-deep/95 bg-white/95 backdrop-blur-sm border-b
              dark:border-mtps-border border-gray-200">
              <span className="text-xs font-mono font-bold dark:text-mtps-accent text-mtps-purple">
                🐛 MTPS Debug
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded dark:text-mtps-muted text-gray-400
                  hover:dark:text-mtps-text hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sections */}
            <CollapsibleSection title="θ — Parameters" defaultOpen>
              <JsonView data={params} label="parameters" />
            </CollapsibleSection>

            <CollapsibleSection title={`Cards (${spread?.length ?? 0})`}>
              {spread ? (
                <div className="space-y-2">
                  {spread.map((s, i) => (
                    <div key={i} className="text-[10px] font-mono p-2 rounded
                      dark:bg-mtps-void/50 bg-gray-50">
                      <div className="dark:text-mtps-accent text-mtps-purple font-bold">
                        [{s.position.index}] {s.position.label}
                      </div>
                      <div className="dark:text-mtps-text text-gray-700">
                        {s.card.name} {s.card.isReversed ? '↓R' : '↑'}
                      </div>
                      <div className="dark:text-mtps-muted text-gray-500">
                        {s.card.archetype} • {s.card.keywords.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] dark:text-mtps-muted text-gray-400 italic">
                  No spread generated
                </p>
              )}
            </CollapsibleSection>

            <CollapsibleSection title="Spread Positions">
              {spread ? (
                <JsonView data={spread.map(s => ({
                  idx: s.position.index,
                  label: s.position.label,
                  x: s.position.x,
                  y: s.position.y,
                  rot: s.position.rotation,
                }))} label="positions" />
              ) : (
                <p className="text-[10px] dark:text-mtps-muted text-gray-400 italic">
                  No spread generated
                </p>
              )}
            </CollapsibleSection>

            <CollapsibleSection title="D1-D6 Quality Score">
              {qualityScore ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`font-bold ${qualityScore.passed ? 'dark:text-mtps-accent text-emerald-600' : 'dark:text-mtps-ember text-red-500'}`}>
                      Q = {qualityScore.composite.toFixed(3)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold
                      ${qualityScore.passed
                        ? 'dark:bg-mtps-accent/10 dark:text-mtps-accent bg-emerald-50 text-emerald-600'
                        : 'dark:bg-mtps-ember/10 dark:text-mtps-ember bg-red-50 text-red-500'
                      }`}>
                      {qualityScore.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  {qualityScore.dimensions.map(d => (
                    <div key={d.id} className="text-[10px] font-mono">
                      <div className="flex justify-between">
                        <span className="dark:text-mtps-accent-alt text-mtps-purple">{d.id}: {d.name}</span>
                        <span className="dark:text-mtps-text text-gray-700">{d.score.toFixed(3)}</span>
                      </div>
                      <div className="h-1 rounded-full dark:bg-mtps-void bg-gray-100 mt-0.5">
                        <div
                          className="h-full rounded-full dark:bg-mtps-accent bg-mtps-purple transition-all"
                          style={{ width: `${d.score * 100}%` }}
                        />
                      </div>
                      <p className="dark:text-mtps-muted text-gray-500 mt-0.5">{d.details}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] dark:text-mtps-muted text-gray-400 italic">
                  No quality score computed
                </p>
              )}
            </CollapsibleSection>

            <CollapsibleSection title="Iteration Log">
              {iterationLog ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono dark:text-mtps-text text-gray-700">
                    <span>Iterations:</span><span>{iterationLog.totalIterations}</span>
                    <span>Best iter:</span><span>#{iterationLog.bestIteration}</span>
                    <span>Best Q:</span><span>{iterationLog.bestQuality.toFixed(3)}</span>
                    <span>Converged:</span>
                    <span className={iterationLog.converged ? 'dark:text-mtps-accent text-emerald-600' : 'dark:text-mtps-ember text-red-500'}>
                      {iterationLog.converged ? 'YES' : 'NO'}
                    </span>
                    <span>Duration:</span><span>{iterationLog.totalDurationMs}ms</span>
                  </div>
                  {iterationLog.entries.map(e => (
                    <div key={e.iteration} className={`text-[9px] font-mono p-1.5 rounded
                      ${e.accepted ? 'dark:bg-mtps-accent/5 bg-emerald-50' : 'dark:bg-mtps-void/50 bg-gray-50'}`}>
                      <span className="dark:text-mtps-accent-alt text-mtps-purple">#{e.iteration}</span>
                      {' '}Q={e.quality.composite.toFixed(3)}
                      {' '}{e.accepted ? '✓' : '✗'}
                      {' '}{e.durationMs}ms
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] dark:text-mtps-muted text-gray-400 italic">
                  No iteration log
                </p>
              )}
            </CollapsibleSection>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
