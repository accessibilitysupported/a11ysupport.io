/**
 * T003 (Phase 0): the branch-driven route inventory.
 *
 * One route per template proves very little — the templates branch heavily on data (189
 * features, 128 tests). This queries `build/` and `data/` at runtime to pick a concrete route
 * for every branch listed in the source plan's Phase 0 table, so the baseline actually exercises
 * the conditionals in each template rather than just its happy path.
 *
 * Run directly (`tsx tools/baseline/routes.ts`) to print the inventory as JSON. Imported by
 * `tools/baseline/capture.ts` (T004) to drive the actual capture.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const buildFile = (p: string) => path.join(ROOT, 'build', p);
const dataFile = (p: string) => path.join(ROOT, 'data', p);

function readJson<T = any>(absPath: string): T {
  return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

function makeSafe(id: string): string {
  return id.replace(/\//g, '__');
}

export interface BaselineRoute {
  /** Site-relative path to capture. */
  path: string;
  /** Human-readable label identifying which template branch this exercises. */
  label: string;
}

function findFirst<T>(items: T[], predicate: (item: T) => boolean): T | undefined {
  return items.find(predicate);
}

function homeRoutes(): BaselineRoute[] {
  // index.pug branches: feature with real support data, feature with none, feature with
  // possible_backend_expectations, feature triggering the onlyNegativeSupportFound footnote.
  // The route is always "/" — these are documented so a reviewer can locate each branch in the
  // captured HTML, not separate URLs (the home page renders all features on one page).
  const features = readJson<any[]>(buildFile('features.json'));
  const withData = findFirst(features, (f) => f.assertions.length > 0 && f.total_test_count > 0);
  const withoutData = findFirst(features, (f) => f.assertions.length === 0 || f.total_test_count === 0);
  const withExpectationCaveat = findFirst(features, (f) => !!f.possible_backend_expectations);
  const withOnlyNegative = findFirst(features, (f) =>
    Object.values(f.core_support_by_at_browser || {}).some((atRow: any) =>
      Object.values(atRow || {}).some((cell: any) => cell?.onlyNegativeSupport)
    )
  );
  const notes = [
    withData && `has-support-data: ${withData.techId}/${withData.id}`,
    withoutData && `no-support-data: ${withoutData.techId}/${withoutData.id}`,
    withExpectationCaveat && `backend-expectation-caveat: ${withExpectationCaveat.techId}/${withExpectationCaveat.id}`,
    withOnlyNegative && `only-negative-support-footnote: ${withOnlyNegative.techId}/${withOnlyNegative.id}`,
  ]
    .filter(Boolean)
    .join('; ');
  return [{ path: '/', label: `index (${notes})` }];
}

function techRoutes(): BaselineRoute[] {
  const tech = readJson<Record<string, any>>(buildFile('tech.json'));
  const routes: BaselineRoute[] = [{ path: '/tech', label: 'tech-index' }];
  const entries = Object.entries(tech);
  if (entries.length === 0) return routes;

  const byFeatureCount = [...entries].sort(
    (a, b) => (a[1].features || []).length - (b[1].features || []).length
  );
  // A true zero-feature technology doesn't exist in the current dataset (every tech has >=1
  // feature); the sparsest one (svg, 1 feature today) is the closest available edge case for
  // "tech with few/no features" and is what this route exercises.
  const [sparseId] = byFeatureCount[0]!;
  routes.push({ path: `/tech/${sparseId}`, label: `tech (sparsest feature list: ${sparseId})` });
  const [richId] = byFeatureCount[byFeatureCount.length - 1]!;
  if (richId !== sparseId) {
    routes.push({ path: `/tech/${richId}`, label: `tech (richest feature list: ${richId})` });
  }
  return routes;
}

