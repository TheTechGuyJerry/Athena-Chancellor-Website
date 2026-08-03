import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: {
    default: "Osita Chidoka — Public Servant · Writer · Institution Builder",
    template: "%s — Osita Chidoka",
  },
  description:
    "Writing and public work on governance, leadership, and institution building in Nigeria.",
  other: {
    "codex-preview": "development",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
