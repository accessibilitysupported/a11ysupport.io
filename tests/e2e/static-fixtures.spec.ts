/**
 * T105: `/tests/html/*` MUST resolve to the static HTML fixture (data/tests/html/**, via the
 * `data/` static mount registered before the SPA catch-all), not the client router's
 * `/tests/:testId` route — the route-ordering hazard from plan.md's Phase 3.
 */
import { test, expect } from '@playwright/test';

test('/tests/html/* serves the raw fixture, not the SPA shell', async ({ page }) => {
  const response = await page.goto('/tests/html/html/buttons.html');
  expect(response?.status()).toBe(200);

  // The SPA shell always mounts React into #root; a static fixture has no such element.
  const rootCount = await page.locator('#root').count();
  expect(rootCount).toBe(0);

  await expect(page).toHaveTitle('HTML button tests');
  await expect(page.locator('h1')).toHaveText('HTML button tests');
});

test('the SPA route for the same test id still renders the React test-case page', async ({ page }) => {
  await page.goto('/tests/tech__html__buttons');
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.locator('h1')).toContainText('Test:');
});
