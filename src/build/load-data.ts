/**
 * T021: replaces require()-as-data-loader. The old build.js used require() to load ~300 JSON
 * files, which pins them in Node's module cache for the lifetime of the process — harmless in
 * today's one-shot build, but a latent hazard for any future long-lived/watch-mode use, and it's
 * simply not what require() is for. Every loader here reads fresh from disk every call.
 */
import fs from 'node:fs';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readJson<T = any>(absPath: string): T {
  return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

export function writeJson(absPath: string, data: unknown): void {
  fs.writeFileSync(absPath, JSON.stringify(data, null, 2));
}

export function fileExists(absPath: string): boolean {
  return fs.existsSync(absPath);
}

export function ensureDir(absPath: string): void {
  if (!fs.existsSync(absPath)) {
    fs.mkdirSync(absPath, { recursive: true });
  }
}

/** Mirrors the old `require('../data/tech/'+id+'.json')` pattern used throughout
 * feature-helper.js to look up a referenced feature by its `techId/featureId` id string. */
export function readFeatureFile(root: string, baseDir: 'data' | 'build', featureId: string) {
  return readJson(path.join(root, baseDir, 'tech', `${featureId}.json`));
}

export function readTestFile(root: string, baseDir: 'data' | 'build', testId: string) {
  return readJson(path.join(root, baseDir, 'tests', `${testId}.json`));
}
