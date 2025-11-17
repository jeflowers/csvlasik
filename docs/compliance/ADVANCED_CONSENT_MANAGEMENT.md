# Advanced Consent Management System

## Overview

Ultra-granular, GDPR-compliant consent management system with per-cookie controls, consent scheduling, data portability, notification preferences, and comprehensive analytics.

---

## System Architecture

### Three Levels of Granularity

**Level 1: Category-Based** (Standard)
- Consent by purpose category (Analytics, Marketing, etc.)
- Required for GDPR Article 6 compliance
- Easy for users to understand

**Level 2: Cookie-Based** (Enhanced)
- Individual cookie opt-in/opt-out
- Overrides category defaults
- Full transparency per cookie

**Level 3: Time-Based** (Advanced)
- Consent expiry dates
- Scheduled reviews
- Automatic renewal options

---

## Database Schema

### Core Tables (from previous enhancement)
- `consent_categories` - 6 predefined categories
- `consent_cookies` - Individual cookie inventory
- `consent_versions` - Policy version tracking
- `user_consents` - User consent records
- `consent_audit_log` - Complete audit trail
- `consent_withdrawal_reasons` - Feedback collection

### New Advanced Tables

#### 1. user_cookie_preferences
**Purpose**: Per-cookie granular control

```sql
id                  uuid PRIMARY KEY
user_consent_id     uuid REFERENCES user_consents
cookie_id           uuid REFERENCES consent_cookies
is_enabled          boolean (cookie enabled/disabled)
override_category   boolean (overrides category setting)
created_at          timestamptz
updated_at          timestamptz
```

**Use Case**: User wants Analytics cookies but not Google Analytics specifically

**Example**:
```json
{
  "category": "analytics",
  "category_enabled": true,
  "individual_cookies": {
    "_ga": false,        // Disabled
    "_gid": false,       // Disabled
    "matomo_id": true    // Enabled (override)
  }
}
```

#### 2. consent_schedules
**Purpose**: Consent expiry and review management

```sql
id                uuid PRIMARY KEY
user_consent_id   uuid REFERENCES user_consents
review_date       date (next review date)
expiry_date       date (consent expiration)
auto_renew        boolean (automatic renewal)
reminder_sent     boolean (reminder flag)
reminder_sent_at  timestamptz
created_at        timestamptz
```

**Auto-Creation**: Automatically created when user gives consent
- Review date: +1 year
- Expiry date: +2 years
- Auto-renew: false (user must actively renew)

#### 3. consent_notifications
**Purpose**: User notification preferences

```sql
id                        uuid PRIMARY KEY
user_identifier           text UNIQUE
email                     text (notification email)
notify_policy_changes     boolean (policy update alerts)
notify_before_expiry      boolean (expiry reminders)
notify_data_usage         boolean (usage reports)
notification_frequency    text (immediate/daily/weekly/monthly)
created_at                timestamptz
updated_at                timestamptz
```

**Notification Types**:
- **Policy Changes**: New consent version requires reacceptance
- **Expiry Reminders**: 30 days before consent expires
- **Data Usage**: Monthly/quarterly reports on data collection

#### 4. consent_data_exports
**Purpose**: GDPR Article 20 data portability

```sql
id                uuid PRIMARY KEY
user_identifier   text
export_type       text (full/consents_only/audit_only)
export_format     text (json/csv/pdf)
status            text (requested/processing/completed/failed)
file_path         text (download location)
error_message     text
requested_at      timestamptz
completed_at      timestamptz
expires_at        timestamptz (default: +30 days)
```

**Export Contents**:
- All consent records
- Complete audit history
- Cookie preferences
- Category preferences
- Notification settings
- Timestamps and versions

#### 5. consent_analytics_events
**Purpose**: Consent interaction tracking

```sql
id                uuid PRIMARY KEY
user_identifier   text
event_type        text (banner_shown, preferences_opened, etc.)
event_data        jsonb (additional context)
page_url          text
session_id        text
timestamp         timestamptz
```

**Tracked Events**:
- `banner_shown` - Consent banner displayed
- `banner_dismissed` - User dismissed without action
- `preferences_opened` - User opened preferences modal
- `preferences_saved` - User saved custom preferences
- `accept_all_clicked` - User accepted all cookies
- `reject_all_clicked` - User rejected optional cookies
- `category_toggled` - Category preference changed
- `cookie_toggled` - Individual cookie toggled
- `policy_viewed` - Privacy policy viewed
- `withdraw_initiated` - Consent withdrawal started
- `export_requested` - Data export requested

