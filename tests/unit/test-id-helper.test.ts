/**
 * T095: unit tests for src/lib/test-id-helper.ts. `generateTestTitle` is kept as a direct port of
 * the original if-ladder (see the file's own header comment) — this covers every
 * (virtual_location, focus_location, after) branch it handles, plus the early-exit branches
 * (title+steps, title, voice-control, procedure_key, "na") and the "unknown" fallback.
 */
import { describe, it, expect } from 'vitest';
import { makeSafe, undoMakeSafe, trimTechFromAssertion, generateTestTitle, getAssertionKey } from '../../src/lib/test-id-helper';

describe('makeSafe / undoMakeSafe', () => {
  it('makeSafe replaces every slash with a double underscore', () => {
    expect(makeSafe('tech/html/buttons')).toBe('tech__html__buttons');
  });

  it('undoMakeSafe is the inverse', () => {
    expect(undoMakeSafe('tech__html__buttons')).toBe('tech/html/buttons');
  });
});

describe('trimTechFromAssertion', () => {
  it('strips the "The assistive technology " prefix', () => {
    expect(trimTechFromAssertion('The assistive technology MUST convey the name')).toBe('MUST convey the name');
  });

  it('strips "The screen reader"', () => {
    expect(trimTechFromAssertion('The screen readerMUST announce the role')).toBe('MUST announce the role');
  });

  it('leaves unrelated text untouched', () => {
    expect(trimTechFromAssertion('MUST convey the value')).toBe('MUST convey the value');
  });
});

const at = {
  type: 'sr',
  commands: {
    down: { command: 'Down Arrow', name: 'move to next item' },
  },
};
const test = {
  procedures: [{ key: 'proc-1', title: 'Custom procedure title' }],
};
const TITLE = 'Use Down Arrow (move to next item)';

function cmd(overrides: Record<string, unknown>) {
  return { command: 'down', before: { virtual_location: 'na', focus_location: 'na' }, after: 'na', ...overrides };
}

