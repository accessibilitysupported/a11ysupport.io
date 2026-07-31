/**
 * T090: port of test.js:141-214, the one existing unit test for src/sp-md-to-obj.js /
 * src/lib/sp-md-to-obj.ts.
 */
import { describe, it, expect } from 'vitest';
import moment from 'moment';
import { spMdToObject } from '../../src/lib/sp-md-to-obj';

describe('spMdToObject()', () => {
  const body =
    'I got the same results and tested the tab key too.\n' +
    '\n' +
    '| property | value |\r\n' +
    '| --- | --- |\r\n' +
    '| title | html_label_element_explicit_aam |\r\n' +
    '| support | y |\r\n' +
    '| at | vo_macos |\r\n' +
    '| at_version | 10.13.6 |\r\n' +
    '| os_version | 10.13.6 |\r\n' +
    '| browser | chrome |\r\n' +
    '| browser_version | 11.1.2 |\r\n' +
    '| output_1_command | VO + right arrow |\r\n' +
    '| output_1_command_name | next item |\r\n' +
    '| output_1_output | Your name, edit text |\r\n' +
    '| output_1_result | pass |\r\n' +
    '| output_2_command | VO + shift + right/left arrow |\r\n' +
    '| output_2_command_name | previous item |\r\n' +
    '| output_2_output | Your name, edit text |\r\n' +
    '| output_2_result | pass |\r\n' +
    '| output_3_command | tab |\r\n' +
    '| output_3_command_name | next focusable item |\r\n' +
    '| output_3_output | Your name, edit text |\r\n' +
    '| output_3_result | pass |\r\n' +
    '\r\n' +
    '== begin notes ==\r\n' +
    'sample note line 1\r\n' +
    'sample note line 2\r\n' +
    '== end notes ==';

  const result = spMdToObject(body);
  const currentDateString = moment().format('YYYY-MM-DD');

  it('should parse correctly', () => {
    const expected = {
      testId: 'html_label_element_explicit_aam',
      at: 'vo_macos',
      browser: 'chrome',
      supportPoint: {
        at_version: '10.13.6',
        browser_version: '11.1.2',
        os_version: '10.13.6',
        date: currentDateString,
        output: [
          {
            command: 'VO + right arrow',
            command_name: 'next item',
            output: 'Your name, edit text',
            result: 'pass',
          },
          {
            command: 'VO + shift + right/left arrow',
            command_name: 'previous item',
            output: 'Your name, edit text',
            result: 'pass',
          },
          {
            command: 'tab',
            command_name: 'next focusable item',
            output: 'Your name, edit text',
            result: 'pass',
          },
        ],
        support: 'y',
        notes: 'sample note line 1\nsample note line 2',
      },
    };

    expect(result).toEqual(expected);
  });
});
