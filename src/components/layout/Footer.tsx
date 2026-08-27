import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <section>
            <h2>Read</h2>
            <ul>
              <li>
                <Link href="/explore">Explore issues</Link>
              </li>
              <li>
                <Link href="/education">Education</Link>
              </li>
              <li>
                <Link href="/community">Community</Link>
              </li>
              <li>
                <Link href="/my-reading">My reading</Link>
              </li>
            </ul>
          </section>
          <section>
            <h2>Inspect</h2>
            <ul>
              <li>
                <Link href="/transparency">Transparency</Link>
              </li>
              <li>
                <Link href="/transparency#panel">Editorial panel</Link>
              </li>
              <li>
                <Link href="/transparency#funding">Funding ledger</Link>
              </li>
              <li>
                <Link href="/transparency#proposals">Proposal archive</Link>
              </li>
            </ul>
          </section>
          <section>
            <h2>Take part</h2>
            <ul>
              <li>
                <Link href="/propose">Propose an issue</Link>
              </li>
              <li>
                <Link href="/settings">Settings and privacy</Link>
              </li>
              <li>
                <Link href="/auth/signup">Create an account</Link>
              </li>
            </ul>
          </section>
          <section>
            <h2>About</h2>
            <ul>
              <li>
                <Link href="/about">What this is</Link>
              </li>
              <li>
                <Link href="/about#sources">Source policy</Link>
              </li>
              <li>
                <Link href="/about#fiction">What is fictional</Link>
              </li>
            </ul>
          </section>
        </div>

        <hr className="rule" style={{ marginBlock: "var(--s-5)" }} />

        <p style={{ maxWidth: "48rem" }}>
          <strong style={{ color: "var(--ink)" }}>Counterframe is a classroom prototype.</strong>{" "}
          The source articles, their outlets, authors, dates and links are real and verifiable. The
          editorial panel, the community accounts and every funding figure are fictional, and no
          payment is ever taken. Nothing here is a verdict on the outlets involved.
        </p>
      </div>
    </footer>
  );
}
