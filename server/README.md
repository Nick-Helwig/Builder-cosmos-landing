# Booknow.Hair Server

Backend server for the Booknow.Hair website with Instagram caching functionality.

## Features

- **Server-side Instagram caching** - Reduces API costs by caching images locally
- **Automatic updates** - Refreshes cache every 6 hours automatically
- **Fallback system** - Uses cached images when API fails
- **Image optimization** - Optimizes Instagram images for web performance
- **REST API** - Provides endpoints for frontend integration

## Setup

1. **Install dependencies:**

   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your RapidAPI key
   ```

3. **Start the server:**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

- `GET /api/instagram/posts` - Get cached Instagram posts
- `POST /api/instagram/refresh` - Force refresh cache
- `GET /api/health` - Health check
- `GET /api/instagram/images/:filename` - Serve cached images

## Deployment on Ubuntu

1. **Install Node.js:**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2 for process management:**

   ```bash
   sudo npm install -g pm2
   ```

3. **Deploy the application:**

   ```bash
   cd /path/to/your/project/server
   npm install --production
   pm2 start server.js --name "booknow-hair-server"
   pm2 save
   pm2 startup
   ```

4. **Setup reverse proxy with Nginx:**

   ```bash
   sudo apt install nginx

   # Create nginx config
   sudo nano /etc/nginx/sites-available/booknow-hair
   ```

   Nginx config:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location /api/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           # Your frontend serving configuration
       }
   }
   ```

5. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/booknow-hair /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Manual Cache Management

Force update cache manually:

```bash
npm run cache:update
```

Or via API:

```bash
curl -X POST http://localhost:3001/api/instagram/refresh
```

## Cache Structure

```
server/
├── cache/
│   ├── images/           # Optimized Instagram images
│   │   ├── instagram_1.jpg
│   │   ├── instagram_2.jpg
│   │   └── ...
│   └── metadata.json     # Post metadata and timestamps
├── fallback-images/      # Backup images when API fails
└── services/             # Cache management logic
```

## Configuration

The server automatically:

- Updates cache every 6 hours
- Optimizes images to 400x400px
- Compresses images to 85% quality
- Falls back to placeholder images if API fails
- Serves images via CDN-style endpoint
