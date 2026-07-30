/**
 * T024: port of helper.checkForOnlyNegativeSupport (feature-helper.js:624-659), verbatim except
 * `.unique()` becoming a plain function call.
 */
import type { ATBrowsers } from '../types/at-browsers';
import { unique } from './array-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkForOnlyNegativeSupport(atBrowsers: ATBrowsers, featureObject: any): void {
  // detect if assertions contain something like convey_value_false
  const hasNegativeExpectation = featureObject.assertions.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => e.same_as_no_support === true
  );

  if (!hasNegativeExpectation) {
    return; // nothing to see here, keep moving (fail early)
  }

  for (const at in atBrowsers.at) {
    const validBrowsers = atBrowsers.at[at]!.core_browsers;
    validBrowsers.forEach(function (browser) {
      // for each AT/browser combo, detect if same_as_no_support is the only supported assertion
      let negativeSupport: boolean = false;
      let positiveSupport: boolean = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      featureObject.assertions.forEach((assertion: any) => {
        // Set support arrays
        const support = unique(assertion.core_support_by_at_browser[at][browser].values); // Make sure its unique

        if (support.length === 1 && assertion.same_as_no_support) {
          if (support[0] === 'y') {
            negativeSupport = true;
          }
        } else {
          if (support[0] === 'y') {
            positiveSupport = true;
          }
        }
      });

      featureObject.core_support_by_at_browser[at][browser].onlyNegativeSupport = false;
      if (negativeSupport && !positiveSupport) {
        featureObject.core_support_by_at_browser[at][browser].onlyNegativeSupport = true;
      }
    });
  }
}
