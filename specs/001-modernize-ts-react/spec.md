# Feature Specification: Modernize to TypeScript Backend + React Frontend

**Feature Branch**: `modernize`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Modernize a11ysupport backend to TypeScript and frontend to React,
with Playwright + axe-core accessibility testing on every template, files scoped under 600 lines
each. The UI (layout, content, accessibility semantics/functionality) must not change from the
user's perspective." Full technical context and decisions: `/Users/michaelfairchild/.claude/plans/i-want-to-modernize-peppy-sonnet.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Site visitor sees no change (Priority: P1)

A person researching AT/browser support — the site's actual audience — visits any page on
a11ysupport.io before and after the migration. They see the same content, the same layout, the
same navigation, and the same behavior (search, filtering, disclosure widgets, the test-result
submission form). Nothing about their experience signals that the underlying implementation
changed.

**Why this priority**: This is the constraint the whole migration is bound by. If this story
fails, the migration has broken the product regardless of how clean the new code is.

**Independent Test**: For a representative set of routes (home, a technology page, a feature
page, a test-case page, the run-test form, the all-tests index, and the static content pages),
capture the rendered output and the accessibility tree before the migration and compare against
the same routes after. The only permitted differences are the ones explicitly listed in this
spec's Assumptions section (a brief loading state, a documented set of pre-existing bug fixes).

**Acceptance Scenarios**:

1. **Given** a page that rendered specific content, headings, tables, and links before the
   migration, **When** the same page is loaded after the migration, **Then** the same content,
   headings, tables, and links are present in the same reading order.
2. **Given** the home page's feature search, **When** a visitor types a query, **Then** the
   result list filters exactly as it did before, and the same result-count messaging appears.
3. **Given** the test-run submission form, **When** a visitor fills it out and submits, **Then**
   the same validation errors, the same generated GitHub issue content, and the same confirmation
   output appear as before.
4. **Given** a screen reader or keyboard-only visitor, **When** they navigate any page, **Then**
   every landmark, heading, live region, table header association, and keyboard interaction
   behaves exactly as it did before the migration (see Accessibility Requirements).
5. **Given** a URL that returned "page not found" before the migration, **When** that URL is
   requested after, **Then** it still reports "page not found" rather than silently succeeding.

---

### User Story 2 - Contributor works in a maintainable codebase (Priority: P2)

A project maintainer or contributor opens the codebase to fix a bug, add a technology, or update
a test. They find typed code with clear boundaries between the data-processing layer, the API,
and the UI; no single file is large enough to require scrolling through unrelated concerns to
understand one piece of behavior; and an automated test suite that would have caught the defects
that shipped silently in the old codebase.

**Why this priority**: The stated purpose of the migration. It only matters once User Story 1 is
satisfied — a maintainable codebase that changed the product is not a successful migration.

**Independent Test**: Open any file in the new codebase and confirm it is under 600 lines and
concerned with a single responsibility. Run the automated test suite and confirm it exercises the
data-processing logic, the API, and every page template — none of which had test coverage before.

**Acceptance Scenarios**:

1. **Given** the new codebase, **When** any source file is measured, **Then** it is at most 600
   lines long.
2. **Given** the data-processing step that computes support results, **When** it is run against
   the existing authored data, **Then** it produces the same computed results as the current
   implementation (see Success Criteria).
3. **Given** a contributor runs the test suite, **When** it completes, **Then** it passes on the
   Node.js versions the project currently claims to support (it does not today).

---

### User Story 3 - Accessibility regressions are caught automatically (Priority: P3)

Because this site exists to document assistive-technology support, its own accessibility is
inspected with unusual scrutiny. A contributor makes a change to a page template. An automated
check runs against every page template and flags any newly introduced accessibility violation
before the change ships, distinguishing it from violations that were already present.

**Why this priority**: Valuable independently of the rest of the migration, but it depends on the
templates existing in their new form (User Stories 1 and 2), so it lands last.

**Independent Test**: Introduce a deliberate accessibility defect (e.g., remove a table header
association) into one template, run the automated check, and confirm it is flagged. Confirm a
known pre-existing issue does not cause an unrelated check to fail.

**Acceptance Scenarios**:

