/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/bots/route';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    bot: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import prisma from '@/lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('GET /api/bots', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return list of bots with stats', async () => {
    const mockBots = [
      {
        id: 'bot-1',
        name: 'Bot 1',
        walletAddress: '0x1234',
        createdAt: new Date(),
        trades: [
          { id: 't1', status: 'WON', costUsdc: 10, potentialWin: 20 },
          { id: 't2', status: 'LOST', costUsdc: 15, potentialWin: 30 },
          { id: 't3', status: 'PENDING', costUsdc: 20, potentialWin: 40 },
        ],
        balanceSnapshots: [{ balanceUsdc: 100, balanceMatic: 5 }],
      },
    ];

    (mockPrisma.bot.findMany as jest.Mock).mockResolvedValue(mockBots);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.bots).toHaveLength(1);
    expect(data.bots[0].totalTrades).toBe(3);
    expect(data.bots[0].wonTrades).toBe(1);
    expect(data.bots[0].lostTrades).toBe(1);
    expect(data.bots[0].pendingTrades).toBe(1);
    expect(data.bots[0].currentBalance).toBe(100);
  });

  it('should return empty array when no bots', async () => {
    (mockPrisma.bot.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(data.bots).toEqual([]);
  });
});

describe('POST /api/bots', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost:3000/api/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  it('should create a new bot', async () => {
    const newBot = {
      id: 'bot-new',
      name: 'New Bot',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      createdAt: new Date(),
    };

    (mockPrisma.bot.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.bot.create as jest.Mock).mockResolvedValue(newBot);

    const request = createRequest({
      name: 'New Bot',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.bot.name).toBe('New Bot');
  });

  it('should return 400 for missing fields', async () => {
    const request = createRequest({
      name: 'Bot without wallet',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid wallet address', async () => {
    const request = createRequest({
      name: 'Invalid Bot',
      walletAddress: 'not-a-valid-address',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid wallet address');
  });

  it('should return 409 for duplicate wallet address', async () => {
    (mockPrisma.bot.findUnique as jest.Mock).mockResolvedValue({
      id: 'existing-bot',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    });

    const request = createRequest({
      name: 'Duplicate Bot',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
  });
});
