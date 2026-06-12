# Deploying the Frontend Application

This guide provides comprehensive instructions for deploying the FTD Frontend application to various platforms and environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Build Process](#build-process)
3. [Deployment Platforms](#deployment-platforms)
4. [Environment Configuration](#environment-configuration)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Quality
- [ ] All tests passing: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] Type checking passed: `npm run type-check`
- [ ] Build successful: `npm run build`
- [ ] No console errors/warnings in dev mode

### Testing
- [ ] Unit tests pass with coverage > 80%
- [ ] E2E tests pass (if applicable)
- [ ] Storybook builds successfully
- [ ] Manual testing complete

### Documentation
- [ ] CHANGELOG updated
- [ ] README updated if needed
- [ ] Deployment notes documented
- [ ] API integration verified

### Security
- [ ] No hardcoded credentials
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Security headers in place

### Performance
- [ ] Build size < 500KB (gzipped)
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals optimized
- [ ] Images optimized

## Build Process

### Creating Production Build

```bash
# 1. Install dependencies (fresh install)
npm ci

# 2. Type check
npm run type-check

# 3. Run tests
npm run test

# 4. Lint code
npm run lint

# 5. Build
npm run build

# 6. Preview build locally
npm run preview

# 7. Check build size
du -sh dist/
```

### Build Output

```
dist/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── assets/
│   ├── index-*.js         # Main bundle
│   ├── vendor-*.js        # Vendor bundle (React, etc.)
│   ├── redux-*.js         # Redux bundle
│   ├── index-*.css        # Main styles
│   └── [other files]      # Assets
└── sw.js                  # Service Worker
```

### Build Optimization

For optimal builds:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,        // Disable for production
    minify: 'terser',        // Minify with Terser
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
})
```

## Deployment Platforms

### 1. Vercel (Recommended for SPA)

Vercel is optimized for React applications.

#### Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_BASE_URL": "@api_base_url",
    "VITE_ENVIRONMENT": "production"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Environment Variables

Set in Vercel dashboard:
- Project Settings → Environment Variables
- Add `VITE_API_BASE_URL`, `VITE_ENVIRONMENT`, etc.

#### Features
- ✅ Automatic HTTPS
- ✅ CDN included
- ✅ Preview deployments
- ✅ Analytics
- ✅ Performance monitoring

### 2. Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  VITE_API_BASE_URL = "https://api.example.com"
  VITE_ENVIRONMENT = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. AWS S3 + CloudFront

For enterprise deployments with custom infrastructure.

#### Setup Script

```bash
#!/bin/bash

# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket/frontend/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### CloudFront Configuration

```
Distribution Settings:
- Origin: S3 bucket
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Compress: Enabled
- Error Pages: 404 → /index.html
- TTL: 86400 (1 day)
```

### 4. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Build and Push

```bash
# Build image
docker build -t ftd-frontend:latest .

# Push to registry
docker push your-registry/ftd-frontend:latest

# Run locally
docker run -p 3000:80 ftd-frontend:latest
```

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
# Production API
VITE_API_BASE_URL=https://api.example.com/api
VITE_ENVIRONMENT=production
VITE_DEBUG=false
VITE_PWA_ENABLED=true

