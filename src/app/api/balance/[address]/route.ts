import { NextRequest, NextResponse } from 'next/server';
import { getWalletBalances } from '@/lib/polygonscan';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Fetch current balances from PolygonScan
    const balances = await getWalletBalances(address);

    // Find the bot associated with this wallet
    const bot = await prisma.bot.findUnique({
      where: { walletAddress: address },
    });

    // If we have a bot, save the snapshot
    if (bot) {
      await prisma.balanceSnapshot.create({
        data: {
          botId: bot.id,
          balanceUsdc: balances.balanceUsdc,
          balanceMatic: balances.balanceMatic,
        },
      });
    }

    return NextResponse.json({
      walletAddress: address,
      balanceUsdc: balances.balanceUsdc,
      balanceMatic: balances.balanceMatic,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
