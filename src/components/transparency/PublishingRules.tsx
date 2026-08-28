"use client";

import Link from "next/link";

import { Badge, Notice } from "@/components/primitives";
import { checkPublishingRules } from "@/lib/rules";
import { useStore } from "@/lib/store/AppStore";

/**
 * The rules, rendered from live data rather than written out as prose.
 *
 * Each one computes its own compliance, so the page cannot drift away from
 * what the platform actually does. If a rule is ever unmet it says so, names
 * the records that break it, and stops claiming to be met — which is the whole
 * reason for publishing rules in the first place.
 */
export function PublishingRules() {
  const { db } = useStore();
  const rules = checkPublishingRules(db);
  const unmet = rules.filter((r) => !r.met);

  return (
    <section aria-labelledby="rules-heading">
      <div className="section-head">
        <h2 id="rules-heading">Publishing rules</h2>
        <Badge tone={unmet.length === 0 ? "olive" : "rust"}>
          {unmet.length === 0 ? "All met" : `${unmet.length} unmet`}
        </Badge>
      </div>

      <p style={{ maxWidth: "48rem" }}>
        These are the rules Counterframe holds itself to. They are published here so you can hold
        it to them — a rule you cannot check is a slogan.
      </p>

      <div style={{ marginBlockStart: "var(--s-4)" }}>
        <Notice tone={unmet.length === 0 ? "olive" : "rust"}>
          {unmet.length === 0 ? (
            <>
              <strong>Each rule below is checked against live data every time this page
              loads,</strong>{" "}
              and the build fails if the seeded record breaks one. The status beside each rule is
              computed, not written.
            </>
          ) : (
            <>
              <strong>{unmet.length} rule{unmet.length === 1 ? " is" : "s are"} currently
              unmet.</strong>{" "}
              The offending records are named below rather than quietly omitted.
            </>
          )}
        </Notice>
      </div>

      <ol className="rule-list">
        {rules.map((rule, index) => (
          <li key={rule.id} id={rule.id} className="rule">
            <div className="rule-head">
              <span className="rule-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="rule-title">{rule.title}</h3>
              <Badge tone={rule.met ? "olive" : "rust"} mark={rule.met ? "✓" : "✕"}>
                {rule.met ? "Met" : "Unmet"}
              </Badge>
            </div>

            {rule.binds === "our-record-of-others" && (
              <p className="meta rule-scope">
                This one binds our record of other people&rsquo;s work, not our own reporting.
                Counterframe does not report; it cannot make an outlet justify an unnamed source.
                It can record whether the outlet did.
              </p>
            )}

            <ul className="rule-requires">
              {rule.requires.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>

            <p className="meta rule-status">{rule.summary}</p>

            {rule.failures.length > 0 && (
              <ul className="rule-failures">
                {rule.failures.map((failure) => (
                  <li key={failure}>{failure}</li>
                ))}
              </ul>
            )}

            <p style={{ marginBlockStart: "var(--s-3)" }}>
              <Link href={rule.verifyHref} className="btn">
                {rule.verifyLabel}
              </Link>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The standing declarations behind rule 4, listed in full. */
export function SponsorshipDeclarations() {
  const { db } = useStore();

  return (
    <section aria-labelledby="sponsorship-heading" style={{ marginBlockStart: "var(--s-7)" }}>
      <div className="section-head">
        <h2 id="sponsorship-heading">Commercial relationships</h2>
        <p className="meta">
          {db.sponsorship.filter((d) => d.present).length === 0
            ? "None declared"
            : `${db.sponsorship.filter((d) => d.present).length} active`}
        </p>
      </div>

      <dl className="definition-list">
        {db.sponsorship.map((entry) => (
          <div key={entry.id} style={{ display: "contents" }}>
            <dt>{entry.kind}</dt>
            <dd style={{ marginBlockEnd: "var(--s-3)" }}>
              <Badge tone={entry.present ? "brass" : "olive"}>
                {entry.present ? "Exists" : "None"}
              </Badge>{" "}
              {entry.statement}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
