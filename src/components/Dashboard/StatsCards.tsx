'use client';

interface StatsCardsProps {
  stats: {
    totalBots: number;
    totalTrades: number;
    pendingTrades: number;
    totalProfit: number;
    totalBalance: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-sky-500/20 p-5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Bots</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalBots}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-sky-500/20 p-5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Trades</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalTrades}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-sky-500/20 p-5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Pending</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{stats.pendingTrades}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-sky-500/20 p-5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Profit</p>
            <p className={`text-3xl font-bold mt-1 ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toFixed(2)}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.totalProfit >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            <svg className={`w-6 h-6 ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-sky-500/20 p-5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Balance</p>
            <p className="text-3xl font-bold text-sky-400 mt-1">
              ${stats.totalBalance.toFixed(2)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
