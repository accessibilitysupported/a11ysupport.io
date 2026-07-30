/**
 * T039: derives, from build/ at request time (cached via load-build.ts), whether a given SPA
 * path resolves to real content. Used by the SPA fallback (server/app.ts) so unmatched paths
 * 404 instead of a naive catch-all returning 200 for everything — FR-009/SC-008.
 *
 * Validated dynamically against loaded build data rather than pre-enumerated, since the space of
 * valid `/tests/:testId/:featureId/:assertionId/:atId/:browserId` combinations is large and
 * derived, not listable up front.
 */
import path from 'node:path';
import type { ATBrowsers } from '../../src/types/at-browsers';
import { loadBuildFile, loadDataFile, buildFileExists } from './load-build';
import { undoMakeSafe } from '../../src/lib/test-id-helper';

const STATIC_ROUTES = new Set([
  '/',
  '/tech',
  '/tests',
  '/run-tests',
  '/updates',
  '/faq',
  '/contribute',
  '/learn',
  '/learn/vc_differences',
  '/learn/commands',
]);

// Same allow-list as routes/index.js:95.
const AT_LEARN_ALLOW_LIST = [
  'dragon',
  'jaws',
  'narrator',
  'nvda',
  'talkback',
  'vo_ios',
  'vo_macos',
  'orca',
  'vc_macos',
  'vc_ios',
  'va_and',
  'wsr',
  'win_kb',
  'va_windows',
];

function segments(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}

export function isKnownRoute(pathname: string): boolean {
  const clean = pathname.split('?')[0]!.replace(/\/+$/, '') || '/';

  if (STATIC_ROUTES.has(clean)) {
    return true;
  }

  const parts = segments(clean);

  // /tech/:techId
  if (parts[0] === 'tech' && parts.length === 2) {
    const tech = loadBuildFile<Record<string, unknown>>('tech.json');
    return Object.prototype.hasOwnProperty.call(tech, parts[1]!);
  }

  // /tech/:techId/:featureId
  if (parts[0] === 'tech' && parts.length === 3) {
    return buildFileExists(path.join('tech', parts[1]!, `${parts[2]}.json`));
  }

  // /learn/at/:id
  if (parts[0] === 'learn' && parts[1] === 'at' && parts.length === 3) {
    return AT_LEARN_ALLOW_LIST.includes(parts[2]!);
  }

  // /tests/:testId, /tests/:testId/run
  if (parts[0] === 'tests' && (parts.length === 2 || (parts.length === 3 && parts[2] === 'run'))) {
    const testMap = loadBuildFile<Record<string, unknown>>('test_map.json');
    const testId = undoMakeSafe(parts[1]!);
    return Object.prototype.hasOwnProperty.call(testMap, testId);
  }

  // /tests/:testId/:featureId/:assertionId/:atId/:browserId
  if (parts[0] === 'tests' && parts.length === 6) {
    const [, testIdSafe, featureIdSafe, assertionId, atId, browserId] = parts;
    const testId = undoMakeSafe(testIdSafe!);
    const featureId = undoMakeSafe(featureIdSafe!);

    let test: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      test = loadBuildFile(path.join('tests', `${testId}.json`));
    } catch {
      return false;
    }

    const assertion = test.assertions?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => a.feature_id === featureId && a.feature_assertion_id === assertionId
    );
    if (!assertion) return false;
    if (!assertion.results?.[atId!]) return false;
    if (!assertion.results[atId!].browsers?.[browserId!]) return false;

    const atBrowsers = loadDataFile<ATBrowsers>('ATBrowsers.json');
    if (!atBrowsers.at[atId!]) return false;

    return true;
  }

  return false;
}
