# Phase 0 Research: Modernize to TypeScript Backend + React Frontend

No `[NEEDS CLARIFICATION]` markers remain in plan.md's Technical Context — every open question
that would normally drive this research phase was already resolved with the user via direct
questions before spec.md and plan.md were written (see spec.md's requirements checklist notes).
This document records those decisions in the Decision/Rationale/Alternatives format spec-kit
expects, rather than performing new research, per the transcription scope of this planning pass.

## Decision: Architecture — Vite SPA + Express JSON API

**Rationale**: Reaffirmed after quantifying its costs (payload sizes, loss of server-rendered
HTML, need for a client-side router, honest-404 handling). Chosen over the alternatives because
it cleanly separates "TypeScript backend" from "React frontend" as two independently testable
deliverables, matches the explicit ask, and — with the payload-splitting work in Phase 3 of the
source plan — keeps response sizes reasonable despite the site's large denormalized datasets.

**Alternatives considered**:
- *Next.js App Router (RSC, static generation)*: Rejected — changes the deploy model and the
  `npm start`/`npm publish` contract (FR-010/SC-006), which the user confirmed must stay
  unchanged.
- *Express + React SSR (`renderToString`)*: Would have preserved server-rendered HTML (avoiding
  the SEO/loading-state costs entirely) at the cost of more server-side rendering complexity.
  Explicitly not chosen when re-offered after the SPA costs were quantified — the user reaffirmed
  the SPA.

## Decision: Data-build port — TypeScript, same output shape, split by existing responsibility

**Rationale**: The five exported functions in `src/feature-helper.js` already have clean
boundaries (initialize feature, bubble support, negative-support check, initialize test case,
generate support string). Splitting along those boundaries satisfies the 600-line cap without
redesigning behavior, and the existing Ajv schema tests plus a new byte-identical output diff
(Gate 1) prove the port didn't change results.

**Alternatives considered**:
- *Redesign the data pipeline* (e.g., compute on demand instead of precomputing): Rejected —
  would invalidate the existing schema tests as a safety net and is a strictly larger, riskier
  change than the ask requires.

## Decision: Determinism — injectable `BUILD_NOW` clock

**Rationale**: `feature-helper.js:3` (`let now = new moment()`) and the priority-band logic at
`:1180-1223` make build output depend on wall-clock time. A byte-identical parity diff (Gate 1) is
impossible against a non-deterministic source. Threading `now` through as a parameter (defaulting
to `Date.now()`, overridable via `BUILD_NOW`) makes both the old-JS and new-TS builds
reproducible against the same instant.

**Alternatives considered**: None — this is a prerequisite fix to the current JS, not a design
choice with real alternatives; without it there is no way to verify Gate 1 at all.

## Decision: Styling — CSS Modules + four global sheets

**Rationale**: Component-scoped styles for everything new, with `tokens.css` (custom properties +
dark-mode override), `global.css` (reset/base), `utilities.css` (`.visually-hidden`, `.skip-nav`),
and `support.css` (the `y`/`n`/`p`/`u` status classes) kept global because the build emits those
exact class names into `support_string.class`, and hashing them would break that contract.

**Alternatives considered**:
- *Keep `style.css` as one global file*: Rejected by the user in favor of CSS modules, accepting
  the higher regression risk in exchange for per-component file scoping consistent with the
  600-line/single-responsibility goal. Mitigated by extracting one file at a time with a
  screenshot diff after each (source plan, Phase 5).

## Decision: Date formatting — verify before swapping `moment` → `dayjs`

**Rationale**: `moment`'s relative-time strings ("2 years ago") are user-visible on several
templates. `dayjs` is the natural lighter-weight replacement but its `fromNow()` boundary rounding
is not guaranteed identical. Treated as a test (`date-parity.test.ts`, Phase 6), not an
assumption — keep `moment` if any divergence is found across the dates actually present in
`build/`.

**Alternatives considered**: *Assume parity and swap unconditionally* — rejected as the assumption
was already flagged as unverified during plan review; a migration promising "no product change"
cannot afford an unverified swap of user-visible text.

## Decision: Testing stack — Vitest + Playwright + `@axe-core/playwright`

**Rationale**: Mocha 10's bundled yargs crashes under Node 26's ESM handling, so `npm test`
already fails to run locally (FR-011/SC-007 exist because of this). Vitest is a drop-in for the
existing Ajv-based schema suite. Playwright + axe-core is the only strategy available (source
plan Phase 6, "Strategy" rung 3 in `testing.md`) since the project has no existing accessibility
test suite to extend.

**Alternatives considered**: *Keep mocha, patch around the yargs crash*: Rejected — treats a
symptom of an unmaintained toolchain rather than replacing it, and doesn't add the API/e2e/a11y
coverage the migration requires anyway.

## Decision: Delivery — single integrated PR, per-phase commits, gated

**Rationale**: User's explicit choice after being offered phase-per-PR and coexist-behind-a-flag
alternatives. Per-phase commits preserve some reviewability inside the single PR; the twelve
verification gates (source plan, Verification section) are the actual review substrate given the
PR itself will be large.

**Alternatives considered**: *Phase-per-PR onto `modernize`* and *coexist behind a flag* — both
explicitly declined by the user in favor of speed of delivery.
