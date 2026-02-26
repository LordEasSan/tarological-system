import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTutorial } from '../../context/TutorialContext';

interface TourStepProps {
  targetRect: DOMRect;
}

const GAP = 12;

/** Responsive tooltip width: min of 320 or viewport minus 24px margin */
function getTooltipWidth() {
  return Math.min(320, window.innerWidth - 24);
}

/**
 * Positioned tooltip that appears next to a highlighted element
 * during the product tour. Includes Next / Back / Skip controls
 * and a step progress indicator.
 */
export function TourStep({ targetRect }: TourStepProps) {
  const { currentStep, state, totalSteps, next, prev, skip } = useTutorial();

  const position = useMemo(() => {
    if (!currentStep) return { top: 0, left: 0, width: getTooltipWidth() };
    const placement = currentStep.placement ?? 'bottom';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tooltipW = getTooltipWidth();

    let top = 0;
    let left = 0;

    // On very small screens, always place below
    const effectivePlacement = vw < 480 ? 'bottom' : placement;

    switch (effectivePlacement) {
      case 'bottom':
        top = targetRect.bottom + GAP;
        left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
        break;
      case 'top':
        top = targetRect.top - GAP - 180;
        left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - 90;
        left = targetRect.left - tooltipW - GAP;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - 90;
        left = targetRect.right + GAP;
        break;
    }

    // Clamp within viewport
    left = Math.max(12, Math.min(left, vw - tooltipW - 12));
    top = Math.max(12, Math.min(top, vh - 200));

    return { top, left, width: tooltipW };
  }, [targetRect, currentStep]);

  if (!currentStep) return null;

  const stepIndex = state.currentStepIndex;

  return (
    <motion.div
      data-testid="tour-step"
      role="dialog"
      aria-label={currentStep.title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="fixed rounded-xl shadow-2xl border
        dark:bg-mtps-card dark:border-mtps-violet/40
        bg-white border-mtps-border-light"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-[10px] font-mono uppercase tracking-wider dark:text-mtps-gold text-mtps-violet">
          Step {stepIndex + 1} / {totalSteps}
        </span>
        <button
          onClick={skip}
          className="p-1 rounded-lg dark:text-mtps-muted dark:hover:text-mtps-silver
            text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close tutorial"
          data-testid="tour-close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 pb-2">
        <h3 className="font-display text-sm font-bold dark:text-mtps-text text-mtps-text-light mb-1">
          {currentStep.title}
        </h3>
        <p className="text-xs dark:text-mtps-muted text-mtps-muted leading-relaxed">
          {currentStep.content}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1 py-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === stepIndex
                ? 'dark:bg-mtps-gold bg-mtps-violet'
                : i < stepIndex
                  ? 'dark:bg-mtps-accent bg-mtps-accent'
                  : 'dark:bg-mtps-border bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t dark:border-mtps-border border-mtps-border-light">
        <button
          onClick={skip}
          className="text-[11px] font-medium dark:text-mtps-muted dark:hover:text-mtps-silver
            text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="tour-skip"
        >
          Salta Tutorial
        </button>

        <div className="flex items-center gap-1.5">
          {stepIndex > 0 && (
            <button
              onClick={prev}
              className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium
                dark:text-mtps-silver dark:hover:bg-mtps-purple/20
                text-mtps-muted hover:bg-gray-100 transition-all"
              data-testid="tour-prev"
            >
              <ChevronLeft className="w-3 h-3" /> Indietro
            </button>
          )}
          <button
            onClick={next}
            className="flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] font-bold
              bg-gradient-to-r from-mtps-accent to-mtps-accent-alt text-white
              hover:from-mtps-accent-alt hover:to-mtps-accent transition-all"
            data-testid="tour-next"
          >
            {stepIndex + 1 >= totalSteps ? 'Fine' : 'Avanti'} <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
