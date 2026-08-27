"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge, Notice } from "@/components/primitives";
import { DEMO_PASSWORD } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store/AppStore";

const DEMO_ACCOUNTS = [
  { email: "reader@counterframe.demo", pseudonym: "Meridian", note: "Reader and contributor. Starts mid-way through Viewpoint A so the posting gate is demonstrable." },
  { email: "moderator@counterframe.demo", pseudonym: "Halyard", note: "Moderator. Both articles already completed." },
  { email: "panel@counterframe.demo", pseudonym: "Adaeze N.", note: "Panel member and chair." },
  { email: "admin@counterframe.demo", pseudonym: "Ledger", note: "Administrator. Every role." },
];

export function LoginView() {
  const { signIn, user, hydrated, db } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const result = signIn(email, password);
    setBusy(false);
    if (result.ok) {
      router.push("/my-reading");
    } else {
      setError({ message: result.error, field: result.field });
    }
  };

  const fill = (value: string) => {
    setEmail(value);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  if (hydrated && user) {
    return (
      <div className="shell page" style={{ maxWidth: "40rem" }}>
        <h1 className="title">You are signed in</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          Signed in as <strong>{user.pseudonym}</strong> with{" "}
          {user.roles.map((r) => ROLE_LABEL[r]).join(", ").toLowerCase()} access.
        </p>
        <div className="btn-row" style={{ marginBlockStart: "var(--s-5)" }}>
          <Link href="/explore" className="btn" data-variant="primary">
            Browse issues
          </Link>
          <Link href="/my-reading" className="btn">
            My reading
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shell page">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "var(--s-7)", alignItems: "start" }}>
        <div style={{ maxWidth: "26rem" }}>
          <p className="eyebrow">Account</p>
          <h1 className="title" style={{ marginBlockStart: "var(--s-3)" }}>
            Sign in
          </h1>
          <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
            Reading everything on Counterframe is open, signed in or not. An account is needed to
            record a stance, publish a take, reply, propose an issue, submit a translation, or
            record a contribution.
          </p>

          <form onSubmit={submit} noValidate style={{ marginBlockStart: "var(--s-5)" }}>
            <div className="field">
              <label className="field-label" htmlFor="login-email">
                Email address
              </label>
              <input
                id="login-email"
                className="input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                aria-invalid={error?.field === "email"}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="login-password">
                Password
              </label>
              <div style={{ display: "flex", gap: "var(--s-2)" }}>
                <input
                  id="login-password"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  aria-invalid={error?.field === "password"}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="field-error" id="login-error" role="alert">
                {error.message}
              </p>
            )}

            <div className="btn-row" style={{ marginBlockStart: "var(--s-5)" }}>
              <button type="submit" className="btn" data-variant="primary" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <Link href="/auth/signup" className="btn">
                Create an account
              </Link>
            </div>
          </form>
        </div>

        <aside>
          <div className="section-head">
            <h2>Demo accounts</h2>
          </div>
          <Notice tone="brass">
            <strong>These are not secrets.</strong> Counterframe has no backend. The local auth
            adapter stores a pseudonym and a demo password string in your own browser. Nothing is
            transmitted anywhere, and nothing here should ever be a real password.
          </Notice>

          <p className="meta" style={{ marginBlock: "var(--s-4)" }}>
            Password for every demo account: <code>{DEMO_PASSWORD}</code>
          </p>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {DEMO_ACCOUNTS.map((account) => {
              const record = db.users.find((u) => u.email === account.email);
              return (
                <li
                  key={account.email}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
                >
                  <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                    <strong>{account.pseudonym}</strong>
                    {record?.roles.map((role) => (
                      <Badge key={role}>{ROLE_LABEL[role]}</Badge>
                    ))}
                  </div>
                  <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                    <code>{account.email}</code>
                  </p>
                  <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                    {account.note}
                  </p>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => fill(account.email)}
                    style={{ marginBlockStart: "var(--s-3)" }}
                  >
                    Fill this account
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
