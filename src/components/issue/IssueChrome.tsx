"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Badge, EmptyState } from "@/components/primitives";
import { formatDate } from "@/lib/format";
import { resolveContent } from "@/lib/i18n";
import { issueBySlug } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type { Issue } from "@/lib/types";

const STATUS_LABEL = {
  active: "Active",
  "under-review": "Under review",
  archived: "Archived",
} as const;

const STATUS_NOTE = {
  active: null,
  "under-review":
    "This issue is under panel review and is not yet published as a comparison. It is visible so readers can see what an issue looks like before publication.",
  archived:
    "This issue is archived. It remains readable, and can still receive corrections and metadata revisions through the ordinary transparent process.",
} as const;

export function useIssue(slug: string): Issue | undefined {
  const { db } = useStore();
  return issueBySlug(db, slug);
}

export function IssueNotFound({ slug }: { slug: string }) {
  return (
    <div className="shell page">
      <EmptyState
        title="No issue with that address"
        action={<Link href="/explore" className="btn" data-variant="primary">Browse all issues</Link>}
      >
        Counterframe has no issue at <code>{slug}</code>. It may have been merged into another
        issue, or the link may be mistyped. Archived issues stay readable, so a working link never
        disappears.
      </EmptyState>
    </div>
  );
}

/** Shared header and tab bar across the four issue routes. */
export function IssueChrome({ issue, children }: { issue: Issue; children: ReactNode }) {
  const { db, prefs, user, toggleSavedIssue, hydrated } = useStore();
  const pathname = usePathname();
  const [framingOpen, setFramingOpen] = useState(false);
  const base = `/issues/${issue.slug}`;

  const title = resolveContent(db, "issue", issue.id, "title", prefs.language, issue.title);
  const summary = resolveContent(db, "issue", issue.id, "summary", prefs.language, issue.summary);

  const saved = db.savedIssues.some((s) => s.userId === user?.id && s.issueId === issue.id);
  const statusNote = STATUS_NOTE[issue.status];

  const tabs = [
    { href: base, label: "Comparison" },
    { href: `${base}/community`, label: "Discussion" },
    { href: `${base}/history`, label: "History" },
    { href: `${base}/funding`, label: "Funding" },
  ];

  return (
    <div className="shell page">
      <header className="issue-header">
        {/* Region, countries and topics are the same kind of information, so
            they share one row instead of bracketing the title with two. */}
        <div className="issue-taxonomy">
          <p className="eyebrow">
            {issue.region} · {issue.countries.join(", ")}
          </p>
          <div className="chip-row">
            {issue.topics.map((topic) => (
              <Link
                key={topic}
                href={`/explore?topic=${encodeURIComponent(topic)}`}
                className="chip"
                style={{ textDecoration: "none" }}
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>

        <h1 className="issue-title" lang={prefs.language}>
          {title.text}
        </h1>

        {title.fellBack && (
          <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
            No approved Hindi translation of this title yet. English is shown.
          </p>
        )}

        <div className="issue-meta-row">
          <Badge tone={issue.status === "active" ? "olive" : "brass"}>
            {STATUS_LABEL[issue.status]}
          </Badge>
          <span>Events {formatDate(issue.eventStart)} – {formatDate(issue.eventEnd)}</span>
          <span className="dot-sep">Updated {formatDate(issue.updatedAt)}</span>
          {hydrated && user && (
            <button
              type="button"
              className="btn"
              data-variant="quiet"
              aria-pressed={saved}
              onClick={() => toggleSavedIssue(issue.id)}
            >
              {saved ? "Saved to My reading" : "Save to My reading"}
            </button>
          )}
        </div>

        <p
          id="issue-framing"
          className={`lede${framingOpen ? "" : " lede-clamp"}`}
          style={{ marginBlockStart: "var(--s-4)" }}
          lang={prefs.language}
        >
          {summary.text}
        </p>
        <button
          type="button"
          className="lede-toggle"
          aria-expanded={framingOpen}
          aria-controls="issue-framing"
          onClick={() => setFramingOpen((v) => !v)}
        >
          {framingOpen ? "Show less" : "Read the full framing"}
        </button>

        {summary.credit && (
          <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
            Hindi translation by {summary.credit}, reviewed and approved by the panel.
          </p>
        )}

        {statusNote && (
          <div className="notice" data-tone="brass" style={{ marginBlockStart: "var(--s-4)" }}>
            {statusNote}
          </div>
        )}

      </header>

      <nav className="tablist" aria-label="Issue sections" style={{ marginBlockStart: "var(--s-3)" }}>
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="tab"
            aria-current={pathname === tab.href ? "page" : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}

/** Panel's written justification that the two panes genuinely contrast. */
export function ContrastRationale({ issue }: { issue: Issue }) {
  const { db, prefs } = useStore();
  const rationale = resolveContent(
    db,
    "issue",
    issue.id,
    "contrastRationale",
    prefs.language,
    issue.contrastRationale,
  );

  return (
    <section aria-labelledby="contrast-heading" style={{ maxWidth: "58rem" }}>
      <h2 id="contrast-heading" className="eyebrow">
        Why these sources contrast
      </h2>
      <p style={{ marginBlockStart: "var(--s-3)" }} lang={prefs.language}>
        {rationale.text}
      </p>
      <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
        Panel verdict on the pairing: <strong>{issue.contrastVerdict}</strong>. Counterframe
        publishes pairings it judges to be converging or insufficiently contrasting rather than
        forcing them into opposition —{" "}
        <Link href="/education/how-a-pairing-is-chosen">how a pairing is chosen</Link>.
      </p>
    </section>
  );
}
