/**
 * T103: run-test form — combination selection, validation error states, and the generated
 * GitHub issue body content (buildIssueBody.ts, T069, including the testTitle/testId fix).
 */
import { test, expect } from '@playwright/test';

test.describe('run-test form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/tech__html__buttons/run');
    await expect(page.locator('h1')).toContainText('Run Test:');
  });

  test('selecting and saving a combination reveals the selected-combo summary and step 2', async ({ page }) => {
    await page.locator('#combination').selectOption({ label: 'NVDA / Chrome (core)' });
    await page.getByRole('button', { name: 'save my testing combination' }).click();

    await expect(page.locator('.selected-at-browser-combo').first()).toContainText('Chrome');
    await expect(page.locator('#step2')).toBeVisible();
  });

  test('submitting step 2 with empty required fields shows a focusable error summary', async ({ page }) => {
    await page.locator('#combination').selectOption({ label: 'NVDA / Chrome (core)' });
    await page.getByRole('button', { name: 'save my testing combination' }).click();

    await page.getByRole('button', { name: 'Create GitHub Issue' }).click();

    const errorSummary = page.locator('#error_container');
    await expect(errorSummary.getByRole('heading', { name: 'Error' })).toBeVisible();
    await expect(errorSummary.getByRole('link', { name: "'AT version' is required" })).toBeVisible();
    await expect(errorSummary.getByRole('link', { name: "'Browser version' is required" })).toBeVisible();
    await expect(errorSummary.getByRole('link', { name: "'OS version' is required" })).toBeVisible();

    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe('error_container');

    await expect(page.locator('#at_version')).toHaveAttribute('aria-invalid', 'true');
  });

  test('a valid submission generates an issue body using the test title (not its id) in the link', async ({ page }) => {
    await page.locator('#combination').selectOption({ label: 'NVDA / Chrome (core)' });
    await page.getByRole('button', { name: 'save my testing combination' }).click();

    await page.locator('#at_version').fill('2024.1');
    await page.locator('#os_version').fill('11');
    await page.locator('#browser_version').fill('120');
    await page.getByRole('button', { name: 'Create GitHub Issue' }).click();

    const textarea = page.locator('#issue-body');
    await expect(textarea).toBeVisible();
    const body = await textarea.inputValue();

    expect(body).toContain('[Basic HTML button test](');
    expect(body).not.toContain('[tech/html/buttons]');
    expect(body).toContain('| title | tech/html/buttons |');
    expect(body).toContain('| at | nvda |');
    expect(body).toContain('| at_version | 2024.1 |');

    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe('output-heading');
  });
});
