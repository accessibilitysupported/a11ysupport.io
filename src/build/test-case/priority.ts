/**
 * T026 (part): port of feature-helper.js:1180-1226 — the manual-testing priority escalation.
 *
 * Fixes corrected-defect #11 (spec.md): the original reads
 * `results[at].browsers[browser].date`, a field that is never populated on any of the 24,080
 * recorded results (confirmed by direct inspection during Phase 0), so `moment(undefined)`
 * evaluates to "right now" and `diff` is always ~0 — the staleness escalation (priority 2->1,
 * 4->3) never fires. Fixed to read `testCase.versions[at].browsers[browser].date`, the field
 * that actually holds it. This is the one intentional exception to Gate 1's byte-identical
 * requirement (quickstart.md, Gate 1) — `priority` values are expected to change for stale
 * results, escalating only, never de-escalating.
 */
import moment from 'moment';
import type { ATBrowsers } from '../../types/at-browsers';

export function computePriority(
  atBrowsers: ATBrowsers,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testCase: any,
  assertion_key: number,
  at: string,
  browser: string,
  support: string,
  now: moment.Moment
): number | null {
  // Set the priority for manual testing
  if (testCase.type === 'external') {
    // External test, low or no priority. (no priority for now)
    return null;
  }

  // Internal tests, higher priority
  if (atBrowsers.core_at.includes(at) && atBrowsers.at[at]!.core_browsers.includes(browser)) {
    // core support
    if (support === 'u') {
      // Unknown core support is always top priority
      return 0;
    } else if (['n', 'p'].includes(support)) {
      const date = moment(testCase.versions[at].browsers[browser].date);
      const diff = now.diff(date, 'days');
      if (diff >= 6) {
        // Older tests should have a higher priority
        return 1;
      }
      return 2;
    } else if (support === 'y') {
      const date = moment(testCase.versions[at].browsers[browser].date);
      const diff = now.diff(date, 'days');
      if (diff >= 12) {
        // Older tests should have a higher priority
        return 3;
      }
      return 4;
    } else {
      // na (no need to test)
      return null;
    }
  } else {
    // extended support
    if (support === 'u') {
      return 5;
    } else if (['n', 'p'].includes(support)) {
      return 6;
    } else if (support === 'y') {
      return 7;
    } else {
      // na (no need to test)
      return null;
    }
  }
}
