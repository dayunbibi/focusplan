import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

// Vercel sets VERCEL_PROJECT_PRODUCTION_URL (without https://) on every deployment, so
// link previews always point at the production domain. Falls back to localhost in dev.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const description = "A student planner for classes, tasks, exams, and study plans in one place";
const shareDescription = `${description}. Try the demo account, no sign-up needed.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FocusPlan",
    template: "%s | FocusPlan",
  },
  description,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "FocusPlan",
    title: "FocusPlan",
    description: shareDescription,
    locale: "en_CA",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FocusPlan Today, Timetable, and Tasks screens" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusPlan",
    description: shareDescription,
    images: ["/og-image.png"],
  },
};

// Apply the saved theme to <html data-theme> before first paint (falls back to the system setting)
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem("focusplan-theme")||"system"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      data-theme="system"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Script id="focusplan-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
