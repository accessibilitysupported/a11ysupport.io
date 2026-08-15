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

test.describe('route change falls back to <main> when the new page has no <h1>', () => {
  // /tests and /updates genuinely have no <h1> of their own (a pre-existing gap, baseline/
  // README.md's page-has-heading-one violation) — RouteAnnouncer must still move focus and
  // announce by falling back to the <main> landmark instead of silently doing nothing.

  test('fast navigation to /tests focuses <main>', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'All Tests', exact: true }).click();

    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('main');
    const focused = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      tabIndex: document.activeElement?.getAttribute('tabindex'),
    }));
    expect(focused).toEqual({ tag: 'MAIN', tabIndex: '-1' });
    await expect(page.locator('[role="status"].visually-hidden')).toHaveText('All tests | Accessibility Support');
  });

  test('a slow navigation to /tests (past LoadingStatus\'s own 200ms visibility swap) still falls back to <main>, not the loading placeholder', async ({ page }) => {
    // LoadingStatus mutates its own DOM at 200ms (an invisible marker becomes a visible
    // "Loading…") — an earlier, broken version of the fallback mistook that for "page settled"
    // and gave up before the real content ever arrived. Prove the fix holds past that point.
    await page.route('**/api/tests', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });

    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'All Tests', exact: true }).click();

    await expect.poll(() => page.evaluate(() => document.activeElement?.id), { timeout: 5000 }).toBe('main');
  });

  test('a slow navigation to a page that DOES have an <h1> still focuses the h1, not <main>', async ({ page }) => {
    // Regression guard for the same bug: confirm the LoadingStatus mutation doesn't cause a
    // premature main-fallback on a page that legitimately has a heading coming.
    await page.route('**/api/tech/aria/alert_role', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });

    await page.goto('/tech/aria');
    await page.locator('a[href="/tech/aria/alert_role"]').first().click();

    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName), { timeout: 5000 }).toBe('H1');
  });
});

test.describe('in-page anchor links move focus to their target (corrected-defect #12)', () => {
  test('a jump-link on a feature page focuses its heading, not just scrolling to it', async ({ page }) => {
    await page.goto('/tech/html/button_element');
    await expect(page.locator('h1')).toBeVisible();

    await page.locator('a[href="#age-of-results"]').click();

    const focused = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      id: document.activeElement?.id,
      tabIndex: document.activeElement?.getAttribute('tabindex'),
    }));
    expect(focused).toEqual({ tag: 'H2', id: 'age-of-results', tabIndex: '-1' });
  });

  test('a jump-link on a test-case page focuses its heading', async ({ page }) => {
    await page.goto('/tests/tech__html__buttons');
    await expect(page.locator('h1')).toBeVisible();

    await page.locator('a[href="#history"]').click();

    const focused = await page.evaluate(() => ({ tag: document.activeElement?.tagName, id: document.activeElement?.id }));
    expect(focused).toEqual({ tag: 'H2', id: 'history' });
  });

  test('a run-test validation error link focuses the section heading it points to', async ({ page }) => {
    await page.goto('/tests/tech__html__buttons/run');
    await expect(page.locator('h1')).toContainText('Run Test:');

    // Submitting step 2 with no combination selected produces an error link to #at-browser-combo.
    await page.getByRole('button', { name: 'Create GitHub Issue' }).click();
    await page.getByRole('link', { name: "'AT used' is required" }).click();

    const focused = await page.evaluate(() => ({ tag: document.activeElement?.tagName, id: document.activeElement?.id }));
    expect(focused).toEqual({ tag: 'H2', id: 'at-browser-combo' });
  });
});
