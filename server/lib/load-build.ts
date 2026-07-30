/**
 * T038: cached reads of build/ and build/api/ artifacts, replacing the per-request require()
 * calls scattered through today's routes/*.js (each of which relies on Node's module cache
 * anyway — this just makes that caching explicit and gives a single place to invalidate it).
 */
import path from 'node:path';
import fs from 'node:fs';
import { readJson } from '../../src/build/load-data';

const ROOT = path.resolve(__dirname, '../..');
const BUILD_DIR = path.join(ROOT, 'build');
const API_DIR = path.join(BUILD_DIR, 'api');
const DATA_DIR = path.join(ROOT, 'data');

const cache = new Map<string, unknown>();

function cachedReadJson<T>(absPath: string): T {
  if (!cache.has(absPath)) {
    cache.set(absPath, readJson<T>(absPath));
  }
  return cache.get(absPath) as T;
}

export function buildFileExists(relPath: string): boolean {
  return fs.existsSync(path.join(BUILD_DIR, relPath));
}

export function loadBuildFile<T>(relPath: string): T {
  return cachedReadJson<T>(path.join(BUILD_DIR, relPath));
}

export function loadApiFile<T>(relPath: string): T {
  return cachedReadJson<T>(path.join(API_DIR, relPath));
}

export function loadDataFile<T>(relPath: string): T {
  return cachedReadJson<T>(path.join(DATA_DIR, relPath));
}

export { BUILD_DIR, API_DIR, DATA_DIR };
