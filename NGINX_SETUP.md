# Nginx Configuration for booknow.hair

This document describes the Nginx configuration setup for the booknow.hair barbering website, which serves a React frontend and proxies requests to a Node.js backend.

## Overview

The Nginx setup provides:
- **Static file serving** for React build files
- **Reverse proxy** for Node.js API endpoints
- **SSL/TLS termination** with Let's Encrypt certificates
- **Security headers** and optimizations
- **CORS support** for API requests
- **Compression** and caching policies

## Files Structure

```
nginx/
├── booknow.hair          # Full HTTPS configuration
├── booknow.hair-http     # HTTP-only (initial setup)
deploy-nginx.sh           # Nginx deployment script
setup-ssl.sh             # SSL certificate setup script
```

## Configuration Details

### Domain Configuration
- **Primary domain**: `booknow.hair`
- **Alternate domain**: `www.booknow.hair`
- **Document root**: `/var/www/booknow.hair/html`
- **Backend proxy**: `localhost:3001`

### Key Features

#### 1. Static File Serving
- Serves React build files from `/var/www/booknow.hair/html`
- Handles SPA routing with fallback to `index.html`
- Optimized caching headers for different file types:
  - Static assets (JS, CSS, images): 1 year cache
  - HTML files: 1 hour cache

#### 2. API Reverse Proxy
- All `/api/*` requests proxied to Node.js backend on port 3001
- Proper headers forwarded (X-Real-IP, X-Forwarded-For, etc.)
- CORS headers configured for cross-origin requests
- Extended timeouts for backend processing

#### 3. SSL/TLS Security
- TLS 1.2 and 1.3 support
- Strong cipher suites
- HSTS (HTTP Strict Transport Security)
- SSL stapling enabled

#### 4. Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content Security Policy configured
- Referrer Policy set

#### 5. Performance Optimizations
- Gzip compression for text-based files
- Browser caching policies
- Asset compression and optimization

## Deployment Process

### Automatic Deployment (GitHub Actions)

The GitHub Actions workflow automatically:
1. Builds the React frontend
2. Deploys frontend and backend files
3. Copies Nginx configuration files to the server
4. Runs the Nginx deployment script

### Manual Deployment Steps

1. **Initial HTTP Setup**:
   ```bash
   # Copy files to server
   scp nginx/booknow.hair-http root@104.223.123.201:/tmp/booknow.hair-nginx.conf
   scp deploy-nginx.sh root@104.223.123.201:/tmp/deploy-nginx.sh
   
   # Deploy Nginx configuration
   ssh root@104.223.123.201 "chmod +x /tmp/deploy-nginx.sh && /tmp/deploy-nginx.sh"
   ```

2. **SSL Setup** (after HTTP is working):
   ```bash
   # Copy SSL configuration and setup script
   scp nginx/booknow.hair root@104.223.123.201:/tmp/booknow.hair-https-nginx.conf
   scp setup-ssl.sh root@104.223.123.201:/tmp/setup-ssl.sh
   
   # Setup SSL certificates and HTTPS
   ssh root@104.223.123.201 "chmod +x /tmp/setup-ssl.sh && /tmp/setup-ssl.sh"
   ```

## Directory Structure on Server

```
/var/www/booknow.hair/
├── html/                 # React frontend files
│   ├── index.html
│   ├── assets/
│   └── ...
└── server/              # Node.js backend
    ├── server.js
    ├── package.json
    └── ...

/etc/nginx/
├── sites-available/
│   └── booknow.hair     # Nginx configuration
└── sites-enabled/
    └── booknow.hair -> ../sites-available/booknow.hair

/var/log/nginx/
├── booknow.hair.access.log
└── booknow.hair.error.log
```

## Testing the Configuration

### 1. Verify Nginx Configuration
```bash
sudo nginx -t
```

### 2. Check Service Status
```bash
sudo systemctl status nginx
```

### 3. Test HTTP Response
```bash
curl -I http://booknow.hair
```

### 4. Test HTTPS Response (after SSL setup)
```bash
curl -I https://booknow.hair
```

### 5. Test API Proxy
```bash
curl -I http://booknow.hair/api/health
```

## SSL Certificate Management

### Initial Certificate Generation
The `setup-ssl.sh` script handles:
- Installing Certbot
- Generating Let's Encrypt certificates for both domains
- Configuring automatic renewal

### Certificate Renewal
Certificates auto-renew via systemd timer:
```bash
# Check renewal status
sudo systemctl status certbot.timer

# Test renewal
sudo certbot renew --dry-run

# Manual renewal if needed
sudo certbot renew
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**: Backend not running
   ```bash
   pm2 status
   pm2 restart booknow-hair-server
   ```

2. **Certificate Errors**: Check certificate status
   ```bash
   sudo certbot certificates
   ```

3. **Permission Errors**: Fix file permissions
   ```bash
   sudo chown -R www-data:www-data /var/www/booknow.hair/html
   sudo chmod -R 755 /var/www/booknow.hair/html
   ```

### Log Files
- **Access logs**: `/var/log/nginx/booknow.hair.access.log`
- **Error logs**: `/var/log/nginx/booknow.hair.error.log`
- **Backend logs**: `pm2 logs booknow-hair-server`

### Configuration Validation
```bash
# Test configuration syntax
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# View active configuration
sudo nginx -T
```

## Security Considerations

1. **Firewall**: Ensure ports 80 and 443 are open
2. **SSL Configuration**: Uses modern TLS versions and ciphers
3. **Security Headers**: Comprehensive set of security headers applied
4. **Access Control**: Hidden files and directories blocked
5. **CORS**: Configured for legitimate cross-origin requests

## Monitoring

### Key Metrics to Monitor
- Response times for static files and API endpoints
- SSL certificate expiration dates
- Error rates in Nginx logs
- Backend service availability
- Disk space for log files

### Health Checks
- **Nginx**: `curl http://booknow.hair/health`
- **Backend**: `curl http://booknow.hair/api/health`
- **SSL**: Check certificate validity

## Maintenance Tasks

### Regular Maintenance
1. **Weekly**: Review error logs
2. **Monthly**: Check SSL certificate status
3. **Quarterly**: Update Nginx and security configurations
4. **As needed**: Rotate log files if they grow large

### Updates
When updating the configuration:
1. Test changes in development
2. Backup current configuration
3. Apply changes during low-traffic periods
4. Monitor logs after changes

## Support

For issues related to:
- **Frontend**: Check React build process and static file serving
- **Backend**: Verify Node.js application and PM2 process management  
- **SSL**: Check Let's Encrypt certificate status and renewal
- **Performance**: Review caching headers and compression settings

---

This configuration provides a production-ready, secure, and performant setup for the booknow.hair barbering website.