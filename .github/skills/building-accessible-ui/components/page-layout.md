# Page layout (full view)

Full views with navigation, hero content, product cards / listings, promos, and footer. This pattern is primarily a web concern.

## Principles

- The structure of the view is exposed via platform semantics (regions/landmarks).
- One top-level heading describes the view topic.
- Users can bypass repeated navigation blocks to reach the main content.
- Each navigable region is distinguishable by name when more than one exists.
- Interactive cards / tiles have exactly one primary activation target; secondary actions inside a card don't nest interactive controls.
- Promotional / dismissible surfaces have named controls.
- Respect user motion / color-scheme preferences.

## Web implementation

### General defaults

- **Landmarks**: `<header>`, `<nav>`, `<main>`, `<footer>` used for their semantic roles. Exactly one `<main>`.
- **Skip link**: first focusable element; targets `#maincontent` on `<main id="maincontent" tabindex="-1">`. See `references/keyboard-focus.md`.
- **Headings**: one `<h1>`, typically in the hero or the start of `<main>`; section `<h2>`s; no skipped levels.
- **Page title**: descriptive `<title>`.
- **Multiple `<nav>`**: each has a unique accessible name (`aria-label="Primary"`, `aria-label="Footer"`, `aria-label="Breadcrumb"`).
- **Product cards / listings**: wrap the primary link around the product name (or use a block-scoped link pattern). Don't put a `<button>` inside an `<a>` or an `<a>` inside a `<button>`. If the card has both a link and action buttons (Add to cart, Save), keep them as siblings in the DOM with a clear visual and programmatic separation. Give each action button a context-bearing accessible name (e.g., "Add to cart: Organic apples").
- **Promo banners / dismissibles**: the close control is a `<button>` with an accessible name like "Dismiss promo: Free shipping over $50".
- **Images**: product images have meaningful `alt`; decorative background imagery uses `alt=""` or CSS.
- **Reduced motion**: gate non-essential animation behind `@media (prefers-reduced-motion: no-preference)`.

### Minimal pattern (excerpt)

```html
<a href="#maincontent" class="sr-only">Skip to main content</a>

<header>
  <a href="/"><img src="/logo.svg" alt="Acme Grocers"></a>
  <nav aria-label="Primary">
    <ul>
      <li><a href="/shop">Shop</a></li>
      <li><a href="/deals">Deals</a></li>
    </ul>
  </nav>
</header>

<main id="maincontent" tabindex="-1">
  <h1>Fresh this week</h1>

  <section aria-labelledby="featured-heading">
    <h2 id="featured-heading">Featured</h2>
    <ul>
      <li>
        <article>
          <a href="/p/organic-apples"><h3>Organic apples</h3></a>
          <img src="apples.jpg" alt="">
          <p>$4.99 / lb</p>
          <button type="button" aria-label="Add to cart: Organic apples">Add to cart</button>
        </article>
      </li>
    </ul>
  </section>
</main>

<footer>
  <nav aria-label="Footer">
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/support">Support</a></li>
    </ul>
  </nav>
</footer>
```

### Review checklist

- Exactly one `<main>`; `<header>`, `<nav>`, `<footer>` used when applicable.
- Duplicated landmarks (multiple `<nav>`) have unique accessible names.
- Exactly one `<h1>`; heading outline doesn't skip levels.
- Skip link is the first focusable element and targets a focusable `<main>`.
- Each interactive card has one primary link target; no nested interactive elements (no `<button>` inside `<a>`, no `<a>` inside `<button>`).
- Card action buttons (add-to-cart, save, remove) have context-bearing accessible names.
- Promo / notification dismiss controls have context-bearing accessible names.
- Images: informative have `alt`; decorative have `alt=""`.
- View reflows at 320 px width; all interactive controls remain operable.
- Forced colors mode: no blanket overrides; borders/shadows replaced with system colors where needed.
- Animation respects `prefers-reduced-motion`.

### Pitfalls

- Two `<nav>` regions both named "Navigation" (or both unnamed): AT users can't distinguish.
- Nesting `<a>` and `<button>` in the same card (invalid HTML, broken AT behavior).
- Generic "Add", "More", "Dismiss" button labels without the item or context in the accessible name.
- Skipping from `<h1>` to `<h3>` because the `<h2>` section was removed.
- Carousels/sliders without per-slide controls or keyboard access.
- `<a href="#">` used as action buttons in headers / cards.
