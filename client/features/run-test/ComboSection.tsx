/**
 * T069 (part): port of test-case-run.pug:85-101 — the per-AT/browser `.combo` section, hidden
 * unless it's the currently-selected combination.
 */
import { CommandFieldset } from './CommandFieldset';
import type { CommandState } from './CommandFieldset';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

interface Props {
  at: Any;
  browserId: string;
  browser: Any;
  test: Any;
  devTest: Any;
  visible: boolean;
  headingRef?: React.Ref<HTMLHeadingElement>;
  commandStates: Record<number, CommandState>;
  onCommandChange: (commandIndex: number, state: CommandState) => void;
}

export function ComboSection({ at, browserId, browser, test, devTest, visible, headingRef, commandStates, onCommandChange }: Props) {
  const commands = devTest.commands?.[at.id]?.[browserId];

  return (
    <div id={`combo-${at.id}-${browserId}`} hidden={!visible} className="combo">
      <h3 tabIndex={-1} ref={headingRef}>
        Test cases for {at.title} + {browser.title}
      </h3>
      {!commands ? (
        <p>The test has not been configured for this combination. Please open a GitHub issue.</p>
      ) : (
        commands.map((command: Any, commandIndex: number) => (
          <CommandFieldset
            key={commandIndex}
            at={at}
            browserId={browserId}
            browser={browser}
            test={test}
            command={command}
            commandIndex={commandIndex}
            state={
              commandStates[commandIndex] ?? {
                output: command.output ?? '',
                notes: command.notes ?? '',
                behindSetting: command.behind_setting ?? '',
                results: {},
              }
            }
            onChange={(state) => onCommandChange(commandIndex, state)}
          />
        ))
      )}
    </div>
  );
}
