import Link from "next/link";
import type { Metadata } from "next";
import { listScans } from "@/lib/db/db";
import { formatDate } from "@/lib/format";
import { VerdictSeal } from "@/components/dossier";

export const metadata: Metadata = { title: "Dossiers" };

export default async function Dashboard() {
  const scans = await listScans();
  return (
    <div className="max-w-6xl mx-auto px-6 pt-14 pb-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="micro-label mb-4">The desk archive</p>
          <h1 className="font-display text-4xl md:text-5xl">Risk dossiers</h1>
        </div>
        <Link
          href="/scan/new"
          className="font-mono text-xs tracking-[0.14em] uppercase bg-ink text-canvas px-5 py-3 hover:bg-stamp min-h-[44px] inline-flex items-center"
        >
          New scan
        </Link>
      </div>

      {scans.length === 0 ? (
        <div className="border border-hairline bg-panel p-12 text-center">
          <p className="font-display text-2xl mb-3">No dossiers on file yet.</p>
          <p className="text-inkdim mb-8">
            Run your first scan and the desk will file it here.
          </p>
          <Link
            href="/scan/new"
            className="font-mono text-xs tracking-[0.14em] uppercase bg-ink text-canvas px-5 py-3 hover:bg-stamp min-h-[44px] inline-flex items-center"
          >
            New scan
          </Link>
        </div>
      ) : (
        <div className="border border-hairline overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead>
              <tr className="bg-panel2 border-b border-hairline">
                <th className="micro-label font-medium px-5 py-4">Brand</th>
                <th className="micro-label font-medium px-5 py-4">Target market</th>
                <th className="micro-label font-medium px-5 py-4">Filed</th>
                <th className="micro-label font-medium px-5 py-4 text-right">Score</th>
                <th className="micro-label font-medium px-5 py-4 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-hairline last:border-0 hover:bg-panel"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/scan/${s.id}`}
                      className="font-medium hover:underline underline-offset-4"
                    >
                      {s.brand.name}
                    </Link>
                    <p className="text-sm text-inkfaint mt-0.5">{s.brand.category}</p>
                  </td>
                  <td className="px-5 py-4 text-inkdim">
                    {[s.market.city, s.market.country].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-inkdim tnum">
                    {formatDate(s.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-lg tnum">
                    {s.dossier.score}
                    <span className="text-xs text-inkfaint">/100</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <VerdictSeal band={s.dossier.band} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
