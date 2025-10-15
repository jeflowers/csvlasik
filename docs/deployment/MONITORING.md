# 📊 Production Monitoring Guide

Comprehensive monitoring setup and procedures for ClearSight LASIK CMS.

---

## 🎯 Monitoring Overview

### What We Monitor
1. **Application Health** - Uptime, response times, errors
2. **Performance** - Page load speeds, bundle sizes, Core Web Vitals
3. **Database** - Query performance, connection pool, storage
4. **Security** - Failed logins, suspicious activity, vulnerabilities
5. **User Experience** - Real user monitoring, error rates
6. **Infrastructure** - Build times, deployment success, CDN

---

## 🔍 Platform Monitoring

### Netlify Monitoring

#### Built-in Analytics
**Enable:** Netlify Dashboard → Analytics → Enable Analytics ($9/month)

**Metrics Available:**
- Page views and unique visitors
- Top pages and sources
- Bandwidth usage
- Build minutes
- Function invocations (if using Edge Functions)

**Access Logs:**
```
Dashboard → Logs → Functions/Deploy/Request
```

#### Deploy Notifications
**Setup Email Alerts:**
1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add notifications for:
   - Deploy started
   - Deploy succeeded
   - Deploy failed
   - Deploy locked/unlocked

**Slack Integration:**
1. Add Slack app: **Netlify Bot**
2. Configure notifications:
   ```
   /netlify watch [site-name]
   ```

### Vercel Monitoring

#### Analytics
**Enable:** Project Settings → Analytics → Enable

**Metrics:**
- Real User Monitoring (RUM)
- Page views
- Visitors
- Top pages
- Performance scores
- Core Web Vitals

#### Deployment Notifications
**Setup:**
1. **Settings** → **Git** → **Deploy Hooks**
2. Add webhook URL for:
   - Slack
   - Discord
   - Custom webhook

---

## 🗄️ Supabase Monitoring

### Database Monitoring

**Access:** Supabase Dashboard → Reports

#### Key Metrics
- **API Requests**: Total and by endpoint
- **Database Size**: Current size and growth
- **Active Connections**: Connection pool usage
- **Cache Hit Rate**: Query performance
- **Bandwidth**: Data transfer

#### Query Performance
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Auth Monitoring

**Access:** Authentication → Logs

**Monitor:**
- Failed login attempts
- Successful logins
- Password resets
- Account lockouts
- Suspicious patterns

**Alert Triggers:**
- More than 5 failed logins from same IP in 1 minute
- Unusual geographic login patterns
- Multiple account creation attempts

### Storage Monitoring

**Access:** Storage → Usage

**Track:**
- Storage used vs. quota
- Bandwidth used
- Top accessed files
- Failed uploads

---

## 🚨 Uptime Monitoring

### UptimeRobot (Free Option)

**Setup:**
1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add monitors:

**Monitor 1: Homepage**
```
Type: HTTP(s)
URL: https://csvlasik.com
Interval: 5 minutes
```

**Monitor 2: Admin**
```
Type: HTTP(s)
URL: https://csvlasik.com/admin/login
Interval: 5 minutes
```

**Monitor 3: API Health**
```
Type: HTTP(s)
URL: https://csvlasik.com/api/health
Interval: 5 minutes
Keyword: "healthy"
```

**Alert Contacts:**
- Email notifications
- SMS (upgrade required)
- Slack/Discord webhook
- Telegram

### Alternative Services

**Pingdom**
- More detailed reports
- Real user monitoring
- Transaction monitoring
- Multi-location checks

**Better Uptime**
- Status page included
- Incident management
- On-call scheduling
- Mobile app

---

## 📈 Performance Monitoring

### Google PageSpeed Insights

**Monitor Weekly:**
```bash
# Run automated check
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://csvlasik.com"
```

**Key Metrics:**
- Performance Score
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

**Targets:**
- Performance: > 90
- FCP: < 1.8s
- LCP: < 2.5s
- TBT: < 200ms
- CLS: < 0.1

### Core Web Vitals

**Monitor via:**
1. Google Search Console
2. Chrome User Experience Report
3. PageSpeed Insights
4. Real User Monitoring (RUM)

**Setup Search Console:**
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `https://csvlasik.com`
3. Verify ownership via DNS or HTML file
4. Enable Core Web Vitals reporting

---

## 🔐 Security Monitoring

### Failed Login Attempts

**Monitor in Supabase:**
```sql
-- Check failed login attempts
SELECT
  created_at,
  email,
  COUNT(*) as attempts
FROM auth.audit_log_entries
WHERE action = 'user_signin_failed'
AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY created_at, email
HAVING COUNT(*) > 3
ORDER BY attempts DESC;
```

**Alert if:**
- More than 5 failed attempts per IP per hour
- Same email from multiple IPs
- Brute force patterns detected

### Security Headers

**Check with:**
```bash
curl -I https://csvlasik.com
```

**Verify Present:**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: ...`
- `Strict-Transport-Security: ...`

**Automated Check:**
```bash
# Use securityheaders.com
curl "https://securityheaders.com/?q=https://csvlasik.com&followRedirects=on"
```

### Vulnerability Scanning

**Dependabot (GitHub):**
1. Enable in repository settings
2. Automatic PR for security updates
3. Configure auto-merge for minor updates

**npm audit:**
```bash
# Run weekly
npm audit

