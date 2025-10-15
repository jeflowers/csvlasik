# 🚀 Deployment Guide - ClearSight LASIK CMS

Complete guide for deploying the ClearSight LASIK application to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have completed:

- [ ] All tests passing (`npm run test:run` and `npm run test:e2e`)
- [ ] Linter checks passing (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Production Supabase project created and configured
- [ ] All database migrations applied to production
- [ ] Admin user created in production database
- [ ] Domain DNS configured
- [ ] SSL certificate ready (handled by hosting platform)
- [ ] Environment variables prepared
- [ ] Backup strategy in place

---

## 🎯 Deployment Options

Choose your preferred hosting platform:

1. **Netlify** (Recommended) - Easy setup, great performance, built-in CDN
2. **Vercel** - Excellent performance, serverless functions support
3. **AWS Amplify** - Full AWS integration
4. **Cloudflare Pages** - Global CDN, DDoS protection

This guide covers Netlify and Vercel in detail.

---

## 🌐 Option 1: Deploy to Netlify (Recommended)

### Step 1: Prepare Your Repository

```bash
# Ensure your code is committed and pushed to GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Authorize Netlify to access your repositories

### Step 3: Create New Site

1. Click "Add new site" → "Import an existing project"
2. Choose GitHub and select your repository
3. Configure build settings:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20

### Step 4: Configure Environment Variables

In Netlify dashboard, go to **Site configuration** → **Environment variables**:

Add these variables:

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
NODE_ENV=production
```

### Step 5: Deploy

1. Click "Deploy site"
2. Netlify will build and deploy your application
3. You'll get a URL like: `https://your-site.netlify.app`

### Step 6: Configure Custom Domain

1. Go to **Domain management** → "Add custom domain"
2. Enter: `csvlasik.com`
3. Follow DNS configuration instructions:

**For Netlify DNS:**
```
Type: A
Name: @
Value: 75.2.60.5
```

**For External DNS (like GoDaddy, Namecheap):**
```
Type: CNAME
Name: www
Value: your-site.netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

4. Netlify will automatically provision SSL certificate (takes 24-48 hours)

### Step 7: Configure Redirects

The `netlify.toml` file already includes:
- SPA routing (all routes → index.html)
- WWW to non-WWW redirect
- HTTP to HTTPS redirect
- Security headers

### Step 8: Enable Continuous Deployment

Automatic deployments are enabled by default:
- Push to `main` branch → Production deployment
- Pull requests → Deploy preview

---

## 🔷 Option 2: Deploy to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy from Command Line

```bash
# First deployment (follow prompts)
vercel

# Production deployment
vercel --prod
```

### Step 4: Or Deploy via Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 5: Set Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
NODE_ENV=production
```

### Step 6: Configure Custom Domain

1. Go to **Settings** → **Domains**
2. Add `csvlasik.com`
3. Configure DNS:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. SSL is automatically provisioned

---

## 🗄️ Production Database Setup

### Step 1: Create Production Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Configure:
   - **Name**: ClearSight LASIK Production
   - **Database Password**: Strong password (save this!)
   - **Region**: Closest to your users
   - **Plan**: Pro (recommended for production)

### Step 2: Apply Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to production project
supabase link --project-ref your-production-ref

# Push migrations
supabase db push
```

Or apply migrations manually in Supabase SQL Editor:
1. Go to **SQL Editor** in Supabase dashboard
2. Copy contents of `supabase/migrations/20251007195709_create_cms_tables.sql`
3. Run the SQL

### Step 3: Configure Storage Buckets

In Supabase dashboard:

1. Go to **Storage**
2. Create bucket: `media`
3. Make it **public**
4. Configure CORS:

```json
{
  "allowedOrigins": ["https://csvlasik.com", "https://www.csvlasik.com"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["*"],
  "maxAgeSeconds": 3600
}
```

### Step 4: Create Admin User

Use the browser console method from `ADMIN_USER_SETUP.md`:

1. Visit your production site
2. Open browser console (F12)
3. Run the admin creation script
4. Or use Supabase dashboard Authentication section

---

## 🔐 Security Configuration

### Enable Rate Limiting

In Supabase dashboard:
1. **Settings** → **API**
2. Enable rate limiting:
   - **Requests per second**: 100
   - **Burst**: 200

### Configure Auth Settings

1. **Authentication** → **Settings**
2. Configure:
   - **Site URL**: `https://csvlasik.com`
   - **Redirect URLs**:
     - `https://csvlasik.com/admin/login`
     - `https://csvlasik.com/admin`
   - **JWT Expiry**: 3600 seconds (1 hour)
   - **Enable Email Confirmations**: Yes (for production)
   - **Enable Phone Confirmations**: No

### Review RLS Policies

Run this check in SQL Editor:

```sql
-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'articles', 'testimonials', 'media', 'audit_logs');

-- Should return rowsecurity = true for all
```

---

## 📊 Post-Deployment Verification

### Step 1: Verify Build

Check that all assets loaded:
```bash
curl -I https://csvlasik.com
# Should return 200 OK
```

### Step 2: Test Public Pages

Visit these URLs and verify they load:
- `https://csvlasik.com/` - Homepage
- `https://csvlasik.com/about` - About page
- `https://csvlasik.com/procedures` - Procedures page
- `https://csvlasik.com/contact` - Contact page

### Step 3: Test Admin Login

1. Go to `https://csvlasik.com/admin/login`
2. Login with admin credentials
3. Verify dashboard loads
4. Test creating an article
5. Test uploading media
6. Test creating testimonial

### Step 4: Test Internationalization

1. Click language selector
2. Try different languages
3. Verify translations load
4. Test RTL languages (Arabic, Hebrew)

### Step 5: Performance Check

Use [PageSpeed Insights](https://pagespeed.web.dev/):
```
https://pagespeed.web.dev/analysis?url=https://csvlasik.com
```

Target scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

### Step 6: Security Check

Use [Mozilla Observatory](https://observatory.mozilla.org/):
```
https://observatory.mozilla.org/analyze/csvlasik.com
```

Target: A+ rating

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Netlify and Vercel support automatic deployments:

**Production (main branch):**
```bash
git add .
git commit -m "Update content"
git push origin main
# Automatic deployment triggered
```

**Preview (pull requests):**
```bash
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR on GitHub
# Preview deployment created automatically
```

### Manual Deployments

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Vercel:**
```bash
vercel --prod
```

---

## 🔙 Rollback Procedures

### Netlify Rollback

1. Go to **Deploys** in Netlify dashboard
2. Find previous successful deployment
3. Click "Publish deploy"
4. Confirm rollback

### Vercel Rollback

1. Go to **Deployments** in Vercel dashboard
2. Find previous deployment
3. Click "..." → "Promote to Production"

### Emergency Rollback via CLI

**Netlify:**
```bash
netlify rollback
```

**Vercel:**
```bash
vercel rollback
```

---

## 📈 Monitoring Setup

### Netlify Analytics

1. Go to **Analytics** in Netlify dashboard
2. Enable Netlify Analytics ($9/month)
3. View real-time traffic, performance, and errors

### Vercel Analytics

1. Go to **Analytics** tab
2. Enable Web Analytics
3. View page views, top pages, and performance

### Supabase Monitoring

1. **Logs & Monitoring** in Supabase dashboard
2. View:
   - API requests
   - Auth events
   - Database queries
   - Storage operations

---

## 🆘 Troubleshooting

### Issue: Build Fails

**Check:**
```bash
# Test build locally
npm run build

# Check node version
node --version  # Should be 20+

# Clear cache and rebuild
npm run clean
npm install
npm run build
```

### Issue: Environment Variables Not Working

**Solution:**
1. Verify variables are set in hosting dashboard
2. Restart deployment
3. Check variable names match exactly (case-sensitive)
4. VITE_ prefix is required for client-side variables

### Issue: 404 on Refresh

**Solution:**
- Verify `netlify.toml` or `vercel.json` includes SPA rewrites
- All routes should redirect to `/index.html`

### Issue: CORS Errors

**Solution:**
1. Check Supabase project URL is correct
2. Verify Storage CORS configuration includes production domain
3. Check site URL in Supabase Auth settings

### Issue: Slow Loading

**Solution:**
1. Enable CDN (automatic on Netlify/Vercel)
2. Check bundle sizes: `npm run build`
3. Verify assets are compressed
4. Enable Brotli compression in hosting settings

---

## 📝 Environment Variables Reference

### Required Variables

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Application
NODE_ENV=production
VITE_APP_URL=https://csvlasik.com
```

### Optional Variables (Phase 10+)

```env
# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Error Tracking
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
```

---

## 🎉 Deployment Complete!

Your application is now live at **https://csvlasik.com**

### Next Steps:

1. ✅ Monitor deployments for first 24 hours
2. ✅ Set up analytics (Phase 10)
3. ✅ Configure email notifications (Phase 11)
4. ✅ Create backups schedule
5. ✅ Document admin procedures
6. ✅ Train content editors

---

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Last Updated**: October 11, 2025
**Version**: 1.0.0
**Status**: Production Ready
