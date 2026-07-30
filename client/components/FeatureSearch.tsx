/**
 * T061: port of public/js/search.js. Filtering happens via React state instead of toggling the
 * `hidden` attribute imperatively, but every observable behavior is preserved: the transition-
 * based announcement logic (announce only when going from some-results to zero, or zero to
 * some — never on every keystroke, "so as to not make the screen reader output too verbose",
 * search.js's own comment), the exact wording, the 2000ms clear, form-submit moving focus to the
 * results heading, and the summary text format.
 *
 * Also fixes corrected-defect #3: tests.pug declared a single `.live-announcements` div while
 * search.js looked for the split `-polite`/`-assertive` pair, so announcements were silently
 * dead on /tests. Both callers now share this one implementation.
 */
import { useEffect, useRef, useState } from 'react';
import { useLiveAnnouncement, SearchLiveRegion } from './SearchLiveRegion';

export function useFeatureSearch<T>(items: T[], getKeywords: (item: T) => string, isReady: boolean) {
  const [query, setQuery] = useState('');
  const { politeMessage, assertiveMessage, announce } = useLiveAnnouncement();
  // null until the query's real data has actually arrived. The original search.js only ever ran
  // against a fully-loaded page (no loading phase existed), so its `lastResultsLength = 1`
  // sentinel just needed to be non-zero. Here, `items` is `[]` while the query is pending —
  // gating on `isReady` (not just item count) is what stops both the pending->loaded transition
  // AND the initial empty-placeholder count from ever being treated as a real change: the first
  // render where `isReady` is true establishes the baseline silently, matching the original's
  // actual intent (announce only on genuine user-driven changes, never on page load).
  const lastResultsLength = useRef<number | null>(null);
  // Generic HTMLElement: index.pug focuses an `<h2>` on submit, tests.pug focuses a
  // `<div tabindex="-1">` — both are just "the focusable results-summary element" to this hook.
  const resultsHeadingRef = useRef<HTMLElement>(null);

  const filteredItems = query
    ? items.filter((item) => getKeywords(item).toLowerCase().includes(query.toLowerCase()))
    : items;

  useEffect(() => {
    if (!isReady) return;

    const count = filteredItems.length;

    if (lastResultsLength.current === null) {
      lastResultsLength.current = count;
      return;
    }

    if (count === 0) {
      const message = 'Sorry, no results could be found.';
      if (lastResultsLength.current > 0) {
        announce(message, true);
      }
      lastResultsLength.current = count;
      return;
    }

    if (lastResultsLength.current === 0 && count > 0) {
      announce('results found', false);
    }
    lastResultsLength.current = count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems.length, isReady]);

  const summaryText =
    filteredItems.length === 0
      ? 'Sorry, no results could be found.'
      : query
        ? `${filteredItems.length} results found for ${query}`
        : `${filteredItems.length} results found`;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resultsHeadingRef.current?.focus();
  };

  return {
    query,
    setQuery,
    filteredItems,
    summaryText,
    politeMessage,
    assertiveMessage,
    resultsHeadingRef,
    onSubmit,
  };
}

interface SearchFormProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  label: string;
  description?: string;
  /** tests.pug has a visible Search button; index.pug does not (filters as-you-type only). */
  showSubmitButton?: boolean;
}

export function SearchForm({ query, onQueryChange, onSubmit, label, description, showSubmitButton }: SearchFormProps) {
  return (
    <div className="search-controls">
      <form onSubmit={onSubmit}>
        <div className="input">
          <label htmlFor="feature-search">{label}</label>
          <input
            id="feature-search"
            type="text"
            className="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-describedby={description ? 'feature-search-description' : undefined}
          />
          {description && <p id="feature-search-description">{description}</p>}
        </div>
        {showSubmitButton && (
          <div className="submit">
            <button type="submit">Search</button>
          </div>
        )}
      </form>
    </div>
  );
}

export { SearchLiveRegion };
