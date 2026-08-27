"use client";

import { Badge, Disclosure, EmptyState } from "@/components/primitives";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store/AppStore";
import type { PanelDecision } from "@/lib/types";

const OUTCOME_TONE = {
  approved: "olive",
  rejected: "rust",
  "returned-for-clarification": "brass",
  merged: "neutral",
} as const;

const OUTCOME_LABEL = {
  approved: "Approved",
  rejected: "Rejected",
  "returned-for-clarification": "Returned for clarification",
  merged: "Merged",
} as const;

const VOTE_MARK = {
  approve: "✓",
  reject: "✕",
  abstain: "–",
  recuse: "⊘",
} as const;

const VOTE_LABEL = {
  approve: "Approve",
  reject: "Reject",
  abstain: "Abstain",
  recuse: "Recused",
} as const;

export function PanelDecisionList({ decisions }: { decisions: PanelDecision[] }) {
  const { db } = useStore();

  if (decisions.length === 0) {
    return (
      <EmptyState title="No panel decisions recorded">
        Nothing has been put to the panel for this record yet. Every decision the panel takes is
        published here with its individual votes, reasoning and any recusals.
      </EmptyState>
    );
  }

  return (
    <ol className="timeline">
      {decisions.map((decision) => (
        <li key={decision.id} id={decision.id}>
          <p className="timeline-time">
            {formatDate(decision.decidedAt)} · {decision.id}
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--s-2)",
              flexWrap: "wrap",
              alignItems: "center",
              marginBlock: "var(--s-2)",
            }}
          >
            <Badge tone={OUTCOME_TONE[decision.outcome]}>{OUTCOME_LABEL[decision.outcome]}</Badge>
            <Badge>{decision.kind.replace(/-/g, " ")}</Badge>
          </div>

          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--step-2)",
              lineHeight: 1.25,
              maxWidth: "44ch",
            }}
          >
            {decision.question}
          </h3>

          <p style={{ marginBlockStart: "var(--s-3)" }}>{decision.summary}</p>

          {decision.dissent && (
            <div className="notice" data-tone="brass" style={{ marginBlockStart: "var(--s-3)" }}>
              <strong>Dissent and conditions.</strong> {decision.dissent}
            </div>
          )}

          <div style={{ marginBlockStart: "var(--s-3)" }}>
            <Disclosure summary="Criteria applied" count={decision.criteria.length}>
              <ul style={{ paddingInlineStart: "1.2em", fontSize: "var(--step--1)", color: "var(--ink-muted)" }}>
                {decision.criteria.map((criterion, index) => (
                  <li key={index} style={{ marginBlockStart: "var(--s-1)" }}>
                    {criterion}
                  </li>
                ))}
              </ul>
            </Disclosure>

            <Disclosure summary="Individual votes and reasoning" count={decision.votes.length}>
              <ul style={{ listStyle: "none", padding: 0, marginBlockStart: "var(--s-2)" }}>
                {decision.votes.map((vote) => {
                  const member = db.panelMembers.find((m) => m.id === vote.memberId);
                  return (
                    <li
                      key={vote.memberId}
                      style={{
                        borderBlockStart: "1px solid var(--rule-hair)",
                        paddingBlock: "var(--s-3)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "var(--s-2)",
                          alignItems: "baseline",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong style={{ fontSize: "var(--step-0)" }}>
                          {member?.name ?? vote.memberId}
                        </strong>
                        <Badge
                          tone={
                            vote.vote === "approve"
                              ? "olive"
                              : vote.vote === "reject"
                                ? "rust"
                                : "neutral"
                          }
                          mark={VOTE_MARK[vote.vote]}
                        >
                          {VOTE_LABEL[vote.vote]}
                        </Badge>
                        {member && (
                          <span className="meta">
                            {member.role} · {member.region}
                          </span>
                        )}
                      </div>
                      <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                        {vote.reasoning}
                      </p>
                      {vote.conflictNote && (
                        <p
                          className="meta"
                          style={{ marginBlockStart: "var(--s-2)", color: "var(--rust)" }}
                        >
                          <strong>Conflict declared:</strong> {vote.conflictNote}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Disclosure>
          </div>
        </li>
      ))}
    </ol>
  );
}
