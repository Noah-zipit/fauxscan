/**
 * Shared domain types for FauxPas.
 *
 * Affinity scale: -1.0 (strong cultural aversion) to +1.0 (strong cultural
 * affinity), 0.0 = neutral / no signal. Every risk number in a dossier must
 * trace back to affinity deltas — see lib/risk/risk-engine.ts.
 */

export type VerdictBand = "LOW" | "GUARDED" | "ELEVATED" | "SEVERE";

export interface BrandInput {
  name: string;
  category: string;
  products: string; // free text: key products / lines
}

export interface MarketInput {
  country: string;
  city: string;
  demographic: string; // free text: who the brand wants to reach
}

export interface EntityAffinity {
  entityId: string;
  name: string;
  kind:
    | "music"
    | "film"
    | "dining"
    | "fashion"
    | "beverage"
    | "values"
    | "retail"
    | "media";
  /** -1.0 .. 1.0 */
  affinity: number;
  /** 0.0 .. 1.0, how much signal sits behind the number */
  confidence: number;
}

export interface AudienceSegment {
  id: string;
  label: string;
  share: number; // 0..1 of the addressable market
  description: string;
}

export interface BrandProfile {
  brandId: string;
  name: string;
  category: string;
  /** What the brand's existing audience loves */
  affinities: EntityAffinity[];
  audience: AudienceSegment[];
}

export interface MarketTaste {
  marketId: string;
  label: string;
  /** What the market loves / rejects */
  affinities: EntityAffinity[];
  segments: AudienceSegment[];
  notes: string[];
}

export interface AffinityEvidence {
  dimension: string;
  kind: EntityAffinity["kind"];
  brandAffinity: number;
  marketAffinity: number;
  /** marketAffinity - brandAffinity, the load-bearing number */
  delta: number;
}

export interface RiskFlag {
  id: string;
  title: string;
  severity: number; // 0..100
  category: "taboo" | "norms" | "saturation" | "signaling" | "regulatory";
  summary: string;
  evidence: AffinityEvidence[];
  affectedSegments: string[];
}

export interface SegmentCall {
  segmentId: string;
  label: string;
  share: number;
  stance: "embrace" | "reject" | "split";
  reason: string;
  /** affinity deltas that justify the call */
  evidence: AffinityEvidence[];
}

export interface Mitigation {
  id: string;
  title: string;
  detail: string;
  addressesFlags: string[];
  effort: "low" | "medium" | "high";
}

export interface RiskDossier {
  score: number; // 0..100, higher = riskier
  band: VerdictBand;
  headline: string;
  flags: RiskFlag[];
  segments: SegmentCall[];
  mitigations: Mitigation[];
  /** every affinity delta consulted, for the evidence ledger */
  ledger: AffinityEvidence[];
  computedAt: string;
}

export type ScanStatus = "complete";

export interface Scan {
  id: string;
  brand: BrandInput;
  market: MarketInput;
  status: ScanStatus;
  dossier: RiskDossier;
  createdAt: string;
}
