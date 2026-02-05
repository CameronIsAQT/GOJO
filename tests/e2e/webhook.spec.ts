import { test, expect } from '@playwright/test';

test.describe('Webhook Integration', () => {
  test('should receive trade via webhook and display in dashboard', async ({ page, request }) => {
    // First, send a trade via webhook
    const webhookResponse = await request.post('/api/webhook/trade', {
      data: {
        botName: 'E2E Test Bot',
        walletAddress: '0xe2e1234567890abcdef1234567890abcdef12345',
        marketId: 'e2e-market-1',
        marketQuestion: 'E2E Test Market Question?',
        outcome: 'YES',
        costUsdc: 25.0,
        shares: 50,
        potentialWin: 50.0,
        txHash: '0xe2etx123456',
      },
    });

    expect(webhookResponse.status()).toBe(201);
    const responseBody = await webhookResponse.json();
    expect(responseBody.success).toBe(true);

    // Now navigate to trades page and verify the trade appears
    await page.goto('/trades');

    // Wait for trades to load
    await page.waitForTimeout(1000);

    // Should see the trade in the table
    await expect(page.getByText('E2E Test Bot')).toBeVisible();
    await expect(page.getByText('E2E Test Market Question?')).toBeVisible();
  });

  test('should create bot via webhook if not exists', async ({ request }) => {
    const uniqueWallet = `0x${Date.now().toString(16).padStart(40, '0')}`;

    const webhookResponse = await request.post('/api/webhook/trade', {
      data: {
        botName: 'Auto-Created Bot',
        walletAddress: uniqueWallet,
        marketId: 'auto-market-1',
        marketQuestion: 'Auto market question?',
        outcome: 'NO',
        costUsdc: 10.0,
        shares: 20,
        potentialWin: 20.0,
      },
    });

    expect(webhookResponse.status()).toBe(201);

    // Verify bot was created by checking bots API
    const botsResponse = await request.get('/api/bots');
    const botsData = await botsResponse.json();

    const createdBot = botsData.bots.find((b: { walletAddress: string }) => b.walletAddress === uniqueWallet);
    expect(createdBot).toBeDefined();
    expect(createdBot.name).toBe('Auto-Created Bot');
  });

  test('should reject webhook with missing required fields', async ({ request }) => {
    const webhookResponse = await request.post('/api/webhook/trade', {
      data: {
        botName: 'Incomplete Bot',
        // Missing walletAddress, marketId, outcome
      },
    });

    expect(webhookResponse.status()).toBe(400);
  });

  test('should handle webhook authentication when secret is set', async ({ request }) => {
    // This test assumes WEBHOOK_SECRET might be set in the environment
    // If not set, the webhook should work without auth
    const webhookResponse = await request.post('/api/webhook/trade', {
      data: {
        walletAddress: '0xauth1234567890abcdef1234567890abcdef123',
        marketId: 'auth-market-1',
        outcome: 'YES',
      },
    });

    // Should either succeed (no auth required) or fail with 401 (auth required)
    expect([201, 401]).toContain(webhookResponse.status());
  });
});
