"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge, EmptyState, Notice } from "@/components/primitives";
import { LANGUAGES } from "@/lib/i18n";
import { ROLE_DESCRIPTION, ROLE_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store/AppStore";
import type { LanguageCode } from "@/lib/types";

export function SettingsView() {
  const { user, hydrated, prefs, setPrefs, updatePrivacy, updateProfile } = useStore();
  const [bio, setBio] = useState("");
  const [region, setRegion] = useState("");
  const [savedProfile, setSavedProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio ?? "");
      setRegion(user.region ?? "");
    }
  }, [user]);

  if (!hydrated) {
    return (
      <div className="shell page">
        <p className="meta">Loading settings…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="shell page">
        <EmptyState
          title="Sign in to change your settings"
          action={
            <Link href="/auth/login" className="btn" data-variant="primary">
              Sign in
            </Link>
          }
        >
          Appearance, language and reduced motion can be changed from the masthead without an
          account. Privacy and profile settings need one.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="shell page" style={{ maxWidth: "48rem" }}>
      <header className="page-head">
        <p className="eyebrow">Settings</p>
        <h1 className="display">Settings and privacy</h1>
      </header>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Appearance and reading</h2>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="set-theme">
            Colour theme
            <span className="field-hint">
              System follows your device setting. Dark mode uses warm charcoal rather than pure
              black, so source images stay readable.
            </span>
          </label>
          <select
            id="set-theme"
            className="select"
            value={prefs.theme}
            onChange={(e) => setPrefs({ theme: e.target.value as typeof prefs.theme })}
            style={{ maxWidth: "16rem" }}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="set-language">
            Interface language
            <span className="field-hint">
              Switching to Hindi does not claim all content is translated. Where an approved
              translation is missing, you are told so rather than shown silent English.
            </span>
          </label>
          <select
            id="set-language"
            className="select"
            value={prefs.language}
            onChange={(e) => setPrefs({ language: e.target.value as LanguageCode })}
            style={{ maxWidth: "16rem" }}
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.endonym} ({language.label})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="set-motion">
            Motion
            <span className="field-hint">
              Counterframe already honours your operating system&rsquo;s reduced-motion setting.
              This forces it on regardless, for machines where that setting cannot be changed.
            </span>
          </label>
          <select
            id="set-motion"
            className="select"
            value={prefs.reduceMotion}
            onChange={(e) =>
              setPrefs({ reduceMotion: e.target.value as typeof prefs.reduceMotion })
            }
            style={{ maxWidth: "16rem" }}
          >
            <option value="system">Follow system setting</option>
            <option value="always">Always reduce motion</option>
          </select>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={prefs.showAnnotations}
            onChange={(e) => setPrefs({ showAnnotations: e.target.checked })}
          />
          <span>
            Show media-tactic annotations by default
            <span className="field-hint">
              Annotations are editorial commentary on the source text. They never alter it.
            </span>
          </span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={prefs.syncScroll}
            onChange={(e) => setPrefs({ syncScroll: e.target.checked })}
          />
          <span>
            Synchronise scrolling between comparison panes
            <span className="field-hint">
              Off by default. The two articles are different lengths, so synchronisation matches
              proportion rather than pixels.
            </span>
          </span>
        </label>
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Public profile</h2>
        </div>
        <p className="meta" style={{ marginBlockEnd: "var(--s-4)" }}>
          Your pseudonym is <strong>{user.pseudonym}</strong>. It is the only name shown anywhere on
          Counterframe. Your email address is never displayed.
        </p>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            updateProfile({ bio: bio.trim() || undefined, region: region.trim() || undefined });
            setSavedProfile(true);
          }}
        >
          <div className="field">
            <label className="field-label" htmlFor="set-bio">
              Bio <span className="field-hint">Optional. Shown on your public profile.</span>
            </label>
            <textarea
              id="set-bio"
              className="textarea"
              style={{ minHeight: "5rem" }}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setSavedProfile(false);
              }}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="set-region">
              Region <span className="field-hint">Optional.</span>
            </label>
            <input
              id="set-region"
              className="input"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setSavedProfile(false);
              }}
              style={{ maxWidth: "20rem" }}
            />
          </div>
          <button type="submit" className="btn" data-variant="primary">
            Save profile
          </button>
          {savedProfile && (
            <p className="meta" role="status" style={{ marginBlockStart: "var(--s-3)" }}>
              Profile saved.
            </p>
          )}
        </form>
      </section>

      <section style={{ marginBlockEnd: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Privacy</h2>
        </div>

        <Notice>
          Counterframe never requires a real name. Aggregate counts always include you; what these
          settings control is whether anything is <strong>attributed</strong> to you.
        </Notice>

        <div style={{ marginBlockStart: "var(--s-4)" }}>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={user.privacy.showInVoterLists}
              onChange={(e) => updatePrivacy({ showInVoterLists: e.target.checked })}
            />
            <span>
              Show my pseudonym in voter lists
              <span className="field-hint">
                Off, your vote still counts in every stance total. It is simply not attributed.
              </span>
            </span>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={user.privacy.publicStanceHistory}
              onChange={(e) => updatePrivacy({ publicStanceHistory: e.target.checked })}
            />
            <span>
              Publish my stance-change timeline
              <span className="field-hint">
                Off by default. Counterframe keeps your timeline either way, and you can always see
                it in My reading. Publishing it is opt-in because a public record of someone
                changing their mind can be used against them.
              </span>
            </span>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={user.privacy.publicReadingHistory}
              onChange={(e) => updatePrivacy({ publicReadingHistory: e.target.checked })}
            />
            <span>
              Show which articles I have completed on my profile
              <span className="field-hint">
                The completion badge on your own takes stays visible either way — it is what
                entitled you to post.
              </span>
            </span>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={user.privacy.namedContributionsByDefault}
              onChange={(e) => updatePrivacy({ namedContributionsByDefault: e.target.checked })}
            />
            <span>
              Attach my pseudonym to contributions by default
              <span className="field-hint">
                Every contribution form lets you override this. Amounts, dates and destinations are
                always published regardless.
              </span>
            </span>
          </label>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Your access</h2>
        </div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {user.roles.map((role) => (
            <li
              key={role}
              style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-3)" }}
            >
              <Badge tone="ink">{ROLE_LABEL[role]}</Badge>
              <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
                {ROLE_DESCRIPTION[role]}
              </p>
            </li>
          ))}
        </ul>
        <p className="meta" style={{ marginBlockStart: "var(--s-4)" }}>
          Moderator, panel and administrator roles are granted by an administrator and are never
          self-assigned.
        </p>
      </section>
    </div>
  );
}
