import { useEffect, useState, useRef, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '../../context/TutorialContext';
import { TourStep } from './TourStep';

/**
 * Full-screen semi-transparent overlay that highlights the active tour target
 * while dimming the rest of the UI. Renders the TourStep tooltip positioned
 * next to the highlighted element.
 */
export function TourOverlay() {
  const { state, currentStep } = useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef(0);

  // Track the target element rect
  useEffect(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const measure = () => {
      const el =
        document.getElementById(currentStep.target) ??
        document.querySelector(currentStep.target);

      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        // Scroll into view if needed
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTargetRect(null);
      }
      rafRef.current = requestAnimationFrame(measure);
    };

    // Initial delay to let the DOM settle
    const timer = setTimeout(() => {
      measure();
    }, 100);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [currentStep]);

  if (!state.isActive || !currentStep) return null;

  // SVG overlay with a cut-out rectangle around the target
  const padding = 8;
  const cutout = targetRect
    ? {
        x: targetRect.left - padding,
        y: targetRect.top - padding,
        w: targetRect.width + padding * 2,
        h: targetRect.height + padding * 2,
        rx: 12,
      }
    : null;

  const spotlightStyle: CSSProperties | undefined = cutout
    ? {
        position: 'absolute',
        left: cutout.x,
        top: cutout.y,
        width: cutout.w,
        height: cutout.h,
        borderRadius: cutout.rx,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
        pointerEvents: 'none',
        transition: 'all 300ms ease',
        zIndex: 9998,
      }
    : undefined;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0"
        style={{ zIndex: 9997, pointerEvents: 'none' }}
        data-testid="tour-overlay"
      >
        {/* Spotlight cutout */}
        {cutout && <div style={spotlightStyle} data-testid="tour-spotlight" />}

        {/* Clickable backdrop behind tooltip — click = skip */}
        <div
          className="fixed inset-0"
          style={{ zIndex: 9998, pointerEvents: 'auto' }}
          onClick={(e) => {
            // Only if clicking the backdrop itself, not children
            if (e.target === e.currentTarget) {
              // let clicks through
            }
          }}
        />

        {/* Step tooltip */}
        {targetRect && (
          <TourStep targetRect={targetRect} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
