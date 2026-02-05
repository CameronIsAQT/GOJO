# API Reference

Complete reference for all API endpoints in the Polymarket Bot Tracker.

## Base URL

- Development: `http://localhost:3000`
- Production: Your deployed URL

## Authentication

Most endpoints are public. The webhook endpoint optionally supports authentication via the `WEBHOOK_SECRET` environment variable.

```
Authorization: Bearer <webhook-secret>
```

---

## Bots

### List All Bots

```
GET /api/bots
```

Returns all bots with their statistics.

**Response:**
```json
{
  "bots": [
    {
      "id": "clxyz123...",
      "name": "My Bot",
      "walletAddress": "0x1234...",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "totalTrades": 10,
      "pendingTrades": 2,
      "wonTrades": 5,
      "lostTrades": 3,
      "totalProfit": 150.50,
      "currentBalance": 1000.00
    }
  ]
}
```

### Create Bot

```
POST /api/bots
```

**Request Body:**
```json
{
  "name": "My New Bot",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Response (201 Created):**
```json
{
  "bot": {
    "id": "clxyz123...",
    "name": "My New Bot",
    "walletAddress": "0x1234...",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**Errors:**
- `400`: Missing name or walletAddress, or invalid wallet format
- `409`: Bot with this wallet address already exists

### Get Bot by ID

```
GET /api/bots/:id
```

**Response:**
```json
{
  "bot": {
    "id": "clxyz123...",
    "name": "My Bot",
    "walletAddress": "0x1234...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "trades": [...],
    "balanceSnapshots": [...]
  }
}
```

### Update Bot

```
PUT /api/bots/:id
```

**Request Body:**
```json
{
  "name": "Updated Bot Name"
}
```

**Response:**
```json
{
  "bot": {
    "id": "clxyz123...",
    "name": "Updated Bot Name",
    "walletAddress": "0x1234...",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Delete Bot

```
DELETE /api/bots/:id
```

**Response:**
```json
{
  "success": true
}
```

---

## Trades

### List Trades

```
GET /api/trades
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `botId` | string | Filter by bot ID |
| `status` | string | Filter by status: `PENDING`, `WON`, `LOST`, `CANCELLED` |
| `limit` | number | Number of results (default: 50) |
| `offset` | number | Pagination offset (default: 0) |

**Example:**
```
GET /api/trades?botId=cl123&status=PENDING&limit=10&offset=0
```

**Response:**
```json
{
  "trades": [
    {
      "id": "cltrade123...",
      "botId": "clbot456...",
      "bot": {
        "id": "clbot456...",
        "name": "My Bot",
        "walletAddress": "0x1234..."
      },
      "marketId": "0xmarket...",
      "marketQuestion": "Will X happen?",
      "outcome": "YES",
      "costUsdc": 50.00,
      "shares": 100,
      "potentialWin": 100.00,
      "status": "PENDING",
      "txHash": "0xtx...",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "resolvedAt": null
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Webhook

### Record Trade

```
POST /api/webhook/trade
```

Records a new trade from your bot.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <webhook-secret>  # Optional
```

**Request Body:**
```json
{
  "botName": "my-bot",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "marketId": "0xmarket123...",
  "marketQuestion": "Will Bitcoin reach $100k?",
  "outcome": "YES",
  "costUsdc": 50.00,
  "shares": 100,
  "potentialWin": 100.00,
  "txHash": "0xtx123..."
}
```

**Required Fields:**
- `walletAddress`: Valid Polygon address
- `marketId`: Polymarket market/condition ID
- `outcome`: `"YES"` or `"NO"`

**Response (201 Created):**
```json
{
  "success": true,
  "trade": {
    "id": "cltrade123...",
    "botId": "clbot456...",
    "marketId": "0xmarket123...",
    "marketQuestion": "Will Bitcoin reach $100k?",
    "outcome": "YES",
    "costUsdc": 50.00,
    "shares": 100,
    "potentialWin": 100.00,
    "status": "PENDING",
    "txHash": "0xtx123...",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "resolvedAt": null,
    "bot": {
      "id": "clbot456...",
      "name": "my-bot",
      "walletAddress": "0x1234..."
    }
  }
}
```

**Errors:**
- `400`: Missing required fields
- `401`: Invalid or missing webhook secret (when `WEBHOOK_SECRET` is configured)

---

## Balance

### Get Wallet Balance

```
GET /api/balance/:address
```

Fetches current USDC and MATIC balance from PolygonScan.

**Parameters:**
- `address`: Polygon wallet address

**Response:**
```json
{
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "balanceUsdc": 1000.50,
  "balanceMatic": 5.25,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Errors:**
- `400`: Invalid wallet address format

---

## Server-Sent Events (SSE)

### Subscribe to Events

```
GET /api/events
```

Opens a Server-Sent Events connection for real-time updates.

**Event Types:**

1. **Connected**
```json
{
  "type": "connected",
  "data": {
    "timestamp": "2025-01-15T10:00:00.000Z"
  }
}
```

2. **Trade Created**
```json
{
  "type": "trade_created",
  "data": {
    "id": "cltrade123...",
    "botId": "clbot456...",
    "marketId": "0xmarket...",
    "outcome": "YES",
    "status": "PENDING",
    ...
  }
}
```

3. **Trade Updated**
```json
{
  "type": "trade_updated",
  "data": {
    "id": "cltrade123...",
    "status": "WON",
    "resolvedAt": "2025-01-15T12:00:00.000Z",
    ...
  }
}
```

4. **Balance Updated**
```json
{
  "type": "balance_updated",
  "data": {
    "botId": "clbot456...",
    "balanceUsdc": 1050.00,
    "balanceMatic": 5.25
  }
}
```

**JavaScript Example:**
```javascript
const eventSource = new EventSource('/api/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'trade_created':
      console.log('New trade:', data.data);
      break;
    case 'trade_updated':
      console.log('Trade updated:', data.data);
      break;
    case 'balance_updated':
      console.log('Balance updated:', data.data);
      break;
  }
};

eventSource.onerror = () => {
  console.log('Connection lost, reconnecting...');
};
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Invalid authentication |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `500` | Internal Server Error |

---

## Rate Limiting

Currently, there are no rate limits on the API. However:

- Balance fetching is limited by PolygonScan's API rate limits
- SSE connections have a 30-second heartbeat
- Consider implementing your own rate limiting for production

---

## Data Types

### Trade Status

```typescript
type TradeStatus = 'PENDING' | 'WON' | 'LOST' | 'CANCELLED';
```

### Wallet Address

- Format: `0x` followed by 40 hexadecimal characters
- Example: `0x1234567890abcdef1234567890abcdef12345678`
- Case-insensitive

### Timestamps

- Format: ISO 8601
- Example: `2025-01-15T10:30:00.000Z`
