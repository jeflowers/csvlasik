# ✅ Production Deployment Checklist

Complete checklist for deploying ClearSight LASIK CMS to production.

---

## 📅 Timeline: 1-2 Days

**Estimated Time Breakdown:**
- Database Setup: 1-2 hours
- Hosting Configuration: 1-2 hours
- Domain & DNS: 2-4 hours (DNS propagation)
- Testing & Verification: 2-3 hours
- Monitoring Setup: 1 hour

---

## 🎯 Phase 1: Pre-Deployment (Day 1 - Morning)

### Code Quality
- [ ] All unit tests passing
  ```bash
  npm run test:run
  ```
- [ ] All E2E tests passing
  ```bash
  npm run test:e2e
  ```
- [ ] Linter checks passing
  ```bash
  npm run lint
  ```
- [ ] Production build succeeds
  ```bash
  npm run build
  ```
- [ ] No console errors in build output
- [ ] Bundle sizes acceptable (< 500KB gzipped)

### Code Repository
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub/GitLab
- [ ] Main branch is clean and up-to-date
- [ ] No sensitive data in repository
- [ ] `.env` files in `.gitignore`
- [ ] README updated with production info

---

## 🗄️ Phase 2: Database Setup (Day 1 - Afternoon)

### Supabase Production Project
- [ ] Production Supabase project created
- [ ] Project name: ClearSight LASIK Production
- [ ] Region selected (closest to users)
- [ ] Database password saved securely
- [ ] Project reference ID noted
- [ ] Billing configured (Pro plan recommended)

### Database Migration
- [ ] All migrations reviewed
- [ ] Migrations applied to production
  ```bash
  supabase db push
  ```
- [ ] All tables created successfully
- [ ] RLS enabled on all tables:
  - [ ] users
  - [ ] articles
  - [ ] testimonials
  - [ ] media
  - [ ] audit_logs
  - [ ] translation_cache
  - [ ] statistics
  - [ ] data_subject_requests
  - [ ] consent_records

### Database Verification
- [ ] Run verification queries
  ```sql
  -- Check tables exist
  SELECT tablename FROM pg_tables WHERE schemaname = 'public';

  -- Check RLS enabled
  SELECT tablename, rowsecurity FROM pg_tables
  WHERE schemaname = 'public';
  ```
- [ ] All policies created correctly
- [ ] Test queries work

### Storage Configuration
- [ ] Storage bucket `media` created
- [ ] Bucket made public
- [ ] CORS configured with production domain
- [ ] Upload limits set (50MB)
- [ ] File type restrictions configured

### Authentication Setup
- [ ] Site URL set to production domain
- [ ] Redirect URLs configured:
  - [ ] `https://csvlasik.com/admin/login`
  - [ ] `https://csvlasik.com/admin`
- [ ] Email confirmation enabled
- [ ] Email templates customized
- [ ] JWT expiry set (3600 seconds)
- [ ] Password requirements configured

### Create Admin User
- [ ] Admin user created via Supabase dashboard
- [ ] Email: documented
- [ ] Password: secure and saved
- [ ] Role: admin
- [ ] Email confirmed
- [ ] Test login successful

---

## 🌐 Phase 3: Hosting Setup (Day 1 - Evening)

### Choose Platform
- [ ] Platform selected: ☐ Netlify  ☐ Vercel  ☐ Other

### Netlify Setup (if chosen)
- [ ] Netlify account created
- [ ] Repository connected
- [ ] Build settings configured:
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
  - [ ] Node version: 20
- [ ] Environment variables set:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `NODE_ENV=production`
- [ ] Deploy hooks configured (optional)

### Vercel Setup (if chosen)
- [ ] Vercel account created
- [ ] Project imported from Git
- [ ] Framework preset: Vite
- [ ] Build configuration verified
- [ ] Environment variables set
- [ ] Production branch configured

### Initial Deployment
- [ ] First deployment triggered
- [ ] Build completed successfully
- [ ] No build errors
- [ ] Deployment URL accessible
- [ ] Site loads correctly

---

## 🔐 Phase 4: Domain Configuration (Day 1-2)

### Domain Preparation
- [ ] Domain purchased: `csvlasik.com`
- [ ] Domain registrar access confirmed
- [ ] SSL certificate plan confirmed (auto by host)

### DNS Configuration
- [ ] DNS records updated:
  - [ ] A record for root domain
  - [ ] CNAME for www subdomain
  - [ ] TXT records for verification (if needed)
- [ ] DNS changes saved
- [ ] Propagation started (24-48 hours)

### SSL Certificate
- [ ] SSL provisioning initiated by host
- [ ] Certificate status: ☐ Pending  ☐ Active
- [ ] HTTPS redirect enabled
- [ ] HTTP requests redirect to HTTPS

### Domain Verification
- [ ] Custom domain added to hosting platform
- [ ] Domain ownership verified
- [ ] Primary domain set: `csvlasik.com`
- [ ] WWW redirect configured

---

## 🧪 Phase 5: Testing & Verification (Day 2 - Morning)

### Functional Testing
- [ ] Homepage loads (`https://csvlasik.com`)
- [ ] All navigation links work
- [ ] Public pages accessible:
  - [ ] `/about`
  - [ ] `/procedures`
  - [ ] `/technology`
  - [ ] `/financing`
  - [ ] `/contact`
  - [ ] `/testimonials`
  - [ ] `/media`
- [ ] Contact form submits
- [ ] Language selector works
- [ ] All languages load correctly
- [ ] RTL languages display properly (Arabic, Hebrew)

