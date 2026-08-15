/**
 * T069 (part): port of the sessionStorage persistence in public/js/feature-test.js (the `at`/
 * `browser` selection plus per-AT/browser `at_version`/`browser_version`/`os_version` values),
 * verbatim key names so existing saved preferences in a visitor's browser keep working.
 */
import { useState } from 'react';

export function useTestingPrefs() {
  const [at, setAtState] = useState<string | null>(() => sessionStorage.getItem('at'));
  const [browser, setBrowserState] = useState<string | null>(() => sessionStorage.getItem('browser'));

  const setCombination = (newAt: string, newBrowser: string) => {
    sessionStorage.setItem('at', newAt);
    sessionStorage.setItem('browser', newBrowser);
    setAtState(newAt);
    setBrowserState(newBrowser);
  };

  const getSavedVersion = (key: 'at_version' | 'browser_version' | 'os_version', id: string): string | null =>
    sessionStorage.getItem(`${key}_${id}`);

  const saveVersion = (key: 'at_version' | 'browser_version' | 'os_version', id: string, value: string) => {
    sessionStorage.setItem(`${key}_${id}`, value);
  };

  return { at, browser, setCombination, getSavedVersion, saveVersion };
}
