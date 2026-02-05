const POLYMARKET_CLOB_URL = 'https://clob.polymarket.com';

export interface PolymarketMarket {
  condition_id: string;
  question_id: string;
  tokens: {
    token_id: string;
    outcome: string;
    price: number;
    winner: boolean;
  }[];
  end_date_iso: string;
  game_start_time: string | null;
  question: string;
  description: string;
  market_slug: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  accepting_orders: boolean;
  accepting_order_timestamp: string | null;
  minimum_order_size: number;
  minimum_tick_size: number;
  condition_id_map: Record<string, string>;
}

export interface MarketResolution {
  resolved: boolean;
  winningOutcome: string | null;
  resolutionTime: string | null;
}

export async function getMarket(marketId: string): Promise<PolymarketMarket | null> {
  try {
    const response = await fetch(`${POLYMARKET_CLOB_URL}/markets/${marketId}`);

    if (!response.ok) {
      console.error(`Failed to fetch market ${marketId}: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching market ${marketId}:`, error);
    return null;
  }
}

export async function checkMarketResolution(marketId: string): Promise<MarketResolution> {
  const market = await getMarket(marketId);

  if (!market) {
    return { resolved: false, winningOutcome: null, resolutionTime: null };
  }

  // A market is resolved when it's closed and has a winner
  const winningToken = market.tokens.find(t => t.winner === true);
  const resolved = market.closed && winningToken !== undefined;

  return {
    resolved,
    winningOutcome: winningToken?.outcome || null,
    resolutionTime: resolved ? new Date().toISOString() : null,
  };
}

export async function getMultipleMarkets(marketIds: string[]): Promise<Map<string, PolymarketMarket>> {
  const results = new Map<string, PolymarketMarket>();

  // Fetch markets in parallel with rate limiting (max 5 concurrent)
  const batchSize = 5;
  for (let i = 0; i < marketIds.length; i += batchSize) {
    const batch = marketIds.slice(i, i + batchSize);
    const promises = batch.map(async (id) => {
      const market = await getMarket(id);
      if (market) {
        results.set(id, market);
      }
    });
    await Promise.all(promises);
  }

  return results;
}
