/**
 * T076: port of error.pug and used by both RouteErrorBoundary and the SPA-fallback 404 case.
 */
import { usePageTitle } from '../lib/usePageTitle';

interface Props {
  message?: string;
  status?: number;
}

export function ErrorPage({ message = 'Not Found', status = 404 }: Props) {
  usePageTitle(`Error | Accessibility Support`);

  return (
    <div className="content" role="alert">
      <h1>{message}</h1>
      <h2>{status}</h2>
    </div>
  );
}
