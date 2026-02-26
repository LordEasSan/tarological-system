import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      onClick={toggleTheme}
      className="relative p-2 rounded-full transition-colors overflow-hidden
        dark:bg-mtps-purple/40 dark:hover:bg-mtps-violet/50
        bg-mtps-border-light hover:bg-mtps-accent-alt/20"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25 }}
            className="block"
          >
            <Sun className="w-5 h-5 text-mtps-gold" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25 }}
            className="block"
          >
            <Moon className="w-5 h-5 text-mtps-purple" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
