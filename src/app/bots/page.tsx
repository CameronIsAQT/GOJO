'use client';

import { useState, useCallback } from 'react';
import { BotCard } from '@/components/BotCard';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { useBots, useSSE } from '@/hooks';

export default function BotsPage() {
  const { bots, loading, refreshing, refetch } = useBots();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotWallet, setNewBotWallet] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleBalanceUpdated = useCallback(() => {
    refetch();
  }, [refetch]);

  useSSE({
    onBalanceUpdated: handleBalanceUpdated,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newBotName.trim() || !newBotWallet.trim()) {
      setFormError('Both name and wallet address are required');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newBotWallet)) {
      setFormError('Invalid wallet address format');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBotName.trim(),
          walletAddress: newBotWallet.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create bot');
      }

      setNewBotName('');
      setNewBotWallet('');
      setShowAddForm(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBot = () => {
    refetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Bot Management</h1>
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-sky-400">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Refreshing...</span>
            </div>
          )}
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Bot'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Bot Name"
                placeholder="e.g., Arbitrage Bot 1"
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
              />
              <Input
                label="Wallet Address"
                placeholder="0x..."
                value={newBotWallet}
                onChange={(e) => setNewBotWallet(e.target.value)}
              />
              {formError && (
                <p className="text-red-500 text-sm">{formError}</p>
              )}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Bot'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-800/50 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : bots.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-400 mb-4">No bots configured yet</p>
            <Button onClick={() => setShowAddForm(true)}>Add your first bot</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} onDelete={handleDeleteBot} />
          ))}
        </div>
      )}
    </div>
  );
}
