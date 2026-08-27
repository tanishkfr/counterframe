import type { Database, LanguageCode, Translation } from "./types";

/**
 * Interface language. Distinct from content translation: switching the
 * interface to Hindi does not claim that all content is available in Hindi.
 * Where an approved content translation is missing, the reader is told so
 * explicitly rather than being shown silent English.
 *
 * Keys missing from the Hindi dictionary fall back to English. That fallback
 * is normal and visible; it is not treated as an error state.
 */

export const LANGUAGES: Array<{ code: LanguageCode; label: string; endonym: string; htmlLang: string }> = [
  { code: "en", label: "English", endonym: "English", htmlLang: "en" },
  { code: "hi", label: "Hindi", endonym: "हिन्दी", htmlLang: "hi" },
];

const en = {
  "nav.explore": "Explore",
  "nav.education": "Education",
  "nav.myReading": "My reading",
  "nav.community": "Community",
  "nav.transparency": "Transparency",
  "nav.about": "About",
  "nav.skip": "Skip to main content",
  "nav.primary": "Primary",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",
  "nav.signUp": "Create account",
  "nav.account": "Account",
  "nav.panel": "Panel",
  "nav.moderation": "Moderation",
  "nav.admin": "Admin",

  "issue.viewpointA": "Viewpoint A",
  "issue.viewpointB": "Viewpoint B",
  "issue.additional": "Additional perspectives",
  "issue.comparison": "Comparison",
  "issue.discussion": "Discussion",
  "issue.history": "History",
  "issue.funding": "Funding",
  "issue.whyContrast": "Why these sources contrast",
  "issue.sourceSwitcher": "Other sources for this viewpoint",
  "issue.openOriginal": "Open original source",
  "issue.focus": "Focus this article",
  "issue.exitFocus": "Restore comparison",
  "issue.syncScroll": "Synchronise scrolling",
  "issue.annotations": "Show media-tactic annotations",
  "issue.sourceDetail": "Full source evaluation",
  "issue.restore": "Restore comparison",

  "reading.notStarted": "Not started",
  "reading.inProgress": "In progress",
  "reading.completed": "Completed",
  "reading.progress": "Reading progress",
  "reading.checkpoint": "Reading checkpoint",
  "reading.markComplete": "Mark as read",
  "reading.locked": "Checkpoint locked",

  "stance.heading": "Where do you stand?",
  "stance.community": "Community stance",
  "stance.distribution": "Current community distribution",
  "stance.change": "Change your stance",
  "stance.note":
    "This shows what people on Counterframe currently think. It is not a measurement of source bias, and a majority position is not evidence that the majority is right.",

  "action.save": "Save",
  "action.cancel": "Cancel",
  "action.publish": "Publish",
  "action.reply": "Reply",
  "action.report": "Report",
  "action.submit": "Submit",
  "action.close": "Close",
  "action.expand": "Expand",
  "action.collapse": "Collapse",

  "lang.switcher": "Language",
  "lang.noTranslation": "No approved Hindi translation is available for this text yet.",
  "lang.sourceUntranslated":
    "Quoted source text is shown in its original language. Counterframe does not translate source quotations.",
  "theme.toggle": "Colour theme",
} as const;

export type UiKey = keyof typeof en;

