/**
 * T075: port of static-page.pug, covering /faq, /contribute, /learn, /learn/vc_differences.
 * The slug is passed explicitly per route (routes.tsx) rather than read from a URL param, since
 * these four paths don't share a `:page`-shaped URL structure.
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import { MarkdownContent } from '../components/MarkdownContent';

interface Props {
  slug: 'faq' | 'contribute' | 'learn' | 'vc_differences';
}

export function StaticPage({ slug }: Props) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['content', slug],
    queryFn: () => api.content(slug),
  });

  usePageTitle(data?.title ?? 'Accessibility Support');

  if (isPending) return <LoadingStatus />;
  if (isError) return <RouteErrorBoundary error={error} />;

  return (
    <div className="content">
      <MarkdownContent html={data.html} />
    </div>
  );
}
