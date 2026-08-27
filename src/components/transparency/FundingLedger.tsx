"use client";

import { Badge, EmptyState, StatBlock } from "@/components/primitives";
import { formatDate, formatMoney } from "@/lib/format";
import { issueFunding, platformFunding } from "@/lib/funding";
import { FUNDING_CATEGORY_LABEL } from "@/lib/labels";
import { MONTHLY_BUDGET_USD } from "@/lib/seed";
import { useStore } from "@/lib/store/AppStore";

export function PlatformFundingSummary() {
  const { db } = useStore();
  const f = platformFunding(db);

  return (
    <div>
      <div className="grid-3">
        <StatBlock value={formatMoney(f.totalContributions)} label="Total contributions" />
        <StatBlock value={formatMoney(f.totalSpending)} label="Total spending" />
        <StatBlock value={formatMoney(f.balance)} label="Remaining balance" />
        <StatBlock value={formatMoney(MONTHLY_BUDGET_USD)} label="Monthly budget" />
        <StatBlock value={f.contributorCount} label="Contributors" />
        <StatBlock value={f.transactionCount} label="Ledger entries" />
      </div>

      <div className="grid-2" style={{ marginBlockStart: "var(--s-6)" }}>
        <section>
          <div className="section-head">
            <h3>Named and anonymous</h3>
          </div>
          <dl className="definition-list">
            <dt>Named total</dt>
            <dd>{formatMoney(f.namedTotal)}</dd>
            <dt>Anonymous total</dt>
            <dd>{formatMoney(f.anonymousTotal)}</dd>
          </dl>
          <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
            Amounts, dates and destinations are always published. Identity never is, unless the
            contributor chooses it. An anonymous contribution is counted in every total on this
            page and attributed to nobody.
          </p>
        </section>

        <section>
          <div className="section-head">
            <h3>Spending by category</h3>
          </div>
          <dl className="definition-list">
            {f.byCategory.map((row) => (
              <div key={row.category} style={{ display: "contents" }}>
                <dt>{FUNDING_CATEGORY_LABEL[row.category]}</dt>
                <dd style={{ fontVariantNumeric: "tabular-nums" }}>{formatMoney(row.amount)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}

export function IssueFundingSummary({ issueId }: { issueId: string }) {
  const { db } = useStore();
  const f = issueFunding(db, issueId);

  if (f.allocationCount === 0 && f.expenseCount === 0 && f.directContributions === 0) {
    return (
      <EmptyState title="No funding activity on this issue yet">
        Nothing has been allocated to or spent on this issue. When it is, every line will appear
        here with the panel decision that approved it and the receipt record behind it.
      </EmptyState>
    );
  }

  return (
    <div className="grid-3">
      <StatBlock value={formatMoney(f.allocated)} label="Allocated" />
      <StatBlock value={formatMoney(f.spent)} label="Spent" />
      <StatBlock value={formatMoney(f.remaining)} label="Remaining" />
      <StatBlock value={formatMoney(f.directContributions)} label="Direct contributions" />
    </div>
  );
}

export function ContributionLedger({ issueId }: { issueId?: string }) {
  const { db } = useStore();
  const rows = db.contributions
    .filter((c) => (issueId ? c.issueId === issueId : true))
    .sort((a, b) => b.at.localeCompare(a.at));

  if (rows.length === 0) {
    return (
      <EmptyState title="No contributions recorded">
        Nothing has been contributed here yet.
      </EmptyState>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data">
        <caption className="sr-only">Contributions ledger</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Contributor</th>
            <th scope="col">Destination</th>
            <th scope="col">Note</th>
            <th scope="col" style={{ textAlign: "right" }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td style={{ whiteSpace: "nowrap" }}>{formatDate(row.at)}</td>
              <td>
                {row.anonymous ? (
                  <Badge>Anonymous</Badge>
                ) : (
                  <span>{row.contributorPseudonym}</span>
                )}
              </td>
              <td>
                {row.destination === "platform"
                  ? "Platform"
                  : db.issues.find((i) => i.id === row.issueId)?.title.slice(0, 40) ?? "Issue"}
              </td>
              <td>{row.note ?? "—"}</td>
              <td className="num">{formatMoney(row.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ExpenseLedger({ issueId }: { issueId?: string }) {
  const { db } = useStore();
  const rows = db.expenses
    .filter((e) => (issueId ? e.issueId === issueId : true))
    .sort((a, b) => b.at.localeCompare(a.at));

  if (rows.length === 0) {
    return (
      <EmptyState title="No spending recorded">
        Nothing has been spent here yet.
      </EmptyState>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data">
        <caption className="sr-only">Spending ledger with receipts and approvals</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col">Receipt</th>
            <th scope="col">Approved by</th>
            <th scope="col" style={{ textAlign: "right" }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const receipt = db.receipts.find((r) => r.id === row.receiptId);
            return (
              <tr key={row.id}>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(row.at)}</td>
                <td>{FUNDING_CATEGORY_LABEL[row.category]}</td>
                <td>{row.description}</td>
                <td>
                  {receipt ? (
                    <span title={receipt.evidenceNote}>
                      {receipt.reference}
                      <span className="field-hint">{receipt.issuedBy}</span>
                    </span>
                  ) : (
                    <Badge tone="rust">Missing</Badge>
                  )}
                </td>
                <td>
                  <a href={`#${row.approvedByDecisionId}`}>{row.approvedByDecisionId}</a>
                </td>
                <td className="num">{formatMoney(row.amount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AllocationLedger({ issueId }: { issueId?: string }) {
  const { db } = useStore();
  const rows = db.allocations
    .filter((a) => (issueId ? a.issueId === issueId : true))
    .sort((a, b) => b.at.localeCompare(a.at));

  if (rows.length === 0) {
    return (
      <EmptyState title="No allocations recorded">
        The panel has not allocated any of the community pool here yet.
      </EmptyState>
    );
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {rows.map((row) => (
        <li
          key={row.id}
          style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
        >
          <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap", alignItems: "baseline" }}>
            <strong style={{ fontSize: "var(--step-2)", fontFamily: "var(--font-serif)" }}>
              {formatMoney(row.amount)}
            </strong>
            <span className="meta">{formatDate(row.at)}</span>
            <a href={`#${row.panelDecisionId}`} className="meta">
              Panel decision {row.panelDecisionId}
            </a>
            {row.revisionId && (
              <a href={`#${row.revisionId}`} className="meta">
                Revision {row.revisionId}
              </a>
            )}
          </div>
          <p style={{ marginBlockStart: "var(--s-2)" }}>{row.reason}</p>
        </li>
      ))}
    </ul>
  );
}
