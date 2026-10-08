/**
 * Qloo taste-graph client.
 *
 * PHASE 1: `MockQlooClient` — a rich, deterministic mock. No API key exists
 * yet (Ashar must request one through Qloo's Google Form), so every method
 * below is served from curated taste data. The mock is deterministic: the
 * same brand + market always yields the same profile, and unknown brands or
 * markets get plausible generated profiles from a seeded hash — never an
 * error, never randomness between runs.
 *
 * PHASE 2 — wiring the real Qloo API:
 *   1. Request a key via the Google Form linked from docs.qloo.com
 *      (see "Getting your API key" in the Qloo LLM hackathon developer guide).
 *   2. Implement `RealQlooClient implements QlooClient` in
 *      `lib/qloo/real-client.ts`. Confirm the live base URL and auth scheme
 *      in the current docs.qloo.com reference before hardcoding anything —
 *      the method contracts below map to taste-graph concepts (entity
 *      lookup, audience affinities, pairwise affinity), not to specific
 *      endpoint paths, precisely so the mapping stays honest.
 *   3. Set QLOO_API_KEY in the environment. `getQlooClient()` will then
 *      return the real client.
 *
 * SAFETY: `getQlooClient()` throws loudly if QLOO_API_KEY is set but no real
 * client implementation exists. It will never silently serve mock data as
 * production data.
 */

import type {
  AudienceSegment,
  BrandInput,
  BrandProfile,
  EntityAffinity,
  MarketInput,
  MarketTaste,
} from "../types";

export interface QlooClient {
  getBrandProfile(brand: BrandInput): Promise<BrandProfile>;
  getMarketTaste(market: MarketInput): Promise<MarketTaste>;
  /** Direct pairwise affinity between a brand entity and a market, -1..1 */
  affinityBetween(brandId: string, marketId: string): Promise<number>;
}

function getEnvKey(): string | undefined {
  return process.env.QLOO_API_KEY;
}

/** True only when a real client implementation has been wired in Phase 2. */
const REAL_CLIENT_AVAILABLE = false;

export function getQlooClient(): QlooClient {
  if (getEnvKey() && !REAL_CLIENT_AVAILABLE) {
    throw new Error(
      "[qloo] QLOO_API_KEY is set but no real Qloo client is implemented. " +
        "Refusing to serve mock data as production data. Implement " +
        "RealQlooClient in lib/qloo/real-client.ts first."
    );
  }
  return new MockQlooClient();
}

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic pseudo-random in [0,1) from a seed string */
function seeded(seed: string): number {
  return (hashString(seed) % 10000) / 10000;
}

function aff(
  entityId: string,
  name: string,
  kind: EntityAffinity["kind"],
  affinity: number,
  confidence = 0.82
): EntityAffinity {
  return { entityId, name, kind, affinity, confidence };
}

function seg(
  id: string,
  label: string,
  share: number,
  description: string
): AudienceSegment {
  return { id, label, share, description };
}

// ---------------------------------------------------------------------------
// Curated taste data — the mock's knowledge base
// ---------------------------------------------------------------------------

interface CuratedBrand {
  match: RegExp;
  brandId: string;
  affinities: EntityAffinity[];
  audience: AudienceSegment[];
}

