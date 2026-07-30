# Modal dialog

A blocking overlay for focused tasks or destructive confirmations (e.g., "Delete this image?").

## Contents
- [Principles](#principles)
- [Web implementation](#web-implementation)
  - [Preferred: native `<dialog>`](#preferred-native-dialog)
  - [Minimal pattern](#minimal-pattern-native-dialog)
  - [Fallback: ARIA dialog](#fallback-aria-dialog)
  - [Review checklist](#review-checklist)
  - [Pitfalls](#pitfalls)

## Principles

- A modal dialog has an accessible name and role exposing it as a dialog.
  - If the dialog contains a heading that summarizes its purpose, use `aria-labelledby` pointing to it.
  - If the dialog is short and has no heading (e.g., a simple alert with an "OK" button), use `aria-label` with a concise name, or let the first text content serve as the description via `aria-describedby`.
  - Do not force a heading into a dialog solely for labeling purposes.
- Opening the dialog moves focus into it (usually the first focusable control, or the primary action for confirmations).
- Background content is inert to AT, keyboard, and pointer while the dialog is open.
- Focus is trapped inside the dialog until it closes.
- Closing the dialog restores focus to the element that opened it (the browser does this automatically for native `<dialog>`). Only manage focus on close manually if the trigger may no longer exist in the DOM — in that case, move focus to another logical location.
- `Escape` closes the dialog (if closable); clicking outside MAY close it (depending on destructiveness).
- Dialog content is scrollable if it exceeds the viewport; the background does not scroll.

## Web implementation

### Preferred: native `<dialog>`

- Use `<dialog>` with `.showModal()`. The browser handles focus trap, background inertness, Escape, and the backdrop.
- If the dialog has a heading that serves as its name, give the dialog `aria-labelledby` referencing that heading. If there is no heading, use `aria-label` with a brief name instead.

### Minimal pattern (native `<dialog>`)

Using `command` / `commandfor` attributes (no JavaScript needed for open/close):

```html
<button type="button" command="show-modal" commandfor="confirm-dialog">Delete image</button>

<dialog id="confirm-dialog" aria-labelledby="confirm-heading">
  <h2 id="confirm-heading">Delete this image?</h2>
  <p>This action can't be undone.</p>

  <button type="button" command="close" commandfor="confirm-dialog">Cancel</button>
  <button type="button" command="close" commandfor="confirm-dialog" value="delete">Delete</button>
</dialog>
```

Fallback with JavaScript (for browsers that don't yet support `command`/`commandfor`):

```html
<button type="button" id="delete-btn">Delete image</button>

<dialog id="confirm-dialog" aria-labelledby="confirm-heading">
  <h2 id="confirm-heading">Delete this image?</h2>
  <p>This action can't be undone.</p>

  <button type="button" value="cancel" data-close>Cancel</button>
  <button type="button" value="delete" data-confirm>Delete</button>
</dialog>

<script>
  const dialog = document.getElementById('confirm-dialog');
  const trigger = document.getElementById('delete-btn');

  trigger.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close('cancel'));
  dialog.querySelector('[data-confirm]').addEventListener('click', () => dialog.close('delete'));

  // The browser restores focus to the trigger automatically.
  // Only manage focus on close if the trigger may no longer exist in the DOM:
  dialog.addEventListener('close', () => {
    if (!document.contains(trigger)) {
      // TODO: Move focus somewhere logical
    }
  });
</script>
```

### Fallback: ARIA dialog

When `<dialog>` isn't an option:

- Container: `role="dialog"` or `role="alertdialog"` (the latter for short destructive confirmations), `aria-modal="true"`, accessible name via `aria-labelledby` (if a heading exists) or `aria-label`, optional `aria-describedby` for the body.
- Place the dialog as a sibling of the elements that contain all page content (e.g., sibling to `<header>`, `<main>`, `<footer>`, or a single app wrapper). This ensures setting `inert` on its siblings makes the entire page non-interactive. If the dialog is nested inside a content container, only that container's siblings become inert — content within the same parent remains reachable.
- Set `inert` on all siblings of the dialog while it's open. With `inert` applied correctly, a manual focus trap is not needed — the browser prevents Tab from leaving the dialog.
- Handle `Escape` to close.
- Restore focus to the trigger on close or another logical element if the trigger no longer exists.

```html
<!-- Dialog placed as sibling to page content wrappers -->
<header>...</header>
<main>...</main>
<footer>...</footer>

<div role="alertdialog" aria-modal="true"
     aria-labelledby="confirm-heading" aria-describedby="confirm-body">
  <h2 id="confirm-heading">Delete this image?</h2>
  <p id="confirm-body">This action can't be undone.</p>
  <button type="button">Cancel</button>
  <button type="button">Delete</button>
</div>
```

### Review checklist

- Dialog has a programmatic role (`<dialog>` or `role="dialog"` / `role="alertdialog"`) and an accessible name (via `aria-labelledby` if a heading exists, otherwise `aria-label`).
- Opening moves focus into the dialog.
- While open, background is inert (native `<dialog>.showModal()` or `inert` on siblings).
- Keyboard focus can only reach the focusable content in the dialog.
- `Escape` closes the dialog, or ensure a keyboard accessible close button is available (best practice is both).
- On close, focus returns to the trigger (automatic for native `<dialog>`). Ensure manual focus management if the trigger may no longer exist in the DOM.
- For ARIA fallback dialogs, the dialog is placed as a sibling to the top-level page content wrappers so `inert` covers all page content.
- Dialog is reachable only when open; hidden from AT / focus order when closed.
- Content can scroll within the dialog if it overflows; the background doesn't scroll.
- Destructive actions use `role="alertdialog"` or a clearly-named dialog; the default/initial focus does not land on the destructive action.

### Pitfalls

- Opening a dialog without moving focus — keyboard users are stranded on the trigger. Screen reader users will receive no confirmation of action for the changed state of the page or dialog.
- Not restoring focus on close — keyboard users may lose their place, screen reader users will commonly be returned to the top of the web page.
- Forgetting `inert` on background content in the ARIA fallback — Keyboard tabbing can reach focusable elements outside of the modal dialog.
- Auto-focusing the destructive button on open — accidental confirmation via Enter/Space.
