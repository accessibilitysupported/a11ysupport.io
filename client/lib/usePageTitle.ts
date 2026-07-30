/**
 * Sets document.title and the canonical link (replacing app.js:18-21's per-request server-side
 * canonical logic) for the current page. Uses useLayoutEffect specifically so it commits before
 * any useEffect — including RouteAnnouncer's — reliably runs first regardless of component tree
 * position (React fires all layout effects across the tree before any passive effects).
 */
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

export function usePageTitle(title: string) {
  const location = useLocation();

  useLayoutEffect(() => {
    document.title = title;

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://a11ysupport.io' + location.pathname + location.search);
  }, [title, location.pathname, location.search]);
}
