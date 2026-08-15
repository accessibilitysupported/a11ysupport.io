/**
 * T067 (part): port of test-case.pug:224-279, verbatim — including using the raw `.support`
 * code (not `.support_string.class`) for the cell's class name, which is what the original does
 * here (unlike the core-support tables elsewhere, which use `.string.class`).
 */
import { makeSafe, generateTestTitle } from '../../src/lib/test-id-helper';
import { TestProcedure } from './TestProcedure';
import type { ATBrowsers } from '../../src/types/at-browsers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ExtendedSupportTable({ assertion, test, atBrowsers }: { assertion: any; test: any; atBrowsers: ATBrowsers }) {
  const rows = Object.values(atBrowsers.at).flatMap((at) => {
    let browsers = at.extended_browsers;
    if (atBrowsers.extended_at.includes(at.id)) {
      browsers = browsers.concat(at.core_browsers);
    }
    return browsers.map((browser) => ({ at, browser }));
  });

  return (
    <details className="indent">
      <summary>
        <h4>
          Extended Support for: {assertion.feature_title}: {assertion.assertion_title}
        </h4>
      </summary>
      <p>These are less common combinations</p>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard-scrollable region, WCAG 2.1.1 */}
      <div className="responsive-table" tabIndex={0}>
        <table>
          <tbody>
            <tr>
              <th>AT</th>
              <th>Browser</th>
              <th>Has Support</th>
              <th>Output</th>
            </tr>
            {rows.map(({ at, browser }) => {
              const result = assertion.results[at.id]?.browsers[browser];
              if (!result) return null;
              const version = test.versions[at.id]?.browsers?.[browser];
              return (
                <tr key={`${at.id}-${browser}`}>
                  <td>
                    {at.title}
                    {version?.at_version && <span> {version.at_version}</span>}
                  </td>
                  <td>
                    {atBrowsers.browsers[browser]!.title}
                    {version?.browser_version && <span> {version.browser_version}</span>}
                  </td>
                  <td className={`support-case ${result.support}`}>
                    <a href={`/tests/${makeSafe(test.id)}/${makeSafe(assertion.feature_id)}/${assertion.feature_assertion_id}/${at.id}/${browser}`}>
                      <span>{result.support_string.string}</span>
                    </a>
                  </td>
                  <td>
                    {result.output ? (
                      <ul>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {result.output.map((output: any, i: number) => (
                          <li key={i}>
                            <strong>Result:</strong>
                            <span> ({output.result})</span>
                            <ul>
                              <li>
                                <details>
                                  <summary>Test Case: {generateTestTitle(output, at, test)}</summary>
                                  <TestProcedure testCase={output} at={at} browser={atBrowsers.browsers[browser]} test={test} />
                                </details>
                              </li>
                              <li>
                                <strong>Output:</strong>
                                <span> {output.output}</span>
                              </li>
                              {output.behind_setting && (
                                <li>
                                  <strong>Must change default settings to enable support:</strong>
                                  <span> {output.behind_setting}</span>
                                </li>
                              )}
                              {output.commandNotes && (
                                <li>
                                  <strong>Command Notes:</strong>
                                  <span> {output.commandNotes}</span>
                                </li>
                              )}
                              {output.resultNotes && (
                                <li>
                                  <strong>Result Notes:</strong>
                                  <span> {output.resultNotes}</span>
                                </li>
                              )}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
