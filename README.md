# X-Ray Operator Safety Training (NHMLAC)

Interactive browser-based safety training for operators of analytical X-ray instruments at the Natural History Museum of Los Angeles County.

## Instruments covered

- **Rigaku R-AXIS RAPID** — single-crystal XRD
- **Proto AXRD** — powder XRD
- **Horiba XGT-7200** — micro-XRF

Procedures are **facility safety procedures** derived from public instrument specifications and ANSI N43.2 enclosed-system practice (vendor manuals were not available). Operators must verify warning lights, E-stops, and interlock behavior on each physical instrument.

## How to use

1. Open `index.html` in a modern browser (or serve the folder locally).
2. Use the theme toggle (top right) for light or dark mode.
3. Enter an email to start; progress through 12 sections (knowledge checks gate “Next”).
4. Complete the Section 12 commitment checklist, then pass the 15-question quiz at 100%.
5. On completion you can:
   - **Email Record to minsci@nhm.org** — downloads certificate (HTML) + JSON, then opens mail with subject/body filled (attach the downloads manually; browsers cannot auto-attach)
   - **Print / Save Certificate (PDF)** — browser print dialog; choose “Save as PDF”
   - **Add Retraining Reminder to Calendar** — downloads an `.ics` event (due date + 30-day and 7-day alarms)
   - **Download JSON Record** — completion metadata for your files

Leaving the completion page shows a browser warning until you check that you have downloaded/emailed your record.

## Where is the JSON file?

**Not on GitHub.** Completions are stored only in the trainee’s browser (`localStorage`) on the machine that ran the training. Syncing this repo (iCloud, GitHub, etc.) does **not** sync completion records.

To get a copy:

1. Click **Email Record to minsci@nhm.org** or **Download JSON Record** on the completion screen, or
2. In the browser console: `downloadAllRecords()` or `viewAllTrainingRecords()`

Send certificates and JSON records to **minsci@nhm.org**.

## Updating facility contacts

Edit the block with `id="contacts-block"` in [`index.html`](index.html) (Section 9) for RSO/steward phone numbers. Training records go to minsci@nhm.org.

## Admin helpers (browser console)

- `viewAllTrainingRecords()` — list saved completions
- `downloadAllRecords()` — download all records as JSON
- `findUsersNeedingRefresher()` — records past 2-year due date
- `clearAllTrainingData()` — wipe local records (confirm prompt)

## Regulatory framing

Training references **ANSI N43.2**, California radiation machine / institutional requirements, and common occupational dose-limit tables. It is operator training for enclosed XRD/XRF systems — not a substitute for RSO authorization or site-specific SOPs.
