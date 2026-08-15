/**
 * T023: port of helper.bubbleFeatureSupport (feature-helper.js:343-618), verbatim except
 * `.unique()` calls (none in this function) and the `require()` load of a test file at
 * feature-helper.js:372, which becomes an explicit `readTestFile` call injected by the caller
 * (src/build/index.ts) rather than reached into from here — this function no longer does its own
 * file I/O, matching load-data.ts's "no data loading via require()" rule.
 */
import type { ATBrowsers } from '../types/at-browsers';
import { generateSupportString } from './support-string';

export function bubbleFeatureSupport(
  atBrowsers: ATBrowsers,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  featureObject: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadTest: (testFileRef: string) => any
): void {
  for (let i = 0; i < atBrowsers.core_at.length; i++) {
    featureObject.core_support_by_at[atBrowsers.core_at[i]!] = {};
    featureObject.core_support_by_at[atBrowsers.core_at[i]!].values = ['u'];
    featureObject.core_support_by_at[atBrowsers.core_at[i]!].string = generateSupportString(['u']);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  featureObject.assertions.forEach((assertion: any, assertion_key: number) => {
    featureObject.assertions[assertion_key].tests = [];

    if (!assertion.pass_strategy) {
      featureObject.assertions[assertion_key].pass_strategy = 'all';
    }

    // Now set a flag for what types of AT this assertion applies to
    featureObject.assertions[assertion_key].supports_at = [];
    if (!featureObject.assertions[assertion_key].rationale) {
      featureObject.assertions[assertion_key].rationale = '';
    }

    atBrowsers.types.forEach((type) => {
      const found = assertion.operation_modes.findIndex((element: string) => element.startsWith(type));
      if (found > -1) {
        featureObject.assertions[assertion_key].supports_at.push(type);
      }
    });
  });

  for (let testIndex = 0; testIndex < featureObject.tests.length; testIndex++) {
    featureObject.tests[testIndex] = loadTest(featureObject.tests[testIndex]);

    if (featureObject.tests[testIndex].status && featureObject.tests[testIndex].status === 'DRAFT') {
      // This is a draft test, don't bubble support to the feature level.
      continue;
    }

    // Set up keywords to help searches
    if (featureObject.tests[testIndex].keywords) {
      featureObject.keywords = featureObject.keywords.concat(featureObject.tests[testIndex].keywords);
    }

    // Note: tests are be built before a feature is built so that bubbling works correctly
    // Detect support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    featureObject.tests[testIndex].assertions.forEach((assertion: any) => {
      if (featureObject.id !== assertion.feature_id) {
        return;
      }
      if (!assertion.all_dates) {
        console.log(assertion);
      }
      featureObject.all_dates.all = [...new Set(featureObject.all_dates.all.concat(assertion.all_dates.all))];
      featureObject.failing_dates.all = [
        ...new Set(featureObject.failing_dates.all.concat(assertion.failing_dates.all)),
      ];

      const assertion_key = featureObject.assertions.findIndex(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (obj: any) => obj.id === assertion.feature_assertion_id
      );

      if (
        !featureObject.assertions[assertion_key].tests.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (e: any) => e.id === featureObject.tests[testIndex].id
        )
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tmp_test_summary: any = {
          id: featureObject.tests[testIndex].id,
          title: featureObject.tests[testIndex].title,
          core_support_string: {},
          core_assertion_support_by_at_browser: assertion.core_support_by_at_browser,
        };
        atBrowsers.types.forEach((type) => {
          tmp_test_summary.core_support_string[type] = featureObject.tests[testIndex].core_support_string[type];
        });

        featureObject.assertions[assertion_key].tests.push(tmp_test_summary);
      }

      // Set up the feature assertion properties
      if (featureObject.assertions[assertion_key].core_support === undefined) {
        featureObject.assertions[assertion_key].core_support = {};
        featureObject.assertions[assertion_key].core_support_string = {};
        featureObject.assertions[assertion_key].extended_support = {};
        featureObject.assertions[assertion_key].extended_support_string = {};
        featureObject.assertions[assertion_key].core_support_by_at = {};
        featureObject.assertions[assertion_key].core_support_by_at_browser = {};
        atBrowsers.types.forEach((type) => {
          featureObject.assertions[assertion_key].core_support[type] = [];
          featureObject.assertions[assertion_key].core_support_string[type] = 'unknown';
          featureObject.assertions[assertion_key].extended_support[type] = [];
          featureObject.assertions[assertion_key].extended_support_string[type] = 'unknown';
        });
      }

      for (const at in atBrowsers.at) {
        const validBrowsers = atBrowsers.at[at]!.core_browsers.concat(atBrowsers.at[at]!.extended_browsers);
        validBrowsers.forEach(function (browser) {
          // Set support arrays
          const support = assertion.results[at].browsers[browser].support;
          const some_support_behind_settings = assertion.results[at].browsers[browser].some_support_behind_settings;
          if (atBrowsers.at[at]!.core_browsers.includes(browser)) {
            if (atBrowsers.core_at.includes(at)) {
              if (!featureObject.core_support_by_at[at]) {
                featureObject.core_support_by_at[at] = {
                  string: null,
                  values: [],
                  some_support_behind_settings: false,
                };
              }

              if (!featureObject.core_support_by_at_browser) {
                featureObject.core_support_by_at_browser = {};
              }

              if (!featureObject.core_support_by_at_browser[at]) {
                featureObject.core_support_by_at_browser[at] = {};
              }

              if (!featureObject.core_support_by_at_browser[at][browser]) {
                featureObject.core_support_by_at_browser[at][browser] = {
                  string: null,
                  values: [],
                  some_support_behind_settings: false,
                };
              }

              if (!featureObject.assertions[assertion_key].core_support_by_at[at]) {
                featureObject.assertions[assertion_key].core_support_by_at[at] = {
                  string: null,
                  values: [],
                  some_support_behind_settings: false,
                };
              }

              if (!featureObject.assertions[assertion_key].core_support_by_at_browser[at]) {
                featureObject.assertions[assertion_key].core_support_by_at_browser[at] = {};
              }

              if (!featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser]) {
                featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser] = {
                  string: null,
                  values: [],
                  some_support_behind_settings: false,
                };
              }

              if (
                featureObject.assertions[assertion_key].strength[atBrowsers.at[at]!.type] === 'MUST' ||
                featureObject.assertions[assertion_key].strength[atBrowsers.at[at]!.type] === 'MUST NOT'
              ) {
                // Only include "must" assertions in core support at the feature level
                featureObject.core_support_by_at_browser[at][browser].values.push(support);
                if (some_support_behind_settings) {
                  featureObject.core_support_by_at_browser[at][browser].some_support_behind_settings =
                    some_support_behind_settings;
                }

                featureObject.core_support_by_at[at].values.push(support);
                featureObject.core_support[atBrowsers.at[at]!.type].push(support);
              } else {
                featureObject.extended_support[atBrowsers.at[at]!.type].push(support);
              }

              featureObject.assertions[assertion_key].core_support_by_at[at].values.push(support);
              if (some_support_behind_settings) {
                featureObject.assertions[assertion_key].core_support_by_at[at].some_support_behind_settings =
                  some_support_behind_settings;
              }

              featureObject.assertions[assertion_key].core_support[atBrowsers.at[at]!.type].push(support);
              featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser].values.push(support);
              if (some_support_behind_settings) {
                featureObject.assertions[assertion_key].core_support_by_at_browser[at][
                  browser
                ].some_support_behind_settings = some_support_behind_settings;
              }
            } else {
              featureObject.extended_support[atBrowsers.at[at]!.type].push(support);
              featureObject.assertions[assertion_key].extended_support[atBrowsers.at[at]!.type].push(support);
            }
          } else if (atBrowsers.at[at]!.extended_browsers.includes(browser)) {
            featureObject.extended_support[atBrowsers.at[at]!.type].push(support);
            featureObject.assertions[assertion_key].extended_support[atBrowsers.at[at]!.type].push(support);
          }
        });
      }
    });
  }

  featureObject.all_dates.all = [...new Set(featureObject.all_dates.all)];
  featureObject.all_dates.min = Math.min(...featureObject.all_dates.all);
  featureObject.all_dates.max = Math.max(...featureObject.all_dates.all);
  featureObject.failing_dates.all = [...new Set(featureObject.failing_dates.all)];
  featureObject.failing_dates.min = Math.min(...featureObject.failing_dates.all);
  featureObject.failing_dates.max = Math.max(...featureObject.failing_dates.all);

  // Set support strings
  atBrowsers.types.forEach((type) => {
    featureObject.core_support_string[type] = generateSupportString(featureObject.core_support[type]);
    featureObject.extended_support_string[type] = generateSupportString(featureObject.extended_support[type]);
  });

  for (let i = 0; i < atBrowsers.core_at.length; i++) {
    const at = atBrowsers.core_at[i]!;
    featureObject.core_support_by_at[at].string = generateSupportString(featureObject.core_support_by_at[at].values);

    if (!featureObject.core_support_by_at_browser[at]) {
      featureObject.core_support_by_at_browser[at] = {};
    }

    atBrowsers.at[at]!.core_browsers.forEach((browser) => {
      if (!featureObject.core_support_by_at_browser[at][browser]) {
        featureObject.core_support_by_at_browser[at][browser] = {
          values: [],
          string: '',
        };
      }

      featureObject.core_support_by_at_browser[at][browser].string = generateSupportString(
        featureObject.core_support_by_at_browser[at][browser].values
      );
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    featureObject.assertions.forEach((assertion: any, assertion_key: number) => {
      if (!featureObject.assertions[assertion_key].core_support_by_at) {
        featureObject.assertions[assertion_key].core_support_by_at = {};
      }

      if (!featureObject.assertions[assertion_key].core_support_by_at[at]) {
        featureObject.assertions[assertion_key].core_support_by_at[at] = {
          values: [],
          string: '',
        };
      }
      featureObject.assertions[assertion_key].core_support_by_at[at].string = generateSupportString(
        featureObject.assertions[assertion_key].core_support_by_at[at].values
      );

      // Loop over browsers and set values
      atBrowsers.at[at]!.core_browsers.forEach((browser) => {
        if (!featureObject.assertions[assertion_key].core_support_by_at_browser) {
          featureObject.assertions[assertion_key].core_support_by_at_browser = {};
        }

        if (!featureObject.assertions[assertion_key].core_support_by_at_browser[at]) {
          featureObject.assertions[assertion_key].core_support_by_at_browser[at] = {};
        }

        if (!featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser]) {
          featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser] = {
            values: [],
            string: '',
          };
        }

        featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser].string =
          generateSupportString(featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser].values);
      });
    });
  }

  featureObject.supports_at = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  featureObject.assertions.forEach((assertion: any) => {
    // aggregate must/should/may core support
    atBrowsers.types.forEach((type) => {
      if (assertion.supports_at.includes(type) && !featureObject.supports_at.includes(type)) {
        featureObject.supports_at.push(type);
      }

      if (assertion.strength[type] === 'MUST' || assertion.strength[type] === 'MUST NOT') {
        if (assertion.core_support && assertion.core_support[type] && assertion.core_support[type].length) {
          featureObject.core_must_support[type] = featureObject.core_must_support[type].concat(
            assertion.core_support[type]
          );
        }
        featureObject.core_must_support_string[type] = generateSupportString(featureObject.core_must_support[type]);
      } else if (assertion.strength[type] === 'SHOULD') {
        if (assertion.core_support && assertion.core_support[type] && assertion.core_support[type].length) {
          featureObject.core_should_support[type] = featureObject.core_should_support[type].concat(
            assertion.core_support[type]
          );
        }
        featureObject.core_should_support_string[type] = generateSupportString(
          featureObject.core_should_support[type]
        );
      } else {
        if (assertion.core_support && assertion.core_support[type] && assertion.core_support[type].length) {
          featureObject.core_may_support[type] = featureObject.core_may_support[type].concat(
            assertion.core_support[type]
          );
        }
        featureObject.core_may_support_string[type] = generateSupportString(featureObject.core_may_support[type]);
      }
    });
  });

  atBrowsers.types.forEach((type) => {
    if (!featureObject.supports_at.includes(type)) {
      featureObject.core_must_support_string[type] = generateSupportString('na');
      featureObject.core_should_support_string[type] = generateSupportString('na');
      featureObject.core_may_support_string[type] = generateSupportString('na');
    }
  });
}
