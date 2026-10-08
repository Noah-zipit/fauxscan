# FauxPas — cultural risk scanner for brands

Agentic due-diligence for market entry. Enter a brand and a target market; get an
explainable cultural risk dossier: composite score, embrace/reject segment map,
red flags with evidence, concrete mitigations.

Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/) ($25,000).
Deadline: Oct 30, 2026.

## The idea

Brands expanding into new markets get blindsided by cultural mismatch. FauxPas
stress-tests a brand against a market's taste profile and hands over the risk
dossier before launch spend. This is computation over the taste graph, not a
recommendation chatbot: every number traces to affinity deltas
(`market affinity − brand affinity`), and the evidence ledger ships with every
dossier.

## Architecture

```
app/
  page.tsx            landing — the product story
  dashboard/          dossier archive (dense data table)
  scan/new/           brand + market intake form
  scan/[id]/         the risk dossier
  methodology/       how scoring works, limits
  api/scans/         list + create (runs the full pipeline)
lib/
  qloo/qloo-client.ts  QlooClient interface + MockQlooClient + Phase 2 wiring docs
  risk/risk-engine.ts  deterministic, explainable scoring — no black boxes
  db/db.ts            dependency-free JSON prototype store (signatures kept for DB swap)
  types.ts            domain types
```

## Run it

```bash
npm install
npm run dev    # http://localhost:3000
```

Seeded with three example dossiers so the demo works instantly:
sneaker brand → Tokyo, coffee chain → Riyadh, fashion house → São Paulo.

## Wiring the real Qloo API (Phase 2)

No API key exists yet. Request one via the Google Form linked from
[docs.qloo.com](https://docs.qloo.com) ("Getting your API key"), then:

1. Implement `RealQlooClient implements QlooClient` in `lib/qloo/real-client.ts`.
   Confirm the live base URL and auth scheme in the current docs.qloo.com
   reference before hardcoding anything.
2. Set `QLOO_API_KEY` in the environment.

`getQlooClient()` throws loudly if the key is set but no real client exists —
it will never silently serve mock data as production data.

## Hackathon submission checklist

- [x] Public repo with MIT license
- [ ] Hosted demo URL (deploy)
- [ ] Text description on Devpost
- [ ] "Join Hackathon" tapped on qloo.devpost.com
- [ ] Real Qloo API key + wiring

## License

MIT
