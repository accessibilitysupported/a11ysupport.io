/**
 * T072: port of updates.pug, verbatim. The API already trims to the first 6 entries
 * (src/build/emit-api-payloads.ts), matching the original's `if (index > 5) break`.
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import { makeSafe } from '../../src/lib/test-id-helper';

export function UpdatesPage() {
  usePageTitle('Recent Updates | Accessibility Support');
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['updates'],
    queryFn: api.updates,
  });

  if (isPending) return <LoadingStatus />;
  if (isError) return <RouteErrorBoundary error={error} />;

  return (
    <div className="content">
      {/* updates.pug has no <h1> — a pre-existing gap (baseline/README.md's page-has-heading-one
          finding, not one of the 11 corrected defects), preserved rather than silently fixed. */}
      <ul>
        {data.map((update, index) => (
          <li key={index}>
            {update.date}{' '}
            <Link to={`/tests/${makeSafe(update.testID)}`}>{update.title}</Link>
            {' '}- {update.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
