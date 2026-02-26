import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { LTLVerification, LTLPropertyType } from '../../types';

interface LTLVerifierProps {
  verification: LTLVerification;
}

const typeIcons: Record<LTLPropertyType, typeof ShieldCheck> = {
  safety: ShieldCheck,
  cosafety: Zap,
  liveness: Clock,
  coliveness: ShieldAlert,
};

const typeColors: Record<LTLPropertyType, string> = {
  safety: 'text-blue-400',
  cosafety: 'text-cyan-400',
  liveness: 'text-amber-400',
  coliveness: 'text-purple-400',
};

export function LTLVerifier({ verification }: LTLVerifierProps) {
  const [expanded, setExpanded] = useState(false);
  const passedCount = verification.properties.filter((p) => p.passed).length;
  const totalCount = verification.properties.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 transition-colors
        ${verification.overallPassed
          ? 'dark:border-mtps-teal/40 dark:bg-mtps-teal/5 border-emerald-200 bg-emerald-50'
          : 'dark:border-mtps-ember/40 dark:bg-mtps-ember/5 border-red-200 bg-red-50'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${verification.overallPassed
            ? 'dark:bg-mtps-teal/20 bg-emerald-100'
            : 'dark:bg-mtps-ember/20 bg-red-100'
          }`}>
            {verification.overallPassed ? (
              <ShieldCheck className="w-5 h-5 dark:text-mtps-teal text-emerald-600" />
            ) : (
              <ShieldAlert className="w-5 h-5 dark:text-mtps-ember text-red-600" />
            )}
          </div>
          <div>
            <h3 className="font-display text-sm font-bold dark:text-mtps-text text-mtps-text-light">
              LTL Verification
            </h3>
            <p className="text-xs dark:text-mtps-muted text-mtps-muted">
              {passedCount}/{totalCount} properties passed &middot; {verification.executionTimeMs}ms
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg dark:hover:bg-mtps-purple/20 hover:bg-gray-100 transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 dark:text-mtps-silver text-mtps-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 dark:text-mtps-silver text-mtps-muted" />
          )}
        </button>
      </div>

      {/* Property Details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-4 space-y-2"
        >
          {verification.properties.map((prop, i) => {
            const Icon = typeIcons[prop.type];
            return (
              <motion.div
                key={prop.name}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-3 p-3 rounded-lg
                  ${prop.passed
                    ? 'dark:bg-mtps-teal/5 bg-emerald-50/50'
                    : 'dark:bg-mtps-ember/5 bg-red-50/50'
                  }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 ${typeColors[prop.type]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold dark:text-mtps-text text-mtps-text-light">
                      {prop.name}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium
                      ${prop.passed
                        ? 'dark:bg-mtps-teal/20 dark:text-mtps-teal bg-emerald-100 text-emerald-700'
                        : 'dark:bg-mtps-ember/20 dark:text-mtps-ember bg-red-100 text-red-700'
                      }`}>
                      {prop.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <code className="text-[9px] dark:text-mtps-accent-alt text-mtps-violet block mt-0.5 break-all">
                    {prop.formula}
                  </code>
                  {prop.details && (
                    <p className="text-[10px] dark:text-mtps-muted text-mtps-muted mt-0.5">
                      {prop.details}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
