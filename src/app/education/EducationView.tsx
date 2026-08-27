"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge, EmptyState, Notice } from "@/components/primitives";
import { can } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { EDUCATION_KIND_LABEL, TACTIC_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store/AppStore";
import type { EducationKind } from "@/lib/types";

const ORDER: EducationKind[] = ["explainer", "guide", "case-study", "video", "article"];

export function EducationView() {
  const { db, user, hydrated, suggestEducationTopic } = useStore();
  const published = db.education.filter((e) => e.status === "published");
  const lessons = published.filter((e) => e.kind !== "glossary");
  const glossary = published.filter((e) => e.kind === "glossary");
  const inReview = db.education.filter((e) => e.status === "under-review");

  const [topic, setTopic] = useState("");
  const [rationale, setRationale] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const grouped = ORDER.map((kind) => ({
    kind,
    items: lessons.filter((l) => l.kind === kind),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="shell page">
      <header className="page-head">
        <p className="eyebrow">Education</p>
        <h1 className="display">How to inspect what you are reading</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          Every lesson here teaches a method rather than a conclusion. All of it is written and
          approved by the editorial panel, and each piece names its authors and the decision that
          published it.
        </p>
      </header>

      {grouped.map((group) => (
        <section key={group.kind} style={{ marginBlockEnd: "var(--s-7)" }}>
          <div className="section-head">
            <h2>{EDUCATION_KIND_LABEL[group.kind]}s</h2>
            <p className="meta">{group.items.length}</p>
          </div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {group.items.map((lesson) => {
              const authors = lesson.authorPanelMemberIds
                .map((id) => db.panelMembers.find((m) => m.id === id)?.name)
                .filter(Boolean);
              return (
                <li
                  key={lesson.id}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-5)" }}
                >
                  <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                    <Badge tone="ink">{EDUCATION_KIND_LABEL[lesson.kind]}</Badge>
                    <span className="meta">{lesson.readingMinutes} min</span>
                    <span className="meta dot-sep">Published {formatDate(lesson.publishedAt)}</span>
                  </div>
                  <h3
                    className="editorial"
                    style={{ fontSize: "var(--step-3)", lineHeight: 1.18, marginBlockStart: "var(--s-3)", fontWeight: 600, maxWidth: "30ch" }}
                  >
                    <Link href={`/education/${lesson.slug}`} style={{ textDecoration: "none" }}>
                      {lesson.title}
                    </Link>
                  </h3>
                  <p style={{ marginBlockStart: "var(--s-3)", maxWidth: "58ch" }}>
                    {lesson.standfirst}
                  </p>
                  <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
                    By {authors.join(" and ")} ·{" "}
                    {lesson.tacticCategories.map((c) => TACTIC_LABEL[c]).join(", ")}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section style={{ marginBlockEnd: "var(--s-7)" }} id="glossary">
        <div className="section-head">
          <h2>Glossary</h2>
          <p className="meta">{glossary.length} terms</p>
        </div>
        {glossary.length === 0 ? (
          <EmptyState title="No glossary entries yet">
            The panel has not published any glossary terms.
          </EmptyState>
        ) : (
          <dl className="definition-list">
            {glossary.map((entry) => (
              <div key={entry.id} style={{ display: "contents" }}>
                <dt style={{ fontSize: "var(--step-0)", textTransform: "none", letterSpacing: 0, color: "var(--ink)" }}>
                  <Link href={`/education/${entry.slug}`}>{entry.glossaryTerm?.term}</Link>
                </dt>
                <dd style={{ marginBlockEnd: "var(--s-3)" }}>{entry.glossaryTerm?.definition}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {inReview.length > 0 && (
        <section style={{ marginBlockEnd: "var(--s-7)" }}>
          <div className="section-head">
            <h2>In review</h2>
            <p className="meta">{inReview.length} draft</p>
          </div>
          <Notice tone="brass">
            Counterframe shows drafts in review rather than hiding them, because a platform that
            only shows finished material teaches that editorial work arrives finished.
          </Notice>
          <ul style={{ listStyle: "none", padding: 0, marginBlockStart: "var(--s-4)" }}>
            {inReview.map((draft) => (
              <li
                key={draft.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
              >
                <Badge tone="brass">Under review</Badge>
                <h3 className="subtitle" style={{ marginBlockStart: "var(--s-2)" }}>
                  <Link href={`/education/${draft.slug}`}>{draft.title}</Link>
                </h3>
                <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                  {draft.standfirst}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="suggest">
        <div className="section-head">
          <h2>Suggest a topic</h2>
        </div>
        <p style={{ maxWidth: "44rem" }}>
          Community members may suggest Education topics. Only panel members can approve and publish
          official Education material, and every suggestion receives a recorded decision — including
          the declines, with their reasons.
        </p>

        {hydrated && (!user || !can(user, "propose-issue")) ? (
          <div style={{ marginBlockStart: "var(--s-4)" }}>
            <Notice tone="brass">
              <Link href="/auth/login">Sign in</Link> to suggest a topic.
            </Notice>
          </div>
        ) : hydrated ? (
          sent ? (
            <div style={{ marginBlockStart: "var(--s-4)" }}>
              <Notice tone="olive">
                <strong>Suggestion recorded.</strong> It will appear in the panel queue with a
                published decision.{" "}
                <button type="button" className="btn" data-variant="link" onClick={() => setSent(false)}>
                  Suggest another
                </button>
              </Notice>
            </div>
          ) : (
            <form
              style={{ marginBlockStart: "var(--s-4)", maxWidth: "38rem" }}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (topic.trim().length < 8 || rationale.trim().length < 40) {
                  setError("Give a topic of at least 8 characters and a reason of at least 40.");
                  return;
                }
                suggestEducationTopic(topic.trim(), rationale.trim());
                setTopic("");
                setRationale("");
                setError("");
                setSent(true);
              }}
            >
              <div className="field">
                <label className="field-label" htmlFor="edu-topic">
                  Topic
                </label>
                <input
                  id="edu-topic"
                  className="input"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  aria-invalid={Boolean(error)}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="edu-rationale">
                  Why it would help
                </label>
                <textarea
                  id="edu-rationale"
                  className="textarea"
                  style={{ minHeight: "6rem" }}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  aria-invalid={Boolean(error)}
                />
              </div>
              {error && <p className="field-error">{error}</p>}
              <button type="submit" className="btn" data-variant="primary">
                Submit suggestion
              </button>
            </form>
          )
        ) : null}

        <div style={{ marginBlockStart: "var(--s-6)" }}>
          <div className="section-head">
            <h3>Past suggestions and decisions</h3>
          </div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {db.educationSuggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
              >
                <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                  <Badge
                    tone={
                      suggestion.status === "accepted"
                        ? "olive"
                        : suggestion.status === "declined"
                          ? "rust"
                          : "brass"
                    }
                  >
                    {suggestion.status}
                  </Badge>
                  <strong>{suggestion.topic}</strong>
                  <span className="meta">{formatDate(suggestion.at)}</span>
                </div>
                <p className="meta" style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>
                  {suggestion.rationale}
                </p>
                {suggestion.decisionNote && (
                  <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>
                    <strong>Decision:</strong> {suggestion.decisionNote}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
