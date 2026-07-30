/**
 * T043: port of routes/tests.js. Keeps the `undoMakeSafe` (`__` -> `/`) `:testId` decoding —
 * URL-safety scheme for test ids that contain slashes (e.g. `tech/html/buttons`).
 */
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { loadApiFile, loadBuildFile, loadDataFile } from '../lib/load-build';
import { notFound } from '../lib/errors';
import { renderMarkdown, renderMarkdownInline } from '../lib/markdown';
import { undoMakeSafe } from '../../src/lib/test-id-helper';
import type { TestsIndexPayload } from '../../src/types/api';

const router = express.Router();

const DATA_TESTS_HTML_DIR = path.resolve(__dirname, '../../data/tests/html');

function readTestHtml(htmlFile: string): string | undefined {
  const p = path.join(DATA_TESTS_HTML_DIR, htmlFile);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : undefined;
}

/**
 * test-case.pug:43,162,310 and test-case-run.pug:13 render these through markdown-it at request
 * time — matched here rather than baked into build/tests/**.json (Gate 1 byte-identity). Note
 * `test.description` gets *two different* renders depending on the page: full (`md.render`) on
 * the detail page, inline (`md.renderInline`) on the run page — both fields are populated so
 * either caller can use the one it needs. Cached via loadBuildFile, so this runs once per
 * process per test.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderTestMarkdownFields(test: any): void {
  if (!test.descriptionHtml && test.description) {
    test.descriptionHtml = renderMarkdown(test.description);
  }
  if (!test.descriptionInlineHtml && test.description) {
    test.descriptionInlineHtml = renderMarkdownInline(test.description);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (test.assertions ?? []).forEach((assertion: any) => {
    if (!assertion.assertion_notesHtml && assertion.assertion_notes) {
      assertion.assertion_notesHtml = renderMarkdownInline(assertion.assertion_notes);
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (test.history ?? []).forEach((entry: any) => {
    if (!entry.messageHtml && entry.message) {
      entry.messageHtml = renderMarkdownInline(entry.message);
    }
  });
}

router.get('/', (_req, res, next) => {
  const tests = loadApiFile<TestsIndexPayload>('tests-index.json');

  if (!tests || !tests.length) {
    next(notFound());
    return;
  }

  const testMap = loadBuildFile('test_map.json');
  res.json({ tests, testMap });
});

router.get('/:testId', (req, res, next) => {
  const testId = undoMakeSafe(req.params.testId!);
  const testMap = loadBuildFile<Record<string, unknown[]>>('test_map.json');
  const features = testMap[testId];

  if (!features || !features.length) {
    next(notFound());
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let test: any;
  try {
    test = loadBuildFile(`tests/${testId}.json`);
  } catch {
    next(notFound());
    return;
  }

  renderTestMarkdownFields(test);

  const testHtmlFile = test.html_file ?? `${testId}.html`;
  const testHtml = test.html_file?.startsWith('http') ? undefined : readTestHtml(testHtmlFile);

  res.json({ test, features, testHtml });
});

router.get('/:testId/run', (req, res, next) => {
  const testId = undoMakeSafe(req.params.testId!);
  const testMap = loadBuildFile<Record<string, unknown[]>>('test_map.json');
  const features = testMap[testId];

  if (!features || !features.length) {
    next(notFound());
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let test: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let devTest: any;
  try {
    test = loadBuildFile(`tests/${testId}.json`);
  } catch {
    next(notFound());
    return;
  }
  try {
    devTest = loadDataFile(`tests/${testId}.json`);
  } catch {
    next(notFound());
    return;
  }

  renderTestMarkdownFields(test);

  const testHtmlFile = test.html_file ?? `${testId}.html`;
  const testHtml = test.html_file?.startsWith('http') ? undefined : readTestHtml(testHtmlFile);

  res.json({ test, devTest, features, testHtml });
});

router.get('/:testId/:featureId/:featureAssertionId/:atId/:browserId', (req, res, next) => {
  const testId = undoMakeSafe(req.params.testId!);
  const featureId = undoMakeSafe(req.params.featureId!);
  const testMap = loadBuildFile<Record<string, unknown[]>>('test_map.json');
  const features = testMap[testId];

  if (!features || !features.length) {
    next(notFound());
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let test: any;
  try {
    test = loadBuildFile(`tests/${testId}.json`);
  } catch {
    next(notFound());
    return;
  }

  const assertion = test.assertions.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (o: any) => o.feature_id === featureId && o.feature_assertion_id === req.params.featureAssertionId
  );

  if (!assertion) {
    next(notFound());
    return;
  }

  if (!assertion.results[req.params.atId!]) {
    next(notFound());
    return;
  }

  const result = assertion.results[req.params.atId!].browsers[req.params.browserId!];
  if (!result) {
    next(notFound());
    return;
  }

  // test-case-support-point.pug:70 renders this through md.render() at request time.
  if (result.notes) {
    result.notesHtml = renderMarkdown(result.notes);
  }

  const testHtmlFile = test.html_file ?? `${testId}.html`;
  const testHtml = test.html_file?.startsWith('http') ? undefined : readTestHtml(testHtmlFile);

  res.json({
    test,
    features,
    testHtml,
    assertion,
    atId: req.params.atId,
    browserId: req.params.browserId,
  });
});

export default router;
