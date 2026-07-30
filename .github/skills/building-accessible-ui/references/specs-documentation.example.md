# Example: full feature spec — "Filter search results"

A worked example of the template applied to a real feature. Accessibility is one section of the normal spec, not a separate document.

## Contents
- [Summary](#summary)
- [Goals / Non-goals](#goals)
- [User stories](#user-stories)
- [UX / interaction](#ux--interaction)
- [Data model / API](#data-model--api)
- [Implementation notes](#implementation-notes)
- [Accessibility](#accessibility)
- [Testing strategy](#testing-strategy)
- [Acceptance criteria](#acceptance-criteria)
- [Rollout](#rollout)

```markdown
# Filter search results

## Summary
Adds a collapsible "Filters" panel to the Search results page. Users select one or more categories and apply them to narrow results.

## Goals
- Let users narrow results without leaving the page.
- Keep the filter panel out of the way by default.
- Announce the new result count after filters are applied.

## Non-goals
- Saving filter state across sessions.
- Combining filters from URL deep-links (tracked separately in #1390).

## User stories
- As a shopper, I want to filter by category so I can find items faster.
- As a keyboard user, I want to open, select, and apply filters without reaching for the mouse.
- As a screen-reader user, I want to hear the new result count after applying filters.

## UX / interaction
- "Filters" trigger sits above the results list. Collapsed by default.
- Activating the trigger reveals a panel containing a "Categories" group of checkboxes and two buttons: "Clear filters" and "Apply".
- "Apply" submits the current selection, updates the results list, and announces the new count.
- "Clear filters" unchecks all categories but does not submit.
- Empty state: "No results for <query>. Try removing a filter."
- Error state: "Couldn't load results. Retry."

## Data model / API
- Inputs: `query: string`, `categories: string[]`.
- `GET /api/search?q=<query>&categories=<csv>` returns `{ total: number, items: Item[] }`.
- No schema changes.

## Implementation notes
- Reuses the existing `Disclosure`, `CheckboxGroup`, and `Button` components.
- New file: `src/features/search/Filters.tsx`.
- Feature flag: `search_filters_v1`.

## Accessibility

### Components used
- `Disclosure` (see `components/disclosure.md`) — toggles the filter panel.
- `CheckboxGroup` (see `components/checkbox-group.md`) — "Categories".
- `Button` — `Clear filters`, `Apply`.
- Live region — announces result count after Apply.

### Landmarks and headings
- Reuses the existing `<main>` and site `<nav aria-label="Primary">`.
- `<h1>`: "Search results".
- Outline: h1 "Search results" → h2 "Filters" (inside the panel) → h2 "Results".
- `<title>`: "Search results — <query> — Acme".

### Labels and accessible names
| Control | Visible label | Accessible name | Notes |
|---|---|---|---|
| Disclosure trigger | Filters | Filters | `aria-expanded`, `aria-controls="filters-panel"` |
| Categories fieldset | Categories | Categories | `<legend>` |
| Category option | Books / Music / ... | Categories Books / Categories Music (assembled) | native `<input type="checkbox">` |
| Clear | Clear filters | Clear filters | |
| Apply | Apply | Apply filters | `aria-label` adds "filters" for screen-reader clarity |

### Grouping and associations
- `<fieldset>` with `<legend>Categories</legend>` wraps the checkboxes.
- Help text `#categories-help` ("Select one or more") → `aria-describedby` on the `<fieldset>`.
- No required fields.

### Keyboard behavior
- Tab order: Filters trigger → (when open) Categories checkboxes → Clear → Apply → next page content.
- Enter / Space on Filters trigger toggles the panel.
- Tab moves between checkboxes (native); Space toggles each.
- Escape on the trigger or panel collapses the panel; focus returns to the Filters trigger.
- Opening the panel does not move focus (in-flow disclosure); closing via Escape restores focus to the trigger.

### Dynamic state and ARIA
- Filters trigger: `aria-expanded="true|false"`, `aria-controls="filters-panel"`.
- Panel `#filters-panel` uses `hidden` when collapsed (no `aria-hidden` — the two must not conflict).
- Apply is never disabled; there is no invalid state for this feature.

### Status messages (live regions)
- `#results-status` — `aria-live="polite"`, `aria-atomic="true"` — announces "Showing <N> results for <query>." after Apply resolves.
- Loading: `#results-status` updates to "Loading results…" while the request is in flight.
- Empty: "No results for <query>. Try removing a filter."
- Error: `role="alert"` region `#results-error` announces "Couldn't load results. Retry."

### Known limitations
- Filter count badges on the trigger are not announced on change — affected persona: screen reader. Planned fix: include count in the trigger's accessible name (#1423).

## Testing strategy
- Unit: `Filters.test.tsx` covers state transitions for Clear/Apply.
- Integration: `search.integration.test.tsx` exercises the Apply → results update flow with mocked API.
- End-to-end: `tests/e2e/search-filters.spec.ts` runs the full flow against a staging build.
- Accessibility automation: `tests/a11y/search-results.spec.ts` uses Playwright + `@axe-core/playwright` with filters collapsed and expanded; fails on any non-best-practice violation.
- Accessibility keyboard scenario: Playwright test asserts focus destinations and `aria-expanded` values across open → toggle two checkboxes → Apply → Escape.
- Manual: VoiceOver smoke pass before release (not blocking).
- Opt-outs: none.

## Acceptance criteria
- [ ] User can open the filter panel, select categories, and apply them to the results list.
- [ ] "Clear filters" unchecks all categories without submitting.
- [ ] Accessibility: all controls have the labels and accessible names in the table above.
- [ ] Accessibility: keyboard flow matches the spec; Escape closes the panel and restores focus to the trigger.
- [ ] Accessibility: axe run on the page with the panel open and closed reports zero non-best-practice violations.
- [ ] Accessibility: `#results-status` announces loading, success count, and empty states; `#results-error` announces errors.

## Rollout
- Flag `search_filters_v1` starts at 10% of traffic; monitor search conversion and error rate before ramping.

## Open questions
- Should filter state persist in the URL query string? (Out of scope for v1; revisit in #1390.)
```
