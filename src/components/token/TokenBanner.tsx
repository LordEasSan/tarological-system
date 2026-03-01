/**
 * TokenBanner — non-intrusive banner shown when no token is configured.
 * Prompts the user to enter their GitHub Models token.
 */

import { Key } from 'lucide-react';

interface TokenBannerProps {
  onOpenModal: () => void;
}

export function TokenBanner({ onOpenModal }: TokenBannerProps) {
  return (
    <div className="w-full px-4 py-2.5 flex items-center justify-center gap-3
      dark:bg-mtps-accent/10 dark:border-b dark:border-mtps-accent/20
      bg-amber-50 border-b border-amber-200">
      <Key className="w-3.5 h-3.5 dark:text-mtps-accent text-amber-600 flex-shrink-0" />
      <p className="text-xs dark:text-mtps-accent text-amber-700">
        Enter your GitHub Models token to enable AI-powered readings.
      </p>
      <button
        onClick={onOpenModal}
        className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-md
          dark:bg-mtps-accent/20 dark:text-mtps-accent dark:hover:bg-mtps-accent/30
          bg-amber-200 text-amber-800 hover:bg-amber-300
          transition-all"
      >
        Set Token
      </button>
    </div>
  );
}
