import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getWalletBalances } from '@/lib/polygonscan';

export async function GET() {
  try {
    const bots = await prisma.bot.findMany({
      include: {
        trades: {
          select: {
            id: true,
            status: true,
            costUsdc: true,
            potentialWin: true,
          },
        },
        balanceSnapshots: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats for each bot
    const botsWithStats = bots.map((bot) => {
      const totalTrades = bot.trades.length;
      const pendingTrades = bot.trades.filter((t) => t.status === 'PENDING').length;
      const wonTrades = bot.trades.filter((t) => t.status === 'WON').length;
      const lostTrades = bot.trades.filter((t) => t.status === 'LOST').length;

      // Calculate profit: won trades give potentialWin, lost trades lose costUsdc
      const wonProfit = bot.trades
        .filter((t) => t.status === 'WON')
        .reduce((sum, t) => sum + (t.potentialWin - t.costUsdc), 0);
      const lostCost = bot.trades
        .filter((t) => t.status === 'LOST')
        .reduce((sum, t) => sum + t.costUsdc, 0);
      const totalProfit = wonProfit - lostCost;

      const latestBalance = bot.balanceSnapshots[0];

      return {
        id: bot.id,
        name: bot.name,
        walletAddress: bot.walletAddress,
        createdAt: bot.createdAt,
        totalTrades,
        pendingTrades,
        wonTrades,
        lostTrades,
        totalProfit: Math.round(totalProfit * 100) / 100,
        currentBalance: latestBalance?.balanceUsdc || null,
      };
    });

    return NextResponse.json({ bots: botsWithStats });
  } catch (error) {
    console.error('Error fetching bots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, walletAddress } = body;

    if (!name || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: name, walletAddress' },
        { status: 400 }
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Check if wallet already exists
    const existingBot = await prisma.bot.findUnique({
      where: { walletAddress },
    });

    if (existingBot) {
      return NextResponse.json(
        { error: 'A bot with this wallet address already exists' },
        { status: 409 }
      );
    }

    const bot = await prisma.bot.create({
      data: { name, walletAddress },
    });

    // Fetch initial balance for the new bot
    try {
      const { balanceUsdc, balanceMatic } = await getWalletBalances(walletAddress);
      await prisma.balanceSnapshot.create({
        data: {
          botId: bot.id,
          balanceUsdc,
          balanceMatic,
        },
      });
    } catch (balanceError) {
      console.error('Failed to fetch initial balance:', balanceError);
      // Continue even if balance fetch fails - bot is still created
    }

    return NextResponse.json({ bot }, { status: 201 });
  } catch (error) {
    console.error('Error creating bot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
