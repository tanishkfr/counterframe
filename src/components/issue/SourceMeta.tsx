"use client";

import { Fragment, useState, type ReactNode } from "react";

import { Badge, Notice, RubricMark } from "@/components/primitives";
import { Modal } from "@/components/primitives/Modal";
import { formatDate, hostname } from "@/lib/format";
import { FRAME_DESCRIPTION, FRAME_LABEL, SOURCE_TYPE_LABEL } from "@/lib/labels";
import type { SourceArticle, VerifiedField } from "@/lib/types";

/** Renders a metadata value together with how well it is established. */
export function Verified<T extends string>({
  field,
  fallback,
}: {
  field: VerifiedField<T>;
  fallback: string;
}) {
  if (field.value && field.state === "verified") {
    return <span>{field.value}</span>;
  }
  if (field.value && field.state === "needs-verification") {
    return (
      <span>
        {field.value}{" "}
        <Badge tone="brass" mark="?" title={field.note}>
          Needs verification
        </Badge>
      </span>
    );
  }
  return (
    <span style={{ color: "var(--ink-faint)" }}>
      {fallback}
      {field.note ? (
        <>
          {" "}
          <span className="sr-only">{field.note}</span>
        </>
      ) : null}
    </span>
  );
}

/**
 * The byline under every article headline.
 *
 * Established facts read as plain metadata, with the outlet carrying the
 * emphasis. Only something that needs the reader's attention — an
 * unestablished date, an absent author — becomes a badge. That way a badge in
 * this row always means "check this", instead of five identical chips where
 * nothing stands out.
 */
export function SourceMetaBar({ article }: { article: SourceArticle }) {
  const m = article.metadata;

  const facts: ReactNode[] = [
    <span key="outlet" className="source-meta-outlet">
      {m.outlet}
    </span>,
    <span key="type">{SOURCE_TYPE_LABEL[m.sourceType]}</span>,
    <span key="country">{m.outletCountry}</span>,
    m.publishedAt.value ? (
      <span key="date">{formatDate(m.publishedAt.value)}</span>
    ) : (
      <Badge key="date" tone="brass" mark="?">
        Date not established
      </Badge>
    ),
    m.author.value ? (
      <span key="author">{m.author.value}</span>
    ) : (
      <Badge key="author" tone="brass" mark="?" title={m.author.note}>
        No named author
      </Badge>
    ),
  ];

  return (
    <div className="source-meta">
      {facts.map((node, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span className="source-meta-sep" aria-hidden="true">
              ·
            </span>
          )}
          {node}
        </Fragment>
      ))}
    </div>
  );
}

