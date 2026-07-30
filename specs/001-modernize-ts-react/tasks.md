---

description: "Task list for: Modernize to TypeScript Backend + React Frontend"

---

# Tasks: Modernize to TypeScript Backend + React Frontend

**Input**: Design documents from `specs/001-modernize-ts-react/` (spec.md, plan.md, research.md,
data-model.md, contracts/api.md, quickstart.md) and the source plan at
`/Users/michaelfairchild/.claude/plans/i-want-to-modernize-peppy-sonnet.md`.

**Tests**: Requested explicitly (spec.md FR-003/FR-011, User Story 3). Test tasks are included
throughout, not deferred to a final phase.

**Organization**: This migration has hard technical sequencing that a pure user-story-first
breakdown would fight — the React SPA (US1, US2) cannot be built before the API exists (which
cannot exist before the data-build port exists, which cannot be verified without a deterministic
build). Tasks are therefore grouped by the eight build phases from plan.md's Project Structure,
in dependency order; every task still carries a `[USn]` label mapping it to the user story it
serves, per spec.md:
- **US1** (P1) — site visitor sees no change
- **US2** (P2) — contributor works in a maintainable codebase
- **US3** (P3) — accessibility regressions are caught automatically

Tasks with no direct user-facing or maintainability effect (pure scaffolding) carry no story
label, matching the template convention for Setup/Foundational work.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no unresolved dependency)
- **[USn]**: Which user story this task serves
- Every task names its exact file path(s)

## Accessibility done-criteria

Every task that renders, modifies, or reviews UI (all of Phase 4 and Phase 5) carries its own
"Done when" criterion plus the automated test that proves it, per plan.md's Accessibility Design
section — never a separate, cuttable "add accessibility" task.

---

## Phase 0: Baseline Capture

**Purpose**: Nothing later is verifiable without this. Establishes the deterministic,
environment-pinned "before" snapshot that every later phase diffs against.

- [ ] T001 Add an injectable clock to the current build: `feature-helper.js` takes `now` as a
      parameter instead of `let now = new moment()` (currently line 3); `build.js` reads a
      `BUILD_NOW` env var (ISO 8601, default `Date.now()`) and passes it through. This is a small
      edit to the *existing* JS files, made first, so both today's build and the future TS build
      can be pinned to the same instant.
- [ ] T002 Add a `docker-compose.yml` service pinned to `mcr.microsoft.com/playwright` (version
      matching the `@playwright/test` version Phase 1 will install) exposing `npm run baseline`
      and `npm run visual` as containerized commands.
- [ ] T003 [P] Write `tools/baseline/routes.ts`: reads `build/test_map.json`, `build/tech.json`,
      and `data/ATBrowsers.json` to generate the branch-driven route inventory from plan.md's
      Phase 0 table (index/feature/test-case/test-case-run/tech/run-tests/learn-at branch
      coverage), plus the single-shape routes (tech-index, tests, updates, commands, the four
      static-page routes, error).
- [ ] T004 [P] Write `tools/baseline/capture.ts`: for each route from T003, saves rendered HTML
      (normalized via `prettier --parser html`) to `baseline/html/`, Playwright screenshots at
      1920/1441/1280/320px to `baseline/png/`, and axe-core results to `baseline/axe/`. Pins the
      Playwright browser clock (`page.clock.setFixedTime()`) to the same instant used for
      `BUILD_NOW` in T001.
- [ ] T005 Delete `views/test-case/locate-note.pug` (no `include` references it anywhere in
      `views/`).
- [ ] T006 Run `BUILD_NOW=<fixed-iso-instant> npm run build && docker compose run baseline`,
      review the output, and commit `baseline/html/`, `baseline/axe/`, and `baseline/BUILD_NOW`
      to the `modernize` branch. `baseline/png/` (167MB against a ~3.5MB repo, no git-lfs
      configured) is gitignored instead and regenerated on demand by the same command whenever
      Gate 6 (visual parity) needs to run — HTML and axe are what's committed because they're
      small, text-diffable, and sufficient for Gates 5 and 7.

**Checkpoint**: `baseline/` exists and is committed. Every later phase's parity checks (Gates
1, 5, 6, 7 in quickstart.md) are meaningless without it.

---

## Phase 1: Toolchain, Types, Dependencies

**Purpose**: Foundational tooling every later phase depends on. Blocks all of Phases 2–6.

- [ ] T007 [P] Add `tsconfig.json` (strict mode, `moduleResolution: bundler`) at the repo root.
- [ ] T008 [P] Add `eslint.config.js` (flat config, `typescript-eslint`) at the repo root.
- [ ] T009 [P] Add `.prettierrc` at the repo root.
- [ ] T010 [P] Add `vite.config.ts` at the repo root, targeting `client/` as the app root and
      `dist/` as the build output.
- [ ] T011 [P] Add `playwright.config.ts` at the repo root, configured to run against a built
      preview server (`vite build` + `vite preview`), not the dev server.
- [ ] T012 [P] Add `vitest.config.ts` at the repo root.
- [ ] T013 Repair `package.json`: move `express`, `markdown-it`, `markdown-it-anchor`,
      `http-errors`, `compression`, `sanitize-filename` into a real `dependencies` block (today
      everything is misfiled under `devDependencies`, so `npm ci --omit=dev` produces a
      non-running app); add `glob` and `markdown-it` as explicit dependencies (currently used but
      undeclared, resolving transitively to a six-majors-stale `markdown-it@8`); remove `pug`,
      `cookie-parser`, `morgan`, `node-glob`, `jstransformer-markdown-it`, `rimraf`, `mocha`,
      `chai`.
- [ ] T014 Delete `.travis.yml` (dead legacy CI config superseded by
      `.github/workflows/node.js.yml`).
- [ ] T015 [P] [US2] Write `tests/unit/date-parity.test.ts`: runs both `moment` and `dayjs`
      `fromNow()` over every date present in `build/` (`all_dates`, `failing_dates`,
      `versions[*].date`, `history[*].date`) against the pinned `BUILD_NOW` from T001, asserting
      identical output. This test's result decides whether Phase 2/4 use `dayjs` or keep
      `moment` — do not assume the outcome.
