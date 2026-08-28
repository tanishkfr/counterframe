"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { translate, type UiKey } from "@/lib/i18n";
import { useStore } from "@/lib/store/AppStore";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Split-frame mark: two offset rectangles, one filled, one open. Reads as two
 * views of the same subject. No megaphone, globe or newspaper.
 */
export function Mark({ className = "mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="1" y="4" width="13" height="16" fill="currentColor" />
      <rect
        x="10"
        y="4"
        width="13"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

const NAV: Array<{ href: string; key: UiKey }> = [
  { href: "/explore", key: "nav.explore" },
  { href: "/changes", key: "nav.changes" },
  { href: "/education", key: "nav.education" },
  { href: "/my-reading", key: "nav.myReading" },
  { href: "/community", key: "nav.community" },
  { href: "/transparency", key: "nav.transparency" },
  { href: "/about", key: "nav.about" },
];

export function Masthead() {
  const { user, hydrated, signOut, prefs } = useStore();
  const pathname = usePathname();
  const t = (key: UiKey) => translate(prefs.language, key);

  const isCurrent = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const staffLinks = [
    user?.roles.includes("panel") && { href: "/panel", key: "nav.panel" as UiKey },
    user?.roles.includes("moderator") && { href: "/moderation", key: "nav.moderation" as UiKey },
    user?.roles.includes("admin") && { href: "/admin", key: "nav.admin" as UiKey },
  ].filter(Boolean) as Array<{ href: string; key: UiKey }>;

  return (
    <header className="masthead">
      <div className="shell masthead-inner">
        <Link href="/" className="wordmark">
          <Mark />
          Counterframe
        </Link>

        <nav className="nav" aria-label={t("nav.primary")}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              {t(item.key)}
            </Link>
          ))}
          {staffLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="masthead-tools">
          <LanguageSwitcher />
          <ThemeToggle />
          {/* Auth-dependent UI waits for hydration so SSR and first paint match. */}
          {hydrated && user ? (
            <>
              <Link href={`/profile/${encodeURIComponent(user.pseudonym)}`} className="btn">
                {user.pseudonym}
              </Link>
              <button type="button" className="btn" data-variant="quiet" onClick={signOut}>
                {t("nav.signOut")}
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="btn" data-variant="primary">
              {hydrated ? t("nav.signIn") : t("nav.signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
