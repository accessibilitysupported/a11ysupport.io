/**
 * T047: port of layout.pug's skip-nav link (:18) plus the focus-outline toggle script
 * (:43-53) — the outline on `#main` only appears when the skip link was reached by keyboard
 * (i.e. activated via click/Enter after Tab), not on a mouse click elsewhere, and is cleared
 * when `#main` blurs.
 */
import { useEffect } from 'react';

export function SkipLink() {
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main) return;

    const handleBlur = () => {
      main.classList.remove('show-focus-outline');
    };
    main.addEventListener('blur', handleBlur);
    return () => main.removeEventListener('blur', handleBlur);
  }, []);

  const handleClick = () => {
    const main = document.getElementById('main');
    if (!main) return;
    main.classList.add('show-focus-outline');
    main.focus();
  };

  return (
    <a className="skip-nav" href="#main" id="skip-nav" onClick={handleClick}>
      Skip to main content
    </a>
  );
}
