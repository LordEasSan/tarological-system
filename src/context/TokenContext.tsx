/**
 * TokenContext — client-side GitHub Models token management.
 *
 * Provides:
 *   - `token`       — current token (null if not set)
 *   - `setToken(t)` — validate + persist
 *   - `clearToken()` — remove from storage + state
 *   - `isTokenValid` — basic format validation result
 *
 * Storage: localStorage key "mtps_user_token"
 * Security: token is NEVER logged, never sent anywhere except GitHub Models API.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

// ─── Constants ──────────────────────────────────────

const STORAGE_KEY = 'mtps_user_token';

// ─── Validation ─────────────────────────────────────

/** Basic format check — GitHub PATs, fine-grained tokens, or Models tokens */
export function isValidTokenFormat(token: string): boolean {
  if (!token || token.trim().length === 0) return false;
  const t = token.trim();
  // Classic Personal Access Token
  if (/^ghp_[A-Za-z0-9]{36,}$/.test(t)) return true;
  // Fine-grained PAT
  if (/^github_pat_[A-Za-z0-9_]{20,}$/.test(t)) return true;
  // Fallback: at least 30 chars alphanumeric (generic)
  if (t.length >= 30 && /^[A-Za-z0-9_-]+$/.test(t)) return true;
  return false;
}

// ─── Context ────────────────────────────────────────

interface TokenContextValue {
  token: string | null;
  setToken: (token: string) => boolean;
  clearToken: () => void;
  isTokenValid: boolean;
}

const TokenContext = createContext<TokenContextValue | undefined>(undefined);

// ─── Provider ───────────────────────────────────────

export function TokenProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isValidTokenFormat(stored)) return stored;
      // Clean up invalid stored tokens
      if (stored) localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable (private browsing, etc.)
    }
    return null;
  });

  const isTokenValid = token !== null && isValidTokenFormat(token);

  const setToken = useCallback((newToken: string): boolean => {
    const trimmed = newToken.trim();
    if (!isValidTokenFormat(trimmed)) return false;

    setTokenState(trimmed);
    try {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } catch {
      // localStorage unavailable — keep in memory only
    }
    return true;
  }, []);

  const clearToken = useCallback(() => {
    setTokenState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        const val = e.newValue;
        if (val && isValidTokenFormat(val)) {
          setTokenState(val);
        } else {
          setTokenState(null);
        }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <TokenContext.Provider value={{ token, setToken, clearToken, isTokenValid }}>
      {children}
    </TokenContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────

export function useToken() {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error('useToken must be used within TokenProvider');
  return ctx;
}
