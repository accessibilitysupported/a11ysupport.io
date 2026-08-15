/**
 * T069 (part): port of test-case-run.pug:121-155 — one result's fieldset (legend naming the
 * expectation, examples, a pass/fail/partial/unknown select, notes). Controlled inputs
 * (initialized from the authored `result.result`/`result.note`) rather than the original's
 * separate hidden `-before` input + DOM-queried `-after` value — an equally faithful way to
 * reach the same before/after diff at submit time (RunTestForm compares current state to the
 * initial value it was seeded with), without needing a manual DOM ref registry.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

interface Props {
  idPrefix: string;
  assertion: Any;
  value: { result: string; note: string };
  onChange: (value: { result: string; note: string }) => void;
}

export function ResultFieldset({ idPrefix, assertion, value, onChange }: Props) {
  return (
    <fieldset>
      <legend>
        {assertion.feature_title}, {assertion.assertion_strength[assertion.atType]} {assertion.assertion_title}
        {assertion.applied_to_title && <span>, applied to {assertion.applied_to_title}</span>}
        {assertion.references_titles && <span>, references {assertion.references_titles}</span>}
      </legend>

      {assertion.assertion_examples && (
        <>
          <p>Examples:</p>
          <ul>
            {assertion.assertion_examples.map((example: string, i: number) => (
              <li key={i}>{example}</li>
            ))}
          </ul>
        </>
      )}

      <label htmlFor={`${idPrefix}-result`}>Result</label>
      <div>
        <select
          id={`${idPrefix}-result`}
          className="result-after"
          value={value.result}
          onChange={(e) => onChange({ ...value, result: e.target.value })}
        >
          <option value="unknown">unknown</option>
          <option value="pass">pass</option>
          <option value="fail">fail</option>
          <option value="partial">partial</option>
        </select>
      </div>

      <label htmlFor={`${idPrefix}-notes`}>Notes</label>
      <textarea
        id={`${idPrefix}-notes`}
        className="note-after"
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
      />
    </fieldset>
  );
}
