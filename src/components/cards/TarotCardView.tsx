import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import type { TarotCard, SymbolicRole } from '../../types';

interface TarotCardViewProps {
  card: TarotCard;
  size?: 'sm' | 'md' | 'lg';
  showMeaning?: boolean;
  /** Symbolic role from SymbolicConfiguration — drives visual affordances */
  role?: SymbolicRole;
}

const sizeClasses = {
  sm: 'w-20 h-32 sm:w-28 sm:h-44',
  md: 'w-28 h-44 sm:w-40 sm:h-64',
  lg: 'w-40 h-64 sm:w-52 sm:h-80',
};

/** Role-based visual affordances — glow, pulse, shadow deepen */
const ROLE_STYLES: Record<SymbolicRole, {
  ring: string;
  glow: string;
  animation: string;
  badge: string;
  badgeLabel: string;
}> = {
  anchor: {
    ring: 'ring-2 ring-amber-400/60 dark:ring-mtps-gold/60',
    glow: 'shadow-[0_0_18px_rgba(245,158,11,0.35)] dark:shadow-[0_0_18px_rgba(255,215,0,0.25)]',
    animation: '',
    badge: 'bg-amber-500/20 text-amber-400 dark:text-mtps-gold border-amber-400/30',
    badgeLabel: 'Anchor',
  },
  catalyst: {
    ring: 'ring-2 ring-emerald-400/50 dark:ring-emerald-400/40',
    glow: '',
    animation: 'animate-pulse-subtle',
    badge: 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border-emerald-400/30',
    badgeLabel: 'Catalyst',
  },
  shadow: {
    ring: 'ring-2 ring-rose-500/50 dark:ring-rose-400/40',
    glow: 'shadow-[0_6px_24px_rgba(225,29,72,0.25)] dark:shadow-[0_6px_24px_rgba(225,29,72,0.15)]',
    animation: '',
    badge: 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border-rose-400/30',
    badgeLabel: 'Shadow',
  },
  bridge: {
    ring: 'ring-2 ring-violet-400/50 dark:ring-violet-400/40',
    glow: '',
    animation: '',
    badge: 'bg-violet-500/20 text-violet-500 dark:text-violet-400 border-violet-400/30',
    badgeLabel: 'Bridge',
  },
};