#### 6. consent_ab_tests
**Purpose**: A/B testing consent flows

```sql
id              uuid PRIMARY KEY
test_name       text (test identifier)
variant_name    text (variant A/B/C)
configuration   jsonb (variant settings)
is_active       boolean
start_date      date
end_date        date
created_at      timestamptz
```

**Test Examples**:
- Banner positioning (bottom vs. top)
- Button text ("Accept All" vs. "I Agree")
- Color schemes
- Number of clicks to customize
- Default selections

---

## Advanced Features

### 1. Ultra-Granular Cookie Control

**Category Override System**:
```
Category: Analytics = ENABLED
  ├─ _ga (Google Analytics) = DISABLED (override)
  ├─ _gid (Google Analytics) = DISABLED (override)
  └─ matomo_id (Matomo) = ENABLED (default)
```

**How It Works**:
1. User enables "Analytics" category
2. By default, ALL analytics cookies enabled
3. User can individually disable specific cookies
4. Override flag set to `true`
5. System respects individual cookie setting

**Benefits**:
- Maximum user control
- GDPR compliance (granular consent)
- Transparency
- Reduced cookie usage

### 2. Consent Scheduling & Expiry

**Automatic Schedule Creation**:
```javascript
// Triggered on consent insert
consent_created: {
  review_date: today + 1 year,
  expiry_date: today + 2 years,
  auto_renew: false
}
```

**Reminder System**:
- 30 days before expiry: Email reminder sent
- `reminder_sent` flag set to prevent duplicates
- User can renew or modify consent
- Expired consents marked inactive

**Renewal Process**:
1. User receives reminder
2. Reviews current preferences
3. Confirms or updates
4. New consent record created
5. Old consent marked as renewed

### 3. Data Portability (GDPR Article 20)

**Export Formats**:

**JSON Format** (Machine-readable):
```json
{
  "user_identifier": "anon_123456",
  "export_date": "2025-11-16T12:00:00Z",
  "active_consents": [...],
  "audit_history": [...],
  "cookie_preferences": [...]
}
```

**CSV Format** (Spreadsheet):
```
Timestamp,Action,Category,Value
2025-01-15,consent_given,analytics,true
2025-02-20,cookie_toggled,_ga,false
```

**PDF Format** (Human-readable):
- Formatted report with sections
- Summary of current consent
- Complete history timeline
- Cookie preference table

**Processing**:
1. User requests export
2. Record created with `requested` status
3. Background job processes export
4. File generated and stored
5. Status updated to `completed`
6. User receives download link
7. Link expires after 30 days

### 4. Notification Preferences

**Frequency Options**:
- **Immediate**: Real-time email notifications
- **Daily**: Daily digest (9 AM local time)
- **Weekly**: Monday morning summary
- **Monthly**: First of month report

**Notification Content**:

**Policy Change Alert**:
```
Subject: Privacy Policy Update - Action Required

We've updated our privacy policy (v2.0). The changes include:
- New cookie provider: Matomo Analytics
- Updated data retention: 2 years → 18 months
- New legal basis for processing

Please review and accept the new policy to continue using our services.
[Review Changes] [Accept New Policy]
```

**Expiry Reminder**:
```
Subject: Your Consent Expires in 30 Days

Your consent for data processing will expire on Dec 15, 2025.

Current preferences:
✓ Essential Cookies
✓ Analytics Cookies
✗ Marketing Cookies

[Renew Consent] [Update Preferences] [Let It Expire]
```

### 5. Advanced Analytics

**Metrics Tracked**:
- Conversion rate (banner → consent)
- Time to decision
- Preference patterns
- Most toggled cookies
- Withdrawal reasons
- A/B test performance

**Analytics Query Examples**:

**Conversion Rate**:
```sql
SELECT
  (COUNT(*) FILTER (WHERE event_type IN ('accept_all_clicked', 'preferences_saved'))::float /
   COUNT(*) FILTER (WHERE event_type = 'banner_shown')) * 100 as conversion_rate
FROM consent_analytics_events;
```

