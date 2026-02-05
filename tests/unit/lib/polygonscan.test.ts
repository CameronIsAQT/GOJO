import { getUsdcBalance, getMaticBalance, getWalletBalances } from '@/lib/polygonscan';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Polygonscan API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getUsdcBalance', () => {
    it('should return USDC balance for a valid wallet', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: '1000000', // 1 USDC (6 decimals)
          }),
      });

      const balance = await getUsdcBalance('0x1234567890abcdef1234567890abcdef12345678');

      expect(balance).toBe(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            status: '0',
            message: 'Error',
            result: '',
          }),
      });

      const balance = await getUsdcBalance('0x1234567890abcdef1234567890abcdef12345678');

      expect(balance).toBe(0);
    });

    it('should return 0 when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const balance = await getUsdcBalance('0x1234567890abcdef1234567890abcdef12345678');

      expect(balance).toBe(0);
    });
  });

  describe('getMaticBalance', () => {
    it('should return MATIC balance for a valid wallet', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: '1000000000000000000', // 1 MATIC (18 decimals)
          }),
      });

      const balance = await getMaticBalance('0x1234567890abcdef1234567890abcdef12345678');

      expect(balance).toBe(1);
    });
  });

  describe('getWalletBalances', () => {
    it('should return both USDC and MATIC balances', async () => {
      mockFetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              status: '1',
              message: 'OK',
              result: '5000000', // 5 USDC
            }),
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              status: '1',
              message: 'OK',
              result: '2000000000000000000', // 2 MATIC
            }),
        });

      const balances = await getWalletBalances('0x1234567890abcdef1234567890abcdef12345678');

      expect(balances).toEqual({
        balanceUsdc: 5,
        balanceMatic: 2,
      });
    });
  });
});
