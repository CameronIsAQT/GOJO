'use client';

import { useState, useEffect, useCallback } from 'react';
import { TradeWithBot } from '@/types';

interface UseTradesOptions {
  botId?: string;
  status?: string;
  limit?: number;
}

interface TradesResponse {
  trades: TradeWithBot[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function useTrades(options: UseTradesOptions = {}) {
  const [trades, setTrades] = useState<TradeWithBot[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: options.limit || 50,
    offset: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async (offset = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (options.botId) params.set('botId', options.botId);
      if (options.status) params.set('status', options.status);
      params.set('limit', String(options.limit || 50));
      params.set('offset', String(offset));

      const response = await fetch(`/api/trades?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch trades');
      const data: TradesResponse = await response.json();

      if (offset === 0) {
        setTrades(data.trades);
      } else {
        setTrades(prev => [...prev, ...data.trades]);
      }
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options.botId, options.status, options.limit]);

  useEffect(() => {
    fetchTrades(0);
  }, [fetchTrades]);

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      fetchTrades(pagination.offset + pagination.limit);
    }
  }, [fetchTrades, pagination, loading]);

  return { trades, loading, error, pagination, refetch: () => fetchTrades(0), loadMore };
}