**Average Time to Decision**:
```sql
SELECT
  AVG(decision.timestamp - banner.timestamp) as avg_decision_time
FROM consent_analytics_events banner
JOIN consent_analytics_events decision
  ON decision.session_id = banner.session_id
WHERE banner.event_type = 'banner_shown'
  AND decision.event_type IN ('accept_all_clicked', 'preferences_saved');
```

---

## Helper Functions

### 1. check_consent_expiry()
**Returns**: Users with upcoming expiry

```sql
SELECT * FROM check_consent_expiry();
```

**Output**:
```
user_identifier    | days_until_expiry | needs_reminder
anon_12345        | 25                | true
user@example.com  | 45                | false
```

**Use**: Daily cron job to send reminders

### 2. get_user_consent_details(user_identifier)
**Returns**: Complete consent overview for user

```sql
SELECT * FROM get_user_consent_details('anon_12345');
```

**Output**:
- Current consent ID
- Consent timestamp
- Policy version
- Category preferences (JSONB)
- Cookie preferences (JSONB)
- Next review date
- Expiry date

### 3. generate_consent_export_data(user_identifier)
**Returns**: Complete data export as JSONB

```sql
SELECT generate_consent_export_data('anon_12345');
```

**Use**: Background job for data exports

### 4. get_consent_analytics_summary(start_date, end_date)
**Returns**: Analytics metrics

```sql
SELECT * FROM get_consent_analytics_summary('2025-01-01', '2025-01-31');
```

**Output**:
- Total events
- Unique users
- Events by type (JSONB)
- Conversion rate

### 5. mark_reminders_for_expiring_consents()
**Returns**: Number of reminders scheduled

```sql
SELECT mark_reminders_for_expiring_consents();
-- Returns: 15 (reminders sent)
```

**Use**: Daily cron job

---

## User Interface Components

### 1. EnhancedConsentBanner
**Features**:
- Database-driven categories
- Database-driven cookies
- Version display
- Three action buttons
- Preference modal with expandable sections
- Legal basis badges
- iOS-style toggle switches

**Usage**:
```tsx
import EnhancedConsentBanner from './components/EnhancedConsentBanner';

<EnhancedConsentBanner />
```

### 2. ConsentPreferencesCenter
**Features**:
- Five tabs (Preferences, Cookies, Schedule, Export, Analytics)
- Per-cookie toggle controls
- Notification preferences
- Data export requests (JSON/CSV/PDF)
- Consent withdrawal
- Schedule overview

**Usage**:
```tsx
import ConsentPreferencesCenter from './components/ConsentPreferencesCenter';

// Add route
<Route path="/privacy-center" element={<ConsentPreferencesCenter />} />
```

### 3. ConsentManagementAdmin
**Features**:
- Statistics dashboard
- Category management
- Cookie inventory
- Recent consent records
- Analytics charts

**Usage**:
```tsx
// In admin routes
<Route path="/admin/consent-management" element={<ConsentManagementAdmin />} />
```

---

## Implementation Guide

### Step 1: Enable Enhanced Banner

Replace old banner in `App.tsx`:
```tsx
// Old
import ConsentBanner from './components/ConsentBanner';

// New
import EnhancedConsentBanner from './components/EnhancedConsentBanner';

// In component
<EnhancedConsentBanner />
```

### Step 2: Add Privacy Center Page

Add route:
```tsx
import ConsentPreferencesCenter from './components/ConsentPreferencesCenter';

<Route path="/privacy-center" element={<ConsentPreferencesCenter />} />
```

Add link in footer:
```tsx
<Link to="/privacy-center">Privacy Center</Link>
```

### Step 3: Configure Cron Jobs

**Daily Expiry Check**:
```javascript
// Run daily at 9 AM
const { data } = await supabase.rpc('mark_reminders_for_expiring_consents');
console.log(`Sent ${data} expiry reminders`);
```

**Weekly Analytics Report**:
```javascript
// Run weekly on Monday
const { data } = await supabase.rpc('get_consent_analytics_summary', {
  p_start_date: lastWeek,
  p_end_date: today
});
// Email report to admin
```

### Step 4: Set Up Export Processing

