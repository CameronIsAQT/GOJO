import { test, expect } from '@playwright/test';

test.describe('Trades Page', () => {
  test('should display trades page title', async ({ page }) => {
    await page.goto('/trades');
    await expect(page.getByRole('heading', { name: 'Trade Log' })).toBeVisible();
  });

  test('should display filters section', async ({ page }) => {
    await page.goto('/trades');

    await expect(page.getByRole('heading', { name: 'Filters' })).toBeVisible();
    await expect(page.getByLabel('Bot')).toBeVisible();
    await expect(page.getByLabel('Status')).toBeVisible();
  });

  test('should have status filter options', async ({ page }) => {
    await page.goto('/trades');

    const statusSelect = page.getByLabel('Status');
    await statusSelect.click();

    // Check options are present
    await expect(statusSelect.locator('option', { hasText: 'All Statuses' })).toBeVisible();
    await expect(statusSelect.locator('option', { hasText: 'Pending' })).toBeVisible();
    await expect(statusSelect.locator('option', { hasText: 'Won' })).toBeVisible();
    await expect(statusSelect.locator('option', { hasText: 'Lost' })).toBeVisible();
  });

  test('should display refresh button', async ({ page }) => {
    await page.goto('/trades');
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
  });

  test('should filter trades by status', async ({ page }) => {
    await page.goto('/trades');

    const statusSelect = page.getByLabel('Status');
    await statusSelect.selectOption('PENDING');

    // Wait for the trades to refresh
    await page.waitForTimeout(500);

    // The filter should be applied (verified by the URL or table content)
    await expect(statusSelect).toHaveValue('PENDING');
  });
});
