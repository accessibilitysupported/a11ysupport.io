/**
 * T030: port of src/test-id-helper.js, verbatim. Shared by server and client, so it lives in
 * src/lib/ rather than src/build/ (per plan.md's Project Structure).
 *
 * `generateTestTitle` is kept as a direct port of the original if-ladder rather than converted
 * to a lookup table: at ~110 lines it's nowhere near the 600-line cap on its own, and a
 * restructuring here would add real risk (17 branches, several with shared suffix logic) for no
 * correctness or size benefit — this deviates from the task's original wording in favor of the
 * migration's stated priority of preserving exact behavior over incidental cleanup.
 */

export function makeSafe(id: string): string {
  return id.replace(/\//g, '__');
}

export function undoMakeSafe(id: string): string {
  return id.replace(/__/g, '/');
}

export function trimTechFromAssertion(str: string): string {
  str = str.replace('The assistive technology ', '');
  str = str.replace('The screen reader', '');
  return str;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateTestTitle(command: any, at: any, test: any): string {
  const getHumanLocation = (location: string) => location.replace(/(target)/g, 'the $1');

  if (command.title && command.steps) {
    return (
      command.title + ' using ' + at.commands[command.command].name + ' (' + at.commands[command.command].command + ')'
    );
  }

  if (command.title) {
    return command.title;
  }

  const title = 'Use ' + at.commands[command.command].command + ' (' + at.commands[command.command].name + ')';

  if (at.type === 'vc') {
    return title;
  }

  if (command.procedure_key) {
    const procedure = getProcedure(test, command.procedure_key);
    return procedure.title;
  }

  if (command.before.virtual_location === 'na') {
    // This is a command where the location of focus/cursor does not matter (like opening a list of elements)
    return title;
  }

  if (
    command.before.virtual_location === 'target' &&
    command.before.focus_location === 'target' &&
    command.after === 'target'
  ) {
    return title + ' on the target of `' + command.css_target + '`';
  }

  if (
    command.before.virtual_location === 'start of target' &&
    command.before.focus_location === 'start of target' &&
    command.after === 'start of target'
  ) {
    return title + ' while at the start of `' + command.css_target + '`';
  }

  if (
    command.before.virtual_location === 'end of target' &&
    command.before.focus_location === 'end of target' &&
    command.after === 'end of target'
  ) {
    return title + ' while at the end of `' + command.css_target + '`';
  }

  if (
    command.before.virtual_location === 'within target' &&
    command.before.focus_location === 'within target' &&
    command.after === 'within target'
  ) {
    return title + ' while within `' + command.css_target + '`';
  }

  if (command.before.virtual_location === 'before target' && command.after === 'target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate forward to `' + command.css_target + '`' + suffix;
  }

  if (command.before.virtual_location === 'before target' && command.after === 'within target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate forward into `' + command.css_target + '`' + suffix;
  }

  if (command.before.virtual_location === 'before target' && command.after === 'start of target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate forward to the start of `' + command.css_target + '`' + suffix;
  }

  if (command.before.virtual_location === 'after target' && command.after === 'target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate backwards to `' + command.css_target + '`' + suffix;
  }

  if (command.before.virtual_location === 'after target' && command.after === 'within target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate backwards into `' + command.css_target + '`' + suffix;
  }

  if (command.before.virtual_location === 'after target' && command.after === 'end of target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate backwards to the end of `' + command.css_target + '`' + suffix;
  }

  if (command.before.virtual_location === 'within target' && command.after === 'end of target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate forwards to the end of `' + command.css_target + '`' + suffix;
  }

  if (command.before.virtual_location === 'within target' && command.after === 'after target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate forwards out of `' + command.css_target + '`' + suffix;
  }

  if (command.before.virtual_location === 'within target' && command.after === 'start of target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate backwards to the start of `' + command.css_target + '`' + suffix;
  }

  if (command.before.virtual_location === 'within target' && command.after === 'before target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate backwards out of `' + command.css_target + '`' + suffix;
  }

  if (command.before.virtual_location === 'within target' && command.after === 'within target') {
    let suffix = '';
    if (command.before.virtual_location !== command.before.focus_location) {
      suffix = ' (leave keyboard focus ' + getHumanLocation(command.before.focus_location) + ')';
    }
    return title + ' to navigate within `' + command.css_target + '`' + suffix;
  }

  return 'unknown';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProcedure(test: any, key: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return test.procedures.find((obj: any) => obj.key === key);
}

export function getAssertionKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  test: any,
  feature_id: string,
  feature_assertion_id: string,
  applied_to?: string | null,
  references?: string[] | null
): number {
  if (!references) {
    references = [];
  }
  if (!applied_to) {
    applied_to = null;
  }
  return test.assertions.findIndex(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (obj: any) =>
      obj.feature_id === feature_id &&
      obj.feature_assertion_id === feature_assertion_id &&
      obj.applied_to === applied_to &&
      obj.references.join('-') === references!.join('-')
  );
}
