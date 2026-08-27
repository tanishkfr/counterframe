"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge, EmptyState, Notice, StatBlock } from "@/components/primitives";
import { can } from "@/lib/auth";
import { formatDateTime, formatMoney } from "@/lib/format";
import { checkLedgerConsistency, platformFunding } from "@/lib/funding";
import { ROLE_LABEL } from "@/lib/labels";
import { ROLE_ORDER, type Role } from "@/lib/types";
import { userById } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";

export function AdminView() {
  const { db, user, hydrated, setUserRoles, resetDemoData } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!hydrated) {
    return (
      <div className="shell page">
        <p className="meta">Loading administration tools…</p>
      </div>
    );
  }

  if (!user || !can(user, "administer")) {
    return (
      <div className="shell page">
        <EmptyState
          title="Administration requires administrator access"
          action={
            <Link href="/transparency" className="btn" data-variant="primary">
              See the public transparency record
            </Link>
          }
        >
          Role management, records and the audit log are restricted. Sign in as the demo
          administrator account to see them.
        </EmptyState>
      </div>
    );
  }

  const consistency = checkLedgerConsistency(db);
  const funding = platformFunding(db);

  return (
    <div className="shell page">
      <header className="page-head">
        <p className="eyebrow">Administration</p>
        <h1 className="display">Platform administration</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          Role management, record integrity and the system audit log. Every action taken here is
          written to the audit log below.
        </p>
      </header>

      <Notice tone="brass">
        <strong>Development and demonstration controls.</strong> This page exists so a reviewer can
        inspect role behaviour and reset the demonstration. It is never surfaced in the public
        interface, and role switching is not available to ordinary accounts anywhere in the app.
      </Notice>

      <div className="grid-3" style={{ marginBlock: "var(--s-6) var(--s-7)" }}>
        <StatBlock value={db.users.length} label="Accounts" />
        <StatBlock value={db.issues.length} label="Issues" />
        <StatBlock value={db.articles.length} label="Source records" />
        <StatBlock value={db.revisions.length} label="Revisions" />
        <StatBlock value={formatMoney(funding.balance)} label="Ledger balance" />
        <StatBlock value={db.auditLog.length} label="Audit entries" />
      </div>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Record integrity</h2>
          <Badge tone={consistency.ok ? "olive" : "rust"}>
            {consistency.ok ? "All checks pass" : `${consistency.problems.length} problems`}
          </Badge>
        </div>
        <p className="meta" style={{ marginBlockEnd: "var(--s-4)", maxWidth: "48rem" }}>
          These invariants are checked live rather than only in tests, so a broken ledger is visible
          rather than silent: spending never exceeds contributions, named and anonymous totals sum
          correctly, no issue overspends its allocation, and every expense references a receipt that
          exists.
        </p>
        {consistency.ok ? (
          <Notice tone="olive">
            <strong>Ledger consistent.</strong> {formatMoney(funding.totalContributions)}{" "}
            contributed, {formatMoney(funding.totalSpending)} spent,{" "}
            {formatMoney(funding.balance)} remaining.
          </Notice>
        ) : (
          <Notice tone="rust">
            <ul style={{ paddingInlineStart: "1.2em" }}>
              {consistency.problems.map((problem, index) => (
                <li key={index}>{problem}</li>
              ))}
            </ul>
          </Notice>
        )}
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Source record immutability</h2>
        </div>
        <p style={{ maxWidth: "48rem" }}>
          There is deliberately no administrative tool to edit a source article. Outlet, author,
          dates, source type, canonical URL and quoted text are immutable in the data model, and the
          single enforcement point throws rather than silently dropping a disallowed change.
          Administrators can manage roles, settings and platform-authored records — not source
          material.
        </p>
        <div className="table-scroll" style={{ marginBlockStart: "var(--s-4)" }}>
          <table className="data">
            <caption className="sr-only">Source records and their editable status</caption>
            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Outlet</th>
                <th scope="col">Source text</th>
                <th scope="col">Platform additions</th>
                <th scope="col">Revisions</th>
              </tr>
            </thead>
            <tbody>
              {db.articles.map((article) => (
                <tr key={article.id}>
                  <td>{article.id}</td>
                  <td>{article.metadata.outlet}</td>
                  <td>
                    <Badge tone="ink">Immutable</Badge>
                  </td>
                  <td>
                    <Badge tone="brass">Versioned</Badge>
                  </td>
                  <td className="num">{article.revisionIds.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Accounts and roles</h2>
          <p className="meta">{db.users.length} accounts</p>
        </div>
        <p className="meta" style={{ marginBlockEnd: "var(--s-4)", maxWidth: "48rem" }}>
          Least privilege by default. Elevated roles are granted here and nowhere else, and every
          change is written to the audit log with the administrator&rsquo;s name.
        </p>
        <div className="table-scroll">
          <table className="data">
            <caption className="sr-only">Accounts and their assigned roles</caption>
            <thead>
              <tr>
                <th scope="col">Pseudonym</th>
                <th scope="col">Roles</th>
                <th scope="col">Grant or revoke</th>
              </tr>
            </thead>
            <tbody>
              {db.users.map((account) => (
                <tr key={account.id}>
                  <td>
                    <Link href={`/profile/${encodeURIComponent(account.pseudonym)}`}>
                      {account.pseudonym}
                    </Link>
                    {account.id === user.id && (
                      <span className="field-hint">This is you</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "var(--s-1)", flexWrap: "wrap" }}>
                      {account.roles.map((role) => (
                        <Badge key={role}>{ROLE_LABEL[role]}</Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="chip-row">
                      {ROLE_ORDER.map((role) => {
                        const has = account.roles.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            className="chip"
                            aria-pressed={has}
                            aria-label={`${has ? "Revoke" : "Grant"} ${ROLE_LABEL[role]} for ${account.pseudonym}`}
                            onClick={() =>
                              setUserRoles(
                                account.id,
                                has
                                  ? account.roles.filter((r) => r !== role)
                                  : ([...account.roles, role] as Role[]),
                              )
                            }
                          >
                            {ROLE_LABEL[role]}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>System audit log</h2>
          <p className="meta">{db.auditLog.length} entries</p>
        </div>
        {db.auditLog.length === 0 ? (
          <EmptyState title="No audit entries">Nothing has been recorded yet.</EmptyState>
        ) : (
          <div className="table-scroll">
            <table className="data">
              <caption className="sr-only">System audit log</caption>
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Actor</th>
                  <th scope="col">Action</th>
                  <th scope="col">Target</th>
                  <th scope="col">Detail</th>
                </tr>
              </thead>
              <tbody>
                {[...db.auditLog]
                  .sort((a, b) => b.at.localeCompare(a.at))
                  .map((entry) => (
                    <tr key={entry.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(entry.at)}</td>
                      <td>
                        {userById(db, entry.actorId)?.pseudonym ?? entry.actorId}
                        <span className="field-hint">{ROLE_LABEL[entry.actorRole]}</span>
                      </td>
                      <td>
                        <code>{entry.action}</code>
                      </td>
                      <td>
                        {entry.targetType} · {entry.targetId}
                      </td>
                      <td>{entry.detail}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>Demo data</h2>
        </div>
        <p style={{ maxWidth: "48rem" }}>
          All state lives in this browser&rsquo;s local storage. Resetting restores the seeded
          database exactly as shipped and signs you out. Nothing is transmitted anywhere, and no
          other user is affected.
        </p>
        {!confirmReset ? (
          <button
            type="button"
            className="btn"
            onClick={() => setConfirmReset(true)}
            style={{ marginBlockStart: "var(--s-4)" }}
          >
            Reset demo data…
          </button>
        ) : (
          <div style={{ marginBlockStart: "var(--s-4)" }}>
            <Notice tone="rust">
              <strong>This discards every change made in this browser</strong> — accounts created,
              takes published, stances recorded, moderation actions and contributions. It cannot be
              undone.
            </Notice>
            <div className="btn-row" style={{ marginBlockStart: "var(--s-3)" }}>
              <button
                type="button"
                className="btn"
                data-variant="primary"
                onClick={() => {
                  resetDemoData();
                  setConfirmReset(false);
                }}
              >
                Yes, reset to the seeded state
              </button>
              <button type="button" className="btn" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
