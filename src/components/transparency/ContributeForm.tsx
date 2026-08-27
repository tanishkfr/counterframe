"use client";

import Link from "next/link";
import { useState } from "react";

import { Notice } from "@/components/primitives";
import { can } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { useStore } from "@/lib/store/AppStore";

const PRESETS = [10, 25, 50, 100];

/**
 * A complete contribution experience with no payment integration. Nothing is
 * charged, no card details are requested, and the form says so in the place a
 * real form would ask for them.
 */
export function ContributeForm({ issueId }: { issueId?: string }) {
  const { user, contribute, hydrated } = useStore();
  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [note, setNote] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState("");

  if (!hydrated) return null;

  if (!user || !can(user, "contribute-funds")) {
    return (
      <Notice tone="brass">
        <strong>An account is needed to record a contribution.</strong>{" "}
        <Link href="/auth/login">Sign in</Link> or <Link href="/auth/signup">create one</Link>.
        Reading the ledger is open to everyone, signed in or not.
      </Notice>
    );
  }

  const effective = custom ? Number(custom) : amount;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(effective) || effective <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    contribute({
      amount: Math.round(effective),
      anonymous,
      destination: issueId ? "issue" : "platform",
      issueId,
      note: note.trim() || undefined,
    });
    setDone(Math.round(effective));
    setNote("");
    setCustom("");
    setError("");
  };

  if (done !== null) {
    return (
      <Notice tone="olive">
        <strong>Recorded: {formatMoney(done)}.</strong> This is a simulated contribution. No payment
        was taken and no payment details were requested. The entry is now in the public ledger
        below, with its amount, date and destination visible and{" "}
        {anonymous ? "no identity attached" : `attributed to ${user.pseudonym}`}.{" "}
        <button type="button" className="btn" data-variant="link" onClick={() => setDone(null)}>
          Record another
        </button>
      </Notice>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <Notice>
        <strong>Simulated funding.</strong> Counterframe is a classroom prototype. This form never
        asks for card or bank details and never takes a payment. It exists so the transparency
        behaviour around contributions can be inspected end to end.
      </Notice>

      <fieldset style={{ border: 0, padding: 0, marginBlockStart: "var(--s-4)" }}>
        <legend className="field-label">Amount</legend>
        <div className="chip-row">
          {PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={!custom && amount === value}
              onClick={() => {
                setAmount(value);
                setCustom("");
              }}
            >
              {formatMoney(value)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="field-label" htmlFor="contrib-custom">
          Or another amount (USD)
        </label>
        <input
          id="contrib-custom"
          className="input"
          type="number"
          min={1}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          aria-invalid={Boolean(error)}
          style={{ maxWidth: "12rem" }}
        />
        {error && <p className="field-error">{error}</p>}
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        <span>
          Contribute anonymously.
          <span className="field-hint">
            The amount, date and destination are published either way. Only your pseudonym is
            withheld.
          </span>
        </span>
      </label>

      <div className="field">
        <label className="field-label" htmlFor="contrib-note">
          Note <span className="field-hint">Optional, published with the ledger entry</span>
        </label>
        <input
          id="contrib-note"
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button type="submit" className="btn" data-variant="primary">
        Record simulated contribution
      </button>
    </form>
  );
}
