/**
 * T051: on every client-side route change, do everything a full page load used to give for
 * free — move focus to the new page's heading and let assistive technology know the page
 * changed. Also fires a GA pageview, since GA does not auto-track client-side navigation
 * (spec.md edge case: "counted once per page they actually view, not once per browser session").
 *
 * Runs after usePageTitle's useLayoutEffect has already set document.title for the new page
 * (React commits all layout effects before any passive effect, so this ordering is reliable
 * regardless of where each component sits in the tree).
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function RouteAnnouncer() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      // Don't move focus or announce on the very first load — matches a normal page load,
      // which never had this behavior (there was no prior page to compare against).
      isFirstRender.current = false;
      return;
    }

    // Every page's own first render after a route change shows LoadingStatus (no <h1> yet) —
    // real content, including the h1, only lands once its query resolves. A bare
    // `document.querySelector` here would run against that empty first commit and find nothing,
    // silently dropping focus/announcement for every not-yet-cached navigation (only "worked" in
    // manual testing when a page's data happened to already be cached from an earlier visit).
    // Try immediately for the (rare) already-cached case, then watch for the heading to actually
    // appear otherwise.
    let done = false;
    const focusHeading = (): boolean => {
      const heading = document.querySelector<HTMLElement>('main h1');
      if (!heading || done) return false;
      done = true;
      if (!heading.hasAttribute('tabindex')) {
        heading.setAttribute('tabindex', '-1');
      }
      heading.focus();
      setAnnouncement(document.title);
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: location.pathname + location.search,
          page_title: document.title,
        });
      }
      return true;
    };

    if (focusHeading()) return;

    const main = document.getElementById('main');
    if (!main) return;
    const observer = new MutationObserver(() => {
      if (focusHeading()) observer.disconnect();
    });
    observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname, location.search]);

  return (
    <div role="status" className="visually-hidden">
      {announcement}
    </div>
  );
}
