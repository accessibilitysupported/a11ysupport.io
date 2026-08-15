# Structure and semantics

Regions/landmarks, heading outline, and view title.

## Web implementation

### Landmarks

- Use `<header>`, `<nav>`, `<main>`, `<footer>` for their semantic roles. Avoid `role="banner"`, `role="navigation"`, `role="main"`, `role="contentinfo"` on generic elements unless a native landmark can't be used.
- Exactly one `<main>` per page. On multi-page sites, make `<main id="maincontent" tabindex="-1">` the bypass-block target.
- If multiple landmarks of the same kind exist (e.g., two `<nav>`), give each a unique accessible name via `aria-label` or `aria-labelledby`.
- Complementary content uses `<aside>`. Search regions use `role="search"` on a `<form>` or a wrapping element.

### Heading outline

- One `<h1>` per page, typically the first heading inside `<main>` describing the page topic.
- Do not skip levels (no `<h1>` → `<h3>`). Nest sections by level.
- Headings label sections of content, not decorative breaks. Do not use heading tags purely for styling.
- Visually hidden headings may label regions for AT; keep them short and descriptive.

### Page title

- Every document has a descriptive `<title>`. Prefer `Unique page — section — site` (most specific first).
- The title changes when the primary content changes (including in single-page apps).

## Quick checks

- [ ] Major regions use native landmarks: `<header>`, `<nav>`, `<main>`, `<footer>` (and `<aside>` / `role="search"` when applicable).
- [ ] Exactly one `<main>` per view.
- [ ] Duplicated landmarks (e.g., multiple `<nav>`) each have a unique accessible name via `aria-label` or `aria-labelledby`.
- [ ] Exactly one `<h1>` per view, describing the view topic.
- [ ] Heading levels are nested and never skipped (no `<h1>` → `<h3>`).
- [ ] Headings are used for sections of content, not for visual styling of decorative text.
- [ ] Every document has a descriptive, unique `<title>`; in SPAs, the title updates on primary navigation changes.
- [ ] Visually hidden headings used to label regions are short and descriptive.
- [ ] The view can be understood using only landmarks and headings (the outline isn't too flat or too noisy).
- [ ] `role="banner"` / `role="main"` / `role="navigation"` / `role="contentinfo"` is not duplicated on elements that already have native landmark roles.
