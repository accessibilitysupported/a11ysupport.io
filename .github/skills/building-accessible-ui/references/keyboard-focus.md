# Keyboard and focus

Tab order, visible focus, bypass blocks, composite-widget focus, overlays. Composite widgets (tabs, listbox, menu-like UIs, date pickers, grids) have one sequential focus stop and use arrow keys internally. Modals trap focus and restore it to the trigger on close; non-modal overlays (popovers, disclosures) do not trap.

## Web implementation

### Focus removal rules

- Hide from tab order / AT: `hidden`, `display: none`, `visibility: hidden`, or `aria-hidden="true"` (the last removes from AT; combined with `tabindex="-1"` or inert ancestors for focus).
- Programmatic-only focus: `tabindex="-1"`.
- Don't remove focus outlines without providing an equally visible replacement.

### Bypass blocks (only for traditional web pages)

Required when users navigate between pages with repeated navigation blocks. Not required for SPAs, Electron / Tauri apps, or views that don't repeat navigation across loads.

```html
<header>
  <a href="#maincontent" class="sr-only">Skip to main content</a>
  <!-- header content -->
</header>
<nav><!-- nav --></nav>
<main id="maincontent" tabindex="-1">
  <h1><!-- page title --></h1>
</main>
```

```css
.sr-only:not(:focus):not(:active) {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
```

### Composite widgets — two patterns

#### Roving tabindex

- Exactly one item has `tabindex="0"`; all others are `-1`.
- Arrow keys swap `tabindex` between items and call `.focus()` on the new active item.

#### `aria-activedescendant`

- Container has `tabindex="0"` and `aria-activedescendant="itemId"`.
- Arrow keys update the container's `aria-activedescendant` to the new item's `id`; ensure it's scrolled into view. Focus stays on the container.

### Overlays, modals, disclosures

- Opening a modal moves focus into the modal. Native `<dialog>.showModal()` handles this automatically.
- Closing restores focus to the trigger. For native `<dialog>`, the browser does this automatically — only manage focus manually if the trigger may no longer exist in the DOM.
- With native `<dialog>.showModal()` or `inert` on background content, the browser prevents Tab from escaping — a manual JS focus trap is not needed.
- Non-modal overlays (popovers, menus, disclosures) should not trap focus.
- Escape closes overlays and disclosures; focus returns to the trigger.
- While a modal is open, mark background content as `inert` so AT and keyboard can't reach it.

## Quick checks

- [ ] Every interactive element is reachable and operable with Tab / Shift+Tab and activatable with Enter/Space (or arrow keys inside composite widgets).
- [ ] Tab order follows visual/reading order; no jumps that surprise a keyboard user.
- [ ] Focus indicator is clearly visible on every focusable element, in every state (including inside modals and within custom widgets).
- [ ] Static, non-interactive content is not in the tab order (no stray `tabindex="0"` on `<div>` / `<span>`).
- [ ] Hidden content (via `hidden`, `display: none`, `visibility: hidden`, or inert ancestors) is not focusable and not in the AT tree.
- [ ] Composite widgets (tabs, listbox, menu, grid, date picker) have exactly one sequential tab stop; arrow keys move within.
- [ ] Roving tabindex or `aria-activedescendant` is used consistently — not a mix that leaves two elements with `tabindex="0"`.
- [ ] Opening a modal moves focus into it; closing restores focus to the trigger (automatic for native `<dialog>`); background is `inert` while open.
- [ ] Non-modal overlays (disclosures, popovers, tooltips) do not trap focus; Escape closes and returns focus to the trigger.
- [ ] For traditional multi-page sites, a skip link is the first focusable element and targets a focusable `<main>` (`tabindex="-1"`).
- [ ] Default focus outlines are either preserved or replaced with an equally visible custom indicator (meets 3:1 contrast).
