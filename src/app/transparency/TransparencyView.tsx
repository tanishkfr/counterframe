"use client";

import Link from "next/link";

import { Badge, Disclosure, EmptyState, Notice, StatBlock } from "@/components/primitives";
import { ContributeForm } from "@/components/transparency/ContributeForm";
import {
  AllocationLedger,
  ContributionLedger,
  ExpenseLedger,
  PlatformFundingSummary,
} from "@/components/transparency/FundingLedger";
import { PanelDecisionList } from "@/components/transparency/PanelDecisionList";
import { RevisionTimeline } from "@/components/transparency/RevisionTimeline";
import { formatDate, formatDateTime } from "@/lib/format";
import { checkLedgerConsistency, fundingPriorityTally } from "@/lib/funding";
import {
  FUNDING_CATEGORY_LABEL,
  MODERATION_ACTION_LABEL,
  PROPOSAL_STATUS_LABEL,
  ROLE_LABEL,
  TRANSLATION_STATUS_LABEL,
} from "@/lib/labels";
import { describePrediction } from "@/lib/moderation/adapter";
import { can } from "@/lib/auth";
import { userById } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";

export function TransparencyView() {
  const { db, user, voteFundingPriority, hydrated } = useStore();
  const consistency = checkLedgerConsistency(db);
  const priorities = fundingPriorityTally(db);
  const core = db.panelMembers.filter((m) => m.kind === "core");
  const advisors = db.panelMembers.filter((m) => m.kind === "regional-advisor");
  const myPriority = db.fundingPriorityVotes.find((v) => v.userId === user?.id);

  return (
    <div className="shell page">
      <header className="page-head">
        <p className="eyebrow">Transparency</p>
        <h1 className="display">Every decision, on the record</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          A platform that asks readers to inspect other people&rsquo;s editorial decisions has no
          standing unless its own are inspectable. This page is that record: who decided what, on
          what reasoning, with what money, and where they got it wrong.
        </p>
      </header>

      <nav aria-label="Transparency sections" className="chip-row" style={{ marginBlockEnd: "var(--s-6)" }}>
        {(
          [
            ["#panel", "Editorial panel"],
            ["#edits", "Edits"],
            ["#decisions", "Panel decisions"],
            ["#funding", "Funding"],
            ["#proposals", "Proposal archive"],
            ["#translations", "Translations"],
            ["#moderation", "Moderation record"],
          ] as const
        ).map(([href, label]) => (
          <Link key={href} href={href} className="chip" style={{ textDecoration: "none" }}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="grid-3" style={{ marginBlockEnd: "var(--s-7)" }}>
        <StatBlock value={db.revisions.length} label="Revisions" />
        <StatBlock value={db.panelDecisions.length} label="Panel decisions" />
        <StatBlock value={db.proposals.length} label="Issue proposals" />
        <StatBlock value={db.moderationActions.length} label="Moderation actions" />
        <StatBlock value={db.appeals.length} label="Appeals" />
        <StatBlock value={db.translations.length} label="Translation records" />
      </div>

      {/* ------------------------------ panel ------------------------------ */}
      <section id="panel" style={{ marginBlockEnd: "var(--s-8)" }}>
        <div className="section-head">
          <h2>Editorial panel</h2>
          <p className="meta">
            {core.length} core members · {advisors.length} regional advisors
          </p>
        </div>

        <Notice tone="brass">
          <strong>The panel is fictional.</strong> Counterframe is a classroom prototype with no
          real governing body. The people below are invented. The sources they are shown
          deliberating over are real and verifiable.
        </Notice>

        <div style={{ marginBlockStart: "var(--s-5)", maxWidth: "50rem" }}>
          <p>
            Members are selected through open application against published criteria, serve fixed
            terms, and publish their affiliations and conflicts. The panel is deliberately{" "}
            <strong>not</strong> balanced between viewpoints — an even split between &ldquo;sides&rdquo;
            would itself be an editorial claim about what the sides are. It is balanced for
            diversity of expertise, region, language and lived experience.
          </p>
        </div>

        <h3 className="subtitle" style={{ marginBlockStart: "var(--s-6)" }}>
          Core panel
        </h3>
        <PanelList members={core} />

        <h3 className="subtitle" style={{ marginBlockStart: "var(--s-6)" }}>
          Regional advisors
        </h3>
        <p className="meta" style={{ marginBlockStart: "var(--s-2)", maxWidth: "44rem" }}>
          Appointed for specific linguistic and cultural context, on shorter terms than core
          members. They vote on decisions within their region.
        </p>
        <PanelList members={advisors} />
      </section>

      {/* ------------------------------ edits ------------------------------ */}
      <section id="edits" style={{ marginBlockEnd: "var(--s-8)" }}>
        <div className="section-head">
          <h2>Edits</h2>
          <p className="meta">{db.revisions.length} revisions</p>
        </div>
        <Notice>
          <strong>What can never appear here.</strong> Source text and original source metadata —
          outlet, author, dates, type, canonical URL and quoted passages — are immutable in the data
          model. No role can edit them through Counterframe. Everything below is material
          Counterframe itself wrote.
        </Notice>
        <div style={{ marginBlockStart: "var(--s-5)" }}>
          <RevisionTimeline revisions={[...db.revisions].sort((a, b) => b.at.localeCompare(a.at))} />
        </div>
      </section>

      {/* ---------------------------- decisions ---------------------------- */}
      <section id="decisions" style={{ marginBlockEnd: "var(--s-8)" }}>
        <div className="section-head">
          <h2>Panel decisions</h2>
          <p className="meta">{db.panelDecisions.length} recorded</p>
        </div>
        <PanelDecisionList
          decisions={[...db.panelDecisions].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))}
        />
      </section>

      {/* ----------------------------- funding ----------------------------- */}
      <section id="funding" style={{ marginBlockEnd: "var(--s-8)" }}>
        <div className="section-head">
          <h2>Funding</h2>
        </div>

        <Notice tone="brass">
          <strong>Simulated funding.</strong> No payments exist and no payment processor is
          connected. What is real is the structure: amounts, dates and destinations are always
          published; identity never is, unless the contributor chooses it.
        </Notice>

        {!consistency.ok && (
          <div style={{ marginBlockStart: "var(--s-4)" }}>
            <Notice tone="rust">
              <strong>Ledger inconsistency detected.</strong>
              <ul style={{ marginBlockStart: "var(--s-2)", paddingInlineStart: "1.2em" }}>
                {consistency.problems.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </Notice>
          </div>
        )}

        <div style={{ marginBlockStart: "var(--s-5)" }}>
          <PlatformFundingSummary />
        </div>

        <section style={{ marginBlockStart: "var(--s-6)" }}>
          <div className="section-head">
            <h3>Community funding priorities</h3>
            <p className="meta">{db.fundingPriorityVotes.length} votes</p>
          </div>
          <p className="meta" style={{ marginBlockEnd: "var(--s-4)", maxWidth: "44rem" }}>
            The community votes on priorities; the panel executes the approved budget and publishes
            the ledger against it. A priority vote is advisory, and the panel publishes its
            reasoning when it departs from one.
          </p>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--s-2)", maxWidth: "34rem" }}>
            {priorities.map((row) => (
              <li key={row.category} style={{ display: "flex", justifyContent: "space-between", gap: "var(--s-3)", paddingBlock: "var(--s-2)", borderBlockEnd: "1px solid var(--rule-hair)" }}>
                <span>{FUNDING_CATEGORY_LABEL[row.category]}</span>
                <span style={{ display: "flex", gap: "var(--s-3)", alignItems: "center" }}>
                  <span className="meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {row.votes}
                  </span>
                  {hydrated && user && can(user, "contribute-funds") && (
                    <button
                      type="button"
                      className="chip"
                      aria-pressed={myPriority?.category === row.category}
                      onClick={() => voteFundingPriority(row.category)}
                    >
                      {myPriority?.category === row.category ? "Your priority" : "Vote"}
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginBlockStart: "var(--s-6)" }}>
          <div className="section-head">
            <h3>Contributions</h3>
          </div>
          <ContributionLedger />
        </section>

        <section style={{ marginBlockStart: "var(--s-6)" }}>
          <div className="section-head">
            <h3>Spending</h3>
          </div>
          <ExpenseLedger />
        </section>

        <section style={{ marginBlockStart: "var(--s-6)" }}>
          <div className="section-head">
            <h3>Allocations to issues</h3>
          </div>
          <AllocationLedger />
        </section>

        <section style={{ marginBlockStart: "var(--s-6)", maxWidth: "38rem" }}>
          <div className="section-head">
            <h3>Contribute</h3>
          </div>
          <ContributeForm />
        </section>
      </section>

      {/* ---------------------------- proposals ---------------------------- */}
      <section id="proposals" style={{ marginBlockEnd: "var(--s-8)" }}>
        <div className="section-head">
          <h2>Issue proposal archive</h2>
          <p className="meta">{db.proposals.length} proposals</p>
        </div>
        <p className="meta" style={{ marginBlockEnd: "var(--s-4)", maxWidth: "46rem" }}>
          Every proposal receives a published decision, including rejections and neutral rewrites.
          Where the panel changed the wording, the original wording stays visible beside it.
        </p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {[...db.proposals]
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
            .map((proposal) => {
              const proposer = userById(db, proposal.userId);
              const decision = db.panelDecisions.find((d) => d.id === proposal.decisionId);
              return (
                <li
                  key={proposal.id}
                  id={proposal.id}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-5)" }}
                >
                  <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                    <Badge
                      tone={
                        proposal.status === "published"
                          ? "olive"
                          : proposal.status === "rejected"
                            ? "rust"
                            : "brass"
                      }
                    >
                      {PROPOSAL_STATUS_LABEL[proposal.status]}
                    </Badge>
                    <span className="meta">{proposer?.pseudonym ?? "Unknown"}</span>
                    <span className="meta dot-sep">{formatDate(proposal.submittedAt)}</span>
                  </div>

                  <h3 className="subtitle" style={{ marginBlockStart: "var(--s-3)", maxWidth: "44ch" }}>
                    {proposal.question}
                  </h3>

                  {proposal.neutralRewrite && (
                    <div className="diff" style={{ marginBlockStart: "var(--s-3)" }}>
                      <div className="diff-side" data-side="before">
                        <h5>As proposed</h5>
                        <p>{proposal.question}</p>
                      </div>
                      <div className="diff-side" data-side="after">
                        <h5>Published wording</h5>
                        <p>{proposal.neutralRewrite}</p>
                      </div>
                    </div>
                  )}

                  <p style={{ marginBlockStart: "var(--s-3)", maxWidth: "60ch" }}>
                    {proposal.rationale}
                  </p>

                  <div style={{ marginBlockStart: "var(--s-3)" }}>
                    <Disclosure summary="Proposal detail">
                      <dl className="definition-list" style={{ marginBlockStart: "var(--s-3)" }}>
                        <dt>Region</dt>
                        <dd>{proposal.region}</dd>
                        <dt>Countries</dt>
                        <dd>{proposal.countries.join(", ") || "Not specified"}</dd>
                        <dt>Topic</dt>
                        <dd>{proposal.topic}</dd>
                        <dt>Date range</dt>
                        <dd>
                          {formatDate(proposal.dateRangeStart)} – {formatDate(proposal.dateRangeEnd)}
                        </dd>
                        <dt>Suggested sources</dt>
                        <dd>
                          <ul style={{ listStyle: "none", padding: 0 }}>
                            {proposal.suggestedSources.map((s) => (
                              <li key={s} style={{ overflowWrap: "anywhere" }}>
                                {s.startsWith("http") ? (
                                  <a href={s} target="_blank" rel="noopener noreferrer">
                                    {s}
                                  </a>
                                ) : (
                                  s
                                )}
                              </li>
                            ))}
                          </ul>
                        </dd>
                        <dt>Affiliation disclosure</dt>
                        <dd>{proposal.affiliationDisclosure}</dd>
                        {proposal.supportingEvidence && (
                          <>
                            <dt>Supporting evidence</dt>
                            <dd>{proposal.supportingEvidence}</dd>
                          </>
                        )}
                      </dl>
                    </Disclosure>
                  </div>

                  {decision && (
                    <p style={{ marginBlockStart: "var(--s-3)" }}>
                      <strong>Decision:</strong> {decision.summary}{" "}
                      <Link href={`#${decision.id}`} className="meta">
                        See votes →
                      </Link>
                    </p>
                  )}

                  {proposal.publishedIssueId && (
                    <p style={{ marginBlockStart: "var(--s-3)" }}>
                      <Link
                        href={`/issues/${db.issues.find((i) => i.id === proposal.publishedIssueId)?.slug ?? ""}`}
                      >
                        Read the published issue →
                      </Link>
                    </p>
                  )}
                </li>
              );
            })}
        </ul>
      </section>

      {/* --------------------------- translations -------------------------- */}
      <section id="translations" style={{ marginBlockEnd: "var(--s-8)" }}>
        <div className="section-head">
          <h2>Translations</h2>
          <p className="meta">{db.translations.length} records</p>
        </div>
        <Notice>
          Counterframe translates the material it wrote. It does not translate quoted source text:
          a translation of a quotation is a new text the outlet did not publish, and Counterframe
          holds no rights to make derivative versions of these excerpts.
        </Notice>
        <div className="table-scroll" style={{ marginBlockStart: "var(--s-4)" }}>
          <table className="data">
            <caption className="sr-only">Translation records and their review status</caption>
            <thead>
              <tr>
                <th scope="col">Target</th>
                <th scope="col">Language</th>
                <th scope="col">Status</th>
                <th scope="col">Translator credit</th>
                <th scope="col">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {db.translations.map((translation) => (
                <tr key={translation.id}>
                  <td>
                    {translation.targetType} · {translation.targetId}
                  </td>
                  <td>{translation.language === "hi" ? "Hindi" : "English"}</td>
                  <td>
                    <Badge tone={translation.status === "panel-approved" ? "olive" : "brass"}>
                      {TRANSLATION_STATUS_LABEL[translation.status]}
                    </Badge>
                  </td>
                  <td>{translation.translatorCredit ?? "Not credited until approved"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(translation.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {db.translationReviews.length > 0 && (
          <div style={{ marginBlockStart: "var(--s-5)" }}>
            <h3 className="subtitle">Review notes</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {db.translationReviews.map((review) => (
                <li
                  key={review.id}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
                >
                  <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                    <Badge tone={review.outcome === "approved" ? "olive" : "brass"}>
                      {review.outcome}
                    </Badge>
                    <span className="meta">
                      {userById(db, review.reviewerId)?.pseudonym} · {formatDate(review.at)}
                    </span>
                  </div>
                  <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "62ch" }}>{review.notes}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------------------------- moderation --------------------------- */}
      <section id="moderation" style={{ marginBlockEnd: "var(--s-8)" }}>
        <div className="section-head">
          <h2>Moderation record</h2>
          <p className="meta">
            {db.moderationActions.length} actions · {db.appeals.length} appeals
          </p>
        </div>
        <Notice>
          Moderation logs are kept separate from the editorial archive, and are published wherever
          safety and privacy allow. The classifier can prioritise and can hide content pending human
          review. It cannot remove anything.
        </Notice>

        {db.moderationActions.length === 0 ? (
          <div style={{ marginBlockStart: "var(--s-4)" }}>
            <EmptyState title="No moderation actions">
              No content has been acted on.
            </EmptyState>
          </div>
        ) : (
          <ol className="timeline" style={{ marginBlockStart: "var(--s-5)" }}>
            {[...db.moderationActions]
              .sort((a, b) => b.at.localeCompare(a.at))
              .map((action) => {
                const prediction = db.predictions.find((p) => p.id === action.predictionId);
                return (
                  <li key={action.id}>
                    <p className="timeline-time">{formatDateTime(action.at)}</p>
                    <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center", marginBlock: "var(--s-2)" }}>
                      <Badge tone={action.kind === "restore" ? "olive" : "rust"}>
                        {MODERATION_ACTION_LABEL[action.kind]}
                      </Badge>
                      <span className="meta">
                        {userById(db, action.moderatorId)?.pseudonym} ·{" "}
                        {ROLE_LABEL[
                          userById(db, action.moderatorId)?.roles.includes("panel")
                            ? "panel"
                            : "moderator"
                        ]}
                      </span>
                    </div>
                    <p style={{ maxWidth: "62ch" }}>{action.reason}</p>
                    {prediction && (
                      <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                        Model: {prediction.modelName} {prediction.modelVersion} —{" "}
                        {describePrediction(prediction)}
                      </p>
                    )}
                  </li>
                );
              })}
          </ol>
        )}

        <div style={{ marginBlockStart: "var(--s-6)" }}>
          <h3 className="subtitle">Appeals</h3>
          {db.appeals.length === 0 ? (
            <div style={{ marginBlockStart: "var(--s-3)" }}>
              <EmptyState title="No appeals">Nobody has appealed a moderation decision.</EmptyState>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {db.appeals.map((appeal) => (
                <li
                  key={appeal.id}
                  style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-4)" }}
                >
                  <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                    <Badge tone={appeal.status === "upheld" ? "olive" : "brass"}>
                      {appeal.status}
                    </Badge>
                    <span className="meta">{formatDate(appeal.at)}</span>
                  </div>
                  <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "62ch" }}>{appeal.body}</p>
                  {appeal.decisionNote && (
                    <p style={{ marginBlockStart: "var(--s-2)", maxWidth: "62ch" }}>
                      <strong>Outcome:</strong> {appeal.decisionNote}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function PanelList({ members }: { members: ReturnType<typeof useStore>["db"]["panelMembers"] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {members.map((member) => (
        <li key={member.id} className="person" id={member.id}>
          <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "baseline" }}>
            <h3>{member.name}</h3>
            <span className="meta">{member.role}</span>
          </div>
          <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
            {member.region} · {member.country} · {member.languages.join(", ")}
          </p>
          <p style={{ marginBlockStart: "var(--s-3)", maxWidth: "62ch" }}>{member.background}</p>
          <div style={{ marginBlockStart: "var(--s-3)" }}>
            <Disclosure summary="Term, affiliations and conflicts">
              <dl className="definition-list" style={{ marginBlockStart: "var(--s-3)" }}>
                <dt>Expertise</dt>
                <dd>{member.expertise.join(", ")}</dd>
                <dt>Selected</dt>
                <dd>{formatDate(member.selectedAt)}</dd>
                <dt>Term ends</dt>
                <dd>{formatDate(member.termEndsAt)}</dd>
                <dt>Affiliations</dt>
                <dd>{member.affiliations.join("; ") || "None declared"}</dd>
                <dt>Conflicts</dt>
                <dd>{member.conflicts.join("; ")}</dd>
              </dl>
            </Disclosure>
          </div>
        </li>
      ))}
    </ul>
  );
}
