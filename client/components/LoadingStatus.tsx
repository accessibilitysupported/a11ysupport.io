/**
 * T052: the one unavoidable new UI surface this migration adds (spec.md Assumptions) — content
 * no longer arrives complete on first paint, so something must indicate loading. Delayed 200ms
 * so fast responses never flash it; `role="status"` announces it once to assistive technology.
 */
import { useEffect, useState } from 'react';

export function LoadingStatus() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return <span role="status" className="visually-hidden" />;
  }

  return (
    <p role="status">
      Loading…
    </p>
  );
}