function featureRoutes(): BaselineRoute[] {
  const features = readJson<any[]>(buildFile('features.json'));
  const routes: BaselineRoute[] = [];

  const withAssertions = findFirst(features, (f) => f.assertions.length > 0);
  const withRelatedFeatures = findFirst(features, (f) => {
    try {
      const full = readJson(buildFile(`tech/${f.techId}/${f.id}.json`));
      return Array.isArray(full.related_features) && full.related_features.length > 0;
    } catch {
      return false;
    }
  });
  const withRelatedIssues = findFirst(features, (f) => {
    try {
      const full = readJson(buildFile(`tech/${f.techId}/${f.id}.json`));
      return Array.isArray(full.related_issues) && full.related_issues.length > 0;
    } catch {
      return false;
    }
  });
  const withUntestedAssertion = findFirst(features, (f) => {
    try {
      const full = readJson(buildFile(`tech/${f.techId}/${f.id}.json`));
      return (full.assertions || []).some((a: any) => (a.tests || []).length === 0);
    } catch {
      return false;
    }
  });
  const staleFailing = findFirst(features, (f) => {
    if (!f.failing_dates?.max) return false;
    const ageMonths =
      (Date.now() - new Date(f.failing_dates.max).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return ageMonths >= 9;
  });
  const recentFailing = findFirst(features, (f) => {
    if (!f.failing_dates?.max) return false;
    const ageMonths =
      (Date.now() - new Date(f.failing_dates.max).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return ageMonths < 9;
  });

  const picks: Array<[any, string]> = [
    [withAssertions, 'has-assertions'],
    [withRelatedFeatures, 'has-related-features'],
    [withRelatedIssues, 'has-related-issues'],
    [withUntestedAssertion, 'assertion-with-zero-tests'],
    [staleFailing, 'stale-failing-results-caution'],
    [recentFailing, 'recent-failing-results'],
  ];
  const seen = new Set<string>();
  for (const [feature, label] of picks) {
    if (!feature) continue;
    const key = `${feature.techId}/${feature.id}`;
    routes.push({ path: `/tech/${feature.techId}/${feature.id}`, label: `feature (${label}: ${key})` });
    seen.add(key);
  }
  return routes;
}

function testCaseRoutes(): BaselineRoute[] {
  const testMap = readJson<Record<string, any>>(buildFile('test_map.json'));
  const ids = Object.keys(testMap);
  const routes: BaselineRoute[] = [];

  let externalHtml: string | undefined;
  let longLocalHtml: string | undefined;
  let shortLocalHtml: string | undefined;
  let passAll: string | undefined;
  let passAny: string | undefined;
  let appliedTo: string | undefined;
  let references: string | undefined;
  let notApplicableBranch: string | undefined;

  for (const id of ids) {
    let test: any;
    try {
      test = readJson(buildFile(`tests/${id}.json`));
    } catch {
      continue;
    }
    if (test.html_file?.startsWith('http') && !externalHtml) externalHtml = id;
    if (test.html_file && !test.html_file.startsWith('http')) {
      const fixturePath = dataFile(`tests/html/${test.html_file}`);
      if (fs.existsSync(fixturePath)) {
        const lineCount = fs.readFileSync(fixturePath, 'utf8').split(/\r\n|\r|\n/).length;
        if (lineCount >= 30 && !longLocalHtml) longLocalHtml = id;
        if (lineCount < 30 && !shortLocalHtml) shortLocalHtml = id;
      }
    }
    for (const assertion of test.assertions || []) {
      if (assertion.pass_strategy === 'all' && !passAll) passAll = id;
      if ((!assertion.pass_strategy || assertion.pass_strategy === 'any') && !passAny) passAny = id;
      if (assertion.applied_to && !appliedTo) appliedTo = id;
      if (assertion.references?.length && !references) references = id;
      if (
        ['sr', 'vc', 'kb'].every((atType) => assertion.assertion_strength?.[atType] === 'NA') &&
        !notApplicableBranch
      ) {
        notApplicableBranch = id;
      }
    }
  }

  const picks: Array<[string | undefined, string]> = [
    [externalHtml, 'external-html-fixture'],
    [longLocalHtml, 'local-html-fixture-over-30-lines'],
    [shortLocalHtml, 'local-html-fixture-under-30-lines'],
    [passAll, 'pass-strategy-all'],
    [passAny, 'pass-strategy-any-default'],
    [appliedTo, 'assertion-applied-to'],
    [references, 'assertion-references'],
    [notApplicableBranch, 'not-applicable-assertion'],
  ];
  const seen = new Set<string>();
  for (const [id, label] of picks) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const safe = makeSafe(id);
    routes.push({ path: `/tests/${safe}`, label: `test-case (${label}: ${id})` });
    routes.push({ path: `/tests/${safe}/run`, label: `test-case-run (${label}: ${id})` });
  }
  return routes;
}

function testCaseRunBranches(): BaselineRoute[] {
  // test-case-run.pug branches beyond what testCaseRoutes() already exercises: a combination
  // that IS configured in devTest.commands vs one that is NOT ("not configured" message), and a
  // command using `procedure_key` vs one that doesn't.
  const testMap = readJson<Record<string, any>>(buildFile('test_map.json'));
  const ATBrowsers = readJson<any>(dataFile('ATBrowsers.json'));
  const allCombos: Array<[string, string]> = [];
  for (const atId of Object.keys(ATBrowsers.at)) {
    const at = ATBrowsers.at[atId];
    for (const b of [...(at.core_browsers || []), ...(at.extended_browsers || [])]) {
      allCombos.push([atId, b]);
    }
  }

  for (const id of Object.keys(testMap)) {
    let devTest: any;
    try {
      devTest = readJson(dataFile(`tests/${id}.json`));
    } catch {
      continue;
    }
    const configured = allCombos.find(([at, b]) => devTest.commands?.[at]?.[b]);
    const unconfigured = allCombos.find(([at, b]) => !devTest.commands?.[at]?.[b]);
    const withProcedureKey = configured
      ? (devTest.commands[configured[0]][configured[1]] || []).some((c: any) => c.procedure_key)
      : false;
    if (configured && unconfigured) {
      return [
        {
          path: `/tests/${makeSafe(id)}/run`,
          label: `test-case-run (configured combo ${configured.join('/')}${withProcedureKey ? ' incl. procedure_key' : ''}, unconfigured combo ${unconfigured.join('/')} present in same test: ${id})`,
        },
      ];
    }
  }
  return [];
}

function supportPointRoutes(): BaselineRoute[] {
  const testMap = readJson<Record<string, any>>(buildFile('test_map.json'));
  const routes: BaselineRoute[] = [];
  let withOutput: BaselineRoute | undefined;
  let notesOnly: BaselineRoute | undefined;
  let neither: BaselineRoute | undefined;

  outer: for (const id of Object.keys(testMap)) {
    let test: any;
    try {
      test = readJson(buildFile(`tests/${id}.json`));
    } catch {
      continue;
    }
    for (const assertion of test.assertions || []) {
      for (const atId of Object.keys(assertion.results || {})) {
        for (const browserId of Object.keys(assertion.results[atId]?.browsers || {})) {
          const result = assertion.results[atId].browsers[browserId];
          const route = `/tests/${makeSafe(id)}/${makeSafe(assertion.feature_id)}/${assertion.feature_assertion_id}/${atId}/${browserId}`;
          if (result.output?.length && !withOutput) {
            withOutput = { path: route, label: `support-point (has output: ${id})` };
          } else if (!result.output?.length && result.notes && !notesOnly) {
            notesOnly = { path: route, label: `support-point (notes only: ${id})` };
          } else if (!result.output?.length && !result.notes && !neither) {
            neither = { path: route, label: `support-point (no output, no notes: ${id})` };
          }
          if (withOutput && notesOnly && neither) break outer;
        }
      }
    }
  }
  for (const r of [withOutput, notesOnly, neither]) if (r) routes.push(r);
  return routes;
}

function runTestsRoutes(): BaselineRoute[] {
  // run-tests.pug only ever renders priority bands 0-3 (spec.md edge case). Confirm which of
  // those bands actually have entries today so the capture documents what's really on the page.
  const supportPoints = readJson<any[]>(buildFile('support_points.json'));
  const bandsPresent = new Set(
    supportPoints.filter((p) => p.priority !== null && p.priority <= 3).map((p) => p.priority)
  );
  return [
    { path: '/run-tests', label: `run-tests (priority bands present: ${[...bandsPresent].sort().join(', ')})` },
  ];
}

function learnAtRoutes(): BaselineRoute[] {
  const ATBrowsers = readJson<any>(dataFile('ATBrowsers.json'));
  const allowList = [
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
  const withModifier = allowList.find((id) => {
    const atId = id === 'dragon' ? 'dragon_win' : id;
    return ATBrowsers.at[atId]?.modifier_key;
  });
  const withoutModifier = allowList.find((id) => {
    const atId = id === 'dragon' ? 'dragon_win' : id;
    return ATBrowsers.at[atId] && !ATBrowsers.at[atId].modifier_key;
  });
  const withCommandNotes = allowList.find((id) => {
    const atId = id === 'dragon' ? 'dragon_win' : id;
    return Object.values(ATBrowsers.at[atId]?.commands || {}).some((c: any) => c.note);
  });
  const routes: BaselineRoute[] = [];
  const seen = new Set<string>();
  for (const [id, label] of [
    [withModifier, 'has-modifier-key'],
    [withoutModifier, 'no-modifier-key'],
    [withCommandNotes, 'commands-with-notes'],
  ] as const) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    routes.push({ path: `/learn/at/${id}`, label: `learn-at (${label}: ${id})` });
  }
  return routes;
}

function singleShapeRoutes(): BaselineRoute[] {
  return [
    { path: '/tests', label: 'tests' },
    { path: '/updates', label: 'updates' },
    { path: '/learn/commands', label: 'commands' },
    { path: '/faq', label: 'static-page (faq)' },
    { path: '/contribute', label: 'static-page (contribute)' },
    { path: '/learn', label: 'static-page (learn)' },
    { path: '/learn/vc_differences', label: 'static-page (vc_differences)' },
    { path: '/this-route-does-not-exist', label: 'error (404)' },
  ];
}

// Known gap: two sub-branches are not detected by this tool because they depend on a
// multi-dimensional condition (a specific feature x AT-type pairing within one test's rendered
// sub-table having zero qualifying assertions) rather than a single assertion-level property:
// test-case.pug's per-feature "Not applicable" row (:117-119) and feature.pug's equivalent
// (:110-112). Neither was found to occur in the current dataset by direct inspection. If Gate 5's
// HTML review ever encounters one of these rows in the baseline capture, treat it as covered
// incidentally; if not, it remains an acknowledged, low-risk gap in this tool's precision rather
// than in the migration's correctness (the branch is a simple `if (count === 0) render "Not
// applicable"` — low risk of a silent regression even without a dedicated fixture).

export function buildRouteInventory(): BaselineRoute[] {
  return [
    ...homeRoutes(),
    ...techRoutes(),
    ...featureRoutes(),
    ...testCaseRoutes(),
    ...testCaseRunBranches(),
    ...supportPointRoutes(),
    ...runTestsRoutes(),
    ...learnAtRoutes(),
    ...singleShapeRoutes(),
  ];
}

if (require.main === module) {
  console.log(JSON.stringify(buildRouteInventory(), null, 2));
}
