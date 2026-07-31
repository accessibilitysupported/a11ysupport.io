/**
 * T032: port of scripts/sync-support-point.js, verbatim. The primary data-intake path per
 * readme.md's "accept a support point" workflow — pulls a verified GitHub issue/comment body,
 * parses it (src/lib/sp-md-to-obj.ts), and writes the result into the appropriate test file.
 *
 * Usage: tsx scripts/sync-support-point.ts --issue {issue-id}
 *        tsx scripts/sync-support-point.ts --comment {comment-id}
 */
import minimist from 'minimist';
import fs from 'node:fs';
import path from 'node:path';
import moment from 'moment';
import GitHub from 'github-api';
import { spMdToObject } from '../src/lib/sp-md-to-obj';
import { readJson } from '../src/build/load-data';

const argv = minimist(process.argv.slice(2));

void (async function () {
  const currentDateString = moment().format('YYYY-MM-DD');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gh: any = new (GitHub as any)();
  const issue = gh.getIssues('accessibilitysupported', 'a11ysupport.io');

  let body: string;

  if (argv.issue) {
    const result = await issue.getIssue(argv.issue);
    body = result.data.body;
  } else if (argv.comment) {
    const result = await issue.getIssueComment(argv.comment);
    body = result.data.body;
  } else {
    console.log('Invalid command.');
    console.log('sync-support-point.ts --issue {issue-id}');
    console.log('sync-support-point.ts --comment {comment-id}');
    process.exit();
  }

  // now process the body
  const data = spMdToObject(body);
  if (!data.testId) {
    console.log('data is not complete, missing the testId');
    process.exit();
  }

  const testFile = path.join(__dirname, '../data/tests', `${data.testId}.json`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const test: any = readJson(testFile);

  if (!test) {
    console.log('test could not be found');
    process.exit();
  }

  if (!test.results[data.at!] || !test.results[data.at!].browsers) {
    test.results[data.at!] = {
      browsers: {},
    };
  }

  test.results[data.at!].browsers[data.browser!] = data.supportPoint;

  test.history.push({
    date: currentDateString,
    message: data.at + '/' + data.browser + ' support updated',
  });

  fs.writeFileSync(testFile, JSON.stringify(test, null, 2));
})();
