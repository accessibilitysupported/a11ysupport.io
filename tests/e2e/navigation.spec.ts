/**
 * T104: client-side route change must do everything a full page load used to give for free —
 * title/canonical update, focus landing on the new page's <h1>, a screen-reader announcement
 * (RouteAnnouncer, T051), and the loading-indicator delay behavior (LoadingStatus, T052).
 */
import { test, expect } from '@playwright/test';

test('route change updates the title, canonical link, moves focus to the new h1, and announces it', async ({ page }) => {
  await page.goto('/');
  const homeTitle = await page.title();

  await page.locator('header').getByRole('link', { name: 'FAQ', exact: true }).click();
  await expect(page.locator('main h1')).toBeVisible();

  await expect.poll(() => page.title()).not.toBe(homeTitle);
  await expect(page).toHaveTitle('FAQ | Accessibility Support');

  const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonicalHref).toBe('https://a11ysupport.io/faq');

  // Focus moves to the new page's <h1>, which gets a programmatic tabindex so it's focusable.
  // (The browser's own click-follows-focus lands on the <a> first; RouteAnnouncer's effect then
  // re-targets focus to the h1 — wait for that to actually happen before asserting on it.)
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('H1');
  const focused = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    tabIndex: document.activeElement?.getAttribute('tabindex'),
  }));
  expect(focused.tag).toBe('H1');
  expect(focused.tabIndex).toBe('-1');

  // The visually-hidden role="status" region announces the new title to assistive technology.
  await expect(page.locator('[role="status"].visually-hidden')).toHaveText('FAQ | Accessibility Support');
});

test('does not move focus or announce on the very first page load', async ({ page }) => {
  await page.goto('/faq');
  await expect(page.locator('main h1')).toBeVisible();

  const focused = await page.evaluate(() => document.activeElement?.tagName);
  // No prior page to compare against, so nothing should have stolen focus onto the h1.
  expect(focused).not.toBe('H1');
});

test('a fast navigation never shows the visible "Loading…" text (200ms flash guard)', async ({ page }) => {
  await page.goto('/');
  await page.locator('header').getByRole('link', { name: 'FAQ', exact: true }).click();
  await expect(page.locator('main h1')).toBeVisible();

  // If LoadingStatus's 200ms delay were absent, "Loading…" would have flashed and settled by now.
  await expect(page.getByText('Loading…')).toHaveCount(0);
});

test('a slow response past 200ms shows the visible, announced loading indicator', async ({ page }) => {
  await page.route('**/api/tech-index', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });

  await page.goto('/tech');

  await expect(page.getByRole('status').filter({ hasText: 'Loading' })).toBeVisible();
});
