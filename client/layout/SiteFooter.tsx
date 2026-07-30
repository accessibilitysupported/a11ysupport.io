/**
 * T048: port of layout.pug:39-42. Drops the redundant `role="contentinfo"` — native `<footer>`
 * at the document level already carries that landmark semantics.
 */
export function SiteFooter() {
  return (
    <footer>
      <p>
        This work was originally created by Michael Fairchild. This is a community-driven and open source
        project. Text and data is available under the{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
        .
      </p>
      <p>
        <a href="https://github.com/accessibilitysupported/accessibilitysupported/">Find us on GitHub</a>
      </p>
    </footer>
  );
}
