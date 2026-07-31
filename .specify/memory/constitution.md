# a11ysupport Constitution

## Core Principles

### I. Data integrity is the product
`a11ysupport.io` is a database of AT/browser support results before it is a website. Every
`data/tests/**/*.json` file MUST validate against `data/schema/dev-test.json`; every
`data/tech/**/*.json` file MUST validate against `data/schema/dev-feature.json`. `npm run build`
MUST run before `npm run test` — the test suite (`tests/unit/schema.test.ts`, Vitest) validates
the *generated* `build/` tree, not the authored `data/` tree. A change that passes `npm run test`
without a preceding `npm run build` has not actually been verified.

### II. Bookkeeping is not optional
A support-point change is incomplete until it also updates its own provenance. Every edit to
`commands[at][browser][…].output` or `.results[].result` MUST be paired with: a bumped
`versions[at].browsers[browser]` entry (`at_version`, `browser_version`, `os_version`, `date`),
and an appended `history` entry dated with the change's date. A PR that changes a result without
touching `versions` or `history` is under-specified, not just incomplete — reviewers cannot tell
what was tested.

### III. Second-person verification (NON-NEGOTIABLE)
No support point, test case, feature, or technology is accepted on one person's word.
Support-point findings MUST be verified by at least one other person, manually or by citing a
trustworthy third-party resource (`CONTRIBUTING.md`). New test cases, features, and technologies
MUST be approved by at least one other person before merge. A spec or plan MUST NOT declare a
support point, test case, or feature "accepted" or "done" on the basis of a single contributor's
findings — flag it as pending verification instead.

### IV. Expected values come from the standards, not from observed behavior
Expected role, accessible name, accessible description, states, and properties are derived from
the Accessibility API Mapping standards (Core-AAM, HTML-AAM, SVG-AAM, accname) — never backfilled
from what a particular AT happens to announce. Observed AT output is a *support point* to record
against the standard's expectation, not a redefinition of the expectation itself.

### V. Generated fields are never hand-edited
`src/build/` (the TypeScript data-build pipeline: `initialize-feature.ts`, `bubble-support.ts`,
`support-string.ts`, `test-case/*.ts`, orchestrated by `src/build/index.ts`) computes every
bubbled value: per-browser `y`/`n`/`p`, `core_support`, and `extended_support`, up through
command → assertion → browser → AT → test → feature. These fields MUST NOT be edited by hand in
`data/`, and MUST NOT be edited in `build/` either — `build/` is gitignored and gets regenerated.
If a bubbled result looks wrong, the fix is in the authored assertion/command data or in
`src/build/`, not in the output.

### VI. Respect existing code and data
Don't restructure an existing test, feature, or shared helper (`src/build/`, `src/lib/`) just
because it could be cleaner — other tests and the build pipeline depend on its current shape.
Issues found outside the current task's scope get noted (what, where, suggested fix) and confirmed
before changing, per the same rule this project's `building-accessible-ui` skill applies to UI
code.

## Accessibility of the site itself

`a11ysupport.io`'s own UI (the React SPA in `client/`, served by the Express API in `server/`) is
governed by the accessibility constitution and checklist in
`.github/skills/building-accessible-ui/SKILL.md` — that document is the source of truth; this
constitution does not restate it. When a spec, plan, or task touches `client/` or `server/`,
that skill's checklist applies in addition to the principles above.

## Development Workflow

- Standard sequence for any change: edit `data/` (or `src/`, `server/`, `client/`) → `npm run build`
  → `npm run test` → commit. CI (`.github/workflows/node.js.yml`) runs
  `npm ci && npm run lint && npm run typecheck && npm run build && npx vite build && npm run test
  && npm run test:e2e` on Node 20/22/24 for every PR to `master` (18.x dropped: `vite@8`/`rolldown`
  require `^20.19.0 || >=22.12.0`, `package.json`'s `engines.node`).
- The most common change is a single-file edit to one `data/tests/**/*.json` (a support-point
  update). Treat larger changes — a new test case, a new feature, a new technology — as requiring
  the approval path in `CONTRIBUTING.md`, not just a passing build.

## Governance

This constitution supersedes ad-hoc practice for spec-driven work in this repo. It codifies
`CONTRIBUTING.md` and `documentation/architecture.md` for agentic consumption — when those
documents are updated, this file MUST be amended to match in the same change. Specs and plans
produced via `/speckit-specify` / `/speckit-plan` / `/speckit-tasks` MUST be checked against
Principles I–VI before being marked ready for implementation.

**Version**: 1.0.3 | **Ratified**: 2026-07-30 | **Last Amended**: 2026-07-31

_1.0.3: removed the `axe-linter` CI reference — `.github/workflows/axe-linter.yml` was deleted
(the third-party `dequelabs/axe-linter-action` was failing on an apparent API-key/subscription
issue unrelated to this repo's code, and there was no active subscription to fix it against).
Site-markup accessibility regressions are still covered by `tests/e2e/a11y.spec.ts` (axe-core,
baseline-gated). No principle's substance changed._

_1.0.2: dropped Node 18 from the supported/CI version set — `vite@8`/`rolldown` require
`^20.19.0 || >=22.12.0` (discovered when CI's `npx vite build` crashed on Node 18.20.8 with a
`node:util` SyntaxError) — and added the missing `npx vite build` step CI needs before
`npm run test`, since `tests/api/*.test.ts` calls `createApp()` directly and its SPA fallback
503s until `dist/` exists. No principle's substance changed._

_1.0.1: updated file paths for the TypeScript/React migration
(specs/001-modernize-ts-react) — `build.js`/`src/feature-helper.js` → `src/build/`,
`src/test-id-helper.js` → `src/lib/`, `views/`/`routes/`/`public/` → `client/`/`server/`,
`test.js` → the Vitest suite. No principle's substance changed._
