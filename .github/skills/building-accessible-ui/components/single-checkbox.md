# Single checkbox (consent / toggle)

Use for a standalone consent, agreement, or on/off choice that isn't part of a group (e.g., "I agree to the terms", "Subscribe to updates").

## Principles

- A lone checkbox is not a group — do not wrap it in a group region with a group name.
- The label describes the specific decision being made.
- When required, expose the required state programmatically and indicate visually.
- On invalid submit, move focus to the checkbox and expose the error programmatically.

## Web implementation

### General defaults

- Use `<input type="checkbox">` + `<label for="...">` (or wrapping `<label>`).
- **Do not** wrap a single checkbox in `<fieldset>`/`<legend>`. That's for groups of checkboxes/radios.
- If required: add `required` on the input; visually mark the requirement; expose any error via `aria-describedby` and set `aria-invalid="true"` while invalid.
- Helper text: own element, linked via `aria-describedby`.

### Minimal pattern

```html
<input id="agree-terms" type="checkbox" required
       aria-describedby="agree-error">
<label for="agree-terms">
  I agree to the <a href="/terms">terms of service</a>.
</label>
<p id="agree-error" hidden>Error: You must agree to the terms to continue.</p>
```

### Review checklist

- The checkbox has a programmatic label.
- Not wrapped in a `<fieldset>` as if it were a group.
- Required state exposed via `required` (or `aria-required="true"` on a custom control) and visibly indicated.
- Error text, when shown, is associated via `aria-describedby` (or `aria-errormessage`) and `aria-invalid="true"` is set.
- On submit with the checkbox unchecked, focus moves to the checkbox.
- Focus indicator is clearly visible.
- Visible state matches DOM state.
- The label is clickable (activates the checkbox).

### Pitfalls

- Wrapping in `<fieldset>` with a `<legend>` restating the label — adds a noisy group name.
- No label, or label text not in a `<label>` — the accessible name is missing or wrong.
- Using only `aria-label` when a visible label already exists — prefer the visible label association.
- Disabling the submit button when the checkbox is off — let submit try and report the error.
- Color-only required / error indication.
