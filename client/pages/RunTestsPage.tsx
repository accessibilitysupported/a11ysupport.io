/**
 * T071: port of run-tests.pug. Fixes corrected-defect #7: the original emits literal `</ul>`/
 * `<ul>` text to hand-balance list markup across a `case` statement, producing unbalanced HTML
 * whenever a priority band is empty. The API already pre-groups support points by priority
 * (src/build/emit-api-payloads.ts), so each band renders as one real, well-formed `<ul>` —
 * including bands with zero entries, which simply render nothing instead of a stray tag.
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import { makeSafe } from '../../src/lib/test-id-helper';

const PRIORITY_DESCRIPTIONS: Record<'0' | '1' | '2' | '3', string> = {
  '0': 'These are top priority and usually include combinations that have not been tested yet.',
  '1': 'These are failing tests that have not been re-tested in 6 months.',
  '2': 'These are failing tests that have been tested recently.',
  '3': 'These are passing tests that have not been re-tested in the last year',
};

export function RunTestsPage() {
  usePageTitle('Run Tests | Accessibility Support');
  const { data, isPending, isError, error } = useQuery({ queryKey: ['run-tests'], queryFn: api.runTests });

  if (isPending) return <LoadingStatus />;
  if (isError) return <RouteErrorBoundary error={error} />;

  return (
    <div className="content">
      <h1>Run Tests</h1>
      <p>
        The best thing thing that you can do to help this project is to run tests and report the results. The
        following are support points that need to be tested. The support points are ordered by priority, with
        the highest priority being zero. Lower priority tests are not currently listed to encourage a focus on
        higher priorities.
      </p>

      <h2>The testing process</h2>
      <ol>
        <li>Select a test combination from this page and follow the link. Please focus on higher priority tests first.</li>
        <li>Follow the instructions for the given test, assistive technology, and browser.</li>
        <li>Use the provided form in the test instructions to create a GitHub issue.</li>
        <li>This project will be updated with the new submission once your findings have been verified by another user.</li>
      </ol>

      <a href="https://github.com/accessibilitysupported/a11ysupport.io/labels/needs%20verification">
        View submissions that need verification on GitHub.
      </a>

      {(['0', '1', '2', '3'] as const).map(
        (priority) =>
          data[priority].length > 0 && (
            <div key={priority}>
              <h2>Priority {priority}</h2>
              <p>{PRIORITY_DESCRIPTIONS[priority]}</p>
              <ul>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data[priority].map((supportPoint: any, i: number) => (
                  <li key={i}>
                    <Link to={`/tests/${makeSafe(supportPoint.testId)}`}>
                      {supportPoint.test_title} with {supportPoint.ATId} and {supportPoint.id}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
      )}
    </div>
  );
}
