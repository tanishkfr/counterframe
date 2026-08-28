"use client";

import Link from "next/link";

import { Badge, Disclosure, EmptyState, Notice, StatBlock } from "@/components/primitives";
import {
  buildChangeFeed,
  groupChangesByMonth,
  summariseChanges,
  type ChangeEvent,
} from "@/lib/changes";
import { formatDate, formatDateShort } from "@/lib/format";
import { useStore } from "@/lib/store/AppStore";

const MONTH = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-08" reads as "August 2026". */
function formatMonth(period: string): string {
  return MONTH.format(new Date(`${period}-01T00:00:00Z`));
}

const KIND_LABEL: Record<ChangeEvent["kind"], string> = {
  correction: "Correction",
  revision: "Edit",
  decision: "Panel",
  moderation: "Moderation",
  appeal: "Appeal",
  translation: "Translation",
  funding: "Funding",
  proposal: "Proposal",
  discussion: "Discussion",
};

export function ChangesView() {
  const { db } = useStore();
  const feed = buildChangeFeed(db);
  const months = groupChangesByMonth(feed);
  const summary = summariseChanges(feed);

  return (
    <div className="shell page">
      <header className="page-head">
        <p className="eyebrow">What changed</p>
        <h1 className="display">Developments, not everything</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          The transparency record keeps every event equally. That completeness is the point, and it
          is also the problem — an archive that treats a correction and a tag edit the same way
          tells you nothing about what mattered. This page ranks them.
        </p>
      </header>

      <div className="grid-3" style={{ marginBlockEnd: "var(--s-6)" }}>
        <StatBlock value={summary.major} label="Developments" />
        <StatBlock value={summary.minor} label="Routine entries" />
        <StatBlock value={summary.months} label="Months with activity" />
        <StatBlock
          value={summary.latestAt ? formatDate(summary.latestAt) : "—"}
          label="Most recent"
        />
      </div>

      <Notice>
        <strong>Nothing here is discarded.</strong> Routine entries — tag edits, funding lines,
        approved translations, new takes — are collapsed under each month and can be opened. A digest
        that quietly dropped events would be a worse failure on this platform than a long page.
      </Notice>

      {months.length === 0 ? (
        <div style={{ marginBlockStart: "var(--s-6)" }}>
          <EmptyState
            title="Nothing has changed yet"
            action={
              <Link href="/transparency" className="btn" data-variant="primary">
                Open the full record
              </Link>
            }
          >
            When an issue is corrected, a panel decision is taken, or a moderation call is made, it
            appears here immediately.
          </EmptyState>
        </div>
      ) : (
        <div style={{ marginBlockStart: "var(--s-5)" }}>
          {months.map((month) => (
            <section
              key={month.period}
              className="change-day"
              aria-labelledby={`period-${month.period}`}
            >
              <div className="change-day-head">
                <h2 id={`period-${month.period}`} className="change-date">
                  {formatMonth(month.period)}
                </h2>
                <p className="meta">
                  {month.major.length > 0 && (
                    <Badge tone="rust">
                      {month.major.length} development{month.major.length === 1 ? "" : "s"}
                    </Badge>
                  )}{" "}
                  {month.minor.length > 0 && `${month.minor.length} routine`}
                </p>
              </div>

              {month.major.length > 0 && (
                <ul className="change-list">
                  {month.major.map((event) => (
                    <ChangeRow key={`${event.kind}-${event.id}`} event={event} />
                  ))}
                </ul>
              )}

              {month.minor.length > 0 && (
                <div className="change-minor">
                  <Disclosure
                    summary={`${month.minor.length} routine ${
                      month.minor.length === 1 ? "entry" : "entries"
                    }`}
                  >
                    <ul className="change-list" style={{ marginBlockStart: "var(--s-3)" }}>
                      {month.minor.map((event) => (
                        <ChangeRow key={`${event.kind}-${event.id}`} event={event} />
                      ))}
                    </ul>
                  </Disclosure>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <p style={{ marginBlockStart: "var(--s-7)" }}>
        <Link href="/transparency" className="btn">
          Open the full transparency record
        </Link>
      </p>
    </div>
  );
}

function ChangeRow({ event }: { event: ChangeEvent }) {
  return (
    <li className="change" data-significance={event.significance}>
      <span className="change-kind">
        {formatDateShort(event.at)}
        <span className="change-kind-type">{KIND_LABEL[event.kind]}</span>
      </span>
      <div>
        <p className="change-title">
          {event.href ? <Link href={event.href}>{event.title}</Link> : event.title}
        </p>
        <p className="change-detail">{event.detail}</p>
      </div>
    </li>
  );
}
