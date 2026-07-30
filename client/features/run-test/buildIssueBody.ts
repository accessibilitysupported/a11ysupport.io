/**
 * T069 (part): port of public/js/feature-test.js's diff-generation logic (lines 218-297),
 * verbatim. Pure and unit-testable in isolation, per plan.md's Project Structure.
 */

export interface TechInfo {
  at: string;
  atVersion: string;
  browser: string;
  browserVersion: string;
  osVersion: string;
}

export interface CommandDiffInput {
  legend: string;
  command: string;
  outputBefore: string;
  outputAfter: string;
  notesBefore: string;
  notesAfter: string;
  behindSettingBefore: string;
  behindSettingAfter: string;
  results: Array<{
    legend: string;
    key: string;
    resultBefore: string;
    resultAfter: string;
    noteBefore: string;
    noteAfter: string;
  }>;
}

function getDiff(title: string, before: string, after: string): string {
  if (before === after) return '';

  const beforeText = before || '(empty)';
  const afterText = after || '(empty)';

  return `${title}\n**before:**\n\`\`\`${beforeText}\`\`\`\n**after:**\n\`\`\`${afterText}\`\`\`\n\n`;
}

export function buildCommandDiff(command: CommandDiffInput): string {
  let commandDiff = '';
  commandDiff += getDiff('### output', command.outputBefore, command.outputAfter);
  commandDiff += getDiff('### notes', command.notesBefore, command.notesAfter);
  commandDiff += getDiff('### behind setting', command.behindSettingBefore, command.behindSettingAfter);

  for (const result of command.results) {
    let resultDiff = '';
    resultDiff += getDiff('### result', result.resultBefore, result.resultAfter);
    resultDiff += getDiff('### note', result.noteBefore, result.noteAfter);

    if (resultDiff) {
      resultDiff = `key: ${result.key}\n\n${resultDiff}`;
      resultDiff = `### result for ${result.legend}\n\n${resultDiff}`;
    }

    commandDiff += resultDiff;
  }

  if (commandDiff) {
    commandDiff = `## ${command.legend}\nCommand used: \`${command.command}\`\n\n${commandDiff}`;
  }

  return commandDiff;
}

export function buildIssueBody(
  testTitle: string,
  testId: string,
  testUrl: string,
  tech: TechInfo,
  commands: CommandDiffInput[]
): string {
  // feature-test.js:218,321-322: the markdown link uses `test.title` (the fetched JSON's
  // human-readable title), but the `| title |` meta-table row reads the hidden
  // `input[name="title"]`, whose value is `test.id` — two different fields in the original,
  // not the same value twice.
  let body = `This Support Point submission is for the test [${testTitle}](${testUrl})\n\n`;

  body += 'meta info\n\n';
  body += '| property | value |\n';
  body += '| --- | --- |\n';
  body += `| title | ${testId} |\n`;
  body += `| at | ${tech.at} |\n`;
  body += `| at_version | ${tech.atVersion} |\n`;
  body += `| browser | ${tech.browser} |\n`;
  body += `| browser_version | ${tech.browserVersion} |\n`;
  body += `| os_version | ${tech.osVersion} |\n`;

  let diff = '';
  for (const command of commands) {
    diff += buildCommandDiff(command);
  }

  if (!diff) {
    diff = 'no changes (same results were confirmed)';
  }

  body += `\n\n${diff}`;

  return body;
}

export function isCoreCombination(
  coreAt: string[],
  coreBrowsersByAt: Record<string, string[]>,
  at: string,
  browser: string
): boolean {
  return coreAt.includes(at) && (coreBrowsersByAt[at] ?? []).includes(browser);
}