# Analytics (optional)
VITE_SEGMENT_KEY=your_segment_key
VITE_SENTRY_DSN=your_sentry_dsn
```

### Staging Environment Variables

Create `.env.staging`:

```env
VITE_API_BASE_URL=https://staging-api.example.com/api
VITE_ENVIRONMENT=staging
VITE_DEBUG=true
VITE_PWA_ENABLED=true
```

### Secret Management

Never commit secrets. Use platform-specific secret management:

**Vercel**: Project Settings → Environment Variables (use Sensitive flag)
**AWS**: Secrets Manager or Parameter Store
**GitHub**: Repository Secrets

## Performance Optimization

### Compression

Ensure gzip/brotli compression on server:

```nginx
# nginx.conf
gzip on;
gzip_types text/html text/plain text/css text/javascript application/javascript application/json;
gzip_min_length 1000;
gzip_vary on;
```

### Caching Strategy

```nginx
# Cache static assets for 1 year
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# Don't cache HTML
location = /index.html {
  expires -1;
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# Cache manifest and SW for 24 hours
location ~ /(manifest.json|sw.js)$ {
  expires 1d;
  add_header Cache-Control "public, max-age=86400";
}
```

### Service Worker Strategy

```typescript
// Precache only essential assets
const CACHE_NAME = 'ftd-app-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Network-first for API calls
// Cache-first for static assets
// Stale-while-revalidate for images
```

### Lighthouse Optimization

```bash
# Run Lighthouse locally
npm install -g lighthouse
lighthouse https://yourdomain.com --view

# Target Scores:
# - Performance: 90+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

## Monitoring and Logging

### Error Tracking (Sentry)

```typescript
// src/services/error-tracking.ts
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  tracesSampleRate: 0.1,
})

export default Sentry
```

### Analytics (Google Analytics)

```typescript
// src/services/analytics.ts
export const trackEvent = (event: string, data?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', event, data)
  }
}
```

### Real User Monitoring

```typescript
// src/services/monitoring.ts
export const reportWebVitals = () => {
  if ('web-vital' in window) {
    web.getCLS(console.log)
    web.getFID(console.log)
    web.getFCP(console.log)
    web.getLCP(console.log)
    web.getTTFB(console.log)
  }
}
```

### Health Checks

Set up monitoring endpoints:

```typescript
// API health check endpoint
GET /api/health
Response: { status: 'ok', timestamp: '2024-01-01T00:00:00Z' }
```

## Rollback Procedures

### Vercel Rollback

```bash
# View deployments
vercel ls

# Rollback to previous deployment
vercel promote <DEPLOYMENT_ID>
```

### Git-Based Rollback

```bash
# Revert commit
git revert <COMMIT_HASH>
git push

# Trigger rebuild via CI/CD
```

### Manual Rollback

```bash
# Deploy previous build
aws s3 sync previous-build/ s3://your-bucket/frontend/
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

### Monitoring Rollback

1. Check error rates in Sentry
2. Monitor API response times
3. Check user session metrics
4. Validate PWA cache updates

## Troubleshooting

### 404 Errors on Route Navigation

**Problem**: Refreshing on `/dashboard` returns 404

**Solution**: Configure server to redirect all routes to `/index.html`

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Service Worker Stale Cache

**Problem**: Users get old version after deploy

**Solution**: Implement cache busting strategy

```typescript
// Service Worker
const CACHE_VERSION = 'v1.0.0' // Update version on each deploy
const CACHE_NAME = `ftd-app-${CACHE_VERSION}`
```

### CORS Errors

**Problem**: API calls blocked by CORS

**Solution**: Verify backend CORS headers

```headers
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Credentials: true
```

### Environment Variables Not Loading

**Problem**: `VITE_API_BASE_URL` is undefined

**Solution**: Variables must start with `VITE_`

```env
# ✅ Correct
VITE_API_BASE_URL=https://api.example.com

# ❌ Wrong - won't be exposed
API_BASE_URL=https://api.example.com
```

### Build Size Too Large

**Problem**: Bundle exceeds size limit

**Solution**: Analyze and optimize

```bash
# Analyze bundle
npm install -g bundle-buddy
npm run build -- --analyze

# Remove unused dependencies
npm prune --production

# Use code splitting for large dependencies
```

### Performance Issues

**Problem**: Page loads slowly

**Solution**: Apply performance optimizations

```bash
# Check Core Web Vitals
npm run test:lighthouse

# Optimize images
npm install -g imagemin-cli

# Tree-shake unused code
# Check vite.config.ts for build optimization
```

## Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing
- [ ] No linting errors
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Security review passed
- [ ] Performance validated
- [ ] Monitoring configured
- [ ] Runbook updated
- [ ] Rollback plan prepared
- [ ] Team notified

## Post-Deployment

### Validation

```bash
# 1. Check domain is accessible
curl https://yourdomain.com

# 2. Verify API connectivity
curl https://yourdomain.com/api/health

# 3. Check PWA install
# Open DevTools → Application → Manifest

# 4. Monitor error logs
# Check Sentry/Datadog for errors

# 5. Verify analytics
# Check Google Analytics for page views
```

### Communication

1. Post deployment message in Slack
2. Notify stakeholders
3. Monitor for issues 15 minutes
4. Update status page

## Incident Response

### If Deployment Fails

1. Stop deployment
2. Check error logs
3. Review recent changes
4. Rollback if necessary
5. Post-mortem analysis

### If Production Issue Detected

1. Alert team immediately
2. Check error rates
3. Check performance metrics
4. Decide: fix or rollback
5. Document incident

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Deployment Guide](https://react.dev/learn/deployment)
- [PWA Deployment](https://web.dev/install-criteria/)
- [Web Performance](https://web.dev/performance/)

## Questions?

Contact the DevOps team or refer to the internal deployment runbook.
