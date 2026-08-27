"use client";

import { LANGUAGES, translate } from "@/lib/i18n";
import { useStore } from "@/lib/store/AppStore";
import type { LanguageCode } from "@/lib/types";

export function LanguageSwitcher() {
  const { prefs, setPrefs, announce } = useStore();

  return (
    <div className="btn" data-variant="quiet" style={{ padding: 0 }}>
      <label htmlFor="lang-select" className="sr-only">
        {translate(prefs.language, "lang.switcher")}
      </label>
      <select
        id="lang-select"
        className="focus-inset"
        value={prefs.language}
        onChange={(event) => {
          const language = event.target.value as LanguageCode;
          setPrefs({ language });
          announce(
            language === "hi"
              ? "इंटरफ़ेस भाषा हिन्दी पर सेट की गई।"
              : "Interface language set to English.",
          );
        }}
        style={{
          background: "transparent",
          border: "none",
          padding: "0.3rem 0.5rem",
          fontSize: "var(--step--1)",
          fontWeight: 600,
          color: "var(--ink-muted)",
          cursor: "pointer",
        }}
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} lang={language.htmlLang}>
            {language.endonym}
          </option>
        ))}
      </select>
    </div>
  );
}
