import { NextResponse } from "next/server";
import { createScan, listScans } from "@/lib/db/db";

export async function GET() {
  const scans = await listScans();
  return NextResponse.json({ scans });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const b = body as Record<string, Record<string, string>>;
  const brand = {
    name: (b.brand?.name ?? "").trim(),
    category: (b.brand?.category ?? "").trim(),
    products: (b.brand?.products ?? "").trim(),
  };
  const market = {
    country: (b.market?.country ?? "").trim(),
    city: (b.market?.city ?? "").trim(),
    demographic: (b.market?.demographic ?? "").trim(),
  };
  const missing: string[] = [];
  if (!brand.name) missing.push("brand name");
  if (!brand.category) missing.push("brand category");
  if (!market.country) missing.push("target country");
  if (!market.city) missing.push("target city");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}.` },
      { status: 400 }
    );
  }
  try {
    const scan = await createScan({ brand, market });
    return NextResponse.json({ scan }, { status: 201 });
  } catch (err) {
    console.error("[api/scans] scan failed:", err);
    return NextResponse.json(
      { error: "The scan could not be completed. Please try again." },
      { status: 500 }
    );
  }
}
