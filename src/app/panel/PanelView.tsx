"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge, EmptyState, Notice, StatBlock } from "@/components/primitives";
import { can } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { PROPOSAL_STATUS_LABEL, TRANSLATION_STATUS_LABEL } from "@/lib/labels";
import { openProposals, pendingTranslations, userById } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type { IssueProposal } from "@/lib/types";

export function PanelView() {
  const { db, user, hydrated, decideProposal, reviewTranslation, decideAppeal } = useStore();

  if (!hydrated) {
    return (
      <div className="shell page">
        <p className="meta">Loading panel tools…</p>
      </div>
    );
  }

  if (!user || !can(user, "panel-review")) {
    return (
      <div className="shell page">
        <EmptyState
          title="Panel tools require panel access"
          action={
            <Link href="/transparency#panel" className="btn" data-variant="primary">
              See the public panel record
            </Link>
          }
        >
          Everything the panel decides is published. The tools that produce those decisions are
          restricted to panel members. Sign in as the demo panel account to see them.
        </EmptyState>
      </div>
    );
  }

  const proposals = openProposals(db);
  const translations = pendingTranslations(db);
  const suggestions = db.educationSuggestions.filter((s) => s.status === "submitted");
  const appeals = db.appeals.filter((a) => a.status === "submitted" || a.status === "under-review");
  const member = db.panelMembers.find((m) => m.id === user.panelMemberId);

  return (
    <div className="shell page">
      <header className="page-head">
        <p className="eyebrow">Panel</p>
        <h1 className="display">Editorial queue</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          Everything decided here is published immediately to the transparency record, with the
          reasoning attached and the decider named.
        </p>
        {member && (
          <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
            Acting as {member.name} · {member.role}. Declared conflicts:{" "}
            {member.conflicts.join("; ")}
          </p>
        )}
      </header>

      <Notice tone="brass">
        <strong>What the panel cannot do.</strong> Source text and original source metadata are
        immutable in the data model. There is no panel tool to edit them, and any code path that
        attempted it would throw rather than silently succeed.
      </Notice>

      <div className="grid-3" style={{ marginBlock: "var(--s-6) var(--s-7)" }}>
        <StatBlock value={proposals.length} label="Proposals awaiting decision" />
        <StatBlock value={translations.length} label="Translations in review" />
        <StatBlock value={suggestions.length} label="Education suggestions" />
        <StatBlock value={appeals.length} label="Appeals awaiting review" />
      </div>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Issue proposals</h2>
          <p className="meta">{proposals.length} open</p>
        </div>
        {proposals.length === 0 ? (
          <EmptyState title="The proposal queue is empty">
            Every proposal has been decided. Past decisions stay in the{" "}
            <Link href="/transparency#proposals">public archive</Link>.
          </EmptyState>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {proposals.map((proposal) => (
              <ProposalRow
                key={proposal.id}
                proposal={proposal}
                proposer={userById(db, proposal.userId)?.pseudonym ?? "Unknown"}
                onDecide={decideProposal}
              />
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Translation review</h2>
          <p className="meta">{translations.length} pending</p>
        </div>
        <p className="meta" style={{ marginBlockEnd: "var(--s-4)", maxWidth: "48rem" }}>
          Only panel-approved translations are shown to readers. Drafts and unreviewed submissions
          stay here. Approving a translation credits the submitter by pseudonym.
        </p>
        {translations.length === 0 ? (
          <EmptyState title="No translations awaiting review">
            Nothing is in the translation queue.
          </EmptyState>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {translations.map((translation) => (
              <li
                key={translation.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-5)" }}
              >
                <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                  <Badge tone="brass">{TRANSLATION_STATUS_LABEL[translation.status]}</Badge>
                  <span className="meta">
                    {translation.targetType} · {translation.targetId} ·{" "}
                    {translation.language === "hi" ? "Hindi" : "English"}
                  </span>
                  <span className="meta dot-sep">
                    {translation.submittedBy
                      ? userById(db, translation.submittedBy)?.pseudonym
                      : "Machine draft"}
                  </span>
                </div>

                <dl className="definition-list" style={{ marginBlockStart: "var(--s-3)" }}>
                  {Object.entries(translation.content).map(([key, value]) => (
                    <div key={key} style={{ display: "contents" }}>
                      <dt>{key}</dt>
                      <dd lang={translation.language} style={{ maxWidth: "60ch" }}>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <TranslationActions
                  fieldId={`tr-notes-${translation.id}`}
                  onReview={(outcome, notes) => reviewTranslation(translation.id, outcome, notes)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Appeals</h2>
          <p className="meta">{appeals.length} awaiting review</p>
        </div>
        <p className="meta" style={{ marginBlockEnd: "var(--s-4)", maxWidth: "48rem" }}>
          Appeals are decided by the panel, never by the moderator who took the action.
        </p>
        {appeals.length === 0 ? (
          <EmptyState title="No appeals awaiting review">
            Past appeals and their outcomes are on the{" "}
            <Link href="/transparency#moderation">public moderation record</Link>.
          </EmptyState>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {appeals.map((appeal) => (
              <li
                key={appeal.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
              >
                <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                  <Badge tone="brass">{appeal.status}</Badge>
                  <span className="meta">
                    {userById(db, appeal.userId)?.pseudonym} · {formatDate(appeal.at)}
                  </span>
                </div>
                <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>{appeal.body}</p>
                <AppealActions
                  fieldId={`appeal-note-${appeal.id}`}
                  onDecide={(outcome, note) => decideAppeal(appeal.id, outcome, note)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>Education suggestions</h2>
          <p className="meta">{suggestions.length} awaiting a decision</p>
        </div>
        {suggestions.length === 0 ? (
          <EmptyState title="No suggestions awaiting a decision">
            Decided suggestions are listed on the{" "}
            <Link href="/education#suggest">Education page</Link>.
          </EmptyState>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
              >
                <strong>{suggestion.topic}</strong>
                <p className="meta" style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>
                  {suggestion.rationale}
                </p>
                <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                  {userById(db, suggestion.userId)?.pseudonym} · {formatDate(suggestion.at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ProposalRow({
  proposal,
  proposer,
  onDecide,
}: {
  proposal: IssueProposal;
  proposer: string;
  onDecide: (
    id: string,
    status: IssueProposal["status"],
    note: string,
    rewrite?: string,
  ) => void;
}) {
  const [note, setNote] = useState("");
  const [rewrite, setRewrite] = useState(proposal.neutralRewrite ?? "");
  const [error, setError] = useState("");

  const decide = (status: IssueProposal["status"]) => {
    if (note.trim().length < 30) {
      setError("Every decision needs at least 30 characters of published reasoning.");
      return;
    }
    onDecide(proposal.id, status, note.trim(), rewrite.trim() || undefined);
    setNote("");
    setError("");
  };

  return (
    <li style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-5)" }}>
      <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
        <Badge tone="brass">{PROPOSAL_STATUS_LABEL[proposal.status]}</Badge>
        <span className="meta">{proposer}</span>
        <span className="meta dot-sep">{formatDate(proposal.submittedAt)}</span>
      </div>

      <h3 className="subtitle" style={{ marginBlockStart: "var(--s-3)", maxWidth: "44ch" }}>
        {proposal.question}
      </h3>
      <p style={{ marginBlockStart: "var(--s-3)", maxWidth: "62ch" }}>{proposal.rationale}</p>

      <dl className="definition-list" style={{ marginBlockStart: "var(--s-4)" }}>
        <dt>Region</dt>
        <dd>
          {proposal.region}
          {proposal.countries.length > 0 && ` · ${proposal.countries.join(", ")}`}
        </dd>
        <dt>Topic</dt>
        <dd>{proposal.topic}</dd>
        <dt>Dates</dt>
        <dd>
          {formatDate(proposal.dateRangeStart)} – {formatDate(proposal.dateRangeEnd)}
        </dd>
        <dt>Sources</dt>
        <dd>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {proposal.suggestedSources.map((s) => (
              <li key={s} style={{ overflowWrap: "anywhere" }}>
                {s}
              </li>
            ))}
          </ul>
        </dd>
        <dt>Disclosure</dt>
        <dd>{proposal.affiliationDisclosure}</dd>
      </dl>

      <div className="field" style={{ marginBlockStart: "var(--s-4)", maxWidth: "40rem" }}>
        <label className="field-label" htmlFor={`rewrite-${proposal.id}`}>
          Neutral rewrite <span className="field-hint">Optional. Published beside the original.</span>
        </label>
        <input
          id={`rewrite-${proposal.id}`}
          className="input"
          value={rewrite}
          onChange={(e) => setRewrite(e.target.value)}
        />
      </div>

      <div className="field" style={{ maxWidth: "40rem" }}>
        <label className="field-label" htmlFor={`note-${proposal.id}`}>
          Published reasoning
          <span className="field-hint">
            This text becomes the public decision summary, whatever the outcome.
          </span>
        </label>
        <textarea
          id={`note-${proposal.id}`}
          className="textarea"
          style={{ minHeight: "5rem" }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-invalid={Boolean(error)}
        />
        {error && <p className="field-error">{error}</p>}
      </div>

      <div className="btn-row" style={{ marginBlockStart: "var(--s-3)" }}>
        <button type="button" className="btn" data-variant="primary" onClick={() => decide("published")}>
          Publish
        </button>
        <button type="button" className="btn" onClick={() => decide("returned-for-clarification")}>
          Return for clarification
        </button>
        <button type="button" className="btn" onClick={() => decide("merged")}>
          Merge
        </button>
        <button type="button" className="btn" onClick={() => decide("rejected")}>
          Reject
        </button>
      </div>
    </li>
  );
}

function TranslationActions({
  fieldId,
  onReview,
}: {
  /** Unique per row: several of these render at once and ids must not collide. */
  fieldId: string;
  onReview: (outcome: "approved" | "returned" | "rejected", notes: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const act = (outcome: "approved" | "returned" | "rejected") => {
    if (notes.trim().length < 20) {
      setError("Record at least 20 characters of review notes.");
      return;
    }
    onReview(outcome, notes.trim());
    setNotes("");
    setError("");
  };

  return (
    <div style={{ marginBlockStart: "var(--s-3)", maxWidth: "40rem" }}>
      <div className="field">
        <label className="field-label" htmlFor={fieldId}>
          Review notes
        </label>
        <textarea
          id={fieldId}
          className="textarea"
          style={{ minHeight: "4rem" }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          aria-invalid={Boolean(error)}
        />
        {error && <p className="field-error">{error}</p>}
      </div>
      <div className="btn-row">
        <button type="button" className="btn" data-variant="primary" onClick={() => act("approved")}>
          Approve and credit translator
        </button>
        <button type="button" className="btn" onClick={() => act("returned")}>
          Return with notes
        </button>
        <button type="button" className="btn" onClick={() => act("rejected")}>
          Reject
        </button>
      </div>
    </div>
  );
}

function AppealActions({
  fieldId,
  onDecide,
}: {
  /** Unique per row: several of these render at once and ids must not collide. */
  fieldId: string;
  onDecide: (outcome: "upheld" | "overturned", note: string) => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const act = (outcome: "upheld" | "overturned") => {
    if (note.trim().length < 25) {
      setError("Record at least 25 characters of published reasoning.");
      return;
    }
    onDecide(outcome, note.trim());
    setNote("");
    setError("");
  };

  return (
    <div style={{ marginBlockStart: "var(--s-3)", maxWidth: "40rem" }}>
      <div className="field">
        <label className="field-label" htmlFor={fieldId}>
          Published reasoning
        </label>
        <textarea
          id={fieldId}
          className="textarea"
          style={{ minHeight: "4rem" }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-invalid={Boolean(error)}
        />
        {error && <p className="field-error">{error}</p>}
      </div>
      <div className="btn-row">
        <button type="button" className="btn" data-variant="primary" onClick={() => act("upheld")}>
          Uphold appeal and restore
        </button>
        <button type="button" className="btn" onClick={() => act("overturned")}>
          Reject appeal
        </button>
      </div>
    </div>
  );
}