Background job to process exports:
```javascript
// Check for pending exports
const { data: exports } = await supabase
  .from('consent_data_exports')
  .select('*')
  .eq('status', 'requested');

for (const exp of exports) {
  // Generate export file
  const data = await supabase.rpc('generate_consent_export_data', {
    p_user_identifier: exp.user_identifier
  });

  // Save to storage
  const filePath = await saveExportFile(data, exp.export_format);

  // Update record
  await supabase
    .from('consent_data_exports')
    .update({
      status: 'completed',
      file_path: filePath,
      completed_at: new Date().toISOString()
    })
    .eq('id', exp.id);

  // Send email with download link
  await sendExportEmail(exp.user_identifier, filePath);
}
```

---

## Compliance Benefits

### GDPR Requirements

**Article 6 - Lawfulness** ✅
- Legal basis tracked per category
- Explicit consent recorded
- Consent freely given (can refuse)

**Article 7 - Consent Conditions** ✅
- Burden of proof (complete audit log)
- Clear and distinguishable request
- Withdraw as easy as giving consent
- Granular consent per purpose

**Article 13/14 - Transparency** ✅
- Cookie names, providers, purposes disclosed
- Expiry dates shown
- Legal basis explained
- Contact information available

**Article 15 - Right of Access** ✅
- Complete consent history available
- Export functionality (JSON/CSV/PDF)
- Audit trail accessible

**Article 16 - Right to Rectification** ✅
- Users can update preferences anytime
- Changes tracked in audit log

**Article 17 - Right to Erasure** ✅
- Withdraw consent functionality
- Data deletion on request

**Article 20 - Right to Portability** ✅
- Export in machine-readable format (JSON)
- Export in human-readable format (PDF)
- Structured data format (CSV)

**Article 25 - Data Protection by Design** ✅
- Privacy-first architecture
- Granular controls
- Default to minimal consent
- Transparent processing

### ePrivacy Directive (Cookie Law)

**Requirements Met** ✅:
- Prior consent for non-essential cookies
- Clear information about cookies
- Granular per-cookie control
- Easy opt-out mechanism
- Consent before setting cookies

---

## Best Practices

### For Users

**Review Regularly**:
- Check preferences quarterly
- Update after policy changes
- Review cookie list for new additions

**Use Granular Controls**:
- Enable categories you trust
- Disable individual problematic cookies
- Override defaults as needed

**Set Notifications**:
- Enable expiry reminders
- Get policy change alerts
- Review data usage reports

### For Administrators

**Monitor Metrics**:
- Track conversion rates
- Identify friction points
- A/B test improvements
- Review withdrawal reasons

**Keep Current**:
- Update cookie inventory regularly
- Version policies properly
- Set expiry dates appropriately
- Send timely reminders

**Respond Quickly**:
- Process exports within 30 days (GDPR requirement)
- Answer user questions promptly
- Fix technical issues immediately
- Update documentation

---

## Troubleshooting

### Issue: User can't find consent preferences

**Solution**: Add prominent link to Privacy Center
```html
<!-- In footer and account menu -->
<a href="/privacy-center">Manage Privacy Settings</a>
```

### Issue: Export not processing

**Check**:
1. Background job running?
2. Database function accessible?
3. Storage permissions correct?
4. File size limits?

### Issue: Reminders not sending

**Check**:
1. Cron job configured?
2. Email service working?
3. `reminder_sent` flag correct?
4. Expiry dates set?

---

## Future Enhancements

### Planned Features

1. **Visual Cookie Scanner**
   - Detect cookies automatically
   - Suggest categorization
   - Flag unregistered cookies

2. **Consent Receipts**
   - Generate signed receipt
   - Blockchain timestamp
   - Verifiable proof

3. **Multi-language Support**
   - Translate cookie descriptions
   - Localized notifications
   - Regional compliance (CCPA, LGPD)

4. **Advanced Analytics Dashboard**
   - Real-time conversion funnel
   - Heatmaps of interactions
   - Predictive insights

5. **Automated Compliance Reporting**
   - Monthly compliance reports
   - Risk assessment
   - Audit preparation

---

## Support

**Questions**: privacy@clearsightvision.com

**Documentation**:
- [ISMS Framework](./ISMS_FRAMEWORK.md)
- [Data Retention System](./DATA_RETENTION_SYSTEM.md)
- [GDPR Manager](../../src/components/admin/GDPRManager.tsx)

---

**Document Owner**: Privacy Officer
**Last Updated**: 2025-11-16
**Next Review**: 2026-05-16
