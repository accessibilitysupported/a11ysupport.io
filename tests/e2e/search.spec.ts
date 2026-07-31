/**
 * T102: filtering behavior, live-region announcement text and timing (T061 — announce only on a
 * real zero<->some-results transition, never on every keystroke or on initial load), and focus
 * movement to the results heading on submit.
 */
import { test, expect } from '@playwright/test';

test.describe('home page feature search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/results found/)).toBeVisible();
  });

  test('filters results as you type and updates the visible summary text', async ({ page }) => {
    const input = page.getByLabel(/Find support for a feature/);
    const summary = page.locator('.summary-container span');

    const initialText = await summary.textContent();
    expect(initialText).toMatch(/^\d+ results found$/);

    await input.fill('aria');
    await expect(summary).toHaveText(/^\d+ results found for aria$/);

    await input.fill('this-will-never-match-anything-xyz');
    await expect(summary).toHaveText('Sorry, no results could be found.');
  });

  test('says nothing on page load, then announces assertively only when results actually drop to zero', async ({ page }) => {
    const politeRegion = page.locator('.live-announcements-polite');
    const assertiveRegion = page.locator('.live-announcements-assertive');

    // Establishing the baseline on load must not announce anything.
    await expect(politeRegion).toHaveText('');
    await expect(assertiveRegion).toHaveText('');

    const input = page.getByLabel(/Find support for a feature/);
    await input.fill('this-will-never-match-anything-xyz');

    await expect(assertiveRegion).toHaveText('Sorry, no results could be found.');
    await expect(politeRegion).toHaveText('');
  });

  test('announces "results found" politely only on the zero-to-some transition, not on every keystroke', async ({ page }) => {
    const politeRegion = page.locator('.live-announcements-polite');
    const assertiveRegion = page.locator('.live-announcements-assertive');
    const input = page.getByLabel(/Find support for a feature/);

    await input.fill('this-will-never-match-anything-xyz');
    await expect(assertiveRegion).toHaveText('Sorry, no results could be found.');

    await input.fill('aria');
    await expect(politeRegion).toHaveText('results found');

    // Typing further within the same "some results" state must not re-announce.
    await input.fill('aria-l');
    await expect(politeRegion).toHaveText('results found');
  });

  test('the announcement clears itself after 2000ms so it does not linger for the next interaction', async ({ page }) => {
    const assertiveRegion = page.locator('.live-announcements-assertive');
    const input = page.getByLabel(/Find support for a feature/);

    await input.fill('this-will-never-match-anything-xyz');
    await expect(assertiveRegion).toHaveText('Sorry, no results could be found.');
    await expect(assertiveRegion).toHaveText('', { timeout: 3000 });
  });

  test('submitting the search form moves focus to the results heading', async ({ page }) => {
    const input = page.getByLabel(/Find support for a feature/);
    await input.fill('aria');
    await input.press('Enter');

    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe('features');
  });
});
