/**
 * The risk engine. Deterministic and explainable by design.
 *
 * Every number in a dossier traces back to affinity deltas:
 *   delta = marketAffinity - brandAffinity   (per taste dimension)
 *
 * A positive delta means the market wants something the brand under-speaks.
 * A negative delta means the brand leans into something the market rejects.
 * Flags, scores, segment calls, and mitigations are all pure functions of
 * these deltas. There is no black box: the evidence ledger ships with every
 * dossier and any analyst can recompute the score by hand.
 */

import type {
  AffinityEvidence,
  BrandProfile,
  MarketTaste,
  Mitigation,
  RiskDossier,
  RiskFlag,
  SegmentCall,
  VerdictBand,
} from "../types";

const r2 = (n: number) => Math.round(n * 100) / 100;

function buildLedger(brand: BrandProfile, market: MarketTaste): AffinityEvidence[] {
  const brandByName = new Map(brand.affinities.map((a) => [a.name, a]));
  const marketByName = new Map(market.affinities.map((a) => [a.name, a]));
  const names = new Set([...brandByName.keys(), ...marketByName.keys()]);
  const ledger: AffinityEvidence[] = [];
  for (const name of names) {
    const b = brandByName.get(name);
    const m = marketByName.get(name);
    const brandAffinity = b ? b.affinity : 0;
    const marketAffinity = m ? m.affinity : 0;
    ledger.push({
      dimension: name,
      kind: (b ?? m)!.kind,
      brandAffinity: r2(brandAffinity),
      marketAffinity: r2(marketAffinity),
      delta: r2(marketAffinity - brandAffinity),
    });
  }
  // Stable sort: |delta| desc, then dimension name asc (deterministic)
  ledger.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta) || (x.dimension < y.dimension ? -1 : 1));
  return ledger;
}

let flagSeq = 0;
const fid = () => `flag-${++flagSeq}`;

function detectFlags(
  ledger: AffinityEvidence[],
  marketSegments: { label: string }[]
): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const segLabels = marketSegments.map((s) => s.label);

  // 1. Taboo collision: the market hard-rejects something the brand leans into.
  // The brand must show a positive lean (> 0.05); mere neutrality is not a
  // collision, otherwise every brand would flag every market taboo.
  for (const e of ledger) {
    if (
      e.marketAffinity <= -0.6 &&
      e.brandAffinity > 0.05 &&
      (e.kind === "dining" || e.kind === "beverage" || e.kind === "media")
    ) {
      const severity = Math.round(Math.min(100, 55 + Math.abs(e.marketAffinity) * 45));
      flags.push({
        id: fid(),
        title: `Taboo collision: ${e.dimension}`,
        severity,
        category: "taboo",
        summary:
          `The market shows strong aversion to ${e.dimension} (${e.marketAffinity}), ` +
          `a dimension the brand actively leans into (${e.brandAffinity}). ` +
          `Any creative, product, or partnership touching this dimension risks backlash.`,
        evidence: [e],
        affectedSegments: segLabels,
      });
    }
  }

  // 2. Norms gap: brand leans into a fashion/values code the market rejects
  for (const e of ledger) {
    if (
      e.brandAffinity >= 0.5 &&
      e.marketAffinity <= -0.2 &&
      (e.kind === "fashion" || e.kind === "values")
    ) {
      const severity = Math.round(Math.min(100, 40 + (e.brandAffinity - e.marketAffinity) * 45));
      flags.push({
        id: fid(),
        title: `Norms gap: ${e.dimension}`,
        severity,
        category: "norms",
        summary:
          `${e.dimension} is core to the brand's identity (${e.brandAffinity}) but ` +
          `reads negatively in this market (${e.marketAffinity}). The brand's default ` +
          `visual and messaging code will misfire with the mainstream.`,
        evidence: [e],
        affectedSegments: segLabels.slice(0, 2),
      });
    }
  }

  // 3. Signaling gap: the market loves something the brand never speaks
  const signalDims = ledger.filter(
    (e) => e.marketAffinity >= 0.6 && e.brandAffinity < 0.25
  );
  if (signalDims.length > 0) {
    const top = signalDims.slice(0, 3);
    const severity = Math.round(
      Math.min(100, 30 + top.reduce((s, e) => s + e.delta, 0) * 28)
    );
    flags.push({
      id: fid(),
      title: "Unclaimed trust signals",
      severity,
      category: "signaling",
      summary:
        `The market strongly rewards ${top.map((e) => e.dimension.toLowerCase()).join(", ")}, ` +
        `none of which appear in the brand's current identity. Competitors who speak ` +
        `these codes will out-signal the brand on arrival.`,
      evidence: top,
      affectedSegments: segLabels,
    });
  }

  // 4. Saturation: brand enters where the market is already well served
  const contested = ledger.filter(
    (e) => e.marketAffinity >= 0.65 && e.brandAffinity >= 0.65
  );
  if (contested.length >= 2) {
    flags.push({
      id: fid(),
      title: "Contested ground",
      severity: 42,
      category: "saturation",
      summary:
        `On ${contested
          .slice(0, 3)
          .map((e) => e.dimension.toLowerCase())
          .join(", ")} the brand and the market already agree, which means ` +
        `incumbents own this territory. Entry without a sharper edge buys a price war.`,
      evidence: contested.slice(0, 3),
      affectedSegments: segLabels.slice(0, 1),
    });
  }

  // 5. Regulatory shadow: raised only when taboos touch ingestible categories
  const ingestTaboos = flags.filter(
    (f) =>
      f.category === "taboo" &&
      f.evidence.some((e) => e.kind === "dining" || e.kind === "beverage")
  );
  if (ingestTaboos.length > 0) {
    flags.push({
      id: fid(),
      title: "Regulatory shadow",
      severity: 68,
      category: "regulatory",
      summary:
        `Taboos in food and beverage categories in this market are typically ` +
        `backed by law, not just taste. Retail placement, advertising, and even ` +
        `packaging copy need legal pre-clearance before launch.`,
      evidence: ingestTaboos.flatMap((f) => f.evidence).slice(0, 3),
      affectedSegments: segLabels,
    });
  }

  // Stable order: severity desc, then id asc
  flags.sort((a, b) => b.severity - a.severity || (a.id < b.id ? -1 : 1));
  return flags;
}

