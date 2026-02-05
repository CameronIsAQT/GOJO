# Quick Start Guide

Get your Polymarket Bot Tracker running in 5 minutes.

## Step 1: Start the Tracker

```bash
cd /Users/manman/Desktop/GOJO

# Install dependencies (first time only)
npm install

# Set up database (first time only)
npm run db:push

# Start the server
npm run dev
```

Open `http://localhost:3000` in your browser.

## Step 2: Add Your Bot

### Option A: Via Web UI

1. Go to `http://localhost:3000/bots`
2. Click "Add Bot"
3. Enter your bot's name and wallet address
4. Click "Add Bot"

### Option B: Via Webhook (Automatic)

Just send a trade webhook - the bot will be created automatically.

## Step 3: Send Trades from Your Bot

Add this to your trading bot code:

### Python

```python
import requests

def log_trade(wallet, market_id, market_question, outcome, cost, shares, potential_win, tx_hash=None):
    requests.post(
        "http://localhost:3000/api/webhook/trade",
        json={
            "walletAddress": wallet,
            "marketId": market_id,
            "marketQuestion": market_question,
            "outcome": outcome,  # "YES" or "NO"
            "costUsdc": cost,
            "shares": shares,
            "potentialWin": potential_win,
            "txHash": tx_hash
        }
    )

# Call after each trade
log_trade(
    wallet="0x1234567890abcdef1234567890abcdef12345678",
    market_id="0xabc123...",
    market_question="Will BTC hit 100k?",
    outcome="YES",
    cost=50.0,
    shares=100,
    potential_win=100.0,
    tx_hash="0xtx123..."
)
```

### JavaScript

```javascript
async function logTrade(wallet, marketId, question, outcome, cost, shares, potentialWin, txHash) {
  await fetch("http://localhost:3000/api/webhook/trade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      walletAddress: wallet,
      marketId: marketId,
      marketQuestion: question,
      outcome: outcome,
      costUsdc: cost,
      shares: shares,
      potentialWin: potentialWin,
      txHash: txHash
    })
  });
}

// Call after each trade
await logTrade(
  "0x1234567890abcdef1234567890abcdef12345678",
  "0xabc123...",
  "Will BTC hit 100k?",
  "YES",
  50.0,
  100,
  100.0,
  "0xtx123..."
);
```

### cURL (Testing)

```bash
curl -X POST http://localhost:3000/api/webhook/trade \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "marketId": "test-market",
    "marketQuestion": "Test trade?",
    "outcome": "YES",
    "costUsdc": 10,
    "shares": 20,
    "potentialWin": 20
  }'
```

## Step 4: View Your Trades

- **Dashboard**: `http://localhost:3000` - Overview of everything
- **Trade Log**: `http://localhost:3000/trades` - All trades with filters
- **Bot Management**: `http://localhost:3000/bots` - Manage your bots

## What Happens Next

1. **Trades appear** on the dashboard immediately
2. **Balances update** automatically from PolygonScan
3. **Trade outcomes** are detected when markets resolve
4. **Stats update** as trades win or lose

## Optional: Set Up PolygonScan API

For better balance tracking:

1. Get a free API key at https://polygonscan.com/apis
2. Add to `.env`:
   ```
   POLYGONSCAN_API_KEY=your-key-here
   ```
3. Restart the server

## Optional: Secure Your Webhook

1. Generate a secret:
   ```bash
   openssl rand -hex 32
   ```

2. Add to `.env`:
   ```
   WEBHOOK_SECRET=your-generated-secret
   ```

3. Add header to your bot's requests:
   ```
   Authorization: Bearer your-generated-secret
   ```

## Need Help?

- [Full Webhook Guide](./WEBHOOKS.md)
- [Bot Setup Guide](./BOT_SETUP.md)
- [API Reference](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
