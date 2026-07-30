/**
 * T067 (part): port of test-case.pug:282-304 — the "Dates and Versions" disclosure table.
 */
import type { ATBrowsers } from '../../src/types/at-browsers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function VersionsTable({ test, atBrowsers }: { test: any; atBrowsers: ATBrowsers }) {
  return (
    <details open>
      <summary>
        <h2 id="versions">Dates and Versions of tested combinations</h2>
      </summary>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard-scrollable region, WCAG 2.1.1 */}
      <div className="responsive-table" tabIndex={0}>
        <table>
          <tbody>
            <tr>
              <th>AT</th>
              <th>AT Version</th>
              <th>Browser</th>
              <th>Browser version</th>
              <th>OS version</th>
              <th>Date tested</th>
            </tr>
            {atBrowsers.core_at.flatMap((at) =>
              atBrowsers.at[at]!.core_browsers.map((browser) => {
                const version = test.versions[at]?.browsers?.[browser];
                if (!version) return null;
                return (
                  <tr key={`${at}-${browser}`}>
                    <td>{atBrowsers.at[at]!.title}</td>
                    <td>{version.at_version}</td>
                    <td>{atBrowsers.browsers[browser]!.title}</td>
                    <td>{version.browser_version}</td>
                    <td>{version.os_version}</td>
                    <td>{version.date}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