const CURATED_BRANDS: CuratedBrand[] = [
  {
    match: /velocity|stride|kick/i,
    brandId: "brand-velocity-ff",
    affinities: [
      aff("e-hiphop", "Hip-hop", "music", 0.91),
      aff("e-streetwear", "Streetwear", "fashion", 0.94),
      aff("e-basketball", "Basketball culture", "media", 0.88),
      aff("e-sneaker", "Sneaker collecting", "fashion", 0.96),
      aff("e-edm", "EDM festivals", "music", 0.62),
      aff("e-esports", "Esports", "media", 0.71),
      aff("e-luxury", "Quiet luxury", "fashion", -0.34),
      aff("e-formal", "Formal tailoring", "fashion", -0.52),
      aff("e-golf", "Golf culture", "media", -0.41),
    ],
    audience: [
      seg("a-hype", "Hype youth (16-24)", 0.42, "Trend-led, drop-driven buyers"),
      seg("a-athl", "Performance athletes", 0.31, "Function-first buyers"),
      seg("a-coll", "Collectors / resellers", 0.27, "Scarcity-driven buyers"),
    ],
  },
  {
    match: /ember|roast|brew|bean|koffa/i,
    brandId: "brand-ember-roast",
    affinities: [
      aff("e-coffee", "Third-wave coffee", "beverage", 0.93),
      aff("e-brunch", "Brunch culture", "dining", 0.81),
      aff("e-indie", "Indie folk", "music", 0.58),
      aff("e-winebar", "Natural wine bars", "dining", 0.55),
      aff("e-wfh", "Remote-work café culture", "values", 0.77),
      aff("e-tea", "Traditional tea ceremony", "beverage", -0.28),
      aff("e-fastfood", "Fast food", "dining", -0.63),
      aff("e-club", "Late-night clubbing", "media", -0.35),
    ],
    audience: [
      seg("a-remote", "Remote workers", 0.38, "Laptop dwellers, high dwell time"),
      seg("a-conn", "Connoisseurs", 0.34, "Single-origin loyalists"),
      seg("a-social", "Social brunch crowd", 0.28, "Weekend regulars"),
    ],
  },
  {
    match: /maison|lueur|atelier|couture|velvet/i,
    brandId: "brand-maison-lueur",
    affinities: [
      aff("e-haute", "Haute couture", "fashion", 0.95),
      aff("e-runway", "Fashion week", "media", 0.9),
      aff("e-luxury", "Quiet luxury", "fashion", 0.88),
      aff("e-art", "Contemporary art", "media", 0.74),
      aff("e-opera", "Opera / classical", "music", 0.52),
      aff("e-streetwear", "Streetwear", "fashion", -0.44),
      aff("e-fastfashion", "Fast fashion", "fashion", -0.81),
      aff("e-edm", "EDM festivals", "music", -0.57),
    ],
    audience: [
      seg("a-ultra", "Ultra-high-net-worth", 0.35, "Couture clients"),
      seg("a-aspir", "Aspirational luxury", 0.41, "Entry-luxury buyers"),
      seg("a-press", "Press / stylists", 0.24, "Cultural amplifiers"),
    ],
  },
];

interface CuratedMarket {
  match: RegExp;
  marketId: string;
  affinities: EntityAffinity[];
  segments: AudienceSegment[];
  notes: string[];
}

const CURATED_MARKETS: CuratedMarket[] = [
  {
    match: /japan|tokyo|osaka/i,
    marketId: "mkt-japan",
    affinities: [
      aff("e-streetwear", "Streetwear", "fashion", 0.88),
      aff("e-sneaker", "Sneaker collecting", "fashion", 0.9),
      aff("e-hiphop", "Hip-hop", "music", 0.55),
      aff("e-formal", "Formal tailoring", "fashion", 0.42),
      aff("e-tea", "Traditional tea ceremony", "beverage", 0.83),
      aff("e-craft", "Craftsmanship (monozukuri)", "values", 0.94),
      aff("e-luxury", "Quiet luxury", "fashion", 0.71),
      aff("e-fastfashion", "Fast fashion", "fashion", -0.35),
      aff("e-golf", "Golf culture", "media", 0.48),
    ],
    segments: [
      seg("m-ura", "Ura-Harajuku youth", 0.3, "Street-culture early adopters"),
      seg("m-salary", "Salaryman mainstream", 0.45, "Conformity-leaning majority"),
      seg("m-shibuya", "Shibuya trend elite", 0.25, "High-spend tastemakers"),
    ],
    notes: [
      "Craftsmanship signaling (monozukuri) outweighs hype signaling.",
      "Foreign brands earn trust through limited, respectful localization.",
    ],
  },
  {
    match: /saudi|riyadh|jeddah|uae|dubai|qatar|doha|emirat/i,
    marketId: "mkt-gulf",
    affinities: [
      aff("e-luxury", "Quiet luxury", "fashion", 0.86),
      aff("e-haute", "Haute couture", "fashion", 0.79),
      aff("e-coffee", "Third-wave coffee", "beverage", 0.74),
      aff("e-brunch", "Brunch culture", "dining", 0.68),
      aff("e-modesty", "Modest fashion", "fashion", 0.9),
      aff("e-streetwear", "Streetwear", "fashion", 0.35),
      aff("e-club", "Late-night clubbing", "media", -0.72),
      aff("e-winebar", "Natural wine bars", "dining", -0.85),
      aff("e-pork", "Pork cuisine", "dining", -0.95),
      aff("e-formal", "Formal tailoring", "fashion", 0.58),
    ],
    segments: [
      seg("m-affl", "Affluent nationals", 0.35, "Luxury-first, family-oriented"),
      seg("m-expats", "Western expats", 0.25, "Global-taste bridge"),
      seg("m-youth", "Gulf youth", 0.4, "Trend-hungry, values-aware"),
    ],
    notes: [
      "Alcohol and pork references are hard taboos in brand creative.",
      "Modest-fashion alignment is a trust multiplier, not a constraint.",
    ],
  },
  {
    match: /brazil|s[aã]o paulo|rio/i,
    marketId: "mkt-brazil",
    affinities: [
      aff("e-streetwear", "Streetwear", "fashion", 0.82),
      aff("e-hiphop", "Hip-hop", "music", 0.78),
      aff("e-funk", "Baile funk", "music", 0.9),
      aff("e-football", "Football culture", "media", 0.95),
      aff("e-fastfashion", "Fast fashion", "fashion", 0.55),
      aff("e-luxury", "Quiet luxury", "fashion", -0.2),
      aff("e-haute", "Haute couture", "fashion", -0.45),
      aff("e-formal", "Formal tailoring", "fashion", -0.5),
      aff("e-samba", "Samba / pagode", "music", 0.87),
    ],
    segments: [
      seg("m-perif", "Periferia youth", 0.4, "Funk-driven trendsetters"),
      seg("m-classe", "Classe A/B", 0.35, "Aspirational premium buyers"),
      seg("m-praia", "Beach culture", 0.25, "Body-confident casual"),
    ],
    notes: [
      "Status flows bottom-up: periferia youth set the trends elites follow.",
      "Overt European luxury codes read as out of touch outside Classe A/B.",
    ],
  },
];

