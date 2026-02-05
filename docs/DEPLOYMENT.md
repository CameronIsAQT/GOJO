# Deployment Guide

This guide covers deploying the Polymarket Bot Tracker to production.

## Deployment Options

1. [Docker](#docker-deployment) (Recommended)
2. [Manual Node.js](#manual-nodejs-deployment)
3. [Cloud Platforms](#cloud-platforms)

---

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

The app will be available at `http://localhost:3000`

### Configuration

Edit `docker-compose.yml` to configure:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"  # Change host port if needed
    environment:
      - DATABASE_URL=file:/app/data/dev.db
      - POLYGONSCAN_API_KEY=${POLYGONSCAN_API_KEY:-}
      - WEBHOOK_SECRET=${WEBHOOK_SECRET:-}
    volumes:
      - app-data:/app/data  # Persistent database storage
    restart: unless-stopped

volumes:
  app-data:
```

### Environment Variables

Create a `.env` file in the project root:

```bash
POLYGONSCAN_API_KEY=your-api-key
WEBHOOK_SECRET=your-webhook-secret
```

Or pass them directly:

```bash
POLYGONSCAN_API_KEY=xxx WEBHOOK_SECRET=yyy docker-compose up -d
```

### Building for Production

```bash
# Build the image
docker build -t polymarket-tracker .

# Run with custom settings
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=file:/app/data/dev.db \
  -e POLYGONSCAN_API_KEY=your-key \
  -e WEBHOOK_SECRET=your-secret \
  -v polymarket-data:/app/data \
  --name polymarket-tracker \
  polymarket-tracker
```

### Database Persistence

The SQLite database is stored in a Docker volume (`app-data`). To backup:

```bash
# Create backup
docker run --rm -v polymarket-tracker_app-data:/data -v $(pwd):/backup alpine \
  cp /data/dev.db /backup/backup.db

# Restore backup
docker run --rm -v polymarket-tracker_app-data:/data -v $(pwd):/backup alpine \
  cp /backup/backup.db /data/dev.db
```

---

## Manual Node.js Deployment

### Prerequisites

- Node.js 18+
- npm 9+

### Build

```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build the application
npm run build
```

### Database Setup

```bash
# Create/update database schema
npx prisma db push

# (Optional) Seed with sample data
npm run db:seed
```

### Run

```bash
# Start production server
npm start
```

### Process Manager (PM2)

For production, use PM2:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "polymarket-tracker" -- start

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

### Nginx Reverse Proxy

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name tracker.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # SSE support
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
```

---

## Cloud Platforms

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

**Note**: SQLite is not ideal for Vercel's serverless architecture. Consider using a hosted database like PlanetScale, Supabase, or Neon.

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy

Railway supports SQLite with persistent storage.

### Render

1. Create a new Web Service
2. Connect repository
3. Configure:
   - Build Command: `npm ci && npx prisma generate && npm run build`
   - Start Command: `npm start`
4. Add environment variables
5. Deploy

### DigitalOcean App Platform

1. Create new App
2. Connect GitHub repository
3. Configure environment variables
4. Deploy

---

## SSL/HTTPS

For production, always use HTTPS.

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d tracker.yourdomain.com

# Auto-renewal is set up automatically
```

### Cloudflare

1. Add your domain to Cloudflare
2. Enable "Full (strict)" SSL mode
3. Use Cloudflare's proxy for automatic HTTPS

---

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | Yes | `file:./dev.db` |
| `POLYGONSCAN_API_KEY` | PolygonScan API key | No | - |
| `WEBHOOK_SECRET` | Secret for webhook auth | No | - |
| `PORT` | Server port | No | `3000` |
| `HOSTNAME` | Server hostname | No | `0.0.0.0` |

---

## Health Checks

The app responds to health checks at any endpoint. For Docker/Kubernetes:

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/bots"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## Monitoring

### Logs

```bash
# Docker logs
docker-compose logs -f app

# PM2 logs
pm2 logs polymarket-tracker
```

### Metrics

Consider adding monitoring with:
- Prometheus + Grafana
- DataDog
- New Relic

---

## Backup Strategy

### Database Backup

```bash
# Backup SQLite database
cp prisma/dev.db backups/dev-$(date +%Y%m%d).db

# Automated daily backup (cron)
0 0 * * * cp /path/to/prisma/dev.db /path/to/backups/dev-$(date +\%Y\%m\%d).db
```

### Volume Backup (Docker)

```bash
# Create backup
docker run --rm \
  -v polymarket-tracker_app-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/data-$(date +%Y%m%d).tar.gz -C /data .
```

---

## Scaling Considerations

### Current Limitations

- SQLite is single-writer (not ideal for high concurrency)
- SSE connections are in-memory (not shared across instances)

### For High Traffic

1. **Database**: Migrate to PostgreSQL
   - Update `prisma/schema.prisma`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Update `DATABASE_URL` to PostgreSQL connection string

2. **SSE**: Use Redis for pub/sub across instances

3. **Load Balancer**: Use sticky sessions for SSE connections

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Common issues:
# - Database URL misconfigured
# - Port already in use
# - Missing environment variables
```

### Database errors

```bash
# Reset database
rm prisma/dev.db
npx prisma db push
```

### SSE not working

- Check that your reverse proxy doesn't buffer responses
- Ensure proper timeout settings
- Verify no CDN is caching the `/api/events` endpoint

### High memory usage

- Set Node.js memory limit: `NODE_OPTIONS=--max-old-space-size=512`
- Check for memory leaks in SSE connections
