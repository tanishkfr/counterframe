"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Badge,
  EmptyState,
  ModerationBadge,
  Notice,
  ProgressBar,
  ReadingBadge,
  StanceBadge,
  StatBlock,
} from "@/components/primitives";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { STANCE_SHORT, TRANSLATION_STATUS_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store/AppStore";

export function MyReadingView() {
  const { db, user, hydrated, toggleSavedIssue, submitAppeal } = useStore();

  if (!hydrated) {
    return (
      <div className="shell page">
        <p className="meta">Loading your reading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="shell page">
        <EmptyState
          title="Sign in to see your reading"
          action={
            <Link href="/auth/login" className="btn" data-variant="primary">
              Sign in
            </Link>
          }
        >
          Reading progress, stances and contributions are tied to an account. Browsing every issue,
          every panel decision and the full funding ledger stays open without one.
        </EmptyState>
      </div>
    );
  }

  const progress = db.readingProgress.filter((p) => p.userId === user.id);
  const saved = db.savedIssues.filter((s) => s.userId === user.id);
  const votes = db.stanceVotes.filter((v) => v.userId === user.id);
  const changes = db.stanceChanges
    .filter((c) => c.userId === user.id)
    .sort((a, b) => b.at.localeCompare(a.at));
  const takes = db.takes.filter((t) => t.userId === user.id);
  const replies = db.replies.filter((r) => r.userId === user.id);
  const translations = db.translations.filter((t) => t.submittedBy === user.id);
  const contributions = db.contributions.filter((c) => c.userId === user.id);
  const myAppeals = db.appeals.filter((a) => a.userId === user.id);

  const actionsOnMyContent = db.moderationActions.filter((action) =>
    [...takes, ...replies].some((c) => c.id === action.targetId),
  );

  return (
    <div className="shell page">
      <header className="page-head">
        <p className="eyebrow">My reading</p>
        <h1 className="display">{user.pseudonym}</h1>
        <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
          <Link href={`/profile/${encodeURIComponent(user.pseudonym)}`}>
            See your public profile
          </Link>{" "}
          ·{" "}
          <Link href="/settings">Privacy settings</Link>
        </p>
      </header>

      <div className="grid-3" style={{ marginBlockEnd: "var(--s-7)" }}>
        <StatBlock value={progress.filter((p) => p.state === "completed").length} label="Articles completed" />
        <StatBlock value={progress.filter((p) => p.state === "in-progress").length} label="In progress" />
        <StatBlock value={votes.length} label="Current stances" />
        <StatBlock value={takes.length} label="Takes published" />
        <StatBlock value={replies.length} label="Replies" />
        <StatBlock value={formatMoney(contributions.reduce((s, c) => s + c.amount, 0))} label="Contributed" />
      </div>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Saved issues</h2>
          <p className="meta">{saved.length}</p>
        </div>
        {saved.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            action={
              <Link href="/explore" className="btn" data-variant="primary">
                Browse issues
              </Link>
            }
          >
            Save an issue from its header to keep it here. Saved issues are private to you.
          </EmptyState>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {saved.map((entry) => {
              const issue = db.issues.find((i) => i.id === entry.issueId);
              if (!issue) return null;
              return (
                <li
                  key={entry.issueId}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
                >
                  <h3 className="subtitle">
                    <Link href={`/issues/${issue.slug}`}>{issue.title}</Link>
                  </h3>
                  <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                    Saved {formatDate(entry.at)}
                  </p>
                  <button
                    type="button"
                    className="btn"
                    data-variant="quiet"
                    onClick={() => toggleSavedIssue(issue.id)}
                    style={{ marginBlockStart: "var(--s-2)" }}
                  >
                    Remove from saved
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Reading progress</h2>
          <p className="meta">{progress.length} articles opened</p>
        </div>
        {progress.length === 0 ? (
          <EmptyState title="You have not opened an article yet">
            Reading progress is recorded once you open an article pane.
          </EmptyState>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {progress.map((entry) => {
              const article = db.articles.find((a) => a.id === entry.articleId);
              const issue = db.issues.find((i) => i.id === article?.issueId);
              if (!article) return null;
              return (
                <li
                  key={entry.articleId}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
                >
                  <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                    <ReadingBadge state={entry.state} />
                    <span className="meta">{article.metadata.outlet}</span>
                    {entry.completedAt && (
                      <span className="meta dot-sep">
                        Completed {formatDateTime(entry.completedAt)}
                      </span>
                    )}
                  </div>
                  <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "56ch" }}>
                    {issue ? (
                      <Link href={`/issues/${issue.slug}`}>{article.metadata.originalHeadline}</Link>
                    ) : (
                      article.metadata.originalHeadline
                    )}
                  </p>
                  <div style={{ marginBlockStart: "var(--s-3)", maxWidth: "22rem" }}>
                    <ProgressBar
                      value={entry.furthestFraction}
                      label={`Progress through ${article.metadata.outlet}`}
                    />
                    <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                      {Math.round(entry.furthestFraction * 100)}% · {Math.round(entry.dwellMs / 1000)}s
                      with the article open
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Stances and how they changed</h2>
          <p className="meta">{changes.length} changes recorded</p>
        </div>
        <Notice>
          Your stance timeline is kept in full. Whether it is <strong>publicly visible</strong> on
          your profile is opt-in, and currently{" "}
          <strong>{user.privacy.publicStanceHistory ? "on" : "off"}</strong> —{" "}
          <Link href="/settings">change it in settings</Link>.
        </Notice>

        {votes.length === 0 ? (
          <div style={{ marginBlockStart: "var(--s-4)" }}>
            <EmptyState title="No stance recorded yet">
              Open an issue and use &ldquo;Where do you stand?&rdquo; to record one. You can change
              it at any time.
            </EmptyState>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, marginBlockStart: "var(--s-4)" }}>
            {votes.map((vote) => {
              const issue = db.issues.find((i) => i.id === vote.issueId);
              const issueChanges = changes.filter((c) => c.issueId === vote.issueId);
              return (
                <li
                  key={vote.id}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
                >
                  <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                    <StanceBadge stance={vote.stance} />
                    <Badge>{vote.publicProfile ? "Listed publicly" : "Counted anonymously"}</Badge>
                    <span className="meta">Updated {formatDateTime(vote.updatedAt)}</span>
                  </div>
                  <p className="subtitle" style={{ marginBlockStart: "var(--s-2)" }}>
                    {issue ? <Link href={`/issues/${issue.slug}`}>{issue.title}</Link> : vote.issueId}
                  </p>
                  {vote.reasoning && (
                    <p className="meta" style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>
                      {vote.reasoning}
                    </p>
                  )}
                  {issueChanges.length > 1 && (
                    <ol className="timeline" style={{ marginBlockStart: "var(--s-4)" }}>
                      {issueChanges.map((change) => (
                        <li key={change.id}>
                          <p className="timeline-time">{formatDateTime(change.at)}</p>
                          <p style={{ marginBlockStart: "var(--s-2)" }}>
                            {change.from ? STANCE_SHORT[change.from] : "No stance"} →{" "}
                            <strong>{STANCE_SHORT[change.to]}</strong>
                          </p>
                          {change.reasoning && (
                            <p className="meta" style={{ marginBlockStart: "var(--s-2)", maxWidth: "58ch" }}>
                              {change.reasoning}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }} id="takes">
        <div className="section-head">
          <h2>Your takes and replies</h2>
          <p className="meta">
            {takes.length} takes · {replies.length} replies
          </p>
        </div>
        {takes.length === 0 && replies.length === 0 ? (
          <EmptyState title="You have not published anything yet">
            Complete both primary articles on an issue, then publish a take from its discussion.
          </EmptyState>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {takes.map((take) => {
              const issue = db.issues.find((i) => i.id === take.issueId);
              return (
                <li
                  key={take.id}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
                >
                  <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                    <Badge tone="ink">Take</Badge>
                    <StanceBadge stance={take.stance} />
                    <ModerationBadge state={take.moderationState} />
                    <span className="meta">{formatDateTime(take.createdAt)}</span>
                  </div>
                  <p className="subtitle" style={{ marginBlockStart: "var(--s-2)" }}>
                    <Link href={`/issues/${issue?.slug ?? ""}/community#${take.id}`}>
                      {take.title}
                    </Link>
                  </p>
                  {take.moderationReason && (
                    <p className="meta" style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>
                      {take.moderationReason}
                    </p>
                  )}
                </li>
              );
            })}
            {replies.map((reply) => {
              const issue = db.issues.find((i) => i.id === reply.issueId);
              return (
                <li
                  key={reply.id}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
                >
                  <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                    <Badge>Reply</Badge>
                    <StanceBadge stance={reply.stance} />
                    <ModerationBadge state={reply.moderationState} />
                    <span className="meta">{formatDateTime(reply.createdAt)}</span>
                  </div>
                  <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>
                    <Link href={`/issues/${issue?.slug ?? ""}/community#${reply.id}`}>
                      {reply.body.slice(0, 140)}…
                    </Link>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }} id="appeals">
        <div className="section-head">
          <h2>Moderation and appeals</h2>
        </div>
        {actionsOnMyContent.length === 0 && myAppeals.length === 0 ? (
          <EmptyState title="No moderation actions on your content">
            Nothing you have published has been acted on. If that changes, the action, its reason
            and your right to appeal appear here.
          </EmptyState>
        ) : (
          <>
            {actionsOnMyContent.map((action) => {
              const appealed = myAppeals.some((a) => a.actionId === action.id);
              return (
                <ActionRow
                  key={action.id}
                  actionId={action.id}
                  targetId={action.targetId}
                  kind={action.kind}
                  reason={action.reason}
                  at={action.at}
                  appealed={appealed}
                  onAppeal={(body) => submitAppeal(action.id, action.targetId, body)}
                />
              );
            })}
            {myAppeals.map((appeal) => (
              <div
                key={appeal.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
              >
                <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                  <Badge tone={appeal.status === "upheld" ? "olive" : "brass"}>
                    Appeal {appeal.status}
                  </Badge>
                  <span className="meta">{formatDateTime(appeal.at)}</span>
                </div>
                <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>{appeal.body}</p>
                {appeal.decisionNote && (
                  <p className="meta" style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>
                    <strong>Outcome:</strong> {appeal.decisionNote}
                  </p>
                )}
              </div>
            ))}
          </>
        )}
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Translations</h2>
          <p className="meta">{translations.length} submitted</p>
        </div>
        {translations.length === 0 ? (
          <EmptyState title="No translations submitted">
            Contributors can submit translations of Counterframe&rsquo;s own material from the panel
            page. Approved translations are credited to the translator by pseudonym.
          </EmptyState>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {translations.map((translation) => (
              <li
                key={translation.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
              >
                <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                  <Badge tone={translation.status === "panel-approved" ? "olive" : "brass"}>
                    {TRANSLATION_STATUS_LABEL[translation.status]}
                  </Badge>
                  <span className="meta">
                    {translation.targetType} · {translation.targetId}
                  </span>
                  <span className="meta dot-sep">{formatDate(translation.submittedAt)}</span>
                </div>
                {translation.translatorCredit && (
                  <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                    Credited as {translation.translatorCredit}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>Contributions</h2>
          <p className="meta">{contributions.length} named entries</p>
        </div>
        {contributions.length === 0 ? (
          <EmptyState title="No named contributions">
            You have not recorded a named contribution. Anonymous contributions are counted in the
            public ledger and are deliberately not linked to any account, including here.
          </EmptyState>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {contributions.map((contribution) => (
              <li
                key={contribution.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)", display: "flex", justifyContent: "space-between", gap: "var(--s-3)" }}
              >
                <span>
                  {formatDate(contribution.at)} ·{" "}
                  {contribution.destination === "platform" ? "Platform" : "Issue"}
                </span>
                <strong style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatMoney(contribution.amount)}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ActionRow({
  actionId,
  targetId,
  kind,
  reason,
  at,
  appealed,
  onAppeal,
}: {
  actionId: string;
  targetId: string;
  kind: string;
  reason: string;
  at: string;
  appealed: boolean;
  onAppeal: (body: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  return (
    <div style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}>
      <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
        <Badge tone="rust">{kind.replace(/-/g, " ")}</Badge>
        <span className="meta">{formatDateTime(at)}</span>
        <span className="meta dot-sep">{targetId}</span>
      </div>
      <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>{reason}</p>

      {appealed ? (
        <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
          You have appealed this action. The panel reviews appeals, not the moderator who acted.
        </p>
      ) : !open ? (
        <button
          type="button"
          className="btn"
          onClick={() => setOpen(true)}
          style={{ marginBlockStart: "var(--s-3)" }}
        >
          Appeal this decision
        </button>
      ) : (
        <form
          noValidate
          style={{ marginBlockStart: "var(--s-3)", maxWidth: "38rem" }}
          onSubmit={(event) => {
            event.preventDefault();
            if (body.trim().length < 40) {
              setError("An appeal needs at least 40 characters explaining why the action was wrong.");
              return;
            }
            onAppeal(body.trim());
            setBody("");
            setOpen(false);
            setError("");
          }}
        >
          <div className="field">
            <label className="field-label" htmlFor={`appeal-${actionId}`}>
              Why should this be reconsidered?
            </label>
            <textarea
              id={`appeal-${actionId}`}
              className="textarea"
              style={{ minHeight: "6rem" }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-invalid={Boolean(error)}
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="btn-row" style={{ marginBlockStart: "var(--s-3)" }}>
            <button type="submit" className="btn" data-variant="primary">
              Submit appeal
            </button>
            <button type="button" className="btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
