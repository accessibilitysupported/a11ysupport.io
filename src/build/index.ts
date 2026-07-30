/**
 * T029: port of build.js's orchestration (the helper-function bodies now live in the sibling
 * modules — this file only sequences them, matching the "orchestration only" split from
 * plan.md's Project Structure).
 *
 * Two of build.js's require() calls turned out to be load-bearing IPC, not incidental caching,
 * discovered by a byte-diff mismatch while porting (confirmed by direct inspection: raw
 * data/tech/*.json assertions for well-known ids like `convey_value` have no `operation_modes`
 * field at all — it's only added by initalizeFeatureObject's default-filling switch. The
 * original relies on Node's require() cache returning that same mutated object back out when
 * initalizeTestCase's internal `require('../data/tech/'+id+'.json')` resolves to the identical
 * path already initialized earlier in the same process):
 *   1. Feature objects: initialized once (initalizeFeatureObject), then read again from the same
 *      resolved path inside test processing. Replicated here via `initializedFeatures`, an
 *      explicit in-memory map — read via `loadFeature`, not a fresh disk read.
 *   2. Test objects: fully processed once, then read again (via require() cache hit on the same
 *      absolute path) to build the `allTests` summary. Replicated here via `processedTests`.
 * `bubbleFeatureSupport`'s test lookup (`require('../build/tests/'+id)`) is NOT one of these —
 * that path is only ever required once in the original, so a genuine read (here: from the same
 * `processedTests` map, since nothing external modifies the file in between) is equivalent.
 *
 * Also fixes, per plan.md's Complexity Tracking / T029:
 *  - the unqualified global leaks at build.js:133-134 (`for (at in test.versions)` with no
 *    `let`) — impossible to reproduce in a strict TS module regardless, since `at`/`browser`
 *    would have no declaration at all.
 *  - the disk-round-trip-as-IPC pattern for features (write to build/tech/, then re-require from
 *    that same path) — features are only written once, at the end, already bubbled.
 *  - the shared-object mutation of `tech` (build.js:287) — a fresh, independently-parsed copy is
 *    mutated here instead of the cached `require()` result.
 */
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import type { ATBrowsers } from '../types/at-browsers';
import { resolveBuildNow } from './clock';
import { sortByProperty, sortByKeys } from './sort';
import { readJson, writeJson, ensureDir } from './load-data';
import { initalizeFeatureObject } from './initialize-feature';
import { bubbleFeatureSupport } from './bubble-support';
import { checkForOnlyNegativeSupport } from './negative-support';
import { initalizeTestCase } from './initialize-test-case';
import { emitApiPayloads } from './emit-api-payloads';

const ROOT = path.resolve(__dirname, '../..');

