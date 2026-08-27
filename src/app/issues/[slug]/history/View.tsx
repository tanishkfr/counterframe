"use client";

import { IssueChrome, IssueNotFound, useIssue } from "@/components/issue/IssueChrome";
import { Notice } from "@/components/primitives";
import { PanelDecisionList } from "@/components/transparency/PanelDecisionList";
import { RevisionTimeline } from "@/components/transparency/RevisionTimeline";
import { issueDecisions, issueRevisions } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";

export function View({ slug }: { slug: string }) {
  const issue = useIssue(slug);
  const { db } = useStore();

  if (!issue) return <IssueNotFound slug={slug} />;

  const revisions = issueRevisions(db, issue.id);
  const decisions = issueDecisions(db, issue.id);
  const corrections = revisions.filter((r) => r.entity === "correction");

  return (
    <IssueChrome issue={issue}>
      <div style={{ marginBlockStart: "var(--s-6)", maxWidth: "56rem" }}>
        <Notice>
          <strong>What can and cannot change.</strong> The source articles — their text, outlet,
          author, dates, type and canonical URL — are immutable. Nobody, in any role, can edit them
          through Counterframe. Everything below is material Counterframe itself wrote: neutral
          summaries, framing labels, tags, notes, corrections, translations, annotations and funding
          descriptions.
        </Notice>

        {corrections.length > 0 && (
          <section style={{ marginBlockStart: "var(--s-6)" }}>
            <div className="section-head">
              <h2>Corrections</h2>
              <p className="meta">{corrections.length} published</p>
            </div>
            <p className="meta" style={{ marginBlockEnd: "var(--s-4)" }}>
              Corrections are published at the top of the history rather than folded into the
              timeline, and are also appended to the affected article record where a reader will
              actually see them.
            </p>
            <RevisionTimeline revisions={corrections} />
          </section>
        )}

        <section style={{ marginBlockStart: "var(--s-7)" }}>
          <div className="section-head">
            <h2>Edits</h2>
            <p className="meta">{revisions.length} revisions</p>
          </div>
          <RevisionTimeline revisions={revisions} />
        </section>

        <section style={{ marginBlockStart: "var(--s-7)" }} id="decisions">
          <div className="section-head">
            <h2>Panel decisions</h2>
            <p className="meta">{decisions.length} recorded</p>
          </div>
          <PanelDecisionList decisions={decisions} />
        </section>
      </div>
    </IssueChrome>
  );
}
