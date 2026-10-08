import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-14 pb-20">
      <p className="micro-label mb-4">Legal</p>
      <h1 className="font-display text-4xl md:text-5xl mb-8">Privacy</h1>
      <div className="space-y-6 text-inkdim">
        <p>
          FauxPas collects only what you type into a scan: brand descriptions
          and target market descriptions. There are no accounts, no tracking
          pixels, and no third-party analytics in this prototype.
        </p>
        <p>
          Scans are stored in the application's own datastore so the dossier
          archive can function. If you want a scan removed, that is a
          reasonable request for a prototype: the datastore is a single JSON
          file and deletion is trivial.
        </p>
        <p>
          When the production Qloo API is wired in, brand and market
          descriptions will be sent to Qloo's API to compute taste profiles,
          subject to Qloo's own terms and privacy policy. That integration
          does not exist in this prototype build.
        </p>
      </div>
    </div>
  );
}
