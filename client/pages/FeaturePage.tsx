/**
 * T065: port of feature.pug. Split into FeaturePage (this file) + AssertionDetail +
 * ExtendedSupportTable (client/components) so no file exceeds 600 lines.
 */
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router';
import moment from 'moment';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { ErrorPage } from './ErrorPage';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { OnThisPage } from '../components/OnThisPage';
import { AssertionDetail } from '../components/AssertionDetail';
import { makeSafe, trimTechFromAssertion } from '../../src/lib/test-id-helper';
import type { AtType } from '../../src/types/at-browsers';

const AT_TYPES: Array<{ type: AtType; title: string }> = [
  { type: 'sr', title: 'Screen Reader' },
  { type: 'vc', title: 'Voice Control' },
  { type: 'kb', title: 'Keyboard' },
];

export function FeaturePage() {
  const { techId, featureId } = useParams();
  const featureQuery = useQuery({
    queryKey: ['feature', techId, featureId],
    queryFn: () => api.feature(techId!, featureId!),
  });
  const atBrowsersQuery = useQuery({ queryKey: ['at-browsers'], queryFn: api.atBrowsers });

  usePageTitle(`${featureId} (${techId}) | Accessibility Support`);

  if (featureQuery.isPending || atBrowsersQuery.isPending) return <LoadingStatus />;
  if (featureQuery.isError) return <ErrorPage message={(featureQuery.error as Error).message} />;
  if (atBrowsersQuery.isError)
    return <ErrorPage message={(atBrowsersQuery.error as Error).message} />;

  const { feature: data, relatedFeatures } = featureQuery.data;
  const atBrowsers = atBrowsersQuery.data;

  return (
    <div>
      <div className="content">
        <h1>
          {data.title} ({data.techId})
        </h1>
        {AT_TYPES.map(
          (atType) =>
            data.supports_at.includes(atType.type) && (
              <div
                key={atType.type}
                className={`current-support-container ${data.core_support_string[atType.type].class}`}
              >
                <p>
                  {atType.title} support level: {data.core_support_string[atType.type].string}
                </p>
              </div>
            )
        )}

        {data.assertions.length > 0 && (
          <OnThisPage>
            <li>
              <a href="#description">About this feature</a>
            </li>
            <li>
              <a href="#age-of-results">Age of results</a>
            </li>
            <li>
              <a href="#expectations">Expectations</a>
              <ul>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.assertions.map((assertion: any, index: number) => (
                  <li key={assertion.id}>
                    <a href={`#support-table-${index}`}>{trimTechFromAssertion(assertion.title)}</a>
                  </li>
                ))}
              </ul>
            </li>
            {relatedFeatures.length > 0 && (
              <li>
                <a href="#related-features">Related features</a>
              </li>
            )}
            <li>
              <a href="#related-tests">Related tests</a>
            </li>
            {data.related_issues?.length > 0 && (
              <li>
                <a href="#at-browser-issues">Related AT or browser issues</a>
              </li>
            )}
            <li>
              <a href="#feedback">Is something not right?</a>
            </li>
          </OnThisPage>
        )}

        <h2 id="description">About this feature</h2>
        <p dangerouslySetInnerHTML={{ __html: data.descriptionHtml }} />
        {data.recommendationHtml && (
          <p dangerouslySetInnerHTML={{ __html: data.recommendationHtml }} />
        )}

        <h2 id="age-of-results">Age of results</h2>
        <p>
          Results across all tests for this feature range from{' '}
          {moment(data.all_dates.max).fromNow()} to {moment(data.all_dates.min).fromNow()}. Detailed
          dates and version information can be found in{' '}
          <a href="#related-tests">associated tests</a>.
        </p>
        {data.failing_dates.max && moment().diff(data.failing_dates.max, 'months') >= 9 ? (
          <div className="caution">
            <h3>Caution</h3>
            <p>
              Failing or partial results may be out of date. The oldest result is from{' '}
              {moment(data.failing_dates.min).fromNow()}. Consider running the{' '}
              <a href="#related-tests">associated tests</a> and contributing results.
            </p>
          </div>
        ) : (
          data.failing_dates.max && (
            <p>
              Failing and partial results are between {moment(data.failing_dates.max).fromNow()} and{' '}
              {moment(data.failing_dates.min).fromNow()}.
            </p>
          )
        )}

        <h2 id="expectations">Expectations</h2>
        <p>
          <a href="/faq#what-are-expectations%3F">What are expectations?</a>
        </p>

        {data.possible_backend_expectations && (
          <div className="caution">
            <p>
              Important: The {data.title} has expectations that are not directly testable by end
              users. Continue to use it if it is required by the specification, even if user-facing
              expectation support is poor. For more information, see{' '}
              <a href="/faq#what-about-expectations-that-are-not-directly-testable-by-users%3F">
                FAQ: What about expectations that are not directly testable by users?
              </a>
              .
            </p>
          </div>
        )}

        {data.assertions.length > 0 ? (
          <>
            {AT_TYPES.map((atType) => {
              if (!data.supports_at.includes(atType.type)) return null;
              let someSupportBehindSettings = false;
              let assertionsFound = 0;
              const coreAtForType = atBrowsers.core_at.filter(
                (at) => atBrowsers.at[at]!.type === atType.type
              );
              const colspan = coreAtForType.reduce(
                (sum, at) => sum + atBrowsers.at[at]!.core_browsers.length,
                0
              );

              const rows = data.assertions
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((assertion: any, index: number) => ({ assertion, index }))
                .filter(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ({ assertion }: any) =>
                    assertion.strength[atType.type] !== 'NA' && assertion.tests.length > 0
                );
              assertionsFound = rows.length;

              return (
                <div key={atType.type}>
                  <h3 id={`support-table-by-assertion-and-at-${atType.type}`}>
                    {atType.title} support by expectation
                  </h3>
                  <ResponsiveTable>
                    <table
                      aria-labelledby={`support-table-by-assertion-and-at-${atType.type}`}
                      className="support-summary-table"
                    >
                      <colgroup span={1} />
                      {coreAtForType.map((at) => (
                        <colgroup key={at} span={atBrowsers.at[at]!.core_browsers.length} />
                      ))}
                      {/* No thead/tbody here — feature.pug:74-91 has none, just bare <tr>s
                          directly under <table> (browsers implicitly wrap them all in one
                          tbody). Wrapping the header rows in <thead> would make
                          `thead th { text-align: center }` apply where the original leaves the
                          base `th { text-align: left }` in effect, shifting header text —
                          caught by tests/e2e/visual.spec.ts's baseline comparison. */}
                      <tr>
                        <th rowSpan={2}>Expectation</th>
                        {coreAtForType.map((at) => (
                          <th
                            key={at}
                            colSpan={atBrowsers.at[at]!.core_browsers.length}
                            scope="colgroup"
                          >
                            {atBrowsers.at[at]!.title}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {coreAtForType.flatMap((at) =>
                          atBrowsers.at[at]!.core_browsers.map((browser) => (
                            <th key={`${at}-${browser}`} scope="col">
                              {atBrowsers.browsers[browser]!.title}
                            </th>
                          ))
                        )}
                      </tr>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {rows.map(({ assertion, index }: any) => (
                        <tr key={assertion.id}>
                          <th>
                            <a href={`#support-table-${index}`}>
                              {assertion.strength[atType.type]}{' '}
                              {trimTechFromAssertion(assertion.title)}
                            </a>
                          </th>
                          {coreAtForType.flatMap((at) =>
                            atBrowsers.at[at]!.core_browsers.map((browser) => {
                              const cell = assertion.core_support_by_at_browser[at][browser];
                              if (cell.some_support_behind_settings)
                                someSupportBehindSettings = true;
                              return (
                                <td
                                  className={`support-case ${cell.string.class}`}
                                  key={`${at}-${browser}`}
                                >
                                  {cell.string.string}
                                  {cell.some_support_behind_settings && '*'}
                                </td>
                              );
                            })
                          )}
                        </tr>
                      ))}
                      {assertionsFound === 0 && (
                        <tr>
                          <td colSpan={colspan + 1}>Not applicable</td>
                        </tr>
                      )}
                    </table>
                  </ResponsiveTable>
                  {someSupportBehindSettings && (
                    <p>* means that some support is hidden behind settings</p>
                  )}
                </div>
              );
            })}

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.assertions.map((assertion: any, index: number) => (
              <AssertionDetail
                key={assertion.id}
                assertion={assertion}
                index={index}
                data={data}
                atBrowsers={atBrowsers}
              />
            ))}
          </>
        ) : (
          <p>No expectations have been created for this feature yet.</p>
        )}

        {relatedFeatures.length > 0 && (
          <div className="search-results">
            <h2>Related features</h2>
            <p>These are features that are usually used in combination with this feature.</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {relatedFeatures.map((feature: any) => (
              <div
                key={`${feature.techId}/${feature.id}`}
                data-keywords={feature.keywords_string}
                className="result"
              >
                <h2>
                  <Link to={`/tech/${feature.techId}/${feature.id}`}>
                    {feature.title} ({feature.techId})
                  </Link>
                </h2>
                <ResponsiveTable>
                  <table>
                    <thead>
                      <tr>
                        {atBrowsers.core_at.map((atId) => (
                          <th key={atId}>{atBrowsers.at[atId]!.short_title}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {atBrowsers.core_at.map((atId) => (
                          <td key={atId} className={feature.core_support_by_at[atId].string.class}>
                            {feature.core_support_by_at[atId].string.string}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
                {(feature.core_support.sr?.includes('u') ||
                  feature.core_support.vc?.includes('u') ||
                  feature.core_support.kb?.includes('u')) && (
                  <p>We are missing data on some combinations.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar">
        <h2 id="related-tests">Tests</h2>
        <table aria-labelledby="related-tests">
          <tbody>
            <tr>
              <th>Test</th>
              <th>Last update</th>
            </tr>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.tests.map((test: any) => (
              <tr key={test.id}>
                <td>
                  <Link to={`/tests/${makeSafe(test.id)}`}>{test.title}</Link>
                </td>
                <td>{test.history[test.history.length - 1].date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.related_issues?.length > 0 && (
          <>
            <h2 id="at-browser-issues">Related issues, discussions, and bugs</h2>
            <ul>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.related_issues.map((link: any) => (
                <li key={link.url}>
                  <a href={link.url}>{link.title}</a>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 id="feedback">Is something not right?</h2>
        <p>
          We use our{' '}
          <a href="https://github.com/accessibilitysupported/accessibilitysupported">
            GitHub repository
          </a>{' '}
          to manage our issue tracking. Please provide as much information as you can for issues,
          and please leave the id in the issue title intact.
        </p>
        <a
          href={`https://github.com/accessibilitysupported/accessibilitysupported/issues/new?title=${data.id}&labels=tech%20feature`}
        >
          Create an issue for this feature
        </a>

        {data.references && (
          <>
            {/* Pre-existing: this heading is really "References," reused as the target for the
                "Related features" jump link above (feature.pug:29 vs :241) — preserved as-is,
                a documented pre-existing gap, not one of the 11 corrected defects. */}
            <h2 id="related-features">References</h2>
            <ul>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.references.map((reference: any) => (
                <li key={reference.url}>
                  <a href={reference.url}>{reference.title}</a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
