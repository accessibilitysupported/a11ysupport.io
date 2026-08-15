/**
 * Ported from feature-helper.js:19-23,25-39,41-49. The original monkey-patches
 * `Array.prototype.unique`/`Array.prototype.occurenceCount` and defines `isCoreCombination` as a
 * module-level closure — ported here as plain functions instead of prototype pollution (every
 * call site is updated from `arr.unique()` to `unique(arr)` accordingly). Behavior is identical.
 */
import type { ATBrowsers } from '../types/at-browsers';

export function unique<T>(arr: T[]): T[] {
  return arr.filter((elem, pos) => arr.indexOf(elem) === pos);
}

export function occurenceCount<T>(arr: T[], what: T): number {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === what) {
      count++;
    }
  }
  return count;
}

export function isCoreCombination(atBrowsers: ATBrowsers, at: string, browser: string): boolean {
  if (!atBrowsers.core_at.includes(at)) {
    return false;
  }

  if (!atBrowsers.at[at]) {
    return false;
  }

  if (atBrowsers.at[at].core_browsers.includes(browser)) {
    return true;
  }

  return false;
}
