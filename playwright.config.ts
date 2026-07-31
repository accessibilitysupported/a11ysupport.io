import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Runs against the production build (vite build + vite preview + the real Express server), not
// the dev server — the dev server doesn't exercise the production module graph (source plan,
// Phase 6: "Test the SPA against a real built bundle").
//
// BUILD_NOW is pinned to the same instant as the Phase 0 baseline (baseline/BUILD_NOW) so the
// data build's priority/date-derived fields match what a11y.spec.ts and visual.spec.ts compare
// against — same rationale as tools/baseline/capture.ts's own BUILD_NOW pinning.
const BUILD_NOW_PATH = path.resolve(__dirname, 'baseline/BUILD_NOW');
export const BUILD_NOW = fs.existsSync(BUILD_NOW_PATH) ? fs.readFileSync(BUILD_NOW_PATH, 'utf8').trim() : new Date().toISOString();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The default 30s can be tight for axe-core on /run-tests specifically: corrected-defect #10's
  // fix means that page now legitimately renders ~4x more DOM (spec.md), and axe's full-page
  // scan there took ~22-26s even in isolation — comfortably fine alone, but tight under full
  // parallel suite load where it competes for CPU with everything else.
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        // Build the data + API layer, build the client bundle, then boot the server.
        command: 'npm run build && npx vite build && npm start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: { BUILD_NOW },
      },
});