const CATEGORY_WEIGHT: Record<RiskFlag["category"], number> = {
  taboo: 1.0,
  regulatory: 0.9,
  norms: 0.7,
  signaling: 0.5,
  saturation: 0.4,
};

function scoreFromFlags(flags: RiskFlag[]): number {
  let score = 12; // baseline: entering any new market carries risk
  for (const f of flags) {
    score += f.severity * CATEGORY_WEIGHT[f.category] * 0.42;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function bandFor(score: number): VerdictBand {
  if (score < 30) return "LOW";
  if (score < 50) return "GUARDED";
  if (score < 70) return "ELEVATED";
  return "SEVERE";
}

function segmentCalls(
  ledger: AffinityEvidence[],
  market: MarketTaste
): SegmentCall[] {
  // Each segment inherits the market-wide deltas (prototype simplification,
  // stated in the methodology page), tilted by a deterministic per-segment
  // factor so calls differ across segments without inventing data.
  return market.segments.map((s, i) => {
    const tilt = [1.15, 0.85, 1.0][i % 3];
    const top = ledger.slice(0, 3);
    const mean = top.reduce((acc, e) => acc + e.delta * tilt, 0) / Math.max(1, top.length);
    const stance: SegmentCall["stance"] =
      mean > 0.12 ? "embrace" : mean < -0.12 ? "reject" : "split";
    const named = top
      .slice(0, 2)
      .map((e) => e.dimension.toLowerCase())
      .join(" and ");
    const reason =
      stance === "embrace"
        ? `Over-indexes on ${named}, dimensions the brand already speaks. Natural early adopters.`
        : stance === "reject"
        ? `Misaligned on ${named}; the brand's default codes clash with this segment's taste. Expect indifference or pushback.`
        : `Pulls both ways on ${named}. Winnable with localized creative, risky with the global playbook.`;
    return {
      segmentId: s.id,
      label: s.label,
      share: s.share,
      stance,
      reason,
      evidence: top.map((e) => ({ ...e, delta: r2(e.delta * tilt) })),
    };
  });
}

function mitigationsFor(flags: RiskFlag[]): Mitigation[] {
  const out: Mitigation[] = [];
  let n = 0;
  const mid = () => `mit-${++n}`;
  const byCat = (c: RiskFlag["category"]) => flags.filter((f) => f.category === c);

  for (const f of byCat("taboo")) {
    out.push({
      id: mid(),
      title: "Scrub taboo dimensions from launch creative",
      detail:
        `Audit every launch asset against "${f.title}". Remove references, ` +
        `reformulate hero products, and brief every agency partner in writing. ` +
        `One stray reference costs more than the audit.`,
      addressesFlags: [f.id],
      effort: "low",
    });
  }
  for (const f of byCat("norms")) {
    out.push({
      id: mid(),
      title: "Localize the visual code before launch",
      detail:
        `Rebuild the launch visual system around the market's norms instead of ` +
        `importing the home-market code. Co-design with two local creatives and ` +
        `test the top three assets against "${f.title}" explicitly.`,
      addressesFlags: [f.id],
      effort: "medium",
    });
  }
  for (const f of byCat("signaling")) {
    const dims = f.evidence.map((e) => e.dimension.toLowerCase()).join(", ");
    out.push({
      id: mid(),
      title: "Borrow the market's trust signals",
      detail:
        `The market already trusts ${dims}. Weave these codes into packaging, ` +
        `partnerships, and launch events so the brand arrives fluent instead of foreign.`,
      addressesFlags: [f.id],
      effort: "medium",
    });
  }
  for (const f of byCat("saturation")) {
    out.push({
      id: mid(),
      title: "Enter on a sharper edge",
      detail:
        `Do not compete head-on where incumbents own the codes. Pick the single ` +
        `dimension with the largest positive delta and make it the entire launch story.`,
      addressesFlags: [f.id],
      effort: "high",
    });
  }
  for (const f of byCat("regulatory")) {
    out.push({
      id: mid(),
      title: "Pre-clear retail and advertising",
      detail:
        `Engage local counsel before signing retail or media. Map every ` +
        `restricted category to a compliant alternative and keep the paper trail.`,
      addressesFlags: [f.id],
      effort: "medium",
    });
  }

  // Strategic closer, always present and always last
  out.push({
    id: mid(),
    title: "Pilot inside the most aligned segment",
    detail:
      `Launch to the embrace segment first, earn proof, then expand. A small ` +
      `win with the right crowd beats a broad launch to the wrong one.`,
    addressesFlags: flags.slice(0, 3).map((f) => f.id),
    effort: "low",
  });

  return out;
}

function headlineFor(
  band: VerdictBand,
  brandName: string,
  marketLabel: string,
  flags: RiskFlag[]
): string {
  const top = flags[0];
  switch (band) {
    case "LOW":
      return `${brandName} arrives fluent in ${marketLabel}. No structural cultural barriers detected.`;
    case "GUARDED":
      return `${brandName} can work in ${marketLabel}, provided ${top ? top.title.toLowerCase() : "localization gaps"} are addressed before launch.`;
    case "ELEVATED":
      return `${brandName} faces real cultural headwinds in ${marketLabel}. Launching on the home-market playbook is not advised.`;
    case "SEVERE":
      return `${brandName} is culturally misaligned with ${marketLabel} as currently positioned. Rethink the entry or reposition first.`;
  }
}

/** Run the full pipeline. Pure function of (brand, market) — no I/O, no AI. */
export function analyzeRisk(brand: BrandProfile, market: MarketTaste): RiskDossier {
  flagSeq = 0; // reset per run so IDs are deterministic
  const ledger = buildLedger(brand, market);
  const flags = detectFlags(ledger, market.segments);
  const score = scoreFromFlags(flags);
  const band = bandFor(score);
  return {
    score,
    band,
    headline: headlineFor(band, brand.name, market.label, flags),
    flags,
    segments: segmentCalls(ledger, market),
    mitigations: mitigationsFor(flags),
    ledger,
    computedAt: new Date().toISOString(),
  };
}
