// Etherscan V2 API (PolygonScan merged into Etherscan)
const ETHERSCAN_V2_API_URL = 'https://api.etherscan.io/v2/api';
const POLYGON_CHAIN_ID = '137';
// USDC.e (PoS) - Bridged USDC from Ethereum, used by Polymarket
const USDC_E_CONTRACT = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

interface EtherscanV2Response<T> {
  status: string;
  message: string;
  result: T;
}

export async function getUsdcBalance(walletAddress: string): Promise<number> {
  const apiKey = process.env.POLYGONSCAN_API_KEY;

  const url = new URL(ETHERSCAN_V2_API_URL);
  url.searchParams.set('chainid', POLYGON_CHAIN_ID);
  url.searchParams.set('module', 'account');
  url.searchParams.set('action', 'tokenbalance');
  url.searchParams.set('contractaddress', USDC_E_CONTRACT);
  url.searchParams.set('address', walletAddress);
  url.searchParams.set('tag', 'latest');
  if (apiKey) {
    url.searchParams.set('apikey', apiKey);
  }

  try {
    const response = await fetch(url.toString());
    const data: EtherscanV2Response<string> = await response.json();

    if (data.status !== '1') {
      console.error('Etherscan V2 API error:', data.message);
      return 0;
    }

    // USDC.e has 6 decimals
    return parseInt(data.result) / 1e6;
  } catch (error) {
    console.error('Failed to fetch USDC balance:', error);
    return 0;
  }
}

export async function getMaticBalance(walletAddress: string): Promise<number> {
  const apiKey = process.env.POLYGONSCAN_API_KEY;

  const url = new URL(ETHERSCAN_V2_API_URL);
  url.searchParams.set('chainid', POLYGON_CHAIN_ID);
  url.searchParams.set('module', 'account');
  url.searchParams.set('action', 'balance');
  url.searchParams.set('address', walletAddress);
  url.searchParams.set('tag', 'latest');
  if (apiKey) {
    url.searchParams.set('apikey', apiKey);
  }

  try {
    const response = await fetch(url.toString());
    const data: EtherscanV2Response<string> = await response.json();

    if (data.status !== '1') {
      console.error('Etherscan V2 API error:', data.message);
      return 0;
    }

    // POL (formerly MATIC) has 18 decimals
    return parseInt(data.result) / 1e18;
  } catch (error) {
    console.error('Failed to fetch POL balance:', error);
    return 0;
  }
}

export async function getWalletBalances(walletAddress: string): Promise<{
  balanceUsdc: number;
  balanceMatic: number;
}> {
  const [balanceUsdc, balanceMatic] = await Promise.all([
    getUsdcBalance(walletAddress),
    getMaticBalance(walletAddress),
  ]);

  return { balanceUsdc, balanceMatic };
}