- [ ] T016 [P] Generate `src/types/dev-test.ts`, `src/types/dev-feature.ts`, `src/types/test.ts`,
      `src/types/feature.ts` via `json-schema-to-typescript` from `data/schema/*.json`; wire into
      an `npm run types` script so future schema edits regenerate these.
- [ ] T017 [P] Hand-write `src/types/at-browsers.ts` (typing `data/ATBrowsers.json`, which has no
      JSON Schema) per the shape documented in data-model.md.
- [ ] T018 [P] Hand-write `src/types/api.ts` (the `HomePayload`, `TechIndexPayload`,
      `TechPayload`, `RunTestsPayload`, `TestsIndexPayload`, `UpdatesPayload`, `CommandsPayload`,
      `MarkdownPagePayload` shapes from contracts/api.md and data-model.md).

**Checkpoint**: `npm run lint`, `npm run typecheck`, and `npx tsc --noEmit` all run (even against
an otherwise-empty `src/`). Toolchain is ready for Phase 2.

---

## Phase 2: Port Data Build to TypeScript

**Purpose**: US2 (maintainable, typed codebase) and the hard prerequisite for Phase 3 (the API
serves this layer's output). Blocks Phases 3 and 4.

- [ ] T019 [US2] Create `src/build/clock.ts`: the injectable `now` from T001, ported to
      TypeScript, exporting a `resolveBuildNow(): Date` that reads `BUILD_NOW` or defaults to
      `new Date()`.
- [ ] T020 [P] [US2] Create `src/build/sort.ts`: port `sortByProperty`/`sortByKeys` from
      `build.js:20-35`.
- [ ] T021 [P] [US2] Create `src/build/load-data.ts`: replace `require()`-as-data-loader with
      `fs.readFileSync` + `JSON.parse` (today's `require()` pins ~300 JSON blobs in the module
      cache and can never re-read a changed file in one process).
- [ ] T022 [US2] Create `src/build/initialize-feature.ts`: port
      `helper.initalizeFeatureObject` (`feature-helper.js:52-343`). Depends on T020, T021.
- [ ] T023 [US2] Create `src/build/bubble-support.ts`: port `helper.bubbleFeatureSupport`
      (`feature-helper.js:344-624`). Depends on T020, T021.
- [ ] T024 [US2] Create `src/build/negative-support.ts`: port
      `helper.checkForOnlyNegativeSupport` (`feature-helper.js:625-661`). Depends on T023.
- [ ] T025 [US2] Create `src/build/support-string.ts`: port `helper.generateSupportString`
      (`feature-helper.js:1269-1381`). Depends on T020.
- [ ] T026 [US2] Create `src/build/test-case/commands.ts`, `src/build/test-case/results.ts`,
      `src/build/test-case/versions.ts`, and `src/build/test-case/priority.ts` (the last using
      T019's clock for the `now.diff(date, 'days')` priority-band logic at
      `feature-helper.js:1180-1223`) by splitting `helper.initalizeTestCase`
      (`feature-helper.js:662-1268`) along its existing stages — this file is ~600 lines and must
      not be ported as one file (FR-004). Fixes corrected-defect #10 while porting
      `priority.ts`: the original reads `results[at].browsers[browser].date`, which is never
      populated on any of the 24,080 recorded results (confirmed by direct inspection during
      Phase 0), so `moment(undefined)` silently evaluates to "right now" and the staleness
      escalation (priority 2→1, 4→3) never fires. Read
      `testCase.versions[at].browsers[browser].date` instead — the field that actually holds it.
      This is an intentional, documented exception to Gate 1's byte-identical requirement (see
      quickstart.md's Gate 1 note): `priority` values are expected to change for stale results;
      no other field should.
- [ ] T027 [US2] Create `src/build/initialize-test-case.ts`: thin orchestrator composing T026's
      four modules, replacing `helper.initalizeTestCase`.
- [ ] T028 [US2] Create `src/build/emit-api-payloads.ts` (the Phase 3 payload split — see T037);
      stubbed in this phase to keep `src/build/index.ts` complete, fully implemented in Phase 3.
- [ ] T029 [US2] Create `src/build/index.ts`: port `build.js`'s orchestration only (not its
      helper logic, which is now in T019–T028). Fix the three orchestration-level defects while
      porting: the unqualified global leaks at `build.js:131-134`
      (`for (at in test.versions)` / `for (browser in ...)` with no `let` — TS `strict` makes this
      a compile error so it cannot be silently reintroduced), the disk-round-trip-as-IPC pattern
      (`initalizeFeatures` writes `build/tech/<id>/` then `getFeatures` re-`require`s the same
      directory — pass values in memory, write once at the end), and the shared-object mutation
      at `build.js:285` (mutates the `tech` object loaded from `data/tech.json` before writing it
      back out — load a fresh copy instead).
- [ ] T030 [P] [US2] Create `src/lib/test-id-helper.ts`: port `src/test-id-helper.js`, converting
      `generateTestTitle`'s 150-line if-ladder (keyed on `before.virtual_location`,
      `before.focus_location`, `after`) into a lookup table keyed by that tuple. Lives in
      `src/lib/` because both `server/` and `client/` import it.
- [ ] T031 [P] [US2] Create `src/lib/sp-md-to-obj.ts`: port `src/sp-md-to-obj.js` unchanged in
      behavior.
- [ ] T032 [P] [US2] Port `scripts/sync-support-point.js` → `scripts/sync-support-point.ts` (the
      primary data-intake path per `readme.md`'s "accept a support point" — must keep working
      unchanged).
- [ ] T033 [P] [US2] Port `scripts/initalize-test.js` → `scripts/initalize-test.ts`.
- [ ] T034 [P] [US2] Port `scripts/generate-features.js` → `scripts/generate-features.ts` and
      `scripts/sync_wpt.js` → `scripts/sync_wpt.ts`, replacing `require('node-fetch')` v3
      (ESM-only, already broken under `require`) with the built-in `fetch`.
- [ ] T035 [P] Delete `data/sample_feature.json` and `data/validate.js` (old schema shape, dead).
- [ ] T036 ~~Superseded by T089 (Phase 6), which ports the schema tests and fixes the
      non-recursive `build/tests` scan directly~~ — no separate task needed here; the deletion
      of the old `test.js` is handled once by T107, not duplicated in this phase.

