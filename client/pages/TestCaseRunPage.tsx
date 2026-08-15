/**
 * T068: port of test-case-run.pug. Fixes corrected-defect #2 (`test.core_support_string.class`
 * read today — same AT-type-keyed shape bug as defect #1 — renders blank; the original test-run
 * banner has always been broken since it never picked an AT type) and corrected-defect #6 (the
 * instructions reference a test-page "iframe" that doesn't exist anywhere in the product;
 * corrected to describe the actual flow of opening the test page directly, per spec.md's
 * Accessibility Requirements item 6 — adding a new iframe would itself be a UI change).
 */
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { ErrorPage } from './ErrorPage';
import { RunTestForm } from '../features/run-test/RunTestForm';
import { makeSafe } from '../../src/lib/test-id-helper';

export function TestCaseRunPage() {
  const { testId } = useParams();
  const safeTestId = testId!;

  const testQuery = useQuery({ queryKey: ['test-run', safeTestId], queryFn: () => api.testRun(safeTestId) });
  const atBrowsersQuery = useQuery({ queryKey: ['at-browsers'], queryFn: api.atBrowsers });

  usePageTitle(`Test: ${testQuery.data?.test?.title ?? ''} | Accessibility Support`);

  if (testQuery.isPending || atBrowsersQuery.isPending) return <LoadingStatus />;
  if (testQuery.isError) return <ErrorPage message={(testQuery.error as Error).message} />;
  if (atBrowsersQuery.isError) return <ErrorPage message={(atBrowsersQuery.error as Error).message} />;

  const { test, devTest, features } = testQuery.data;
  const atBrowsers = atBrowsersQuery.data;

  return (
    <div className="content-wrapper">
      <div className="content">
        <h1>Run Test: {test.title}</h1>
        {/* Fixes corrected-defect #2: core_support_string is keyed by AT type (sr/vc/kb), not a
            single {class,string} pair — show both, matching the pattern used everywhere else
            this field is read correctly (index.pug, feature.pug). */}
        <div className={`current-support-container ${test.core_support_string.sr.class}`}>
          <p>Screen Reader support level: {test.core_support_string.sr.string}</p>
        </div>
        <div className={`current-support-container ${test.core_support_string.vc.class}`}>
          <p>Voice Control support level: {test.core_support_string.vc.string}</p>
        </div>

        <p dangerouslySetInnerHTML={{ __html: test.descriptionInlineHtml }} />

        <Link to={`/tests/${makeSafe(test.id)}`}>Go back to the test details page</Link>

        <RunTestForm atBrowsers={atBrowsers} test={test} devTest={devTest} />
      </div>

      <div className="sidebar">
        <h2>Related Features</h2>
        <p>This test is found in the following features:</p>
        <ul>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {features.map((featureInfo: any) => (
            <li key={featureInfo.featureId}>
              <Link to={`/tech/${featureInfo.featureId}`}>{featureInfo.title}</Link>
            </li>
          ))}
        </ul>

        <h2>Is something not right?</h2>
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
      </div>
    </div>
  );
}