describe('generateTestTitle', () => {
  it('uses "title using <at command> (<command>)" when both title and steps are present', () => {
    const result = generateTestTitle(cmd({ title: 'Custom step', steps: ['do a thing'] }), at, test);
    expect(result).toBe('Custom step using move to next item (Down Arrow)');
  });

  it('uses the bare title when only title is present', () => {
    expect(generateTestTitle(cmd({ title: 'Just a title' }), at, test)).toBe('Just a title');
  });

  it('returns the plain "Use X (Y)" title for voice control, ignoring location', () => {
    const vcAt = { ...at, type: 'vc' };
    expect(generateTestTitle(cmd({}), vcAt, test)).toBe(TITLE);
  });

  it('looks up a named procedure when procedure_key is set', () => {
    expect(generateTestTitle(cmd({ procedure_key: 'proc-1' }), at, test)).toBe('Custom procedure title');
  });

  it('returns the plain title when virtual_location is "na"', () => {
    expect(generateTestTitle(cmd({}), at, test)).toBe(TITLE);
  });

  it('target/target/target: "on the target of"', () => {
    const c = cmd({ before: { virtual_location: 'target', focus_location: 'target' }, after: 'target', css_target: '.btn' });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' on the target of `.btn`');
  });

  it('start of target/start of target/start of target: "while at the start of"', () => {
    const c = cmd({
      before: { virtual_location: 'start of target', focus_location: 'start of target' },
      after: 'start of target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' while at the start of `.btn`');
  });

  it('end of target/end of target/end of target: "while at the end of"', () => {
    const c = cmd({
      before: { virtual_location: 'end of target', focus_location: 'end of target' },
      after: 'end of target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' while at the end of `.btn`');
  });

  it('within target/within target/within target: "while within"', () => {
    const c = cmd({
      before: { virtual_location: 'within target', focus_location: 'within target' },
      after: 'within target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' while within `.btn`');
  });

  it('before target -> target: "to navigate forward to", no suffix when focus matches virtual', () => {
    const c = cmd({
      before: { virtual_location: 'before target', focus_location: 'before target' },
      after: 'target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate forward to `.btn`');
  });

  it('before target -> target: adds the "(leave keyboard focus ...)" suffix when focus differs', () => {
    const c = cmd({ before: { virtual_location: 'before target', focus_location: 'target' }, after: 'target', css_target: '.btn' });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate forward to `.btn` (leave keyboard focus the target)');
  });

  it('before target -> within target: "to navigate forward into"', () => {
    const c = cmd({
      before: { virtual_location: 'before target', focus_location: 'before target' },
      after: 'within target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate forward into `.btn`');
  });

  it('before target -> start of target: "to navigate forward to the start of"', () => {
    const c = cmd({
      before: { virtual_location: 'before target', focus_location: 'before target' },
      after: 'start of target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate forward to the start of `.btn`');
  });

  it('after target -> target: "to navigate backwards to"', () => {
    const c = cmd({
      before: { virtual_location: 'after target', focus_location: 'after target' },
      after: 'target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate backwards to `.btn`');
  });

  it('after target -> within target: "to navigate backwards into"', () => {
    const c = cmd({
      before: { virtual_location: 'after target', focus_location: 'after target' },
      after: 'within target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate backwards into `.btn`');
  });

  it('after target -> end of target: "to navigate backwards to the end of"', () => {
    const c = cmd({
      before: { virtual_location: 'after target', focus_location: 'after target' },
      after: 'end of target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate backwards to the end of `.btn`');
  });

  it('within target -> end of target: "to navigate forwards to the end of"', () => {
    const c = cmd({
      before: { virtual_location: 'within target', focus_location: 'within target' },
      after: 'end of target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate forwards to the end of `.btn`');
  });

  it('within target -> after target: "to navigate forwards out of"', () => {
    const c = cmd({
      before: { virtual_location: 'within target', focus_location: 'within target' },
      after: 'after target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate forwards out of `.btn`');
  });

  it('within target -> start of target: "to navigate backwards to the start of"', () => {
    const c = cmd({
      before: { virtual_location: 'within target', focus_location: 'within target' },
      after: 'start of target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate backwards to the start of `.btn`');
  });

  it('within target -> before target: "to navigate backwards out of"', () => {
    const c = cmd({
      before: { virtual_location: 'within target', focus_location: 'within target' },
      after: 'before target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate backwards out of `.btn`');
  });

  it('within target -> within target (exact triple already handled above, so this exercises the later fallback branch with a differing focus_location): "to navigate within"', () => {
    const c = cmd({
      before: { virtual_location: 'within target', focus_location: 'target' },
      after: 'within target',
      css_target: '.btn',
    });
    expect(generateTestTitle(c, at, test)).toBe(TITLE + ' to navigate within `.btn` (leave keyboard focus the target)');
  });

  it('falls through to "unknown" when no branch matches', () => {
    const c = cmd({ before: { virtual_location: 'somewhere else', focus_location: 'somewhere else' }, after: 'somewhere else' });
    expect(generateTestTitle(c, at, test)).toBe('unknown');
  });
});

describe('getAssertionKey', () => {
  const testWithAssertions = {
    assertions: [
      { feature_id: 'html/button', feature_assertion_id: 'convey_name', applied_to: null, references: [] },
      { feature_id: 'html/button', feature_assertion_id: 'convey_role', applied_to: 'aria/tab_role', references: [] },
    ],
  };

  it('finds an assertion with no applied_to/references', () => {
    expect(getAssertionKey(testWithAssertions, 'html/button', 'convey_name')).toBe(0);
  });

  it('finds an assertion by applied_to', () => {
    expect(getAssertionKey(testWithAssertions, 'html/button', 'convey_role', 'aria/tab_role')).toBe(1);
  });

  it('returns -1 when nothing matches', () => {
    expect(getAssertionKey(testWithAssertions, 'html/button', 'nonexistent')).toBe(-1);
  });
});
