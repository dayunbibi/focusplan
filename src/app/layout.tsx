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
  description: "수업부터 공부 계획까지 한곳에서 관리하는 학생용 플래너",
};

// 페인트 전에 저장된 테마를 <html data-theme>에 반영 (없으면 시스템 설정 따름)
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem("focusplan-theme")||"system"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
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
