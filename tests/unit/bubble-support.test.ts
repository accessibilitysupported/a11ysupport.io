/**
 * T092: unit test for src/build/bubble-support.ts's bubbleFeatureSupport — the core grading
 * algorithm, previously 0% covered (Phase 2 relied entirely on Gate 1's byte-identical build
 * diff, run against all 189 real feature files, for verification). This exercises one minimal,
 * realistic feature/test pair end to end so the aggregation logic itself has direct coverage.
 */
import { describe, it, expect } from 'vitest';
import { bubbleFeatureSupport } from '../../src/build/bubble-support';
import { initalizeFeatureObject } from '../../src/build/initialize-feature';
import type { ATBrowsers } from '../../src/types/at-browsers';

const atBrowsers = {
  types: ['sr'],
  core_at: ['jaws'],
  extended_at: [],
  at: {
    jaws: { type: 'sr', core_browsers: ['chrome'], extended_browsers: [] },
  },
} as unknown as ATBrowsers;

function buildFeature() {
  // "test_assertion" (not e.g. "convey_name") deliberately avoids initalizeFeatureObject's
  // known-assertion-id default-injection switch, so this fixture's fields aren't shadowed by
  // unrelated defaults from a feature unrelated to what bubbleFeatureSupport itself does.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const feature: any = {
    tests: ['button-test-ref'],
    assertions: [
      {
        id: 'test_assertion',
        strength: { sr: 'MUST' },
        operation_modes: ['sr_convey'],
        pass_strategy: 'all',
      },
    ],
  };
  initalizeFeatureObject(atBrowsers, feature, 'html', 'html/button');
  return feature;
}

function buildTest(support: 'y' | 'n' | 'p' | 'u', someSupportBehindSettings = false) {
  return {
    id: 'button-test',
    title: 'Basic button test',
    core_support_string: { sr: { class: 'ye', string: 'yes' } },
    assertions: [
      {
        feature_id: 'html/button',
        feature_assertion_id: 'test_assertion',
        all_dates: { all: [20260101] },
        failing_dates: { all: support === 'y' ? [] : [20260101] },
        core_support_by_at_browser: { jaws: { chrome: { values: [support], string: { class: 'x', string: 'x' } } } },
        results: {
          jaws: { browsers: { chrome: { support, some_support_behind_settings: someSupportBehindSettings } } },
        },
      },
    ],
  };
}

describe('bubbleFeatureSupport', () => {
  it('bubbles a single passing test up to full support at every level', () => {
    const feature = buildFeature();
    const test = buildTest('y');
    bubbleFeatureSupport(atBrowsers, feature, () => test);

    expect(feature.core_support_string.sr).toEqual({ class: 'ye', string: 'supported' });
    // core_support_by_at[at].values is pre-seeded with 'u' before any real result is pushed
    // (bubble-support.ts's top-of-function initialization) — that seed is never removed.
    expect(feature.core_support_by_at.jaws.values).toEqual(['u', 'y']);
    expect(feature.core_support_by_at_browser.jaws.chrome.values).toEqual(['y']);
    expect(feature.core_must_support_string.sr).toEqual({ class: 'ye', string: 'supported' });
    expect(feature.supports_at).toEqual(['sr']);
    expect(feature.assertions[0].tests).toHaveLength(1);
    expect(feature.assertions[0].tests[0].id).toBe('button-test');
  });

  it('bubbles a failing test up to no support', () => {
    const feature = buildFeature();
    const test = buildTest('n');
    bubbleFeatureSupport(atBrowsers, feature, () => test);

    expect(feature.core_support_string.sr).toEqual({ class: 'no', string: 'none' });
    expect(feature.core_must_support_string.sr).toEqual({ class: 'no', string: 'none' });
  });

  it('propagates some_support_behind_settings up to the feature/assertion levels', () => {
    const feature = buildFeature();
    const test = buildTest('y', true);
    bubbleFeatureSupport(atBrowsers, feature, () => test);

    expect(feature.core_support_by_at_browser.jaws.chrome.some_support_behind_settings).toBe(true);
    expect(feature.assertions[0].core_support_by_at_browser.jaws.chrome.some_support_behind_settings).toBe(true);
  });

  it('skips DRAFT tests entirely (no bubbling, feature stays unknown)', () => {
    const feature = buildFeature();
    const draftTest = { ...buildTest('y'), status: 'DRAFT' };
    bubbleFeatureSupport(atBrowsers, feature, () => draftTest);

    expect(feature.core_support_string.sr).toEqual({ class: 'un', string: 'unknown' });
    expect(feature.assertions[0].tests).toHaveLength(0);
  });

  it('sets must/should/may support strings to "not applicable" for AT types the feature does not support', () => {
    const twoTypeAtBrowsers = {
      types: ['sr', 'vc'],
      core_at: ['jaws'],
      extended_at: [],
      at: { jaws: { type: 'sr', core_browsers: ['chrome'], extended_browsers: [] } },
    } as unknown as ATBrowsers;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const feature: any = {
      tests: ['button-test-ref'],
      assertions: [
        { id: 'test_assertion', strength: { sr: 'MUST', vc: 'MUST' }, operation_modes: ['sr_convey'], pass_strategy: 'all' },
      ],
    };
    initalizeFeatureObject(twoTypeAtBrowsers, feature, 'html', 'html/button');
    const test = buildTest('y');
    bubbleFeatureSupport(twoTypeAtBrowsers, feature, () => test);

    expect(feature.supports_at).toEqual(['sr']);
    expect(feature.core_must_support_string.vc).toEqual({ class: 'na', string: 'not applicable' });
  });
});
