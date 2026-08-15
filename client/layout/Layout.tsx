/**
 * T050: port of layout.pug's structural shell (:16-42). Exactly one `<main>` landmark
 * (FR-006), programmatically focusable so the skip link can target it.
 */
import { Outlet } from 'react-router';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { BetaWarning } from './BetaWarning';
import { RouteAnnouncer } from './RouteAnnouncer';

export function Layout() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <BetaWarning />
        <Outlet />
      </main>
      <SiteFooter />
      <RouteAnnouncer />
    </>
  );
}
