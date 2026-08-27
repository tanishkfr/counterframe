"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge, StanceBadge } from "@/components/primitives";
import { formatDate } from "@/lib/format";
import { hasCompletedAll } from "@/lib/reading";
import {
  byId,
  debateCount,
  issueArticleCount,
  primaryArticleIds,
  readCount,
  stanceDistribution,
} from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type { Issue } from "@/lib/types";

const STATUS_LABEL = {
  active: "Active",
  "under-review": "Under review",
  archived: "Archived",
} as const;

export function IssueRow({ issue }: { issue: Issue }) {
  const { db, user, hydrated } = useStore();
  const hero = byId(db.articles, issue.heroArticleId);
  const distribution = stanceDistribution(db, issue.id);
  const primaries = primaryArticleIds(issue);
  const completed = hasCompletedAll(primaries, db.readingProgress, user?.id ?? null);
  const started = primaries.some((id) =>
    db.readingProgress.some((p) => p.userId === user?.id && p.articleId === id),
  );

  const leading = (["supports", "criticises", "undecided"] as const).reduce((best, stance) =>
    distribution.counts[stance] > distribution.counts[best] ? stance : best,
  );

  return (
    <li className="issue-row">
      <div className="issue-row-media">
        {hero?.image ? (
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            width={640}
            height={480}
            sizes="(max-width: 44rem) 100vw, 12rem"
          />
        ) : (
          <div className="image-missing">
            <span>No licensed image for this issue</span>
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            display: "flex",
            gap: "var(--s-2)",
            flexWrap: "wrap",
            alignItems: "center",
            marginBlockEnd: "var(--s-3)",
          }}
        >
          <Badge tone={issue.status === "active" ? "olive" : "brass"}>
            {STATUS_LABEL[issue.status]}
          </Badge>
          <span className="meta">{issue.region}</span>
          <span className="meta dot-sep">{issue.countries.join(", ")}</span>
        </div>

        <h3>
          <Link href={`/issues/${issue.slug}`}>{issue.title}</Link>
        </h3>

        <p className="meta" style={{ marginBlockStart: "var(--s-3)", maxWidth: "52ch" }}>
          {issue.summary.length > 260 ? `${issue.summary.slice(0, 260)}…` : issue.summary}
        </p>

        <div
          style={{
            display: "flex",
            gap: "var(--s-2) var(--s-4)",
            flexWrap: "wrap",
            alignItems: "center",
            marginBlockStart: "var(--s-4)",
          }}
          className="meta"
        >
          <span>
            {issueArticleCount(issue)} source{issueArticleCount(issue) === 1 ? "" : "s"}
          </span>
          {issue.additionalPerspectiveIds.length > 0 && (
            <span className="dot-sep">
              {issue.additionalPerspectiveIds.length} additional perspectives
            </span>
          )}
          <span className="dot-sep">{debateCount(db, issue)} contributions</span>
          <span className="dot-sep">{readCount(db, issue)} readers</span>
          <span className="dot-sep">Updated {formatDate(issue.updatedAt)}</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "var(--s-2)",
            flexWrap: "wrap",
            alignItems: "center",
            marginBlockStart: "var(--s-3)",
          }}
        >
          {distribution.total > 0 ? (
            <>
              <span className="meta">Community stance leans</span>
              <StanceBadge stance={leading} />
              <span className="meta">
                ({distribution.counts[leading]} of {distribution.total})
              </span>
            </>
          ) : (
            <span className="meta">No stances recorded yet</span>
          )}

          {hydrated && user && (
            <Badge tone={completed ? "olive" : "neutral"} mark={completed ? "●" : started ? "◐" : "○"}>
              {completed
                ? "Both articles completed"
                : started
                  ? "Reading in progress"
                  : "Not started"}
            </Badge>
          )}
        </div>
      </div>
    </li>
  );
}
