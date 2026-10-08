import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-28">
      <p className="micro-label mb-4">404 — No dossier here</p>
      <h1 className="font-display text-5xl mb-6">This page does not exist.</h1>
      <p className="text-inkdim mb-10 max-w-xl">
        The archive has no record of this address. The desk suggests starting
        from the dossiers index or briefing a new scan.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/dashboard"
          className="font-mono text-sm tracking-[0.14em] uppercase bg-ink text-canvas px-7 py-4 hover:bg-stamp min-h-[52px] inline-flex items-center"
        >
          Dossiers
        </Link>
        <Link
          href="/"
          className="font-mono text-sm tracking-[0.14em] uppercase border border-hairline px-7 py-4 hover:border-inkfaint min-h-[52px] inline-flex items-center"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
