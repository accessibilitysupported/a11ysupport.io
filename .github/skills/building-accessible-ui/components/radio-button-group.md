# Radio button group (single-select)

Use when the user must choose **exactly one** option from a short, related set.

## Principles

- Group related radios so the shared name is part of each option's accessible context.
- All radios in the group share one logical "name" so only one can be selected at a time.
- The group has exactly one sequential tab stop. Arrow keys move focus and selection between options; Tab leaves the group.
- Each radio has a visible label describing its specific option.
- Indicate which option is pre-selected, if any.
- If a selection is required, indicate the required state on the **group**, both visibly (in the `<legend>`) and programmatically (on the radios themselves).
- If the group has helper text (hint, instructions, description), associate it with the **group** via `aria-describedby` on the `<fieldset>` — not on each radio.

## Web implementation

### General defaults

- Wrap the radios in `<fieldset>` with a `<legend>` naming the group.
- Use `<input type="radio" name="sharedName" id="...">` + `<label for="...">` for each option. The shared `name` attribute provides native single-selection and the native roving-tabstop / arrow-key behavior.
- Let the browser manage focus — do not reimplement with `role="radio"` unless you have a specific reason native radios can't be styled.
- **Required group:** add `required` to every radio in the group (HTML treats the group as required when any one is required; adding it to all keeps the markup honest and survives reordering). Put a visible required marker in the `<legend>` (e.g., `*` with a legend explaining the meaning elsewhere on the form). Do **not** put `aria-required` on `<fieldset>` — it isn't supported there.
- **Group helper text:** put the hint/description in its own element and link it from the `<fieldset>` via `aria-describedby`. Do not put `aria-describedby` on each radio, on a `<div>` wrapping the options, or on an extra `<div role="group">` — `<fieldset>` is already the group.

### Example

Required group with helper text:

```html
<fieldset aria-describedby="shipping-help">
  <legend>Shipping speed <span aria-hidden="true">*</span></legend>
  <p id="shipping-help">Pick one. Faster options cost more.</p>

  <input id="ship-standard" type="radio" name="shipping" value="standard" required>
  <label for="ship-standard">Standard (5–7 days)</label>

  <input id="ship-express" type="radio" name="shipping" value="express" required>
  <label for="ship-express">Express (2 days)</label>

  <input id="ship-overnight" type="radio" name="shipping" value="overnight" required>
  <label for="ship-overnight">Overnight</label>
</fieldset>
```

Omit `required` and the `<legend>` marker when the group isn't required; omit `aria-describedby` + helper when there's no group hint.

### Review checklist

- `<fieldset>` wraps the radios with a `<legend>` naming the group.
- All radios share the same `name`.
- Each radio has a programmatic label.
- Exactly one radio is focusable by Tab; arrow keys move selection and focus between the others.
- If a default is pre-selected, it's `checked` and matches the visual state.
- Focus indicator is clearly visible.
- If the group has helper text, it's associated with the `<fieldset>` via `aria-describedby` (not repeated on each radio).
- If the group is required, the `<legend>` carries a visible required marker and every radio has `required` (no `aria-required` on the `<fieldset>`).

### Pitfalls

- Different `name` values per radio: each becomes its own group and multiple can be "selected".
- Missing `<fieldset>`/`<legend>`: the group's name doesn't reach AT; options are read without context.
- Putting `aria-describedby` on an inner `<div class="options">` or adding `<div role="group" aria-describedby="...">` inside the `<fieldset>`. `<fieldset>` is already the group — put `aria-describedby` on the `<fieldset>` itself.
- Using a separate Tab stop for every radio: breaks native arrow-key / single-tabstop behavior.
- Reimplementing as `role="radio"` on `<div>` without handling arrow keys, `tabindex` swapping, `aria-checked` state, and label associations. If an existing custom ARIA radio group is already in use and accessible, prefer it (see implementation priority in SKILL.md).
- Putting `aria-required="true"` on the `<fieldset>` — not supported. Put `required` on the radios and a visible marker in the `<legend>`.
- Duplicating the helper text's `aria-describedby` on every radio — makes AT announce the hint repeatedly. Describe the group instead.
