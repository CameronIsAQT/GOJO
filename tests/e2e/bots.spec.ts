import { test, expect } from '@playwright/test';

test.describe('Bots Page', () => {
  test('should display bots page title', async ({ page }) => {
    await page.goto('/bots');
    await expect(page.getByRole('heading', { name: 'Bot Management' })).toBeVisible();
  });

  test('should display Add Bot button', async ({ page }) => {
    await page.goto('/bots');
    await expect(page.getByRole('button', { name: 'Add Bot' })).toBeVisible();
  });

  test('should show add bot form when clicking Add Bot', async ({ page }) => {
    await page.goto('/bots');

    await page.getByRole('button', { name: 'Add Bot' }).click();

    await expect(page.getByRole('heading', { name: 'Add New Bot' })).toBeVisible();
    await expect(page.getByLabel('Bot Name')).toBeVisible();
    await expect(page.getByLabel('Wallet Address')).toBeVisible();
  });

  test('should hide form when clicking Cancel', async ({ page }) => {
    await page.goto('/bots');

    await page.getByRole('button', { name: 'Add Bot' }).click();
    await expect(page.getByRole('heading', { name: 'Add New Bot' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Add New Bot' })).not.toBeVisible();
  });

  test('should validate required fields when adding bot', async ({ page }) => {
    await page.goto('/bots');

    await page.getByRole('button', { name: 'Add Bot' }).click();

    // Try to submit without filling fields
    await page.getByRole('button', { name: 'Add Bot', exact: false }).last().click();

    // Should show error message
    await expect(page.getByText('Both name and wallet address are required')).toBeVisible();
  });

  test('should validate wallet address format', async ({ page }) => {
    await page.goto('/bots');

    await page.getByRole('button', { name: 'Add Bot' }).click();

    await page.getByLabel('Bot Name').fill('Test Bot');
    await page.getByLabel('Wallet Address').fill('invalid-address');

    await page.getByRole('button', { name: 'Add Bot', exact: false }).last().click();

    await expect(page.getByText('Invalid wallet address format')).toBeVisible();
  });
});
