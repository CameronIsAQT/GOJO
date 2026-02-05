import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample bots
  const bot1 = await prisma.bot.upsert({
    where: { walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
    update: {},
    create: {
      name: 'Arbitrage Bot 1',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    },
  });

  const bot2 = await prisma.bot.upsert({
    where: { walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12' },
    update: {},
    create: {
      name: 'Market Maker Bot',
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    },
  });

  // Delete existing trades and snapshots to avoid duplicates
  await prisma.trade.deleteMany({});
  await prisma.balanceSnapshot.deleteMany({});

  // Create sample trades
  await prisma.trade.createMany({
    data: [
      {
        botId: bot1.id,
        marketId: 'market-1',
        marketQuestion: 'Will Bitcoin reach $100k by end of 2025?',
        outcome: 'YES',
        costUsdc: 50.0,
        shares: 100,
        potentialWin: 100.0,
        status: 'PENDING',
        txHash: '0xtx1234567890',
      },
      {
        botId: bot1.id,
        marketId: 'market-2',
        marketQuestion: 'Will it rain tomorrow in NYC?',
        outcome: 'NO',
        costUsdc: 25.0,
        shares: 50,
        potentialWin: 50.0,
        status: 'WON',
        txHash: '0xtx0987654321',
        resolvedAt: new Date(),
      },
      {
        botId: bot2.id,
        marketId: 'market-3',
        marketQuestion: 'Will ETH flip BTC by market cap?',
        outcome: 'YES',
        costUsdc: 100.0,
        shares: 200,
        potentialWin: 200.0,
        status: 'PENDING',
        txHash: '0xtxabcdef1234',
      },
    ],
  });

  // Create sample balance snapshots
  await prisma.balanceSnapshot.createMany({
    data: [
      {
        botId: bot1.id,
        balanceUsdc: 1000.0,
        balanceMatic: 50.0,
      },
      {
        botId: bot2.id,
        balanceUsdc: 2500.0,
        balanceMatic: 100.0,
      },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
