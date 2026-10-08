# FauxPas — DESIGN.md

Visual language: **an intelligence dossier**. Bloomberg terminal meets an editorial
magazine. Dark, dense, precise. Every number earns its place. Nothing decorative.

## Palette (solid colors only — never gradients)

| Token        | Value     | Use                                  |
|--------------|-----------|--------------------------------------|
| `--canvas`   | `#0B0C0E` | Page background (near-black, not pure)|
| `--panel`    | `#121418` | Cards, dossier sections              |
| `--panel-2`  | `#171A1F` | Raised surfaces, table headers       |
| `--hairline` | `#262B33` | Borders, rules, dividers             |
| `--ink`      | `#ECE7D9` | Primary text (warm paper white)      |
| `--ink-dim`  | `#A9A294` | Secondary text (warm gray)           |
| `--ink-faint`| `#6E6A5E` | Tertiary text, labels                |
| `--risk`     | `#E5484D` | Risk, rejection, red flags           |
| `--caution`  | `#D9A441` | Guarded verdicts, warnings           |
| `--clear`    | `#43A47C` | Low risk, embrace segments           |
| `--stamp`    | `#C8BFA9` | Stamps, seals, dossier furniture     |

Risk colors are semantic and sparse. Body text is never colored.

## Typography

- **Display:** Newsreader (serif, optical sizes) — headlines, dossier titles, the big score.
  Solid ink color only. Never gradient text.
- **Body/UI:** Archivo — labels, body copy, tables.
- **Data:** IBM Plex Mono — scores, affinities, deltas, timestamps, IDs. All money-like
  figures use `tabular-nums`.

Base 16px, line-height 1.5. Headlines left-aligned. No centered hero template.

## Composition rules

- Left-aligned everything. Asymmetric editorial rhythm: wide measure for prose,
  narrow dense columns for data.
- Sharp corners (`rounded-none` / `rounded-sm` max). Borders are 1px hairlines.
- Dossier furniture: thin rules, uppercase micro-labels with letter-spacing,
  stamp-like verdict seals (bordered, uppercase, mono).
- Data tables over cards. When cards appear, they carry real numbers, never icons.
- Icons: minimal custom line SVGs (stroke 1.5), matched to function. No emoji icons,
  no Lucide-in-rounded-badges.
- Buttons: rectangular, solid fills, uppercase mono labels for primary actions.
  No pill buttons.
- Motion: restrained. Page transitions none; micro-interactions (flag expand,
  tab switch) instant or 120ms. Honor `prefers-reduced-motion`.

## Copy voice

Analyst-grade. Short declarative sentences. Numbers cited, never rounded into hype.
No "supercharge", no "it's not X, it's Y", no em dashes, no everything-in-threes.
Verdict bands: LOW / GUARDED / ELEVATED / SEVERE.

## Anti-slop checklist (must pass before ship)

- [ ] No gradient text, no radial orbs, no purple/dark gradients
- [ ] No centered 3-card feature rows; no 3-tier anything
- [ ] No "01 / 02 / 03" section headers; no checkmark bullets
- [ ] No pill buttons; no colored left stripes; no heavy drop shadows
- [ ] No fake metrics, testimonials, or client logos
- [ ] No em dashes in copy; read every headline aloud
- [ ] Every page has real, specific copy — zero lorem
