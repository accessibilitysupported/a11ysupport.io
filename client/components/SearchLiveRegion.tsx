/**
 * T061 (part): the two separate live regions from search.js:52-66 — one polite (routine result
 * counts), one assertive ("no results"). Kept as visible strings in React state rather than
 * imperative innerHTML writes, but the same 2000ms clear-after-announce timing (search.js:63-65)
 * is preserved so the wording doesn't linger and get re-read on the next interaction.
 */
import { useEffect, useRef, useState } from 'react';

export function useLiveAnnouncement() {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const timers = useRef<{ polite?: number; assertive?: number }>({});

  const announce = (message: string, assertive: boolean) => {
    const setMessage = assertive ? setAssertiveMessage : setPoliteMessage;
    const key = assertive ? 'assertive' : 'polite';
    setMessage(message);
    window.clearTimeout(timers.current[key]);
    timers.current[key] = window.setTimeout(() => setMessage(''), 2000);
  };

  useEffect(
    () => () => {
      window.clearTimeout(timers.current.polite);
      window.clearTimeout(timers.current.assertive);
    },
    []
  );

  return { politeMessage, assertiveMessage, announce };
}

interface Props {
  politeMessage: string;
  assertiveMessage: string;
}

export function SearchLiveRegion({ politeMessage, assertiveMessage }: Props) {
  return (
    <>
      <div className="live-announcements-polite visually-hidden" aria-live="polite">
        {politeMessage}
      </div>
      <div className="live-announcements-assertive visually-hidden" aria-live="assertive">
        {assertiveMessage}
      </div>
    </>
  );
}
