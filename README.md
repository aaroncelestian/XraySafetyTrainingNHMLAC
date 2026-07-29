# X-Ray Operator Safety Training (NHMLAC)

Interactive browser-based safety training for operators of analytical X-ray instruments at the Natural History Museum of Los Angeles County.

## Instruments covered

- **Rigaku R-AXIS RAPID** — single-crystal XRD
- **Proto AXRD** — powder XRD
- **Horiba XGT-7200** — micro-XRF

Procedures are **facility safety procedures** derived from public instrument specifications and ANSI N43.2 enclosed-system practice (vendor manuals were not available). Operators must verify warning lights, E-stops, and interlock behavior on each physical instrument.

## How to use

1. Open `index.html` in a modern browser (or serve the folder locally).
2. Enter an email to start; progress through 12 sections (knowledge checks gate “Next”).
3. Complete the Section 12 commitment checklist, then pass the 15-question quiz at 100%.
4. Download the completion JSON record (also stored in `localStorage`).

## Updating facility contacts

Edit the block with `id="contacts-block"` in [`index.html`](index.html) (Section 9). Search for `contacts-block` and replace `[Name]`, `[Phone]`, `[Email]`, and after-hours number.

## Admin helpers (browser console)

- `viewAllTrainingRecords()` — list saved completions
- `downloadAllRecords()` — download all records as JSON
- `findUsersNeedingRefresher()` — records past 2-year due date
- `clearAllTrainingData()` — wipe local records (confirm prompt)

## Regulatory framing

Training references **ANSI N43.2**, California radiation machine / institutional requirements, and common occupational dose-limit tables. It is operator training for enclosed XRD/XRF systems — not a substitute for RSO authorization or site-specific SOPs.
