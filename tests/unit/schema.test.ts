/**
 * T089: port of test.js's four Ajv suites to Vitest (mocha 10.8.2's bundled yargs crashes under
 * Node 26's ESM handling, so `npm test` didn't run at all on the newest supported runtime).
 *
 * Fixes the non-recursive-validation gap: the original used `fs.readdirSync(buildDir/tests)`,
 * which only sees the 16 top-level entries and silently skips the 112 tests nested under
 * `build/tests/tech/**` and `build/tests/apg/**`. This uses `glob` recursively instead, so all
 * 128 built tests are actually validated.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import Ajv from 'ajv';

const ROOT = path.resolve(__dirname, '../..');
const buildDir = path.join(ROOT, 'build');
const devDir = path.join(ROOT, 'data');

function readJson(p: string) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const ajv = new Ajv({
  useDefaults: true,
  schemas: [
    readJson(path.join(devDir, 'schema', 'test.json')),
    readJson(path.join(devDir, 'schema', 'dev-test.json')),
    readJson(path.join(devDir, 'schema', 'feature.json')),
    readJson(path.join(devDir, 'schema', 'dev-feature.json')),
  ],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tech: Record<string, any> = readJson(path.join(buildDir, 'tech.json'));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ATBrowsers: any = readJson(path.join(devDir, 'ATBrowsers.json'));

describe('Development tests', () => {
  const testFiles = glob.sync(path.join(devDir, 'tests/**/*.json').replace(/\\/g, '/'));

  for (const file of testFiles) {
    describe(`test: ${file}`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const test: any = readJson(file);

      it(`${file} should conform to the dev-test schema`, () => {
        const valid = ajv.validate('http://accessibilitysupported.com/dev-test.json', test);
        if (!valid) console.log(ajv.errors);
        expect(valid).toBe(true);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      test.assertions.forEach((assertion: any) => {
        it(`${devDir}/tech/${assertion.feature_id}.json should exist`, () => {
          const exists = fs.existsSync(path.join(devDir, 'tech', `${assertion.feature_id}.json`));
          expect(exists).toBe(true);
        });
      });

      if (test.commands) {
        for (const atId of Object.getOwnPropertyNames(test.commands)) {
          for (const browserKey of Object.getOwnPropertyNames(test.commands[atId])) {
            if (!test.commands[atId][browserKey]) continue;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            test.commands[atId][browserKey].forEach((command: any, index: number) => {
              it(`${atId}.${browserKey}[${index}].command should be valid: ${command.command}`, () => {
                expect(ATBrowsers.at[atId].commands[command.command]).not.toBeUndefined();
              });

              it(`${atId}.${browserKey} must have a version object defined: ${file}`, () => {
                expect(test.versions[atId].browsers[browserKey]).not.toBeUndefined();
              });
            });
          }
        }
      }
    });
  }
});

describe('Development tech features', () => {
  for (const techId of Object.keys(tech)) {
    describe(techId, () => {
      const featureDir = path.join(devDir, 'tech', techId);
      if (!fs.existsSync(featureDir)) {
        it.skip('no features yet', () => {});
        return;
      }

      for (const file of fs.readdirSync(featureDir)) {
        it(`${file} should conform to the dev-feature schema`, () => {
          const feature = readJson(path.join(featureDir, file));
          const valid = ajv.validate('http://accessibilitysupported.com/dev-feature.json', feature);
          if (!valid) console.log(ajv.errors);
          expect(valid).toBe(true);
        });
      }
    });
  }
});

describe('Built tests', () => {
  const testFiles = glob.sync(path.join(buildDir, 'tests/**/*.json').replace(/\\/g, '/'));
  expect(testFiles.length).toBeGreaterThan(0);

  for (const file of testFiles) {
    it(`${path.relative(buildDir, file)} should conform to the test schema`, () => {
      const test = readJson(file);
      const valid = ajv.validate('http://accessibilitysupported.com/test.json', test);
      if (!valid) console.log(file, ajv.errors);
      expect(valid).toBe(true);
    });
  }
});

describe('Built tech features', () => {
  for (const techId of Object.keys(tech)) {
    describe(techId, () => {
      const featureDir = path.join(buildDir, 'tech', techId);
      if (!fs.existsSync(featureDir)) {
        it.skip('no features yet', () => {});
        return;
      }

      for (const file of fs.readdirSync(featureDir)) {
        it(`${file} should conform to the feature schema`, () => {
          const feature = readJson(path.join(featureDir, file));
          const valid = ajv.validate('http://accessibilitysupported.com/feature.json', feature);
          if (!valid) console.log(ajv.errors);
          expect(valid).toBe(true);
        });
      }
    });
  }
});
