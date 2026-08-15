/**
 * T053: a failed data fetch has no analogue in the old Pug app (a 500 rendered error.pug
 * server-side). Matches error.pug's heading structure, with `role="alert"` since this is a
 * status change assistive technology should hear about immediately.
 */
interface Props {
  error: unknown;
}

export function RouteErrorBoundary({ error }: Props) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';

  return (
    <div className="content" role="alert">
      <h1>{message}</h1>
    </div>
  );
}
