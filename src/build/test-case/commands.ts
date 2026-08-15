/**
 * T026 (part): port of feature-helper.js:737-865 — processes `testCase.commands[at][browser][]`
 * into `testCase.assertions[].results[at].browsers[browser].output`, resolving `procedure_key`
 * references and computing per-assertion / test-level dates along the way. Verbatim except
 * `.unique()` (not used here) and the `require()`-free signature (none needed — this section
 * doesn't load external files, only reads `testCase.procedures`).
 */
import type { ATBrowsers } from '../../types/at-browsers';
import { isCoreCombination } from '../array-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function processCommands(atBrowsers: ATBrowsers, testCase: any): void {
  for (const at in atBrowsers.at) {
    if (!testCase.commands[at]) {
      continue;
    }

    const validBrowsers = atBrowsers.at[at]!.core_browsers.concat(atBrowsers.at[at]!.extended_browsers);
    validBrowsers.forEach(function (browser) {
      if (!testCase.commands[at][browser]) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      testCase.commands[at][browser].forEach(function (command: any) {
        if (command.procedure_key) {
          const procedure_index = testCase.procedures.findIndex(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (obj: any) => obj.key === command.procedure_key
          );

          if (procedure_index === -1) {
            console.log('error: procedure key of "' + command.procedure_key + '" was not found', 'testCase: ' + testCase.id);
          }

          // clone so that we can customize per AT
          const procedure = JSON.parse(JSON.stringify(testCase.procedures[procedure_index]));

          if (['vo_ios', 'talkback'].includes(at)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            procedure.steps = procedure.steps.filter((step: any) => step.action !== 'set mode to');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            procedure.steps.forEach((step: any) => {
              if (step.ensure_at_location && step.ensure_at_location.focus) {
                delete step.ensure_at_location.focus;
              }
            });
          }

          // merge the procedure into the command
          command = Object.assign({}, procedure, command);
        }

        if (!command.results) {
          command.results = [];
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        command.results.forEach(function (result: any) {
          if (!result.applied_to) {
            result.applied_to = null;
          }
          if (!result.references) {
            result.references = [];
          }
          let assertion_key = testCase.assertions.findIndex(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (obj: any) =>
              obj.feature_id === result.feature_id &&
              obj.feature_assertion_id === result.feature_assertion_id &&
              obj.applied_to === result.applied_to &&
              obj.references.join('-') === result.references.join('-')
          );

          if (-1 === assertion_key) {
            testCase.assertions.push({
              feature_id: result.feature_id,
              feature_assertion_id: result.feature_assertion_id,
            });
            assertion_key = testCase.assertions.length - 1;
          }

          if (!testCase.assertions[assertion_key].results) {
            console.log(assertion_key, testCase.assertions[assertion_key]);
            console.log(
              'Error; make sure that this assertion reference actually exists and is spelled correctly',
              'testCase: ' + testCase.id,
              assertion_key,
              result.feature_id,
              result.feature_assertion_id,
              'applied_to: ',
              result.applied_to,
              'references: ',
              result.references
            );
          }

          if (!testCase.assertions[assertion_key].results[at]) {
            testCase.assertions[assertion_key].results[at] = {
              browsers: {},
            };
          }

          if (!testCase.assertions[assertion_key].results[at].browsers[browser]) {
            testCase.assertions[assertion_key].results[at].browsers[browser] = {
              output: [],
            };
          }

          const output = Object.assign({}, command);

          if (command.notes) {
            output.commandNotes = command.notes;
            delete output.notes;
          }

          if (result.notes) {
            output.resultNotes = result.notes;
          }

          output.result = result.result;
          delete output.results;

          // handle dates
          if (!testCase.versions[at].browsers[browser]) {
            console.log('no version for ' + at + ' / ' + browser);
          }
          testCase.assertions[assertion_key].all_dates.all.push(
            new Date(testCase.versions[at].browsers[browser].date).getTime()
          );
          testCase.assertions[assertion_key].results[at].browsers[browser].output.push(output);
          if (isCoreCombination(atBrowsers, at, browser)) {
            if (output.result === 'fail' || output.result === 'partial') {
              testCase.failing_dates.all.push(new Date(testCase.versions[at].browsers[browser].date).getTime());
              testCase.assertions[assertion_key].failing_dates.all.push(
                new Date(testCase.versions[at].browsers[browser].date).getTime()
              );
              testCase.versions[at].browsers[browser].has_failing = true;
            }

            testCase.assertions[assertion_key].all_dates.all = [
              ...new Set(testCase.assertions[assertion_key].all_dates.all),
            ];
            testCase.assertions[assertion_key].all_dates.min = Math.min(
              ...testCase.assertions[assertion_key].all_dates.all
            );
            testCase.assertions[assertion_key].all_dates.max = Math.max(
              ...testCase.assertions[assertion_key].all_dates.all
            );
            testCase.assertions[assertion_key].failing_dates.all = [
              ...new Set(testCase.assertions[assertion_key].failing_dates.all),
            ];
            testCase.assertions[assertion_key].failing_dates.min = Math.min(
              ...testCase.assertions[assertion_key].failing_dates.all
            );
            testCase.assertions[assertion_key].failing_dates.max = Math.max(
              ...testCase.assertions[assertion_key].failing_dates.all
            );
          }
        });
      });
    });
  }

  delete testCase.commands;

  testCase.all_dates.all = [...new Set(testCase.all_dates.all)];
  testCase.all_dates.min = Math.min(...testCase.all_dates.all);
  testCase.all_dates.max = Math.max(...testCase.all_dates.all);
  testCase.failing_dates.all = [...new Set(testCase.failing_dates.all)];
  testCase.failing_dates.min = Math.min(...testCase.failing_dates.all);
  testCase.failing_dates.max = Math.max(...testCase.failing_dates.all);
}
