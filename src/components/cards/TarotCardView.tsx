import { motion } from 'framer-motion';
import { useState } from 'react';
import type { TarotCard } from '../../types';

interface TarotCardViewProps {
  card: TarotCard;
  size?: 'sm' | 'md' | 'lg';
  showMeaning?: boolean;
}

const sizeClasses = {
  sm: 'w-20 h-32 sm:w-28 sm:h-44',
  md: 'w-28 h-44 sm:w-40 sm:h-64',
  lg: 'w-40 h-64 sm:w-52 sm:h-80',
};

export function TarotCardView({ card, size = 'md', showMeaning = false }: TarotCardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className={`perspective-1000 ${sizeClasses[size]} cursor-pointer`} onClick={() => setIsFlipped(!isFlipped)}>
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 backface-hidden rounded-xl border-2 overflow-hidden
            dark:border-mtps-gold/40 dark:bg-gradient-to-br dark:from-mtps-purple dark:to-mtps-deep
            border-mtps-accent-alt/30 bg-gradient-to-br from-white to-mtps-surface-light
            shadow-lg hover:shadow-xl transition-shadow
            ${card.isReversed ? 'rotate-180' : ''}`}
        >
          {/* Card decorative frame */}
          <div className="absolute inset-2 border dark:border-mtps-gold/20 border-mtps-accent-alt/15 rounded-lg" />
          
          {/* Card number */}
          <div className="absolute top-3 left-3 text-xs font-display dark:text-mtps-gold text-mtps-purple font-bold">
            {card.isMajor ? toRoman(card.number) : card.number}
          </div>

          {/* Card content */}
          <div className="flex flex-col items-center justify-center h-full px-3 py-8 text-center">
            {/* Archetype symbol */}
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

            {/* Keywords */}
            <div className="mt-2 flex flex-wrap gap-0.5 justify-center">
              {card.keywords.slice(0, 2).map((kw) => (
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

        {/* Back */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 overflow-hidden
            dark:border-mtps-gold/40 dark:bg-gradient-to-br dark:from-mtps-card dark:to-mtps-purple
            border-mtps-accent-alt/30 bg-gradient-to-br from-mtps-surface-light to-white
            shadow-lg p-4"
        >
          <div className="h-full flex flex-col justify-between overflow-y-auto">
            <div>
              <h4 className="font-display text-xs font-bold dark:text-mtps-gold text-mtps-purple mb-1">
                {card.name}
              </h4>
              <p className="text-[10px] dark:text-mtps-accent-alt text-mtps-violet italic mb-2">
                Archetype: {card.archetype}
              </p>
            </div>

            {showMeaning && (
              <div className="space-y-2">
                <div>
                  <p className="text-[9px] font-semibold dark:text-mtps-teal text-emerald-600 mb-0.5">
                    Upright
                  </p>
                  <p className="text-[9px] dark:text-mtps-text text-mtps-text-light leading-relaxed">
                    {card.meaningUp}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold dark:text-mtps-ember text-red-500 mb-0.5">
                    Reversed
                  </p>
                  <p className="text-[9px] dark:text-mtps-text text-mtps-text-light leading-relaxed">
                    {card.meaningReversed}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-auto pt-2 flex flex-wrap gap-0.5">
              {card.keywords.map((kw) => (
                <span
                  key={kw}
                  className="text-[7px] px-1 py-0.5 rounded
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
    </div>
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
