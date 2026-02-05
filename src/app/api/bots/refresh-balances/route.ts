import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getWalletBalances } from '@/lib/polygonscan';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Get all bots
    const bots = await prisma.bot.findMany({
      select: {
        id: true,
        walletAddress: true,
      },
    });

    if (bots.length === 0) {
      return NextResponse.json({ message: 'No bots to refresh', updated: 0 });
    }

    // Fetch balances for all bots in parallel
    const balancePromises = bots.map(async (bot) => {
      try {
        const { balanceUsdc, balanceMatic } = await getWalletBalances(bot.walletAddress);

        // Create a new balance snapshot
        await prisma.balanceSnapshot.create({
          data: {
            botId: bot.id,
            balanceUsdc,
            balanceMatic,
          },
        });

        return { botId: bot.id, success: true, balanceUsdc };
      } catch (error) {
        console.error(`Failed to refresh balance for bot ${bot.id}:`, error);
        return { botId: bot.id, success: false };
      }
    });

    const results = await Promise.all(balancePromises);
    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      message: `Refreshed ${successCount}/${bots.length} bot balances`,
      updated: successCount,
      results,
    });
  } catch (error) {
    console.error('Error refreshing balances:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
