"use client";

import { Badge, Disclosure } from "@/components/primitives";
import { formatDateTime } from "@/lib/format";
import { REVISION_ENTITY_LABEL, ROLE_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store/AppStore";
import type { Revision } from "@/lib/types";

export function RevisionTimeline({ revisions }: { revisions: Revision[] }) {
  const { db } = useStore();

  if (revisions.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">No revisions recorded</p>
        <p>
          Nothing Counterframe wrote about this record has changed since it was first published.
          Source text and original source metadata are immutable and never appear here.
        </p>
      </div>
    );
  }

  return (
    <ol className="timeline">
      {revisions.map((revision) => {
        const editor = db.users.find((u) => u.id === revision.editorId);
        return (
          <li key={revision.id} id={revision.id}>
            <p className="timeline-time">
              {formatDateTime(revision.at)} · {revision.id}
            </p>
            <div
              style={{
                display: "flex",
                gap: "var(--s-2)",
                flexWrap: "wrap",
                alignItems: "center",
                marginBlock: "var(--s-2)",
              }}
            >
              <Badge tone="ink">{REVISION_ENTITY_LABEL[revision.entity]}</Badge>
              <Badge tone={revision.approval === "approved" ? "olive" : "brass"}>
                {revision.approval === "approved"
                  ? "Approved"
                  : revision.approval === "pending"
                    ? "Pending approval"
                    : "Automatic"}
              </Badge>
              {revision.panelDecisionId && (
                <a href={`#${revision.panelDecisionId}`} className="meta">
                  Panel decision {revision.panelDecisionId}
                </a>
              )}
            </div>

            <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--step-1)" }}>
              {revision.summary}
            </p>

            <dl className="definition-list" style={{ marginBlockStart: "var(--s-3)" }}>
              <dt>Editor</dt>
              <dd>
                {editor?.pseudonym ?? "Unknown"} · {ROLE_LABEL[revision.editorRole]}
              </dd>
              <dt>Reason</dt>
              <dd>{revision.reason}</dd>
              {revision.articleId && (
                <>
                  <dt>Source record</dt>
                  <dd>{revision.articleId}</dd>
                </>
              )}
            </dl>

            <div style={{ marginBlockStart: "var(--s-3)" }}>
              <Disclosure summary="Before and after" count={revision.changes.length}>
                {revision.changes.map((change, index) => (
                  <div key={index} style={{ marginBlockStart: "var(--s-3)" }}>
                    <p className="eyebrow">{change.field}</p>
                    <div className="diff">
                      <div className="diff-side" data-side="before">
                        <h5>
                          <span aria-hidden="true">−</span> Before
                        </h5>
                        {change.before === null ? (
                          <p style={{ color: "var(--ink-faint)" }}>Not previously set</p>
                        ) : (
                          <p>{change.before}</p>
                        )}
                      </div>
                      <div className="diff-side" data-side="after">
                        <h5>
                          <span aria-hidden="true">+</span> After
                        </h5>
                        {change.after === null ? (
                          <p style={{ color: "var(--ink-faint)" }}>Removed</p>
                        ) : (
                          <p>{change.after}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </Disclosure>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
