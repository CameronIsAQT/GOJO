import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emitEvent } from '@/lib/events';
import { WebhookTradePayload } from '@/types';

export const dynamic = 'force-dynamic';

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Optional webhook authentication - only check if secret is explicitly set
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret.length > 0) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${webhookSecret}`) {
        console.log('Webhook auth failed - secret is set but header mismatch');
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid or missing Authorization header' },
          {
            status: 401,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        );
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

    return NextResponse.json(
      { success: true, trade },
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
