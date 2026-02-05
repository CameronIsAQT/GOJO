import prisma from './prisma';
import { checkMarketResolution } from './polymarket';
import { getWalletBalances } from './polygonscan';
import { emitEvent } from './events';

export async function checkPendingTrades(): Promise<void> {
  // Get all pending trades
  const pendingTrades = await prisma.trade.findMany({
    where: { status: 'PENDING' },
    include: { bot: true },
  });

  if (pendingTrades.length === 0) {
    return;
  }

  console.log(`Checking ${pendingTrades.length} pending trades...`);

  // Group by marketId to avoid duplicate API calls
  const marketIds = [...new Set(pendingTrades.map(t => t.marketId))];

  for (const marketId of marketIds) {
    const resolution = await checkMarketResolution(marketId);

    if (resolution.resolved && resolution.winningOutcome) {
      // Find all trades for this market
      const marketTrades = pendingTrades.filter(t => t.marketId === marketId);

      for (const trade of marketTrades) {
        const won = trade.outcome.toUpperCase() === resolution.winningOutcome.toUpperCase();
        const newStatus = won ? 'WON' : 'LOST';

        // Update trade status
        const updatedTrade = await prisma.trade.update({
          where: { id: trade.id },
          data: {
            status: newStatus,
            resolvedAt: new Date(),
          },
          include: { bot: true },
        });

        console.log(`Trade ${trade.id} resolved: ${newStatus}`);

        // Emit SSE event
        emitEvent({
          type: 'trade_updated',
          data: updatedTrade,
        });

        // Update balance snapshot for the bot
        try {
          const balances = await getWalletBalances(trade.bot.walletAddress);
          await prisma.balanceSnapshot.create({
            data: {
              botId: trade.botId,
              balanceUsdc: balances.balanceUsdc,
              balanceMatic: balances.balanceMatic,
            },
          });

          emitEvent({
            type: 'balance_updated',
            data: {
              botId: trade.botId,
              ...balances,
            },
          });
        } catch (error) {
          console.error(`Failed to update balance for bot ${trade.botId}:`, error);
        }
      }
    }
  }
}

export async function syncAllBalances(): Promise<void> {
  const bots = await prisma.bot.findMany();

  for (const bot of bots) {
    try {
      const balances = await getWalletBalances(bot.walletAddress);
      await prisma.balanceSnapshot.create({
        data: {
          botId: bot.id,
          balanceUsdc: balances.balanceUsdc,
          balanceMatic: balances.balanceMatic,
        },
      });

      emitEvent({
        type: 'balance_updated',
        data: {
          botId: bot.id,
          ...balances,
        },
      });

      console.log(`Updated balance for bot ${bot.name}: ${balances.balanceUsdc} USDC, ${balances.balanceMatic} MATIC`);
    } catch (error) {
      console.error(`Failed to sync balance for bot ${bot.name}:`, error);
    }
  }
}

// Singleton interval manager
let monitorInterval: NodeJS.Timeout | null = null;
let balanceInterval: NodeJS.Timeout | null = null;

export function startMonitoring(
  tradeCheckIntervalMs = 60000, // 1 minute
  balanceSyncIntervalMs = 300000 // 5 minutes
): void {
  if (monitorInterval) {
    console.log('Monitoring already started');
    return;
  }

  console.log('Starting trade monitoring...');

  // Initial check
  checkPendingTrades().catch(console.error);
  syncAllBalances().catch(console.error);

  // Set up intervals
  monitorInterval = setInterval(() => {
    checkPendingTrades().catch(console.error);
  }, tradeCheckIntervalMs);

  balanceInterval = setInterval(() => {
    syncAllBalances().catch(console.error);
  }, balanceSyncIntervalMs);
}

export function stopMonitoring(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
  if (balanceInterval) {
    clearInterval(balanceInterval);
    balanceInterval = null;
  }
  console.log('Monitoring stopped');
}
