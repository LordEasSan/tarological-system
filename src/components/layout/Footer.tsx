import { Github, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t dark:border-mtps-border border-mtps-border-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-display text-sm font-semibold gradient-text">
              Meta-Tarological Positivist System
            </p>
            <p className="text-xs dark:text-mtps-muted text-mtps-muted mt-1">
              A formal framework for parameterised tarot generation with LTL verification
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/LordEasSan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs dark:text-mtps-silver text-mtps-muted
                hover:text-mtps-gold transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="https://lordeassan.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs dark:text-mtps-silver text-mtps-muted
                hover:text-mtps-gold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Main Site
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t dark:border-mtps-border/50 border-mtps-border-light/50 text-center">
          <p className="text-xs dark:text-mtps-muted/60 text-mtps-muted/60">
            &copy; {new Date().getFullYear()} MTPS. Built with React, TypeScript, Tailwind CSS &amp; Cloudflare Workers.
          </p>
        </div>
      </div>
    </footer>
  );
}
