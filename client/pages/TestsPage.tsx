/**
 * T066: port of tests.pug. Fixes corrected-defect #3 (the live-region class mismatch) by reusing
 * FeatureSearch's shared implementation, which always emits the correct split polite/assertive
 * pair — tests.pug's own single `.live-announcements` div is what search.js could never find.
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { useFeatureSearch, SearchForm, SearchLiveRegion } from '../components/FeatureSearch';
import { trimTechFromAssertion, makeSafe } from '../../src/lib/test-id-helper';

export function TestsPage() {
  usePageTitle('All tests | Accessibility Support');
  const testsQuery = useQuery({ queryKey: ['tests-index'], queryFn: api.testsIndex });

  const testsData = testsQuery.data;
  const {
    query,
    setQuery,
    filteredItems,
    summaryText,
    politeMessage,
    assertiveMessage,
    resultsHeadingRef,
    onSubmit,
  } = useFeatureSearch(
    testsData?.tests ?? [],
    (test: any) => test.keywords_string, // eslint-disable-line @typescript-eslint/no-explicit-any
    testsQuery.isSuccess
  );

  if (testsQuery.isPending) return <LoadingStatus />;
  if (testsQuery.isError) return <RouteErrorBoundary error={testsQuery.error} />;

  const { testMap } = testsData;

  return (
    <div className="content">
      <div className="search-container">
        <SearchLiveRegion politeMessage={politeMessage} assertiveMessage={assertiveMessage} />
        <SearchForm
          query={query}
          onQueryChange={setQuery}
          onSubmit={onSubmit}
          label='Find a test (search by test title or feature title, for example "aria")'
          showSubmitButton
        />
        <div className="summary-container" tabIndex={-1} ref={resultsHeadingRef as React.RefObject<HTMLDivElement>}>
          <span>{summaryText}</span>
        </div>
        <div className="search-results">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filteredItems.map((test: any, testIndex: number) => (
            <div key={test.id} data-keywords={test.keywords_string} className="result">
              <h2>
                <Link to={`/tests/${makeSafe(test.id)}`}>{test.title}</Link>
              </h2>
              <p>last updated: {test.last_update.date}</p>
              <ResponsiveTable className="summary-matrix">
                {(testMap[test.id] ?? []).map((feature: any, featureIndex: number) => (
                  <table key={feature.featureId}>
                    <caption>{feature.title} support summary</caption>
                    <thead>
                      <tr>
                        <th id={`t-${testIndex}-${featureIndex}-expectation`}>Expectation</th>
                        <th id={`t-${testIndex}-${featureIndex}-sr-support`}>Screen Reader support</th>
                        <th id={`t-${testIndex}-${featureIndex}-vc-support`}>Voice Control support</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {test.assertions.map((assertion: any, assertionIndex: number) =>
                        feature.featureId === assertion.feature_id ? (
                          <tr key={assertionIndex}>
                            <th className="assertion">
                              <a href={`/tests/${makeSafe(test.id)}#assertion-${assertion.feature_id.replace('/', '-')}-${assertion.feature_assertion_id}`}>
                                <span>{trimTechFromAssertion(assertion.assertion_title)}</span>
                              </a>
                            </th>
                            <td className={`support-case ${assertion.core_support_string.sr.class}`}>
                              <span>{assertion.core_support_string.sr.string}</span>
                            </td>
                            <td className={`support-case ${assertion.core_support_string.vc.class}`}>
                              <span>{assertion.core_support_string.vc.string}</span>
                            </td>
                          </tr>
                        ) : null
                      )}
                    </tbody>
                  </table>
                ))}
              </ResponsiveTable>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
