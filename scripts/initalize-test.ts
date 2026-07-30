/**
 * T033: port of scripts/initalize-test.js, verbatim. Scaffolds `commands` blocks in a test JSON
 * file for every AT/browser/assertion combination that doesn't already have one.
 *
 * Usage: tsx scripts/initalize-test.ts --id {test id} [--clear-all]
 */
import fs from 'node:fs';
import path from 'node:path';
import minimist from 'minimist';
import moment from 'moment';
import type { ATBrowsers } from '../src/types/at-browsers';
import { readJson } from '../src/build/load-data';

const argv = minimist(process.argv.slice(2));
const ATBrowsersData = readJson<ATBrowsers>(path.join(__dirname, '../data/ATBrowsers.json'));
const currentDateString = moment().format('YYYY-MM-DD');

if (!argv.id) {
  console.log('Invalid command.');
  console.log('initalize-test.ts --id {test id}');
  process.exit();
}

const testFile = path.join(__dirname, '../data/tests', `${argv.id}.json`);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const test: any = readJson(testFile);

if (!test.commands || argv['clear-all']) {
  test.commands = {};
}

function addCommand(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  test: any,
  at: string,
  browser: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  command: any,
  feature_id: string,
  feature_assertion_id: string,
  result: string,
  resultNotes: string | null
) {
  if (!test.commands[at]) {
    test.commands[at] = {};
  }

  if (!test.commands[at][browser]) {
    test.commands[at][browser] = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let command_index = test.commands[at][browser].findIndex(
    (obj: any) =>
      obj.command === command.command &&
      obj.css_target === command.css_target &&
      obj.before === command.before &&
      obj.after === command.after
  );

  if (-1 === command_index) {
    command.results = [];
    test.commands[at][browser].push(command);
    command_index = test.commands[at][browser].length - 1;
  }

  const result_index = test.commands[at][browser][command_index].results.findIndex(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (obj: any) => obj.feature_id === feature_id && obj.feature_assertion_id === feature_assertion_id
  );

  if (-1 === result_index) {
    test.commands[at][browser][command_index].results.push({
      feature_id,
      feature_assertion_id,
      result,
      notes: resultNotes,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
test.assertions.forEach(function (assertionLink: any) {
  const feature = readJson(path.join(__dirname, '../build/tech', `${assertionLink.feature_id}.json`));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assertion_key = feature.assertions.findIndex((obj: any) => obj.id === assertionLink.feature_assertion_id);
  if (assertion_key === -1) {
    console.log(assertionLink.feature_assertion_id + ' not found. Try re-building the project and run this command again.');
    process.exit();
  }

  const assertion = feature.assertions[assertion_key];

  for (const at in ATBrowsersData.at) {
    if (assertion.exclude_at && Object.keys(assertion.exclude_at).includes(at)) {
      // This AT is not applicable for some reason. Don't pre-populate commands.
      // the "na" value is populated at build-time.
      continue;
    }

    if (assertionLink.exclude_at && Object.keys(assertionLink.exclude_at).includes(at)) {
      continue;
    }

    if (ATBrowsersData.at[at]!.type === 'vc' && !assertion.operation_modes.includes('vc')) {
      // We are not on a VC AT and the assertion is just for VC AT, so skip.
      continue;
    }

    const validBrowsers = ATBrowsersData.at[at]!.core_browsers;
    validBrowsers.forEach(function (browser) {
      switch (assertion.id) {
        case 'convey_change_in_value':
          if (ATBrowsersData.at[at]!.type === 'sr' && assertion.operation_modes.includes('sr/interaction')) {
            addCommand(
              test,
              at,
              browser,
              {
                command: 'enter_text',
                css_target: assertionLink.css_target ? assertionLink.css_target : assertion.css_target,
                before: {
                  mode: 'auto',
                  focus_location: 'before target',
                  virtual_location: 'before target',
                },
                after: 'target',
                output: 'character was announced',
              },
              assertionLink.feature_id,
              assertionLink.feature_assertion_id,
              'pass',
              null
            );
          } else {
            console.log('expected convey_change_in_value to support sr/interaction ');
          }
          break;
        case 'provide_shortcuts':
          if (ATBrowsersData.at[at]!.type === 'sr' && assertion.operation_modes.includes('sr/reading')) {
            addCommand(
              test,
              at,
              browser,
              {
                command: 'next_form_field',
                css_target: assertionLink.css_target ? assertionLink.css_target : assertion.css_target,
                before: {
                  mode: 'auto',
                  focus_location: 'before target',
                  virtual_location: 'before target',
                },
                after: 'target',
                output: '""',
              },
              assertionLink.feature_id,
              assertionLink.feature_assertion_id,
              'unknown',
              null
            );

            if (at === 'jaws' || at === 'nvda' || at === 'vo_macos') {
              // These support open_element_list
              addCommand(
                test,
                at,
                browser,
                {
                  command: 'open_element_list',
                  css_target: assertionLink.css_target ? assertionLink.css_target : assertion.css_target,
                  before: {
                    mode: 'auto',
                    focus_location: 'na',
                    virtual_location: 'na',
                  },
                  after: 'na',
                  output: '""',
                },
                assertionLink.feature_id,
                assertionLink.feature_assertion_id,
                'unknown',
                null
              );
            }
          } else {
            console.log('expected convey_change_in_value to support sr/reading ');
          }
          break;
        case 'widget_is_supported':
          addCommand(
            test,
            at,
            browser,
            {
              command: 'multiple_commands',
              css_target: assertionLink.css_target ? assertionLink.css_target : assertion.css_target,
              before: {
                mode: 'auto',
                focus_location: 'target',
                virtual_location: 'target',
              },
              after: 'target',
              output: '""',
            },
            assertionLink.feature_id,
            assertionLink.feature_assertion_id,
            'unknown',
            null
          );
          break;
        default:
          if (ATBrowsersData.at[at]!.type === 'sr') {
            if (assertion.operation_modes.includes('sr/reading')) {
              addCommand(
                test,
                at,
                browser,
                {
                  command: 'next_item',
                  css_target: assertionLink.css_target ? assertionLink.css_target : assertion.css_target,
                  before: {
                    mode: 'auto',
                    focus_location: 'before target',
                    virtual_location: 'before target',
                  },
                  after: 'target',
                  output: '""',
                },
                assertionLink.feature_id,
                assertionLink.feature_assertion_id,
                'unknown',
                null
              );
            }

            if (assertion.operation_modes.includes('sr/interaction')) {
              // not all screen readers have next_focusable_item...
              if (ATBrowsersData.at[at]!.commands.next_focusable_item) {
                addCommand(
                  test,
                  at,
                  browser,
                  {
                    command: 'next_focusable_item',
                    css_target: assertionLink.css_target ? assertionLink.css_target : assertion.css_target,
                    before: {
                      mode: 'auto',
                      focus_location: 'before target',
                      virtual_location: 'before target',
                    },
                    after: 'target',
                    output: '""',
                  },
                  assertionLink.feature_id,
                  assertionLink.feature_assertion_id,
                  'unknown',
                  null
                );
              } else {
                addCommand(
                  test,
                  at,
                  browser,
                  {
                    command: 'next_item',
                    css_target: assertionLink.css_target ? assertionLink.css_target : assertion.css_target,
                    before: {
                      mode: 'auto',
                      focus_location: 'before target',
                      virtual_location: 'before target',
                    },
                    after: 'target',
                    output: '""',
                  },
                  assertionLink.feature_id,
                  assertionLink.feature_assertion_id,
                  'unknown',
                  null
                );
              }
            }
          } else if (ATBrowsersData.at[at]!.type === 'vc' && assertion.operation_modes.includes('vc')) {
            if (assertion.id === 'convey_name' || assertion.id === 'contribute_to_accessible_name') {
              addCommand(
                test,
                at,
                browser,
                {
                  command: 'activate_name',
                  css_target: assertionLink.css_target ? assertionLink.css_target : assertion.css_target,
                  before: {
                    mode: 'auto',
                    focus_location: 'na',
                    virtual_location: 'na',
                  },
                  after: 'na',
                  output: '""',
                  notes: 'said ""',
                },
                assertionLink.feature_id,
                assertionLink.feature_assertion_id,
                'unknown',
                null
              );
            }

            if (assertion.id === 'convey_role') {
              if (at === 'dragon_win') {
                addCommand(
                  test,
                  at,
                  browser,
                  {
                    command: 'activate_role',
                    css_target: assertionLink.css_target ? assertionLink.css_target : assertion.css_target,
                    before: {
                      mode: 'auto',
                      focus_location: 'na',
                      virtual_location: 'na',
                    },
                    after: 'na',
                    output: '""',
                    notes: 'said ""',
                  },
                  assertionLink.feature_id,
                  assertionLink.feature_assertion_id,
                  'unknown',
                  null
                );
              } else {
                addCommand(
                  test,
                  at,
                  browser,
                  {
                    command: 'show_numbers',
                    css_target: assertionLink.css_target ? assertionLink.css_target : assertion.css_target,
                    before: {
                      mode: 'auto',
                      focus_location: 'na',
                      virtual_location: 'na',
                    },
                    after: 'na',
                    output: '""',
                  },
                  assertionLink.feature_id,
                  assertionLink.feature_assertion_id,
                  'unknown',
                  null
                );
              }
            }
          }
      }
    });
  }

  // Use the latest versions that we have on file.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const versions: any = readJson(path.join(__dirname, '../data/latest_versions.json'));
  test.versions = {};

  for (const at in ATBrowsersData.at) {
    if (!test.versions[at]) {
      test.versions[at] = {
        browsers: {},
      };
    }

    const validBrowsers = ATBrowsersData.at[at]!.core_browsers;
    validBrowsers.forEach((browser) => {
      if (test.versions[at].browsers[browser]) {
        return;
      }
      test.versions[at].browsers[browser] = {
        at_version: versions.at[at].at_version,
        os_version: versions.at[at].os_version,
        browser_version: versions.browsers[browser].version,
        date: currentDateString,
      };
    });
  }

  fs.writeFileSync(testFile, JSON.stringify(test, null, 2));
});
