# Status messages (WCAG 4.1.3)

Announcing dynamic content changes (toasts, inline validation summaries, loading/progress, cart/count changes) to assistive tech without moving focus. A status message communicates a state change the user should know about but that does not require a context change. Because focus does not move, the user needs another channel (a live region or role) for the change to be perceivable. Keep messages short and specific; avoid duplicate announcements; do not announce *and* move focus — pick one. If a UI/component library provides an announcement primitive, prefer it.

## Web implementation

- Choose politeness by urgency:
  - `role="status"` / `aria-live="polite"` — success, progress, non-urgent updates.
  - `role="alert"` / `aria-live="assertive"` — errors and time-sensitive warnings only.
- The live region element must exist in the DOM *before* content is inserted into it. Do not toggle `aria-live` on or off dynamically — create the region up front and mutate its text.
- don't combine `role="alert"` with `aria-live="assertive"` on the same element, and don't re-render identical text repeatedly.

### Choosing the right role

| Situation | Use |
|---|---|
| Form submitted successfully | `role="status"` |
| Item added to cart / count updated | `role="status"` |
| Loading / "Saving..." | `role="status"` |
| Search results count updated | `role="status"` |
| Validation error summary rendered without focus move | `role="alert"` |
| Session about to expire | `role="alert"` |
| Destructive or time-critical warning | `role="alert"` |

`role="status"` implies `aria-live="polite"` and `aria-atomic="true"`. `role="alert"` implies `aria-live="assertive"` and `aria-atomic="true"`. Prefer the roles over raw `aria-live` attributes.

### Minimal patterns

Polite status (persistent region, text updated on change):

```html
<div role="status"></div>
```

```js
document.querySelector('[role="status"]').textContent = 'Message sent.';
```

Assertive alert for an inline error that does not move focus:

```html
<div role="alert" id="form-error"></div>
```

Progress / loading:

```html
<div role="status" aria-live="polite">
  <span class="spinner" aria-hidden="true"></span>
  Loading results…
</div>
```

### Common mistakes

- **Inserting a new element with `role="status"` at the same time as its text.** Some AT will miss the announcement. Render the region empty first, then update its text content.
- **Using `role="alert"` for non-urgent updates.** It interrupts the user and is reserved for errors/warnings.
- **Announcing on focus move.** If submit moves focus to an error summary heading, the heading's text is read by the focus change — don't also wrap it in `role="alert"`.
- **Hiding the live region with `display: none` or `hidden`.** Content inside a hidden region is not announced. Use visually-hidden (clip-path) CSS instead when the region should be SR-only.
- **Changing `aria-live` value dynamically** (e.g., from `off` to `polite` when a message appears). Create the region with its final politeness and mutate only the content.
- **Chatty regions.** Rapid successive updates can stack or drop. Debounce updates and prefer a single summarized message.

### Framework notes

Ensure the live region is rendered on initial mount, not conditionally inserted when the message appears — toggle the text, not the element. Component libraries usually provide Snackbar/Toast/Alert primitives that manage this correctly; prefer them.

## Quick checks

- [ ] Does the update happen without a focus change? If yes, it needs a live region or `role="status"` / `role="alert"`.
- [ ] Is the correct politeness used — `status` for routine, `alert` only for urgent?
- [ ] Is the live region rendered in the DOM *before* the message text is inserted?
- [ ] Is `aria-live` left alone after the region is created (not toggled on/off)?
- [ ] Is the message concise and specific about what changed?
- [ ] Is the announcement non-duplicative (no `role="alert"` + `aria-live="assertive"` together; no identical repeat renders)?
- [ ] For progress/loading, is completion communicated (text or region update), not just the spinner disappearing?
- [ ] Does submitting a form with validation errors either (a) move focus to the summary/first invalid field, or (b) announce the error count via `role="alert"` — but not both?
