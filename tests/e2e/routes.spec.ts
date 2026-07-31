/**
 * T100: every route in the Phase 0 branch-driven inventory (tools/baseline/routes.ts) renders
 * without a client-side error against the built bundle.
 */
import { test, expect } from '@playwright/test';
import { buildRouteInventory } from '../../tools/baseline/routes';

const routes = buildRouteInventory();

test.describe('route inventory renders without error', () => {
  for (const route of routes) {
    test(`${route.path} (${route.label})`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (err) => pageErrors.push(err.message));

      const response = await page.goto(route.path, { waitUntil: 'networkidle' });
      expect(response?.status()).toBeLessThan(500);

      // Renders real content, not a blank/crashed shell. (Not every page has an <h1> — /tests
      // and /updates are a pre-existing gap, baseline/README.md's page-has-heading-one — so this
      // checks for the root mounting content at all, and leaves heading structure to axe.)
      await expect(page.locator('#root')).not.toBeEmpty();
      expect(pageErrors).toEqual([]);
    });
  }
});
