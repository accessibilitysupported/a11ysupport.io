import { defineConfig } from 'vitest/config';

// Covers tests/unit (the ported schema suite + new coverage of the data-build layer) and
// tests/api (supertest against the Express API). Playwright owns tests/e2e separately
// (playwright.config.ts) — Vitest and Playwright are not run through the same runner.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/api/**/*.test.ts'],
    environment: 'node',
  },
});
