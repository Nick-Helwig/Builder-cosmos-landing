#!/bin/bash

# SSL Setup Script for booknow.hair using Let's Encrypt
# Run this after the initial HTTP-only Nginx configuration is working

set -e

echo "🔒 Setting up SSL for booknow.hair..."

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Stop Nginx temporarily for certificate generation
echo "⏸️  Stopping Nginx temporarily..."
sudo systemctl stop nginx

# Generate SSL certificates
echo "🔐 Generating SSL certificates..."
sudo certbot certonly --standalone -d booknow.hair -d www.booknow.hair --agree-tos --no-eff-email --email admin@booknow.hair

# Copy the full HTTPS configuration
echo "📝 Installing HTTPS Nginx configuration..."
sudo cp /tmp/booknow.hair-https-nginx.conf /etc/nginx/sites-available/booknow.hair

# Test configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Start Nginx
echo "🚀 Starting Nginx with HTTPS..."
sudo systemctl start nginx

# Set up automatic certificate renewal
echo "🔄 Setting up automatic certificate renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
echo "🧪 Testing certificate renewal..."
sudo certbot renew --dry-run

echo "✅ SSL setup completed!"
echo "🌐 Site should now be accessible at: https://booknow.hair"

# Display certificate info
echo ""
echo "📋 Certificate Information:"
sudo certbot certificates

echo ""
echo "🔍 Nginx Status:"
sudo systemctl status nginx --no-pager -l