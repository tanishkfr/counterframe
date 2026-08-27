"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Notice } from "@/components/primitives";
import { useStore } from "@/lib/store/AppStore";

export function SignupView() {
  const { signUp, user, hydrated } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pseudonym, setPseudonym] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);

  if (hydrated && user) {
    return (
      <div className="shell page" style={{ maxWidth: "40rem" }}>
        <h1 className="title">You already have an account open</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          Signed in as {user.pseudonym}. Sign out from the masthead to create another.
        </p>
      </div>
    );
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = signUp({ email, password, pseudonym, region: region || undefined });
    if (result.ok) router.push("/settings");
    else setError({ message: result.error, field: result.field });
  };

  return (
    <div className="shell page" style={{ maxWidth: "34rem" }}>
      <p className="eyebrow">Account</p>
      <h1 className="title" style={{ marginBlockStart: "var(--s-3)" }}>
        Create an account
      </h1>

      <Notice tone="brass">
        <strong>Do not use a real password.</strong> Counterframe is a classroom prototype with no
        backend. What you type is stored in plain text in your own browser and nowhere else. Do not
        enter any personal information you would not put on a public page.
      </Notice>

      <form onSubmit={submit} noValidate style={{ marginBlockStart: "var(--s-5)" }}>
        <div className="field">
          <label className="field-label" htmlFor="signup-pseudonym">
            Public pseudonym
            <span className="field-hint">
              This is the only name shown anywhere on the platform. Real names are never required.
            </span>
          </label>
          <input
            id="signup-pseudonym"
            className="input"
            value={pseudonym}
            onChange={(e) => {
              setPseudonym(e.target.value);
              setError(null);
            }}
            aria-invalid={error?.field === "pseudonym"}
            aria-describedby={error?.field === "pseudonym" ? "signup-error" : undefined}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="signup-email">
            Email address
            <span className="field-hint">Used only as a sign-in identifier. Never displayed.</span>
          </label>
          <input
            id="signup-email"
            className="input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            aria-invalid={error?.field === "email"}
            aria-describedby={error?.field === "email" ? "signup-error" : undefined}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="signup-password">
            Password
            <span className="field-hint">At least 8 characters. Make one up for this demo.</span>
          </label>
          <div style={{ display: "flex", gap: "var(--s-2)" }}>
            <input
              id="signup-password"
              className="input"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              aria-invalid={error?.field === "password"}
              aria-describedby={error?.field === "password" ? "signup-error" : undefined}
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

        <div className="field">
          <label className="field-label" htmlFor="signup-region">
            Region <span className="field-hint">Optional. Shown on your public profile.</span>
          </label>
          <input
            id="signup-region"
            className="input"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>

        {error && (
          <p className="field-error" id="signup-error" role="alert">
            {error.message}
          </p>
        )}

        <p className="meta" style={{ marginBlockStart: "var(--s-4)" }}>
          New accounts get reader and contributor rights immediately: you can vote, publish takes
          after completing both articles, reply, propose issues, submit translations and record
          contributions. Moderator, panel and administrator roles are granted by an administrator
          and are never self-assigned.
        </p>

        <div className="btn-row" style={{ marginBlockStart: "var(--s-5)" }}>
          <button type="submit" className="btn" data-variant="primary">
            Create account
          </button>
          <Link href="/auth/login" className="btn">
            I already have one
          </Link>
        </div>
      </form>
    </div>
  );
}
