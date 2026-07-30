/**
 * T049: port of layout.pug:36-37, verbatim.
 */
export function BetaWarning() {
  return (
    <div className="beta-warning">
      <p>
        <strong>Important</strong>: This website does not attempt to establish a standard for how assistive
        technologies must behave. <a href="/faq">Read the FAQ for more information</a>. Additionally, this is a
        work in progress.{' '}
        <a href="https://github.com/accessibilitysupported/accessibilitysupported/issues/new">
          Please submit feedback or suggestions
        </a>
        .
      </p>
    </div>
  );
}
