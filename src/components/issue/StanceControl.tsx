"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge, Disclosure, Notice, StanceBadge } from "@/components/primitives";
import { formatDateTime, formatPercent } from "@/lib/format";
import { translate } from "@/lib/i18n";
import { STANCE_LABEL, STANCE_MARK, STANCE_SHORT } from "@/lib/labels";
import { can } from "@/lib/auth";
import { currentVote, publicVoters, stanceDistribution } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type { Issue, Stance } from "@/lib/types";

const OPTIONS: Stance[] = ["supports", "criticises", "undecided"];

export function StanceControl({ issue }: { issue: Issue }) {
  const { db, user, prefs, setStance, hydrated } = useStore();
  const t = (key: Parameters<typeof translate>[1]) => translate(prefs.language, key);

  const distribution = stanceDistribution(db, issue.id);
  const mine = currentVote(db, issue.id, user?.id ?? null);
  const voters = publicVoters(db, issue.id);

  const [draft, setDraft] = useState<Stance | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [showPublicly, setShowPublicly] = useState(true);

  useEffect(() => {
    if (mine) {
      setReasoning(mine.reasoning ?? "");
      setShowPublicly(mine.publicProfile);
    } else if (user) {
      setShowPublicly(user.privacy.showInVoterLists);
    }
  }, [mine, user]);

  const pending = draft ?? mine?.stance ?? null;
  const canVote = can(user, "vote");

  const submit = () => {
    if (!pending) return;
    setStance(issue.id, pending, reasoning.trim(), showPublicly);
    setDraft(null);
  };

  return (
    <section aria-labelledby="stance-heading" style={{ marginBlockStart: "var(--s-6)" }}>
      <div className="section-head">
        <h2 id="stance-heading">{t("stance.heading")}</h2>
        <p className="meta">
          {distribution.total} {distribution.total === 1 ? "person has" : "people have"} recorded a
          stance
        </p>
      </div>

      <Notice>{t("stance.note")}</Notice>

      <div className="stance-grid" style={{ marginBlockStart: "var(--s-4)" }}>
        {OPTIONS.map((stance) => {
          const selected = pending === stance;
          return (
            <button
              key={stance}
              type="button"
              className="stance-option"
              aria-pressed={selected}
              disabled={hydrated && !canVote}
              onClick={() => setDraft(stance)}
            >
              <span className="stance-option-name">
                <span className="badge-mark" aria-hidden="true">
                  {STANCE_MARK[stance]}
                </span>
                {STANCE_SHORT[stance]}
                {selected && (
                  <span className="sr-only"> (your current selection)</span>
                )}
              </span>
              <span className="meta">{STANCE_LABEL[stance]}</span>
              <span className="stance-option-count">
                {distribution.counts[stance]} · {formatPercent(distribution.fractions[stance])}
              </span>
            </button>
          );
        })}
      </div>

      {hydrated && !user && (
        <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
          <Link href="/auth/login">Sign in</Link> to record a stance. Browsing and reading are open
          to everyone.
        </p>
      )}

      {hydrated && canVote && (
        <div style={{ marginBlockStart: "var(--s-4)" }}>
          <div className="field">
            <label className="field-label" htmlFor="stance-reasoning">
              Your reasoning
              <span className="field-hint">
                Optional. Shown beside your pseudonym if you choose to appear in the voter list.
              </span>
            </label>
            <textarea
              id="stance-reasoning"
              className="textarea"
              style={{ minHeight: "5rem" }}
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="What moved you towards this position?"
            />
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={showPublicly}
              onChange={(e) => setShowPublicly(e.target.checked)}
            />
            <span>
              Show my pseudonym in the voter list.
              <span className="field-hint">
                Unchecked, your vote still counts in the totals above — it simply is not attributed
                to you anywhere.
              </span>
            </span>
          </label>

          <button
            type="button"
            className="btn"
            data-variant="primary"
            onClick={submit}
            disabled={!pending || (mine?.stance === pending && (mine?.reasoning ?? "") === reasoning.trim() && mine?.publicProfile === showPublicly)}
          >
            {mine ? t("stance.change") : "Record my stance"}
          </button>

          {mine && (
            <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
              Your current stance is <strong>{STANCE_SHORT[mine.stance]}</strong>, last changed{" "}
              {formatDateTime(mine.updatedAt)}. You can change it at any time, and every change is
              kept on your own stance timeline.
            </p>
          )}
        </div>
      )}

      <div style={{ marginBlockStart: "var(--s-5)" }}>
        <p className="eyebrow" style={{ marginBlockEnd: "var(--s-2)" }}>
          {t("stance.distribution")}
        </p>
        <div
          className="distribution"
          role="img"
          aria-label={`Community stance: ${distribution.counts.supports} supports, ${distribution.counts.criticises} criticises, ${distribution.counts.undecided} undecided or mixed, out of ${distribution.total} recorded stances.`}
        >
          <span
            className="dist-supports"
            style={{ flexBasis: `${distribution.fractions.supports * 100}%` }}
          />
          <span
            className="dist-criticises"
            style={{ flexBasis: `${distribution.fractions.criticises * 100}%` }}
          />
          <span
            className="dist-undecided"
            style={{ flexBasis: `${distribution.fractions.undecided * 100}%` }}
          />
        </div>
        <ul className="distribution-key">
          {OPTIONS.map((stance) => (
            <li key={stance}>
              <span
                className="key-swatch"
                style={{
                  background:
                    stance === "supports"
                      ? "var(--olive)"
                      : stance === "criticises"
                        ? "var(--rust)"
                        : "var(--rule-strong)",
                }}
                aria-hidden="true"
              />
              <span aria-hidden="true" className="badge-mark">
                {STANCE_MARK[stance]}
              </span>
              {STANCE_SHORT[stance]}: {distribution.counts[stance]}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBlockStart: "var(--s-5)" }}>
        <Disclosure summary="Who voted publicly" count={voters.length}>
          {voters.length === 0 ? (
            <p className="meta">
              Nobody has chosen to appear publicly on this issue. Their votes are still counted in
              the totals above.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--s-3)" }}>
              {voters.map(({ vote, user: voter }) => (
                <li key={vote.id} style={{ borderBlockStart: "1px solid var(--rule-hair)", paddingBlockStart: "var(--s-3)" }}>
                  <div style={{ display: "flex", gap: "var(--s-2)", alignItems: "center", flexWrap: "wrap" }}>
                    <Link href={`/profile/${encodeURIComponent(voter.pseudonym)}`}>
                      {voter.pseudonym}
                    </Link>
                    <StanceBadge stance={vote.stance} />
                    <span className="meta">{formatDateTime(vote.updatedAt)}</span>
                  </div>
                  {vote.reasoning && (
                    <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                      {vote.reasoning}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="meta" style={{ marginBlockStart: "var(--s-4)" }}>
            <Badge>{distribution.total - voters.length} hidden</Badge> People who chose not to
            appear here are still counted in every total on this page.
          </p>
        </Disclosure>
      </div>
    </section>
  );
}