1. **Given** every page template in the site, **When** the automated accessibility check runs,
   **Then** every template is included — none are skipped.
2. **Given** a newly introduced accessibility violation, **When** the check runs, **Then** it is
   reported as a failure.
3. **Given** a violation that was already present before the migration, **When** the check runs,
   **Then** it is reported as a known/pre-existing item, not a new failure.

### Edge Cases

- A feature with no test data yet (`total_test_count === 0`) must still render its "help us
  contribute" messaging rather than an empty or broken section.
- A feature whose only recorded results are "not supposed to be exposed" (only-negative-support)
  must still show the explanatory footnote, not a misleading "supported" summary.
- A test case whose fixture HTML lives on an external site (not hosted by this project) must still
  link out correctly instead of trying to render the fixture inline.
- A test case whose fixture HTML is long must show a "too long to display" message instead of
  dumping the full source inline, exactly as today.
- A technology with zero features (e.g., SVG has just one) must render its page without error.
- A visitor requesting an AT/browser combination, feature, test, or technology identifier that
  does not exist must receive a "not found" response, not a blank or broken page.
- A visitor requesting a URL that matches no route at all (never existed) must also receive "not
  found."
- Results that are failing or partial and have not been re-verified in 9+ months must show the
  "may be out of date" caution, exactly as today.
- The run-test priority listing must only ever show priority bands 0–3, exactly as today (lower
  priorities are intentionally hidden to focus contributor effort).
- A visitor with analytics tracking enabled must be counted once per page they actually view, not
  once per browser session, when navigating between pages without a full reload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site's data-processing layer (which computes AT/browser support results from
  authored source data) MUST be implemented in TypeScript and MUST produce computed output
  identical to the current implementation for the same source data and the same point in time.
- **FR-002**: The site's user interface MUST be implemented in React.
- **FR-003**: Every page template that exists today MUST have an automated accessibility check
  that runs against it; the check MUST distinguish violations introduced by the migration from
  violations that already existed.
- **FR-004**: No source file in the new codebase MUST exceed 600 lines.
- **FR-005**: For every route the site serves today, the migrated site MUST render the same
  visible content, the same layout, and the same reading order, with the exceptions explicitly
  listed in this spec's Assumptions.
- **FR-006**: Every accessibility semantic present today (landmarks, heading structure, live
  regions, form labels and grouping, table header associations, keyboard operability, focus
  management, skip navigation) MUST be preserved with the same behavior, except for the
  documented bug fixes and additions listed in Assumptions.
- **FR-007**: The feature search on the home page MUST filter results and announce result counts
  to assistive technology exactly as it does today, including the "no results" and "results
  found" messaging.
- **FR-008**: The test-run submission flow MUST validate required fields, display errors the same
  way, and generate the same GitHub issue content as it does today.
- **FR-009**: URLs that identify a real technology, feature, test, or AT/browser combination MUST
  continue to resolve to that content; URLs that do not MUST continue to report "not found" rather
  than succeeding.
- **FR-010**: The site MUST continue to start with a single command and run as a single server
  process, matching today's operational contract.
- **FR-011**: The automated test suite MUST run successfully on the Node.js versions the project
  claims to support (currently broken on the newest supported runtime).
- **FR-012**: Public data endpoints that other tools or pages currently fetch directly (the
  AT/browser reference data, the latest-version reference data, and the full support-result
  datasets) MUST continue to be available at their current locations.
- **FR-013**: The eleven specific pre-existing defects identified during discovery (listed in
  Assumptions) MUST be fixed as part of the migration, since fixing them changes broken behavior
  to correct behavior rather than changing the product.
- **FR-014**: The published package's contents MUST continue to match its current scope (the
  generated data, not source code) after the codebase is reorganized.

### Key Entities

- **Technology**: A web standard (HTML, CSS, ARIA, SVG) that groups related features.
- **Feature**: A specific capability of a technology (an element, attribute, or property) with a
  description, expectations, and computed support summaries.
- **Assertion**: A specific expectation about how a feature should be exposed to assistive
  technology (role, name, state, etc.), scoped to a feature.
