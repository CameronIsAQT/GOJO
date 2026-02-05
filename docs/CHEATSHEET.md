# Polymarket Tracker Cheatsheet

Quick reference for common operations.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run db:studio    # Open database viewer
npm run db:seed      # Add sample data
npm run db:push      # Update database schema
```

## Webhook Endpoint

```
POST http://localhost:3000/api/webhook/trade
Content-Type: application/json
Authorization: Bearer <secret>  # if WEBHOOK_SECRET is set
```

### Minimum Required Fields

```json
{
  "walletAddress": "0x...",
  "marketId": "...",
  "outcome": "YES"
}
```

### All Fields

```json
{
  "botName": "my-bot",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "marketId": "0xmarket123",
  "marketQuestion": "Will X happen?",
  "outcome": "YES",
  "costUsdc": 50.00,
  "shares": 100,
  "potentialWin": 100.00,
  "txHash": "0xtx123"
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bots` | List all bots |
| POST | `/api/bots` | Create bot |
| GET | `/api/bots/:id` | Get bot details |
| PUT | `/api/bots/:id` | Update bot |
| DELETE | `/api/bots/:id` | Delete bot |
| GET | `/api/trades` | List trades |
| POST | `/api/webhook/trade` | Record trade |
| GET | `/api/balance/:address` | Get wallet balance |
| GET | `/api/events` | SSE stream |

## Query Parameters for /api/trades

```
?botId=xxx       # Filter by bot
?status=PENDING  # Filter by status (PENDING, WON, LOST, CANCELLED)
?limit=50        # Results per page
?offset=0        # Pagination offset
```

## Environment Variables

```bash
DATABASE_URL=file:./dev.db      # SQLite database path
POLYGONSCAN_API_KEY=xxx         # PolygonScan API key (optional)
WEBHOOK_SECRET=xxx              # Webhook auth secret (optional)
```

## Trade Statuses

| Status | Description |
|--------|-------------|
| `PENDING` | Waiting for market resolution |
| `WON` | Trade won |
| `LOST` | Trade lost |
| `CANCELLED` | Trade cancelled |

## Wallet Address Format

- Must start with `0x`
- Followed by 40 hexadecimal characters
- Example: `0x1234567890abcdef1234567890abcdef12345678`

## Python Webhook Function

```python
import requests

def log_trade(wallet, market_id, outcome, cost=0, shares=0, potential=0, tx=None):
    requests.post("http://localhost:3000/api/webhook/trade", json={
        "walletAddress": wallet,
        "marketId": market_id,
        "outcome": outcome,
        "costUsdc": cost,
        "shares": shares,
        "potentialWin": potential,
        "txHash": tx
    })
```

## JavaScript Webhook Function

```javascript
const logTrade = (wallet, marketId, outcome, cost=0, shares=0, potential=0, tx=null) =>
  fetch("http://localhost:3000/api/webhook/trade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      walletAddress: wallet,
      marketId: marketId,
      outcome: outcome,
      costUsdc: cost,
      shares: shares,
      potentialWin: potential,
      txHash: tx
    })
  });
```

## cURL Test Command

```bash
curl -X POST http://localhost:3000/api/webhook/trade \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x1234567890abcdef1234567890abcdef12345678","marketId":"test","outcome":"YES"}'
```

## Docker Commands

```bash
docker-compose up -d      # Start
docker-compose down       # Stop
docker-compose logs -f    # View logs
docker-compose restart    # Restart
```

## SSE Event Types

```javascript
// Connect to SSE
const events = new EventSource('/api/events');
events.onmessage = (e) => {
  const { type, data } = JSON.parse(e.data);
  // type: 'trade_created' | 'trade_updated' | 'balance_updated'
};
```

## File Locations

```
prisma/schema.prisma     # Database schema
prisma/dev.db            # SQLite database
.env                     # Environment variables
src/app/api/             # API routes
src/components/          # React components
tests/                   # Test files
docs/                    # Documentation
```
