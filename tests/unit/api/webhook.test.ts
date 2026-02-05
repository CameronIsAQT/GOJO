/**
 * @jest-environment node
 */

import { POST } from '@/app/api/webhook/trade/route';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    bot: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    trade: {
      create: jest.fn(),
    },
  },
}));

// Mock events
jest.mock('@/lib/events', () => ({
  emitEvent: jest.fn(),
}));

import prisma from '@/lib/prisma';
import { emitEvent } from '@/lib/events';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('POST /api/webhook/trade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: unknown, headers: Record<string, string> = {}) => {
    return new NextRequest('http://localhost:3000/api/webhook/trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  };

  it('should create a trade for an existing bot', async () => {
    const existingBot = {
      id: 'bot-123',
      name: 'Test Bot',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      createdAt: new Date(),
    };

    const createdTrade = {
      id: 'trade-123',
      botId: 'bot-123',
      marketId: 'market-1',
      marketQuestion: 'Will X happen?',
      outcome: 'YES',
      costUsdc: 50,
      shares: 100,
      potentialWin: 100,
      status: 'PENDING',
      txHash: '0xtx123',
      createdAt: new Date(),
      resolvedAt: null,
      bot: existingBot,
    };

    (mockPrisma.bot.findUnique as jest.Mock).mockResolvedValue(existingBot);
    (mockPrisma.trade.create as jest.Mock).mockResolvedValue(createdTrade);

    const request = createRequest({
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      marketId: 'market-1',
      marketQuestion: 'Will X happen?',
      outcome: 'YES',
      costUsdc: 50,
      shares: 100,
      potentialWin: 100,
      txHash: '0xtx123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.trade).toBeDefined();
    expect(emitEvent).toHaveBeenCalledWith({
      type: 'trade_created',
      data: createdTrade,
    });
  });

  it('should create a new bot if not exists', async () => {
    const newBot = {
      id: 'bot-new',
      name: 'Bot 0x123456',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      createdAt: new Date(),
    };

    const createdTrade = {
      id: 'trade-123',
      botId: 'bot-new',
      marketId: 'market-1',
      marketQuestion: 'Unknown market',
      outcome: 'YES',
      costUsdc: 0,
      shares: 0,
      potentialWin: 0,
      status: 'PENDING',
      txHash: null,
      createdAt: new Date(),
      resolvedAt: null,
      bot: newBot,
    };

    (mockPrisma.bot.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.bot.create as jest.Mock).mockResolvedValue(newBot);
    (mockPrisma.trade.create as jest.Mock).mockResolvedValue(createdTrade);

    const request = createRequest({
      botName: 'New Bot',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      marketId: 'market-1',
      outcome: 'YES',
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockPrisma.bot.create).toHaveBeenCalled();
  });

  it('should return 400 when missing required fields', async () => {
    const request = createRequest({
      botName: 'Test Bot',
      // Missing walletAddress, marketId, outcome
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 401 when webhook secret is set but not provided', async () => {
    const originalEnv = process.env.WEBHOOK_SECRET;
    process.env.WEBHOOK_SECRET = 'my-secret';

    const request = createRequest({
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      marketId: 'market-1',
      outcome: 'YES',
    });

    const response = await POST(request);

    expect(response.status).toBe(401);

    process.env.WEBHOOK_SECRET = originalEnv;
  });

  it('should authenticate with correct webhook secret', async () => {
    const originalEnv = process.env.WEBHOOK_SECRET;
    process.env.WEBHOOK_SECRET = 'my-secret';

    const existingBot = {
      id: 'bot-123',
      name: 'Test Bot',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      createdAt: new Date(),
    };

    (mockPrisma.bot.findUnique as jest.Mock).mockResolvedValue(existingBot);
    (mockPrisma.trade.create as jest.Mock).mockResolvedValue({
      id: 'trade-123',
      bot: existingBot,
    });

    const request = createRequest(
      {
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        marketId: 'market-1',
        outcome: 'YES',
      },
      { authorization: 'Bearer my-secret' }
    );

    const response = await POST(request);

    expect(response.status).toBe(201);

    process.env.WEBHOOK_SECRET = originalEnv;
  });
});