const hi: Partial<Record<UiKey, string>> = {
  "nav.explore": "खोजें",
  "nav.education": "शिक्षा",
  "nav.myReading": "मेरा पठन",
  "nav.community": "समुदाय",
  "nav.transparency": "पारदर्शिता",
  "nav.about": "परिचय",
  "nav.skip": "मुख्य सामग्री पर जाएँ",
  "nav.primary": "मुख्य",
  "nav.signIn": "साइन इन",
  "nav.signOut": "साइन आउट",
  "nav.signUp": "खाता बनाएँ",
  "nav.account": "खाता",
  "nav.panel": "पैनल",
  "nav.moderation": "मॉडरेशन",
  "nav.admin": "प्रशासन",

  "issue.viewpointA": "दृष्टिकोण A",
  "issue.viewpointB": "दृष्टिकोण B",
  "issue.additional": "अतिरिक्त दृष्टिकोण",
  "issue.comparison": "तुलना",
  "issue.discussion": "चर्चा",
  "issue.history": "इतिहास",
  "issue.funding": "वित्तपोषण",
  "issue.whyContrast": "ये स्रोत क्यों भिन्न हैं",
  "issue.sourceSwitcher": "इस दृष्टिकोण के अन्य स्रोत",
  "issue.openOriginal": "मूल स्रोत खोलें",
  "issue.focus": "इस लेख पर ध्यान केंद्रित करें",
  "issue.exitFocus": "तुलना पुनः दिखाएँ",
  "issue.syncScroll": "स्क्रॉल समन्वित करें",
  "issue.annotations": "मीडिया-रणनीति टिप्पणियाँ दिखाएँ",
  "issue.sourceDetail": "पूर्ण स्रोत मूल्यांकन",
  "issue.restore": "तुलना पुनः दिखाएँ",

  "reading.notStarted": "प्रारंभ नहीं हुआ",
  "reading.inProgress": "जारी है",
  "reading.completed": "पूर्ण",
  "reading.progress": "पठन प्रगति",
  "reading.checkpoint": "पठन जाँच-बिंदु",
  "reading.markComplete": "पढ़ा हुआ चिह्नित करें",
  "reading.locked": "जाँच-बिंदु बंद है",

  "stance.heading": "आपका क्या मत है?",
  "stance.community": "सामुदायिक मत",
  "stance.distribution": "वर्तमान सामुदायिक वितरण",
  "stance.change": "अपना मत बदलें",
  "stance.note":
    "यह दर्शाता है कि Counterframe पर लोग वर्तमान में क्या सोचते हैं। यह स्रोत-पक्षपात का माप नहीं है, और बहुमत का मत इस बात का प्रमाण नहीं है कि बहुमत सही है।",

  "action.save": "सहेजें",
  "action.cancel": "रद्द करें",
  "action.publish": "प्रकाशित करें",
  "action.reply": "उत्तर दें",
  "action.report": "रिपोर्ट करें",
  "action.submit": "जमा करें",
  "action.close": "बंद करें",
  "action.expand": "विस्तार करें",
  "action.collapse": "संक्षिप्त करें",

  "lang.switcher": "भाषा",
  "lang.noTranslation": "इस पाठ का अनुमोदित हिंदी अनुवाद अभी उपलब्ध नहीं है।",
  "lang.sourceUntranslated":
    "उद्धृत स्रोत पाठ अपनी मूल भाषा में दिखाया गया है। Counterframe स्रोत उद्धरणों का अनुवाद नहीं करता।",
  "theme.toggle": "रंग थीम",
};

const DICTIONARIES: Record<LanguageCode, Partial<Record<UiKey, string>>> = { en, hi };

export function translate(language: LanguageCode, key: UiKey): string {
  return DICTIONARIES[language][key] ?? en[key];
}

/* ------------------------- content translations ------------------------- */

export interface ResolvedText {
  text: string;
  /** True when the requested language was unavailable and English is shown. */
  fellBack: boolean;
  status: Translation["status"];
  credit?: string;
}

/**
 * Resolves one field of a content record into the requested language.
 * Only `panel-approved` translations are shown to readers by default; drafts
 * and unreviewed submissions are visible in the panel review queue instead.
 */
export function resolveContent(
  db: Database,
  targetType: Translation["targetType"],
  targetId: string,
  field: string,
  language: LanguageCode,
  fallback: string,
): ResolvedText {
  if (language === "en") {
    return { text: fallback, fellBack: false, status: "original" };
  }
  const translation = db.translations.find(
    (t) =>
      t.targetType === targetType &&
      t.targetId === targetId &&
      t.language === language &&
      t.status === "panel-approved",
  );
  const value = translation?.content[field];
  if (!translation || !value) {
    return { text: fallback, fellBack: true, status: "original" };
  }
  return {
    text: value,
    fellBack: false,
    status: translation.status,
    credit: translation.translatorCredit,
  };
}
