# Pre-migration accessibility baseline

`axe/` — axe-core violation results per route, captured from the legacy Pug/Express app before it
was deleted (Phase 0 of `specs/001-modernize-ts-react`), pinned to `BUILD_NOW` (see `BUILD_NOW` in
this directory). `tests/e2e/a11y.spec.ts` reads it to gate on violations that are new, not just
present at all — the migration doesn't need to fix every pre-existing issue, just avoid adding new
ones (see the table below).

`BUILD_NOW` also pins the browser clock in `playwright.config.ts` for the whole e2e suite, so
date-derived content and the data build's priority escalation stay deterministic across runs.

**Everything else from the original Phase 0 capture (`html/`, `png/`, the `tools/baseline/
capture.ts` script that produced them, and the `docker-compose.yml` services that ran it) has been
removed.** They existed to prove the React SPA rendered identically to the legacy app during the
migration itself — the legacy app (`app.js`, `bin/www`, `routes/*.js`, `views/**`) is now deleted,
so there's nothing left to diff against, and screenshot/HTML-parity comparisons only ever made
sense in that direction. If a similar HTML- or screenshot-diff check is wanted going forward, it
should compare the current app against its own future changes, not be resurrected against a
target that no longer exists.

## Pre-existing axe violations (5 instances, 4 rules, across 32 captured routes)

Recorded here so `a11y.spec.ts` doesn't mistake these for regressions introduced by the migration —
none of them are in the 12-item corrected-defects list (spec.md), so they carry forward unfixed
unless a future task explicitly decides otherwise.

| Route | Status | Rule(s) |
|---|---|---|
| `/tests` | 200 | `page-has-heading-one` — `tests.pug` has no `<h1>` |
| `/updates` | 200 | `page-has-heading-one` — `updates.pug` has no `<h1>` |
| `/tests/aria_alertdialog_document_mode` | 200 | `scrollable-region-focusable` — the known `ResponsiveTable` gap already documented in spec.md's Non-goals (missing `role="region"` + accessible name on the `tabindex="0"` scroll wrapper) |
| `/tests/tech__aria__aria-owns-multiple/run` | 500 | `document-title`, `empty-heading` — this route's 500 error is corrected-defect #11 (spec.md). This baseline capture intentionally preserves the *broken* pre-migration state; the post-migration app is expected to differ (crash → working page) |
| `/this-route-does-not-exist` | 404 | `document-title` — `app.js`'s error handler (`res.render('error')`) never set a `title` local, so `views/error.pug`'s `title= title` rendered empty. Genuinely pre-existing, not part of the 12-item catalogue |

If a future phase wants to fix `page-has-heading-one`, `document-title` on error pages, or
`scrollable-region-focusable`, treat that as a new, explicit decision (per this project's
accessibility skill: note the issue, confirm before changing) — none of them are silently
in scope for this migration.
