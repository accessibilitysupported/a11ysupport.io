/**
 * T069 (part): port of test-case-run.pug:94-156 — one command's fieldset: legend, test
 * procedure, output/notes/behind-setting textareas, and one ResultFieldset per linked result.
 */
import { TestProcedure } from '../../components/TestProcedure';
import { ResultFieldset } from './ResultFieldset';
import { generateTestTitle, getProcedure, getAssertionKey } from '../../../src/lib/test-id-helper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export interface CommandState {
  output: string;
  notes: string;
  behindSetting: string;
  results: Record<number, { result: string; note: string }>;
}

interface Props {
  at: Any;
  browserId: string;
  browser: Any;
  test: Any;
  command: Any;
  commandIndex: number;
  state: CommandState;
  onChange: (state: CommandState) => void;
}

export function CommandFieldset({ at, browserId, browser, test, command, commandIndex, state, onChange }: Props) {
  const resolvedCommand = command.procedure_key
    ? Object.assign({}, getProcedure(test, command.procedure_key), command)
    : command;
  const idBase = `${at.id}-${browserId}-${commandIndex}`;

  return (
    <fieldset className="command">
      <legend>Test case: {generateTestTitle(command, at, test)}</legend>
      <TestProcedure testCase={resolvedCommand} at={at} browser={browser} test={test} />

      <label htmlFor={`${idBase}-output`}>Output</label>
      <textarea
        id={`${idBase}-output`}
        className="output-after"
        value={state.output}
        onChange={(e) => onChange({ ...state, output: e.target.value })}
      />

      <label htmlFor={`${idBase}-notes`}>Notes</label>
      <textarea
        id={`${idBase}-notes`}
        className="notes-after"
        value={state.notes}
        onChange={(e) => onChange({ ...state, notes: e.target.value })}
      />

      <label htmlFor={`${idBase}-behind-setting`}>
        If support is hidden behind non-default settings, briefly describe that setting
      </label>
      <textarea
        id={`${idBase}-behind-setting`}
        className="behind-setting-after"
        value={state.behindSetting}
        onChange={(e) => onChange({ ...state, behindSetting: e.target.value })}
      />

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {command.results.map((result: any, resultIndex: number) => {
        const assertionKey = getAssertionKey(test, result.feature_id, result.feature_assertion_id, result.applied_to, result.references);
        const assertion = { ...test.assertions[assertionKey], atType: at.type };
        const resultState = state.results[resultIndex] ?? { result: result.result ?? 'unknown', note: result.note ?? '' };

        return (
          <ResultFieldset
            key={resultIndex}
            idPrefix={`${idBase}-results-${resultIndex}`}
            assertion={assertion}
            value={resultState}
            onChange={(value) =>
              onChange({
                ...state,
                results: { ...state.results, [resultIndex]: value },
              })
            }
          />
        );
      })}
    </fieldset>
  );
}
