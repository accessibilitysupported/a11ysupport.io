# Implementation Plan: Modernize to TypeScript Backend + React Frontend

**Branch**: `modernize` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-modernize-ts-react/spec.md`

**Source plan**: This document structures, into spec-kit form, the implementation plan already
produced and approved at `/Users/michaelfairchild/.claude/plans/i-want-to-modernize-peppy-sonnet.md`.
No decision in that plan is re-opened here; where this document and that one overlap, that one has
the full narrative and rationale, this one has the spec-kit-shaped summary and the artifacts
spec-kit expects (Constitution Check, Accessibility Design, Project Structure, data-model,
contracts, quickstart).

## Summary

Port the site's data-processing layer (`build.js` + `src/feature-helper.js`, 1767 lines of
untyped CommonJS) to TypeScript with byte-identical output; replace the Express+Pug server-rendered
frontend with a TypeScript JSON API plus a React single-page application; cover every one of the
18 live page templates with Playwright + axe-core accessibility tests; and keep every source file
at or under 600 lines. The rendered UI — content, layout, and every existing accessibility
semantic — must come out unchanged, with eleven specific pre-existing defects corrected along the
way (spec.md, Accessibility Requirements, "Corrected behavior").

**Approach**: Vite-built React SPA + Express JSON API, served by one Node process (`npm start`
unchanged). Styling splits `style.css` into CSS modules plus four global sheets. The data-build
gets an injectable clock so its output becomes deterministic and diffable. Delivered as one
integrated change on `modernize`, gated by the twelve checks in the source plan's Verification
section, with one commit per phase so the single PR remains reviewable phase-by-phase.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js ≥18 (current `engines` floor; CI adds
Node 24 per FR-011/SC-007)

**Primary Dependencies**: Express 5, React 19, React Router 7, TanStack Query, Vite,
`markdown-it` + `markdown-it-anchor`, `compression`, `sanitize-filename`, `json-schema-to-typescript`
(dev), `dayjs` (pending the date-parity test in Phase 1 — falls back to `moment` if it diverges)

**Storage**: None (flat JSON files under `data/`, unchanged; `build/` remains the generated,
gitignored output tree, now including view-shaped `build/api/*.json` payloads)

**Testing**: Vitest (unit + API/supertest), Playwright (+ `@axe-core/playwright`) for e2e,
accessibility, and visual-regression coverage, run against a pinned `mcr.microsoft.com/playwright`
container for environment-stable screenshots

**Target Platform**: Linux server (single Node process), evergreen browsers client-side (IE11
support intentionally dropped, spec.md Non-goals)

**Project Type**: Web application (Express API + React SPA, one deployable process)

**Performance Goals**: No regression versus today's server-rendered response times for equivalent
content; home page JSON payload budget of ~500 KB gzipped (Gate 3 in Verification) — if exceeded,
split into a keyword index plus lazy per-feature matrices before Phase 4 proceeds

**Constraints**: Every source file ≤600 lines (FR-004/SC-004); data-build output byte-identical to
the current implementation for the same input and the same instant (FR-001/SC-005); `npm start`
remains a single command booting a single process (FR-010/SC-006); every URL that resolves today
must keep resolving, every URL that 404s today must keep 404ing (FR-009/SC-008)

**Scale/Scope**: ~325 authored JSON files, 189 features, 128 tests, 24,080 support points, 18 live
page templates, 3 top-level routers → ~14 API route groups, 1 SPA with ~14 page components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Data integrity is the product | `npm run build` still produces the `data/` → `build/` pipeline before `npm run test` validates it; schema validation (Ajv) is preserved and extended to cover previously-unvalidated nested test directories (source plan, Phase 2) | PASS |
| II. Bookkeeping is not optional | Not touched by this migration — `versions`/`history` provenance fields and their authoring workflow (`scripts/sync-support-point.js`) are ported as-is, not redesigned | PASS |
| III. Second-person verification | Not touched — this migration is itself a single-contributor change to *code*, not to support-point data, so this principle governs data PRs, not this one. No support point, test, or feature is declared "accepted" by this work | PASS |
| IV. Expected values come from standards | Not touched — assertion/expectation data and its sourcing are unchanged | PASS |
| V. Generated fields are never hand-edited | Explicitly preserved as a hard requirement: FR-001/SC-005 require byte-identical build output, verified by Gate 1 (diff, not eyeballing). The TypeScript port computes the same fields the same way; nothing becomes hand-authored | PASS |
| VI. Respect existing code and data | **Deliberate, scoped exception** — see Complexity Tracking below. `src/feature-helper.js` and `src/test-id-helper.js` are restructured by explicit user request, justified there | JUSTIFIED EXCEPTION |
| Accessibility of the site itself | This plan's Accessibility Design section (below) carries every AR-xxx from spec.md into concrete component/label/keyboard/live-region decisions, per `building-accessible-ui` | PASS |

No unjustified gate failures. One justified exception (Complexity Tracking).

## Accessibility Design

### components

Every existing UI element is ported using the same implementation-priority rung it uses today —
native HTML wherever the current markup already uses it, which is nearly everywhere:

- **Tables** (`SupportMatrix`, `ResponsiveTable`): native `<table>`/`<caption>`/`<col>`/
  `<colgroup>`/`th[scope]`/`headers`. No ARIA grid role — these are static data tables, not
  interactive grids (per `components/tables-grids.md` guidance: interactive-grid semantics are
  only for truly interactive grids).
- **Disclosure** (test/version details, extended support): native `<details>`/`<summary>` —
  unchanged from today; no custom disclosure widget introduced (per
  `components/disclosure-widget.md`, native is the first rung and already what today's markup
  uses).
- **Run-test form** (`RunTestForm` and children): native `<form>`/`<fieldset>`/`<legend>`/
  `<label>`/`<input>`/`<select>`/`<textarea>` (per `components/forms.md`,
  `components/checkbox-group.md`-equivalent grouping guidance) — no custom form widgets.
- **Skip link** (`SkipLink`): native anchor + native focusable `<main tabindex="-1">` (per
  `components/page-layout.md`).
- **Live regions** (`SearchLiveRegion`, `RouteAnnouncer`, `LoadingStatus`): native
  `aria-live`/`role="status"`/`role="alert"` on plain elements — no component library, this is
  the correct minimal-ARIA rung per `references/status-messages.md`.

No fully custom ARIA widget is introduced anywhere in this migration. The one net-new interactive
pattern — client-side route navigation — reuses `role="status"` (status-messages.md) rather than
inventing a bespoke live-region pattern.

### labels

| Control | Visible label | Accessible name | Notes |
|---|---|---|---|
| Feature search input | "Find support for a feature (search by element or attribute…)" | Same, via `<label for>` | Unchanged from today (`FeatureSearch`) |
| Run-test AT/browser combination select | "Select your testing combination." | Same, via `<label for>` | Unchanged (`CombinationPicker`) |
| Run-test version inputs (AT/OS/browser version) | "AT Version (required)" etc. | Same + required state | `aria-required="true"` retained (AR-006) |
| Run-test output/notes/behind-setting textareas | Per-command labels, e.g. "Output" | Same, via `<label for>`, id includes AT+browser+command index | Unchanged pattern from `feature-test.js` |
| Result select (pass/fail/partial/unknown) | "Result" | Same | Grouped under its command's `<fieldset>`/`<legend>` (AR-006) |
| Skip-to-content link | "Skip to main content" | Same | First focusable element (AR-001) |
| Support-matrix data cells | Support status text ("yes"/"no"/"partial"/"unknown" family) | Announced via `headers=` chain to expectation + AT + browser column headers, not the cell's own text alone | AR-002 — this is the highest-risk item to preserve exactly |

### grouping

Unchanged from today: every command in the run-test form is a `<fieldset>` with a `<legend>`
naming the test case; every result within a command is its own nested `<fieldset>`/`<legend>`
naming the expectation. Group-level context (which AT/browser combination is active) is
established by the visible/hidden `.combo` section heading, not repeated per control. No group
help/error text is attached to an intermediate wrapper — errors surface in the single
`ErrorSummary` region (AR-006), matching today's `#error_container` behavior.

### keyboard

- **Tab order**: Unchanged from today — skip link first, then header nav, then main content in
  document order, sidebar last. React Router navigation does not reorder the DOM relative to
  today's per-page-load order.
- **Key behavior**: `<details>`/`<summary>` retain native Enter/Space toggle (no polyfill needed —
  dropping IE11 removes the reason the polyfill existed). Form controls retain native behavior.
  No arrow-key composite widgets exist today and none are introduced.
- **Focus move**: Skip link → `#main` (AR-001, unchanged). Search submit → results `h2[tabindex=-1]`
  (AR-005, unchanged). Route change → new page's `h1[tabindex=-1]` (AR-011, **new** — required
  because full page loads no longer provide this for free). Validation failure → error summary
  container (AR-006, unchanged).
- **Focus restore**: No modals are introduced by this migration, so no new focus-restore case
  exists. The skip-link `show-focus-outline` class toggle (focus outline shown only when
  keyboard-activated, cleared on blur) is ported verbatim from `layout.pug:43-53`.

### dynamic_state

- `aria-invalid="true"` on run-test fields that fail validation, set/cleared exactly when
  `feature-test.js`'s `validate()` does it today (AR-006).
- `aria-required="true"` on the three run-test version inputs, static, unchanged.
- `aria-expanded` is not used — disclosures are native `<details>`, whose open/closed state is
  exposed natively, not via ARIA.
- `aria-live="polite"`/`"assertive"` on the two search live regions (AR-005) and the new
  `role="status"` route announcer (AR-011) — states are transient content updates, not persistent
  ARIA state attributes.

### status_messages

| Region | Politeness | Message | Trigger |
|---|---|---|---|
| Search result count | `polite` | "N results found" / "N results found for {query}" | Every keystroke in the search input, debounced by the existing rate-limit-and-clear-after-2000ms behavior (AR-005, unchanged) |
| Search "no results" | `assertive` | "Sorry, no results could be found." | Same input handler, when result count transitions to zero (AR-005, unchanged) |
| Route announcer | `polite` (`role="status"`) | "{new page title}" | Every client-side navigation (AR-011, **new**) |
| Loading indicator | `polite` (`role="status"`) | "Loading…" | Any data fetch exceeding 200ms (AR-012, **new**) |
| Error boundary | N/A (`role="alert"`, assertive by role semantics) | Same heading text as today's `error.pug` | A failed fetch for the current route (AR-013, **new**) |

## Project Structure

### Documentation (this feature)

```text
specs/001-modernize-ts-react/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/            # Phase 1 output — the /api surface
└── tasks.md              # Phase 2 output (/speckit-tasks — not created by this command)
```

### Source Code (repository root)

```text
server/                        # Express 5 + TypeScript JSON API
├── index.ts                   # from bin/www
├── app.ts                     # from app.js — middleware, static mounts, SPA fallback
├── routes/
│   ├── tech.ts                 # from routes/tech.js
│   ├── tests.ts                 # from routes/tests.js
│   └── content.ts               # from routes/index.js
└── lib/
    ├── load-build.ts
    ├── known-routes.ts          # honest-404 table for the SPA fallback
    └── errors.ts

src/                            # shared data layer + types (used by server AND the build step)
├── build/                      # ported from build.js + src/feature-helper.js
│   ├── index.ts
│   ├── clock.ts                 # injectable BUILD_NOW
│   ├── initialize-feature.ts
│   ├── bubble-support.ts
│   ├── negative-support.ts
│   ├── initialize-test-case.ts
│   │   ├── test-case/commands.ts
│   │   ├── test-case/results.ts
│   │   ├── test-case/versions.ts
│   │   └── test-case/priority.ts
│   ├── support-string.ts
│   ├── sort.ts
│   ├── load-data.ts
│   └── emit-api-payloads.ts
├── lib/
│   ├── test-id-helper.ts        # from src/test-id-helper.js — shared server+client
│   └── sp-md-to-obj.ts          # from src/sp-md-to-obj.js
└── types/                       # generated from data/schema/*.json, plus hand-written api.ts

client/                         # React 19 + Vite SPA
├── main.tsx
├── routes.tsx
├── layout/                      # Layout, SkipLink, SiteHeader, SiteFooter, BetaWarning, RouteAnnouncer
├── pages/                       # one file per route, ≤600 lines each
├── components/                  # SupportMatrix, SupportMatrixHeader, SupportCell, ResponsiveTable,
│                                 # FeatureSearch, SearchLiveRegion, TestProcedure, CommandTable,
│                                 # AssertionPhrase, OnThisPage, MarkdownContent, LoadingStatus,
│                                 # RouteErrorBoundary, ExtendedSupportTable, AssertionDetail,
│                                 # VersionsTable, HistoryList (the last four split out of
│                                 # TestCasePage to keep every file ≤600 lines — see tasks.md T065/T067)
├── features/run-test/           # RunTestForm and its split children
└── styles/                      # tokens.css, global.css, utilities.css, support.css + *.module.css

tests/
├── unit/                        # Vitest: schema, date-parity, support-string, bubble-support, …
├── api/                         # supertest: routes, public-urls, status-codes
└── e2e/                         # Playwright: routes, a11y, search, run-test, navigation, visual

tools/baseline/                  # Phase 0 baseline capture (HTML/PNG/axe snapshots + route inventory)
baseline/                        # committed baseline artifacts, diffed against in every later phase
```

**Structure Decision**: Web application split into `server/` (API), `client/` (SPA), and a shared
`src/` (data-build + types consumed only server-side/build-side, never shipped to the browser).
This mirrors the plan's Phase 2–4 module maps exactly; no new structural decision is made here
beyond organizing those maps under the three top-level directories spec-kit expects for a web
application (Technical Context: web application).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Restructuring `src/feature-helper.js` and `src/test-id-helper.js` (Constitution Principle VI) | The explicit, user-requested deliverable is a TypeScript port under a 600-line-per-file cap. `feature-helper.js` alone is 1382 lines with five distinct responsibilities (initialize feature, bubble support, negative-support check, initialize test case, generate support string) — it cannot be typed and capped at 600 lines per file without splitting along those existing responsibility boundaries. | Porting to TypeScript without splitting was rejected because the single 1382-line file (plus 385-line `build.js`) would violate FR-004/SC-004 outright — leaving it whole is not an available option once the file-size requirement is accepted. The split follows the module's own existing five-function boundary (source plan, Phase 2), so it is a mechanical decomposition of already-separate responsibilities, not a redesign of behavior — and Gate 1's byte-identical build-output diff is the check that the split introduced no behavioral change. |