# Fix automatically
npm audit fix
```

---

## 📊 Dashboard Setup

### Custom Monitoring Dashboard

**Option 1: Google Sheets**

Create spreadsheet with:
- Daily uptime percentage
- Average response time
- Error count
- User count
- Page views

**Update via API:**
```javascript
// Example: Log metrics to Google Sheets
const logMetrics = async () => {
  const metrics = {
    date: new Date().toISOString(),
    uptime: await checkUptime(),
    responseTime: await checkResponseTime(),
    errors: await countErrors(),
  };
  // Send to Google Sheets API
};
```

**Option 2: Grafana + Prometheus**

For advanced monitoring:
1. Set up Prometheus for metrics collection
2. Configure Grafana for visualization
3. Create dashboards for:
   - Application metrics
   - Database metrics
   - Infrastructure metrics

---

## 🔔 Alert Configuration

### Critical Alerts (Immediate Response)

**Trigger:**
- Site down (5+ minutes)
- Database connection failed
- Storage quota exceeded
- SSL certificate expiring (< 7 days)

**Notification:**
- SMS
- Phone call
- Slack with @channel
- Email (primary and backup)

### Warning Alerts (Review within 1 hour)

**Trigger:**
- Response time > 3s
- Error rate > 1%
- Failed logins spike
- Storage > 80% capacity
- Build failure

**Notification:**
- Email
- Slack notification

### Info Alerts (Review daily)

**Trigger:**
- New deployment
- Configuration change
- Scheduled maintenance
- Report generation

**Notification:**
- Email digest
- Slack notification

---

## 📋 Monitoring Schedule

### Daily (Automated)
- [ ] Uptime checks (every 5 minutes)
- [ ] Error log review
- [ ] Performance metrics
- [ ] Security scan

### Weekly (Manual)
- [ ] Review analytics reports
- [ ] Check Core Web Vitals
- [ ] Review user feedback
- [ ] Analyze traffic patterns
- [ ] Security audit
- [ ] Dependency updates check

### Monthly
- [ ] Full performance audit
- [ ] Database optimization review
- [ ] Storage cleanup
- [ ] Cost analysis
- [ ] Backup verification
- [ ] Disaster recovery test

### Quarterly
- [ ] Security penetration test
- [ ] Full system audit
- [ ] Capacity planning review
- [ ] Technology stack review
- [ ] Process improvement review

---

## 📊 Key Performance Indicators (KPIs)

### Availability
- **Target**: 99.9% uptime
- **Measurement**: Total uptime / Total time
- **Report**: Monthly

### Performance
- **Target**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Measurement**: Core Web Vitals
- **Report**: Weekly

### Error Rate
- **Target**: < 0.1% of requests
- **Measurement**: Errors / Total requests
- **Report**: Daily

### User Satisfaction
- **Target**: > 4.5/5 average rating
- **Measurement**: User feedback
- **Report**: Monthly

---

## 🔍 Incident Response

### Severity Levels

**P0 - Critical (Response: Immediate)**
- Site completely down
- Data breach
- Security vulnerability exploited
- Database corrupted

**P1 - High (Response: < 1 hour)**
- Major feature broken
- Performance degraded significantly
- Authentication issues
- Data loss risk

**P2 - Medium (Response: < 4 hours)**
- Minor feature broken
- Slow performance
- Non-critical errors
- UX issues

**P3 - Low (Response: < 24 hours)**
- Cosmetic issues
- Documentation updates
- Enhancement requests
- Non-urgent bugs

### Incident Response Process

1. **Detect**: Monitoring alerts or user report
2. **Assess**: Determine severity and impact
3. **Respond**: Execute response plan
4. **Communicate**: Update stakeholders
5. **Resolve**: Fix the issue
6. **Document**: Post-mortem and lessons learned

---

## 📞 On-Call Rotation

### Setup On-Call Schedule

**Tools:**
- PagerDuty
- OpsGenie
- VictorOps
- Or simple shared calendar

**Schedule:**
- Primary on-call: Week rotation
- Secondary backup: 24/7 availability
- Escalation: Manager/CTO

**Responsibilities:**
- Monitor alerts
- Respond to incidents
- Document actions
- Hand off to next shift

---

## 📈 Reporting

### Daily Report (Automated)

```
Subject: ClearSight Daily Report - [Date]

Uptime: 99.98%
Response Time: 245ms avg
Errors: 3 (all handled)
Users: 142 unique visitors
Top Page: /procedures (45 views)

Status: ✅ All systems operational
```

### Weekly Report

**Include:**
- Uptime summary
- Performance trends
- Error analysis
- Traffic analysis
- Security events
- Action items

### Monthly Executive Summary

**Include:**
- Business metrics
- Technical metrics
- Cost analysis
- Improvement recommendations
- Next month priorities

---

## 🛠️ Monitoring Tools Summary

### Free Tools
- ✅ UptimeRobot - Uptime monitoring
- ✅ PageSpeed Insights - Performance
- ✅ Google Search Console - SEO & Core Web Vitals
- ✅ Supabase Dashboard - Database & Auth
- ✅ Netlify/Vercel Analytics - Platform metrics
- ✅ SecurityHeaders.com - Security audit

### Paid Tools (Optional)
- Pingdom - Advanced uptime monitoring
- Sentry - Error tracking (Phase 10)
- LogRocket - Session replay
- Datadog - Full-stack monitoring
- New Relic - APM

---

## ✅ Monitoring Checklist

### Initial Setup
- [ ] Uptime monitoring configured
- [ ] Performance monitoring active
- [ ] Database monitoring enabled
- [ ] Security monitoring set up
- [ ] Alert contacts configured
- [ ] Dashboard created
- [ ] Documentation complete

### Daily Operations
- [ ] Check uptime status
- [ ] Review error logs
- [ ] Monitor performance
- [ ] Check security alerts

### Continuous Improvement
- [ ] Identify bottlenecks
- [ ] Optimize slow queries
- [ ] Reduce bundle sizes
- [ ] Improve error handling
- [ ] Update documentation

---

**Last Updated**: October 11, 2025
**Version**: 1.0.0
**Review Schedule**: Monthly
