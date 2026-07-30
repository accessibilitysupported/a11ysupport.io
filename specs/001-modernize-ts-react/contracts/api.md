# API Contract: `/api/*` (Express JSON API)

This is the interface the React SPA (and any external consumer replacing today's direct
`require()`/static-file access) depends on. It mirrors today's Express routes 1:1 — see plan.md's
Project Structure (`server/routes/*.ts`) and the source plan's Phase 3 for the module map that
implements it.

## Content routes (from `server/routes/content.ts`, ported from `routes/index.js`)

| Method | Path | Response | Notes |
|---|---|---|---|
| GET | `/api/home` | `HomePayload` (see data-model.md) | Replaces `index.pug`'s locals |
| GET | `/api/at-browsers` | `ATBrowsers.json` verbatim | Also still served at `/ATBrowsers.json` (preserved public URL, FR-012) |
| GET | `/api/updates` | `UpdatesPayload` | |
| GET | `/api/commands` | `CommandsPayload` | |
| GET | `/api/run-tests` | `RunTestsPayload` (priority 0–3 only) | |
| GET | `/api/content/:page` | `{ title: string, html: string }` | `:page` ∈ `faq \| contribute \| learn \| vc_differences`; 404 for any other value |
| GET | `/api/learn/at/:id` | `{ title: string, html: string, atId: string, commands: … }` | `:id` MUST be validated against the existing 14-entry allow-list (`routes/index.js:95`); 404 otherwise |

## Technology routes (from `server/routes/tech.ts`, ported from `routes/tech.js`)

| Method | Path | Response | Notes |
|---|---|---|---|
| GET | `/api/tech` | `TechIndexPayload` | |
| GET | `/api/tech/:techId` | `TechPayload` | 404 if `techId` not a key of `tech.json` |
| GET | `/api/tech/:techId/:featureId` | Full feature object (`build/tech/<techId>/<featureId>.json`) + `related_features[]` | `:techId`/`:featureId` MUST be passed through `sanitize-filename` before path construction (path-traversal guard, ported from `routes/tech.js:46`); 404 if the file does not exist |

## Test routes (from `server/routes/tests.ts`, ported from `routes/tests.js`)

| Method | Path | Response | Notes |
|---|---|---|---|
| GET | `/api/tests` | `TestsIndexPayload` | 404 if the built tests list is empty (ported from `routes/tests.js:16-20`) |
| GET | `/api/tests/:testId` | Full test object + `features[]` (from `test_map.json`) + `testHTML` (fixture source, if local and short) | `:testId` MUST be decoded via `undoMakeSafe` (`__` → `/`) before lookup, matching today's URL-safety scheme; 404 if not in `test_map.json` or the built JSON is missing |
| GET | `/api/tests/:testId/run` | Same as above + `devTest` (authored, pre-build test JSON) | Needed for the run-test form to read `commands[at][browser]` before the build's bubbling; 404 under the same conditions as above |
| GET | `/api/tests/:testId/:featureId/:featureAssertionId/:atId/:browserId` | The single assertion + its result for that AT/browser | 404 if the assertion, the AT id, or the browser id is not found for that test (ported from `routes/tests.js:155-177`) |

## Known-route / status-code contract (new — see plan.md Constraints, spec.md FR-009)

The SPA fallback MUST NOT convert every unmatched path into a 200. `server/lib/known-routes.ts`
derives, at boot, the full set of paths that resolve to real content (static pages, every
`techId`, every `techId/featureId` pair that exists in `build/`, every `testId`, every valid
`atId`). Any request path that does not match this table — including `/api/*` paths that 404 for
the reasons above — MUST receive a 404 status. The SPA fallback still returns `index.html` as the
response *body* either way (so the client router can render the same `ErrorPage`), but the HTTP
status code must be honest: 200 for known routes, 404 for everything else.

## Preserved public URLs (FR-012, unchanged)

These are NOT part of the new `/api` namespace — they are existing static-file URLs that external
tooling and `public/js/feature-test.js` (ported to `client/`) already depend on, and MUST keep
resolving exactly where they are today:

| URL | Source |
|---|---|
| `/ATBrowsers.json` | `data/ATBrowsers.json`, via the `data/` static mount |
| `/latest_versions.json` | `data/latest_versions.json`, via the `data/` static mount |
| `/tests/html/*.html` | `data/tests/html/*.html`, via the `data/` static mount — MUST resolve to the fixture even though `/tests/:testId` is also a client-side route; route-ordering test required (source plan, Phase 3 "Route-ordering hazard") |
| `/features.json`, `/tech.json`, `/tests.json`, `/test_map.json`, `/support_points.json`, `/command_matrix.json`, `/recent_updates.json` | `build/*.json`, via the `build/` static mount — also published in the npm package (`files: ["build/*"]`) |

## Error shape

All 404s (both `/api/*` and the SPA fallback's status code) use Express's default `http-errors`
404 body server-side; the SPA's `RouteErrorBoundary` renders the equivalent of today's
`error.pug` (`role="alert"`, same heading structure) regardless of which specific `/api` call
failed.
