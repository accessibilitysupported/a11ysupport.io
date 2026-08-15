/**
 * T063: port of tech-index.pug, verbatim.
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';

export function TechIndexPage() {
  usePageTitle('Technologies | Accessibility Support');
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['tech-index'],
    queryFn: api.techIndex,
  });

  if (isPending) return <LoadingStatus />;
  if (isError) return <RouteErrorBoundary error={error} />;

  return (
    <div className="content">
      <h1>Technologies</h1>
      <p>Technologies represent different standards such as HTML, CSS, ARIA, and SVG. Each technology can have many features.</p>
      <ul>
        {data.map((technology) => (
          <li key={technology.id}>
            <Link to={`/tech/${technology.id}`}>{technology.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
