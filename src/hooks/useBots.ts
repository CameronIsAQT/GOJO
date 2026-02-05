'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BotWithStats } from '@/types';

const REFRESH_INTERVAL = 20000; // 20 seconds

export function useBots() {
  const [bots, setBots] = useState<BotWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const fetchBots = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bots');
      if (!response.ok) throw new Error('Failed to fetch bots');
      const data = await response.json();
      setBots(data.bots);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    try {
      setRefreshing(true);
      // Refresh balances via API
      await fetch('/api/bots/refresh-balances', { method: 'POST' });
      // Then fetch updated bot data
      const response = await fetch('/api/bots');
      if (!response.ok) throw new Error('Failed to fetch bots');
      const data = await response.json();
      setBots(data.bots);
    } catch (err) {
      console.error('Failed to refresh balances:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial load - fetch bots and refresh balances
  useEffect(() => {
    const initialLoad = async () => {
      await fetchBots();
      // Refresh balances on initial page load
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
        refreshBalances();
      }
    };
    initialLoad();
  }, [fetchBots, refreshBalances]);

  // Auto-refresh balances every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBalances();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshBalances]);

  return { bots, loading, refreshing, error, refetch: fetchBots, refreshBalances };
}
