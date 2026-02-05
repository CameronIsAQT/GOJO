export type TradeStatus = 'PENDING' | 'WON' | 'LOST' | 'CANCELLED';

export interface WebhookTradePayload {
  botName: string;
  walletAddress: string;
  marketId: string;
  marketQuestion: string;
  outcome: string;
  costUsdc: number;
  shares: number;
  potentialWin: number;
  txHash?: string;
}

export interface BalanceResponse {
  walletAddress: string;
  balanceUsdc: number;
  balanceMatic: number;
  timestamp: string;
}

export interface MarketInfo {
  id: string;
  question: string;
  resolved: boolean;
  outcome?: string;
  resolutionTime?: string;
}

export interface BotWithStats {
  id: string;
  name: string;
  walletAddress: string;
  createdAt: Date;
  totalTrades: number;
  pendingTrades: number;
  wonTrades: number;
  lostTrades: number;
  totalProfit: number;
  currentBalance: number | null;
}

export interface TradeWithBot {
  id: string;
  botId: string;
  bot: {
    id: string;
    name: string;
    walletAddress: string;
  };
  marketId: string;
  marketQuestion: string;
  outcome: string;
  costUsdc: number;
  shares: number;
  potentialWin: number;
  status: TradeStatus;
  txHash: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface SSEEvent {
  type: 'trade_created' | 'trade_updated' | 'balance_updated';
  data: unknown;
}
