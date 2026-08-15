/**
 * T067: port of test-case.pug — the largest original template (333 lines). Split into this
 * file (shell, ToC, by-AT-type summary tables using the `headers=` association scheme) plus
 * TestCaseAssertionDetail, ExtendedSupportTable, VersionsTable, HistoryList (client/components).
 */
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router';
import moment from 'moment';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { ErrorPage } from './ErrorPage';
import { OnThisPage } from '../components/OnThisPage';
import { TestCaseAssertionDetail } from '../components/TestCaseAssertionDetail';
import { VersionsTable } from '../components/VersionsTable';
import { HistoryList } from '../components/HistoryList';
import { makeSafe, trimTechFromAssertion } from '../../src/lib/test-id-helper';
import type { AtType } from '../../src/types/at-browsers';

const AT_TYPES: Array<{ type: AtType; title: string }> = [
  { type: 'sr', title: 'Screen Reader' },
  { type: 'vc', title: 'Voice Control' },
  { type: 'kb', title: 'Keyboard' },
];

export function TestCasePage() {
  const { testId } = useParams();
  const safeTestId = testId!;

  const testQuery = useQuery({ queryKey: ['test', safeTestId], queryFn: () => api.test(safeTestId) });
  const atBrowsersQuery = useQuery({ queryKey: ['at-browsers'], queryFn: api.atBrowsers });

  usePageTitle(`Test: ${testQuery.data?.test?.title ?? ''} | Accessibility Support`);

  if (testQuery.isPending || atBrowsersQuery.isPending) return <LoadingStatus />;
  if (testQuery.isError) return <ErrorPage message={(testQuery.error as Error).message} />;
  if (atBrowsersQuery.isError) return <ErrorPage message={(atBrowsersQuery.error as Error).message} />;

  const { test, features, testHtml } = testQuery.data;
  const atBrowsers = atBrowsersQuery.data;

  // testMap[test.id] on the original is really "features that reference this test" — here
  // that's the `features` array the API already returns for this test.
  const testMapFeatures = features;

  return (
    <div className="content-wrapper">
      <div className="content">
        <h1>Test: {test.title}</h1>
        <div className={`current-support-container ${test.core_support_string.sr.class}`}>
          <p>
            Screen Reader support level: {test.core_support_string.sr.string}
            {test.core_support_string.sr.class === 'na' && <span> (or no &apos;MUST&apos; expectations)</span>}
          </p>
        </div>
        <div className={`current-support-container ${test.core_support_string.vc.class}`}>
          <p>
            Voice Control support level: {test.core_support_string.vc.string}
            {test.core_support_string.vc.class === 'na' && <span> (or no &apos;MUST&apos; expectations)</span>}
          </p>
        </div>

        <OnThisPage headingId="top">
          <li>
            <a href="#description">About this test</a>
          </li>
          <li>
            <a href="#age-of-results">Age of results</a>
          </li>
          <li>
            <a href="#test-html">Test HTML</a>
          </li>
          {test.assertions && (
            <>
              <li>
                <a href="#versions">Dates and Versions of tested combinations</a>
              </li>
              <li>
                <a href="#support-summary-by-at-sr">Summary of screen reader support by expectation</a>
              </li>
              <li>
                <a href="#support-summary-by-at-vc">Summary of voice control support by expectation</a>
              </li>
              <li>
                <a href="#support-tables">Detailed support tables</a>
              </li>
            </>
          )}
          <li>
            <a href="#history">History</a>
          </li>
          <li>
            <a href="#related-features">Related features</a>
          </li>
          <li>
            <a href="#contribute">Contribute and Feedback</a>
          </li>
        </OnThisPage>

        <h2 id="description" tabIndex={-1}>About this test</h2>
        <div dangerouslySetInnerHTML={{ __html: test.descriptionHtml }} />

        <Link to={`/tests/${makeSafe(test.id)}/run`}>Submit new test results</Link>

        <h2 id="age-of-results" tabIndex={-1}>Age of results</h2>
        <p>
          Results in this test range from {moment(test.all_dates.max).fromNow()} to{' '}
          {moment(test.all_dates.min).fromNow()}. See{' '}
          <a href="#versions">detailed information about test dates and versions</a> for more information.
        </p>
        {test.failing_dates.max && moment().diff(test.failing_dates.max, 'months') >= 9 ? (
          <div className="caution">
            <h3>Caution</h3>
            <p>
              Failing or partial results may be out of date. The oldest result is from{' '}
              {moment(test.failing_dates.min).fromNow()}. Consider{' '}
              <a href={`/tests/${makeSafe(test.id)}/run`}>running this test</a> and contributing results.
            </p>
          </div>
        ) : (
          test.failing_dates.max && (
            <p>
              Failing and partial results are between {moment(test.failing_dates.max).fromNow()} and{' '}
              {moment(test.failing_dates.min).fromNow()}.
            </p>
          )
        )}

        <h2 id="test-html" tabIndex={-1}>Test HTML</h2>
        {test.html_file.startsWith('http') ? (
          <a href={test.html_file} className="open-test-page">
            view the external test
          </a>
        ) : testHtml && testHtml.split(/\r\n|\r|\n/).length < 30 ? (
          <>
            <a href={`/tests/html/${test.html_file}`} className="open-test-page">
              Open the test case HTML file
            </a>
            <pre className="test-html">
              <code>{testHtml}</code>
            </pre>
          </>
        ) : (
          <>
            <a href={`/tests/html/${test.html_file}`} className="open-test-page">
              Open the test case HTML file
            </a>
            <p>HTML source is too long to display here.</p>
          </>
        )}

        {test.assertions && (
          <>
            {AT_TYPES.map((atType) => {
              let colspan = 0;

              return (
                <details open key={atType.type}>
                  <summary>
                    <h2 id={`support-summary-by-at-${atType.type}`} tabIndex={-1}>Summary of {atType.title} support by expectation</h2>
                  </summary>
                  {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard-scrollable region, WCAG 2.1.1 */}
                  <div className="responsive-table" tabIndex={0}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {testMapFeatures.map((feature: any, currentFeatureIndex: number) => {
                      const rows = test.assertions
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .map((assertion: any, assertionIndex: number) => ({ assertion, assertionIndex }))
                        .filter(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          ({ assertion }: any) =>
                            assertion.assertion_strength[atType.type] !== 'NA' && feature.featureId === assertion.feature_id
                        );
                      const coreAtForType = atBrowsers.core_at.filter((at) => atBrowsers.at[at]!.type === atType.type);
                      if (currentFeatureIndex === 0) {
                        colspan = coreAtForType.reduce((sum, at) => sum + atBrowsers.at[at]!.core_browsers.length, 0);
                      }

                      return (
                        <table
                          key={feature.featureId}
                          aria-labelledby={`support-summary-by-at-${atType.type} ${atType.type}-feature-index-${currentFeatureIndex}`}
                          className="support-table assertion-container summary-matrix"
                        >
                          <caption id={`${atType.type}-feature-index-${currentFeatureIndex}`}>{feature.title}</caption>
                          <tbody>
                            <tr>
                              <th id={`h-feature-${currentFeatureIndex}-at-type-${atType.type}-expectation`} rowSpan={2}>
                                Expectation
                              </th>
                              {coreAtForType.map((at) => (
                                <th key={at} id={`h-feature-${currentFeatureIndex}-at-${at}`} colSpan={atBrowsers.at[at]!.core_browsers.length}>
                                  {atBrowsers.at[at]!.title}
                                </th>
                              ))}
                            </tr>
                            <tr>
                              {coreAtForType.flatMap((at) =>
                                atBrowsers.at[at]!.core_browsers.map((browser) => (
                                  <th key={`${at}-${browser}`} id={`h-feature-${currentFeatureIndex}-at-${at}-browser-${browser}`}>
                                    {atBrowsers.browsers[browser]!.title}
                                  </th>
                                ))
                              )}
                            </tr>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {rows.map(({ assertion, assertionIndex }: any) => {
                              const anchor = `#assertion-${assertion.feature_id.replace('/', '-')}-${assertion.feature_assertion_id}-${assertion.applied_to ? String(assertion.applied_to).replace('/', '-') : ''}${assertion.references ? assertion.references.join('-').replace('/', '-') : ''}`;
                              return (
                                <tr key={assertionIndex}>
                                  <th
                                    id={`h-feature-${currentFeatureIndex}-${atType.type}-assertion-${assertionIndex}`}
                                    headers={`h-feature-${currentFeatureIndex}-at-type-${atType.type}-expectation`}
                                    className="assertion"
                                  >
                                    <a href={anchor}>
                                      <span>
                                        {assertion.assertion_strength[atType.type]} {trimTechFromAssertion(assertion.assertion_title)}
                                      </span>
                                      {assertion.applied_to && (
                                        <span className="applied_to">
                                          {' '}
                                          applied to: {assertion.applied_to_title}
                                          {assertion.references?.length > 0 && <span>; references: {assertion.references_titles}</span>}
                                        </span>
                                      )}
                                    </a>
                                  </th>
                                  {coreAtForType.flatMap((at_id) =>
                                    atBrowsers.at[at_id]!.core_browsers.map((browser) => {
                                      const cell = assertion.core_support_by_at_browser[at_id][browser];
                                      return (
                                        <td
                                          key={`${at_id}-${browser}`}
                                          className={`support-case ${cell.string.class}`}
                                          headers={`h-feature-${currentFeatureIndex}-${atType.type}-assertion-${assertionIndex} h-feature-${currentFeatureIndex}-at-${at_id} h-feature-${currentFeatureIndex}-at-${at_id}-browser-${browser}`}
                                        >
                                          <a href={`${anchor}-${at_id}-${browser}`}>
                                            <span>
                                              {cell.string.string}
                                              {cell.some_support_behind_settings && '*'}
                                            </span>
                                          </a>
                                        </td>
                                      );
                                    })
                                  )}
                                </tr>
                              );
                            })}
                            {rows.length === 0 && (
                              <tr>
                                <td colSpan={colspan + 1}>Not applicable</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      );
                    })}
                  </div>
                  <p>* means that some support is hidden behind settings</p>
                </details>
              );
            })}
          </>
        )}

        <h2 id="detailed-results">Detailed support results by expectation</h2>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {test.assertions.map((assertion: any, i: number) => (
          <TestCaseAssertionDetail key={i} assertion={assertion} test={test} atBrowsers={atBrowsers} />
        ))}

        <VersionsTable test={test} atBrowsers={atBrowsers} />
        <HistoryList history={test.history} />
      </div>

      <div className="sidebar">
        <h2 id="related-features" tabIndex={-1}>Related Features</h2>
        <p>This test is found in the following features:</p>
        <ul>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {features.map((featureInfo: any) => (
            <li key={featureInfo.featureId}>
              <Link to={`/tech/${featureInfo.featureId}`}>{featureInfo.title}</Link>
            </li>
          ))}
        </ul>

        <h2 id="contribute" tabIndex={-1}>Feedback and Contribute</h2>
        <p>
          We use our{' '}
          <a href="https://github.com/accessibilitysupported/accessibilitysupported">GitHub repository</a> to
          manage our issue tracking. Please provide as much information as you can for issues, and please leave
          the id in the issue title intact.
        </p>
        <ul>
          <li>
            <a href={`https://github.com/accessibilitysupported/accessibilitysupported/issues/new?title=${test.id}&labels=test%20case`}>
              There is a problem with this test case (the test file, procedure, expected results, etc)
            </a>
          </li>
          <li>
            <p>Use the support tables to view details and report issues or changes.</p>
          </li>
        </ul>

        <h2>Other</h2>
        <p>
          <a href="/faq#what-are-expectations%3F">What are expectations and how are they determined?</a>
        </p>
      </div>
    </div>
  );
}
