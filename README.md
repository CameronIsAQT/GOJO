# Polymarket Trading Bot Tracker

A Next.js web application to track and monitor your Polymarket trading bots with real-time balance updates, trade logging via webhooks, and automated win/loss monitoring.

## Features

- **Dashboard**: Overview of all bots, balances, and recent trades
- **Trade Logging**: Automatic trade recording via webhooks
- **Real-time Updates**: Live updates using Server-Sent Events (SSE)
- **Balance Tracking**: Automatic balance fetching from PolygonScan
- **Trade Monitoring**: Automatic detection of trade outcomes (win/loss)
- **Bot Management**: Add and manage multiple trading bots

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to the project
cd /Users/manman/Desktop/GOJO

# Install dependencies
npm install

# Set up the database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite database path | Yes (default: `file:./dev.db`) |
| `POLYGONSCAN_API_KEY` | PolygonScan API key for balance fetching | No (works without, but rate limited) |
| `WEBHOOK_SECRET` | Secret for authenticating webhook requests | No |

## Documentation

- [Webhook Integration Guide](./docs/WEBHOOKS.md) - How to send trades from your bots
- [Bot Setup Guide](./docs/BOT_SETUP.md) - How to configure and manage bots
- [API Reference](./docs/API.md) - Complete API documentation
- [Deployment Guide](./docs/DEPLOYMENT.md) - Docker and production deployment

## Project Structure

```
├── src/
│   ├── app/                 # Next.js pages and API routes
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   └── types/               # TypeScript types
├── prisma/                  # Database schema
├── tests/                   # Unit and E2E tests
└── docs/                    # Documentation
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:studio` | Open Prisma Studio (database viewer) |
| `npm run db:seed` | Seed database with sample data |

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Real-time**: Server-Sent Events (SSE)
- **Testing**: Jest, React Testing Library, Playwright

## License

MIT
