import { motion } from 'framer-motion';
import type { PlacedCard, SymbolicRole } from '../../types';
import { TarotCardView } from './TarotCardView';

interface SpreadVisualizerProps {
  spread: PlacedCard[];
  className?: string;
  /** Map of card id → SymbolicRole for visual affordances */
  roleMap?: Record<string, SymbolicRole>;
}

export function SpreadVisualizer({ spread, className = '', roleMap }: SpreadVisualizerProps) {
  return (
    <div className={`relative w-full aspect-[4/3] sm:aspect-[16/10] ${className}`}>
      {spread.map((placed, i) => (
        <motion.div
          key={placed.card.id}
          className="absolute"
          style={{
            left: `${placed.position.x}%`,
            top: `${placed.position.y}%`,
            transform: `translate(-50%, -50%) rotate(${placed.position.rotation}deg)`,
          }}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.5, ease: 'easeOut' }}
        >
          {/* Position label */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] font-display font-semibold px-2 py-0.5 rounded-full
              dark:bg-mtps-gold/20 dark:text-mtps-gold-light
              bg-mtps-accent-alt/15 text-mtps-purple">
              {placed.position.label}
            </span>
          </div>
          <TarotCardView
            card={placed.card}
            size="sm"
            showMeaning
            role={roleMap?.[placed.card.id]}
          />
        </motion.div>
      ))}
    </div>
  );
}