- **Test / Test Case**: A manual verification procedure covering one or more assertions, possibly
  across multiple features, with an associated fixture (HTML page) to test against.
- **Command / Result**: A single manual test step performed with a specific assistive
  technology and browser, producing a pass/fail/partial/unknown outcome plus supporting notes.
- **Support Point**: The provenance record for one command result — who tested it, with what
  versions, and when — used to compute the derived support summaries above it.
- **AT/Browser combination**: A pairing of an assistive technology (screen reader, voice control,
  or keyboard) with a browser, marked as "core" (frequently tested) or "extended."

## Accessibility Requirements *(mandatory — this feature renders and modifies UI)*

This is a site whose entire purpose is documenting assistive-technology support; its own
accessibility is the contract, not a checkbox. Every item below preserves specific behavior that
exists today, with automated tests as proof.

**Affected personas**: all seven — screen reader and voice-control users are the site's primary
subject matter and its primary audience; keyboard-only, low-vision, cognitive, deaf/hard of
hearing, motor, and situational users all interact with the same search, tables, forms, and
disclosure widgets covered below.

**Preserved verbatim from the current implementation:**

- **AR-001**: The page MUST expose exactly one `main` landmark, reachable via a "skip to main
  content" link that is the first focusable element on every page, and focus MUST land on that
  landmark when the skip link is activated.
- **AR-002**: Every data table presenting AT/browser support results MUST retain its caption,
  column/row group headers, and explicit header-to-cell associations, so that a screen reader
  announces the correct AT, browser, and expectation context for every cell — matching today's
  wiring exactly (no cell may lose its header association).
- **AR-003**: Wide tables MUST remain reachable by keyboard as independently scrollable regions.
- **AR-004**: Disclosure sections (e.g., "test and version details," "extended support") MUST
  remain operable as native expand/collapse widgets with no loss of keyboard or screen-reader
  support.
- **AR-005**: The feature search MUST maintain two separate live announcement regions — one for
  routine result-count updates, one for the "no results" case — using the same timing and wording
  as today, and MUST move focus to the results heading when a search is submitted.
- **AR-006**: The test-run submission form MUST keep every control's programmatic label, MUST
  group related controls so their shared context is exposed to assistive technology, MUST mark
  required fields both visually and programmatically, and MUST produce a focusable, itemized error
  summary (with links to each invalid field) when validation fails.
- **AR-007**: Every interactive element's accessible name MUST match its visible label text.
- **AR-008**: Visible focus indicators MUST be present on every focusable element, with no loss of
  visibility versus today.
- **AR-009**: Color MUST NOT be the only means of conveying a support-status result (pass, fail,
  partial, unknown) — the existing text labels alongside color MUST be retained.
- **AR-010**: The site MUST continue to respect the visitor's OS-level light/dark preference.

**New behavior required because content now loads after the initial page load, rather than
arriving complete (a genuine change in how the page becomes usable, called out here rather than
left implicit):**

- **AR-011**: When a visitor navigates to a new page, the page title and the browser's location
  reference MUST update, focus MUST move to that page's main heading, and a screen reader MUST be
  given an announcement that the page changed — since a full page reload (which provided this
  automatically before) no longer occurs.
- **AR-012**: If content takes longer than a brief moment to become available, a visible and
  screen-reader-announced loading indicator MUST appear; fast responses MUST NOT show a flash of
  this indicator.
- **AR-013**: If content fails to load, a clearly announced error state MUST appear in place of
  the missing content, with the same heading structure as today's error page.

**Corrected behavior (eleven specific defects present today, fixed as part of this migration
because a defect is not a product feature to preserve):**

1. The technology overview page must correctly display each feature's support-level summary
   (today it silently renders blank due to a data-shape mismatch).
2. The test-run page must correctly display the current support-level summary (same class of
   defect as #1).
3. The all-tests page's live announcement region must actually match what the search behavior
   looks for, so search result announcements are not silently dropped.
4. The test-run form's "hide all combinations" behavior must not reference a value that does not
   exist.
5. The read-only test-case detail page must not load a script that assumes it is the interactive
   run-test page and errors as a result.
6. The run-test instructions must not tell visitors to use an embedded test frame that does not
   exist in the product; the instructions are corrected to describe the actual flow (opening the
   test page directly) rather than adding a new embedded frame, since adding one would itself be
   a UI change.
7. The run-tests priority listing must produce well-formed list markup in every case, including
   when a priority band is empty (today it can produce mismatched list tags).
8. The home page's search result count MUST NOT be nested inside a heading element (today it is,
   which is invalid structure).
