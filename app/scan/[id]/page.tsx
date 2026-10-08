import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getScan } from "@/lib/db/db";
import { formatDate, formatSigned } from "@/lib/format";
import { RiskBar, VerdictSeal } from "@/components/dossier";
import type { SegmentCall } from "@/lib/types";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const scan = await getScan(id);
  return {
    title: scan
      ? `${scan.brand.name} in ${scan.market.city}, ${scan.market.country}`
      : "Dossier",
  };
}

const STANCE_STYLE: Record<SegmentCall["stance"], string> = {
  embrace: "text-clear border-clear",
  reject: "text-risk border-risk",
  split: "text-caution border-caution",
};

export default async function ScanDossier({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scan = await getScan(id);
  if (!scan) notFound();
  const d = scan.dossier;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-14 pb-20">
      {/* Dossier header */}
      <p className="micro-label mb-4">
        Dossier {scan.id} — filed {formatDate(scan.createdAt)}
      </p>
      <div className="flex flex-wrap items-start justify-between gap-6 mb-6">
        <h1 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl">
          {scan.brand.name}{" "}
          <span className="text-inkdim">
            in {[scan.market.city, scan.market.country].filter(Boolean).join(", ")}
          </span>
        </h1>
        <VerdictSeal band={d.band} className="mt-2" />
      </div>
      <p className="font-display text-xl md:text-2xl text-inkdim max-w-3xl mb-4">
        {d.headline}
      </p>
      <p className="micro-label mb-12">
        {scan.brand.category}
        {scan.market.demographic ? ` — targeting ${scan.market.demographic}` : ""}
      </p>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <RiskBar score={d.score} band={d.band} />

          {/* Segment map */}
          <div className="mt-14">
            <p className="micro-label mb-6">Segment map — embrace vs reject</p>
            <div className="border border-hairline divide-y divide-hairline">
              {d.segments.map((s) => (
                <div key={s.segmentId} className="p-6 bg-panel">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <p className="font-medium">{s.label}</p>
                    <span
                      className={`font-mono text-xs tracking-[0.14em] uppercase border px-3 py-1.5 ${STANCE_STYLE[s.stance]}`}
                    >
                      {s.stance}
                    </span>
                  </div>
                  <p className="text-sm text-inkdim">{s.reason}</p>
                  <p className="font-mono text-xs text-inkfaint mt-3 tnum">
                    Share of addressable market: {Math.round(s.share * 100)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mitigations */}
          <div className="mt-14">
            <p className="micro-label mb-6">Mitigations</p>
            <div className="space-y-px bg-hairline border border-hairline">
              {d.mitigations.map((m, i) => (
                <div key={m.id} className="bg-canvas p-6">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <p className="font-medium">
                      <span className="font-mono text-xs text-inkfaint mr-3 tnum">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {m.title}
                    </p>
                    <span className="micro-label shrink-0">{m.effort} effort</span>
                  </div>
                  <p className="text-sm text-inkdim">{m.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Red flags */}
          <p className="micro-label mb-6">
            Red flags <span className="tnum">({d.flags.length})</span>
          </p>
          {d.flags.length === 0 ? (
            <div className="border border-hairline bg-panel p-6">
              <p className="text-inkdim text-sm">
                No structural flags raised. The brand and market align across
                the measured dimensions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {d.flags.map((f) => (
                <details
                  key={f.id}
                  className="border border-hairline bg-panel group"
                >
                  <summary className="p-5 cursor-pointer list-none">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-medium text-sm">{f.title}</p>
                      <span className="font-mono text-sm tnum text-risk shrink-0">
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-xs uppercase font-mono tracking-[0.14em] text-inkfaint">
                      {f.category}
                    </p>
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-inkdim mb-4">{f.summary}</p>
                    <p className="micro-label mb-2">Evidence</p>
                    <table className="w-full text-xs">
                      <tbody>
                        {f.evidence.map((e, j) => (
                          <tr key={j} className="border-t border-hairline">
                            <td className="py-2 pr-2">{e.dimension}</td>
                            <td className="py-2 font-mono tnum text-right text-inkdim">
                              {formatSigned(e.delta)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="font-mono text-xs text-inkfaint mt-3">
                      Affects: {f.affectedSegments.join("; ")}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          )}

          {/* Methodology note */}
          <div className="mt-10 border border-hairline bg-panel p-6">
            <p className="micro-label mb-3">How this was computed</p>
            <p className="text-sm text-inkdim mb-4">
              Every dimension is differenced (market affinity minus brand
              affinity) from taste-graph data. Flags fire on deterministic
              rules; the score is a weighted sum, never a black box.
            </p>
            <Link
              href="/methodology"
              className="font-mono text-xs tracking-[0.14em] uppercase text-stamp hover:text-ink"
            >
              Read the methodology
            </Link>
          </div>
        </div>
      </div>

      {/* Evidence ledger */}
      <div className="mt-20">
        <p className="micro-label mb-6">
          Evidence ledger — every dimension consulted
        </p>
        <div className="border border-hairline overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-panel2 border-b border-hairline">
                <th className="micro-label font-medium text-left px-5 py-3">Dimension</th>
                <th className="micro-label font-medium text-left px-5 py-3">Kind</th>
                <th className="micro-label font-medium text-right px-5 py-3">Brand</th>
                <th className="micro-label font-medium text-right px-5 py-3">Market</th>
                <th className="micro-label font-medium text-right px-5 py-3">Delta</th>
              </tr>
            </thead>
            <tbody className="font-mono tnum">
              {d.ledger.map((e, i) => (
                <tr key={i} className="border-b border-hairline last:border-0">
                  <td className="px-5 py-2.5 font-sans">{e.dimension}</td>
                  <td className="px-5 py-2.5 text-inkfaint text-xs">{e.kind}</td>
                  <td className="px-5 py-2.5 text-right text-inkdim">
                    {formatSigned(e.brandAffinity)}
                  </td>
                  <td className="px-5 py-2.5 text-right text-inkdim">
                    {formatSigned(e.marketAffinity)}
                  </td>
                  <td
                    className={`px-5 py-2.5 text-right ${
                      e.delta <= -0.5
                        ? "text-risk"
                        : e.delta >= 0.5
                          ? "text-caution"
                          : "text-inkdim"
                    }`}
                  >
                    {formatSigned(e.delta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-mono text-xs text-inkfaint mt-3">
          Computed {formatDate(d.computedAt)} — prototype engine, mock taste data.
        </p>
      </div>
    </div>
  );
}
