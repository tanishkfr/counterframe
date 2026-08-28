"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge, FrameBadge, StatBlock } from "@/components/primitives";
import { recentDevelopments } from "@/lib/changes";
import { formatDate, formatMoney } from "@/lib/format";
import { platformFunding } from "@/lib/funding";
import { articlesFor, byId, debateCount, stanceDistribution } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";

export function HomeView() {
  const { db } = useStore();
  const featured = db.issues.find((i) => i.status === "active") ?? db.issues[0];
  const funding = platformFunding(db);
  const developments = recentDevelopments(db, 4);
  const lessons = db.education.filter((e) => e.status === "published" && e.kind !== "glossary").slice(0, 3);

  if (!featured) return null;

  const hero = byId(db.articles, featured.heroArticleId);
  const [a, b] = articlesFor(db, [
    featured.viewpointA.articleIds[0] ?? "",
    featured.viewpointB.articleIds[0] ?? "",
  ]);
  const distribution = stanceDistribution(db, featured.id);

  return (
    <div className="shell page">
      {/* An editorial statement of purpose, not a marketing hero. */}
      <section style={{ maxWidth: "44rem", paddingBlock: "var(--s-5) var(--s-7)" }}>
        <p className="eyebrow">Counterframe</p>
        <h1
          className="editorial"
          style={{
            fontSize: "clamp(2rem, 1.3rem + 2.8vw, 3.4rem)",
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            marginBlockStart: "var(--s-4)",
            fontWeight: 600,
          }}
        >
          Two reports of the same events, side by side, with every editorial decision behind them
          on the record.
        </h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-5)" }}>
          Counterframe does not tell you which account is right. It shows you what each one was
          built to make visible, who decided that, and what it cost. The reading is the argument.
        </p>
        <div className="btn-row" style={{ marginBlockStart: "var(--s-5)" }}>
          <Link href={`/issues/${featured.slug}`} className="btn" data-variant="primary">
            Open the current issue
          </Link>
          <Link href="/education" className="btn">
            Learn how to read framing
          </Link>
        </div>
      </section>

      <hr className="rule" />

      {/* Featured issue, presented as an editorial spread. */}
      <section aria-labelledby="featured-heading" style={{ paddingBlock: "var(--s-7)" }}>
        <div className="section-head">
          <h2 id="featured-heading">Current issue</h2>
          <Link href="/explore" className="meta">
            All issues →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(19rem, 1fr))",
            gap: "var(--s-6)",
            alignItems: "start",
          }}
        >
          <div>
            <h3
              className="editorial"
              style={{
                fontSize: "clamp(1.5rem, 1.1rem + 1.6vw, 2.25rem)",
                lineHeight: 1.12,
                letterSpacing: "-0.015em",
                fontWeight: 600,
              }}
            >
              <Link href={`/issues/${featured.slug}`} style={{ textDecoration: "none" }}>
                {featured.title}
              </Link>
            </h3>
            <p style={{ marginBlockStart: "var(--s-4)", maxWidth: "40ch" }}>
              {featured.summary.slice(0, 340)}…
            </p>
            <div
              className="meta"
              style={{ display: "flex", gap: "var(--s-2) var(--s-4)", flexWrap: "wrap", marginBlockStart: "var(--s-4)" }}
            >
              <span>{featured.countries.join(", ")}</span>
              <span className="dot-sep">{debateCount(db, featured)} contributions</span>
              <span className="dot-sep">{distribution.total} recorded stances</span>
              <span className="dot-sep">Updated {formatDate(featured.updatedAt)}</span>
            </div>
          </div>

          {hero?.image && (
            <figure className="article-figure">
              <Image
                src={hero.image.src}
                alt={hero.image.alt}
                width={1280}
                height={860}
                sizes="(max-width: 40rem) 100vw, 40vw"
                priority
              />
              <figcaption>
                <strong style={{ color: "var(--ink-muted)" }}>Contextual image.</strong>{" "}
                {hero.image.caption} {hero.image.credit} · {hero.image.licence}
              </figcaption>
            </figure>
          )}
        </div>

        {/* The two frames, previewed as a genuine split. */}
        {a && b && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(17rem, 1fr))",
              gap: 0,
              marginBlockStart: "var(--s-6)",
              borderBlockStart: "1px solid var(--rule-strong)",
            }}
          >
            {[
              { article: a, label: featured.viewpointA.label },
              { article: b, label: featured.viewpointB.label },
            ].map(({ article, label }, index) => (
              <div
                key={article.id}
                style={{
                  paddingBlock: "var(--s-5)",
                  paddingInline: index === 0 ? "0 var(--s-5)" : "var(--s-5) 0",
                  borderInlineEnd: index === 0 ? "1px solid var(--rule)" : undefined,
                }}
              >
                <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
                  <Badge tone="ink">{label}</Badge>
                  <FrameBadge label={article.frameLabel.label} />
                </div>
                <p
                  className="editorial"
                  style={{
                    fontSize: "var(--step-2)",
                    lineHeight: 1.25,
                    marginBlockStart: "var(--s-3)",
                    fontWeight: 600,
                  }}
                >
                  {article.metadata.originalHeadline}
                </p>
                <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                  {article.metadata.outlet} ·{" "}
                  {article.metadata.author.value ?? "No named author"} ·{" "}
                  {formatDate(article.metadata.publishedAt.value)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr className="rule" />

      {/* A buffer against the change log: a returning reader wants the few
          things that moved, not the archive. */}
      <section aria-labelledby="changed-heading" style={{ paddingBlock: "var(--s-7)" }}>
        <div className="section-head">
          <h2 id="changed-heading">What changed</h2>
          <Link href="/changes" className="meta">
            Everything, by day →
          </Link>
        </div>
        {developments.length === 0 ? (
          <p className="meta">Nothing has changed on the platform yet.</p>
        ) : (
          <ul className="change-list">
            {developments.map((event) => (
              <li key={`${event.kind}-${event.id}`} className="change" data-significance="major">
                <span className="change-kind">{formatDate(event.at)}</span>
                <div>
                  <p className="change-title">
                    {event.href ? <Link href={event.href}>{event.title}</Link> : event.title}
                  </p>
                  <p className="change-detail">{event.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr className="rule" />

      <section aria-labelledby="how-heading" style={{ paddingBlock: "var(--s-7)" }}>
        <div className="section-head">
          <h2 id="how-heading">How it works</h2>
        </div>
        <div className="grid-2">
          <div>
            <p className="eyebrow">01 — Read both</p>
            <p style={{ marginBlockStart: "var(--s-3)", maxWidth: "34ch" }}>
              Two contrasting reports open side by side. You must reach the end of both, and spend a
              stated minimum time with each, before you can publish anything. Counterframe records
              that you read them. It does not claim to know whether you understood them.
            </p>
          </div>
          <div>
            <p className="eyebrow">02 — Inspect the decisions</p>
            <p style={{ marginBlockStart: "var(--s-3)", maxWidth: "34ch" }}>
              Every framing label carries written reasoning and a named vote. Every change to
              Counterframe&rsquo;s own text is versioned with a before and after. Source text and
              original source metadata cannot be edited by anyone, in any role.
            </p>
          </div>
          <div>
            <p className="eyebrow">03 — Argue with evidence</p>
            <p style={{ marginBlockStart: "var(--s-3)", maxWidth: "34ch" }}>
              Takes need a claim, a stance and reasoning. Reactions describe the quality of an
              argument — helpful reasoning, clear evidence, important context — not agreement with
              it. There are no likes and no score.
            </p>
          </div>
          <div>
            <p className="eyebrow">04 — Follow the money</p>
            <p style={{ marginBlockStart: "var(--s-3)", maxWidth: "34ch" }}>
              Amounts, dates and destinations are always published. Contributor identity never is,
              unless the contributor chooses it. The community votes on priorities; the panel
              executes and publishes the ledger against them.
            </p>
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section aria-labelledby="numbers-heading" style={{ paddingBlock: "var(--s-7)" }}>
        <div className="section-head">
          <h2 id="numbers-heading">The platform, in the open</h2>
          <Link href="/transparency" className="meta">
            Full transparency record →
          </Link>
        </div>
        <div className="grid-3">
          <StatBlock value={db.revisions.length} label="Recorded revisions" />
          <StatBlock value={db.panelDecisions.length} label="Panel decisions" />
          <StatBlock value={db.panelMembers.length} label="Panel members and advisors" />
          <StatBlock value={formatMoney(funding.totalContributions)} label="Contributions" />
          <StatBlock value={formatMoney(funding.balance)} label="Remaining balance" />
          <StatBlock value={db.moderationActions.length} label="Moderation actions on record" />
        </div>
      </section>

      <hr className="rule" />

      <section aria-labelledby="learn-heading" style={{ paddingBlock: "var(--s-7)" }}>
        <div className="section-head">
          <h2 id="learn-heading">Start with a method, not a conclusion</h2>
          <Link href="/education" className="meta">
            All Education →
          </Link>
        </div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-5)" }}
            >
              <p className="eyebrow">
                {lesson.kind} · {lesson.readingMinutes} min
              </p>
              <h3
                className="editorial"
                style={{ fontSize: "var(--step-3)", lineHeight: 1.2, marginBlockStart: "var(--s-2)", fontWeight: 600 }}
              >
                <Link href={`/education/${lesson.slug}`} style={{ textDecoration: "none" }}>
                  {lesson.title}
                </Link>
              </h3>
              <p className="meta" style={{ marginBlockStart: "var(--s-2)", maxWidth: "60ch" }}>
                {lesson.standfirst}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
