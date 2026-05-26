import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Spend Auditor",
  description: "Instant audit for AI tooling spend",
  applicationName: "AI Spend Auditor",
  twitter: {
    card: "summary",
    title: "AI Spend Auditor",
    description: "Instant audit for AI tooling spend"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d4d8a"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skipLink" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
