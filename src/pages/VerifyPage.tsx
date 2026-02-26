import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Play, RefreshCcw, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LTLVerifier } from '../components/verify';
import { InfoTooltip } from '../components/tutorial';
import { mockGenerate } from '../api';
import { verifyReading } from '../engine/ltl';
import type { LTLVerification, PlacedCard } from '../types';

export function VerifyPage() {
  const { state } = useApp();
  const [verification, setVerification] = useState<LTLVerification | null>(null);
  const [spread, setSpread] = useState<PlacedCard[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);

  const handleRun = useCallback(() => {
    setIsRunning(true);

    setTimeout(() => {
      // Generate a spread if we don't have one
      const currentSpread = spread ?? mockGenerate(state.parameters).spread;
      if (!spread) setSpread(currentSpread);

      // Use real LTL verification engine
      const result = verifyReading(currentSpread, state.parameters);
      setVerification(result);
      setIsRunning(false);
      setRunCount((c) => c + 1);
    }, 300);
  }, [spread, state.parameters]);

  const handleReset = () => {
    setVerification(null);
    setSpread(null);
    setRunCount(0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">
          LTL Verification <InfoTooltip text="Verifica formale con logica temporale lineare (LTL). Controlla 6 proprietà su 4 classi temporali: Safety G(φ), Co-safety F(φ), Liveness GF(φ), Co-liveness FG(φ)." placement="bottom" />
        </h1>
        <p className="text-sm dark:text-mtps-muted text-mtps-muted max-w-lg mx-auto">
          Run formal temporal-logic model checking on your reading to ensure structural
          integrity and semantic coherence.
        </p>
      </motion.div>

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
          border-mtps-border-light bg-white mb-8"
        id="tour-verify-info"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 dark:text-mtps-accent-alt text-mtps-violet shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold dark:text-mtps-text text-mtps-text-light mb-2">
              Property Classes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="dark:text-mtps-text text-mtps-text-light">Safety — G(φ)</strong>
                  <p className="dark:text-mtps-muted text-mtps-muted">
                    Invariants that must hold in every state. E.g., card uniqueness.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="dark:text-mtps-text text-mtps-text-light">Co-safety — F(φ)</strong>
                  <p className="dark:text-mtps-muted text-mtps-muted">
                    Properties achieved at some finite point. E.g., spread completeness.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="dark:text-mtps-text text-mtps-text-light">Liveness — GF(φ)</strong>
                  <p className="dark:text-mtps-muted text-mtps-muted">
                    Properties recurring infinitely. E.g., archetype coverage diversity.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="dark:text-mtps-text text-mtps-text-light">Co-liveness — FG(φ)</strong>
                  <p className="dark:text-mtps-muted text-mtps-muted">
                    Eventual stability properties. E.g., narrative-spread coherence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          id="tour-verify-run"
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold
            bg-gradient-to-r from-mtps-teal to-emerald-500 text-white
            hover:from-emerald-500 hover:to-mtps-teal
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-md shadow-mtps-accent/10 transition-all"
        >
          {isRunning ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <ShieldCheck className="w-4 h-4" />
            </motion.div>
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isRunning ? 'Verifying...' : 'Run Verification'}
        </button>

        {verification && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
              dark:bg-mtps-card dark:text-mtps-silver dark:hover:bg-mtps-purple/40
              bg-white text-mtps-muted hover:bg-gray-100
              border dark:border-mtps-border border-mtps-border-light transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Run counter */}
      {runCount > 0 && (
        <p className="text-center text-xs dark:text-mtps-muted text-mtps-muted mb-6">
          Verification runs: <span className="font-mono dark:text-mtps-gold text-mtps-violet">{runCount}</span>
        </p>
      )}

      {/* Results */}
      {verification && (
        <motion.div
          id="tour-verify-results"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LTLVerifier verification={verification} />
        </motion.div>
      )}

      {/* Empty State */}
      {!verification && !isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <div className="w-20 h-20 rounded-2xl dark:bg-mtps-card bg-gray-100 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 dark:text-mtps-muted text-gray-300" />
          </div>
          <p className="text-sm dark:text-mtps-muted text-mtps-muted text-center max-w-sm">
            Click "Run Verification" to execute LTL model checking on a generated reading.
            A spread will be auto-generated using your current parameters.
          </p>
        </motion.div>
      )}
    </div>
  );
}