### Admin Testing
- [ ] Admin login page loads
- [ ] Admin can login successfully
- [ ] Dashboard displays correctly
- [ ] All admin features work:
  - [ ] Create article
  - [ ] Edit article
  - [ ] Delete article
  - [ ] Upload media
  - [ ] Create testimonial
  - [ ] Manage users
  - [ ] View statistics
- [ ] Logout works correctly

### Database Testing
- [ ] CRUD operations work
- [ ] RLS policies enforced
- [ ] Unauthorized access blocked
- [ ] Data persists correctly

### Performance Testing
- [ ] Run PageSpeed Insights
  ```
  https://pagespeed.web.dev/analysis?url=https://csvlasik.com
  ```
- [ ] Performance score > 90
- [ ] Accessibility score > 95
- [ ] Best Practices score > 95
- [ ] SEO score > 95
- [ ] Core Web Vitals pass:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

### Security Testing
- [ ] Run Mozilla Observatory
  ```
  https://observatory.mozilla.org/analyze/csvlasik.com
  ```
- [ ] Security headers present
- [ ] SSL/TLS configured (A+ rating)
- [ ] No mixed content warnings
- [ ] CSP header configured
- [ ] XSS protection enabled
- [ ] CSRF protection working

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Mobile Testing
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Forms usable on mobile
- [ ] No horizontal scrolling
- [ ] Text readable without zoom

---

## 📊 Phase 6: Monitoring Setup (Day 2 - Afternoon)

### Platform Monitoring
- [ ] Netlify/Vercel analytics enabled
- [ ] Deploy notifications configured
- [ ] Error tracking enabled
- [ ] Build alerts set up

### Supabase Monitoring
- [ ] Dashboard access confirmed
- [ ] API logs accessible
- [ ] Database performance monitoring active
- [ ] Auth logs viewable
- [ ] Storage usage tracking enabled

### Uptime Monitoring
- [ ] Uptime monitoring service selected:
  - [ ] UptimeRobot (free)
  - [ ] Pingdom
  - [ ] StatusCake
  - [ ] Other: __________
- [ ] Monitoring configured for:
  - [ ] Homepage
  - [ ] Admin login
  - [ ] API health check
- [ ] Alert email configured
- [ ] Check interval: 5 minutes

### Log Management
- [ ] Error logging configured
- [ ] Access logs reviewed
- [ ] Database logs accessible
- [ ] Log retention policy set

---

## 🔄 Phase 7: Backup & Recovery (Day 2 - Evening)

### Backup Strategy
- [ ] Supabase automatic backups enabled
- [ ] Backup schedule documented
- [ ] Recovery procedures documented
- [ ] Database export tested
- [ ] Backup location secured

### Recovery Testing
- [ ] Database restore tested
- [ ] Rollback procedure documented
- [ ] Previous deployment rollback tested
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined

---

## 📝 Phase 8: Documentation (Day 2 - Evening)

### Production Documentation
- [ ] Production credentials documented
- [ ] Access credentials secured:
  - [ ] Supabase admin access
  - [ ] Hosting platform access
  - [ ] Domain registrar access
  - [ ] GitHub repository access
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedures documented

### Admin Documentation
- [ ] Admin user guide created
- [ ] Content management guide
- [ ] Media upload guide
- [ ] User management guide
- [ ] Troubleshooting guide

### Team Handoff
- [ ] Content team trained
- [ ] Admin credentials shared securely
- [ ] Support contacts documented
- [ ] Escalation procedures defined

---

## 🎉 Phase 9: Go Live (Day 2 - Evening)

### Pre-Launch
- [ ] Final smoke test completed
- [ ] All stakeholders notified
- [ ] Support team ready
- [ ] Monitoring dashboards open

### Launch
- [ ] Production site accessible at `https://csvlasik.com`
- [ ] All features working
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] Security verified

### Post-Launch
- [ ] Monitor for first 2 hours continuously
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Respond to any issues
- [ ] Document any problems

---

## 🚨 Post-Deployment (First 24 Hours)

### Hour 1
- [ ] Verify site is accessible
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Test critical features

### Hour 4
- [ ] Review analytics
- [ ] Check uptime status
- [ ] Review error reports
- [ ] Verify backups running

### Hour 8
- [ ] Performance check
- [ ] User feedback review
- [ ] Error rate analysis
- [ ] Traffic analysis

### Hour 24
- [ ] Full system review
- [ ] Performance report
- [ ] Issue summary
- [ ] Optimization opportunities identified

---

## ✅ Sign-Off

### Deployment Team
- [ ] Developer sign-off: _________________ Date: _______
- [ ] QA sign-off: _________________ Date: _______
- [ ] Project Manager sign-off: _________________ Date: _______

### Stakeholders
- [ ] Client approval: _________________ Date: _______
- [ ] Content team ready: _________________ Date: _______

---

## 📞 Emergency Contacts

**Critical Issues (Production Down):**
- Platform Support: [hosting support email/phone]
- Supabase Support: support@supabase.io
- Developer On-Call: [phone number]

**Non-Critical Issues:**
- Support Email: [support email]
- Project Manager: [PM contact]

---

## 📚 Resources

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [ADMIN_USER_SETUP.md](./ADMIN_USER_SETUP.md) - Admin setup
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Project overview

---

**Checklist Version**: 1.0.0
**Last Updated**: October 11, 2025
**Next Review**: After first deployment
