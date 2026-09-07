import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FocusPlan",
    template: "%s | FocusPlan",
  },
  description: "수업부터 공부 계획까지 한곳에서 관리하는 학생용 플래너",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
