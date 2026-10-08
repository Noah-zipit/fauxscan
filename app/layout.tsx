import type { Metadata } from "next";
import { Newsreader, Archivo, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sans = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "FauxPas — Cultural risk intelligence for market entry",
    template: "%s — FauxPas",
  },
  description:
    "FauxPas stress-tests a brand against a target market's taste profile and produces an explainable cultural risk dossier before launch.",
  metadataBase: new URL("https://fauxscan.vercel.app"),
  openGraph: {
    title: "FauxPas — Cultural risk intelligence for market entry",
    description:
      "Agentic due diligence for brands entering new markets. Explainable risk dossiers, computed over the taste graph.",
    type: "website",
  },
};

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="FauxPas home">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <circle cx="13" cy="13" r="8" stroke="#ECE7D9" strokeWidth="1.6" />
        <line x1="19" y1="19" x2="27" y2="27" stroke="#E5484D" strokeWidth="2" />
        <line x1="13" y1="9" x2="13" y2="13" stroke="#E5484D" strokeWidth="1.6" />
        <line x1="13" y1="13" x2="13" y2="17" stroke="#E5484D" strokeWidth="1.6" />
        <line x1="9" y1="13" x2="13" y2="13" stroke="#E5484D" strokeWidth="1.6" />
        <line x1="13" y1="13" x2="17" y2="13" stroke="#E5484D" strokeWidth="1.6" />
      </svg>
      <span className="font-mono text-sm tracking-[0.22em] uppercase text-ink">
        FauxPas
      </span>
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-canvas text-ink">
        <header className="border-b border-hairline">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Wordmark />
            <nav className="flex items-center gap-7" aria-label="Primary">
              <Link
                href="/dashboard"
                className="hidden md:inline font-mono text-xs tracking-[0.14em] uppercase text-inkdim hover:text-ink"
              >
                Dossiers
              </Link>
              <Link
                href="/methodology"
                className="hidden md:inline font-mono text-xs tracking-[0.14em] uppercase text-inkdim hover:text-ink"
              >
                Methodology
              </Link>
              <Link
                href="/scan/new"
                className="font-mono text-xs tracking-[0.14em] uppercase bg-ink text-canvas px-4 py-2.5 hover:bg-stamp min-h-[44px] inline-flex items-center"
              >
                New scan
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-hairline mt-24">
          <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <p className="micro-label">
              FauxPas — cultural risk intelligence. Prototype dossier engine.
            </p>
            <nav className="flex gap-6" aria-label="Footer">
              <Link href="/methodology" className="micro-label hover:text-inkdim">
                Methodology
              </Link>
              <Link href="/terms" className="micro-label hover:text-inkdim">
                Terms
              </Link>
              <Link href="/privacy" className="micro-label hover:text-inkdim">
                Privacy
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
