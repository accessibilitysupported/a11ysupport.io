# Feature spec template (with embedded accessibility)

A full feature spec. Accessibility is one section among the normal ones, not a separate document. Copy this, fill every field, delete sections that truly don't apply — don't leave placeholders.

```markdown
# <Feature name>

## Summary
One or two sentences: what this feature does and who it's for.

## Goals
- <User-visible outcome>
- <System outcome>

## Non-goals
- <What this feature explicitly does not do>

## User stories
- As a <persona>, I want <capability> so that <outcome>.

## UX / interaction
Describe the flow: entry points, primary path, alternate paths, empty/loading/error states. Reference designs if applicable.

## Data model / API
- Inputs: ...
- Outputs: ...
- Endpoints / schema changes: ...

## Implementation notes
- <Stack, libraries, files touched>
- <Feature flags, rollout>

## Accessibility

### Components used
- `<ComponentName>` — [link to component spec]. Purpose in this view.
- Custom widgets: <name> — why no existing component fits.

### Landmarks and headings
- Landmarks owned by this view: `<main>`, `<nav aria-label="...">`, ...
- `<h1>`: "<page heading text>"
- Outline: h1 → h2 → h3
- `<title>`: "<document title pattern>"

### Labels and accessible names
| Control | Visible label | Accessible name (if different) | Notes |
|---|---|---|---|
| Primary submit | Save changes | — | |
| Icon-only close | (none) | Close dialog | `aria-label` |
| Row delete | Remove | Remove item: <item name> | assembled per row |

### Grouping and associations
- `<fieldset>` / `<legend>` membership: ...
- Help text id → control (`aria-describedby`): ...
- Error message id → control (`aria-errormessage`, `aria-invalid="true"`): ...
- Required fields: ... (visual marker + `required` / `aria-required="true"`).

### Keyboard behavior
- Tab order: ...
- Activation: Enter / Space on <control> → ...
- Arrow keys (composite widgets): ...
- Escape: closes <overlay>; focus returns to <trigger>.
- Focus move on open: <element> receives focus.
- Focus restore on close: <element>.

### Dynamic state and ARIA
- `aria-expanded` on <trigger> reflects <disclosure> open state.
- `aria-pressed` / `aria-selected` / `aria-checked`: ...
- `aria-invalid` set on <field> when <condition>.
- Hidden content: `hidden` / `aria-hidden` applied consistently to <element>.

### Status messages (live regions)
- <region id> — `aria-live="polite"` — announces "<message template>". Triggered by: <event>.
- <region id> — `role="alert"` — used for <critical event>.
- Loading / empty / error announcements: ...

### Known limitations
- <gap> — affected persona: <persona> — planned fix: <ref>.

## Testing strategy
- Unit / integration: <files, what they cover>.
- End-to-end: <scenarios>.
- Accessibility automation: <tool> run against <target> in <test file>; fails on any non-best-practice violation.
- Accessibility keyboard scenarios: <scenario> covered by <test>.
- Manual checks: <AT smoke pass, if any>.
- Opt-outs: <item> — reason.

## Acceptance criteria
- [ ] <Functional criterion>
- [ ] Accessibility: all controls have the labels and accessible names in the table above.
- [ ] Accessibility: keyboard flow matches the spec; focus moves and restores as described.
- [ ] Accessibility: axe run on the rendered view reports zero non-best-practice violations.
- [ ] Accessibility: status messages announce loading, empty, and error states as specified.

## Rollout
- <Flag, staged rollout, metrics to watch>.

## Open questions
- <Unresolved decision>.
```
