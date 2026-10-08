import type { Metadata } from "next";

export const metadata: Metadata = { title: "Methodology" };

const RULES = [
  {
    name: "Taboo collision",
    body: "Fires when the market shows strong aversion (affinity at or below -0.6) to a dining, beverage, or media dimension the brand leans into (above 0.05). Mere neutrality does not count: otherwise every brand would flag every market taboo.",
  },
  {
    name: "Norms gap",
    body: "Fires when the brand leans into a fashion or values code (affinity at or above 0.5) that the market reads negatively (at or below -0.2). The brand's default visual and messaging code will misfire with the mainstream.",
  },
  {
    name: "Unclaimed trust signals",
    body: "Fires when the market strongly rewards dimensions (affinity at or above 0.6) the brand never speaks (below 0.25). Competitors fluent in these codes out-signal the brand on arrival.",
  },
  {
    name: "Contested ground",
    body: "Fires when brand and market already agree strongly (both at or above 0.65) on two or more dimensions. Agreement means incumbents own the territory; entry without a sharper edge buys a price war.",
  },
  {
    name: "Regulatory shadow",
    body: "Raised only when taboos touch food or beverage categories, where aversion is typically backed by law rather than taste. Retail, advertising, and packaging need legal pre-clearance.",
  },
];

export default function Methodology() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-14 pb-20">
      <p className="micro-label mb-4">How the desk thinks</p>
      <h1 className="font-display text-4xl md:text-5xl mb-6">Methodology</h1>
      <p className="text-lg text-inkdim mb-4">
        FauxPas measures cultural alignment between a brand and a market using
        taste-graph affinity data, then reasons about the gap. The core
        operation is a single subtraction, applied per taste dimension:
      </p>
      <div className="border border-hairline bg-panel p-6 my-8">
        <p className="font-mono text-sm tnum">
          delta = market affinity − brand affinity
        </p>
        <p className="text-sm text-inkdim mt-3">
          Affinities run from -1.0 (strong aversion) to +1.0 (strong affinity).
          A positive delta means the market wants something the brand
          under-speaks. A negative delta means the brand leans into something
          the market rejects.
        </p>
      </div>

      <p className="micro-label mb-6 mt-12">The five flag rules</p>
      <div className="space-y-px bg-hairline border border-hairline mb-12">
        {RULES.map((r) => (
          <div key={r.name} className="bg-canvas p-6">
            <p className="font-mono text-xs tracking-[0.18em] uppercase text-stamp mb-3">
              {r.name}
            </p>
            <p className="text-inkdim text-sm leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>

      <p className="micro-label mb-6">Scoring</p>
      <div className="text-inkdim space-y-4 mb-12">
        <p>
          The composite score starts at a baseline of 12. Every new market
          carries risk, even a friendly one. Each flag adds its severity
          weighted by category: taboos and regulatory shadows weigh most,
          contested ground weighs least. The total is clamped to 0–100 and
          banded: below 30 is LOW, below 50 GUARDED, below 70 ELEVATED,
          anything above SEVERE.
        </p>
        <p>
          Segment calls inherit the market-wide deltas, tilted deterministically
          per segment so the embrace, reject, and split calls differ without
          inventing data. The tilt factors are fixed constants, published here,
          not tuned per scan.
        </p>
      </div>

      <p className="micro-label mb-6">Limits</p>
      <div className="border border-hairline bg-panel p-8">
        <div className="text-inkdim space-y-4">
          <p>
            This engine is deterministic: the same brand and market always
            produce the same dossier. That is a feature for auditability and a
            limit for nuance. It cannot see a brilliant local partnership, a
            generational creative director, or a market in the middle of
            changing its mind.
          </p>
          <p>
            The prototype runs on curated mock taste data. Production dossiers
            must be computed against the live Qloo taste graph before anyone
            stakes a launch budget on them.
          </p>
        </div>
      </div>
    </div>
  );
}
