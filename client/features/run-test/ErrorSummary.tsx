/**
 * T069 (part): port of feature-test.js's validate() error summary (:140-193) — a focusable,
 * itemized list of links to each invalid field.
 */
import { useEffect, useRef } from 'react';

export interface FieldError {
  href: string;
  message: string;
}

interface Props {
  errors: FieldError[];
}

export function ErrorSummary({ errors }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.length > 0) {
      containerRef.current?.focus();
    }
  }, [errors]);

  if (errors.length === 0) {
    return <div id="error_container" />;
  }

  return (
    <div id="error_container" tabIndex={-1} ref={containerRef}>
      <h2>Error</h2>
      <ul>
        {errors.map((error, i) => (
          <li key={i}>
            <a href={error.href}>{error.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
