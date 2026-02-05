import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: Record<string, unknown> = {};

    if (botId) {
      where.botId = botId;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        include: {
          bot: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.trade.count({ where }),
    ]);

    return NextResponse.json({
      trades,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + trades.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
