"use client";

import Link from "next/link";

import {
  Badge,
  EmptyState,
  Notice,
  ReadingBadge,
  StanceBadge,
  StatBlock,
} from "@/components/primitives";
import { formatDate, formatDateTime } from "@/lib/format";
import { ROLE_LABEL, STANCE_SHORT } from "@/lib/labels";
import { isPubliclyVisible, userByPseudonym } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";

export function ProfileView({ username }: { username: string }) {
  const { db, user: viewer } = useStore();
  const profile = userByPseudonym(db, username);

  if (!profile) {
    return (
      <div className="shell page">
        <EmptyState
          title="No profile with that pseudonym"
          action={
            <Link href="/community" className="btn" data-variant="primary">
              Back to Community
            </Link>
          }
        >
          Counterframe has no member called <strong>{username}</strong>. Pseudonyms are the only
          public identity here, and they are not reused.
        </EmptyState>
      </div>
    );
  }

  const isSelf = viewer?.id === profile.id;
  const panelMember = db.panelMembers.find((m) => m.id === profile.panelMemberId);

  const takes = db.takes.filter(
    (t) => t.userId === profile.id && (isPubliclyVisible(t.moderationState) || isSelf),
  );
  const replies = db.replies.filter(
    (r) => r.userId === profile.id && (isPubliclyVisible(r.moderationState) || isSelf),
  );
  const votes = db.stanceVotes.filter(
    (v) => v.userId === profile.id && (v.publicProfile || isSelf),
  );
  const changes = db.stanceChanges
    .filter((c) => c.userId === profile.id)
    .sort((a, b) => b.at.localeCompare(a.at));
  const completions = db.readingProgress.filter(
    (p) => p.userId === profile.id && p.state === "completed",
  );
  const approvedTranslations = db.translations.filter(
    (t) => t.submittedBy === profile.id && t.status === "panel-approved",
  );
  const namedContributions = db.contributions.filter((c) => c.userId === profile.id);

  const showStanceHistory = profile.privacy.publicStanceHistory || isSelf;
  const showReading = profile.privacy.publicReadingHistory || isSelf;

  return (
    <div className="shell page">
      <header className="page-head">
        <p className="eyebrow">Member</p>
        <h1 className="display">{profile.pseudonym}</h1>
        <div
          style={{
            display: "flex",
            gap: "var(--s-2)",
            flexWrap: "wrap",
            alignItems: "center",
            marginBlockStart: "var(--s-4)",
          }}
        >
          {profile.roles.map((role) => (
            <Badge key={role} tone={role === "reader" ? "neutral" : "ink"}>
              {ROLE_LABEL[role]}
            </Badge>
          ))}
          {profile.region && <span className="meta">{profile.region}</span>}
          <span className="meta dot-sep">Member since {formatDate(profile.createdAt)}</span>
        </div>
        {profile.bio && (
          <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
            {profile.bio}
          </p>
        )}
        {isSelf && (
          <p className="meta" style={{ marginBlockStart: "var(--s-4)" }}>
            This is your public profile.{" "}
            <Link href="/settings">Change what appears here →</Link>
          </p>
        )}
      </header>

      {panelMember && (
        <section style={{ marginBlockEnd: "var(--s-7)" }}>
          <div className="section-head">
            <h2>Editorial panel</h2>
            <Link href={`/transparency#${panelMember.id}`} className="meta">
              Full panel record →
            </Link>
          </div>
          <dl className="definition-list">
            <dt>Role</dt>
            <dd>{panelMember.role}</dd>
            <dt>Region</dt>
            <dd>
              {panelMember.region} · {panelMember.country}
            </dd>
            <dt>Term</dt>
            <dd>
              {formatDate(panelMember.selectedAt)} – {formatDate(panelMember.termEndsAt)}
            </dd>
            <dt>Affiliations</dt>
            <dd>{panelMember.affiliations.join("; ") || "None declared"}</dd>
            <dt>Conflicts</dt>
            <dd>{panelMember.conflicts.join("; ")}</dd>
          </dl>
        </section>
      )}

      <div className="grid-3" style={{ marginBlockEnd: "var(--s-7)" }}>
        <StatBlock value={takes.length} label="Takes" />
        <StatBlock value={replies.length} label="Replies" />
        <StatBlock value={showReading ? completions.length : "—"} label="Articles completed" />
        <StatBlock value={approvedTranslations.length} label="Approved translations" />
      </div>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Current stances</h2>
        </div>
        {votes.length === 0 ? (
          <EmptyState title="No public stances">
            {profile.privacy.showInVoterLists
              ? "This member has not recorded a stance yet."
              : "This member's votes are counted in every total but are not attributed publicly."}
          </EmptyState>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {votes.map((vote) => {
              const issue = db.issues.find((i) => i.id === vote.issueId);
              return (
                <li
                  key={vote.id}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
                >
                  <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                    <StanceBadge stance={vote.stance} />
                    <span className="meta">{formatDateTime(vote.updatedAt)}</span>
                  </div>
                  <p className="subtitle" style={{ marginBlockStart: "var(--s-2)" }}>
                    {issue ? <Link href={`/issues/${issue.slug}`}>{issue.title}</Link> : vote.issueId}
                  </p>
                  {vote.reasoning && (
                    <p className="meta" style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>
                      {vote.reasoning}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Stance history</h2>
        </div>
        {!showStanceHistory ? (
          <Notice>
            This member has not made their stance timeline public. Counterframe keeps the timeline
            either way — publishing it is opt-in, because a record of someone changing their mind
            can be used against them.
          </Notice>
        ) : changes.length === 0 ? (
          <EmptyState title="No stance changes recorded">
            This member has not changed a stance.
          </EmptyState>
        ) : (
          <ol className="timeline">
            {changes.map((change) => {
              const issue = db.issues.find((i) => i.id === change.issueId);
              return (
                <li key={change.id}>
                  <p className="timeline-time">{formatDateTime(change.at)}</p>
                  <p style={{ marginBlockStart: "var(--s-2)" }}>
                    {change.from ? STANCE_SHORT[change.from] : "No stance"} →{" "}
                    <strong>{STANCE_SHORT[change.to]}</strong>
                    {issue && (
                      <>
                        {" on "}
                        <Link href={`/issues/${issue.slug}`}>{issue.title}</Link>
                      </>
                    )}
                  </p>
                  {change.reasoning && (
                    <p className="meta" style={{ marginBlockStart: "var(--s-2)", maxWidth: "58ch" }}>
                      {change.reasoning}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {showReading && (
        <section style={{ marginBlockEnd: "var(--s-7)" }}>
          <div className="section-head">
            <h2>Reading</h2>
          </div>
          {completions.length === 0 ? (
            <EmptyState title="No completed articles">
              This member has not completed an article yet.
            </EmptyState>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {completions.map((entry) => {
                const article = db.articles.find((a) => a.id === entry.articleId);
                if (!article) return null;
                return (
                  <li
                    key={entry.articleId}
                    style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-3)" }}
                  >
                    <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                      <ReadingBadge state={entry.state} />
                      <span className="meta">{article.metadata.outlet}</span>
                    </div>
                    <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "56ch" }}>
                      {article.metadata.originalHeadline}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Takes</h2>
        </div>
        {takes.length === 0 ? (
          <EmptyState title="No published takes">
            This member has not published a take.
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
                    <StanceBadge stance={take.stance} />
                    <span className="meta">{formatDateTime(take.createdAt)}</span>
                  </div>
                  <p className="subtitle" style={{ marginBlockStart: "var(--s-2)" }}>
                    <Link href={`/issues/${issue?.slug ?? ""}/community#${take.id}`}>
                      {take.title}
                    </Link>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {approvedTranslations.length > 0 && (
        <section style={{ marginBlockEnd: "var(--s-7)" }}>
          <div className="section-head">
            <h2>Translation credits</h2>
          </div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {approvedTranslations.map((translation) => (
              <li
                key={translation.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-3)" }}
              >
                <Badge tone="olive">Panel-approved</Badge>{" "}
                <span className="meta">
                  {translation.targetType} · {translation.targetId} ·{" "}
                  {translation.language === "hi" ? "Hindi" : "English"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {namedContributions.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Named contributions</h2>
          </div>
          <p className="meta" style={{ marginBlockEnd: "var(--s-3)" }}>
            Only contributions this member chose to attach their pseudonym to appear here.
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {namedContributions.map((contribution) => (
              <li
                key={contribution.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-3)" }}
              >
                <span className="meta">{formatDate(contribution.at)}</span> ·{" "}
                {contribution.destination === "platform" ? "Platform" : "Issue"}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
