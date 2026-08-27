import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="shell page" style={{ maxWidth: "40rem" }}>
      <p className="eyebrow">404</p>
      <h1 className="title" style={{ marginBlockStart: "var(--s-3)" }}>
        There is nothing at this address
      </h1>
      <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
        Counterframe keeps working links working: archived issues stay readable, and corrections are
        appended rather than replacing what came before. So this is more likely a mistyped address
        than something that was taken down.
      </p>
      <div className="btn-row" style={{ marginBlockStart: "var(--s-5)" }}>
        <Link href="/explore" className="btn" data-variant="primary">
          Browse issues
        </Link>
        <Link href="/transparency" className="btn">
          Transparency record
        </Link>
      </div>
    </div>
  );
}
