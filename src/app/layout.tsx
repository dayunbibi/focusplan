import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "FocusPlan",
    template: "%s | FocusPlan",
  },
  description: "A student planner for classes, tasks, exams, and study plans in one place",
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
