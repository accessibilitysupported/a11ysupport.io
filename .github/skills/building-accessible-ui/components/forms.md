# Forms

Forms contain inputs/fields that can be submitted.

## Principles

- Every control has a visible, programmatic label.
- Labels don't disappear while typing or after the field has a value.
- Help text is programmatically associated with its control.
- Required fields are marked visibly and programmatically (not color-only).
- Errors describe how to fix the problem, start with "Error:", and are programmatically associated with the invalid field.
- On submit with invalid input, focus the first invalid field.
- Do not disable the submit button solely to prevent submission.
- Placeholder text is not a label.
- Personal-data fields — fields that collect information *about a person* — must use the appropriate `autocomplete` token. Common personal-data fields: name, email, phone, street address, city, postal code, country, date of birth, credit-card number. Context determines whether a field is personal data: "Name" in a shipping/profile form is personal (`autocomplete="name"`); "Name" in a "create a new file" or "name your project" form is not.

## Web implementation

### General defaults

- One `<form>` with `<label for>` + `<input>`/`<textarea>`/`<select>` pairs.
- Choose the right `type` (`email`, `tel`, `url`, `number`, `date`) so mobile keyboards and validation work.
- Add `autocomplete` on personal-data fields (see Principles for what qualifies).
- Help text: own element, linked via `aria-describedby` on the control.
- Error text: own element, linked via `aria-describedby` (or `aria-errormessage`) with `aria-invalid="true"` on the invalid control. Clear both when the field becomes valid.
- Submit control: `<button type="submit">` with a verb-based label ("Send message", not "Submit").

### Minimal pattern

```html
<form novalidate>
  <div>
    <label for="name">Full name <span aria-hidden="true">*</span></label>
    <input id="name" name="name" type="text" required autocomplete="name">
  </div>

  <div>
    <label for="email">Email <span aria-hidden="true">*</span></label>
    <input id="email" name="email" type="email" required
           autocomplete="email"
           aria-describedby="email-help email-error"
           aria-invalid="true">
    <p id="email-help">We'll only use this to reply.</p>
    <p id="email-error">Error: Enter a valid email like name@example.com.</p>
  </div>

  <div>
    <label for="phone">Phone (optional)</label>
    <input id="phone" name="phone" type="tel" autocomplete="tel">
  </div>

  <div>
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="5" required></textarea>
  </div>

  <button type="submit">Send message</button>
</form>
```

### Review checklist

- Every control has a `<label>` programmatically associated with it.
- Input `type` matches the data (`email`, `tel`, etc.).
- Required fields have `required` (or `aria-required="true"`) and a visible marker with a legend explaining it.
- Help text is linked via `aria-describedby`.
- Error text is linked via `aria-describedby` (or `aria-errormessage`); `aria-invalid="true"` is set on the invalid control and removed on fix.
- On submit with invalid input, focus moves to the first invalid control.
- Submit button has a descriptive label.
- Submit button is not disabled solely to prevent submission.
- Tab order matches visual order; focus is clearly visible on each control.

### Pitfalls

- Placeholder used as the label — vanishes on focus/typing.
- Required indicator done in color only.
- Error text near the field but not programmatically associated (AT never announces it).
- Disabling submit to "prevent" submission while errors exist — users can't surface the errors.
- `autocomplete="off"` on personal-data fields without reason.
- Missing `<label>` on a field styled to look labeled (e.g., floating placeholder).
