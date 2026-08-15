/**
 * T054: a single support-status `<td>`, the one piece genuinely identical across index.pug
 * (:75), feature.pug (:106-109), and test-case.pug (:111-116) — `class="support-case <class>"`,
 * the support string as content, an optional trailing `*` when some support is behind settings,
 * an optional `headers=` association, and an optional link wrapping the content (test-case.pug's
 * variant links to the support-point detail page).
 */
interface SupportStringLike {
  class: string;
  string: string;
}

interface Props {
  support: SupportStringLike;
  /** feature.pug/test-case.pug prefix the class with "support-case "; index.pug does not. */
  supportCasePrefix?: boolean;
  someSupportBehindSettings?: boolean;
  headers?: string;
  href?: string;
}

export function SupportCell({ support, supportCasePrefix = false, someSupportBehindSettings, headers, href }: Props) {
  const className = supportCasePrefix ? `support-case ${support.class}` : support.class;
  const content = (
    <>
      <span>{support.string}</span>
      {someSupportBehindSettings && <span>*</span>}
    </>
  );

  return (
    <td className={className} headers={headers}>
      {href ? <a href={href}>{content}</a> : content}
    </td>
  );
}
