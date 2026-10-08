import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cultural risk intelligence for market entry",
};

const PHASES = [
  {
    name: "Ingest",
    body: "The agent pulls the brand's taste profile, what its audience loves, and the target market's taste profile, what the market loves and rejects, from the taste graph.",
  },
  {
    name: "Compute",
    body: "Every dimension is differenced: market affinity minus brand affinity. The deltas drive deterministic risk flags. Nothing is a black box; the full evidence ledger ships with the dossier.",
  },
  {
    name: "Dossier",
    body: "You get a risk score, the segments likely to embrace or reject the brand with reasons, cultural red flags with their evidence, and concrete mitigations. An analyst's brief, not a chatbot reply.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero — left aligned, editorial */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <p className="micro-label mb-6">Cultural risk intelligence — Field memo 001</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.04] max-w-4xl">
          Know how a market will receive you{" "}
          <span className="text-inkdim">before you spend a dollar there.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-inkdim">
          Brands expanding into new markets get blindsided by cultural mismatch:
          the campaign that flops, the product that offends, the launch nobody
          asked for. FauxPas is an agentic due-diligence desk. It
          stress-tests your brand against a market&apos;s taste profile and
          hands you the risk dossier before you commit.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/scan/new"
            className="font-mono text-sm tracking-[0.14em] uppercase bg-ink text-canvas px-7 py-4 hover:bg-stamp min-h-[52px] inline-flex items-center"
          >
            Run a risk scan
          </Link>
          <Link
            href="/dashboard"
            className="font-mono text-sm tracking-[0.14em] uppercase border border-hairline px-7 py-4 hover:border-inkfaint min-h-[52px] inline-flex items-center"
          >
            Read sample dossiers
          </Link>
        </div>
      </section>

      <div className="rule max-w-6xl mx-auto" />

      {/* How it works — phases, not numbered cards */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="micro-label mb-10">How the desk works</p>
        <div className="grid md:grid-cols-3 gap-px bg-hairline border border-hairline">
          {PHASES.map((p) => (
            <div key={p.name} className="bg-canvas p-8">
              <p className="font-mono text-xs tracking-[0.18em] uppercase text-stamp mb-4">
                {p.name}
              </p>
              <p className="text-inkdim leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rule max-w-6xl mx-auto" />

      {/* What you get */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="micro-label mb-10">Inside every dossier</p>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 max-w-5xl">
          <div>
            <h3 className="font-display text-2xl mb-3">A composite risk score, with receipts</h3>
            <p className="text-inkdim">
              One number from 0 to 100, banded LOW to SEVERE. Every point of it
              traces to measured affinity deltas between the brand and the
              market. The evidence ledger is published alongside, so any
              analyst can recompute it by hand.
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl mb-3">Embrace and reject maps</h3>
            <p className="text-inkdim">
              The market is not one audience. The dossier calls each segment:
              who embraces the brand, who rejects it, who is split, with the
              specific taste evidence behind each call.
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl mb-3">Red flags with evidence</h3>
            <p className="text-inkdim">
              Taboo collisions, norms gaps, unclaimed trust signals, contested
              ground, regulatory shadows. Each flag carries its severity, the
              affected segments, and the exact deltas that raised it.
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl mb-3">Mitigations, not just warnings</h3>
            <p className="text-inkdim">
              Every flag maps to concrete actions: what to scrub, what to
              localize, which trust signals to borrow, where to pilot first.
              A dossier that only warns is half a product.
            </p>
          </div>
        </div>
      </section>

      <div className="rule max-w-6xl mx-auto" />

      {/* Honest scope note */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-3xl border border-hairline bg-panel p-8">
          <p className="micro-label mb-4">A note on what this is</p>
          <p className="text-inkdim leading-relaxed">
            FauxPas is a decision-support instrument, not a verdict machine.
            It measures cultural alignment from taste-graph data and makes its
            reasoning auditable. It does not replace local counsel, on-the-ground
            research, or judgment. Markets are made of people, and people
            surprise models. Use the dossier to ask sharper questions, not to
            skip asking them.
          </p>
        </div>
        <div className="mt-10">
          <Link
            href="/scan/new"
            className="font-mono text-sm tracking-[0.14em] uppercase bg-ink text-canvas px-7 py-4 hover:bg-stamp min-h-[52px] inline-flex items-center"
          >
            Scan your brand
          </Link>
        </div>
      </section>
    </div>
  );
}