**Checkpoint**: `node --loader ts-node/esm src/build/index.ts` (or the compiled equivalent) runs
end-to-end against `data/` and produces a `build/` tree. Gate 1 (byte-identical diff against the
Phase 0 baseline's JS-build output, both pinned to the same `BUILD_NOW`) is the acceptance test
for this entire phase — run it before moving to Phase 3.

---

## Phase 3: JSON API (Express 5 + TypeScript)

**Purpose**: US1 (site visitor sees no change) depends on this serving the same effective content
as today's Pug routes; US2 depends on it being typed and file-size-scoped. Blocks Phase 4.

- [ ] T037 [US1] Implement `src/build/emit-api-payloads.ts` fully (stubbed in T028): emit
      `build/api/home.json` (the `HomePayload` fields from data-model.md — `id`, `techId`,
      `title`, `keywords_string`, `possible_backend_expectations`, `supports_at`,
      `core_support`, `core_must/should/may_support_string`, `core_support_by_at_browser`,
      `total_test_count`, `all_dates`, `failing_dates`, `allTests` — not the full 5.5 MB
      `features.json`), `build/api/tech-index.json`, `build/api/tech/<techId>.json` (per
      contracts/api.md, not the 6.5 MB nested tree), `build/api/run-tests.json` (support points
      pre-filtered to priority 0–3 and pre-grouped, per spec.md's run-tests edge case — collapses
      from 24,080 entries), `build/api/tests-index.json`, `build/api/updates.json`,
      `build/api/commands.json`, and `build/api/markdown/<page>.json` (FAQ/CONTRIBUTING/learn
      docs pre-rendered with `markdown-it` + `markdown-it-anchor` at build time).
- [ ] T038 [US2] Create `server/lib/load-build.ts`: cached reads of `build/` and `build/api/`
      artifacts (replacing per-request `require()` calls in today's route files).
- [ ] T039 [US1] Create `server/lib/known-routes.ts`: derives at boot, from `build/`, the full
      set of paths that resolve to real content — the static route list, `/tech/:techId` (keys of
      `tech.json`), `/tech/:techId/:featureId` (existence check against
      `build/tech/<techId>/<featureId>.json`), `/tests/:testId` and `/tests/:testId/run` (keys of
      `test_map.json`), `/tests/:testId/:featureId/:assertionId/:atId/:browserId` (validated
      against that test's assertions and `ATBrowsers`), and `/learn/at/:id` (the existing 14-AT
      allow-list from `routes/index.js:95`). Used by `server/app.ts` (T042) so unmatched paths
      404 instead of the SPA fallback returning 200 for everything.
- [ ] T040 [P] [US2] Create `server/lib/errors.ts`: typed error helpers replacing `http-errors`
      usage patterns from the current routes.
- [ ] T041 [US1] Create `server/routes/content.ts`: port `routes/index.js` — `/api/home`,
      `/api/at-browsers`, `/api/updates`, `/api/commands`, `/api/run-tests`,
      `/api/content/:page` (`faq|contribute|learn|vc_differences`), `/api/learn/at/:id` (same
      14-AT allow-list guard as `known-routes.ts`). Depends on T037, T038.
- [ ] T042 [US1] Create `server/routes/tech.ts`: port `routes/tech.js` — `/api/tech`,
      `/api/tech/:techId`, `/api/tech/:techId/:featureId`, keeping the `sanitize-filename` guard
      on `:techId`/`:featureId` from `routes/tech.js:46` (path-traversal-relevant). Depends on
      T037, T038.
- [ ] T043 [US1] Create `server/routes/tests.ts`: port `routes/tests.js` — `/api/tests`,
      `/api/tests/:testId`, `/api/tests/:testId/run`,
      `/api/tests/:testId/:featureId/:featureAssertionId/:atId/:browserId`, keeping the
      `undoMakeSafe` (`__` → `/`) `:testId` decoding from T030. Depends on T038.
- [ ] T044 [US1] Create `server/app.ts`: port `app.js` — middleware, the three static mounts
      (`public/`, `build/`, `data/`, preserved per FR-012/contracts/api.md — `/ATBrowsers.json`,
      `/latest_versions.json`, `/tests/html/**.html`, and the `build/*.json` files stay live at
      their current URLs), route registration (T041–T043), the SPA fallback that checks
      `known-routes.ts` (T039) before serving `dist/index.html` so the HTTP status is 200 for
      known routes and 404 otherwise, and `ga.html` injection into `dist/index.html` at serve
      time (ported from `app.js:34-36`, conditional on the file's existence).
- [ ] T045 [US1] Create `server/index.ts`: port `bin/www` — http server, port resolution, error
      handlers. `npm start` boots this single process serving `dist/` + `/api` (FR-010/SC-006, no
      change to the operational contract).
- [ ] T046 Delete `app.js`, `bin/www`, `routes/index.js`, `routes/tech.js`, `routes/tests.js`
      once T041–T045 are verified working (Gate 3 in quickstart.md).

**Checkpoint**: `npm run build && npm start` boots one process; every endpoint in
contracts/api.md responds; Gate 3 and Gate 4 from quickstart.md pass (API shapes correct, known
routes 200, unknown routes 404, preserved public URLs still resolve).

---

## Phase 4: React SPA

**Purpose**: The core of US1 (identical rendered UI) and US2 (React, component-scoped files).
Depends on Phase 3's API existing.

### Layout and cross-cutting UI

- [ ] T047 [US1] Create `client/layout/SkipLink.tsx`: the skip-to-`#main` link, first focusable
      element, porting the `show-focus-outline` class toggle from `layout.pug:43-53` (outline
      shown only when keyboard-activated, cleared on blur).
      Done when: activating the link moves focus to `#main`; the focus outline appears only when
      the skip link itself was reached via keyboard, not mouse.
      Test: `tests/e2e/navigation.spec.ts`.
- [ ] T048 [P] [US1] Create `client/layout/SiteHeader.tsx` and `client/layout/SiteFooter.tsx`:
      port the `header[role]`/`nav[role]`/`footer[role]` structure from `layout.pug:16-42`,
      **dropping** the redundant `role="banner"/"navigation"/"contentinfo"` (native
      `<header>`/`<nav>`/`<footer>` already carry that semantics; the explicit roles duplicate it
      and axe flags them as a best-practice violation).
      Done when: exactly one `<header>`, one `<nav>`, one `<footer>` render with no redundant
      landmark roles.
      Test: `tests/e2e/a11y.spec.ts`.
- [ ] T049 [P] [US1] Create `client/layout/BetaWarning.tsx`: port the beta-warning callout from
      `layout.pug:36-37` verbatim.
- [ ] T050 [US1] Create `client/layout/Layout.tsx`: the `<main id="main" tabindex="-1">`
      landmark wrapper composing T047–T049, matching `layout.pug:16-38`'s structure exactly
      (single `<main>` landmark, FR-006).
      Done when: exactly one `<main>` landmark exists per page; it is programmatically focusable.
      Test: `tests/e2e/a11y.spec.ts`.
- [ ] T051 [US1] Create `client/layout/RouteAnnouncer.tsx`: on every route change, set
      `document.title` to the exact string the corresponding Express route used to set, update
      `<link rel="canonical">` (replacing `app.js:18-21`'s server-side canonical logic), move
      focus to the new page's `h1[tabindex=-1]`, announce the new title via a `visually-hidden
      role="status"` region, and fire a GA pageview if `ga.html` was injected (T044) — GA does not
      auto-track client-side navigation, so without this, pageviews silently drop to one per
      session (spec.md edge case).
      Done when: on every route change, title/canonical update, focus lands on the new `h1`, and
      a screen reader receives one announcement of the new page title.
      Test: `tests/e2e/navigation.spec.ts`.
- [ ] T052 [P] [US1] Create `client/components/LoadingStatus.tsx`: `visually-hidden
      role="status"` announcing "Loading" plus an inline "Loading…" paragraph, shown only after a
      200ms delay so fast responses never flash it (the one unavoidable new UI surface this
      migration adds, since content no longer arrives complete on first paint).
      Done when: a fetch resolving under 200ms never shows the indicator; one resolving slower
      shows and then removes it, with the status announced once.
      Test: `tests/e2e/navigation.spec.ts`.
- [ ] T053 [P] [US1] Create `client/components/RouteErrorBoundary.tsx`: per-route error boundary
      for failed fetches (which have no analogue today — a 500 rendered `error.pug` server-side),
      using `role="alert"` and the same heading structure as `error.pug`.
      Done when: a failed data fetch renders an alert-role error region with a heading, matching
      `error.pug`'s structure.
      Test: `tests/e2e/routes.spec.ts`.

### Shared data components (used across multiple pages)

- [ ] T054 [US1] Create `client/components/SupportMatrix.tsx`,
      `client/components/SupportMatrixHeader.tsx`, and `client/components/SupportCell.tsx`: the
      colgroup/scope/headers support-status table, reproducing `test-case.pug:99-111`'s wiring
      exactly — `<caption>`, `<col>`/`<colgroup span>`, `th[scope=colgroup]`, `th[scope=col]`,
      `th[scope=row]`, multi-id `aria-labelledby` naming the table from surrounding headings, and
      `headers=` (React: a space-joined string) on every data cell. This is the highest-risk
      component in the migration — a single off-by-one in the loop-index-generated `headers=`
      values silently breaks cell/header association with no visual symptom.
      Done when: every data cell's `headers` attribute matches, cell-for-cell, the equivalent
      cell in `baseline/html/` for every route that renders a support matrix.
      Test: HTML diff against `baseline/html/` (Gate 5) plus `tests/e2e/a11y.spec.ts`.
- [ ] T055 [P] [US1] Create `client/components/ResponsiveTable.tsx`: the `tabindex="0"` scroll
      wrapper from `feature.pug:73` / `test-case.pug:76` etc., unchanged behavior (the missing
      `role="region"` + accessible name is a documented pre-existing gap, spec.md Non-goals —
      intentionally not added here).
      Done when: wide tables remain keyboard-reachable via the wrapper exactly as today.
      Test: `tests/e2e/a11y.spec.ts` (confirms no *new* violation; the missing region name is
      expected in the baseline).
- [ ] T056 [P] [US1] Create `client/components/TestProcedure.tsx`: port the
      `test-procedure.mixin.pug` ordered-list step generator (launch AT, find target by CSS
      selector, position virtual/keyboard focus, issue command, record result) verbatim.
- [ ] T057 [P] [US1] Create `client/components/CommandTable.tsx`: port
      `command-table.mixin.pug` (Task/Command/Notes table per AT).
- [ ] T058 [P] [US1] Create `client/components/AssertionPhrase.tsx`: port
      `test-case/assertion.pug`'s phrasing logic verbatim.
- [ ] T059 [P] [US1] Create `client/components/OnThisPage.tsx`: port the "On this page" jump-link
      list pattern shared by `feature.pug`/`test-case.pug`.
- [ ] T060 [P] [US1] Create `client/components/MarkdownContent.tsx`: renders the pre-rendered
      HTML from `build/api/markdown/<page>.json` (T037) via the same
      `markdown-it`+`markdown-it-anchor` output used today, avoiding re-rendering markdown in the
      browser.

### Feature search (home page + tests index)

- [ ] T061 [US1] Create `client/components/SearchLiveRegion.tsx` and
      `client/components/FeatureSearch.tsx`: port `public/js/search.js` — two separate
      `visually-hidden` live regions (`aria-live="polite"` for result counts,
      `aria-live="assertive"` for "no results"), written then cleared after 2000ms
      (`search.js:52-66`); form submit suppressed and focus moved to the results
      `h2[tabindex=-1]`; the exact strings "Sorry, no results could be found.", "results found",
      "N results found for Q", "N results found". Fixes corrected-defect #3 while porting: the
      live region selectors must actually match on `/tests` too (today `tests.pug:6` declares
      `.live-announcements` while `search.js` looks for `.live-announcements-polite`/`-assertive`,
      so announcements are silently dropped there).
      Done when: typing in the search input filters results, announces the count via the polite
      region, and announces "no results" via the assertive region, on both the home page and the
      all-tests page.
      Test: `tests/e2e/search.spec.ts`.

### Pages

- [ ] T062 [US1] Create `client/pages/HomePage.tsx`: port `index.pug`, composing
      `FeatureSearch`/`SupportMatrix`. Fixes corrected-defect #8 (the search result count MUST
      NOT nest inside the `<h2>`, `index.pug:18-20` — invalid structure today) and defect #9 (the
      AT/browser sub-group table headers must sit correctly relative to `<thead>`,
      `index.pug:48-53` — `<col>`/`<colgroup>` belong before it, not inside it).
      Done when: HTML diff against `baseline/html/index` shows zero unintended differences.
      Test: HTML diff (Gate 5) + `tests/e2e/a11y.spec.ts` + `tests/e2e/search.spec.ts`.
- [ ] T063 [P] [US1] Create `client/pages/TechIndexPage.tsx`: port `tech-index.pug`.
- [ ] T064 [P] [US1] Create `client/pages/TechPage.tsx`: port `tech.pug`. Fixes corrected-defect
      #1 (`feature.core_support_string.string` read today, but the build emits
      `core_support_string` keyed by AT type `.sr`/`.vc`/`.kb` — renders blank today,
      `tech.pug:32`).
      Done when: every feature row shows its correct per-AT-type support summary.
      Test: HTML diff (Gate 5) covering the `tech.json`-features / `tech.json`-no-features branch
      pair from Phase 0's inventory.
- [ ] T065 [US1] Create `client/pages/FeaturePage.tsx`,
      `client/components/ExtendedSupportTable.tsx`, `client/components/AssertionDetail.tsx`: port
      `feature.pug` (245 lines), split so no resulting file exceeds 600 lines, composing
      `SupportMatrix`, `AssertionPhrase`, `OnThisPage`.
      Done when: HTML diff against `baseline/html/` is clean across every feature-page branch in
      Phase 0's inventory (with/without assertions, related features, related issues, stale
      results caution).
      Test: HTML diff (Gate 5) + `tests/e2e/a11y.spec.ts`.
- [ ] T066 [P] [US1] Create `client/pages/TestsPage.tsx`: port `tests.pug`, reusing
      `FeatureSearch`/`SearchLiveRegion`.
- [ ] T067 [US1] Create `client/pages/TestCasePage.tsx`, `client/components/VersionsTable.tsx`,
      `client/components/HistoryList.tsx`: port `test-case.pug` (333 lines — the largest
      template), splitting into `SupportMatrix` + `AssertionDetail` (T065) +
      `ExtendedSupportTable` (T065) + `VersionsTable` + `HistoryList` so every file stays under
      600 lines. Fixes corrected-defect #5 (does not load `feature-test.js`'s run-test logic on
      this read-only page, avoiding today's crash from `form.testing-pref` not existing here,
      `test-case.pug:333`/`feature-test.js:12`).
      Done when: HTML diff against `baseline/html/` is clean across every test-case branch in
      Phase 0's inventory (local short/long fixture, external fixture, not-applicable assertions,
      pass-strategy all/any, applied-to/references variants).
      Test: HTML diff (Gate 5) + `tests/e2e/a11y.spec.ts`.
- [ ] T068 [US1] Create `client/pages/TestCaseRunPage.tsx`: port `test-case-run.pug`. Fixes
      corrected-defect #2 (`test.core_support_string.class/.string` read today, same AT-type-keyed
      shape bug as defect #1, `test-case-run.pug:9-10`) and corrected-defect #6 (the instructions
      say "navigate to the test page iframe," but no iframe exists anywhere in the product —
      corrected to describe the actual flow of opening the test page directly, per spec.md's
      Accessibility Requirements item 6 decision not to add a new iframe).
      Done when: the support-level banner renders correctly; the instructions no longer reference
      a nonexistent iframe.
      Test: HTML diff (Gate 5).
- [ ] T069 [US1] Create `client/features/run-test/RunTestForm.tsx`,
      `CombinationPicker.tsx`, `ComboSection.tsx`, `CommandFieldset.tsx`, `ResultFieldset.tsx`,
      `ErrorSummary.tsx`, `IssueOutput.tsx`, `useTestingPrefs.ts`, and `buildIssueBody.ts`: port
      `public/js/feature-test.js` (342 lines), split into the files above so none exceeds 600
      lines. `buildIssueBody.ts` is the pure markdown-diff generator, unit-testable in isolation.
      Preserves nested `<fieldset>`/`<legend>` per command and per result, explicit `<label for>`
      on every control, `aria-required="true"` on the three version inputs,
      `aria-invalid="true"` on validation failures, and the focusable itemized error summary
      (`feature-test.js:140-193`). Fixes corrected-defect #4 (`hideAllCombos()` loops on an
      undefined global `assertions.length` instead of `combos.length`,
      `feature-test.js:123-128`) and corrected-defect #11 in `ResultFieldset.tsx`'s legend
      (`test-case-run.pug:123-128`): render `assertion.references_titles` as-is, **without**
      calling `.join(', ')` on it — the build (`src/build/test-case/*.ts`, T026/T027) already
      returns it pre-joined as a plain string, so the original `.join()` call throws and crashes
      the entire page (HTTP 500) for any test whose assertions have `references`. Confirmed live
      during Phase 0 baseline capture on `/tests/tech__aria__aria-owns-multiple/run`.
      Done when: submitting with missing required fields shows `aria-invalid` on each, moves
      focus to a focusable error summary listing links to each invalid field, correcting the
      fields and resubmitting produces the same generated GitHub issue body format as today, and
      a test whose assertions reference another feature renders its "references" text instead of
      crashing.
      Test: `tests/e2e/run-test.spec.ts` (include a case using
      `tech/aria/aria-owns-multiple` or an equivalent references-bearing test).
- [ ] T070 [P] [US1] Create `client/pages/SupportPointPage.tsx`: port
      `test-case-support-point.pug`.
- [ ] T071 [US1] Create `client/pages/RunTestsPage.tsx`: port `run-tests.pug`, rendering real
      grouped `<ul>` lists per priority band (0–3 only, per spec.md's edge case) instead of the
      hand-balanced literal `</ul>`/`<ul>` text markers. Fixes corrected-defect #7 (today's
      literal tag text produces unbalanced HTML when a priority band is empty,
      `run-tests.pug:28,49,54`).
      Done when: HTML output is well-formed (balanced list tags) for every priority-band
      combination, including bands with zero entries.
      Test: HTML diff (Gate 5).
- [ ] T072 [P] [US1] Create `client/pages/UpdatesPage.tsx`: port `updates.pug`.
- [ ] T073 [P] [US1] Create `client/pages/CommandsPage.tsx`: port `commands.pug`, reusing
      `CommandTable`.
- [ ] T074 [US1] Create `client/pages/LearnAtPage.tsx`: port `learn-at.pug`, reusing
      `CommandTable`/`MarkdownContent`.
- [ ] T075 [P] [US1] Create `client/pages/StaticPage.tsx`: port `static-page.pug`, reusing
      `MarkdownContent` (covers `/faq`, `/contribute`, `/learn`, `/learn/vc_differences`).
- [ ] T076 [P] [US1] Create `client/pages/ErrorPage.tsx`: port `error.pug`, used by both
      `RouteErrorBoundary` (T053) and the SPA-fallback 404 case (T039/T044).

### App shell

- [ ] T077 [US1] Create `client/routes.tsx`: React Router route table mapping every path in
      contracts/api.md's "Known-route contract" to its page component (T062–T076), excluding
      `/tests/html/*` from the client router (that path must resolve to the static fixture mount,
      not a client route — route-ordering hazard from plan.md).
- [ ] T078 [US1] Create `client/main.tsx`: app entry point wiring TanStack Query, React Router,
      `Layout` (T050), and the global stylesheets (deferred fully to Phase 5, stubbed here as
      plain imports).
- [ ] T079 Delete `public/js/vendor/details-polyfill.js`, `public/js/vendor/formdata.min.js`, and
      `public/js/head.js` (IE11 polyfills — dropping IE11 support is intentional, spec.md
      Non-goals, and is what allows `<details>`/`<summary>` to stay native with no polyfill).
- [ ] T080 Delete `public/js/search.js`, `public/js/feature-test.js`, and `views/**` (all 18
      remaining Pug templates) once T047–T078 are verified against Gate 5.

**Checkpoint**: `npm run build && vite preview` renders every route; Gate 5 (HTML parity) and
Gate 8 (manual keyboard/screen-reader pass) from quickstart.md pass for the three
representative flows named there.

---

## Phase 5: CSS Modules

**Purpose**: US2 (component-scoped files) applied to styling. Highest risk of silent visual
drift, so it runs after Phase 4 (there is a working, HTML-parity-verified SPA to screenshot
against) and one file at a time.

- [ ] T081 [US1] Create `client/styles/tokens.css`: extract `:root` custom properties and the
      `prefers-color-scheme: dark` override block (`style.css:1-42`) verbatim. Stays global
      (imported once in `main.tsx`) — custom properties are global by nature.
      Done when: light/dark rendering is pixel-identical to `baseline/png/` at all four widths.
      Test: `tests/e2e/visual.spec.ts` (screenshot diff), run in the pinned container.
- [ ] T082 [P] [US1] Create `client/styles/global.css`: extract reset, base type, and link/focus
      defaults from the remainder of `style.css`. Stays global.
      Done when: focus indicators remain visible with no loss of contrast versus
      `baseline/png/`.
      Test: `tests/e2e/visual.spec.ts`.
- [ ] T083 [P] [US1] Create `client/styles/utilities.css`: extract `.visually-hidden`
      (`style.css:431-440`) and `.skip-nav` (`style.css:294-314`). Stays global.
      Done when: the skip link's reveal-on-focus behavior and every live region's visual hiding
      are pixel-identical to `baseline/png/`.
      Test: `tests/e2e/visual.spec.ts` + `tests/e2e/navigation.spec.ts`.
- [ ] T084 [US1] Create `client/styles/support.css`: extract the `.y/.ye`, `.n/.no`, `.p/.pa`,
      `.k/.kn`, `.u/.un` support-status color classes. Stays global and **unhashed** — the build
      (T025/`support-string.ts`) emits these exact class name strings into `support_string.class`,
      and CSS-modules hashing would silently break every support cell's styling.
      Done when: every support-status cell in every support matrix renders the same background
      color it does in `baseline/png/`.
      Test: `tests/e2e/visual.spec.ts`.
- [ ] T085 [US1] Extract per-component `*.module.css` files for the layout components (T047–T053)
      from the remainder of `style.css`, one component at a time, re-running
      `tests/e2e/visual.spec.ts` after each extraction rather than batching.
      Done when: each extraction leaves the visual diff clean before the next one starts.
      Test: `tests/e2e/visual.spec.ts`, run after every single file.
- [ ] T086 [US1] Extract per-component `*.module.css` files for the data/table components
      (T054–T060), preserving the `min-width: 1441px` content/sidebar CSS Grid breakpoint from
      `style.css:216-223` exactly.
      Done when: the grid layout engages at exactly 1441px, not before or after, matching
      `baseline/png/`'s 1441px capture.
      Test: `tests/e2e/visual.spec.ts` at the 1441px breakpoint specifically.
- [ ] T087 [US1] Extract per-component `*.module.css` files for the run-test feature
      (T061, T069) and remaining pages (T062–T076), one file at a time with a visual diff after
      each.
- [ ] T088 Delete `public/stylesheets/style.css` once T081–T087 are fully extracted and verified.

**Checkpoint**: Gate 6 (visual parity, all four widths, pinned container) passes clean.

---

## Phase 6: Tests

**Purpose**: US3 (automated accessibility regression detection) and the verification backbone for
US1/US2 across every prior phase. Some unit tests (T015) were already written in Phase 1 because
they gate a Phase 1 decision; the rest land here.

- [ ] T089 [P] [US2] Write `tests/unit/schema.test.ts`: port all four Ajv suites from `test.js`
      to Vitest (mocha 10.8.2's bundled yargs crashes under Node 26's ESM handling — `npm test`
      does not run at all today on the newest supported runtime, FR-011/SC-007), now scanning
      `build/tests/**` recursively so nested built tests are actually validated (fixing the gap
      documented in data-model.md's Validation rules).
- [ ] T090 [P] [US2] Write `tests/unit/sp-md-to-obj.test.ts`: port the one existing unit test
      from `test.js:141-214`.
- [ ] T091 [P] [US2] Write `tests/unit/support-string.test.ts` for `src/build/support-string.ts`
      (T025) — previously 0% covered.
- [ ] T092 [P] [US2] Write `tests/unit/bubble-support.test.ts` for `src/build/bubble-support.ts`
      (T023) — the core grading algorithm, previously 0% covered.
- [ ] T093 [P] [US2] Write `tests/unit/negative-support.test.ts` for
      `src/build/negative-support.ts` (T024).
- [ ] T094 [P] [US2] Write `tests/unit/priority.test.ts` for `src/build/test-case/priority.ts`
      (T026), using a pinned clock (T019) to test each priority band deterministically.
- [ ] T095 [P] [US2] Write `tests/unit/test-id-helper.test.ts` for `src/lib/test-id-helper.ts`'s
      (T030) lookup table, covering every `(virtual_location, focus_location, after)` combination
      the original if-ladder handled.
- [ ] T096 [P] [US2] Write `tests/unit/build-issue-body.test.ts` for
      `client/features/run-test/buildIssueBody.ts` (T069).
- [ ] T097 [P] [US1] Write `tests/api/routes.test.ts` (supertest): every `/api/*` endpoint from
      contracts/api.md returns its documented shape; path-traversal attempts on
      `:techId`/`:featureId`/`:testId` 404.
- [ ] T098 [P] [US1] Write `tests/api/public-urls.test.ts`: `/ATBrowsers.json`,
      `/latest_versions.json`, `/features.json`, `/tech.json`, `/tests/html/**.html` all still
      200 (FR-012).
- [ ] T099 [P] [US1] Write `tests/api/status-codes.test.ts`: known routes (T039) 200, unknown
      routes 404 (FR-009).
- [ ] T100 [US1] Write `tests/e2e/routes.spec.ts`: every route in the Phase 0 branch-driven
      inventory (T003) renders without error against the built (`vite build` + `vite preview`)
      bundle.
- [ ] T101 [US3] Write `tests/e2e/a11y.spec.ts`: `@axe-core/playwright` over the same route
      inventory as T100, gated against `baseline/axe/` — failing only on violations **not**
      present in the Phase 0 baseline for that route, reporting pre-existing ones as warnings
      (axe catches roughly a third of WCAG issues and is blind to `headers=` wiring, live-region
      timing, and focus order — this is a regression tripwire, not the full accessibility proof;
      Gate 5's HTML diff and Gate 8's manual pass are what actually verify those). Fix every
      non-best-practice violation the migration introduces; re-run until clean.
- [ ] T102 [US1] Write `tests/e2e/search.spec.ts`: filtering behavior, live-region announcement
      text and timing, focus movement to the results heading (T061).
- [ ] T103 [US1] Write `tests/e2e/run-test.spec.ts`: combination selection, validation error
      states, generated issue body content (T069).
- [ ] T104 [US1] Write `tests/e2e/navigation.spec.ts`: route-change title/canonical update, focus
      landing on the new `h1`, the screen-reader announcement (T051), and the loading-indicator
      delay behavior (T052).
- [ ] T105 [US1] Write `tests/e2e/static-fixtures.spec.ts`: `/tests/html/*` resolves to the
      static fixture mount, not the SPA's `/tests/:testId` route (the route-ordering hazard from
      T077).
- [ ] T106 [US1] Write `tests/e2e/visual.spec.ts`: screenshot diff against `baseline/png/` at
      1920/1441/1280/320px, run inside the pinned Playwright container (T002).
- [ ] T107 Delete `test.js` once T089/T090 are verified passing and superseding it.
- [ ] T108 [US2] Update `.github/workflows/node.js.yml`: add Node 24 to the test matrix, add
      `npm run lint` and `npm run typecheck` steps, install Playwright browsers (or use the
      pinned container), and upload axe + screenshot-diff artifacts on failure.

**Checkpoint**: Gates 1–9 from quickstart.md all pass. This is the last phase before
documentation/packaging cleanup.

---

## Phase 7: Documentation and Packaging

**Purpose**: Prevents the repository from describing software that no longer exists. No user
story depends on this directly, but leaving it undone means Gate 11 (quickstart.md) fails.

- [ ] T109 [P] Update `.specify/memory/constitution.md`: Principle I's reference to `test.js` →
      the Vitest suite; Principle V's and VI's references to `build.js`/`src/feature-helper.js`/
      `src/test-id-helper.js` → `src/build/`, `src/lib/`; "Accessibility of the site itself"'s
      references to `views/`, `routes/`, `public/` → `client/`, `server/`. **Principle V's
      substance — generated fields are computed, never hand-edited — must survive unchanged**;
      only the file paths it cites are updated.
- [ ] T110 [P] Update `documentation/architecture.md`: rewrite the build-pipeline description for
      `src/build/` and the `build/api/*` payload layer (T037).
- [ ] T111 [P] Update `CONTRIBUTING.md`: it is both the contributor guide and a page served at
      `/contribute` (via `MarkdownContent`, T060/T041) — update the described workflow and
      re-verify it renders correctly through `/api/content/contribute`.
- [ ] T112 [P] Update `readme.md`: the "Structure" section currently says "built on express js"
      with Pug templates; update it, and update the publishing/`sync-support-point` workflow
      steps for the ported `scripts/sync-support-point.ts` (T032).
- [ ] T113 [P] Rewrite `.npmignore` as an allow-list matching `package.json`'s
      `files: ["build/*"]` — today it excludes `public/ routes/ scripts/ src/ views/` by name,
      which would let `server/`, `client/`, `tests/`, `tools/`, `dist/`, and `baseline/` all leak
      into the published package after the rename.
- [ ] T114 [P] Confirm `package.json`'s `files: ["build/*"]` still describes the intended package
      contents now that `build/api/**` is additive; note the addition in `changelog.md`.
- [ ] T115 [P] Update `.github/workflows/axe-linter.yml`: bump `actions/checkout@v3` → `@v4` to
      match `node.js.yml`; confirm the linter still targets meaningful files now that markup
      lives in `.tsx` rather than `.pug`.

**Checkpoint**: Gate 11 (every path named in the four updated docs actually exists) passes.

---

## Final Phase: Verification Gates

**Purpose**: Run the full twelve-gate sequence from quickstart.md against the integrated result
before opening the single PR (the user's chosen delivery approach).

- [ ] T116 Run Gate 1 (build parity): `BUILD_NOW`-pinned old-JS build vs. new-TS build,
      `diff -r`, must be empty for every artifact in `build/` **except** `priority` fields in
      `support_points.json` and `build/tests/**.json` (corrected-defect #10, T026) — diff those
      separately and confirm every change is an escalation (never a de-escalation).
- [ ] T117 Run Gate 2 (schema): `npm test` green, including previously-unvalidated nested test
      directories.
- [ ] T118 Run Gate 3 (API + payload size): `npm run test:api`; measure and report `/api/home`
      gzipped size; if over ~500KB, split into a keyword index + lazy per-feature matrices before
      considering this gate passed.
- [ ] T119 Run Gate 4 (status codes): known routes 200, unknown routes 404,
      `/tests/html/*` resolves to fixtures.
- [ ] T119a Run Gate 3a (single-process operational contract, SC-006): `npm start` in the
      background, confirm both `http://localhost:3000/` (the SPA shell) and
      `http://localhost:3000/api/home` respond from the one process it started, then stop it.
      This is the dedicated check for FR-010/SC-006 — T044/T045 implement it but nothing else in
      this gate sequence asserts it directly.
- [ ] T120 Run Gate 5 (HTML parity): diff rendered SPA HTML vs. `baseline/html/`, browser clock
      pinned to `BUILD_NOW`; review every diff — only accepted deltas are the loading region, the
      route announcer, and the eleven corrected defects.
- [ ] T121 Run Gate 6 (visual parity): screenshot diff vs. `baseline/png/`, four widths, pinned
      container.
- [ ] T122 Run Gate 7 (axe): zero violations absent from `baseline/axe/`.
- [ ] T123 Run Gate 8 (manual keyboard + screen-reader pass): `/`, a test-case page, and its
      run-test form — tab order, skip link, search live regions, route-change announcement and
      focus, `<details>` operability. No automated substitute — do not skip.
- [ ] T124 Run Gate 9 (file size): confirm no `.ts`/`.tsx`/`.css` file under `server/`, `client/`,
      `src/`, or `tools/` exceeds 600 lines.
- [ ] T125 Run Gate 10 (lint + types): `npm run lint && npm run typecheck` clean.
- [ ] T126 Run Gate 11 (docs): every path named in the Phase 7 docs exists.
- [ ] T127 Run Gate 12 (package): `npm pack --dry-run` contains `build/*` and nothing else.
- [ ] T128 Open the single PR from `modernize` (per-phase commits already in place from
      T006/T018/T046/T080/T088/T108/T115), referencing this tasks.md and quickstart.md.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0**: No dependencies — start immediately.
- **Phase 1**: Depends on Phase 0 only for T015 (needs `build/` to exist for real dates); all
  other Phase 1 tasks are independent of Phase 0.
- **Phase 2**: Depends on Phase 1 (types, toolchain).
- **Phase 3**: Depends on Phase 2 (serves its output).
- **Phase 4**: Depends on Phase 3 (fetches its API).
- **Phase 5**: Depends on Phase 4 (needs working, HTML-parity-verified components to screenshot).
- **Phase 6**: Interleaved — T015 lands in Phase 1; T089–T096 (unit) can start as soon as their
  Phase 2 subject exists; T097–T099 (API) as soon as Phase 3 lands; T100–T106 (e2e) need Phase 4
  (and T106 needs Phase 5). Listed together in Phase 6 for narrative clarity, not as a strict
  "wait for everything" gate.
- **Phase 7**: Can start once the corresponding phase's paths are final (e.g., T109 once Phase 2's
  `src/build/` layout is settled) — not blocked on Phase 6.
- **Final Phase**: Depends on all of Phases 0–7.

### User Story Dependencies

- **US1** (site visitor sees no change): Threaded through Phases 3–5 and their tests
  (T037–T088, T097–T106) — this is the majority of the work, because "no change" must be proven
  at the API, component, and pixel level.
- **US2** (maintainable codebase): Threaded through Phases 1–2 and the unit tests (T007–T036,
  T089–T096) — independently verifiable via Gate 1 (build parity) and Gate 9 (file size) without
  needing US1's UI work to exist yet.
- **US3** (automated a11y regression detection): Concentrated in T101, but depends on US1's
  components (Phase 4) existing to have something to scan — cannot be delivered before US1.

### Parallel Opportunities

- All `[P]`-marked tasks within a phase touch different files and can run in parallel once that
  phase's non-`[P]` prerequisites land.
- Phase 1's T007–T012 (config files) are fully parallel.
- Phase 2's T030–T034 (helper/script ports) are parallel to each other and to T022–T027 (the
  main build-function ports), since they touch different files.
- Phase 4's page tasks (T063, T066, T070, T072, T073, T075, T076) are parallel once the shared
  components (T054–T061) they depend on exist.
- Phase 6's unit tests (T089–T096) are fully parallel to each other.

---

## Implementation Strategy

### Sequential by necessity, not preference

Unlike a typical multi-feature product where user stories ship independently, this migration's
phases have real technical dependencies (SPA needs API, API needs typed build). The nearest
equivalent to "MVP first": complete Phases 0–3 and confirm Gates 1–4 pass — at that point the data
layer and API are proven correct and typed (US2's core promise) even though no UI has been
rewritten yet. Phases 4–5 then deliver US1 and the remainder of US3.

### Delivery

Per the user's explicit choice (plan.md Summary): one integrated PR at the end, with one commit
per phase (T006, T018, T046, T080, T088, T108, T115 mark natural commit boundaries), so the
single PR remains reviewable phase-by-phase even though it lands as one merge.
