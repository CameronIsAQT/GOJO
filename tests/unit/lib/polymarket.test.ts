import { getMarket, checkMarketResolution } from '@/lib/polymarket';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Polymarket API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getMarket', () => {
    it('should fetch market data successfully', async () => {
      const mockMarket = {
        condition_id: 'cond123',
        question_id: 'q123',
        tokens: [
          { token_id: 't1', outcome: 'Yes', price: 0.6, winner: false },
          { token_id: 't2', outcome: 'No', price: 0.4, winner: false },
        ],
        question: 'Will X happen?',
        active: true,
        closed: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMarket),
      });

      const market = await getMarket('market123');

      expect(market).toEqual(mockMarket);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://clob.polymarket.com/markets/market123'
      );
    });

    it('should return null when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const market = await getMarket('nonexistent');

      expect(market).toBeNull();
    });

    it('should return null when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const market = await getMarket('market123');

      expect(market).toBeNull();
    });
  });

  describe('checkMarketResolution', () => {
    it('should return resolved with winning outcome when market is closed with winner', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            condition_id: 'cond123',
            tokens: [
              { token_id: 't1', outcome: 'Yes', price: 1, winner: true },
              { token_id: 't2', outcome: 'No', price: 0, winner: false },
            ],
            closed: true,
          }),
      });

      const resolution = await checkMarketResolution('market123');

      expect(resolution.resolved).toBe(true);
      expect(resolution.winningOutcome).toBe('Yes');
      expect(resolution.resolutionTime).toBeTruthy();
    });

    it('should return not resolved when market is open', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            condition_id: 'cond123',
            tokens: [
              { token_id: 't1', outcome: 'Yes', price: 0.6, winner: false },
              { token_id: 't2', outcome: 'No', price: 0.4, winner: false },
            ],
            closed: false,
          }),
      });

      const resolution = await checkMarketResolution('market123');

      expect(resolution.resolved).toBe(false);
      expect(resolution.winningOutcome).toBeNull();
    });

    it('should return not resolved when market fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const resolution = await checkMarketResolution('market123');

      expect(resolution.resolved).toBe(false);
      expect(resolution.winningOutcome).toBeNull();
    });
  });
});