9. The home page's table headers for AT/browser sub-groupings MUST be structured correctly
   relative to the table's header section (today they are misplaced, which is invalid structure).
10. The run-tests priority escalation for stale results MUST use the result's actual recorded
   date. Today it reads a field that is never populated on any of the 24,080 recorded results,
   so every "this result is old, prioritize re-testing it" escalation silently never fires —
   discovered during migration, not part of the original catalogue of nine.
11. The run-test page MUST NOT crash for a test whose assertions reference another feature.
   Today it re-joins a value the data-processing layer has already joined into a plain string,
   throwing and returning a server error for every such test — discovered live during migration
   (confirmed reproducible on an existing test today) while capturing the pre-migration baseline.

**Non-goals / opt-outs**: Two known-existing issues are intentionally left unchanged because
fixing them would go beyond a faithful port: the scrollable-table keyboard regions do not have an
accessible region name (pre-existing, filed as a follow-up rather than fixed here), and one
"related features" link on the feature page points to the wrong section (pre-existing, same
treatment). Neither is listed in the corrected-defects set above because fixing them is a
judgment call about intent, not a mechanical port of existing behavior. Internet Explorer 11
support is dropped as part of this migration — it is unrelated to any persona above and the
product no longer needs it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For every route the site serves today, a side-by-side comparison of rendered
  content before and after migration shows zero unintended differences at four representative
  viewport widths (the same widths used by the responsive design today).
- **SC-002**: A manual keyboard-and-screen-reader walkthrough of the home page, a test-case page,
  and the run-test submission flow completes with zero regressions against today's behavior.
- **SC-003**: An automated accessibility scan covers 100% of the site's page templates and
  reports zero violations beyond the documented pre-existing baseline.
- **SC-004**: 100% of source files in the new codebase are at or under 600 lines.
- **SC-005**: The data-processing step produces output identical to today's implementation when
  run against the same input data and the same point in time.
- **SC-006**: The site starts with the same single command it does today and serves all of its
  content from a single running process.
- **SC-007**: The automated test suite completes successfully on every Node.js version the
  project claims to support.
- **SC-008**: Every URL that resolves to real content today continues to resolve to the same
  content; every URL that reports "not found" today continues to report "not found."

## Assumptions

- **Rendering approach**: The site becomes a client-rendered application that fetches its content
  from a JSON API after the initial page load, rather than receiving fully-formed pages from the
  server on every request. This was chosen deliberately after weighing the trade-offs (see
  AR-011–AR-013 above for the accessibility mitigations this requires, and SC-008 / FR-012 for
  the search-visibility and public-data mitigations).
- **Search-engine visibility**: Because content now loads after the initial page, a generated
  site map and correct per-page title/description metadata are relied on to keep the site
  discoverable, in place of the complete-HTML-on-first-load approach used today.
- **Operational contract unchanged**: The site continues to be started and run as a single
  process on a single command, matching today's deployment reality (no deployment configuration
  exists in the project today to suggest otherwise).
- **One integrated delivery**: This migration is developed as a whole and delivered as a single
  reviewable change, verified internally against the checkpoints in the accompanying
  implementation plan before that delivery happens — rather than shipped in incremental
  user-facing slices.
- **Restructuring shared logic is in scope**: The project's existing governance says not to
  restructure the shared data-processing helpers just because they could be cleaner. This
  migration restructures them anyway, by explicit request, because a TypeScript port under a
  600-line-per-file limit cannot avoid it. The principle this migration must not violate is the
  one underneath that guidance: every computed/derived value must keep being *computed*, never
  hand-edited into the source data, and the computation's output must not change (SC-005).
- **Verification, not deployment, is the finish line**: "Done" for this migration means the
  verification checkpoints above are satisfied on the integrated result, not that it has been
  deployed to production — deployment remains a separate, later decision.
