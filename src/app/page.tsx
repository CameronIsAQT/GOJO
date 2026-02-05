'use client';

import { useCallback } from 'react';
import { StatsCards } from '@/components/Dashboard';
import { BotCard } from '@/components/BotCard';
import { TradeTable } from '@/components/TradeLog';
import { Card, CardContent } from '@/components/ui';
import { useBots, useTrades, useSSE } from '@/hooks';
import Link from 'next/link';

export default function DashboardPage() {
  const { bots, loading: botsLoading, refreshing, refetch: refetchBots } = useBots();
  const { trades, loading: tradesLoading, refetch: refetchTrades } = useTrades({ limit: 5 });

  const handleTradeCreated = useCallback(() => {
    refetchTrades();
    refetchBots();
  }, [refetchTrades, refetchBots]);

  const handleTradeUpdated = useCallback(() => {
    refetchTrades();
    refetchBots();
  }, [refetchTrades, refetchBots]);

  const handleBalanceUpdated = useCallback(() => {
    refetchBots();
  }, [refetchBots]);

  useSSE({
    onTradeCreated: handleTradeCreated,
    onTradeUpdated: handleTradeUpdated,
    onBalanceUpdated: handleBalanceUpdated,
  });

  // Calculate stats
  const stats = {
    totalBots: bots.length,
    totalTrades: bots.reduce((sum, bot) => sum + bot.totalTrades, 0),
    pendingTrades: bots.reduce((sum, bot) => sum + bot.pendingTrades, 0),
    totalProfit: bots.reduce((sum, bot) => sum + bot.totalProfit, 0),
    totalBalance: bots.reduce((sum, bot) => sum + (bot.currentBalance || 0), 0),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        {refreshing && (
          <div className="flex items-center gap-2 text-sm text-sky-400">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Refreshing balances...</span>
          </div>
        )}
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bots Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Your Bots</h2>
            <Link href="/bots" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
              View all &rarr;
            </Link>
          </div>
          {botsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-48 bg-slate-800/50 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : bots.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-slate-400 mb-4">No bots configured yet</p>
                <Link
                  href="/bots"
                  className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
                >
                  Add your first bot &rarr;
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bots.slice(0, 3).map((bot) => (
                <BotCard key={bot.id} bot={bot} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Trades Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Trades</h2>
            <Link href="/trades" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
              View all &rarr;
            </Link>
          </div>
          <Card>
            <CardContent>
              <TradeTable trades={trades} loading={tradesLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
