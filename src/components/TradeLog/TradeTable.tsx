'use client';

import { TradeStatusBadge } from '@/components/ui';
import { TradeWithBot } from '@/types';

interface TradeTableProps {
  trades: TradeWithBot[];
  loading?: boolean;
}

export function TradeTable({ trades, loading }: TradeTableProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No trades found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-700/30">
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Bot
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Market
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Position
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Cost
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Potential
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/20">
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-white">
                  {trade.bot.name}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm text-slate-200 max-w-xs truncate">
                  {trade.marketQuestion}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {trade.marketId.slice(0, 16)}...
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`text-sm font-semibold ${
                  trade.outcome === 'YES' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {trade.outcome}
                </span>
                <div className="text-xs text-slate-500">
                  {trade.shares.toFixed(2)} shares
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                ${trade.costUsdc.toFixed(2)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-emerald-400">
                ${trade.potentialWin.toFixed(2)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <TradeStatusBadge status={trade.status} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">
                {new Date(trade.createdAt).toLocaleDateString()}
                <div className="text-xs text-slate-500">
                  {new Date(trade.createdAt).toLocaleTimeString()}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
