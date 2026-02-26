import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Sparkles, Menu, X, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '../../context/TutorialContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/configure', label: 'Configure' },
  { to: '/generate', label: 'Generate' },
  { to: '/verify', label: 'Verify' },
];

export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { startPageTour } = useTutorial();

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-mtps-gold group-hover:animate-glow transition-all" />
            <span className="font-display text-lg font-bold gradient-text">
              MTPS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${location.pathname === link.to
                    ? 'dark:bg-mtps-violet/30 dark:text-mtps-gold bg-mtps-accent-alt/15 text-mtps-purple font-semibold'
                    : 'dark:text-mtps-silver dark:hover:bg-mtps-purple/20 text-mtps-muted hover:bg-mtps-border-light'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={startPageTour}
              className="p-2 rounded-lg dark:text-mtps-muted dark:hover:text-mtps-gold dark:hover:bg-mtps-purple/20
                text-gray-400 hover:text-mtps-violet hover:bg-gray-100
                transition-all"
              aria-label="Start tutorial"
              title="Tutorial"
              data-testid="tutorial-btn"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>
            <ThemeToggle />
            <button
              className="md:hidden p-2 dark:text-mtps-silver text-mtps-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t dark:border-mtps-border border-mtps-border-light"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${location.pathname === link.to
                      ? 'dark:bg-mtps-violet/30 dark:text-mtps-gold bg-mtps-accent-alt/15 text-mtps-purple'
                      : 'dark:text-mtps-silver dark:hover:bg-mtps-purple/20 text-mtps-muted hover:bg-mtps-border-light'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
