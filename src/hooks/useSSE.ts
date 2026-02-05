'use client';

import { useEffect, useCallback, useRef } from 'react';
import { SSEEvent } from '@/types';

interface UseSSEOptions {
  onTradeCreated?: (data: unknown) => void;
  onTradeUpdated?: (data: unknown) => void;
  onBalanceUpdated?: (data: unknown) => void;
}

export function useSSE(options: UseSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/events');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);

        switch (data.type) {
          case 'trade_created':
            options.onTradeCreated?.(data.data);
            break;
          case 'trade_updated':
            options.onTradeUpdated?.(data.data);
            break;
          case 'balance_updated':
            options.onBalanceUpdated?.(data.data);
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };
  }, [options]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}
