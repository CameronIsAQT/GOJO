import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkMarketResolution } from '@/lib/polymarket';
import { emitEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

// Vercel cron jobs send a secret to verify the request
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is set, allow the request (for testing)
  if (!cronSecret) return true;

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting trade resolution check...');

    // Get all pending trades
    const pendingTrades = await prisma.trade.findMany({
      where: { status: 'PENDING' },
      include: { bot: true },
    });

    console.log(`Found ${pendingTrades.length} pending trades`);

    if (pendingTrades.length === 0) {
      return NextResponse.json({
        message: 'No pending trades to check',
        checked: 0,
        updated: 0
      });
    }

    let updatedCount = 0;
    const results: Array<{
      tradeId: string;
      marketId: string;
      status: string;
      profit?: number;
    }> = [];

    // Check each pending trade
    for (const trade of pendingTrades) {
      try {
        const resolution = await checkMarketResolution(trade.marketId);

        if (resolution.resolved && resolution.winningOutcome) {
          // Determine if trade won or lost
          const tradeWon = trade.outcome.toUpperCase() === resolution.winningOutcome.toUpperCase();
          const newStatus = tradeWon ? 'WON' : 'LOST';

          // Calculate profit/loss
          // If won: profit = potentialWin - costUsdc
          // If lost: profit = -costUsdc
          const profit = tradeWon
            ? trade.potentialWin - trade.costUsdc
            : -trade.costUsdc;

          // Update the trade
          const updatedTrade = await prisma.trade.update({
            where: { id: trade.id },
            data: {
              status: newStatus,
              resolvedAt: new Date(),
            },
            include: { bot: true },
          });

          updatedCount++;
          results.push({
            tradeId: trade.id,
            marketId: trade.marketId,
            status: newStatus,
            profit,
          });

          console.log(`Trade ${trade.id} resolved: ${newStatus} (${profit >= 0 ? '+' : ''}$${profit.toFixed(2)})`);

          // Emit event for real-time updates
          emitEvent({
            type: 'trade_updated',
            data: updatedTrade,
          });
        }
      } catch (error) {
        console.error(`Error checking trade ${trade.id}:`, error);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const summary = {
      message: 'Trade resolution check complete',
      checked: pendingTrades.length,
      updated: updatedCount,
      results,
      timestamp: new Date().toISOString(),
    };

    console.log('Trade resolution check complete:', summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error in trade resolution cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
