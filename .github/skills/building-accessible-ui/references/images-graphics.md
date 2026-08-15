# Images and graphics

`img`, `svg`, icon fonts, emojis. Text alternatives describe the information, not the asset (no "image of"). Icons paired with visible text labels should not duplicate the label.

## Web implementation

### Informative

- `<img>`: `alt="..."` describing what the image conveys.
- Inline `<svg>`: `role="img"` plus an accessible name via `aria-label` or `<title>` referenced with `aria-labelledby`.
  ```html
  <svg role="img" aria-labelledby="graph-title">
    <title id="graph-title">Sales grew 32% year over year</title>
    <!-- shapes -->
  </svg>
  ```
- Icon fonts: wrap in an element with `role="img"` and an accessible name, or use an adjacent visible text label and hide the icon from AT.
- Emoji used informatively: either include a visible label or use `role="img"` with `aria-label`.

### Decorative

- `<img>` decorative: `alt=""` (do not omit the `alt` attribute).
- Inline `<svg>` / icon fonts / emojis: `aria-hidden="true"`.
- CSS background images don't need alt; avoid using them for meaningful content.

### Icon + text pairs

If an icon sits next to a visible label that already names the action, hide the icon from AT (`aria-hidden="true"`) so the label isn't duplicated.

### Color inheritance

Icons should use `currentColor` so they inherit text color and adapt to High Contrast / Forced Colors mode. See `contrast-forced-colors.md`.

## Quick checks

- [ ] Informative `<img>` has an `alt` that conveys the information the image carries in context.
- [ ] Decorative `<img>` has `alt=""` — the attribute is present, not omitted.
- [ ] Inline informative `<svg>` has `role="img"` plus an accessible name (`aria-label`, or `<title>` referenced with `aria-labelledby`).
- [ ] Decorative inline `<svg>`, icon fonts, and emoji are `aria-hidden="true"`.
- [ ] Icons paired with a visible text label are hidden from AT so the name isn't duplicated.
- [ ] Alt text describes the information, not the asset (no "image of", "picture of").
- [ ] Complex graphics (charts, diagrams) have a longer description available nearby or via a link / `<figure>` + `<figcaption>`.
- [ ] Text inside images is avoided; when unavoidable, the same text exists as real text or alt.
- [ ] Icons use `currentColor` so they adapt to text color and Forced Colors mode.
- [ ] CSS background images are not used to carry meaningful content.
- [ ] Turning off CSS still leaves informative images understandable through their text alternatives.
