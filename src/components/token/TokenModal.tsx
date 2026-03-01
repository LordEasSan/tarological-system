/**
 * TokenModal — secure client-side GitHub Models token input.
 *
 * Uses Radix Dialog for accessibility.
 * Masked input, format validation, localStorage persistence via TokenContext.
 */

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Key, X, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToken, isValidTokenFormat } from '../../context/TokenContext';

interface TokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TokenModal({ open, onOpenChange }: TokenModalProps) {
  const { token, setToken, clearToken } = useToken();
  const [input, setInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setError(null);
    setSaved(false);
    const trimmed = input.trim();

    if (!trimmed) {
      setError('Token cannot be empty.');
      return;
    }

    if (!isValidTokenFormat(trimmed)) {
      setError('Invalid token format. Expected a GitHub PAT (ghp_…) or fine-grained token (github_pat_…).');
      return;
    }

    const ok = setToken(trimmed);
    if (ok) {
      setSaved(true);
      setInput('');
      setTimeout(() => onOpenChange(false), 600);
    } else {
      setError('Failed to save token.');
    }
  }

  function handleClear() {
    clearToken();
    setInput('');
    setError(null);
    setSaved(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[101] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2
            rounded-2xl p-6 shadow-2xl
            dark:bg-mtps-card dark:border dark:border-mtps-border
            bg-white border border-gray-200
            animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="flex items-center gap-2 text-base font-display font-semibold dark:text-mtps-gold text-mtps-purple">
              <Key className="w-4.5 h-4.5" />
              GitHub Models Token
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-lg p-1.5 dark:text-mtps-muted dark:hover:text-mtps-gold dark:hover:bg-mtps-purple/20
                  text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-xs dark:text-mtps-muted text-gray-500 mb-4 leading-relaxed">
            Enter your GitHub personal access token to enable AI-powered narrative generation.
            Your token is stored locally and only sent to the GitHub Models API.
          </Dialog.Description>

          {/* Current status */}
          {token && (
            <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg
              dark:bg-mtps-void/50 bg-green-50 border dark:border-mtps-border border-green-200">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 dark:text-mtps-accent text-green-600" />
                <span className="dark:text-mtps-accent text-green-700 font-medium">Token configured</span>
                <span className="dark:text-mtps-muted text-gray-400 font-mono">
                  {token.slice(0, 8)}…{token.slice(-4)}
                </span>
              </div>
              <button
                onClick={handleClear}
                className="text-[10px] uppercase tracking-wider font-medium
                  dark:text-red-400 dark:hover:text-red-300 text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {/* Input */}
          <div className="relative mb-3">
            <input
              type={showToken ? 'text' : 'password'}
              value={input}
              onChange={e => { setInput(e.target.value); setError(null); setSaved(false); }}
              onKeyDown={handleKeyDown}
              placeholder="ghp_xxxxxxxxxxxx…"
              autoComplete="off"
              spellCheck={false}
              className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm font-mono
                dark:bg-mtps-void dark:text-mtps-text dark:border-mtps-border dark:placeholder:text-mtps-muted/40
                bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-300
                border focus:outline-none focus:ring-2 focus:ring-mtps-accent/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded
                dark:text-mtps-muted dark:hover:text-mtps-gold text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showToken ? 'Hide token' : 'Show token'}
            >
              {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 mb-3 text-xs dark:text-red-400 text-red-600">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Success */}
          {saved && (
            <div className="flex items-center gap-2 mb-3 text-xs dark:text-mtps-accent text-green-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Token saved successfully.
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-5">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded-lg text-xs font-medium
                dark:bg-mtps-void dark:text-mtps-silver dark:hover:bg-mtps-purple/30
                bg-gray-100 text-gray-600 hover:bg-gray-200
                border dark:border-mtps-border border-gray-200 transition-all">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={!input.trim()}
              className="px-4 py-2 rounded-lg text-xs font-medium
                bg-gradient-to-r from-mtps-accent to-mtps-accent-alt text-mtps-void
                hover:from-mtps-accent-alt hover:to-mtps-accent
                disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Save Token
            </button>
          </div>

          {/* Security note */}
          <p className="mt-4 text-[10px] dark:text-mtps-muted/60 text-gray-400 leading-relaxed">
            Your token is stored in your browser's localStorage and is only transmitted to
            the GitHub Models inference API. It is never logged, tracked, or sent elsewhere.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
