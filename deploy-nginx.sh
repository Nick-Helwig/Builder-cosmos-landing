#!/bin/bash

# Nginx Deployment Script for booknow.hair
# This script configures Nginx on the VPS

set -e

echo "🔧 Configuring Nginx for booknow.hair..."

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Stop Nginx for configuration
echo "⏸️  Stopping Nginx..."
sudo systemctl stop nginx

# Backup existing configuration if it exists
if [ -f /etc/nginx/sites-available/booknow.hair ]; then
    echo "📋 Backing up existing configuration..."
    sudo cp /etc/nginx/sites-available/booknow.hair /etc/nginx/sites-available/booknow.hair.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy Nginx configuration
echo "📝 Installing Nginx configuration..."
sudo cp /tmp/booknow.hair-nginx.conf /etc/nginx/sites-available/booknow.hair

# Create symlink to enable site
echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/booknow.hair /etc/nginx/sites-enabled/

# Remove default Nginx site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "🗑️  Removing default site..."
    sudo rm -f /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Create log directory if it doesn't exist
sudo mkdir -p /var/log/nginx

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/booknow.hair/html
sudo chmod -R 755 /var/www/booknow.hair/html

# Set proper permissions for Instagram cache directory
sudo chown -R www-data:www-data /var/www/booknow.hair/server/cache/images
sudo chmod -R 755 /var/www/booknow.hair/server/cache/images

# Start and enable Nginx
echo "🚀 Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Check if SSL certificates exist, if not, provide instructions
if [ ! -f /etc/letsencrypt/live/booknow.hair/fullchain.pem ]; then
    echo ""
    echo "⚠️  SSL certificates not found. To enable HTTPS:"
    echo "1. Install certbot: sudo apt install certbot python3-certbot-nginx"
    echo "2. Get certificate: sudo certbot --nginx -d booknow.hair -d www.booknow.hair"
    echo "3. Replace the HTTP-only config with the full HTTPS config"
    echo ""
fi

echo "✅ Nginx configuration completed!"
echo "🌐 Site should be accessible at: http://booknow.hair"

# Display status
echo ""
echo "📊 Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "🔍 Active Nginx Sites:"
sudo nginx -T 2>/dev/null | grep -E "server_name|listen" | head -10