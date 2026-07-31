/**
 * T069 (part): port of test-case-run.pug:19-44 (the combination `<select>`) and
 * feature-test.js's `displayTestingPrefs` (:34-121) — selecting a combination shows a summary
 * (selected combo, a link to that AT's "how to use" page) and reveals step 2.
 */
import { useState } from 'react';
import type { ATBrowsers } from '../../../src/types/at-browsers';

interface Props {
  atBrowsers: ATBrowsers;
  onSave: (at: string, browser: string) => void;
  savedAt: string | null;
  savedBrowser: string | null;
}

export function CombinationPicker({ atBrowsers, onSave, savedAt, savedBrowser }: Props) {
  const [selection, setSelection] = useState(savedAt && savedBrowser ? `${savedAt}/${savedBrowser}` : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [at, browser] = selection.split('/');
    if (at && browser) onSave(at, browser);
  };

  return (
    <>
      <h2 id="at-browser-combo" tabIndex={-1}>Step 1: What are you testing with?</h2>
      <form className="testing-pref" onSubmit={handleSubmit}>
        <label htmlFor="combination">Select your testing combination.</label>
        <div>
          <select id="combination" value={selection} onChange={(e) => setSelection(e.target.value)}>
            <optgroup label="Core combinations">
              {atBrowsers.core_at.flatMap((at) =>
                atBrowsers.at[at]!.core_browsers.map((browserId) => (
                  <option key={`${at}/${browserId}`} value={`${at}/${browserId}`}>
                    {atBrowsers.at[at]!.short_title} / {atBrowsers.browsers[browserId]!.title} (core)
                  </option>
                ))
              )}
            </optgroup>
            <optgroup label="Extended combinations">
              {Object.entries(atBrowsers.at).flatMap(([atId, at]) => [
                ...(atBrowsers.extended_at.includes(atId)
                  ? at.core_browsers.map((browserId) => (
                      <option key={`${atId}/${browserId}`} value={`${atId}/${browserId}`}>
                        {at.short_title} / {atBrowsers.browsers[browserId]!.title} (extended)
                      </option>
                    ))
                  : []),
                ...at.extended_browsers.map((browserId) => (
                  <option key={`${atId}/${browserId}-ext`} value={`${atId}/${browserId}`}>
                    {at.short_title} / {atBrowsers.browsers[browserId]!.title} (extended)
                  </option>
                )),
              ])}
            </optgroup>
          </select>
        </div>
        <p>Note: your selection will be saved until you change it or clear your browser cache.</p>
        <button type="submit">save my testing combination</button>
      </form>
    </>
  );
}
