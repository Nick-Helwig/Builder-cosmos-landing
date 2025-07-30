#!/bin/bash

echo "Deploying backend to VPS..."
ssh root@104.223.123.201 "cd /var/www/booknow.hair/server && git pull origin main && npm install --production && pm2 restart booknow-hair-server"

echo "Backend deployment complete."