/**
 * T048: port of layout.pug:16-34. Drops the redundant `role="banner"`/`role="navigation"` —
 * native `<header>`/`<nav>` already carry that semantics (plan.md, Accessibility Design).
 */
import { Link } from 'react-router';
import { SkipLink } from './SkipLink';

export function SiteHeader() {
  return (
    <header>
      <SkipLink />
      <div className="logo-area">
        <div className="site-title">
          <Link to="/">Accessibility Support</Link>
        </div>
        <span>Will your code work with assistive technologies?</span>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/tests">All Tests</Link>
          </li>
          <li>
            <Link to="/faq">FAQ</Link>
          </li>
          <li>
            <Link to="/contribute">Contribute</Link>
          </li>
          <li>
            <Link to="/learn">Learn</Link>
          </li>
          <li>
            <Link to="/updates">Recent updates</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
