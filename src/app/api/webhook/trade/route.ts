import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emitEvent } from '@/lib/events';
import { WebhookTradePayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Optional webhook authentication
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${webhookSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const payload: WebhookTradePayload = await request.json();

    // Validate required fields
    if (!payload.walletAddress || !payload.marketId || !payload.outcome) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, marketId, outcome' },
        { status: 400 }
      );
    }

    // Find or create bot
    let bot = await prisma.bot.findUnique({
      where: { walletAddress: payload.walletAddress },
    });

    if (!bot) {
      bot = await prisma.bot.create({
        data: {
          name: payload.botName || `Bot ${payload.walletAddress.slice(0, 8)}`,
          walletAddress: payload.walletAddress,
        },
      });
    }

    // Create trade
    const trade = await prisma.trade.create({
      data: {
        botId: bot.id,
        marketId: payload.marketId,
        marketQuestion: payload.marketQuestion || 'Unknown market',
        outcome: payload.outcome.toUpperCase(),
        costUsdc: payload.costUsdc || 0,
        shares: payload.shares || 0,
        potentialWin: payload.potentialWin || 0,
        txHash: payload.txHash,
        status: 'PENDING',
      },
      include: { bot: true },
    });

    // Emit SSE event
    emitEvent({
      type: 'trade_created',
      data: trade,
    });

    return NextResponse.json({ success: true, trade }, { status: 201 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
