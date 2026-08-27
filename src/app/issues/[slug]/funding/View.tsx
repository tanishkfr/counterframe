"use client";

import Link from "next/link";

import { IssueChrome, IssueNotFound, useIssue } from "@/components/issue/IssueChrome";
import { Notice } from "@/components/primitives";
import { ContributeForm } from "@/components/transparency/ContributeForm";
import {
  AllocationLedger,
  ContributionLedger,
  ExpenseLedger,
  IssueFundingSummary,
} from "@/components/transparency/FundingLedger";
import { PanelDecisionList } from "@/components/transparency/PanelDecisionList";
import { useStore } from "@/lib/store/AppStore";

export function View({ slug }: { slug: string }) {
  const issue = useIssue(slug);
  const { db } = useStore();

  if (!issue) return <IssueNotFound slug={slug} />;

  const decisions = db.panelDecisions.filter(
    (d) => d.kind === "funding-allocation" && d.relatedIssueId === issue.id,
  );

  return (
    <IssueChrome issue={issue}>
      <div style={{ marginBlockStart: "var(--s-6)", maxWidth: "60rem" }}>
        <Notice>
          The community votes on funding priorities; the panel executes the approved budget. Every
          line below carries the decision that approved it and a receipt record. Amounts, dates and
          destinations are always public. Contributor identity never is, unless the contributor
          chooses it.
        </Notice>

        <section style={{ marginBlockStart: "var(--s-6)" }}>
          <div className="section-head">
            <h2>Issue budget</h2>
            <Link href="/transparency#funding" className="meta">
              Platform-wide ledger →
            </Link>
          </div>
          <IssueFundingSummary issueId={issue.id} />
        </section>

        <section style={{ marginBlockStart: "var(--s-7)" }}>
          <div className="section-head">
            <h2>Allocations</h2>
          </div>
          <AllocationLedger issueId={issue.id} />
        </section>

        <section style={{ marginBlockStart: "var(--s-7)" }}>
          <div className="section-head">
            <h2>Spending</h2>
          </div>
          <ExpenseLedger issueId={issue.id} />
        </section>

        <section style={{ marginBlockStart: "var(--s-7)" }}>
          <div className="section-head">
            <h2>Contributions to this issue</h2>
          </div>
          <ContributionLedger issueId={issue.id} />
        </section>

        {decisions.length > 0 && (
          <section style={{ marginBlockStart: "var(--s-7)" }}>
            <div className="section-head">
              <h2>Approving decisions</h2>
            </div>
            <PanelDecisionList decisions={decisions} />
          </section>
        )}

        <section style={{ marginBlockStart: "var(--s-7)" }}>
          <div className="section-head">
            <h2>Contribute to this issue</h2>
          </div>
          <ContributeForm issueId={issue.id} />
        </section>
      </div>
    </IssueChrome>
  );
}
