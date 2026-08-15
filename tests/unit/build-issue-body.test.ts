/**
 * T096: unit tests for client/features/run-test/buildIssueBody.ts — the run-test form's
 * markdown-diff generator (ported from public/js/feature-test.js:218-297).
 */
import { describe, it, expect } from 'vitest';
import { buildCommandDiff, buildIssueBody, isCoreCombination } from '../../client/features/run-test/buildIssueBody';
import type { CommandDiffInput } from '../../client/features/run-test/buildIssueBody';

function baseCommand(overrides: Partial<CommandDiffInput> = {}): CommandDiffInput {
  return {
    legend: 'Down Arrow',
    command: 'down',
    outputBefore: '',
    outputAfter: '',
    notesBefore: '',
    notesAfter: '',
    behindSettingBefore: '',
    behindSettingAfter: '',
    results: [],
    ...overrides,
  };
}

describe('buildCommandDiff', () => {
  it('returns an empty string when nothing changed', () => {
    expect(buildCommandDiff(baseCommand())).toBe('');
  });

  it('renders an output diff with a command header when output changes', () => {
    const diff = buildCommandDiff(baseCommand({ outputBefore: 'old output', outputAfter: 'new output' }));
    expect(diff).toContain('## Down Arrow');
    expect(diff).toContain('Command used: `down`');
    expect(diff).toContain('### output');
    expect(diff).toContain('**before:**\n```old output```');
    expect(diff).toContain('**after:**\n```new output```');
  });

  it('renders "(empty)" for a before/after value that is blank', () => {
    const diff = buildCommandDiff(baseCommand({ notesBefore: '', notesAfter: 'a note' }));
    expect(diff).toContain('```(empty)```');
    expect(diff).toContain('```a note```');
  });

  it('renders a behind-setting diff independently of output/notes', () => {
    const diff = buildCommandDiff(baseCommand({ behindSettingBefore: 'off', behindSettingAfter: 'on' }));
    expect(diff).toContain('### behind setting');
    expect(diff).toContain('```off```');
    expect(diff).toContain('```on```');
  });

  it('renders a per-result diff with its key and legend when a result changes', () => {
    const diff = buildCommandDiff(
      baseCommand({
        results: [
          {
            legend: 'html/button/convey_name',
            key: 'html/button; convey_name',
            resultBefore: 'fail',
            resultAfter: 'pass',
            noteBefore: '',
            noteAfter: '',
          },
        ],
      })
    );
    expect(diff).toContain('### result for html/button/convey_name');
    expect(diff).toContain('key: html/button; convey_name');
    expect(diff).toContain('### result');
    expect(diff).toContain('```fail```');
    expect(diff).toContain('```pass```');
  });

  it('omits a result section entirely when that result did not change', () => {
    const diff = buildCommandDiff(
      baseCommand({
        results: [{ legend: 'x', key: 'x', resultBefore: 'pass', resultAfter: 'pass', noteBefore: '', noteAfter: '' }],
      })
    );
    expect(diff).toBe('');
  });
});

describe('buildIssueBody', () => {
  const tech = { at: 'nvda', atVersion: '2024.1', browser: 'chrome', browserVersion: '120', osVersion: '11' };

  it('uses the test title in the markdown link and the test id in the meta table (not the same value twice)', () => {
    const body = buildIssueBody('Basic HTML button test', 'tech/html/buttons', '/tests/tech__html__buttons', tech, []);
    expect(body).toContain('[Basic HTML button test](/tests/tech__html__buttons)');
    expect(body).toContain('| title | tech/html/buttons |');
    expect(body).not.toContain('[tech/html/buttons]');
  });

  it('includes every tech field in the meta table', () => {
    const body = buildIssueBody('T', 'id', '/url', tech, []);
    expect(body).toContain('| at | nvda |');
    expect(body).toContain('| at_version | 2024.1 |');
    expect(body).toContain('| browser | chrome |');
    expect(body).toContain('| browser_version | 120 |');
    expect(body).toContain('| os_version | 11 |');
  });

  it('reports "no changes" when no command produced a diff', () => {
    const body = buildIssueBody('T', 'id', '/url', tech, [baseCommand()]);
    expect(body).toContain('no changes (same results were confirmed)');
  });

  it('concatenates diffs from multiple commands', () => {
    const body = buildIssueBody('T', 'id', '/url', tech, [
      baseCommand({ legend: 'Cmd A', outputBefore: 'a', outputAfter: 'b' }),
      baseCommand({ legend: 'Cmd B', notesBefore: 'x', notesAfter: 'y' }),
    ]);
    expect(body).toContain('## Cmd A');
    expect(body).toContain('## Cmd B');
  });
});

describe('isCoreCombination', () => {
  const coreAt = ['jaws', 'nvda'];
  const coreBrowsersByAt = { jaws: ['chrome'], nvda: ['chrome', 'firefox'] };

  it('is true for a core AT paired with one of its core browsers', () => {
    expect(isCoreCombination(coreAt, coreBrowsersByAt, 'nvda', 'firefox')).toBe(true);
  });

  it('is false for a core AT paired with a non-core browser', () => {
    expect(isCoreCombination(coreAt, coreBrowsersByAt, 'jaws', 'firefox')).toBe(false);
  });

  it('is false for an AT that is not core at all', () => {
    expect(isCoreCombination(coreAt, coreBrowsersByAt, 'dragon', 'chrome')).toBe(false);
  });
});