// Fallback vocabulary for brands / markets with no curated entry
const FALLBACK_DIMS: Array<[string, string, EntityAffinity["kind"]]> = [
  ["e-streetwear", "Streetwear", "fashion"],
  ["e-luxury", "Quiet luxury", "fashion"],
  ["e-hiphop", "Hip-hop", "music"],
  ["e-edm", "EDM festivals", "music"],
  ["e-coffee", "Third-wave coffee", "beverage"],
  ["e-brunch", "Brunch culture", "dining"],
  ["e-fastfood", "Fast food", "dining"],
  ["e-craft", "Craftsmanship", "values"],
  ["e-sustain", "Sustainability", "values"],
  ["e-esports", "Esports", "media"],
];

function genericAffinities(seedKey: string, spread: number): EntityAffinity[] {
  return FALLBACK_DIMS.map(([id, name, kind], i) => {
    const v = seeded(`${seedKey}:${id}:${i}`);
    const affinity = Math.round(((v - 0.5) * 2 * spread) * 100) / 100;
    return aff(id, name, kind, affinity, 0.55 + v * 0.3);
  });
}

// ---------------------------------------------------------------------------
// The mock client
// ---------------------------------------------------------------------------

export class MockQlooClient implements QlooClient {
  async getBrandProfile(brand: BrandInput): Promise<BrandProfile> {
    const key = `${brand.name} ${brand.category} ${brand.products}`;
    const curated = CURATED_BRANDS.find((c) => c.match.test(key));
    if (curated) {
      return {
        brandId: curated.brandId,
        name: brand.name,
        category: brand.category,
        affinities: curated.affinities,
        audience: curated.audience,
      };
    }
    return {
      brandId: `brand-gen-${hashString(key) % 100000}`,
      name: brand.name,
      category: brand.category,
      affinities: genericAffinities(key, 0.85),
      audience: [
        seg("a-core", "Core enthusiasts", 0.4, "Category loyalists"),
        seg("a-casual", "Casual buyers", 0.35, "Occasional purchasers"),
        seg("a-aspir", "Aspirational", 0.25, "Status-driven newcomers"),
      ],
    };
  }

  async getMarketTaste(market: MarketInput): Promise<MarketTaste> {
    const key = `${market.country} ${market.city} ${market.demographic}`;
    const curated = CURATED_MARKETS.find((c) => c.match.test(key));
    if (curated) {
      return {
        marketId: curated.marketId,
        label: [market.city, market.country].filter(Boolean).join(", "),
        affinities: curated.affinities,
        segments: curated.segments,
        notes: curated.notes,
      };
    }
    return {
      marketId: `mkt-gen-${hashString(key) % 100000}`,
      label: [market.city, market.country].filter(Boolean).join(", "),
      affinities: genericAffinities(key, 0.8),
      segments: [
        seg("m-urban", "Urban mainstream", 0.5, "The broad middle"),
        seg("m-youth", "Urban youth", 0.3, "Trend-setting minority"),
        seg("m-elite", "Affluent elite", 0.2, "High-spend minority"),
      ],
      notes: ["Generated market sketch — refine with the live Qloo API."],
    };
  }

  async affinityBetween(brandId: string, marketId: string): Promise<number> {
    const v = seeded(`pair:${brandId}:${marketId}`);
    return Math.round((v * 1.6 - 0.6) * 100) / 100;
  }
}
