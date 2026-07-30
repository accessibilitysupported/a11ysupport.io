/**
 * T062: port of index.pug. Fixes corrected-defect #8 (the search result count must not nest
 * inside the `<h2>` — index.pug:18-20 does) and corrected-defect #9 (`<col>`/`<colgroup>` must
 * be direct children of `<table>`, before `<thead>` — index.pug:48-53 puts them inside `<thead>`,
 * which is invalid).
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import moment from 'moment';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { SupportCell } from '../components/SupportCell';
import { useFeatureSearch, SearchForm, SearchLiveRegion } from '../components/FeatureSearch';
import { makeSafe } from '../../src/lib/test-id-helper';
import type { HomeFeature } from '../../src/types/api';
import type { ATBrowsers, AtType } from '../../src/types/at-browsers';

const AT_TYPES: Array<{ type: AtType; title: string }> = [
  { type: 'sr', title: 'Screen Reader' },
  { type: 'vc', title: 'Voice Control' },
  { type: 'kb', title: 'Keyboard' },
];

export function HomePage() {
  usePageTitle('Accessibility Support');
  const homeQuery = useQuery({ queryKey: ['home'], queryFn: api.home });
  const atBrowsersQuery = useQuery({ queryKey: ['at-browsers'], queryFn: api.atBrowsers });

  const {
    query,
    setQuery,
    filteredItems,
    summaryText,
    politeMessage,
    assertiveMessage,
    resultsHeadingRef,
    onSubmit,
  } = useFeatureSearch(homeQuery.data ?? [], (feature) => feature.keywords_string, homeQuery.isSuccess);

  if (homeQuery.isPending || atBrowsersQuery.isPending) return <LoadingStatus />;
  if (homeQuery.isError) return <RouteErrorBoundary error={homeQuery.error} />;
  if (atBrowsersQuery.isError) return <RouteErrorBoundary error={atBrowsersQuery.error} />;

  const atBrowsers = atBrowsersQuery.data;

  return (
    <div className="content">
      <div className="call-out">
        <p>
          This a community driven effort. Please <Link to="/run-tests">run some tests</Link> to help keep this
          project going and to learn about assistive technologies along the way.
        </p>
      </div>
      <div className="search-container">
        <h1>Features</h1>
        <SearchLiveRegion politeMessage={politeMessage} assertiveMessage={assertiveMessage} />
        <SearchForm
          query={query}
          onQueryChange={setQuery}
          onSubmit={onSubmit}
          label='Find support for a feature (search by element or attribute, for example "aria")'
          description="Features will be filtered as you type"
        />
        <div className="search-results">
          <h2 id="features" tabIndex={-1} ref={resultsHeadingRef as React.RefObject<HTMLHeadingElement>}>
            Results
          </h2>
          <div className="summary-container">
            <span>{summaryText}</span>
          </div>
          {filteredItems.map((feature, index) => (
            <FeatureResult key={`${feature.techId}/${feature.id}`} feature={feature} index={index} atBrowsers={atBrowsers} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureResult({ feature, index, atBrowsers }: { feature: HomeFeature; index: number; atBrowsers: ATBrowsers }) {
  // Computed up front (not mutated during the render below) so the JSX stays a pure function of
  // props — the original template accumulated this flag imperatively while looping (index.pug's
  // `- let onlyNegativeSupportFound = false` mutated inside the each-loop), which doesn't
  // translate to an idiomatic or lint-clean React render.
  //
  // Scoped to only the AT types this feature actually renders a table for (`supports_at` +
  // `core_support[type].length`, the same gate the JSX below uses): `onlyNegativeSupport` is
  // computed unconditionally for every core AT during the build (src/build/negative-support.ts),
  // so checking every entry in `core_support_by_at_browser` regardless of that gate could flag
  // an AT type whose table index.pug would never have rendered in the first place.
  const renderedAtIds = atBrowsers.core_at.filter((at) => {
    const type = atBrowsers.at[at]!.type;
    return feature.supports_at.includes(type) && (feature.core_support[type]?.length ?? 0) > 0;
  });
  const onlyNegativeSupportFound = renderedAtIds.some((at) =>
    Object.values(feature.core_support_by_at_browser[at] ?? {}).some((cell) => cell.onlyNegativeSupport)
  );

  return (
    <div data-keywords={feature.keywords_string} className="result">
      <h3 id={`feature-${index}`}>
        <Link to={`/tech/${feature.techId}/${feature.id}`}>
          {feature.title} ({feature.techId})
        </Link>
      </h3>
      {feature.possible_backend_expectations && (
        <div className="caution">
          <p>
            Important: The {feature.title} has expectations that are not directly testable by end users. Continue
            to use it if it is required by the specification, even if user-facing expectation support is poor.
            For more information, see{' '}
            <a href="/faq#what-about-expectations-that-are-not-directly-testable-by-users%3F">
              FAQ: What about expectations that are not directly testable by users?
            </a>
            .
          </p>
        </div>
      )}
      {feature.assertions.length === 0 || feature.total_test_count === 0 ? (
        <p>We do not currently have any data on this feature. Please help contribute.</p>
      ) : (
        <>
          {AT_TYPES.map(
            (atType) =>
              feature.supports_at.includes(atType.type) &&
              feature.core_support[atType.type]?.length > 0 && (
                <ResponsiveTable key={atType.type} className="support-summary-table at-container">
                  <h4 id={`feature-${index}-${atType.type}-h`}>{atType.title} support</h4>
                  <div className="expectation-summary">
                    <span>Expectation support:</span>
                    <ul>
                      {feature.core_must_support_string[atType.type]?.string && (
                        <li className={feature.core_must_support_string[atType.type].class}>
                          MUST: {feature.core_must_support_string[atType.type].string}
                        </li>
                      )}
                      {feature.core_should_support_string[atType.type]?.string && (
                        <li className={feature.core_should_support_string[atType.type].class}>
                          SHOULD: {feature.core_should_support_string[atType.type].string}
                        </li>
                      )}
                      {feature.core_may_support_string[atType.type]?.string && (
                        <li className={feature.core_may_support_string[atType.type].class}>
                          MAY: {feature.core_may_support_string[atType.type].string}
                        </li>
                      )}
                    </ul>
                  </div>
                  <table
                    aria-labelledby={`feature-${index} feature-${index}-${atType.type}-h feature-${index}-${atType.type}-cap`}
                  >
                    <caption id={`feature-${index}-${atType.type}-cap`}>Summary of &apos;MUST&apos; expectation support</caption>
                    <colgroup span={1} />
                    {atBrowsers.core_at
                      .filter((at) => atBrowsers.at[at]!.type === atType.type)
                      .map((at) => (
                        <colgroup key={at} span={atBrowsers.at[at]!.core_browsers.length} />
                      ))}
                    <thead>
                      <tr>
                        {atBrowsers.core_at
                          .filter((at) => atBrowsers.at[at]!.type === atType.type)
                          .map((at) => (
                            <th key={at} colSpan={atBrowsers.at[at]!.core_browsers.length} scope="colgroup">
                              {atBrowsers.at[at]!.title}
                            </th>
                          ))}
                      </tr>
                      <tr>
                        {atBrowsers.core_at
                          .filter((at) => atBrowsers.at[at]!.type === atType.type)
                          .flatMap((at) =>
                            atBrowsers.at[at]!.core_browsers.map((browser) => (
                              <th key={`${at}-${browser}`} scope="col">
                                {atBrowsers.browsers[browser]!.title}
                              </th>
                            ))
                          )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {atBrowsers.core_at
                          .filter((at) => atBrowsers.at[at]!.type === atType.type)
                          .flatMap((at) =>
                            atBrowsers.at[at]!.core_browsers.map((browser) => {
                              const cell = feature.core_support_by_at_browser[at]?.[browser];
                              if (cell?.onlyNegativeSupport) {
                                return (
                                  <td className="no" key={`${at}-${browser}`}>
                                    none**
                                  </td>
                                );
                              }
                              return (
                                cell && (
                                  <SupportCell key={`${at}-${browser}`} support={cell.string} />
                                )
                              );
                            })
                          )}
                      </tr>
                    </tbody>
                  </table>
                </ResponsiveTable>
              )
          )}
          {onlyNegativeSupportFound && (
            <p>
              ** Only support for expectations where the feature is not supposed to be exposed was found,
              suggesting that the feature is not supported at all.
            </p>
          )}
          <p>
            Supported by {feature.total_test_count} tests. Results range from {moment(feature.all_dates.max).fromNow()}{' '}
            to {moment(feature.all_dates.min).fromNow()}.{' '}
            {feature.failing_dates.max && moment().diff(feature.failing_dates.max, 'months') >= 9
              ? 'Caution: failing or partial results may be out of date. Consider contributing results.'
              : ''}
          </p>
          <details>
            <summary>
              <h4>Test and version details</h4>
            </summary>
            {feature.allTests.map((test) => (
              <div key={test.id}>
                <h5>
                  <Link to={`/tests/${makeSafe(test.id)}`}>Test: {test.title}</Link>
                </h5>
                <ul>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {Object.entries(test.versions as any).flatMap(([atId, at]: [string, any]) =>
                    Object.entries(at.browsers).map(([browserId, browser]: [string, any]) => (
                      <li key={`${atId}-${browserId}`}>
                        {at.title} {browser.at_version} with {browser.title} {browser.browser_version}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))}
          </details>
        </>
      )}
    </div>
  );
}
