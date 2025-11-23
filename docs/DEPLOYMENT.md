# 🚀 Deployment Guide

This guide covers various deployment options for the Invoice Management System.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Production Environment Setup](#production-environment-setup)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Traditional Server Deployment](#traditional-server-deployment)
  - [Cloud Platforms](#cloud-platforms)
- [Database Migration](#database-migration)
- [Environment Variables](#environment-variables)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring](#monitoring)
- [Backup Strategy](#backup-strategy)

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Docker & Docker Compose (for containerized deployment)
- SSL certificate (for production)
- Domain name (recommended)

## Production Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx (for reverse proxy)
sudo apt install nginx -y

# Install certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Database Setup

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE invoice_db;
CREATE USER invoice_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE invoice_db TO invoice_user;
\q
```

### 3. Application Setup

```bash
# Clone repository
git clone <repository-url>
cd invoice-management

# Install dependencies
npm run install:all

# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

## Deployment Options

### Docker Deployment

**Recommended for production**

#### 1. Update docker-compose.yml for production

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ims_postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ims_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ims_backend
    restart: always
    depends_on:
      - postgres
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
    ports:
      - "5000:5000"
    networks:
      - ims_network
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ims_frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "80:3000"
      - "443:443"
    networks:
      - ims_network
    volumes:
      - ./ssl:/etc/nginx/ssl

volumes:
  postgres_data:

networks:
  ims_network:
    driver: bridge
```

#### 2. Deploy with Docker Compose

```bash
# Set environment variables
cp .env.example .env
# Edit .env with production values

# Build and start services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database (first time only)
docker-compose exec backend npx prisma db seed
```

### Traditional Server Deployment

#### 1. Backend Deployment

```bash
cd backend

# Install PM2 for process management
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ims-backend',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### 2. Frontend Deployment with Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/ims

# Add configuration
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/invoice-management/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ims /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Cloud Platforms

#### AWS Deployment

**Using AWS Elastic Beanstalk:**

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init -p node.js-18 invoice-management

# Create environment
eb create production

# Deploy
eb deploy
```

**Using AWS ECS:**

1. Push Docker images to ECR
2. Create ECS task definitions
3. Create ECS service
4. Configure Application Load Balancer

#### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create apps
heroku create ims-backend
heroku create ims-frontend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a ims-backend

# Set environment variables
heroku config:set NODE_ENV=production -a ims-backend
heroku config:set JWT_SECRET=your-secret -a ims-backend

# Deploy backend
cd backend
git push heroku main

# Deploy frontend
cd frontend
git push heroku main
```

#### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy

## Database Migration

### Production Migration Steps

```bash
# Backup current database
pg_dump -U invoice_user invoice_db > backup.sql

# Run migrations
cd backend
npx prisma migrate deploy

# Verify migration
npx prisma studio
```

### Rollback Strategy

```bash
# Restore from backup if needed
psql -U invoice_user -d invoice_db < backup.sql
```

## Environment Variables

### Production .env Template

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your-production-secret-minimum-32-characters
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-app-password

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
BCRYPT_ROUNDS=12

# Frontend
FRONTEND_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## SSL/HTTPS Setup

### Using Let's Encrypt

```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Manual SSL Certificate

```bash
# Update Nginx configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Rest of configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring

### Setup PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Setup PM2 web dashboard
pm2 install pm2-server-monit
```

### Setup Prometheus & Grafana

```bash
# Install Prometheus
docker run -d -p 9090:9090 prom/prometheus

# Install Grafana
docker run -d -p 3001:3000 grafana/grafana
```

### Application Monitoring

Add monitoring tools:
- **New Relic** - Application performance monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay

## Backup Strategy

### Automated Database Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-ims.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/ims"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="ims_backup_$DATE.sql"

pg_dump -U invoice_user invoice_db > "$BACKUP_DIR/$FILENAME"
gzip "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-ims.sh

# Add to crontab
crontab -e
# Add line: 0 2 * * * /usr/local/bin/backup-ims.sh
```

### File Backup

```bash
# Backup uploads directory
tar -czf uploads_backup.tar.gz backend/uploads/

# Upload to cloud storage (e.g., AWS S3)
aws s3 cp uploads_backup.tar.gz s3://your-bucket/backups/
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (minimum 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Setup rate limiting
- [ ] Enable database encryption
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Implement backup strategy
- [ ] Setup error monitoring

## Performance Optimization

### Nginx Caching

```nginx
# Add to Nginx configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location /api {
    proxy_cache my_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
}
```

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_customers_user_id ON customers(user_id);
```

## Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U invoice_user -d invoice_db -h localhost
```

**Application Won't Start:**
```bash
# Check PM2 logs
pm2 logs

# Check ports
sudo netstat -tlnp | grep :5000
```

**Nginx 502 Error:**
```bash
# Check backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Scaling

### Horizontal Scaling

1. Use load balancer (Nginx, HAProxy)
2. Deploy multiple backend instances
3. Use Redis for session management
4. Implement database read replicas

### Vertical Scaling

1. Upgrade server resources
2. Optimize database queries
3. Implement caching layer
4. Use CDN for static assets

---

For additional support, consult the [README.md](../README.md) or open an issue on GitHub.
