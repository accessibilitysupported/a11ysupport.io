/**
 * T034: port of scripts/sync_wpt.js. Replaces `node-fetch` v3 (ESM-only, was already broken
 * under `require()`) with the built-in `fetch` — otherwise verbatim. Imports web-platform-tests
 * fixtures via cheerio/esprima/escodegen/js-beautify, all loosely typed here since they're
 * external, maintainer-only tooling, never part of the server or client.
 */
import fs from 'node:fs';
import path from 'node:path';
import moment from 'moment';
import cheerio from 'cheerio';
import esprima from 'esprima';
import escodegen from 'escodegen';
import jsBeautify from 'js-beautify';
import { readJson } from '../src/build/load-data';

const beautify_html = jsBeautify.html;
const currentDateString = moment().format('YYYY-MM-DD');
const dataDir = path.join(__dirname, '../data');

// from https://www.w3.org/TR/wai-aria-1.1/ run:
// JSON.stringify(Array.from(document.querySelectorAll('.state-name code')).map(node => node.textContent));
const ariaStates = [
  'aria-busy',
  'aria-checked',
  'aria-current',
  'aria-disabled',
  'aria-expanded',
  'aria-grabbed',
  'aria-hidden',
  'aria-invalid',
  'aria-pressed',
  'aria-selected',
];

