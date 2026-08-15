# Checkbox group (multi-select)

Use when the user can select **zero or more** options from a short, related set.

## Principles

- Group related checkboxes so the shared name is part of each option's accessible context.
- Each checkbox has a visible label describing its specific option.
- If help text applies to the whole group, associate it with the group — not each checkbox.
- Each checkbox is an independent tab stop (Tab moves between options; Space toggles the focused checkbox). Do not reimplement with arrow-key navigation.
- Do not mark the whole group required on the `<fieldset>` itself. If the form requires "at least one" selection, enforce it with script-level validation and expose the requirement in the `<legend>` and (on submit failure) via an associated error message.
- If a single option is required (e.g., "I agree"), mark that one checkbox `required` and visibly indicate it next to that option's label.

## Web implementation

### General defaults

- Wrap the options in `<fieldset>` with a `<legend>` naming the group (if more than 1 checkbox).
- Use native `<input type="checkbox" id="...">` + `<label for="...">` for each option.
- If the group has helper text, put it in an element and link it from `<fieldset>` via `aria-describedby`. Do not put `aria-describedby` on each checkbox, on a `<div>` wrapping the options, or on an extra `<div role="group">` — `<fieldset>` is already the group.
- Do not put `aria-required` on the `<fieldset>`.
- **Per-option required:** add `required` on that individual `<input type="checkbox">` and a visible required marker on its `<label>`.
- **Group "at least one" required:** put a visible required marker in the `<legend>`, mention the requirement in the group's helper text, and enforce it with a submit-time check (HTML `required` on a checkbox means *that specific box* must be checked — it does not mean "any one of the group"). On failure, move focus to the first checkbox and expose the error via an element linked from the `<fieldset>` with `aria-describedby`.

### Example

Required "at least one" group with helper text and error:

```html
<fieldset aria-describedby="topics-help topics-error">
  <legend>Topics you want emails about <span aria-hidden="true">*</span></legend>
  <p id="topics-help">Select at least one.</p>

  <input id="t-news" type="checkbox" name="topics" value="news">
  <label for="t-news">News</label>

  <input id="t-events" type="checkbox" name="topics" value="events">
  <label for="t-events">Events</label>

  <input id="t-offers" type="checkbox" name="topics" value="offers">
  <label for="t-offers">Special offers</label>

  <p id="topics-error" hidden>Pick at least one topic to continue.</p>
</fieldset>
```

Omit `aria-describedby` / helper / error elements when not needed.

### Review checklist

- `<fieldset>` wraps the options and has a `<legend>` that names the group.
- Every checkbox has a programmatic label (`<label for>` or wrapping `<label>`).
- Visible state (checked/unchecked) matches the DOM state.
- Focus indicator is clearly visible on each checkbox.
- Tab visits each checkbox in visual order; Space toggles the focused checkbox.
- If the group has helper text, it's associated via `aria-describedby` on the `<fieldset>`, not on each checkbox.
- If a single option is required, that `<input>` has `required` and its `<label>` carries a visible marker.
- If the group requires "at least one", the `<legend>` carries a visible required marker, the helper text states the requirement, and validation enforces it on submit (no `required`/`aria-required` on the `<fieldset>`).
- No `role="checkbox"` on `<div>` or `<span>` when a native `<input type="checkbox">` is viable. If an existing custom ARIA checkbox group is already in use and accessible, prefer it (see implementation priority in SKILL.md).

### Pitfalls

- Wrapping only the visible labels (not the inputs) in a `<fieldset>`. The inputs must be inside.
- Putting `aria-describedby` on an inner `<div class="options">` or adding `<div role="group" aria-describedby="...">` inside the `<fieldset>`. `<fieldset>` is already the group — put `aria-describedby` on the `<fieldset>` itself.
- Putting `aria-required="true"` on the `<fieldset>` — it's not supported there.
- Marking every checkbox `required` to express "at least one" — that forces the user to check *all* of them. Use submit-time validation instead.
- Duplicating helper text on every checkbox via `aria-describedby` — clutters AT output. Describe the group instead.
