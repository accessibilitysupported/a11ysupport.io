/**
 * T026 (part): port of feature-helper.js:713-735 — the test-level `all_dates` computed from
 * core-combination version dates, verbatim.
 */
import type { ATBrowsers } from '../../types/at-browsers';
import { isCoreCombination } from '../array-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function computeVersionDates(atBrowsers: ATBrowsers, testCase: any): void {
  for (const at in atBrowsers.at) {
    if (!testCase.versions[at]) {
      continue;
    }

    if (!testCase.versions[at].browsers) {
      continue;
    }

    const validBrowsers = atBrowsers.at[at]!.core_browsers.concat(atBrowsers.at[at]!.extended_browsers);
    validBrowsers.forEach((browser) => {
      if (!testCase.versions[at].browsers[browser]) {
        return;
      }
      if (!testCase.versions[at].browsers[browser].date) {
        return;
      }

      if (isCoreCombination(atBrowsers, at, browser)) {
        testCase.all_dates.all.push(new Date(testCase.versions[at].browsers[browser].date).getTime());
      }
    });
  }
}
