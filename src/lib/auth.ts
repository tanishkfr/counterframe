import type { Database, Role, Session, User } from "./types";
import { SESSION_TTL_MS } from "./store/persistence";

/**
 * LOCAL DEMO AUTHENTICATION
 * -------------------------
 * There is no backend. This module fakes exactly enough of a real auth flow to
 * exercise the product: sign-up, sign-in, sign-out, persisted sessions,
 * expiry, protected actions and friendly errors.
 *
 * It is deliberately isolated behind `AuthProvider` so a real provider can
 * replace it without touching any consumer. What is stored is an email, a
 * pseudonym and a demo password string in the browser's own storage. No
 * hashing is performed, because pretending to hash would be worse than being
 * clear that this is not security.
 *
 * Do not put a real credential anywhere in this repository.
 */

export interface AuthProvider {
  signIn(db: Database, email: string, password: string): AuthResult;
  signUp(db: Database, input: SignUpInput): AuthResult;
}

export interface SignUpInput {
  email: string;
  password: string;
  pseudonym: string;
  region?: string;
}

export type AuthResult =
  | { ok: true; session: Session; db: Database }
  | { ok: false; error: string; field?: "email" | "password" | "pseudonym" };

export const DEMO_PASSWORD = "counterframe";

function makeSession(userId: string): Session {
  const now = Date.now();
  return {
    userId,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignUp(db: Database, input: SignUpInput): AuthResult | null {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter an email address in the form name@example.com.", field: "email" };
  }
  if (db.users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, error: "An account already exists for this address. Try signing in instead.", field: "email" };
  }
  const pseudonym = input.pseudonym.trim();
  if (pseudonym.length < 3) {
    return { ok: false, error: "Your public pseudonym needs at least 3 characters.", field: "pseudonym" };
  }
  if (db.users.some((u) => u.pseudonym.toLowerCase() === pseudonym.toLowerCase())) {
    return { ok: false, error: "That pseudonym is taken. Pick another.", field: "pseudonym" };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "Use at least 8 characters. This is a local demo — do not reuse a real password.", field: "password" };
  }
  return null;
}

export const localAuthProvider: AuthProvider = {
  signIn(db, rawEmail, password) {
    const email = rawEmail.trim().toLowerCase();
    if (!email || !password) {
      return { ok: false, error: "Enter both an email address and a password." };
    }
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    // Same message for unknown account and wrong password: a sign-in form
    // should not confirm which addresses have accounts.
    const stored = db.credentials[user?.email ?? ""];
    if (!user || !stored || stored !== password) {
      return { ok: false, error: "That email and password do not match an account.", field: "password" };
    }
    return { ok: true, session: makeSession(user.id), db };
  },

  signUp(db, input) {
    const invalid = validateSignUp(db, input);
    if (invalid) return invalid;

    const email = input.email.trim().toLowerCase();
    const user: User = {
      id: `u-${Date.now().toString(36)}`,
      pseudonym: input.pseudonym.trim(),
      email,
      // New accounts get contributor rights immediately. Elevated roles are
      // granted by an administrator, never self-assigned.
      roles: ["reader", "contributor"],
      createdAt: new Date().toISOString(),
      region: input.region,
      languages: ["en"],
      privacy: {
        showInVoterLists: true,
        publicStanceHistory: false,
        publicReadingHistory: true,
        namedContributionsByDefault: false,
      },
    };
    const next: Database = {
      ...db,
      users: [...db.users, user],
      credentials: { ...db.credentials, [email]: input.password },
    };
    return { ok: true, session: makeSession(user.id), db: next };
  },
};

/* ------------------------------ permissions ----------------------------- */

export function hasRole(user: User | null, role: Role): boolean {
  return Boolean(user?.roles.includes(role));
}

export type Capability =
  | "vote"
  | "publish-take"
  | "reply"
  | "propose-issue"
  | "submit-translation"
  | "contribute-funds"
  | "moderate"
  | "panel-review"
  | "administer";

const CAPABILITY_ROLE: Record<Capability, Role> = {
  vote: "contributor",
  "publish-take": "contributor",
  reply: "contributor",
  "propose-issue": "contributor",
  "submit-translation": "contributor",
  "contribute-funds": "contributor",
  moderate: "moderator",
  "panel-review": "panel",
  administer: "admin",
};

export function can(user: User | null, capability: Capability): boolean {
  if (!user) return false;
  if (user.roles.includes("admin")) return true;
  return user.roles.includes(CAPABILITY_ROLE[capability]);
}

export function requireSignInMessage(capability: Capability): string {
  const verb: Record<Capability, string> = {
    vote: "record a stance",
    "publish-take": "publish a take",
    reply: "reply",
    "propose-issue": "propose an issue",
    "submit-translation": "submit a translation",
    "contribute-funds": "make a contribution",
    moderate: "use moderation tools",
    "panel-review": "use panel tools",
    administer: "use administration tools",
  };
  return `You need an account to ${verb[capability]}. Browsing is open to everyone.`;
}

export function sessionUser(db: Database, session: Session | null): User | null {
  if (!session) return null;
  return db.users.find((u) => u.id === session.userId) ?? null;
}
