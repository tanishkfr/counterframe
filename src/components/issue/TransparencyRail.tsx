"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/primitives";
import { Modal } from "@/components/primitives/Modal";
import { AllocationLedger, ContributionLedger, ExpenseLedger, IssueFundingSummary } from "@/components/transparency/FundingLedger";
import { PanelDecisionList } from "@/components/transparency/PanelDecisionList";
import { RevisionTimeline } from "@/components/transparency/RevisionTimeline";
import { formatDateTime, formatMoney } from "@/lib/format";
import { issueFunding } from "@/lib/funding";
import { issueDecisions, issueFundingActivity, issueRevisions } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type { Issue } from "@/lib/types";

const STATUS_LABEL = {
  active: "Active",
  "under-review": "Under review",
  archived: "Archived",
} as const;

/**
 * The transparency record is a product feature, not an admin afterthought, so
 * it is always visible: a persistent rail on wide screens, and a sticky
 * trigger opening a bottom sheet on narrow ones. Both open the same drawer.
 */
export function TransparencyRail({ issue }: { issue: Issue }) {
  const { db } = useStore();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<"edits" | "decisions" | "funding">("edits");

  const revisions = issueRevisions(db, issue.id);
  const decisions = issueDecisions(db, issue.id);
  const activity = issueFundingActivity(db, issue.id);
  const funding = issueFunding(db, issue.id);

  const latestEdit = revisions[0];
  const latestDecision = decisions[0];

  const openAt = (target: typeof section) => {
    setSection(target);
    setOpen(true);
  };

  return (
    <>
      <aside className="rail rail-desktop" aria-labelledby="rail-heading">
        <div className="rail-head">
          <h2 id="rail-heading" className="eyebrow" style={{ color: "var(--ink)" }}>
            Transparency
          </h2>
          <Badge tone={issue.status === "active" ? "olive" : "brass"}>
            {STATUS_LABEL[issue.status]}
          </Badge>
        </div>

        <div className="rail-section">
          <h3>At a glance</h3>
          <p className="rail-stat">
            <span>Revisions</span>
            <strong>{revisions.length}</strong>
          </p>
          <p className="rail-stat">
            <span>Panel decisions</span>
            <strong>{decisions.length}</strong>
          </p>
          <p className="rail-stat">
            <span>Funding entries</span>
            <strong>{activity.length}</strong>
          </p>
          <p className="rail-stat">
            <span>Last updated</span>
            <strong style={{ fontWeight: 400, fontSize: "var(--step--2)" }}>
              {formatDateTime(issue.updatedAt)}
            </strong>
          </p>
        </div>

        <div className="rail-section">
          <h3>Latest edit</h3>
          {latestEdit ? (
            <>
              <p>{latestEdit.summary}</p>
              <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                {formatDateTime(latestEdit.at)}
              </p>
              <button
                type="button"
                className="btn"
                data-variant="link"
                onClick={() => openAt("edits")}
                style={{ marginBlockStart: "var(--s-2)" }}
              >
                See before and after
              </button>
            </>
          ) : (
            <p className="meta">Nothing has been revised.</p>
          )}
        </div>

        <div className="rail-section">
          <h3>Latest panel decision</h3>
          {latestDecision ? (
            <>
              <p>{latestDecision.question}</p>
              <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                {latestDecision.outcome.replace(/-/g, " ")} · {formatDateTime(latestDecision.decidedAt)}
              </p>
              <button
                type="button"
                className="btn"
                data-variant="link"
                onClick={() => openAt("decisions")}
                style={{ marginBlockStart: "var(--s-2)" }}
              >
                See votes and reasoning
              </button>
            </>
          ) : (
            <p className="meta">No decisions recorded.</p>
          )}
        </div>

        <div className="rail-section">
          <h3>Funding snapshot</h3>
          <p className="rail-stat">
            <span>Allocated</span>
            <strong>{formatMoney(funding.allocated)}</strong>
          </p>
          <p className="rail-stat">
            <span>Spent</span>
            <strong>{formatMoney(funding.spent)}</strong>
          </p>
          <p className="rail-stat">
            <span>Remaining</span>
            <strong>{formatMoney(funding.remaining)}</strong>
          </p>
          <button
            type="button"
            className="btn"
            data-variant="link"
            onClick={() => openAt("funding")}
            style={{ marginBlockStart: "var(--s-2)" }}
          >
            Open the ledger
          </button>
        </div>

        <div className="rail-section">
          <button
            type="button"
            className="btn"
            style={{ width: "100%" }}
            onClick={() => openAt("edits")}
          >
            Open transparency record
          </button>
          <p style={{ marginBlockStart: "var(--s-3)" }}>
            <Link href={`/issues/${issue.slug}/history`} className="meta">
              Full history page →
            </Link>
          </p>
        </div>
      </aside>

      <div className="rail-mobile-trigger">
        <button
          type="button"
          className="btn"
          data-variant="primary"
          style={{ width: "100%" }}
          onClick={() => openAt("edits")}
        >
          Transparency record · {revisions.length} revisions, {decisions.length} decisions
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        variant="drawer"
        title="Transparency record"
      >
        <p className="meta">{issue.title}</p>

        <div
          className="tablist"
          role="tablist"
          aria-label="Transparency sections"
          style={{ marginBlockStart: "var(--s-4)" }}
        >
          {(
            [
              ["edits", `Edits (${revisions.length})`],
              ["decisions", `Panel decisions (${decisions.length})`],
              ["funding", `Funding (${activity.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              className="tab"
              aria-selected={section === key}
              aria-controls={`rail-panel-${key}`}
              id={`rail-tab-${key}`}
              onClick={() => setSection(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id="rail-panel-edits"
          aria-labelledby="rail-tab-edits"
          hidden={section !== "edits"}
          style={{ paddingBlockStart: "var(--s-5)" }}
        >
          <p className="meta" style={{ marginBlockEnd: "var(--s-4)" }}>
            Every change Counterframe has made to its own material on this issue, with the value
            before and after, who changed it, in what role, and why. Source text and original
            source metadata are immutable and never appear in this list.
          </p>
          <RevisionTimeline revisions={revisions} />
        </div>

        <div
          role="tabpanel"
          id="rail-panel-decisions"
          aria-labelledby="rail-tab-decisions"
          hidden={section !== "decisions"}
          style={{ paddingBlockStart: "var(--s-5)" }}
        >
          <PanelDecisionList decisions={decisions} />
        </div>

        <div
          role="tabpanel"
          id="rail-panel-funding"
          aria-labelledby="rail-tab-funding"
          hidden={section !== "funding"}
          style={{ paddingBlockStart: "var(--s-5)" }}
        >
          <IssueFundingSummary issueId={issue.id} />

          <section style={{ marginBlockStart: "var(--s-6)" }}>
            <div className="section-head">
              <h3>Allocations</h3>
            </div>
            <AllocationLedger issueId={issue.id} />
          </section>

          <section style={{ marginBlockStart: "var(--s-6)" }}>
            <div className="section-head">
              <h3>Spending</h3>
            </div>
            <ExpenseLedger issueId={issue.id} />
          </section>

          <section style={{ marginBlockStart: "var(--s-6)" }}>
            <div className="section-head">
              <h3>Contributions to this issue</h3>
            </div>
            <ContributionLedger issueId={issue.id} />
          </section>

          <p style={{ marginBlockStart: "var(--s-5)" }}>
            <Link href={`/issues/${issue.slug}/funding`}>Open the full funding page →</Link>
          </p>
        </div>
      </Modal>
    </>
  );
}
