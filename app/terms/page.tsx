import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of use" };

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-14 pb-20">
      <p className="micro-label mb-4">Legal</p>
      <h1 className="font-display text-4xl md:text-5xl mb-8">Terms of use</h1>
      <div className="space-y-6 text-inkdim">
        <p>
          FauxPas is a prototype decision-support instrument built for the Qloo
          Agentic Hackathon. Dossiers are computed from prototype taste data and
          are provided for evaluation and demonstration purposes.
        </p>
        <p>
          Risk scores, segment calls, flags, and mitigations are analytical
          outputs, not professional advice. They do not constitute legal,
          financial, or market-entry advice. Do not stake a launch budget,
          sign a lease, or commit inventory on the basis of a prototype
          dossier alone.
        </p>
        <p>
          You retain ownership of the brand and market descriptions you submit.
          By using the service you confirm the material you submit is yours to
          share and does not infringe the rights of others.
        </p>
        <p>
          The service is provided as is, without warranties of any kind. To the
          maximum extent permitted by law, we are not liable for decisions made
          using prototype outputs.
        </p>
      </div>
    </div>
  );
}
