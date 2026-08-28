import Link from "next/link";

import {
  PublishingRules,
  SponsorshipDeclarations,
} from "@/components/transparency/PublishingRules";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="shell page" style={{ maxWidth: "52rem" }}>
      <header className="page-head">
        <p className="eyebrow">About</p>
        <h1 className="display">What Counterframe is</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          A media comparison and discussion platform. It places contrasting coverage of the same
          events side by side, and publishes every editorial, moderation and funding decision behind
          that pairing.
        </p>
      </header>

      <div className="prose" style={{ maxWidth: "46rem" }}>
        <p>
          Counterframe does not tell you which account is correct. It is built on the belief that
          the useful skill is not knowing which outlet to trust, but being able to see what a piece
          of writing was built to make visible — and what it therefore could not contain.
        </p>

        <h3 id="principle">The principle</h3>
        <p>
          You should be able to find out what you are reading, who selected and labelled it, what
          other readers have actually read before forming a view, and where the money came from.
          Where Counterframe has an opinion, it says so, signs it, and records what it used to be
          before it changed.
        </p>
        <p>
          That is easy to assert and hard to hold to, so the rules below are published rather than
          merely followed. Each one is checked against live data — you can see for yourself whether
          the platform is currently keeping it.
        </p>
      </div>

      {/* The rules are the highest-leverage thing on this page: publishing them
          is what lets a reader hold the platform to a standard rather than
          taking its word. They belong near the top, not in a footnote. */}
      <div style={{ marginBlockStart: "var(--s-7)" }}>
        <PublishingRules />
      </div>

      <SponsorshipDeclarations />

      <div className="prose" style={{ maxWidth: "46rem", marginBlockStart: "var(--s-8)" }}>
        <h3 id="sources">Source policy</h3>
        <p>
          The source articles on this platform are real. Outlet, author, publication date, source
          type and canonical URL were checked against the canonical URL and are marked accordingly.
          Where something could not be established — an author&rsquo;s location, a corrections policy
          — it is marked <strong>needs verification</strong> or <strong>unavailable</strong> rather
          than filled in.
        </p>
        <p>
          Article bodies are <strong>not</strong> full source text. Counterframe is a classroom
          prototype and holds no republication rights, so each record carries short attributed
          verbatim excerpts alongside Counterframe-authored summary and notes. The two are rendered
          differently on purpose, and the interface labels every block as one or the other. Quoted
          source text is never translated and never editable.
        </p>
        <p>
          Images are contextual, freely licensed, and captioned to say so. One record deliberately
          carries no image, because no licensed image exists and substituting an unrelated stock
          photograph would be the exact behaviour the platform teaches readers to notice.
        </p>

        <h3 id="fiction">What is fictional</h3>
        <p>
          The editorial panel is invented. So are every community account, every take, every reply,
          and every figure in the funding ledger. No payment has ever been taken and no payment
          processor is connected. Counterframe has no legal existence, no staff and no money.
        </p>
        <p>
          What is real: the four source articles, their attribution, their canonical links, and the
          framing analysis applied to them.
        </p>
        <p>
          These are stated here rather than in a footnote because a platform built on transparency
          that is coy about its own status has already failed its premise.
        </p>

        <h3 id="labels">On the labels</h3>
        <p>
          A framing label — <em>Supports</em>, <em>Criticises</em>, <em>Mixed</em>,{" "}
          <em>Unclear</em>, <em>Converging</em>, <em>Insufficient contrast</em> — describes whose
          account organises a piece of reporting. It is not a verdict on accuracy, honesty, or the
          journalist. Every label carries written reasoning and a named vote, and every one can be
          argued with in the discussion.
        </p>
        <p>
          The community stance control is <strong>not</strong> a bias meter. It records what people
          on this platform currently think. A majority position is not evidence that the majority is
          right, and the interface says so wherever the distribution appears.
        </p>

        <h3 id="reading">On reading verification</h3>
        <p>
          Counterframe records that you reached the end of an article and spent a stated minimum
          time with it. It cannot tell whether you understood it, and it does not claim to. The
          minimum time is calculated from word count at a deliberately generous rate and capped, and
          the exact figures are shown at the checkpoint rather than hidden — a gate whose rule is
          secret is a dark pattern.
        </p>

        <h3 id="next">Where to start</h3>
        <p>
          Open the <Link href="/explore">current issue</Link>, read both panes, turn on the
          annotation layer, then open the transparency record and see who decided what. If you are
          returning and only want to know what moved, <Link href="/changes">what changed</Link>{" "}
          ranks developments above housekeeping. If you would rather start with method, the{" "}
          <Link href="/education">Education hub</Link> teaches the reading skills first.
        </p>
      </div>
    </div>
  );
}
