# Contrast and forced colors

Thresholds, tokenization, and adapting to OS-enforced color schemes. Text ≥ 4.5:1; large text (≥ 24 px regular or ≥ 18.66 px bold) ≥ 3:1. Focus indicators and parts of non-text content required for understanding ≥ 3:1. Check every interactive state (default, hover, active, focus, visited). Never rely on color alone. Never override OS high-contrast / forced-colors settings.

## Web implementation

### Tokens

- Follow existing styles and named tokens if available.
- Otherwise, define named tokens via CSS custom properties: `--color-bg`, `--color-text`, `--color-muted-text`, `--color-link`, `--color-border`, `--color-focus`, `--color-danger`, `--color-success`.
- Only assign UI colors via these tokens.
- Avoid alpha (`opacity`, `rgba`, `hsla`) for text and primary UI boundaries if possible.

### Forced Colors mode

Use `@media (forced-colors: active)` only when the default adaptation is insufficient. Inside, use CSS system color keywords — not fixed hex/RGB:

- `ButtonText`, `ButtonBorder`, `ButtonFace`, `CanvasText`, `Canvas`, `LinkText`, `HighlightText`, `Highlight`.

Box shadows and decorative gradients are suppressed in forced colors. If using box-shadow for a focus ring, pair it with a transparent outline so something still renders:

```css
.btn:focus {
  box-shadow: 0 0 4px 3px rgba(90, 50, 200, .7);
  outline: 2px solid transparent;
}
```

Replace visual-only borders/shadows with system colors where needed:

```css
@media (forced-colors: active) {
  .button { border: 2px solid ButtonBorder; }
}
```

Do not use `forced-color-adjust: none` unless absolutely necessary. If you must, provide an accessible alternative that still works in forced colors.

### SVG icons

Icons should adapt to text color:

```css
svg { fill: currentColor; stroke: currentColor; }
```

Avoid embedding fixed fills inside the SVG source.

## Quick checks

- [ ] Body text meets 4.5:1 against its background; large text (≥ 24 px regular or ≥ 18.66 px bold) meets 3:1.
- [ ] Focus indicators and meaningful parts of non-text controls (icons, toggles, borders) meet 3:1 against adjacent colors.
- [ ] Hover, active, focus, visited, and disabled states all still meet their required contrast.
- [ ] Error / success / required / selected state is conveyed by more than color (text, icon + accessible name, shape, or position).
- [ ] UI colors come from named tokens / CSS custom properties, not ad-hoc hex values.
- [ ] No alpha (`rgba`, `opacity`) on text or critical borders where it causes contrast to drift below threshold.
- [ ] In Forced Colors mode, borders and focus rings still render (transparent `outline` paired with `box-shadow`; `system-color` keywords where needed).
- [ ] `forced-color-adjust: none` is not used unless there is a documented reason and an accessible alternative.
- [ ] SVG icons use `currentColor` and inherit text color; no hard-coded fills inside the SVG source.
