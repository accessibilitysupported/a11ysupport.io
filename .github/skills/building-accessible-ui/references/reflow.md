# Reflow (WCAG 2.2 SC 1.4.10)

Content must adapt to narrow viewports (target 320 CSS px) without two-dimensional scrolling for multi-line text. Multi-column layouts stack into a single column; controls rearrange vertically; nothing essential is truncated or obscured. Some content genuinely needs 2-D layout (large data tables, maps, diagrams, charts) — allow horizontal scroll at the component level only; the view as a whole still reflows.

## Web implementation

- Use `flex` / `grid` with fluid sizing; let text wrap.
- Avoid fixed widths that force horizontal scrolling at 320 px.
- Avoid absolute positioning and `overflow: hidden` that cause content loss at small sizes.
- Media: `img`, `video`, `canvas`, `iframe` get `max-width: 100%`.
- Flex/grid children that must shrink need `min-width: 0`.
- Long strings (URLs, tokens, code): `overflow-wrap: anywhere` (or `word-break: break-word`).
- Prefer relative units (`rem`, `em`, `%`) over fixed pixels for text and containers.

## Quick checks

- [ ] At 320 CSS pixels wide, all paragraph and multi-line text reads without horizontal scrolling.
- [ ] Multi-column layouts collapse to a single column at narrow widths; controls stack vertically.
- [ ] No content is clipped, truncated, or hidden by `overflow: hidden`, fixed widths, or fixed heights at 320 px.
- [ ] Every interactive control remains visible, reachable via Tab, and operable at 320 px.
- [ ] Media (`img`, `video`, `iframe`, `canvas`) has `max-width: 100%` and does not overflow its container.
- [ ] Long unbroken strings (URLs, tokens, code) wrap via `overflow-wrap: anywhere` / `word-break: break-word`.
- [ ] Flex/grid children that must shrink set `min-width: 0` so they don't force their parent wider.
- [ ] Collapsed content (overflow menus, "more" dialogs) is reachable within one interaction.
- [ ] Content that genuinely needs 2-D layout (large tables, maps, diagrams) allows horizontal scroll at the component level; the view as a whole still reflows.
- [ ] Zooming to 400% (browser zoom) on a 1280 px viewport does not require two-dimensional scrolling for text.