const TEST_SHELL = {
  type: 'aam',
  title: 'todo',
  description: 'todo',
  supports_sr: true,
  supports_vc: false,
  css_target: '#target',
  assertion: {},
  history: [
    {
      date: currentDateString,
      message: 'Test created',
    },
  ],
  at: {},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ARIA_ATTRIBUTE_MAP: any = {
  'aria-label': 'name',
  'aria-labelledby': 'name',
  'aria-description': 'description',
  'aria-describedby': 'description',
};

function linkTestToFeature(test_id: string, feature_id: string): void {
  const path_json = path.join(dataDir, 'tech', feature_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let feature: any;
  try {
    feature = readJson(`${path_json}.json`);
  } catch {
    console.log('could not load feature at: ' + path_json);
    return;
  }

  if (feature.tests.includes(test_id)) {
    // already exists, escape early
    return;
  }

  feature.tests.push(test_id);

  fs.writeFileSync(`${path_json}.json`, JSON.stringify(feature, null, 2));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertionToFileName(assertion: any): string {
  if (assertion.title) {
    return assertion.title;
  }

  return assertion.value;
}

function loadTestCase(url: string, suite_name: string): void {
  fetch(url)
    .then((res) => res.text())
    .then(function (html) {
      const $$ = cheerio.load(html);

      const file_html = url.replace('http://www.w3c-test.org/', '');
      const file_json = file_html.replace('.html', '');
      const target = $$('#test');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const all_attributes = Object.entries((target[0] as any).attribs);

      // Figure out what tests we need to create (one test for each assertion)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assertions: any[] = [];
      if (suite_name === 'wai-aria') {
        // wai-aria
        all_attributes.forEach((attribute) => {
          if (attribute[0] === 'role') {
            assertions.push({
              aspect: 'role',
              value: attribute[1],
            });
          } else if (ARIA_ATTRIBUTE_MAP[attribute[0]]) {
            // this is a custom mapping to the accessible name or description
            const assertion = {
              aspect: ARIA_ATTRIBUTE_MAP[attribute[0]],
              value: attribute[1],
            };
            assertions.push(assertion);
          } else if (attribute[0].startsWith('aria-')) {
            let aspect = 'property';
            if (ariaStates.includes(attribute[0])) {
              aspect = 'property';
            }
            const assertion = {
              aspect: aspect,
              title: attribute[0].replace('aria-', ''),
              value: attribute[1],
            };
            assertions.push(assertion);
          } else if (
            !['id', 'tabindex', 'class', 'src', 'alt', 'style', 'type', 'value', 'contenteditable'].includes(
              attribute[0]
            )
          ) {
            // Likely testing to make sure native HTML attribute overrides ARIA... Need to verify in every case.
            console.log('unknown attribute: ' + url + '\t' + attribute[0]);
          }
        });
      } else if (suite_name === 'accname') {
        // accname
        // the expected accessible name/description are already in the steps data. Extract it.
        const script = $$('head script:last-of-type');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed: any = esprima.parseScript((script.get()[0] as any).children[0].data);
        const steps = parsed.body[1].declarations[0].init.arguments[0].properties[0].value;
        let steps_json: unknown = escodegen.generate(steps, {
          format: {
            json: true,
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        steps_json = JSON.parse(steps_json as any) as any;

        // now map the steps data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (steps_json as any)[0].test.ATK.forEach((assertion: any) => {
          if (assertion[0] !== 'property') {
            return;
          }

          if (assertion[2] !== 'is') {
            // we only care about positive assertions
            return;
          }

          if (assertion[3] === '') {
            // Make it obvious that we expect nothing (is there a better way to make this obvious?)
            assertion[3] = '""';
          }

          if (assertion[1] === 'name') {
            assertions.push({
              aspect: 'name',
              value: assertion[3],
            });
          } else if (assertion[1] === 'description') {
            assertions.push({
              aspect: 'description',
              value: assertion[3],
            });
          }
        });
      }

      assertions.forEach((assertion) => {
        // ensure the json exists
        // TODO: a lot of this could be generalized to generate a json file for any given HTML.
        const key = assertionToFileName(assertion);
        const path_json = path.join(dataDir, 'tests/wpt', `${file_json}_${key}.json`);
        const test_id = 'wpt/' + file_json + '_' + key;
        if (!fs.existsSync(path_json)) {
          const dir = path_json.substring(0, path_json.lastIndexOf('/'));
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // Figure out what to name this test
          let title = '(' + key + ') ' + (target[0] as any).name;
          const skip_attributes = ['id'];

          if (all_attributes.length > 0) {
            // attributes
            const attributes: string[] = [];
            all_attributes.forEach((entry) => {
              if (skip_attributes.includes(entry[0])) {
                return;
              }

              attributes.push(entry[0] + '="' + entry[1] + '"');
            });

            title += '[' + attributes.join(' ') + ']';
          }

          if (suite_name === 'accname') {
            // innertext could be important for accname computations
            if ($$(target).text().trim() !== '') {
              title += ' with innerText';
            }
          }

          // Clone the TEST_SHELL and make a new json object.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const json: any = JSON.parse(JSON.stringify(TEST_SHELL));

          json.title = title;
          json.description =
            'This is an imported test imported from [WPT ' +
            suite_name +
            '](' +
            'http://w3c.github.io/test-results/' +
            suite_name +
            '/all.html' +
            ')\r\n';
          json.description += '[View the external text](' + url + ')\r\n';
          json.assertion = assertion;
          json.html_file = 'wpt/' + file_html;

          // now write the test file
          fs.writeFileSync(path_json, JSON.stringify(json, null, 2));

          // now link the test to relevant features
          if (json.assertion.aspect === 'role') {
            linkTestToFeature(test_id, 'aria/' + json.assertion.value + '_role');
          } else if (json.assertion.title) {
            linkTestToFeature(test_id, 'aria/aria-' + json.assertion.title + '_attribute');
          }
        }
      });

      const path_html = path.join(dataDir, 'tests/html/wpt', file_html);
      if (!fs.existsSync(path_html)) {
        const dir = path_html.substring(0, path_html.lastIndexOf('/'));
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Remove scripts (we don't need them)
        $$('script').remove();
        // Remove css (we don't need them)
        $$('link').remove();
        // Remove html containers that we don't need
        $$('#manualMode').remove();
        $$('#log').remove();
        $$('#ATTAmessages').remove();

        // now write the file
        fs.writeFileSync(
          path_html,
          beautify_html($$.html(), {
            preserve_newlines: false,
          })
        );
      }
    });
}

const test_suites = ['accname', 'wai-aria'];

test_suites.forEach(function (suite_name) {
  // Fetch the listing index http://w3c.github.io/test-results/accname/all.html
  fetch('http://w3c.github.io/test-results/' + suite_name + '/all.html')
    .then((res) => res.text())
    .then(function (html) {
      const $ = cheerio.load(html);
      $('.test a').each(function () {
        // Load the test html and parse it.
        loadTestCase($(this).attr('href')!, suite_name);
      });
    });
});