export function TarotCardView({ card, size = 'md', showMeaning = false, role }: TarotCardViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const roleStyle = role ? ROLE_STYLES[role] : null;

  const handleClose = useCallback(() => setIsExpanded(false), []);

  // Close on Escape
  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded, handleClose]);

  return (
    <>
      {/* Card — hover scale on desktop, tap to expand on all */}
      <motion.div
        className={`relative cursor-pointer select-none ${sizeClasses[size]}
          ${roleStyle?.ring ?? ''} ${roleStyle?.glow ?? ''} ${roleStyle?.animation ?? ''}
          rounded-xl transition-shadow duration-300`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsExpanded(true)}
        whileHover={{ scale: 1.08, y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
        whileTap={{ scale: 0.97 }}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${card.name}${card.isReversed ? ' (reversed)' : ''}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsExpanded(true); } }}
      >
        {/* Role badge */}
        {roleStyle && (
          <div className={`absolute -top-2 -right-2 z-10 px-1.5 py-0.5 rounded-full text-[9px]
            font-semibold border ${roleStyle.badge}`}>
            {roleStyle.badgeLabel}
          </div>
        )}

        <div
          className={`w-full h-full rounded-xl border-2 overflow-hidden
            dark:border-mtps-gold/40 dark:bg-gradient-to-br dark:from-mtps-purple dark:to-mtps-deep
            border-mtps-accent-alt/30 bg-gradient-to-br from-white to-mtps-surface-light
            transition-shadow duration-300
            ${isHovered ? 'shadow-xl' : 'shadow-lg'}
            ${card.isReversed ? 'rotate-180' : ''}`}
        >
          {/* Decorative frame */}
          <div className="absolute inset-2 border dark:border-mtps-gold/20 border-mtps-accent-alt/15 rounded-lg pointer-events-none" />

          {/* Number */}
          <div className="absolute top-3 left-3 text-xs font-display dark:text-mtps-gold text-mtps-purple font-bold">
            {card.isMajor ? toRoman(card.number) : card.number}
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center h-full px-3 py-8 text-center">
            <div className="text-3xl mb-2 animate-float">
              {getCardEmoji(card.number)}
            </div>

            <h3 className="font-display text-xs font-bold dark:text-mtps-gold-light text-mtps-purple leading-tight">
              {card.name}
            </h3>

            {card.suit && (
              <span className="text-[10px] dark:text-mtps-accent-alt text-mtps-violet mt-0.5">
                {card.suit}
              </span>
            )}

            {card.isReversed && (
              <span className="mt-1 text-[9px] px-1.5 py-0.5 rounded-full
                dark:bg-mtps-ember/20 dark:text-mtps-ember
                bg-red-100 text-red-600 font-medium">
                Reversed
              </span>
            )}

            {/* Keywords — compact, no scroll */}
            <div className="mt-2 flex flex-wrap gap-0.5 justify-center">
              {card.keywords.slice(0, 3).map((kw) => (
                <span
                  key={kw}
                  className="text-[8px] px-1 py-0.5 rounded
                    dark:bg-mtps-violet/20 dark:text-mtps-silver
                    bg-mtps-accent-alt/10 text-mtps-muted"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hover preview — desktop only, fades in */}
        <AnimatePresence>
          {isHovered && showMeaning && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30
                w-60 p-3 rounded-xl border shadow-xl backdrop-blur-sm
                dark:bg-mtps-deep/95 dark:border-mtps-border
                bg-white/95 border-mtps-border-light"
            >
              <p className="text-[10px] dark:text-mtps-silver text-mtps-text-light font-medium mb-1">
                {card.archetype} · {card.isReversed ? 'Reversed' : 'Upright'}
              </p>
              <p className="text-[10px] dark:text-mtps-muted text-mtps-muted leading-relaxed line-clamp-3">
                {card.isReversed ? card.meaningReversed : card.meaningUp}
              </p>
              <p className="text-[8px] dark:text-mtps-accent text-mtps-purple mt-1 italic">
                Tap to expand full view
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Expanded Modal — tap-to-focus (all devices) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4
              bg-black/60 dark:bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label={`Card detail: ${card.name}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md max-h-[85vh] rounded-2xl border-2 overflow-hidden
                dark:border-mtps-gold/50 dark:bg-gradient-to-br dark:from-mtps-card dark:to-mtps-deep
                border-mtps-accent-alt/30 bg-gradient-to-br from-white to-mtps-surface-light
                shadow-2xl ${roleStyle?.glow ?? ''}`}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full
                  dark:bg-mtps-deep/80 dark:text-mtps-muted dark:hover:text-mtps-text
                  bg-white/80 text-mtps-muted hover:text-mtps-text-light
                  transition-colors"
                aria-label="Close card detail"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Scrollable content — natural reflow, no horizontal bars */}
              <div className="overflow-y-auto overflow-x-hidden max-h-[85vh] p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{getCardEmoji(card.number)}</div>
                  <h2 className="font-display text-xl font-bold dark:text-mtps-gold-light text-mtps-purple">
                    {card.name}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs dark:text-mtps-accent-alt text-mtps-violet">
                      {card.isMajor ? `Major Arcana ${toRoman(card.number)}` : `${card.suit} ${card.number}`}
                    </span>
                    {card.isReversed && (
                      <span className="text-xs px-2 py-0.5 rounded-full
                        dark:bg-mtps-ember/20 dark:text-mtps-ember
                        bg-red-100 text-red-600 font-medium">
                        Reversed
                      </span>
                    )}
                    {roleStyle && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${roleStyle.badge}`}>
                        {roleStyle.badgeLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Archetype */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold dark:text-mtps-silver text-mtps-text-light uppercase tracking-wider mb-1">
                    Archetype
                  </h4>
                  <p className="text-sm dark:text-mtps-accent text-mtps-purple font-medium">
                    {card.archetype}
                  </p>
                </div>

                {/* Meaning — naturally reflowed text, no scroll */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold dark:text-mtps-teal text-emerald-600 uppercase tracking-wider mb-2">
                    {card.isReversed ? 'Reversed Meaning' : 'Upright Meaning'}
                  </h4>
                  <p className="text-sm dark:text-mtps-text text-mtps-text-light leading-relaxed">
                    {card.isReversed ? card.meaningReversed : card.meaningUp}
                  </p>
                </div>

                {showMeaning && (
                  <div className="mb-5">
                    <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2
                      ${card.isReversed
                        ? 'dark:text-mtps-teal text-emerald-600'
                        : 'dark:text-mtps-ember text-red-500'}`}>
                      {card.isReversed ? 'Upright Meaning' : 'Reversed Meaning'}
                    </h4>
                    <p className="text-sm dark:text-mtps-muted text-mtps-muted leading-relaxed">
                      {card.isReversed ? card.meaningUp : card.meaningReversed}
                    </p>
                  </div>
                )}

                {/* Keywords — full set, wrap naturally */}
                <div>
                  <h4 className="text-xs font-semibold dark:text-mtps-silver text-mtps-text-light uppercase tracking-wider mb-2">
                    Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {card.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs px-2 py-1 rounded-lg
                          dark:bg-mtps-violet/20 dark:text-mtps-silver
                          bg-mtps-accent-alt/10 text-mtps-muted"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function toRoman(num: number): string {
  const vals = [10, 9, 5, 4, 1];
  const syms = ['X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result || '0';
}

function getCardEmoji(num: number): string {
  const emojis = ['🃏', '⚡', '🌙', '🌺', '👑', '📿', '❤️', '🏹', '🦁', '🏔️', '☸️', '⚖️', '🔮', '💀', '⚗️', '🔥', '💥', '⭐', '🌊', '☀️', '🎺', '🌍'];
  return emojis[num] || '✨';
}
