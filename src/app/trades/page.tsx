'use client';

import { useState, useCallback } from 'react';
import { TradeTable } from '@/components/TradeLog';
import { Card, CardHeader, CardTitle, CardContent, Button, Select } from '@/components/ui';
import { useBots, useTrades, useSSE } from '@/hooks';

export default function TradesPage() {
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const { bots } = useBots();
  const { trades, loading, pagination, refetch, loadMore } = useTrades({
    botId: selectedBot || undefined,
    status: selectedStatus || undefined,
    limit: 20,
  });

  const handleTradeCreated = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTradeUpdated = useCallback(() => {
    refetch();
  }, [refetch]);

  useSSE({
    onTradeCreated: handleTradeCreated,
    onTradeUpdated: handleTradeUpdated,
  });

  const botOptions = [
    { value: '', label: 'All Bots' },
    ...bots.map((bot) => ({ value: bot.id, label: bot.name })),
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'WON', label: 'Won' },
    { value: 'LOST', label: 'Lost' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ocean-900 mb-6">Trade Log</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Select
                label="Bot"
                options={botOptions}
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select
                label="Status"
                options={statusOptions}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Trades ({pagination.total} total)
            </CardTitle>
            <Button onClick={refetch} variant="secondary" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TradeTable trades={trades} loading={loading} />

          {pagination.hasMore && (
            <div className="mt-4 text-center">
              <Button onClick={loadMore} variant="secondary" disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
