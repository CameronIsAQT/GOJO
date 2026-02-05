/**
 * @jest-environment node
 */

import { GET } from '@/app/api/trades/route';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    trade: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import prisma from '@/lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('GET /api/trades', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost:3000/api/trades');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url.toString());
  };

  it('should return paginated trades', async () => {
    const mockTrades = [
      {
        id: 'trade-1',
        botId: 'bot-1',
        marketId: 'market-1',
        marketQuestion: 'Will X happen?',
        outcome: 'YES',
        costUsdc: 50,
        shares: 100,
        potentialWin: 100,
        status: 'PENDING',
        txHash: '0xtx1',
        createdAt: new Date(),
        resolvedAt: null,
        bot: { id: 'bot-1', name: 'Bot 1', walletAddress: '0x1234' },
      },
    ];

    (mockPrisma.trade.findMany as jest.Mock).mockResolvedValue(mockTrades);
    (mockPrisma.trade.count as jest.Mock).mockResolvedValue(1);

    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.trades).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
    expect(data.pagination.hasMore).toBe(false);
  });

  it('should filter by botId', async () => {
    (mockPrisma.trade.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.trade.count as jest.Mock).mockResolvedValue(0);

    const request = createRequest({ botId: 'bot-1' });
    await GET(request);

    expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ botId: 'bot-1' }),
      })
    );
  });

  it('should filter by status', async () => {
    (mockPrisma.trade.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.trade.count as jest.Mock).mockResolvedValue(0);

    const request = createRequest({ status: 'pending' });
    await GET(request);

    expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PENDING' }),
      })
    );
  });

  it('should respect limit and offset parameters', async () => {
    (mockPrisma.trade.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.trade.count as jest.Mock).mockResolvedValue(100);

    const request = createRequest({ limit: '10', offset: '20' });
    const response = await GET(request);
    const data = await response.json();

    expect(mockPrisma.trade.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        skip: 20,
      })
    );
    expect(data.pagination.limit).toBe(10);
    expect(data.pagination.offset).toBe(20);
    expect(data.pagination.hasMore).toBe(true);
  });
});
