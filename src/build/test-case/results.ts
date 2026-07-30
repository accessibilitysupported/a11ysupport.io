/**
 * T026 (part): port of feature-helper.js:918-1269 — resolves each assertion against its
 * referenced Feature Assertion, computes per-AT/browser support, and bubbles it up into the
 * assertion's and test's core/extended/must/should/may support arrays. Verbatim except:
 *  - `.unique()` -> plain function call (array-utils.ts)
 *  - `require('../data/tech/'+id+'.json')` -> injected `loadFeature` callback
 *  - the priority-escalation sub-block (originally inline, feature-helper.js:1180-1226) ->
 *    `computePriority` (priority.ts), which also fixes corrected-defect #11
 *  - `references_titles` — kept as a build-time-joined STRING (matches the original exactly, see
 *    corrected-defect #11's note on the client-side consumer not re-joining it)
 */
import moment from 'moment';
import type { ATBrowsers } from '../../types/at-browsers';
import { generateSupportString } from '../support-string';
import { unique } from '../array-utils';
import { computePriority } from './priority';

export function computeAssertionResults(
  atBrowsers: ATBrowsers,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testCase: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadFeature: (featureId: string) => any,
  now: moment.Moment
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testCase.assertions.forEach(function (assertion: any, assertion_key: number) {
    // Load the feature object so that we can reference linked assertions (use the data version
    // because the feature hasn't been built yet)
    const feature = loadFeature(assertion.feature_id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ref_assertion = feature.assertions.find((obj: any) => obj.id === assertion.feature_assertion_id);

    if (!ref_assertion) {
      console.log(testCase.id, assertion.feature_assertion_id);
    }

    // Look at what operations modes the assertion supports and set some helpful flags
    // We have to do this here because tests are built before features.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supports_by_at: any = {};
    atBrowsers.types.forEach((type) => {
      supports_by_at[type] = false;
    });
    testCase.assertions[assertion_key].supports_at = [];

    if (!ref_assertion.operation_modes) {
      console.log(feature, ref_assertion);
    }

    atBrowsers.types.forEach((type) => {
      const found = ref_assertion.operation_modes.findIndex((element: string) => element.startsWith(type));
      if (found > -1) {
        supports_by_at[type] = true;
        testCase.assertions[assertion_key].supports_at.push(type);
      }
    });

    let ref_applied_to_feature = null;
    if (assertion.applied_to) {
      ref_applied_to_feature = loadFeature(assertion.applied_to);
    }
    if (assertion.references) {
      testCase.assertions[assertion_key].references_titles = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assertion.references.forEach((ref: any) => {
        const ref_feature = loadFeature(ref);
        testCase.assertions[assertion_key].references_titles.push(ref_feature.title);
      });
      testCase.assertions[assertion_key].references_titles =
        testCase.assertions[assertion_key].references_titles.join(', ');
    }

    testCase.assertions[assertion_key].feature_title = feature.title;
    testCase.assertions[assertion_key].applied_to_title = ref_applied_to_feature ? ref_applied_to_feature.title : null;
    testCase.assertions[assertion_key].assertion_title = ref_assertion.title;
    testCase.assertions[assertion_key].assertion_strength = ref_assertion.strength;
    testCase.assertions[assertion_key].assertion_notes = ref_assertion.notes;
    testCase.assertions[assertion_key].assertion_examples = ref_assertion.examples;

    testCase.assertions[assertion_key].core_support = {};
    testCase.assertions[assertion_key].core_support_string = {};
    testCase.assertions[assertion_key].extended_support = {};
    testCase.assertions[assertion_key].extended_support_string = {};

    atBrowsers.types.forEach((type) => {
      testCase.assertions[assertion_key].core_support[type] = [];
      testCase.assertions[assertion_key].core_support_string[type] = supports_by_at[type] ? 'unknown' : 'na';
      testCase.assertions[assertion_key].extended_support[type] = [];
      testCase.assertions[assertion_key].extended_support_string[type] = supports_by_at[type] ? 'unknown' : 'na';
    });

    testCase.assertions[assertion_key].core_support_by_at_browser = {};
    testCase.assertions[assertion_key].operation_modes = ref_assertion.operation_modes;

    testCase.assertions[assertion_key].rationale = '';
    if (ref_assertion.rationale) {
      testCase.assertions[assertion_key].assertion_rationale = ref_assertion.rationale;
    }
    if (ref_assertion.examples) {
      testCase.assertions[assertion_key].assertion_examples = ref_assertion.examples;
    }
    if (ref_assertion.pass_strategy) {
      testCase.assertions[assertion_key].pass_strategy = ref_assertion.pass_strategy;
    }

    if (!testCase.assertions[assertion_key].css_target) {
      // Use the referenced assertion's css target if it isn't overridden by the assertion link
      testCase.assertions[assertion_key].css_target = ref_assertion.css_target;
    }

    if (!testCase.assertions[assertion_key].results) {
      testCase.assertions[assertion_key].results = {};
    }

    // Add missing AT
    for (const at in atBrowsers.at) {
      // Add an empty versions array if we don't have any info on versions
      if (!Object.prototype.hasOwnProperty.call(testCase.assertions[assertion_key].results, at)) {
        testCase.assertions[assertion_key].results[at] = {
          browsers: {},
        };
      }

      // Set this ID so we can use it later with a `this` scope where `this` is the AT object
      testCase.assertions[assertion_key].results[at].id = at;
      testCase.assertions[assertion_key].results[at].core_support = [];
      testCase.assertions[assertion_key].results[at].core_support_string = 'unknown';
      testCase.assertions[assertion_key].results[at].extended_support = [];
      testCase.assertions[assertion_key].results[at].extended_support_string = 'unknown';
      testCase.assertions[assertion_key].core_support_by_at_browser[at] = {};

      const validBrowsers = atBrowsers.at[at]!.core_browsers.concat(atBrowsers.at[at]!.extended_browsers);
      validBrowsers.forEach(function (browser) {
        if (!testCase.assertions[assertion_key].results[at].browsers) {
          // Add the missing browser property
          testCase.assertions[assertion_key].results[at].browsers = {};
        }

        if (!testCase.assertions[assertion_key].results[at].browsers[browser]) {
          // Add an empty array to make future operations easier
          testCase.assertions[assertion_key].results[at].browsers[browser] = {
            support: 'u', // unknown support
            id: browser,
          };
        }

        testCase.assertions[assertion_key].core_support_by_at_browser[at][browser] = {
          string: null,
          values: [],
          some_support_behind_settings: false,
        };

        // copy over notes
        if (
          testCase.assertions[assertion_key].browserNotes &&
          testCase.assertions[assertion_key].browserNotes[at] &&
          testCase.assertions[assertion_key].browserNotes[at][browser]
        ) {
          testCase.assertions[assertion_key].results[at].browsers[browser].notes =
            testCase.assertions[assertion_key].browserNotes[at][browser];
        }

        // Auto set this to NA if the assertion link indicates that this AT is not applicable
        if (ref_assertion.exclude_at && ref_assertion.exclude_at[at]) {
          testCase.assertions[assertion_key].results[at].browsers[browser].support = 'na';
        }

        if (
          testCase.assertions[assertion_key].exclude_at &&
          testCase.assertions[assertion_key].exclude_at[at]
        ) {
          testCase.assertions[assertion_key].results[at].browsers[browser].support = 'na';
        }

        if (ref_assertion.exclude_browsers && ref_assertion.exclude_browsers[browser]) {
          testCase.assertions[assertion_key].results[at].browsers[browser].support = 'na';
        }

        if (
          testCase.assertions[assertion_key].exclude_browsers &&
          testCase.assertions[assertion_key].exclude_browsers[browser]
        ) {
          testCase.assertions[assertion_key].results[at].browsers[browser].support = 'na';
        }

        if (!supports_by_at[atBrowsers.at[at]!.type]) {
          // This test case does not support this type of AT
          testCase.assertions[assertion_key].results[at].browsers[browser].support = 'na';
        }

        if (testCase.assertions[assertion_key].results[at].browsers[browser].output) {
          // Set the support property based on the result of the output.
          let results: string[] = [];
          testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings = false;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          testCase.assertions[assertion_key].results[at].browsers[browser].output.forEach(function (output: any) {
            if (output.behind_setting) {
              testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings = true;
            }
            results.push(output.result);
          });

          // Reduce it to unique values
          results = unique(results);

          // unknown or n/a support by default
          if (testCase.assertions[assertion_key].supports_at.includes(atBrowsers.at[at]!.type)) {
            testCase.assertions[assertion_key].results[at].browsers[browser].support = 'unknown';
          } else {
            testCase.assertions[assertion_key].results[at].browsers[browser].support = 'na';
          }

          let pass_strategy = 'any';
          if (ref_assertion.pass_strategy) {
            pass_strategy = ref_assertion.pass_strategy;
          }

          if (pass_strategy === 'all') {
            // filter out "na" values so that they don't muddle 'y' results
            const filteredResults = results.filter(function (element) {
              return element !== 'na';
            });

            // 'all' strategy, all commands must pass for the assertion
            if (filteredResults.length === 1 && filteredResults.includes('pass')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'y';
            } else if (results.includes('pass')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'p';
            } else if (results.includes('partial')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'p';
            } else if (results.includes('fail')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'n';
            } else if (results.includes('na')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'na';
            } else if (results.includes('unknown')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'u';
            }
          } else {
            // 'any' strategy, a single pass for a command counts a pass for the assertion
            if (results.includes('pass')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'y';
            } else if (results.includes('partial')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'p';
            } else if (results.includes('fail')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'n';
            } else if (results.includes('na')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'na';
            } else if (results.includes('unknown')) {
              testCase.assertions[assertion_key].results[at].browsers[browser].support = 'u';
            }
          }
        }

        // Set associated IDs to help define the support point
        testCase.assertions[assertion_key].results[at].browsers[browser].id = browser;
        testCase.assertions[assertion_key].results[at].browsers[browser].testId = testCase.id;
        testCase.assertions[assertion_key].results[at].browsers[browser].ATId = at;
        testCase.assertions[assertion_key].results[at].browsers[browser].test_title = testCase.title;
        testCase.assertions[assertion_key].results[at].browsers[browser].support_string = generateSupportString(
          testCase.assertions[assertion_key].results[at].browsers[browser].support
        );

        // Set support arrays
        const support = testCase.assertions[assertion_key].results[at].browsers[browser].support;
        testCase.assertions[assertion_key].core_support_by_at_browser[at][browser].values.push(support);
        testCase.assertions[assertion_key].core_support_by_at_browser[at][browser].string = generateSupportString(
          testCase.assertions[assertion_key].core_support_by_at_browser[at][browser].values
        );
        if (testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings) {
          testCase.assertions[assertion_key].core_support_by_at_browser[at][browser].some_support_behind_settings =
            testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings;
        }

        if (atBrowsers.at[at]!.core_browsers.includes(browser)) {
          testCase.assertions[assertion_key].results[at].core_support.push(support);

          if (testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings) {
            testCase.assertions[assertion_key].results[at].some_support_behind_settings =
              testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings;
          }

          if (atBrowsers.core_at.includes(at)) {
            testCase.assertions[assertion_key].core_support[atBrowsers.at[at]!.type].push(support);
            if (
              ref_assertion.strength[atBrowsers.at[at]!.type] === 'MUST' ||
              ref_assertion.strength[atBrowsers.at[at]!.type] === 'MUST NOT'
            ) {
              testCase.core_support[atBrowsers.at[at]!.type].push(support);
            }

            if (testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings) {
              testCase.assertions[assertion_key].some_support_behind_settings =
                testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings;
            }
          } else {
            testCase.assertions[assertion_key].extended_support[atBrowsers.at[at]!.type].push(support);
            testCase.extended_support[atBrowsers.at[at]!.type].push(support);
          }
        } else if (atBrowsers.at[at]!.extended_browsers.includes(browser)) {
          testCase.assertions[assertion_key].results[at].extended_support.push(support);
          testCase.extended_support[atBrowsers.at[at]!.type].push(support);
        }

        // Set the priority for manual testing (feature-helper.js:1180-1226; see priority.ts for
        // corrected-defect #11)
        testCase.assertions[assertion_key].results[at].browsers[browser].priority = computePriority(
          atBrowsers,
          testCase,
          assertion_key,
          at,
          browser,
          support,
          now
        );
      });

      // Set support strings for the AT
      testCase.assertions[assertion_key].results[at].core_support_string = generateSupportString(
        testCase.assertions[assertion_key].results[at].core_support
      );
      testCase.assertions[assertion_key].results[at].extended_support_string = generateSupportString(
        testCase.assertions[assertion_key].results[at].extended_support
      );
    }

    atBrowsers.types.forEach((type) => {
      // Set support strings for the assertion
      testCase.assertions[assertion_key].core_support_string[type] = generateSupportString(
        testCase.assertions[assertion_key].core_support[type]
      );
      testCase.assertions[assertion_key].extended_support_string[type] = generateSupportString(
        testCase.assertions[assertion_key].extended_support[type]
      );

      // aggregate must/should/may core support
      if (ref_assertion.strength[type] === 'MUST' || ref_assertion.strength[type] === 'MUST NOT') {
        if (
          testCase.assertions[assertion_key].core_support[type] &&
          testCase.assertions[assertion_key].core_support[type].length
        ) {
          testCase.core_must_support[type] = testCase.core_must_support[type].concat(
            testCase.assertions[assertion_key].core_support[type]
          );
        }
        testCase.core_must_support_string[type] = generateSupportString(testCase.core_must_support[type]);
      } else if (ref_assertion.strength[type] === 'SHOULD') {
        if (
          testCase.assertions[assertion_key].core_support[type] &&
          testCase.assertions[assertion_key].core_support[type].length
        ) {
          testCase.core_should_support[type] = testCase.core_should_support[type].concat(
            testCase.assertions[assertion_key].core_support[type]
          );
        }
        testCase.core_should_support_string[type] = generateSupportString(testCase.core_should_support[type]);
      } else {
        if (
          testCase.assertions[assertion_key].core_support[type] &&
          testCase.assertions[assertion_key].core_support[type].length
        ) {
          testCase.core_may_support[type] = testCase.core_may_support[type].concat(
            testCase.assertions[assertion_key].core_support[type]
          );
        }
        testCase.core_may_support_string[type] = generateSupportString(testCase.core_may_support[type]);
      }
    });

    delete testCase.assertions[assertion_key].browserNotes;
  });

  // Set support strings for the test
  atBrowsers.types.forEach((type) => {
    testCase.core_support_string[type] = generateSupportString(testCase.core_support[type]);
    testCase.extended_support_string[type] = generateSupportString(testCase.extended_support[type]);
  });
}
