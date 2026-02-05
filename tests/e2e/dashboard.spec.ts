import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should display dashboard title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    await page.goto('/');

    // Check for stats card labels
    await expect(page.getByText('Total Bots')).toBeVisible();
    await expect(page.getByText('Total Trades')).toBeVisible();
    await expect(page.getByText('Pending Trades')).toBeVisible();
    await expect(page.getByText('Total Profit')).toBeVisible();
    await expect(page.getByText('Total Balance')).toBeVisible();
  });

  test('should display navigation links', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Trades' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Bots' })).toBeVisible();
  });

  test('should navigate to trades page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Trades' }).click();

    await expect(page).toHaveURL('/trades');
    await expect(page.getByRole('heading', { name: 'Trade Log' })).toBeVisible();
  });

  test('should navigate to bots page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Bots' }).click();

    await expect(page).toHaveURL('/bots');
    await expect(page.getByRole('heading', { name: 'Bot Management' })).toBeVisible();
  });

  test('should show Your Bots section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Your Bots')).toBeVisible();
  });

  test('should show Recent Trades section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Recent Trades')).toBeVisible();
  });
});
