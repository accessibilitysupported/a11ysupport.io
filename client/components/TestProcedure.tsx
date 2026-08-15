/**
 * T056: port of test-procedure.mixin.pug, verbatim. The mixin's `ATBrowsers` parameter is
 * dropped — it was declared but never referenced in the original body.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

interface Props {
  testCase: Any;
  at: Any;
  browser: Any;
  test: Any;
}

export function TestProcedure({ testCase, at, browser, test }: Props) {
  return (
    <ol>
      <li>
        Launch {at.title} and {browser.title}.
      </li>
      <li>
        Navigate to <a href={'/tests/html/' + test.html_file}>the test page</a>.
      </li>
      {testCase.before ? (
        <>
          <li>
            Find the target element(s) that you will test against. Identify all elements that match this
            selector:
            <code>{testCase.css_target}</code>
            <ul>
              <li>
                If multiple elements match the selector, repeat this test for all instances. However, choose a
                single instance to report against. If you feel that the selector should be more specific, please
                open a GitHub Issue.
              </li>
            </ul>
          </li>
          {at.type === 'sr' ? (
            <>
              <li>
                Position and configure the screen reader so that the following conditions are met
                <ul>
                  {testCase.before.virtual_location && testCase.before.virtual_location !== 'na' && (
                    <li>Virtual focus is: {testCase.before.virtual_location}</li>
                  )}
                  {testCase.before.focus_location && testCase.before.focus_location !== 'na' && (
                    <li>Keyboard focus is: {testCase.before.focus_location}</li>
                  )}
                  {testCase.before.mode && testCase.before.mode !== 'na' && (
                    <li>
                      Mode is: {testCase.before.mode}
                      {testCase.before.mode === 'auto' ? (
                        <span> (do not explicitly change the mode)</span>
                      ) : (
                        <span> (explicitly change the mode if needed)</span>
                      )}
                    </li>
                  )}
                </ul>
              </li>
              <li>
                Issue the command:
                <code> {at.commands[testCase.command].command}</code>
                <span> ({at.commands[testCase.command].name})</span>
                <ul>
                  <li>After issuing the command, virtual focus should be: {testCase.after}</li>
                </ul>
              </li>
              <li>Record results for the relevant expectations</li>
            </>
          ) : (
            <>
              <li>
                Issue the command:
                <code> {at.commands[testCase.command].command}</code>
                <span> ({at.commands[testCase.command].name})</span>
              </li>
              <li>Record results for the relevant expectations</li>
            </>
          )}
        </>
      ) : testCase.steps ? (
        <>
          {testCase.steps.map((step: Any, index: number) => (
            <StepItem key={index} step={step} testCase={testCase} at={at} />
          ))}
          <li>is the expectation met?</li>
        </>
      ) : (
        <p>unknown test procedure</p>
      )}
    </ol>
  );
}

function StepItem({ step, testCase, at }: { step: Any; testCase: Any; at: Any }) {
  if (step.action === 'find target') {
    return (
      <li>
        Find the target element(s) that you will test against. Identify all elements that match this selector:
        <code>{testCase.css_target}</code>
        <ul>
          <li>
            If multiple elements match the selector, repeat this test for all instances. However, choose a
            single instance to report against. If you feel that the selector should be more specific, please
            open a GitHub Issue.
          </li>
        </ul>
      </li>
    );
  }

  if (step.action === 'set mode to') {
    return (
      <li>
        {step.action} {step.value}
        {step.value === 'auto' && <span> (do not explicitly change the mode)</span>}
      </li>
    );
  }

  if (step.action === 'set value') {
    const step_target = step.target !== 'target' ? step.target : 'the target';
    return (
      <li>
        Set the value of {step_target} to &quot;{step.value}&quot;
      </li>
    );
  }

  if (step.action === 'position AT') {
    return (
      <li>
        Position the AT so that the following is true
        <ul>
          {step.focus && (
            <li>
              <strong>keyboard focus location: </strong>
              <span>{step.focus}</span>
            </li>
          )}
          {step.virtual && (
            <li>
              <strong>virtual cursor location: </strong>
              <span>{step.virtual}</span>
            </li>
          )}
        </ul>
      </li>
    );
  }

  if (step.action === 'issue command') {
    let command = step.command;
    if (command && command.startsWith('params.commands')) {
      command = command.split('params.commands.')[1];
      command = testCase.params.commands[command];
    }
    const effectiveCommand = step.command ? command : testCase.command;
    const knownCommand = at.commands[effectiveCommand];

    return (
      <li>
        {step.action}
        <ul>
          {step.summary && <li>summary: {step.summary}</li>}
          <li>
            Using the command:
            {knownCommand ? (
              <>
                <span> &quot;{knownCommand.command}&quot;</span>
                <span> ({knownCommand.name})</span>
              </>
            ) : (
              <strong> &quot;{effectiveCommand}&quot;</strong>
            )}
          </li>
          {step.multiple && <li>You may need to issue this command multiple times</li>}
          {step.observe && <li>Observe: {step.observe}</li>}
          {step.ensure_at_location && (
            <li>
              Ensure AT location after executing the command
              <ul>
                <li>Target: `{step.target ? step.target : testCase.css_target}`</li>
                {step.ensure_at_location.focus && (
                  <li>
                    <strong>keyboard focus location: </strong>
                    <span>{step.ensure_at_location.focus}</span>
                  </li>
                )}
                {step.ensure_at_location.virtual && (
                  <li>
                    <strong>virtual cursor location: </strong>
                    <span>{step.ensure_at_location.virtual}</span>
                  </li>
                )}
              </ul>
            </li>
          )}
        </ul>
      </li>
    );
  }

  return null;
}
