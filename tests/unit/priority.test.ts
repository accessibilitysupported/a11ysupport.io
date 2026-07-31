/**
 * T094: unit tests for src/build/test-case/priority.ts's computePriority, previously 0%
 * covered. Uses a pinned `now` so every band is deterministic, and exercises the fixed
 * corrected-defect #10 field (`versions[at].browsers[browser].date`, not the always-undefined
 * `results[at].browsers[browser].date`).
 */
import { describe, it, expect } from 'vitest';
import moment from 'moment';
import { computePriority } from '../../src/build/test-case/priority';
import type { ATBrowsers } from '../../src/types/at-browsers';

const NOW = moment('2026-07-30T00:00:00Z');

const atBrowsers = {
  core_at: ['jaws'],
  at: {
    jaws: { core_browsers: ['chrome'] },
    dragon: { core_browsers: ['chrome'] },
  },
} as unknown as ATBrowsers;

function testCase(daysAgo: number) {
  return {
    type: 'internal',
    versions: {
      jaws: { browsers: { chrome: { date: NOW.clone().subtract(daysAgo, 'days').format('YYYY-MM-DD') } } },
    },
  };
}

describe('computePriority (core AT/browser)', () => {
  it('external tests are never prioritized, regardless of support', () => {
    expect(computePriority(atBrowsers, { type: 'external' }, 0, 'jaws', 'chrome', 'u', NOW)).toBeNull();
    expect(computePriority(atBrowsers, { type: 'external' }, 0, 'jaws', 'chrome', 'y', NOW)).toBeNull();
  });

  it('unknown support is always top priority (0)', () => {
    expect(computePriority(atBrowsers, testCase(0), 0, 'jaws', 'chrome', 'u', NOW)).toBe(0);
  });

  it('failing/partial support stays priority 2 under the 6-day staleness threshold', () => {
    expect(computePriority(atBrowsers, testCase(5), 0, 'jaws', 'chrome', 'n', NOW)).toBe(2);
    expect(computePriority(atBrowsers, testCase(5), 0, 'jaws', 'chrome', 'p', NOW)).toBe(2);
  });

  it('failing/partial support escalates to priority 1 at 6+ days stale', () => {
    expect(computePriority(atBrowsers, testCase(6), 0, 'jaws', 'chrome', 'n', NOW)).toBe(1);
    expect(computePriority(atBrowsers, testCase(30), 0, 'jaws', 'chrome', 'p', NOW)).toBe(1);
  });

  it('passing support stays priority 4 under the 12-day staleness threshold', () => {
    expect(computePriority(atBrowsers, testCase(11), 0, 'jaws', 'chrome', 'y', NOW)).toBe(4);
  });

  it('passing support escalates to priority 3 at 12+ days stale', () => {
    expect(computePriority(atBrowsers, testCase(12), 0, 'jaws', 'chrome', 'y', NOW)).toBe(3);
    expect(computePriority(atBrowsers, testCase(400), 0, 'jaws', 'chrome', 'y', NOW)).toBe(3);
  });

  it('na support needs no manual testing (null)', () => {
    expect(computePriority(atBrowsers, testCase(0), 0, 'jaws', 'chrome', 'na', NOW)).toBeNull();
  });

  it('reads the date from versions[at].browsers[browser], not results (corrected-defect #10)', () => {
    // A testCase with no `results` field at all must still compute staleness correctly —
    // proves the fix isn't accidentally reading through `results` and getting undefined.
    const tc = testCase(6);
    expect('results' in tc).toBe(false);
    expect(computePriority(atBrowsers, tc, 0, 'jaws', 'chrome', 'n', NOW)).toBe(1);
  });
});

describe('computePriority (extended AT/browser)', () => {
  const extendedCase = { type: 'internal', versions: {} };

  it('unknown support is priority 5', () => {
    expect(computePriority(atBrowsers, extendedCase, 0, 'dragon', 'chrome', 'u', NOW)).toBe(5);
  });

  it('failing/partial support is priority 6, with no staleness escalation', () => {
    expect(computePriority(atBrowsers, extendedCase, 0, 'dragon', 'chrome', 'n', NOW)).toBe(6);
    expect(computePriority(atBrowsers, extendedCase, 0, 'dragon', 'chrome', 'p', NOW)).toBe(6);
  });

  it('passing support is priority 7, with no staleness escalation', () => {
    expect(computePriority(atBrowsers, extendedCase, 0, 'dragon', 'chrome', 'y', NOW)).toBe(7);
  });

  it('na support needs no manual testing (null)', () => {
    expect(computePriority(atBrowsers, extendedCase, 0, 'dragon', 'chrome', 'na', NOW)).toBeNull();
  });
});
