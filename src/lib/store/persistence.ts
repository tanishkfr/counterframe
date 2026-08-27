import type { Database, LanguageCode, Session } from "../types";

/**
 * Local persistence for the classroom demo. Everything lives in localStorage
 * under versioned keys, which keeps the demo working offline and makes
 * "reset demo data" a one-line operation.
 *
 * This module is the only place that touches storage. Replacing it with a real
 * API client means implementing the same four functions.
 */

export const DB_KEY = "counterframe.db.v1";
export const SESSION_KEY = "counterframe.session.v1";
export const PREFS_KEY = "counterframe.prefs.v1";

export interface Preferences {
  theme: "light" | "dark" | "system";
  language: LanguageCode;
  showAnnotations: boolean;
  syncScroll: boolean;
  /** Mirrors the OS setting by default; the explicit toggle overrides it. */
  reduceMotion: "system" | "always";
}

export const defaultPreferences: Preferences = {
  theme: "system",
  language: "en",
  showAnnotations: false,
  syncScroll: false,
  reduceMotion: "system",
};

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // Private browsing, blocked site data, or corrupt JSON. Fall back to seed.
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or blocked storage. The session continues in memory.
  }
}

export const loadDatabase = () => read<Database>(DB_KEY);
export const saveDatabase = (db: Database) => write(DB_KEY, db);

export const loadSession = () => read<Session>(SESSION_KEY);
export const saveSession = (session: Session | null) => {
  if (typeof window === "undefined") return;
  try {
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};

export const loadPreferences = (): Preferences => ({
  ...defaultPreferences,
  ...(read<Partial<Preferences>>(PREFS_KEY) ?? {}),
});
export const savePreferences = (prefs: Preferences) => write(PREFS_KEY, prefs);

export function clearAll(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DB_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Sessions last a week; an expired one is treated as signed out. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function isSessionValid(session: Session | null, now: number): boolean {
  if (!session) return false;
  return new Date(session.expiresAt).getTime() > now;
}
