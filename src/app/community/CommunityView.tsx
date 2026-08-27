"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge, EmptyState, ModerationBadge, StanceBadge, StatBlock } from "@/components/primitives";
import { formatDateTime } from "@/lib/format";
import { REACTION_LABEL, STANCE_SHORT } from "@/lib/labels";
import { completionLabel } from "@/lib/reading";
import { isPubliclyVisible, reactionsFor, repliesFor, userById } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type { Stance } from "@/lib/types";

export function CommunityView() {
  const { db } = useStore();
  const [stanceFilter, setStanceFilter] = useState<Stance | "all">("all");

  const takes = db.takes
    .filter((t) => isPubliclyVisible(t.moderationState))
    .filter((t) => (stanceFilter === "all" ? true : t.stance === stanceFilter))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const contributors = new Set([
    ...db.takes.map((t) => t.userId),
    ...db.replies.map((r) => r.userId),
  ]).size;

  return (
    <div className="shell page">
      <header className="page-head">
        <p className="eyebrow">Community</p>
        <h1 className="display">What people are arguing about</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          Everything published here was written by someone who completed both primary articles
          first. Reactions describe the quality of an argument, not agreement with it, so a
          well-argued minority position surfaces rather than sinking.
        </p>
      </header>

      <div className="grid-3" style={{ marginBlockEnd: "var(--s-7)" }}>
        <StatBlock value={db.takes.filter((t) => isPubliclyVisible(t.moderationState)).length} label="Published takes" />
        <StatBlock value={db.replies.length} label="Replies" />
        <StatBlock value={contributors} label="Contributors" />
        <StatBlock value={db.stanceVotes.length} label="Recorded stances" />
        <StatBlock value={db.reactions.length} label="Reactions" />
        <StatBlock value={db.flags.filter((f) => f.status === "open").length} label="Open reports" />
      </div>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>How discussion works here</h2>
        </div>
        <div className="grid-2">
          <div>
            <p className="eyebrow">Reading first</p>
            <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "36ch" }}>
              Both primary articles must be completed before publishing. Counterframe records that
              you reached the end and spent a minimum time with each. It does not claim to know
              whether you understood them, and the badge on every post says exactly that.
            </p>
          </div>
          <div>
            <p className="eyebrow">No likes</p>
            <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "36ch" }}>
              The three reactions —{" "}
              {Object.values(REACTION_LABEL).join(", ").toLowerCase()} — describe an argument, not a
              side. They are kept secondary to the written reasoning and no score is shown.
            </p>
          </div>
          <div>
            <p className="eyebrow">One level of replies</p>
            <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "36ch" }}>
              Threads do not nest. Deep trees reward the fastest reply rather than the most
              considered one, and make a conversation impossible to read from the outside.
            </p>
          </div>
          <div>
            <p className="eyebrow">Moderation in the open</p>
            <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "36ch" }}>
              Every action carries a recorded reason and appears on the{" "}
              <Link href="/transparency#moderation">public moderation record</Link>, including the
              times the classifier was wrong and the appeal was upheld.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Recent takes</h2>
          <div className="chip-row">
            {(["all", "supports", "criticises", "undecided"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className="chip"
                aria-pressed={stanceFilter === value}
                onClick={() => setStanceFilter(value)}
              >
                {value === "all" ? "All" : STANCE_SHORT[value]}
              </button>
            ))}
          </div>
        </div>

        {takes.length === 0 ? (
          <EmptyState title="No takes match this filter">
            Try another stance filter, or open an issue and publish the first one.
          </EmptyState>
        ) : (
          <ul className="take-list">
            {takes.map((take) => {
              const author = userById(db, take.userId);
              const issue = db.issues.find((i) => i.id === take.issueId);
              const reactions = reactionsFor(db, take.id);
              return (
                <li key={take.id} className="take">
                  <div className="take-head">
                    <Link href={`/profile/${encodeURIComponent(author?.pseudonym ?? "")}`}>
                      <strong>{author?.pseudonym}</strong>
                    </Link>
                    <StanceBadge stance={take.stance} />
                    <Badge
                      tone={take.readingAtPublish.allCompleted ? "olive" : "brass"}
                      mark={take.readingAtPublish.allCompleted ? "●" : "◐"}
                    >
                      {completionLabel(take.readingAtPublish.allCompleted)}
                    </Badge>
                    <span className="meta">{formatDateTime(take.createdAt)}</span>
                    <ModerationBadge state={take.moderationState} />
                  </div>

                  {issue && (
                    <p className="meta" style={{ marginBlockEnd: "var(--s-2)" }}>
                      On <Link href={`/issues/${issue.slug}/community#${take.id}`}>{issue.title}</Link>
                    </p>
                  )}

                  <h3 className="take-title">
                    <Link
                      href={`/issues/${issue?.slug ?? ""}/community#${take.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      {take.title}
                    </Link>
                  </h3>

                  <p className="take-body" style={{ maxWidth: "40rem" }}>
                    {take.body.slice(0, 280)}
                    {take.body.length > 280 ? "…" : ""}
                  </p>

                  <div className="take-foot">
                    <span className="meta">
                      {reactions.length} reaction{reactions.length === 1 ? "" : "s"} ·{" "}
                      {repliesFor(db, take.id).length} repl
                      {repliesFor(db, take.id).length === 1 ? "y" : "ies"}
                    </span>
                    <Link href={`/issues/${issue?.slug ?? ""}/community#${take.id}`} className="meta">
                      Read in context →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
