/**
 * T067 (part): port of test-case.pug:122-220 — one assertion's detailed results table (per
 * AT/browser core combination) plus its ExtendedSupportTable disclosure.
 */
import { makeSafe } from '../../src/lib/test-id-helper';
import { generateTestTitle } from '../../src/lib/test-id-helper';
import { TestProcedure } from './TestProcedure';
import { ExtendedSupportTable } from './ExtendedSupportTable';
import type { ATBrowsers } from '../../src/types/at-browsers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TestCaseAssertionDetail({ assertion, test, atBrowsers }: { assertion: any; test: any; atBrowsers: ATBrowsers }) {
  const anchorId = `assertion-${assertion.feature_id.replace('/', '-')}-${assertion.feature_assertion_id}${assertion.applied_to ? '-' + String(assertion.applied_to).replace('/', '-') : ''}`;

  return (
    <div className="assertion-container">
      <h3 id={anchorId}>
        Expectation for the {assertion.feature_title}: {assertion.assertion_title}
        {assertion.applied_to && <span> - applied to the {assertion.applied_to_title}</span>}
        {assertion.references?.length > 0 && <span> - references the {assertion.references_titles}</span>}
      </h3>

      {assertion.applied_to && (
        <p>
          This expectation is applied to the {assertion.applied_to_title}. Expectations and results might differ
          when the the feature is applied to different roles.
        </p>
      )}
      {assertion.references?.length > 0 && (
        <p>
          This expectation references the {assertion.references_titles}. Expectations and results might differ
          when the the feature references different roles.
        </p>
      )}

      <p>
        This expectation is from the <a href={`/tech/${assertion.feature_id}`}>{assertion.feature_title} feature</a>.
      </p>

      {assertion.assertion_rationale && (
        <>
          <h4>Rationale:</h4>
          <p>{assertion.assertion_rationale}</p>
        </>
      )}

      <h4>Strength of this expectation for different types of assistive technologies:</h4>
      <ul>
        <li>Screen Readers: {assertion.assertion_strength.sr}</li>
        <li>Voice Control: {assertion.assertion_strength.vc}</li>
      </ul>

      {assertion.assertion_examples && (
        <>
          <h4>Examples:</h4>
          <ul>
            {assertion.assertion_examples.map((example: string, i: number) => (
              <li key={i}>{example}</li>
            ))}
          </ul>
        </>
      )}

      <h4>Grading method:</h4>
      <p>
        {assertion.pass_strategy === 'all'
          ? 'All of the listed commands must pass for the expectation to pass.'
          : 'Just one of the listed commands must pass for the expectation to pass.'}
      </p>

      {assertion.assertion_notes && (
        <>
          <h4>Notes:</h4>
          <p dangerouslySetInnerHTML={{ __html: assertion.assertion_notesHtml ?? assertion.assertion_notes }} />
        </>
      )}

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard-scrollable region, WCAG 2.1.1 */}
      <div className="responsive-table" tabIndex={0}>
        <table aria-labelledby={anchorId}>
          <tbody>
            <tr>
              <th>AT</th>
              <th>Browser</th>
              <th>Has Support</th>
              <th>Output</th>
            </tr>
            {atBrowsers.core_at.flatMap((at) =>
              atBrowsers.at[at]!.core_browsers.map((browser) => {
                const result = assertion.results[at]?.browsers[browser];
                if (!result) return null;
                return (
                  <tr id={`${anchorId}-${at}-${browser}`} key={`${at}-${browser}`}>
                    <td>{atBrowsers.at[at]!.title}</td>
                    <td>{atBrowsers.browsers[browser]!.title}</td>
                    <td className={`support-case ${result.support}`}>
                      <a href={`/tests/${makeSafe(test.id)}/${makeSafe(assertion.feature_id)}/${assertion.feature_assertion_id}/${at}/${browser}`}>
                        <span>{result.support_string.string}</span>
                      </a>
                    </td>
                    <td>
                      {result.output ? (
                        <>
                          <ul>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {result.output.map((output: any, i: number) => (
                              <li key={i}>
                                <strong>Result: </strong>
                                <span className={`output-result ${output.result}`}> ({output.result})</span>
                                <ul>
                                  <li>
                                    <details>
                                      <summary>Test Case: {generateTestTitle(output, atBrowsers.at[at], test)}</summary>
                                      <TestProcedure testCase={output} at={atBrowsers.at[at]} browser={atBrowsers.browsers[browser]} test={test} />
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
                                  {(!assertion.pass_strategy || assertion.pass_strategy === 'any') && output.result === 'fail' && (
                                    <li>
                                      <strong>Grading note:</strong>
                                      <span> This command may be expected to fail. This result simply indicates that it did not yield support.</span>
                                    </li>
                                  )}
                                </ul>
                              </li>
                            ))}
                          </ul>
                          {result.notes && (
                            <>
                              <strong>Notes:</strong>
                              <span> {result.notes}</span>
                            </>
                          )}
                          {result.support_string.string === 'none' && (
                            <>
                              <strong>Grading Note:</strong>
                              <span>
                                {' '}
                                There is no known/documented support. There may still be support for this
                                expectation, but it is undocumented. If this is the case, please report this
                                issue.
                              </span>
                            </>
                          )}
                        </>
                      ) : result.notes ? (
                        <>
                          <strong>Notes:</strong>
                          <span> {result.notes}</span>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ExtendedSupportTable assertion={assertion} test={test} atBrowsers={atBrowsers} />
      <a href="#top" className="back-to-top">
        Back to top
      </a>
    </div>
  );
}
