/**
 * T069: port of public/js/feature-test.js + test-case-run.pug's Step 2 form. Orchestrates
 * CombinationPicker, ComboSection/CommandFieldset/ResultFieldset, ErrorSummary, and IssueOutput.
 */
import { useState } from 'react';
import { CombinationPicker } from './CombinationPicker';
import { ComboSection } from './ComboSection';
import { ErrorSummary } from './ErrorSummary';
import type { FieldError } from './ErrorSummary';
import { IssueOutput } from './IssueOutput';
import { useTestingPrefs } from './useTestingPrefs';
import { buildIssueBody, isCoreCombination } from './buildIssueBody';
import type { CommandDiffInput } from './buildIssueBody';
import type { CommandState } from './CommandFieldset';
import type { ATBrowsers } from '../../../src/types/at-browsers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

interface Props {
  atBrowsers: ATBrowsers;
  test: Any;
  devTest: Any;
}

export function RunTestForm({ atBrowsers, test, devTest }: Props) {
  const prefs = useTestingPrefs();
  const [atVersion, setAtVersion] = useState('');
  const [osVersion, setOsVersion] = useState('');
  const [browserVersion, setBrowserVersion] = useState('');
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [issueBody, setIssueBody] = useState<string | null>(null);
  const [issueUrl, setIssueUrl] = useState('');

  // commandStates keyed by "at/browser" combo, then by command index.
  const [commandStates, setCommandStates] = useState<Record<string, Record<number, CommandState>>>({});

  const handleSaveCombination = (at: string, browser: string) => {
    prefs.setCombination(at, browser);
    setAtVersion(prefs.getSavedVersion('at_version', at) ?? '');
    setBrowserVersion(prefs.getSavedVersion('browser_version', browser) ?? '');
    setOsVersion(prefs.getSavedVersion('os_version', at) ?? '');
  };

  const comboKey = prefs.at && prefs.browser ? `${prefs.at}/${prefs.browser}` : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newInvalid = new Set<string>();
    const newErrors: FieldError[] = [];

    if (!prefs.at) {
      newInvalid.add('at');
      newErrors.push({ href: '#at-browser-combo', message: "'AT used' is required" });
    }
    if (!prefs.browser) {
      newInvalid.add('browser');
      newErrors.push({ href: '#at-browser-combo', message: "'Browser used' is required" });
    }
    if (!atVersion) {
      newInvalid.add('at_version');
      newErrors.push({ href: '#at_version', message: "'AT version' is required" });
    }
    if (!browserVersion) {
      newInvalid.add('browser_version');
      newErrors.push({ href: '#browser_version', message: "'Browser version' is required" });
    }
    if (!osVersion) {
      newInvalid.add('os_version');
      newErrors.push({ href: '#os_version', message: "'OS version' is required" });
    }

    setInvalidFields(newInvalid);
    setErrors(newErrors);

    if (newErrors.length > 0 || !prefs.at || !prefs.browser) {
      return;
    }

    prefs.saveVersion('browser_version', prefs.browser, browserVersion);
    prefs.saveVersion('at_version', prefs.at, atVersion);
    prefs.saveVersion('os_version', prefs.at, osVersion);

    const commands = devTest.commands?.[prefs.at]?.[prefs.browser] ?? [];
    const states = commandStates[comboKey!] ?? {};

    const commandDiffs: CommandDiffInput[] = commands.map((command: Any, commandIndex: number) => {
      const state: CommandState = states[commandIndex] ?? {
        output: command.output ?? '',
        notes: command.notes ?? '',
        behindSetting: command.behind_setting ?? '',
        results: {},
      };

      return {
        legend: command.title ?? command.command,
        command: command.command,
        outputBefore: command.output ?? '',
        outputAfter: state.output,
        notesBefore: command.notes ?? '',
        notesAfter: state.notes,
        behindSettingBefore: command.behind_setting ?? '',
        behindSettingAfter: state.behindSetting,
        results: (command.results ?? []).map((result: Any, resultIndex: number) => {
          const resultState = state.results[resultIndex] ?? { result: result.result ?? 'unknown', note: result.note ?? '' };
          let key = `${result.feature_id}; ${result.feature_assertion_id}`;
          if (result.applied_to) key += `; applied to: ${result.applied_to}`;
          if (result.references) key += `; references: ${result.references}`;
          return {
            legend: `${result.feature_id}/${result.feature_assertion_id}`,
            key,
            resultBefore: result.result ?? '',
            resultAfter: resultState.result,
            noteBefore: result.note ?? '',
            noteAfter: resultState.note,
          };
        }),
      };
    });

    const body = buildIssueBody(
      test.title,
      test.id,
      window.location.pathname.replace(/\/run$/, ''),
      { at: prefs.at, atVersion, browser: prefs.browser, browserVersion, osVersion },
      commandDiffs
    );

    const isCore = isCoreCombination(
      atBrowsers.core_at,
      Object.fromEntries(Object.entries(atBrowsers.at).map(([id, a]) => [id, a.core_browsers])),
      prefs.at,
      prefs.browser
    );
    const labels = ['needs verification', 'support point', isCore ? 'core support' : 'extended support'];
    const url = `https://github.com/accessibilitysupported/accessibilitysupported/issues/new?title=${encodeURIComponent(
      `${test.id} ${prefs.at}/${prefs.browser}`
    )}&labels=${labels.map(encodeURIComponent).join(',')}`;

    setIssueBody(body);
    setIssueUrl(url);
  };

  const allAtIds = Object.keys(atBrowsers.at);

  return (
    <div id="run-test-container">
      <CombinationPicker atBrowsers={atBrowsers} onSave={handleSaveCombination} savedAt={prefs.at} savedBrowser={prefs.browser} />

      {prefs.at && prefs.browser && (
        <div id="testing-pref-results" className="call-out">
          <h4 tabIndex={-1}>Some helpful information based on your selection</h4>
          <dl>
            <dt>Selected combination</dt>
            <dd>
              {atBrowsers.at[prefs.at]!.short_title} / {atBrowsers.browsers[prefs.browser]!.title}
            </dd>
            <dt>Helpful Links</dt>
            <dd>
              <ul>
                <li>
                  <a href={`/learn/at/${prefs.at}`}>Learn how to use {atBrowsers.at[prefs.at]!.short_title}</a>
                </li>
              </ul>
            </dd>
          </dl>
          <p>
            <span className="selected-at-browser-combo">
              {atBrowsers.at[prefs.at]!.title} and {atBrowsers.browsers[prefs.browser]!.title}
            </span>
          </p>
        </div>
      )}

      <div className="call-out">
        <h3>Make sure everything is up to date</h3>
        <p>
          Always make sure that your OS, Browser, and Assistive technology are up to date with the latest
          production versions before submitting test results. Also make sure that your assistive technology is
          set to factory defaults.
        </p>
      </div>

      <p>Please be sure to read the full instructions before completing the test.</p>

      <div id="step2">
        <h2>Step 2: Run test cases and submit your findings</h2>
        <ol>
          <li>Launch the chosen assistive technology that you want to test with.</li>
          <li>Ensure that your OS, AT, and Browser are all up to date.</li>
          <li>
            Navigate to <a href={`/tests/html/${test.html_file}`}>the test page</a>.
          </li>
          <li>For each test case, locate the target element(s) and test whether or not the expectations are met</li>
        </ol>

        <p className="note">
          Note: Screen readers will usually announce an element in the format:{' '}
          <span className="inline-quote">
            &quot;&lt;role&gt;, &lt;accessible name&gt;, &lt;other states and properties&gt;, &lt;accessible
            description&gt;&quot;
          </span>
          . The order in which the name, role, and properties are announced might differ between screen readers.
          The exact vocabulary used will also differ.
        </p>

        <form className="submit-test-result stacked-form" onSubmit={handleSubmit}>
          <input type="hidden" name="title" value={test.id} />

          <ErrorSummary errors={errors} />

          <div className="control">
            <fieldset>
              <legend>Technology information</legend>
              <div className="control at-browser-combo">
                <p>
                  <strong>The selected AT/Browser combo is: </strong>
                  <span className="selected-at-browser-combo">
                    {prefs.at && prefs.browser
                      ? `${atBrowsers.at[prefs.at]!.title} / ${atBrowsers.browsers[prefs.browser]!.title}`
                      : ''}
                  </span>
                </p>
                <p>
                  Use the <a href="#at-browser-combo">&quot;what are you testing with?&quot;</a> form to change
                  your combination.
                </p>
              </div>
              <div className="control">
                <label htmlFor="at_version">AT Version (required)</label>
                <input
                  type="text"
                  name="at_version"
                  id="at_version"
                  aria-required="true"
                  aria-invalid={invalidFields.has('at_version') || undefined}
                  value={atVersion}
                  onChange={(e) => setAtVersion(e.target.value)}
                />
              </div>
              <div className="control">
                <label htmlFor="os_version">OS Version (required)</label>
                <input
                  type="text"
                  name="os_version"
                  id="os_version"
                  aria-required="true"
                  aria-invalid={invalidFields.has('os_version') || undefined}
                  value={osVersion}
                  onChange={(e) => setOsVersion(e.target.value)}
                />
              </div>
              <div className="control">
                <label htmlFor="browser_version">Browser Version (required)</label>
                <input
                  type="text"
                  name="browser_version"
                  id="browser_version"
                  aria-required="true"
                  aria-invalid={invalidFields.has('browser_version') || undefined}
                  value={browserVersion}
                  onChange={(e) => setBrowserVersion(e.target.value)}
                />
              </div>
            </fieldset>
          </div>

          <div id="assertions" className="control">
            {allAtIds.map((atId) => {
              const at = atBrowsers.at[atId]!;
              const allBrowsers = [...at.core_browsers, ...at.extended_browsers];
              return allBrowsers.map((browserId) => {
                const key = `${atId}/${browserId}`;
                return (
                  <ComboSection
                    key={key}
                    at={at}
                    browserId={browserId}
                    browser={atBrowsers.browsers[browserId]}
                    test={test}
                    devTest={devTest}
                    visible={comboKey === key}
                    commandStates={commandStates[key] ?? {}}
                    onCommandChange={(commandIndex, state) =>
                      setCommandStates((prev) => ({
                        ...prev,
                        [key]: { ...(prev[key] ?? {}), [commandIndex]: state },
                      }))
                    }
                  />
                );
              });
            })}
          </div>

          <div className="control">
            <button type="submit">Create GitHub Issue</button>
          </div>

          {issueBody !== null && <IssueOutput issueBody={issueBody} issueUrl={issueUrl} />}
        </form>
      </div>
    </div>
  );
}
