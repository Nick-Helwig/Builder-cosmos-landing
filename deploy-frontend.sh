#!/bin/bash

echo "Building frontend..."
npm run build

echo "Deploying frontend to VPS..."
scp -r dist/* root@104.223.123.201:/var/www/booknow.hair/html/

echo "Frontend deployment complete."