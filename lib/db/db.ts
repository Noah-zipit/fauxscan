/**
 * Prototype datastore: a single JSON file with an in-process write queue.
 *
 * Dependency-free so judges can run the project with nothing but
 * `npm install`. Every write goes through a promise chain so concurrent API
 * requests cannot interleave a read-modify-write.
 *
 * PHASE 2: replace the internals of this module with a real database
 * (Postgres via Prisma/Drizzle). Keep the exported function signatures
 * identical — the API routes do not need to change.
 */

import { promises as fs } from "fs";
import path from "path";
import type { Scan } from "../types";
import { getQlooClient } from "../qloo/qloo-client";
import { analyzeRisk } from "../risk/risk-engine";

interface Store {
  scans: Scan[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "fauxscan.json");

function emptyStore(): Store {
  return { scans: [] };
}

const rid = (p: string) =>
  `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

async function seed(): Promise<Store> {
  const qloo = getQlooClient();
  const specs = [
    {
      brand: {
        name: "Velocity Footwear",
        category: "Sneakers / streetwear",
        products: "Limited-run basketball sneakers, hype collaborations, drop model",
      },
      market: {
        country: "Japan",
        city: "Tokyo",
        demographic: "16-30 urban youth, fashion-forward",
      },
      daysAgo: 6,
    },
    {
      brand: {
        name: "Ember Roast",
        category: "Coffee chain",
        products: "Third-wave coffee bars, brunch menu, natural wine evenings",
      },
      market: {
        country: "Saudi Arabia",
        city: "Riyadh",
        demographic: "Affluent 20-40, family-oriented",
      },
      daysAgo: 3,
    },
    {
      brand: {
        name: "Maison Lueur",
        category: "Fashion house",
        products: "Haute couture gowns, runway shows, quiet-luxury ready-to-wear",
      },
      market: {
        country: "Brazil",
        city: "São Paulo",
        demographic: "Classe A/B and periferia trendsetters",
      },
      daysAgo: 1,
    },
  ];

  const scans: Scan[] = [];
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    const [brandProfile, marketTaste] = await Promise.all([
      qloo.getBrandProfile(s.brand),
      qloo.getMarketTaste(s.market),
    ]);
    const createdAt = new Date(
      Date.now() - s.daysAgo * 24 * 60 * 60 * 1000
    ).toISOString();
    scans.push({
      id: `scan-seed-${i + 1}`,
      brand: s.brand,
      market: s.market,
      status: "complete",
      dossier: { ...analyzeRisk(brandProfile, marketTaste), computedAt: createdAt },
      createdAt,
    });
  }
  // Newest first
  scans.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return { scans };
}

let writeQueue: Promise<void> = Promise.resolve();
let cache: Store | null = null;

async function load(): Promise<Store> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    cache = JSON.parse(raw) as Store;
  } catch {
    cache = await seed();
    await persist();
  }
  return cache!;
}

async function persist(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

export async function listScans(): Promise<Scan[]> {
  const store = await load();
  return store.scans;
}

export async function getScan(id: string): Promise<Scan | null> {
  const store = await load();
  return store.scans.find((s) => s.id === id) ?? null;
}

export async function createScan(input: {
  brand: Scan["brand"];
  market: Scan["market"];
}): Promise<Scan> {
  const qloo = getQlooClient();
  const [brandProfile, marketTaste] = await Promise.all([
    qloo.getBrandProfile(input.brand),
    qloo.getMarketTaste(input.market),
  ]);
  const scan: Scan = {
    id: rid("scan"),
    brand: input.brand,
    market: input.market,
    status: "complete",
    dossier: analyzeRisk(brandProfile, marketTaste),
    createdAt: new Date().toISOString(),
  };
  // Serialize the read-modify-write through the queue
  const done = writeQueue.then(async () => {
    const store = await load();
    store.scans.unshift(scan);
    await persist();
  });
  writeQueue = done.catch(() => {});
  await done;
  return scan;
}

export function newScanId(): string {
  return rid("scan");
}
