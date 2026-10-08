import type { VerdictBand } from "@/lib/types";

const BAND_STYLE: Record<VerdictBand, string> = {
  LOW: "text-clear",
  GUARDED: "text-caution",
  ELEVATED: "text-risk",
  SEVERE: "text-risk",
};

export function VerdictSeal({ band, className = "" }: { band: VerdictBand; className?: string }) {
  return (
    <span className={`seal ${BAND_STYLE[band]} ${className}`} role="status">
      {band} risk
    </span>
  );
}

export function bandColor(band: VerdictBand): string {
  return BAND_STYLE[band];
}

/** Horizontal risk bar, 0..100, with band ticks */
export function RiskBar({ score, band }: { score: number; band: VerdictBand }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="micro-label">Composite risk</span>
        <span className={`font-mono text-3xl tnum ${bandColor(band)}`}>
          {score}
          <span className="text-sm text-inkfaint">/100</span>
        </span>
      </div>
      <div
        className="h-2 bg-panel2 border border-hairline relative"
        role="img"
        aria-label={`Risk score ${score} out of 100, band ${band}`}
      >
        <div
          className={`h-full ${band === "LOW" ? "bg-clear" : band === "GUARDED" ? "bg-caution" : "bg-risk"}`}
          style={{ width: `${score}%` }}
        />
        {[30, 50, 70].map((t) => (
          <div
            key={t}
            className="absolute top-0 bottom-0 w-px bg-hairline"
            style={{ left: `${t}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {["LOW", "GUARDED", "ELEVATED", "SEVERE"].map((b) => (
          <span key={b} className="micro-label">
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}
