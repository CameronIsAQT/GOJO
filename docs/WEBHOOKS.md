# Webhook Integration Guide

This guide explains how to send trade notifications from your Polymarket trading bots to the tracker.

## Overview

When your bot places a trade on Polymarket, it should send a POST request to the tracker's webhook endpoint. The tracker will:

1. Record the trade in the database
2. Create the bot if it doesn't exist
3. Send real-time updates to the dashboard
4. Monitor the market for resolution

## Webhook Endpoint

```
POST http://localhost:3000/api/webhook/trade
```

For production, replace `localhost:3000` with your deployed URL.

## Request Format

### Headers

```
Content-Type: application/json
Authorization: Bearer <your-webhook-secret>  # Optional, if WEBHOOK_SECRET is set
```

### Body (JSON)

```json
{
  "botName": "my-arbitrage-bot",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "marketId": "0x1234abcd...",
  "marketQuestion": "Will Bitcoin reach $100k by end of 2025?",
  "outcome": "YES",
  "costUsdc": 50.00,
  "shares": 100,
  "potentialWin": 100.00,
  "txHash": "0xabcd1234..."
}
```

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `botName` | string | No | Human-readable name for your bot. If omitted, uses wallet address prefix |
| `walletAddress` | string | **Yes** | Polygon wallet address (0x + 40 hex chars) |
| `marketId` | string | **Yes** | Polymarket market/condition ID |
| `marketQuestion` | string | No | Human-readable market question |
| `outcome` | string | **Yes** | Your position: `"YES"` or `"NO"` |
| `costUsdc` | number | No | Amount spent in USDC |
| `shares` | number | No | Number of outcome shares purchased |
| `potentialWin` | number | No | Payout if trade wins |
| `txHash` | string | No | Polygon transaction hash |

## Response Format

### Success (201 Created)

```json
{
  "success": true,
  "trade": {
    "id": "clxyz123...",
    "botId": "clbot456...",
    "marketId": "0x1234abcd...",
    "marketQuestion": "Will Bitcoin reach $100k by end of 2025?",
    "outcome": "YES",
    "costUsdc": 50.00,
    "shares": 100,
    "potentialWin": 100.00,
    "status": "PENDING",
    "txHash": "0xabcd1234...",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "bot": {
      "id": "clbot456...",
      "name": "my-arbitrage-bot",
      "walletAddress": "0x1234..."
    }
  }
}
```

### Error Responses

**400 Bad Request** - Missing required fields:
```json
{
  "error": "Missing required fields: walletAddress, marketId, outcome"
}
```

**401 Unauthorized** - Invalid webhook secret:
```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error** - Server error:
```json
{
  "error": "Internal server error"
}
```

## Code Examples

### Python

```python
import requests

TRACKER_URL = "http://localhost:3000"
WEBHOOK_SECRET = "your-secret"  # Optional

def send_trade_to_tracker(trade_data):
    """Send a trade notification to the tracker."""
    headers = {
        "Content-Type": "application/json",
    }

    # Add auth header if webhook secret is configured
    if WEBHOOK_SECRET:
        headers["Authorization"] = f"Bearer {WEBHOOK_SECRET}"

    response = requests.post(
        f"{TRACKER_URL}/api/webhook/trade",
        json=trade_data,
        headers=headers
    )

    if response.status_code == 201:
        print("Trade recorded successfully!")
        return response.json()
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None

# Example usage in your bot
def on_trade_executed(tx_receipt, market_info):
    """Call this after your bot executes a trade."""
    trade_data = {
        "botName": "my-python-bot",
        "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
        "marketId": market_info["condition_id"],
        "marketQuestion": market_info["question"],
        "outcome": "YES",  # or "NO"
        "costUsdc": 50.00,
        "shares": 100,
        "potentialWin": 100.00,
        "txHash": tx_receipt["transactionHash"].hex()
    }

    send_trade_to_tracker(trade_data)
```

### JavaScript/TypeScript

```typescript
const TRACKER_URL = "http://localhost:3000";
const WEBHOOK_SECRET = "your-secret"; // Optional

interface TradeData {
  botName?: string;
  walletAddress: string;
  marketId: string;
  marketQuestion?: string;
  outcome: "YES" | "NO";
  costUsdc?: number;
  shares?: number;
  potentialWin?: number;
  txHash?: string;
}

async function sendTradeToTracker(tradeData: TradeData) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (WEBHOOK_SECRET) {
    headers["Authorization"] = `Bearer ${WEBHOOK_SECRET}`;
  }

  const response = await fetch(`${TRACKER_URL}/api/webhook/trade`, {
    method: "POST",
    headers,
    body: JSON.stringify(tradeData),
  });

  if (response.ok) {
    console.log("Trade recorded successfully!");
    return await response.json();
  } else {
    console.error(`Error: ${response.status} - ${await response.text()}`);
    return null;
  }
}

// Example usage in your bot
async function onTradeExecuted(txReceipt: any, marketInfo: any) {
  await sendTradeToTracker({
    botName: "my-js-bot",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    marketId: marketInfo.conditionId,
    marketQuestion: marketInfo.question,
    outcome: "YES",
    costUsdc: 50.0,
    shares: 100,
    potentialWin: 100.0,
    txHash: txReceipt.transactionHash,
  });
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/webhook/trade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret" \
  -d '{
    "botName": "test-bot",
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "marketId": "0xabc123",
    "marketQuestion": "Will it rain tomorrow?",
    "outcome": "YES",
    "costUsdc": 10.00,
    "shares": 20,
    "potentialWin": 20.00,
    "txHash": "0xtx123456"
  }'
```

## Getting the Market ID

The `marketId` is the Polymarket condition ID. You can find it:

1. **From the Polymarket URL**:
   - URL: `https://polymarket.com/event/will-x-happen`
   - The slug `will-x-happen` can be used to query the API

2. **From Polymarket API**:
   ```bash
   curl https://clob.polymarket.com/markets
   ```

3. **From your trading library**: Most Polymarket trading libraries provide the condition ID when you fetch market data.

## Webhook Security

### Setting Up Authentication

1. Generate a secure secret:
   ```bash
   openssl rand -hex 32
   ```

2. Add to your `.env` file:
   ```
   WEBHOOK_SECRET=your-generated-secret
   ```

3. Include the secret in your bot's webhook requests:
   ```
   Authorization: Bearer your-generated-secret
   ```

### Best Practices

- Use HTTPS in production
- Keep your webhook secret secure
- Validate responses in your bot
- Implement retry logic for failed requests
- Log webhook responses for debugging

## Testing Your Integration

1. Start the tracker:
   ```bash
   npm run dev
   ```

2. Send a test webhook:
   ```bash
   curl -X POST http://localhost:3000/api/webhook/trade \
     -H "Content-Type: application/json" \
     -d '{
       "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
       "marketId": "test-market-1",
       "marketQuestion": "Test market question?",
       "outcome": "YES",
       "costUsdc": 10,
       "shares": 20,
       "potentialWin": 20
     }'
   ```

3. Check the dashboard at `http://localhost:3000` - you should see the trade appear.

## Troubleshooting

### Trade not appearing

1. Check the response from the webhook - look for error messages
2. Verify the wallet address format (must be `0x` + 40 hex characters)
3. Check that required fields are included

### 401 Unauthorized

1. Verify `WEBHOOK_SECRET` in your `.env` matches your bot's configuration
2. Check the `Authorization` header format: `Bearer <secret>`

### Connection refused

1. Make sure the tracker is running (`npm run dev`)
2. Check the URL matches your configuration
3. For Docker, ensure proper networking
