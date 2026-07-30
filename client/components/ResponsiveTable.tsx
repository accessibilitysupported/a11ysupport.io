/**
 * T055: port of the `div.responsive-table(tabindex="0")` scroll wrapper used throughout
 * feature.pug/test-case.pug/tests.pug/index.pug. Keeps `tabIndex={0}` so wide tables stay
 * keyboard-reachable, unchanged.
 *
 * The wrapper is missing `role="region"` + an accessible name today — a pre-existing gap
 * (spec.md Non-goals) intentionally not added here, since adding one would be a semantic change
 * beyond a faithful port.
 */
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: Props) {
  return (
    // Deliberate: a keyboard user must be able to reach and scroll this region (WCAG 2.1.1),
    // matching the original `div.responsive-table(tabindex="0")` exactly.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className={['responsive-table', className].filter(Boolean).join(' ')} tabIndex={0}>
      {children}
    </div>
  );
}
