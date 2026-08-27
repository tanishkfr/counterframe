"use client";

import { translate } from "@/lib/i18n";
import { useStore } from "@/lib/store/AppStore";

const ORDER = ["system", "light", "dark"] as const;

const LABEL: Record<(typeof ORDER)[number], string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function ThemeToggle() {
  const { prefs, setPrefs, announce } = useStore();

  const cycle = () => {
    const index = ORDER.indexOf(prefs.theme);
    const next = ORDER[(index + 1) % ORDER.length] ?? "system";
    setPrefs({ theme: next });
    announce(`Colour theme set to ${LABEL[next].toLowerCase()}.`);
  };

  return (
    <button
      type="button"
      className="btn"
      data-variant="quiet"
      onClick={cycle}
      aria-label={`${translate(prefs.language, "theme.toggle")}: ${LABEL[prefs.theme]}. Activate to change.`}
    >
      <ThemeIcon theme={prefs.theme} />
      <span aria-hidden="true">{LABEL[prefs.theme]}</span>
    </button>
  );
}

function ThemeIcon({ theme }: { theme: (typeof ORDER)[number] }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {theme === "dark" && <path d="M8 2a6 6 0 0 0 0 12z" fill="currentColor" />}
      {theme === "light" && <circle cx="8" cy="8" r="3" fill="currentColor" />}
      {theme === "system" && <path d="M8 2v12" stroke="currentColor" strokeWidth="1.5" />}
    </svg>
  );
}
