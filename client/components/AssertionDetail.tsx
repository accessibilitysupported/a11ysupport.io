/**
 * T065 (part): port of feature.pug:117-190 — one assertion's detail section (rationale,
 * strength, examples, notes, and its per-AT-type support-by-test table).
 */
import { Link } from 'react-router';
import { ResponsiveTable } from './ResponsiveTable';
import { makeSafe } from '../../src/lib/test-id-helper';
import type { ATBrowsers, AtType } from '../../src/types/at-browsers';

const AT_TYPES: Array<{ type: AtType; title: string }> = [
  { type: 'sr', title: 'Screen Reader' },
  { type: 'vc', title: 'Voice Control' },
];

export function AssertionDetail({
  assertion,
  index,
  data,
  atBrowsers,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assertion: any;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  atBrowsers: ATBrowsers;
}) {
  return (
    <div className="assertion-container">
      <h3 id={`support-table-${index}`}>Expectation: {assertion.title}</h3>

      {assertion.rationale && (
        <>
          <h4>Rationale:</h4>
          <p>{assertion.rationale}</p>
        </>
      )}

      <h4>Strength of this expectation for different types of assistive technologies:</h4>
      <ul>
        <li>Screen Readers: {assertion.strength.sr}</li>
        <li>Voice Control: {assertion.strength.vc}</li>
      </ul>

      {assertion.notes && (
        <>
          <h4>Notes:</h4>
          <p dangerouslySetInnerHTML={{ __html: assertion.notesHtml ?? assertion.notes }} />
        </>
      )}

      {assertion.examples && (
        <>
          <h4>Examples:</h4>
          <ul>
            {assertion.examples.map((example: string, i: number) => (
              <li key={i}>{example}</li>
            ))}
          </ul>
        </>
      )}

      {assertion.tests.length > 0 ? (
        <>
          {AT_TYPES.map((atType) => {
            if (assertion.strength[atType.type] === 'NA') return null;
            let someSupportBehindSettings = false;
            const coreAtForType = atBrowsers.core_at.filter(
              (at) => atBrowsers.at[at]!.type === atType.type
            );

            return (
              <ResponsiveTable key={atType.type}>
                <table className="support-summary-table">
                  <caption>
                    {atType.title} support for &apos;{assertion.strength[atType.type]}{' '}
                    {assertion.title}&apos;
                  </caption>
                  <colgroup span={1} />
                  {coreAtForType.map((at) => (
                    <colgroup key={at} span={atBrowsers.at[at]!.core_browsers.length} />
                  ))}
                  {/* No thead/tbody here — feature.pug:146-172 has none, just bare <tr>s directly
                      under <table> (browsers implicitly wrap them all in one tbody). Wrapping
                      the header rows in <thead> would make `thead th { text-align: center }`
                      apply where the original leaves the base `th { text-align: left }` in
                      effect, shifting header text — caught by tests/e2e/visual.spec.ts's
                      baseline comparison. */}
                  <tr>
                    <th rowSpan={2}>Test</th>
                    {coreAtForType.map((at) => (
                      <th
                        key={at}
                        colSpan={atBrowsers.at[at]!.core_browsers.length}
                        scope="colgroup"
                      >
                        {atBrowsers.at[at]!.title}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {coreAtForType.flatMap((at) =>
                      atBrowsers.at[at]!.core_browsers.map((browser) => (
                        <th key={`${at}-${browser}`} scope="col">
                          {atBrowsers.browsers[browser]!.title}
                        </th>
                      ))
                    )}
                  </tr>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {data.tests.map((linked_test: any) => {
                    const test_assertions = (linked_test.assertions ?? []).filter(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (obj: any) =>
                        obj.feature_id === data.id && obj.feature_assertion_id === assertion.id
                    );
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return test_assertions.map((test_assertion: any, tai: number) => (
                      <tr key={`${linked_test.id}-${tai}`}>
                        <th scope="row">
                          <Link to={`/tests/${makeSafe(linked_test.id)}`}>
                            {linked_test.title}
                            {test_assertion.applied_to && (
                              <span className="applied_to">
                                {' '}
                                applied to: {test_assertion.applied_to_title}
                              </span>
                            )}
                          </Link>
                        </th>
                        {coreAtForType.flatMap((at) =>
                          atBrowsers.at[at]!.core_browsers.map((browser) => {
                            const cell = test_assertion.core_support_by_at_browser[at][browser];
                            if (cell.some_support_behind_settings) someSupportBehindSettings = true;
                            return (
                              <td
                                className={`support-case ${cell.string.class}`}
                                key={`${at}-${browser}`}
                              >
                                <a
                                  href={`/tests/${makeSafe(linked_test.id)}#assertion-${test_assertion.feature_id.replace('/', '-')}-${test_assertion.feature_assertion_id}-${test_assertion.applied_to ? String(test_assertion.applied_to).replace('/', '-') : ''}${test_assertion.references ? test_assertion.references.join('-').replace('/', '-') : ''}-${at}-${browser}`}
                                >
                                  {cell.string.string}
                                  {cell.some_support_behind_settings && '*'}
                                </a>
                              </td>
                            );
                          })
                        )}
                      </tr>
                    ));
                  })}
                </table>
                {someSupportBehindSettings && (
                  <p>* means that some support is hidden behind settings</p>
                )}
              </ResponsiveTable>
            );
          })}
        </>
      ) : (
        <p>No tests reference this expectation yet.</p>
      )}
    </div>
  );
}
