import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  /** Tooltip body text */
  text: string;
  /** Optional placement ('top' | 'bottom' | 'left' | 'right') */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Optional override for the trigger icon */
  children?: ReactNode;
  /** Optional max-width in px */
  maxWidth?: number;
}

const OFFSETS = {
  top: { x: '-50%', y: 'calc(-100% - 8px)' },
  bottom: { x: '-50%', y: '8px' },
  left: { x: 'calc(-100% - 8px)', y: '-50%' },
  right: { x: '8px', y: '-50%' },
};

/**
 * Accessible info tooltip that appears on hover and focus.
 * Renders an ℹ️ icon (or custom trigger) with an explanatory tooltip.
 *
 * - Accessible via keyboard focus
 * - ARIA described-by relationship
 * - Concise positioning with viewport clamping
 */
export function InfoTooltip({ text, placement = 'top', children, maxWidth = 250 }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useRef(`tip-${Math.random().toString(36).slice(2, 8)}`).current;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive maxWidth - narrower on small screens
  const responsiveMaxWidth = typeof window !== 'undefined'
    ? Math.min(maxWidth, window.innerWidth - 32)
    : maxWidth;

  const show = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    hideTimer.current = setTimeout(() => setVisible(false), 120);
  }, []);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  // Clamp tooltip within viewport after render
  useEffect(() => {
    if (!visible || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const rect = el.getBoundingClientRect();
    if (rect.left < 8) el.style.transform = `translateX(${8 - rect.left}px)`;
    if (rect.right > window.innerWidth - 8)
      el.style.transform = `translateX(${window.innerWidth - 8 - rect.right}px)`;
  }, [visible]);

  const offset = OFFSETS[placement];

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center justify-center p-0.5 rounded-full
          dark:text-mtps-muted dark:hover:text-mtps-gold
          text-gray-400 hover:text-mtps-violet
          focus:outline-none focus-visible:ring-2 focus-visible:ring-mtps-accent
          transition-colors cursor-help"
        aria-describedby={visible ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        data-testid="info-tooltip-trigger"
      >
        {children ?? <Info className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[10000] px-3 py-2 rounded-lg shadow-lg text-[11px] leading-relaxed
              dark:bg-mtps-deep dark:text-mtps-text dark:border dark:border-mtps-border
              bg-gray-800 text-white"
            style={{
              maxWidth: responsiveMaxWidth,
              ...(placement === 'top' || placement === 'bottom'
                ? { left: '50%', [placement === 'top' ? 'bottom' : 'top']: '100%', transform: `translateX(${offset.x})`, marginTop: placement === 'bottom' ? 6 : 0, marginBottom: placement === 'top' ? 6 : 0 }
                : { top: '50%', [placement === 'left' ? 'right' : 'left']: '100%', transform: `translateY(${offset.y})`, marginLeft: placement === 'right' ? 6 : 0, marginRight: placement === 'left' ? 6 : 0 }),
            }}
            onMouseEnter={show}
            onMouseLeave={hide}
            data-testid="info-tooltip-content"
          >
            {text}
            {/* Arrow */}
            <span
              className={`absolute w-2 h-2 rotate-45
                dark:bg-mtps-deep dark:border dark:border-mtps-border
                bg-gray-800
                ${placement === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0' : ''}
                ${placement === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0' : ''}
                ${placement === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-l-0 border-b-0' : ''}
                ${placement === 'right' ? 'left-[-5px] top-1/2 -translate-y-1/2 border-r-0 border-t-0' : ''}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
