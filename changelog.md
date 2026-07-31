# Changelog

## 2026-07-30
Modernized the implementation without changing the product (`specs/001-modernize-ts-react`):
backend ported to TypeScript, frontend rewritten as a React single-page app, Playwright + axe-core
coverage added for every template. No change to the `data/` schema or the published package's
contents.

* The published `build/*` payload is additive: `build/api/*` now also ships the view-shaped
  JSON payloads the client fetches (per-technology and per-feature splits, a pre-filtered
  `run-tests.json`, pre-rendered markdown for the static docs), alongside the existing raw
  artifacts (`tech.json`, `tests.json`, `support_points.json`, etc).
* Fixed eleven pre-existing defects along the way (see `specs/001-modernize-ts-react/spec.md`'s
  "Corrected behavior" list) — most notably two data-processing bugs that silently corrupted
  output: the manual-testing priority escalation never fired (read a field that was never
  populated on any of the 24,080 recorded results), and the run-test page 500'd for any test
  whose assertions reference another feature.

## 2018-01-12
This was a major update to the prototype that involved the following major changes:

* Enforce a single assertion per test. In other words, do not allow test cases to test more than one name, role, value, state, or property at a time.
* Replace the "aam" test type with a more generic "assertion" type.
* Allow multiple test cases to reference the same html file via the `html_file` property on the test
* Tests now define which feature they relate to (instead of the other way around)
* Allow tests to be nested in a folder structure (will help support test suites)
* Simplification of the instructions to run a test, thanks to the new assertion data
* Note: test names changed and links were likely broken.
