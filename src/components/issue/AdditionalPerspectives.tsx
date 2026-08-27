"use client";

import { useState } from "react";

import { Badge, EmptyState, FrameBadge } from "@/components/primitives";
import { hostname } from "@/lib/format";
import { translate } from "@/lib/i18n";
import { SOURCE_TYPE_LABEL } from "@/lib/labels";
import { annotationsFor, articlesFor } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type { Issue } from "@/lib/types";

import { ArticleBody } from "./ArticleBody";
import { SourceInspector, SourceMetaBar } from "./SourceMeta";

/**
 * Additional perspectives sit below the comparison rather than inside it. They
 * are not a third and fourth pane: showing four full articles at once would
 * make the page unreadable and would blur what the two-pane contrast is for.
 */
export function AdditionalPerspectives({ issue }: { issue: Issue }) {
  const { db, prefs } = useStore();
  const articles = articlesFor(db, issue.additionalPerspectiveIds);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section aria-labelledby="additional-heading" style={{ marginBlockStart: "var(--s-7)" }}>
      <div className="section-head">
        <h2 id="additional-heading">{translate(prefs.language, "issue.additional")}</h2>
        <p className="meta">
          {articles.length} source{articles.length === 1 ? "" : "s"} beyond the two-pane comparison
        </p>
      </div>

      <p className="meta" style={{ maxWidth: "48rem", marginBlockEnd: "var(--s-5)" }}>
        Primary, official and civil-society material, here so you can check the two paired reports
        against the record each was drawing on. Not a third and fourth viewpoint, and not required
        for the discussion gate.
      </p>

      {articles.length === 0 ? (
        <EmptyState title="No additional perspectives are published">
          The panel has not published any primary or civil-society material for this issue.
        </EmptyState>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {articles.map((article) => {
            const open = openId === article.id;
            return (
              <li
                key={article.id}
                style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-5)" }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "var(--s-2)",
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBlockEnd: "var(--s-3)",
                  }}
                >
                  <Badge tone="ink">{SOURCE_TYPE_LABEL[article.metadata.sourceType]}</Badge>
                  <FrameBadge label={article.frameLabel.label} />
                  {article.metadata.sourceType === "state-broadcaster" && (
                    <Badge tone="brass">State-owned publisher</Badge>
                  )}
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--step-2)",
                    lineHeight: 1.25,
                    maxWidth: "48ch",
                  }}
                >
                  {article.metadata.originalHeadline}
                </h3>

                <div style={{ marginBlockStart: "var(--s-3)" }}>
                  <SourceMetaBar article={article} />
                </div>

                <p style={{ marginBlockStart: "var(--s-3)", maxWidth: "46rem" }}>
                  {article.neutralSummary}
                </p>

                <div className="btn-row" style={{ marginBlockStart: "var(--s-4)" }}>
                  <button
                    type="button"
                    className="btn"
                    aria-expanded={open}
                    aria-controls={`perspective-${article.id}`}
                    onClick={() => setOpenId(open ? null : article.id)}
                  >
                    {open ? "Close this perspective" : "Read this perspective"}
                  </button>
                  <a
                    className="btn"
                    href={article.metadata.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open original source
                    <span aria-hidden="true">↗</span>
                    <span className="sr-only">
                      — opens {hostname(article.metadata.canonicalUrl)} in a new tab
                    </span>
                  </a>
                  <SourceInspector article={article} />
                </div>

                <div id={`perspective-${article.id}`} hidden={!open}>
                  <div style={{ marginBlockStart: "var(--s-5)" }}>
                    <ArticleBody
                      article={article}
                      annotations={annotationsFor(db, article.id)}
                      showAnnotations={prefs.showAnnotations}
                      language={prefs.language}
                      translated={null}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
