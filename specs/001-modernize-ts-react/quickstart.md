# Quickstart: Validating the Modernization

This is a runnable validation guide, not a build log. It proves the migration satisfies spec.md's
Success Criteria using the twelve-gate sequence defined in the source plan
(`/Users/michaelfairchild/.claude/plans/i-want-to-modernize-peppy-sonnet.md`, "Verification
gates"). Run gates in order — each is a prerequisite for the next being meaningful.

## Prerequisites

```bash
npm ci
docker pull mcr.microsoft.com/playwright:<version pinned in package.json>
```

The Playwright container is required for Gates 5–8 (visual/HTML/axe/manual parity) — screenshots
and rendered HTML captured outside it are not comparable (research.md, environment-parity
decision).

## Gate 1 — Build parity (byte-identical output)

```bash
BUILD_NOW=2026-07-30T00:00:00Z node ./build.js            # old JS build → build-js/
BUILD_NOW=2026-07-30T00:00:00Z npm run build -- --out build-ts   # new TS build → build-ts/
diff -r build-js/ build-ts/
```

**Expected outcome**: empty diff, **except** the `priority` field inside `support_points.json`
and every `build/tests/**.json`'s `results[at].browsers[browser].priority`. Corrected defect #10
(spec.md) fixes the priority-escalation logic to read the result's actual recorded date instead
of an always-undefined field, which changes computed priority values for results old enough to
cross the 6-day/12-day escalation thresholds. This is the one **expected, documented** exception
to byte-identical parity — diff everything else with zero tolerance; diff `priority` fields
separately and confirm every change is an escalation (buckets 0/2/4/5/6/7 moving to 1/3), never
the reverse. Any other field difference — stop and fix before proceeding (this is Constitution
Principle V's enforcement point).

## Gate 2 — Schema tests

```bash
npm test
```

**Expected outcome**: all Ajv schema suites pass, now including built tests in subdirectories
that the old non-recursive `readdirSync` silently skipped (data-model.md, Validation rules).

## Gate 3 — API + payload size

```bash
npm run test:api
curl -s -H 'Accept-Encoding: gzip' http://localhost:3000/api/home | gzip -c | wc -c
```

**Expected outcome**: every `/api/*` endpoint in `contracts/api.md` returns its documented shape;
path-traversal attempts on `:techId`/`:featureId`/`:testId` 404; the five preserved public URLs
(contracts/api.md) 200. `/api/home` gzipped is reported — if over ~500 KB, the payload-split
follow-up (plan.md, Performance Goals) is required before Gate 4 is meaningful.

## Gate 4 — Status codes

```bash
npm run test:api -- status-codes
```

**Expected outcome**: every known route (contracts/api.md, "Known-route contract") returns 200;
`/garbage`, invalid `:testId`, and `/learn/at/not-an-at` return 404; `/tests/html/*` resolves to
the static fixture, not the SPA route.

## Gate 5 — HTML parity

**Known, accepted diff**: every `<a>` rendered via React Router's `<Link>` carries a
`data-discover="true"` attribute the original markup never had — an internal route-discovery
marker with zero visual, accessibility-tree, or keyboard effect (confirmed: not read by any AT,
not styled, not part of any test assertion). Do not chase this to zero; it is intrinsic to the
router.

Always compare via a browser's DOM serialization (`page.content()`, as `capture.ts` does), never
raw HTTP response bytes (`curl`). Browsers don't re-encode characters like `"` in text nodes that
don't require escaping there, so a raw-byte diff produces false positives (e.g., a markdown
renderer emitting `&quot;` vs a literal `"` in prose text) that disappear once both sides are
parsed and reserialized identically. Confirmed while upgrading `markdown-it`/`markdown-it-anchor`
in Phase 1 — a `curl`-based check showed spurious diffs that a `page.content()`-based check did
not.


```bash
docker compose run baseline    # captures baseline/html, baseline/png, baseline/axe (Phase 0, once)
docker compose run visual -- --compare-html
```

**Expected outcome**: rendered SPA HTML matches `baseline/html/` for every route in the
branch-driven inventory (source plan, Phase 0), with the browser clock pinned to the same
`BUILD_NOW` used in Gate 1. The only accepted diffs are the loading region, the route announcer,
and the eleven corrected defects listed in spec.md (note the Gate 1 exception above for defect
#10's effect on `priority` fields specifically).

## Gate 6 — Visual parity

```bash
docker compose run visual
```

**Expected outcome**: screenshot diff clean at 1920/1441/1280/320px against `baseline/png/`.

## Gate 7 — Accessibility (axe)

```bash
npx playwright test tests/e2e/a11y.spec.ts
```

**Expected outcome**: zero violations not already present in `baseline/axe/`. Per plan.md's
Accessibility Design, this is a regression tripwire, not the full a11y proof — Gate 5 (HTML
parity) and Gate 8 (manual pass) are what actually verify `headers=` wiring, focus order, and live
region timing, none of which axe can see.

## Gate 8 — Manual keyboard + screen reader pass

On `/`, `/tests/tech__html__buttons`, and `/tests/tech__html__buttons/run`: Tab through in order;
confirm the skip link works; confirm search live regions announce; confirm a route change
announces and lands focus on the `h1`; confirm `<details>` disclosures still operate. No
automated substitute exists for this gate — do not skip it.

## Gate 9 — File size

```bash
find server client src tools -name '*.ts*' -o -name '*.css' | xargs wc -l | awk '$1 > 600'
```

**Expected outcome**: no output (FR-004/SC-004).

## Gate 10 — Lint + types

```bash
npm run lint && npm run typecheck
```

## Gate 11 — Docs

Confirm every path named in `.specify/memory/constitution.md`, `documentation/architecture.md`,
`CONTRIBUTING.md`, and `readme.md` exists in the repository (source plan, Phase 7).

## Gate 12 — Package contents

```bash
npm pack --dry-run
```

**Expected outcome**: contains `build/*` and nothing else (FR-014).

## Done

All twelve gates green ⇒ open the single PR (per the user's chosen delivery approach, plan.md
Summary) with one commit per phase already on `modernize`.