export function SourceInspector({ article }: { article: SourceArticle }) {
  const [open, setOpen] = useState(false);
  const m = article.metadata;

  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)}>
        Source evaluation
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        variant="drawer"
        title="Source evaluation"
      >
        <p className="eyebrow">Source record</p>
        <h3 className="subtitle" style={{ marginBlock: "var(--s-2) var(--s-4)" }}>
          {m.originalHeadline}
        </h3>

        <Notice>
          <strong>This record is immutable.</strong> Outlet, author, dates, source type, canonical
          URL and quoted text cannot be edited through Counterframe by anyone, in any role.
          Everything Counterframe adds is versioned separately and appears in the History tab.
        </Notice>

        <dl className="definition-list" style={{ marginBlockStart: "var(--s-5)" }}>
          <dt>Outlet</dt>
          <dd>{m.outlet}</dd>
          <dt>Publisher country</dt>
          <dd>{m.outletCountry}</dd>
          <dt>Author</dt>
          <dd>
            <Verified field={m.author} fallback="No named author" />
            {m.author.note && (
              <p className="meta" style={{ marginBlockStart: "var(--s-1)" }}>
                {m.author.note}
              </p>
            )}
          </dd>
          <dt>Author location</dt>
          <dd>
            <Verified field={m.authorLocation} fallback="Not published" />
          </dd>
          <dt>Published</dt>
          <dd>
            <Verified field={m.publishedAt} fallback="Not established" />
          </dd>
          <dt>Updated</dt>
          <dd>
            {m.updatedAt.value ? (
              <>
                {formatDate(m.updatedAt.value)}
                {m.updatedAt.note && (
                  <p className="meta" style={{ marginBlockStart: "var(--s-1)" }}>
                    {m.updatedAt.note}
                  </p>
                )}
              </>
            ) : (
              <span style={{ color: "var(--ink-faint)" }}>No update timestamp published</span>
            )}
          </dd>
          <dt>Source type</dt>
          <dd>{SOURCE_TYPE_LABEL[m.sourceType]}</dd>
          <dt>Language</dt>
          <dd>{m.language === "en" ? "English" : "Hindi"}</dd>
          <dt>Correction policy</dt>
          <dd>
            <Verified field={m.correctionPolicyUrl} fallback="Not located" />
            {m.correctionPolicyUrl.note && (
              <p className="meta" style={{ marginBlockStart: "var(--s-1)" }}>
                {m.correctionPolicyUrl.note}
              </p>
            )}
          </dd>
          <dt>Canonical URL</dt>
          <dd>
            <a href={m.canonicalUrl} target="_blank" rel="noopener noreferrer">
              {hostname(m.canonicalUrl)}
              <span className="sr-only"> (opens the original source in a new tab)</span>
            </a>
          </dd>
        </dl>

        <section style={{ marginBlockStart: "var(--s-6)" }}>
          <div className="section-head">
            <h3>Framing label</h3>
            <Badge tone="ink">{FRAME_LABEL[article.frameLabel.label]}</Badge>
          </div>
          <p className="meta">{FRAME_DESCRIPTION[article.frameLabel.label]}</p>
          <p style={{ marginBlockStart: "var(--s-3)" }}>{article.frameLabel.rationale}</p>
          <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
            Decided {formatDate(article.frameLabel.decidedAt)} · Panel decision{" "}
            <a href={`/transparency#${article.frameLabel.panelDecisionId}`}>
              {article.frameLabel.panelDecisionId}
            </a>{" "}
            · Revision {article.frameLabel.revisionId}
          </p>
        </section>

        <section style={{ marginBlockStart: "var(--s-6)" }}>
          <div className="section-head">
            <h3>Evaluation rubric</h3>
          </div>
          <p className="meta" style={{ marginBlockEnd: "var(--s-4)" }}>
            Counterframe does not give sources a single credibility score. Each criterion is
            assessed separately, with a written note, so you can see which property produced which
            verdict.
          </p>
          <div className="table-scroll">
            <table className="data">
              <caption className="sr-only">
                Source evaluation criteria, verdicts, and the reasoning for each
              </caption>
              <thead>
                <tr>
                  <th scope="col">Criterion</th>
                  <th scope="col">Verdict</th>
                  <th scope="col">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {article.rubric.map((criterion) => (
                  <tr key={criterion.key}>
                    <th scope="row" style={{ fontWeight: 600, textTransform: "none", letterSpacing: 0, color: "var(--ink)", fontSize: "var(--step--1)" }}>
                      {criterion.label}
                    </th>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <RubricMark verdict={criterion.verdict} />
                    </td>
                    <td>{criterion.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {article.evidenceLinks.length > 0 && (
          <section style={{ marginBlockStart: "var(--s-6)" }}>
            <div className="section-head">
              <h3>Evidence and related records</h3>
            </div>
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--s-3)" }}>
              {article.evidenceLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>{" "}
                  {link.verification === "needs-verification" && (
                    <Badge tone="brass" mark="?">
                      Needs verification
                    </Badge>
                  )}
                  <p className="meta">{hostname(link.url)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section style={{ marginBlockStart: "var(--s-6)" }}>
          <div className="section-head">
            <h3>Counterframe additions</h3>
          </div>
          <p className="meta">
            Neutral summary, framing label, tags, notes and annotations are written by Counterframe,
            not by the outlet. Each is versioned. This article record has{" "}
            {article.revisionIds.length} revision{article.revisionIds.length === 1 ? "" : "s"}.
          </p>
        </section>
      </Modal>
    </>
  );
}
