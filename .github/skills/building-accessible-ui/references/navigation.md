# Navigation and menus

Semantic navigation grouping, expandable navigation, and why site navigation is not `role="menu"`.

## Web implementation

- Wrap site navigation in `<nav>` with a list (`<ul>`/`<li>`) of links.
- Give each `<nav>` a unique accessible name when more than one exists (e.g., `aria-label="Primary"`, `aria-label="Footer"`).
- Do not use `role="menu"` / `role="menubar"` / `role="menuitem"` for site navigation — those roles come with strong keyboard expectations (arrow-key navigation, single tab stop, type-ahead) that don't match link navigation.
- Expandable navigation:
  - Trigger is a `<button>` that controls the expand/collapse state.
  - Use `aria-expanded="true|false"` on the button to expose state.
  - Place the sub-nav as the next sibling of the trigger so the relationship is clear from DOM order.
- Current page link: `aria-current="page"` plus distinct non-color-only styling.

### Minimal pattern

```html
<nav aria-label="Primary">
  <ul>
    <li>
      <button aria-expanded="false">Products</button>
      <ul hidden>
        <li><a href="/a">A</a></li>
        <li><a href="/b">B</a></li>
      </ul>
    </li>
    <li><a href="/pricing" aria-current="page">Pricing</a></li>
  </ul>
</nav>
```

## Quick checks

- [ ] Site navigation is wrapped in `<nav>` with a list (`<ul>`/`<li>`) of links.
- [ ] When more than one `<nav>` exists, each has a unique accessible name (e.g., `aria-label="Primary"`, `aria-label="Footer"`, `aria-label="Breadcrumb"`).
- [ ] `role="menu"` / `role="menubar"` / `role="menuitem"` is **not** used for site navigation of links.
- [ ] Tab reaches every top-level nav link without requiring arrow keys.
- [ ] Expandable sub-navigation uses a `<button>` trigger with `aria-expanded` that toggles between `"true"` and `"false"`.
- [ ] The sub-nav panel is the trigger's next sibling so the DOM relationship is clear.
- [ ] The current page/section link is marked with `aria-current="page"` and distinguished visually by more than color alone.
- [ ] Escape (when implemented) closes open sub-navigations and returns focus to the trigger.
- [ ] Focus indicator is clearly visible on every nav link and trigger.
- [ ] Hover-only disclosure of sub-menus is also triggerable by keyboard focus / activation.
