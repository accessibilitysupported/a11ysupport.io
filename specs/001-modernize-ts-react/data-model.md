# Phase 1 Data Model: Modernize to TypeScript Backend + React Frontend

This migration does not change the data model — it types and reorganizes the code that computes
and serves it. This document maps spec.md's Key Entities to their existing on-disk representation
and the TypeScript types Phase 1 (toolchain) generates for them, so later phases have one place to
confirm the type layer matches the real shapes.

## Entities

### Technology
- **Represents**: A web standard grouping related features (html, css, aria, svg).
- **Source**: `data/tech.json` (registry) + `data/tech/<techId>/*.json` (per-feature files).
- **Type**: `src/types/dev-feature.ts` generated from `data/schema/dev-feature.json` (authored
  shape); built/denormalized shape from `data/schema/feature.json` → `src/types/feature.ts`.
- **Relationships**: has many Features.

### Feature
- **Represents**: A specific capability of a technology (an element, attribute, property) with
  description, expectations, and computed support summaries.
- **Source (authored)**: `data/tech/<techId>/<featureId>.json`.
- **Source (computed)**: `build/tech/<techId>/<featureId>.json`, plus the API's view-shaped
  `build/api/tech/<techId>.json` and `build/api/home.json` (Phase 3 payload split).
- **Key fields carried through the pipeline**: `id`, `techId`, `title`, `keywords_string`,
  `possible_backend_expectations`, `core_support` / `core_support_string` (keyed by AT type:
  `sr`/`vc`/`kb` — see spec.md corrected-behavior items 1–2, where two templates read this shape
  incorrectly today), `core_support_by_at`, `core_support_by_at_browser`, `supports_at`,
  `all_dates`, `failing_dates`, `assertions[]`, `related_features`, `related_issues`.
- **Relationships**: belongs to a Technology; has many Assertions; referenced by Tests via
  `test.assertions[].feature_id`.

### Assertion
- **Represents**: A specific expectation about how a feature should be exposed to AT (role, name,
  state, etc.), scoped to a feature.
- **Source**: nested under a Feature's `assertions[]`.
- **Key fields**: `id`, `title`, `aspect`, `value`, `strength` (per AT type), `rationale`,
  `examples`, `core_support` / `core_support_string` (per AT type), `tests[]` (back-reference,
  computed by the build).

### Test / Test Case
- **Represents**: A manual verification procedure covering one or more Assertions, possibly
  across multiple Features, with an associated HTML fixture.
- **Source (authored)**: `data/tests/**/*.json` (some nested under `tech/`, `apg/`; some at
  `data/tests/` root) + fixture HTML at `data/tests/html/*.html`.
- **Source (computed)**: `build/tests/**/*.json` (note: today's schema test only validates the
  non-nested subset — Phase 2 fixes this, see plan.md Project Structure / source plan Phase 2).
- **Type**: `src/types/dev-test.ts` (authored) / `src/types/test.ts` (built).
- **Key fields**: `id`, `title`, `html_file`, `description`, `assertions[]`, `commands`
  (per AT/browser), `versions` (per AT/browser: `at_version`, `browser_version`, `os_version`,
  `date`), `history[]`, `core_support` / `core_support_string`.
- **Relationships**: has many Assertions (each linking back to a Feature Assertion by the tuple
  `(feature_id, feature_assertion_id, applied_to, references)`); has many Commands.

### Command / Result
- **Represents**: A single manual test step performed with a specific AT+browser pairing,
  producing a pass/fail/partial/unknown outcome plus notes.
- **Source**: nested under a Test's `commands[at][browser][]`, with per-assertion `results[]`.
- **Key fields**: `command`, `title`/`steps`, `before`/`after` (virtual/focus location), `output`,
  `notes`, `behind_setting`, `results[].result`, `results[].note`.

### Support Point
- **Represents**: The provenance record for one command result — who tested it, with what
  versions, when — used to compute every derived support summary above it.
- **Source**: the `versions[at][browser]` + `history[]` entries paired with a command result
  (Constitution Principle II — unchanged by this migration).
- **Computed view**: `build/support_points.json` (12.0 MB, 24,080 entries today) — too large to
  ship to the browser whole; Phase 3 pre-filters/pre-groups it into `build/api/run-tests.json`
  (priority bands 0–3 only, per spec.md's run-tests edge case).

### AT/Browser combination
- **Represents**: A pairing of an assistive technology (screen reader, voice control, or
  keyboard) with a browser, flagged "core" or "extended."
- **Source**: `data/ATBrowsers.json` — no existing JSON Schema (Phase 1 hand-writes
  `src/types/at-browsers.ts`).
- **Key fields**: `types` (`sr`/`vc`/`kb`), `core_at`/`extended_at`, `at[id]` (`title`,
  `short_title`, `core_browsers`, `extended_browsers`, `commands`, `modifier_key`), `browsers[id]`.

## Derived/API-only shapes (new in this migration)

These do not represent new product data — they are the view-shaped payload split from Phase 3 of
the source plan, needed because the browser cannot receive `build/tech.json` (6.5 MB) or
`build/features.json` (5.5 MB) whole. Each is documented as a contract in `contracts/`:

- `HomePayload` (`build/api/home.json`) — the subset of Feature fields `index.pug` reads.
- `TechIndexPayload` / `TechPayload` (`build/api/tech-index.json`, `build/api/tech/<id>.json`) —
  the subset `tech.pug`/`tech-index.pug` read.
- `RunTestsPayload` (`build/api/run-tests.json`) — Support Points pre-filtered to priority 0–3
  and pre-grouped by priority.
- `TestsIndexPayload`, `UpdatesPayload`, `CommandsPayload`, `MarkdownPagePayload` — one per
  remaining index-style view.

## Validation rules (unchanged, carried forward)

- Every `data/tests/**/*.json` file MUST validate against `data/schema/dev-test.json`.
- Every `data/tech/**/*.json` file MUST validate against `data/schema/dev-feature.json`.
- Every `build/tests/**/*.json` file MUST validate against `data/schema/test.json` — Phase 2
  fixes the non-recursive directory scan so nested built tests are actually checked (previously
  silently skipped, see plan.md's Project Structure notes).
- Every `build/tech/*/*.json` file MUST validate against `data/schema/feature.json`.

These are Constitution Principle I, unchanged by this migration except for the recursion fix,
which makes the existing rule actually apply everywhere it already claimed to.
