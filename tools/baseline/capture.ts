/**
 * T004 (Phase 0): capture the pre-migration baseline.
 *
 * For every route in the branch-driven inventory (routes.ts), saves:
 *   - rendered HTML, normalized via prettier, to baseline/html/
 *   - full-page screenshots at 1920/1441/1280/320px to baseline/png/
 *   - axe-core violation results to baseline/axe/
 *
 * Everything is pinned to the same instant: BUILD_NOW drives both the data build (build.js) and
 * the Express server's request-time `moment()` calls (bin/www), and the Playwright browser clock
 * is pinned to the same value here, so re-running this script produces byte-identical HTML.
 *
 * Usage: BUILD_NOW=<ISO instant> tsx tools/baseline/capture.ts
 * (intended to run inside the pinned Playwright container via `npm run build:baseline`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import prettier from 'prettier';
import { chromium, type Browser } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { buildRouteInventory } from './routes';
import { slugify, WIDTHS } from './route-slug';

const ROOT = path.resolve(__dirname, '../..');
const PORT = 3099; // distinct from the dev-default 3000 so this never collides with a running app
const BASE_URL = `http://localhost:${PORT}`;
const BUILD_NOW = process.env.BUILD_NOW ?? new Date().toISOString();

const outDirs = {
  html: path.join(ROOT, 'baseline', 'html'),
  png: path.join(ROOT, 'baseline', 'png'),
  axe: path.join(ROOT, 'baseline', 'axe'),
};

function startServer(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['./bin/www'], {
      cwd: ROOT,
      env: { ...process.env, PORT: String(PORT), BUILD_NOW },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timeout = setTimeout(() => reject(new Error('Server did not start within 10s')), 10000);
    // Poll for readiness rather than parsing stdout — bin/www logs via `debug`, which is silent
    // by default (DEBUG env var unset), so there's nothing reliable to watch for there.
    const start = Date.now();
    const poll = setInterval(async () => {
      try {
        const res = await fetch(BASE_URL + '/');
        if (res.ok || res.status === 404) {
          clearInterval(poll);
          clearTimeout(timeout);
          resolve(child);
        }
      } catch {
        if (Date.now() - start > 10000) {
          clearInterval(poll);
          clearTimeout(timeout);
          reject(new Error('Server did not become reachable within 10s'));
        }
      }
    }, 200);
    child.on('error', reject);
  });
}

async function main() {
  for (const dir of Object.values(outDirs)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(ROOT, 'baseline', 'BUILD_NOW'), BUILD_NOW + '\n');

  console.log(`Starting server on ${BASE_URL} with BUILD_NOW=${BUILD_NOW}...`);
  const server = await startServer();

  let browser: Browser | undefined;
  try {
    browser = await chromium.launch();
    const routes = buildRouteInventory();
    console.log(`Capturing ${routes.length} routes...`);

    for (const route of routes) {
      const slug = slugify(route.path);
      const context = await browser.newContext();
      await context.clock.setFixedTime(new Date(BUILD_NOW));
      const page = await context.newPage();

      const response = await page.goto(BASE_URL + route.path, { waitUntil: 'networkidle' });
      const status = response?.status();

      // HTML capture
      const html = await page.content();
      const formatted = await prettier.format(html, { parser: 'html' });
      fs.writeFileSync(path.join(outDirs.html, `${slug}.html`), formatted);

      // Screenshot capture at each width
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({
          path: path.join(outDirs.png, `${slug}-${width}.png`),
          fullPage: true,
        });
      }

      // axe capture
      const axeResults = await new AxeBuilder({ page }).analyze();
      fs.writeFileSync(
        path.join(outDirs.axe, `${slug}.json`),
        JSON.stringify({ route: route.path, status, violations: axeResults.violations }, null, 2)
      );

      console.log(`  [${status}] ${route.path} -> ${slug} (${route.label})`);
      await context.close();
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
  }

  console.log('Baseline capture complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
