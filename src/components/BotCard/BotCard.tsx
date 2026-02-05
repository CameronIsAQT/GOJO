'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Button } from '@/components/ui';

interface BotCardProps {
  bot: {
    id: string;
    name: string;
    walletAddress: string;
    totalTrades: number;
    pendingTrades: number;
    wonTrades: number;
    lostTrades: number;
    totalProfit: number;
    currentBalance: number | null;
  };
  onDelete?: (id: string) => void;
}

export function BotCard({ bot, onDelete }: BotCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const winRate = bot.totalTrades > 0
    ? Math.round((bot.wonTrades / (bot.wonTrades + bot.lostTrades || 1)) * 100)
    : 0;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/bots/${bot.id}`, {
        method: 'DELETE',
      });
      if (response.ok && onDelete) {
        onDelete(bot.id);
      }
    } catch (error) {
      console.error('Failed to delete bot:', error);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-sky-500/20 p-6 shadow-xl shadow-black/40 transition-all hover:border-sky-400/40">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
          <p className="text-sm text-slate-500 font-mono truncate max-w-[200px]">
            {bot.walletAddress}
          </p>
        </div>
        {bot.pendingTrades > 0 && (
          <Badge variant="warning">{bot.pendingTrades} pending</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-slate-400">Balance</p>
          <p className="text-2xl font-bold text-white">
            {bot.currentBalance !== null ? `$${bot.currentBalance.toFixed(2)}` : '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Profit</p>
          <p className={`text-2xl font-bold ${bot.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {bot.totalProfit >= 0 ? '+' : ''}${bot.totalProfit.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm mb-4 pb-4 border-b border-slate-700/30">
        <span className="text-slate-400">Trades: <span className="text-white font-medium">{bot.totalTrades}</span></span>
        <span className="text-slate-400">Win Rate: <span className="text-white font-medium">{winRate}%</span></span>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-sm">
          <span className="text-emerald-400">Won: {bot.wonTrades}</span>
          <span className="text-red-400">Lost: {bot.lostTrades}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfirm(true)}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          >
            Delete
          </button>
          <Link
            href={`/bots?id=${bot.id}`}
            className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
          >
            Details &rarr;
          </Link>
        </div>
      </div>

      {showConfirm && (
        <div className="mt-4 pt-4 border-t border-slate-700/30">
          <p className="text-sm text-slate-400 mb-3">
            Delete &quot;{bot.name}&quot;? This will also delete all associated trades.
          </p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
