# Pre-migration baseline

Captured by `tools/baseline/capture.ts` (Phase 0 of `specs/001-modernize-ts-react`). Everything
here reflects the **current Pug/Express app**, pinned to `BUILD_NOW` (see `BUILD_NOW` in this
directory) — it is what every later phase's Gate 5 (HTML parity), Gate 6 (visual parity), and
Gate 7 (axe) diff against.

- `html/` — normalized rendered HTML per route (committed; ~8.3MB, text-diffable)
- `axe/` — axe-core violation results per route (committed; ~120KB)
- `png/` — full-page screenshots at 1920/1441/1280/320px (**gitignored**, ~167MB; regenerate with
  `npm run build:baseline` whenever Gate 6 needs to run — not worth committing against a ~3.5MB
  repo with no git-lfs configured)

Regenerate everything: `BUILD_NOW=<pinned-instant> npm run build:baseline` (or
`docker compose run baseline` for the environment-pinned version Gates 5–7 actually compare
against).

## Pre-existing axe violations (5 instances, 4 rules, across 32 captured routes)

Recorded here so Gate 7 doesn't mistake these for regressions introduced by the migration — none
of them are in the 11-item corrected-defects list (spec.md), so they carry forward unfixed unless
a future task explicitly decides otherwise.

| Route | Status | Rule(s) |
|---|---|---|
| `/tests` | 200 | `page-has-heading-one` — `tests.pug` has no `<h1>` |
| `/updates` | 200 | `page-has-heading-one` — `updates.pug` has no `<h1>` |
| `/tests/aria_alertdialog_document_mode` | 200 | `scrollable-region-focusable` — the known `ResponsiveTable` gap already documented in spec.md's Non-goals (missing `role="region"` + accessible name on the `tabindex="0"` scroll wrapper) |
| `/tests/tech__aria__aria-owns-multiple/run` | 500 | `document-title`, `empty-heading` — this route's 500 error is corrected-defect #11 (spec.md). This baseline capture intentionally preserves the *broken* pre-migration state; the post-migration HTML for this route is expected to differ (crash → working page), already covered by Gate 5's "eleven corrected defects" exception — do not re-capture this route to "fix" the baseline |
| `/this-route-does-not-exist` | 404 | `document-title` — `app.js`'s error handler (`res.render('error')`) never sets a `title` local, so `views/error.pug`'s `title= title` renders empty. Genuinely pre-existing, not part of the 11-item catalogue; left as-is per the same "don't expand scope on a discovery" judgment applied throughout Phase 0 |

If a future phase wants to fix `page-has-heading-one`, `document-title` on error pages, or
`scrollable-region-focusable`, treat that as a new, explicit decision (per this project's
accessibility skill: note the issue, confirm before changing) — none of them are silently
in scope for this migration.
