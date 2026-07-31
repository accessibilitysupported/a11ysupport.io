/**
 * T093: unit tests for src/build/negative-support.ts's checkForOnlyNegativeSupport, previously
 * 0% covered.
 */
import { describe, it, expect } from 'vitest';
import { checkForOnlyNegativeSupport } from '../../src/build/negative-support';
import type { ATBrowsers } from '../../src/types/at-browsers';

const atBrowsers = {
  at: {
    jaws: { core_browsers: ['chrome'] },
  },
} as unknown as ATBrowsers;

function featureWith(assertions: unknown[]) {
  return {
    assertions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    core_support_by_at_browser: { jaws: { chrome: {} as any } },
  };
}

describe('checkForOnlyNegativeSupport', () => {
  it('does nothing when no assertion is a same_as_no_support assertion', () => {
    const feature = featureWith([
      { same_as_no_support: false, core_support_by_at_browser: { jaws: { chrome: { values: ['y'] } } } },
    ]);
    checkForOnlyNegativeSupport(atBrowsers, feature);
    expect(feature.core_support_by_at_browser.jaws.chrome).not.toHaveProperty('onlyNegativeSupport');
  });

  it('flags onlyNegativeSupport when the only passing result is the negative-expectation assertion', () => {
    const feature = featureWith([
      { same_as_no_support: true, core_support_by_at_browser: { jaws: { chrome: { values: ['y'] } } } },
    ]);
    checkForOnlyNegativeSupport(atBrowsers, feature);
    expect(feature.core_support_by_at_browser.jaws.chrome.onlyNegativeSupport).toBe(true);
  });

  it('does not flag when a normal assertion also passes', () => {
    const feature = featureWith([
      { same_as_no_support: true, core_support_by_at_browser: { jaws: { chrome: { values: ['y'] } } } },
      { same_as_no_support: false, core_support_by_at_browser: { jaws: { chrome: { values: ['y'] } } } },
    ]);
    checkForOnlyNegativeSupport(atBrowsers, feature);
    expect(feature.core_support_by_at_browser.jaws.chrome.onlyNegativeSupport).toBe(false);
  });

  it('does not flag when the negative-expectation assertion does not pass', () => {
    const feature = featureWith([
      { same_as_no_support: true, core_support_by_at_browser: { jaws: { chrome: { values: ['n'] } } } },
    ]);
    checkForOnlyNegativeSupport(atBrowsers, feature);
    expect(feature.core_support_by_at_browser.jaws.chrome.onlyNegativeSupport).toBe(false);
  });
});
