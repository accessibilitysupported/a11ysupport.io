# Disclosure widget

A trigger that shows or hides a panel of content (FAQ answer, settings section, "show more").

## Principles

- The trigger is a real activatable control (not a plain link or text).
- The trigger exposes expanded/collapsed state to AT.
- The panel is removed from the accessibility tree and from focus order while hidden.
- Space / Enter activate the trigger; Tab leaves the widget after the panel.
- `Escape` MAY collapse an open panel and return focus to the trigger.
- Focus does not move into the panel automatically when it opens (disclosures are non-modal).

## Web implementation

### General defaults

- Trigger: `<button type="button" aria-expanded="false">`.
- Panel: the next sibling element (`<div>`, `<section>`, etc.) with `hidden` when collapsed.
- Add `hidden` to collapsed panels **via JavaScript at init**, not in the source HTML. This ensures content remains visible in reader mode and no-JS environments where CSS/JS is stripped.
- Toggle `aria-expanded` on the button and `hidden` on the panel together.
- Do **not** use `<a href="#">` as the trigger.

### Minimal pattern

```html
<h3>
  <button type="button" aria-expanded="true">
    Why do cats purr?
  </button>
</h3>
<div>
  <p>Cats purr for many reasons — contentment, self-soothing, and healing.</p>
</div>

<script>
  // Collapse panels on init — content stays visible without JS (e.g. reader mode).
  document.querySelectorAll('[aria-expanded]').forEach((btn) => {
    const panel = btn.closest('h3').nextElementSibling;
    btn.setAttribute('aria-expanded', 'false');
    panel.hidden = true;

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });
</script>
```

### Review checklist

- Trigger is a `<button>` (not an `<a>` or a `<div>`).
- `aria-expanded` is present on the trigger and flips between `"true"` / `"false"` as the panel opens and closes.
- The trigger's accessible name stays the same in both states — `aria-expanded` already communicates the state; do not swap text like "Show" / "Hide".
- When collapsed, the panel is `hidden` (or `display: none`) — not just visually hidden with CSS that leaves it focusable.
- Focus stays on the trigger when opening; users Tab into the panel themselves.
- If a group of disclosures, each has its own independent state — they don't behave like an accordion unless specified.
- Focus indicator is clearly visible on the trigger.

### Pitfalls

- `<a href="#">` as the trigger: appears navigable, breaks expected keyboard semantics, scrolls to top on activation.
- CSS-only show/hide (`opacity: 0`, `height: 0`) that keeps the panel in the focus order while it's visually hidden.
- Missing `aria-expanded`, so AT can't tell the state.
- Changing the trigger's label between states (e.g. "Show details" → "Hide details") — `aria-expanded` already conveys the state; a changing name makes the control harder to locate and creates confusing AT announcements.
- Using `role="button"` on a `<div>` without implementing Enter/Space activation and focusability — use a native `<button>` instead.
- Trapping focus inside the panel — disclosures are non-modal.
- Hardcoding `hidden` in the source HTML — if JS/CSS is stripped (reader mode, no-JS), the content disappears for everyone. Add `hidden` via script at init instead, or control visibility with CSS.
