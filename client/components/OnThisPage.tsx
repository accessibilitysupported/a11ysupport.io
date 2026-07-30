/**
 * T059: the "On this page" jump-link list pattern shared by feature.pug (:15-36) and
 * test-case.pug (:18-40). Each caller supplies its own exact link set (they differ per page),
 * this just standardizes the `<h2>` + `<ul class="link-list">` wrapper.
 *
 * `headingId` is optional: test-case.pug's heading has `id="top"` (the skip-to-top anchor
 * target further down that page); feature.pug's does not.
 */
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  headingId?: string;
}

export function OnThisPage({ children, headingId }: Props) {
  return (
    <>
      <h2 id={headingId}>On this page</h2>
      <ul className="link-list">{children}</ul>
    </>
  );
}
