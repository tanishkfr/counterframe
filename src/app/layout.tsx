import type { Metadata, Viewport } from "next";
import { Noto_Sans_Devanagari, Public_Sans, Source_Serif_4 } from "next/font/google";

import { Announcer } from "@/components/layout/Announcer";
import { Footer } from "@/components/layout/Footer";
import { Masthead } from "@/components/layout/Masthead";
import { ThemeController } from "@/components/layout/ThemeController";
import { AppStoreProvider } from "@/lib/store/AppStore";

import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

const sans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public-sans",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-deva",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Counterframe",
    template: "%s — Counterframe",
  },
  description:
    "Counterframe places contrasting coverage of the same issue side by side, and publishes every editorial, moderation and funding decision behind it.",
  applicationName: "Counterframe",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#17150f" },
  ],
};

/**
 * Applied before first paint so a stored theme choice never flashes the wrong
 * palette. Kept deliberately tiny and dependency-free.
 */
const THEME_BOOTSTRAP = `(function(){try{var p=JSON.parse(localStorage.getItem("counterframe.prefs.v1")||"{}");if(p.theme==="dark"||p.theme==="light"){document.documentElement.setAttribute("data-theme",p.theme);}if(p.reduceMotion==="always"){document.documentElement.setAttribute("data-reduce-motion","always");}if(p.language==="hi"){document.documentElement.setAttribute("lang","hi");}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className={`${serif.variable} ${sans.variable} ${devanagari.variable}`}>
        <AppStoreProvider>
          <ThemeController />
          <a className="skip-link" href="#main">
            Skip to main content
          </a>
          <Masthead />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <Announcer />
        </AppStoreProvider>
      </body>
    </html>
  );
}
