"use client";

import Link from "next/link";

import { ExplainerPlayer } from "@/components/education/ExplainerPlayer";
import { Badge, EmptyState, Notice, Paragraphs } from "@/components/primitives";
import { formatDate } from "@/lib/format";
import { EDUCATION_KIND_LABEL, TACTIC_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store/AppStore";

export function LessonView({ slug }: { slug: string }) {
  const { db, prefs } = useStore();
  const lesson = db.education.find((e) => e.slug === slug);

  if (!lesson) {
    return (
      <div className="shell page">
        <EmptyState
          title="No lesson at that address"
          action={
            <Link href="/education" className="btn" data-variant="primary">
              Back to Education
            </Link>
          }
        >
          Counterframe has no Education material at <code>{slug}</code>.
        </EmptyState>
      </div>
    );
  }

  const authors = lesson.authorPanelMemberIds
    .map((id) => db.panelMembers.find((m) => m.id === id))
    .filter(Boolean);
  const decision = db.panelDecisions.find((d) => d.id === lesson.panelDecisionId);
  const relatedIssues = db.issues.filter((i) => lesson.relatedIssueIds.includes(i.id));

  const draftTranslation = db.translations.find(
    (t) => t.targetType === "education" && t.targetId === lesson.id && t.language === prefs.language,
  );

  return (
    <div className="shell page">
      <article style={{ maxWidth: "44rem" }}>
        <header className="page-head">
          <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
            <Badge tone="ink">{EDUCATION_KIND_LABEL[lesson.kind]}</Badge>
            {lesson.status === "under-review" && <Badge tone="brass">Under review</Badge>}
            <span className="meta">{lesson.readingMinutes} min</span>
          </div>

          <h1 className="title" style={{ marginBlockStart: "var(--s-4)" }}>
            {lesson.title}
          </h1>
          <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
            {lesson.standfirst}
          </p>

          <p className="meta" style={{ marginBlockStart: "var(--s-4)" }}>
            By{" "}
            {authors.map((a, index) => (
              <span key={a!.id}>
                {index > 0 && " and "}
                <Link href={`/transparency#${a!.id}`}>{a!.name}</Link>
              </span>
            ))}{" "}
            · Published {formatDate(lesson.publishedAt)}
            {lesson.updatedAt !== lesson.publishedAt && ` · Updated ${formatDate(lesson.updatedAt)}`}
          </p>
        </header>

        {lesson.status === "under-review" && (
          <Notice tone="brass">
            <strong>This draft has not been approved for publication.</strong> It is visible so
            readers can see what the review stage looks like. Do not treat it as settled Education
            material.
          </Notice>
        )}

        {draftTranslation && draftTranslation.status !== "panel-approved" && (
          <div style={{ marginBlockStart: "var(--s-4)" }}>
            <Notice>
              A Hindi rendering of this lesson exists but is a{" "}
              <strong>{draftTranslation.status.replace("-", " ")}</strong> and has not been approved
              by the panel, so it is not shown to readers. It is in the panel translation queue.
            </Notice>
          </div>
        )}

        {lesson.video && (
          <section style={{ marginBlockStart: "var(--s-6)" }}>
            <ExplainerPlayer video={lesson.video} title={lesson.title} />
          </section>
        )}

        {lesson.glossaryTerm ? (
          <section style={{ marginBlockStart: "var(--s-6)" }}>
            <dl className="definition-list">
              <dt>Term</dt>
              <dd style={{ fontFamily: "var(--font-serif)", fontSize: "var(--step-2)" }}>
                {lesson.glossaryTerm.term}
              </dd>
              <dt>Definition</dt>
              <dd>{lesson.glossaryTerm.definition}</dd>
              <dt>See also</dt>
              <dd>{lesson.glossaryTerm.seeAlso.join(", ")}</dd>
            </dl>
          </section>
        ) : (
          <Paragraphs text={lesson.body} className="prose" />
        )}

        <footer style={{ marginBlockStart: "var(--s-7)" }}>
          <div className="section-head">
            <h2>Provenance</h2>
          </div>
          <dl className="definition-list">
            <dt>Tactics covered</dt>
            <dd>{lesson.tacticCategories.map((c) => TACTIC_LABEL[c]).join(", ")}</dd>
            <dt>Published by</dt>
            <dd>
              {decision ? (
                <Link href={`/transparency#${decision.id}`}>
                  Panel decision {decision.id} — {decision.outcome}
                </Link>
              ) : (
                "Not yet approved for publication"
              )}
            </dd>
            <dt>Status</dt>
            <dd>{lesson.status.replace(/-/g, " ")}</dd>
          </dl>

          {relatedIssues.length > 0 && (
            <div style={{ marginBlockStart: "var(--s-5)" }}>
              <div className="section-head">
                <h2>Practise on</h2>
              </div>
              <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--s-3)" }}>
                {relatedIssues.map((issue) => (
                  <li key={issue.id}>
                    <Link href={`/issues/${issue.slug}`}>{issue.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p style={{ marginBlockStart: "var(--s-6)" }}>
            <Link href="/education" className="btn">
              All Education
            </Link>
          </p>
        </footer>
      </article>
    </div>
  );
}
