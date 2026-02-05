# Bot Setup Guide

This guide explains how to set up and manage your trading bots in the Polymarket Tracker.

## Overview

Bots are identified by their Polygon wallet address. Each bot tracks:
- Trade history
- Balance over time
- Win/loss statistics
- Total profit

## Adding a Bot

### Method 1: Via Web Interface

1. Navigate to `http://localhost:3000/bots`
2. Click **"Add Bot"**
3. Fill in the form:
   - **Bot Name**: A human-readable name (e.g., "Arbitrage Bot 1")
   - **Wallet Address**: Your bot's Polygon wallet address
4. Click **"Add Bot"**

### Method 2: Via API

```bash
curl -X POST http://localhost:3000/api/bots \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Trading Bot",
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

### Method 3: Automatic Creation via Webhook

Bots are automatically created when you send a trade webhook with a new wallet address. The bot name will be set to the `botName` field in the webhook, or default to the wallet address prefix.

## Bot Configuration

### Getting Your Wallet Address

Your bot's wallet address is the Polygon address used for trading on Polymarket. This is typically:

1. **If using a dedicated bot wallet**: The address you generated for your bot
2. **If using a hardware wallet**: Your Polygon address from the hardware wallet
3. **If using a browser wallet**: Your MetaMask/Rabby address connected to Polymarket

### Finding Your Address

- **From Polymarket**: Go to your profile, your address is displayed
- **From PolygonScan**: Check your transaction history
- **From your wallet**: Copy your Polygon/Ethereum address

## Understanding Bot Statistics

On the dashboard and bot pages, you'll see these statistics:

| Stat | Description |
|------|-------------|
| **Balance** | Current USDC balance (fetched from PolygonScan) |
| **Total Profit** | Sum of (wins - losses) across all resolved trades |
| **Total Trades** | Total number of trades recorded |
| **Pending Trades** | Trades waiting for market resolution |
| **Won Trades** | Trades that resolved in your favor |
| **Lost Trades** | Trades that resolved against your position |
| **Win Rate** | Percentage of resolved trades won |

### Profit Calculation

```
For each WON trade:  profit += (potentialWin - costUsdc)
For each LOST trade: profit -= costUsdc
```

## Managing Multiple Bots

You can track multiple bots simultaneously. Each bot is uniquely identified by its wallet address.

### Recommended Setup

1. **One bot per strategy**: Create separate bots for different trading strategies
2. **Descriptive names**: Use names that describe the strategy (e.g., "Sports Arbitrage", "News Event Bot")
3. **Separate wallets**: Use different wallet addresses for different strategies for cleaner tracking

### Example Multi-Bot Setup

```
Bot 1: "Arbitrage Bot"      - 0xABC... - High-frequency arbitrage trades
Bot 2: "News Event Bot"     - 0xDEF... - Trades based on news events
Bot 3: "Long-term Holder"   - 0x123... - Long-term market positions
```

## Balance Tracking

### How Balance Updates Work

1. **Automatic sync**: Balances are fetched periodically from PolygonScan
2. **On trade resolution**: Balance is updated when a trade wins or loses
3. **Manual refresh**: Click the refresh button on the dashboard

### Setting Up PolygonScan API Key

For faster, more reliable balance fetching:

1. Go to [PolygonScan](https://polygonscan.com/apis)
2. Create a free account
3. Generate an API key
4. Add to your `.env`:
   ```
   POLYGONSCAN_API_KEY=your-api-key-here
   ```

Without an API key, the tracker will still work but may be rate-limited.

## Trade Status Lifecycle

Trades progress through these statuses:

```
PENDING → WON/LOST/CANCELLED
```

| Status | Description |
|--------|-------------|
| **PENDING** | Trade placed, market not yet resolved |
| **WON** | Market resolved in your favor |
| **LOST** | Market resolved against your position |
| **CANCELLED** | Trade was cancelled/refunded |

### Automatic Resolution Detection

The tracker automatically monitors pending trades and updates their status when:

1. The Polymarket market closes
2. A winning outcome is determined
3. Your position matches (WON) or doesn't match (LOST) the outcome

## Viewing Bot Details

### Dashboard View

The dashboard shows a summary of your top bots with:
- Current balance
- Total profit
- Pending trade count
- Quick stats

### Detailed Bot View

Click on a bot card or go to `/bots?id=<bot-id>` to see:
- Full trade history
- Balance history over time
- Detailed statistics

### Trade Log

Go to `/trades` to see all trades across all bots with filtering options:
- Filter by bot
- Filter by status (Pending, Won, Lost, Cancelled)

## Deleting a Bot

Currently, bots can be deleted via API:

```bash
curl -X DELETE http://localhost:3000/api/bots/<bot-id>
```

Note: Deleting a bot also deletes all associated trades and balance history.

## Troubleshooting

### Bot not showing balance

1. Verify the wallet address is correct
2. Check if PolygonScan API key is set (optional but recommended)
3. The wallet may have no USDC balance

### Trades not appearing for bot

1. Verify the webhook is sending the correct wallet address
2. Check webhook response for errors
3. Wallet addresses are case-insensitive but must be valid hex

### Duplicate bot warning

Each wallet address can only have one bot. If you try to add a duplicate:
- Via UI: You'll see an error message
- Via webhook: The existing bot will be used

### Statistics seem wrong

1. Statistics only include resolved trades
2. Pending trades don't affect profit calculations
3. Make sure `costUsdc` and `potentialWin` are sent in webhooks

## Best Practices

1. **Use descriptive names**: Makes it easier to identify bots on the dashboard
2. **Send complete webhook data**: Include all optional fields for better tracking
3. **Monitor regularly**: Check for stuck pending trades
4. **Set up PolygonScan API key**: For reliable balance tracking
5. **Use separate wallets**: One wallet per bot for clean tracking
