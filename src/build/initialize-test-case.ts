/**
 * T027: orchestrates the test-case/*.ts modules split from helper.initalizeTestCase
 * (feature-helper.js:661-1270). This file carries the two setup blocks that don't warrant their
 * own module (assertion-defaults init, feature-helper.js:667-711; sort + support-property init,
 * feature-helper.js:866-916) plus the sequencing itself.
 */
import moment from 'moment';
import type { ATBrowsers } from '../types/at-browsers';
import { sortByProperty } from './sort';
import { computeVersionDates } from './test-case/versions';
import { processCommands } from './test-case/commands';
import { computeAssertionResults } from './test-case/results';

export function initalizeTestCase(
  atBrowsers: ATBrowsers,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testCase: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadFeature: (featureId: string) => any,
  now: moment.Moment
): void {
  // transform the commands object to the assertions array
  if (!testCase.assertions) {
    testCase.assertions = [];
  }

  testCase.all_dates = {
    all: [],
    min: null,
    max: null,
  };

  testCase.failing_dates = {
    all: [],
    min: null,
    max: null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testCase.assertions.forEach((assertion: any) => {
    if (!assertion.applied_to) {
      assertion.applied_to = null;
    }

    if (!assertion.references) {
      assertion.references = [];
    }

    if (!assertion.results) {
      assertion.results = {};
    }

    if (!assertion.all_dates) {
      assertion.all_dates = {
        all: [],
        min: null,
        max: null,
      };
    }

    if (!assertion.failing_dates) {
      assertion.failing_dates = {
        all: [],
        min: null,
        max: null,
      };
    }
  });

  computeVersionDates(atBrowsers, testCase);
  processCommands(atBrowsers, testCase);

  const sortStrengthMap: Record<string, string> = {
    convey_name: '0',
    convey_role: '1',
    convey_value: '2',
    convey_change_in_value: '3',
    convey_state: '4',
    convey_change_in_state: '5',
    convey_property: '6',
  };

  const generateSortString = function (assertion_id: string): string {
    let string = '';
    if (sortStrengthMap[assertion_id]) {
      string = sortStrengthMap[assertion_id];
    }

    return string + assertion_id;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testCase.assertions.sort(function (x: any, y: any) {
    const x_id = x.feature_id + '.' + generateSortString(x.feature_assertion_id);
    const y_id = y.feature_id + '.' + generateSortString(y.feature_assertion_id);
    return x_id === y_id ? 0 : x_id > y_id ? 1 : -1;
  });

  // Set support properties
  testCase.core_support = {};
  testCase.core_support_string = {};
  testCase.extended_support = {};
  testCase.extended_support_string = {};
  testCase.core_must_support = {};
  testCase.core_must_support_string = {};
  testCase.core_should_support = {};
  testCase.core_should_support_string = {};
  testCase.core_may_support = {};
  testCase.core_may_support_string = {};
  atBrowsers.types.forEach((type) => {
    testCase.core_support[type] = [];
    testCase.core_support_string[type] = 'unknown';
    testCase.extended_support[type] = [];
    testCase.extended_support_string[type] = 'unknown';
    testCase.core_must_support[type] = [];
    testCase.core_must_support_string[type] = 'unknown';
    testCase.core_should_support[type] = [];
    testCase.core_should_support_string[type] = 'unknown';
    testCase.core_may_support[type] = [];
    testCase.core_may_support_string[type] = 'unknown';
  });

  testCase.history = testCase.history.sort(sortByProperty('date'));

  computeAssertionResults(atBrowsers, testCase, loadFeature, now);
}
