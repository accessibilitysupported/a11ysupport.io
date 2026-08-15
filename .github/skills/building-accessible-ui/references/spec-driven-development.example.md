# Worked example: Saved locations list (multi-phase spec)

Same feature's accessibility contract split across a Kiro/spec-kit-style
`requirements.md` / `design.md` / `tasks.md` layout. Only the accessibility-bearing content is
shown; each file also has its normal Summary/Goals/UX sections.

## requirements.md

```markdown
## Requirements — Accessibility

- R1: WHEN a screen reader user opens the saved locations panel, the system SHALL expose it as a
  labeled region with a heading, so the user can find it via landmark or heading navigation.
  Acceptance: panel has an accessible name; a heading precedes the list.
- R2: WHEN a keyboard-only user removes a saved location, the system SHALL confirm before deleting
  and SHALL return focus to a sensible location afterward, so no location is lost to a stray keypress
  and focus is never dropped to `<body>`.
  Acceptance: Escape and a Cancel action both abort without deleting; focus lands on the next row's
  remove button, or the panel heading if the removed row was last.
- R3: WHEN a location is removed, the system SHALL announce the removal to assistive technology,
  so non-visual users get the same confirmation sighted users see.
  Acceptance: a polite live region announces "<name> removed" within one render frame of removal.
- Non-goals: reordering locations by drag; out of scope for this iteration, tracked separately.
```

## design.md

```markdown
## Design — Accessibility

### Components used
- `page-layout` region + `<h2>` heading for the panel (see `components/page-layout.md`).
- Native `<ul>`/`<li>` for the list; native `<button>` for remove; `<dialog>` for the confirm step
  (see `components/modal-dialog.md`). No custom widgets.

### Labels and accessible names
| Control | Visible label | Accessible name | Notes |
|---|---|---|---|
| Panel heading | Saved locations | — | `<h2>` |
| Row remove button | Remove | Remove <location name> | assembled per row |
| Confirm dialog heading | Remove this location? | — | `<h2>` inside `<dialog>` |
| Confirm dialog confirm button | Remove | Remove <location name> | matches row control's name |
| Confirm dialog cancel button | Cancel | — | |

### Keyboard and focus
- Tab order follows visual row order; each row's remove button is reachable by Tab.
- Enter/Space on a row's remove button opens the confirm dialog.
- Dialog open: focus moves to the dialog's heading.
- Escape or Cancel: closes dialog, focus returns to the remove button that opened it.
- Confirm: removes the location, closes dialog, focus moves to the next row's remove button; if the
  removed row was last, focus moves to the panel heading (`tabindex="-1"`).

### Dynamic state and ARIA
- No custom ARIA roles; native `<dialog>` handles modal semantics.
- Removed `<li>` is removed from the DOM, not just visually hidden.

### Status messages
- `#locations-status` — `aria-live="polite"` — "<name> removed." — triggered on successful removal.
- Empty state after last removal: panel body text "No saved locations yet." replaces the list;
  not itself a live-region announcement (the removal message already covers it).
```

## tasks.md

```markdown
- [ ] Render saved locations panel with heading and list
      Done when: panel has accessible name via heading; list uses `<ul>`/`<li>`.
      Test: tests/a11y/saved-locations.spec.ts — panel landmark/heading assertions.
- [ ] Add remove button to each row
      Done when: accessible name is "Remove <location name>"; reachable by Tab in row order.
      Test: tests/a11y/saved-locations.spec.ts — accessible-name assertions per row.
- [ ] Wire confirm dialog with focus move/restore
      Done when: opening moves focus to dialog heading; Escape/Cancel restores focus to the
      triggering row button; Confirm restores focus to next row or panel heading if last.
      Test: tests/a11y/saved-locations.spec.ts — focus-management scenarios.
- [ ] Add live-region removal announcement
      Done when: `#locations-status` announces "<name> removed" on confirm; axe run reports no
      violations on the panel in default, one-item, and empty states.
      Test: tests/a11y/saved-locations.spec.ts — live-region and axe assertions.
```