export function build(): void {
  const buildNow = resolveBuildNow();
  const atBrowsers = readJson<ATBrowsers>(path.join(ROOT, 'data/ATBrowsers.json'));
  const tech = readJson<Record<string, any>>(path.join(ROOT, 'data/tech.json')); // eslint-disable-line @typescript-eslint/no-explicit-any

  const buildDir = path.join(ROOT, 'build');
  const dataDir = path.join(ROOT, 'data');

  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(path.join(buildDir, 'tech'));
  fs.mkdirSync(path.join(buildDir, 'tests'));

  const testMap: Record<string, any[]> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  const featureMap: Record<string, string[]> = {};
  const allFeatures: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const allTests: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const recentUpdates: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const supportPoints: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

  // --- Phase A: initialize every feature (feature-helper.js's initalizeFeatures) ---
  // Kept in memory (initializedFeatures) rather than round-tripped through build/tech/ — see the
  // module-level comment above for why that's safe here (bubbleFeatureSupport unconditionally
  // overwrites every date/support field these objects carry, so no intermediate value is ever
  // observed downstream).
  const initializedFeatures = new Map<string, any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

  for (const techId of Object.keys(tech)) {
    const techFeatureDir = path.join(dataDir, 'tech', techId);
    if (!fs.existsSync(techFeatureDir)) {
      continue; // Directory doesn't exist, so there are no features yet
    }
    const files = fs.readdirSync(techFeatureDir);
    files.forEach((file) => {
      const feature = readJson(path.join(techFeatureDir, file));
      const id = file.slice(0, -5);
      initalizeFeatureObject(atBrowsers, feature, techId, `${techId}/${id}`);
      initializedFeatures.set(`${techId}/${id}`, feature);
    });
  }

  const loadFeature = (featureId: string) => {
    const feature = initializedFeatures.get(featureId);
    if (!feature) {
      throw new Error(`No initialized feature found for "${featureId}"`);
    }
    return feature;
  };

  // --- Phase B: process every test case (build.js:219-284) ---
  const testFiles = glob.sync(path.join(dataDir, 'tests/**/*.json').replace(/\\/g, '/'));
  const processedTests = new Map<string, any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

  testFiles.forEach((absPath) => {
    if (!absPath.endsWith('.json')) return;

    const relFile = absPath.replace(dataDir.replace(/\\/g, '/') + '/tests/', '');
    const test = readJson(path.join(dataDir, 'tests', relFile));

    test.id = relFile.slice(0, -5);
    if (!test.html_file) {
      test.html_file = test.id + '.html';
    }

    initalizeTestCase(atBrowsers, test, loadFeature, buildNow);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    test.assertions.forEach((assertion: any) => {
      if (!testMap[test.id]) {
        testMap[test.id] = [];
      }

      const found = testMap[test.id]!.find((o) => o.featureId === assertion.feature_id);
      if (!found) {
        testMap[test.id]!.push({
          featureId: assertion.feature_id,
        });
      }

      if (!featureMap[assertion.feature_id]) {
        featureMap[assertion.feature_id] = [];
      }

      if (-1 === featureMap[assertion.feature_id]!.indexOf(test.id)) {
        featureMap[assertion.feature_id]!.push(test.id);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    test.assertions.forEach((assertion: any) => {
      for (const at in atBrowsers.at) {
        const validBrowsers = atBrowsers.at[at]!.core_browsers.concat(atBrowsers.at[at]!.extended_browsers);
        validBrowsers.forEach((browser) => {
          supportPoints.push(assertion.results[at].browsers[browser]);
        });
      }
    });

    const outPath = path.join(buildDir, 'tests', relFile);
    ensureDir(path.dirname(outPath));
    writeJson(outPath, test);

    processedTests.set(test.id, test);
  });

  // --- Phase C: bubble support up to each feature (build.js's getFeatures) ---
  for (const techId of Object.keys(tech)) {
    const techBuildDir = path.join(buildDir, 'tech', techId);
    ensureDir(techBuildDir);

    const features: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const [featureId, feature] of initializedFeatures) {
      if (!featureId.startsWith(`${techId}/`)) continue;
      const id = featureId.slice(techId.length + 1);

      const failingTests: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

      feature.tests = featureMap[featureId] ?? [];

      bubbleFeatureSupport(atBrowsers, feature, (testId: string) => {
        const t = processedTests.get(testId);
        if (!t) {
          throw new Error(`No processed test found for "${testId}"`);
        }
        return t;
      });

      checkForOnlyNegativeSupport(atBrowsers, feature);

      writeJson(path.join(techBuildDir, `${id}.json`), feature);

      // Map associated tests
      for (let testIndex = 0; testIndex < feature.tests.length; testIndex++) {
        if (!testMap[feature.tests[testIndex].id]) {
          testMap[feature.tests[testIndex].id] = [];
        }

        testMap[feature.tests[testIndex].id]!.forEach((data: any, index: number) => {
          if (data.featureId !== feature.id) {
            return;
          }
          testMap[feature.tests[testIndex].id]![index].techId = techId;
          testMap[feature.tests[testIndex].id]![index].title = feature.title;
        });

        let found = false;
        atBrowsers.types.forEach((type) => {
          if (found) return;

          if (feature.tests[testIndex].core_support[type].includes('n')) {
            failingTests.push({
              title: feature.tests[testIndex].title,
              id: feature.tests[testIndex].id,
            });
            found = true;
          }
        });
      }

      let simplifiedTests: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (feature.tests.length > 0) {
        simplifiedTests = feature.tests.map((test: any) => {
          for (const at in test.versions) {
            test.versions[at].title = atBrowsers.at[at]!.title;
            test.versions[at].type = atBrowsers.at[at]!.type;
            for (const browser in test.versions[at].browsers) {
              test.versions[at].browsers[browser].title = atBrowsers.browsers[browser]!.title;
            }
          }
          return {
            title: test.title,
            id: test.id,
            versions: test.versions,
          };
        });
      }

      const simplifiedFeature: any = {
        id,
        techId: feature.techId,
        title: feature.title,
        keywords_string: feature.keywords_string,
        possible_backend_expectations: feature.possible_backend_expectations,
        core_support: {},
        core_support_string: {},
        core_support_by_at: feature.core_support_by_at,
        core_support_by_at_browser: feature.core_support_by_at_browser,
        failing_tests: failingTests,
        total_test_count: feature.tests.length,
        allTests: simplifiedTests,
        all_dates: feature.all_dates,
        failing_dates: feature.failing_dates,
        assertions: [],
        supports_at: feature.supports_at,
        core_must_support_string: feature.core_must_support_string,
        core_should_support_string: feature.core_should_support_string,
        core_may_support_string: feature.core_may_support_string,
      };

      atBrowsers.types.forEach((at_type) => {
        simplifiedFeature.core_support[at_type] = feature.core_support[at_type];
        simplifiedFeature.core_support_string[at_type] = feature.core_support_string[at_type];
      });

      feature.assertions.forEach((assertion: any, assertion_key: number) => {
        simplifiedFeature.assertions[assertion_key] = {
          id: assertion.id,
          title: assertion.title,
          core_support: {},
          core_support_string: {},
          core_support_by_at: assertion.core_support_by_at,
        };

        atBrowsers.types.forEach((at_type) => {
          simplifiedFeature.assertions[assertion_key].core_support[at_type] = assertion.core_support
            ? assertion.core_support[at_type]
            : [];
          simplifiedFeature.assertions[assertion_key].core_support_string[at_type] = assertion.core_support_string
            ? assertion.core_support_string[at_type]
            : 'unknown';
        });
      });

      features.push(simplifiedFeature);
    }

    tech[techId]!.features = features;
    if (features.length) {
      allFeatures.push(...features);
    }
  }

  // --- Phase D: simplified test summaries (build.js:294-355) ---
  for (const [, test] of processedTests) {
    const simplifiedTest: any = {
      id: test.id,
      title: test.title,
      keywords_string: test.title,
      core_support: {
        sr: test.core_support.sr,
        vc: test.core_support.vc,
      },
      core_support_string: {
        sr: test.core_support_string.sr,
        vc: test.core_support_string.vc,
      },
      last_update: test.history.pop(),
      assertions: [],
    };

    recentUpdates.push({
      testID: test.id,
      title: test.title,
      date: simplifiedTest.last_update.date,
      message: simplifiedTest.last_update.message,
    });

    const feature_titles: string[] = [];
    test.assertions.forEach((assertion: any, assertion_key: number) => {
      const tech_id = assertion.feature_id.split('/')[0];
      const feature_id = assertion.feature_id.split('/')[1];
      const ref_feature = allFeatures.find((o) => o.techId === tech_id && o.id === feature_id);
      const ref_assertion = ref_feature.assertions.find((o: any) => o.id === assertion.feature_assertion_id);

      simplifiedTest.assertions[assertion_key] = {
        feature_id: ref_feature.techId + '/' + ref_feature.id,
        feature_assertion_id: assertion.feature_assertion_id,
        feature_title: ref_feature.title,
        assertion_title: ref_assertion.title,
        core_support: {
          sr: assertion.core_support.sr,
          vc: assertion.core_support.vc,
        },
        core_support_string: {
          sr: assertion.core_support_string.sr,
          vc: assertion.core_support_string.vc,
        },
      };

      feature_titles.push(ref_feature.title);
    });

    simplifiedTest.keywords_string = simplifiedTest.keywords_string + ' ' + feature_titles;
    allTests.push(simplifiedTest);
  }

  // --- Phase E: command matrix + final sorts + writes (build.js:358-387) ---
  const commands: Record<string, Record<string, string[]>> = { sr: {}, vc: {}, kb: {} };

  for (const at in atBrowsers.at) {
    const type = atBrowsers.at[at]!.type;
    for (const key in atBrowsers.at[at]!.commands) {
      if (!commands[type]![key]) {
        commands[type]![key] = [];
      }
      commands[type]![key]!.push(at);
    }
  }

  commands.sr = sortByKeys(commands.sr!);
  commands.vc = sortByKeys(commands.vc!);

  allTests.sort(sortByProperty('title'));
  allFeatures.sort(sortByProperty('title'));
  supportPoints.sort(sortByProperty('priority'));
  recentUpdates.sort(sortByProperty('date')).reverse();

  writeJson(path.join(buildDir, 'tech.json'), tech);
  writeJson(path.join(buildDir, 'test_map.json'), testMap);
  writeJson(path.join(buildDir, 'features.json'), allFeatures);
  writeJson(path.join(buildDir, 'tests.json'), allTests);
  writeJson(path.join(buildDir, 'support_points.json'), supportPoints);
  writeJson(path.join(buildDir, 'command_matrix.json'), commands);
  writeJson(path.join(buildDir, 'recent_updates.json'), recentUpdates);

  // --- Phase F: view-shaped API payloads (Phase 3 — stubbed until then, see emit-api-payloads.ts) ---
  emitApiPayloads(buildDir);
}

if (require.main === module) {
  build();
}
