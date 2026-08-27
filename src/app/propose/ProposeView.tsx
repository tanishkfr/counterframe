"use client";

import Link from "next/link";
import { useState } from "react";

import { EmptyState, Notice } from "@/components/primitives";
import { can } from "@/lib/auth";
import { useStore } from "@/lib/store/AppStore";

export function ProposeView() {
  const { user, hydrated, submitProposal, db } = useStore();

  const [question, setQuestion] = useState("");
  const [rationale, setRationale] = useState("");
  const [sources, setSources] = useState("");
  const [region, setRegion] = useState("");
  const [countries, setCountries] = useState("");
  const [topic, setTopic] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [evidence, setEvidence] = useState("");
  const [disclosure, setDisclosure] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  if (!hydrated) {
    return (
      <div className="shell page">
        <p className="meta">Loading…</p>
      </div>
    );
  }

  if (!user || !can(user, "propose-issue")) {
    return (
      <div className="shell page">
        <EmptyState
          title="Sign in to propose an issue"
          action={
            <Link href="/auth/login" className="btn" data-variant="primary">
              Sign in
            </Link>
          }
        >
          Every proposal receives a published panel decision. Browsing the{" "}
          <Link href="/transparency#proposals">proposal archive</Link>, including the rejections,
          needs no account.
        </EmptyState>
      </div>
    );
  }

  const validate = () => {
    const next: Record<string, string> = {};
    if (question.trim().length < 15) next.question = "Give a question of at least 15 characters.";
    if (rationale.trim().length < 80)
      next.rationale = `Explain why it matters in at least 80 characters. You have ${rationale.trim().length}.`;
    if (sources.trim().length < 10) next.sources = "Suggest at least one source, one per line.";
    if (!region.trim()) next.region = "Name the relevant region.";
    if (!topic.trim()) next.topic = "Give a topic category.";
    if (!start || !end) next.dates = "Give a date range for the events in question.";
    if (start && end && start > end) next.dates = "The start date must come before the end date.";
    if (disclosure.trim().length < 4)
      next.disclosure = "State any relevant affiliation, or write 'None'.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  if (sent) {
    return (
      <div className="shell page" style={{ maxWidth: "40rem" }}>
        <h1 className="title">Proposal submitted</h1>
        <div style={{ marginBlockStart: "var(--s-5)" }}>
          <Notice tone="olive">
            <strong>It is now in the panel queue.</strong> The panel may publish it, request
            clarification, rewrite the wording neutrally, reject it with a public reason, or merge
            it with an existing issue. Whichever happens, the decision and its reasoning are
            published in the proposal archive.
          </Notice>
        </div>
        <div className="btn-row" style={{ marginBlockStart: "var(--s-5)" }}>
          <Link href="/transparency#proposals" className="btn" data-variant="primary">
            See the proposal archive
          </Link>
          <button type="button" className="btn" onClick={() => setSent(false)}>
            Propose another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell page" style={{ maxWidth: "44rem" }}>
      <header className="page-head">
        <p className="eyebrow">Propose</p>
        <h1 className="display">Propose an issue</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          Counterframe compares coverage of specific events. It does not rank outlets, and it does
          not publish questions that presuppose their own answer.
        </p>
      </header>

      <Notice tone="brass">
        <strong>Phrase the question neutrally.</strong> The panel will rewrite wording that assumes
        a conclusion, and will publish both your original phrasing and its rewrite side by side. The
        seeded Delhi issue is a worked example: it was proposed as &ldquo;How Delhi covered up its
        slums&rdquo; and published as a question about what happened.
      </Notice>

      <form
        noValidate
        style={{ marginBlockStart: "var(--s-5)" }}
        onSubmit={(event) => {
          event.preventDefault();
          if (!validate()) return;
          submitProposal({
            question: question.trim(),
            rationale: rationale.trim(),
            suggestedSources: sources
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            region: region.trim(),
            countries: countries
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean),
            topic: topic.trim(),
            dateRangeStart: start,
            dateRangeEnd: end,
            supportingEvidence: evidence.trim() || undefined,
            affiliationDisclosure: disclosure.trim(),
          });
          setSent(true);
        }}
      >
        <div className="field">
          <label className="field-label" htmlFor="p-question">
            Issue question
            <span className="field-hint">
              A question, not a claim. &ldquo;What happened to X?&rdquo; rather than &ldquo;How X was
              covered up&rdquo;.
            </span>
          </label>
          <input
            id="p-question"
            className="input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            aria-invalid={Boolean(errors.question)}
          />
          {errors.question && <p className="field-error">{errors.question}</p>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-rationale">
            Why this matters
            <span className="field-hint">
              What would a reader learn from seeing these accounts side by side that they would not
              learn from either alone?
            </span>
          </label>
          <textarea
            id="p-rationale"
            className="textarea"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            aria-invalid={Boolean(errors.rationale)}
          />
          {errors.rationale && <p className="field-error">{errors.rationale}</p>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-sources">
            Suggested sources
            <span className="field-hint">
              One per line. URLs where possible. The panel needs at least two substantive sources
              with genuinely different frames before it can publish a comparison.
            </span>
          </label>
          <textarea
            id="p-sources"
            className="textarea"
            style={{ minHeight: "6rem", fontFamily: "var(--font-mono)", fontSize: "var(--step--1)" }}
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            aria-invalid={Boolean(errors.sources)}
          />
          {errors.sources && <p className="field-error">{errors.sources}</p>}
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="field-label" htmlFor="p-region">
              Region
            </label>
            <input
              id="p-region"
              className="input"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              aria-invalid={Boolean(errors.region)}
            />
            {errors.region && <p className="field-error">{errors.region}</p>}
          </div>
          <div className="field">
            <label className="field-label" htmlFor="p-countries">
              Countries <span className="field-hint">Comma separated</span>
            </label>
            <input
              id="p-countries"
              className="input"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="p-topic">
              Topic category
            </label>
            <input
              id="p-topic"
              className="input"
              list="topic-suggestions"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              aria-invalid={Boolean(errors.topic)}
            />
            <datalist id="topic-suggestions">
              {[...new Set(db.issues.flatMap((i) => i.topics))].map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            {errors.topic && <p className="field-error">{errors.topic}</p>}
          </div>
          <div className="field">
            <span className="field-label" id="p-dates-label">
              Date range of the events
            </span>
            <div style={{ display: "flex", gap: "var(--s-2)" }} aria-labelledby="p-dates-label">
              <input
                className="input"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                aria-label="Start date"
                aria-invalid={Boolean(errors.dates)}
              />
              <input
                className="input"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                aria-label="End date"
                aria-invalid={Boolean(errors.dates)}
              />
            </div>
            {errors.dates && <p className="field-error">{errors.dates}</p>}
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-evidence">
            Supporting evidence <span className="field-hint">Optional</span>
          </label>
          <textarea
            id="p-evidence"
            className="textarea"
            style={{ minHeight: "5rem" }}
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-disclosure">
            Affiliation disclosure
            <span className="field-hint">
              Any connection to a party in this issue — employment, funding, membership, or a
              personal connection. Write &ldquo;None&rdquo; if there is none. Disclosures are
              published with the proposal.
            </span>
          </label>
          <textarea
            id="p-disclosure"
            className="textarea"
            style={{ minHeight: "5rem" }}
            value={disclosure}
            onChange={(e) => setDisclosure(e.target.value)}
            aria-invalid={Boolean(errors.disclosure)}
          />
          {errors.disclosure && <p className="field-error">{errors.disclosure}</p>}
        </div>

        <button type="submit" className="btn" data-variant="primary">
          Submit proposal
        </button>
      </form>
    </div>
  );
}
