# Email Service Migration Plan
## From Resend to Postmark

**Project:** ClearSight Vision Email Infrastructure Upgrade
**Date Created:** December 3, 2025
**Status:** Planning

---

## OVERVIEW

This document outlines the technical migration plan from Resend to Postmark email service, including all steps, considerations, and rollback procedures.

---

## PRE-MIGRATION CHECKLIST

### 1. Postmark Account Setup
- [ ] Create Postmark account
- [ ] Verify business information
- [ ] Add billing information
- [ ] Generate API keys (development and production)
- [ ] Configure account settings

### 2. Domain Verification
- [ ] Add clearsightvision.com to Postmark
- [ ] Configure SPF record in DNS
- [ ] Configure DKIM record in DNS
- [ ] Configure DMARC record (optional but recommended)
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Verify domain in Postmark dashboard

**DNS Records to Add:**
```
SPF:   v=spf1 include:spf.mtasv.net ~all
DKIM:  [Provided by Postmark after domain addition]
DMARC: v=DMARC1; p=none; rua=mailto:postmaster@clearsightvision.com
```

### 3. Environment Preparation
- [ ] Create development Postmark account
- [ ] Generate test API keys
- [ ] Set up local development environment
- [ ] Configure Supabase Edge Function secrets
- [ ] Back up current email queue database
- [ ] Document current Resend configuration

---

## MIGRATION PHASES

### PHASE 1: Foundation (Week 1-2)

#### Objectives
- Set up Postmark infrastructure
- Create parallel email system
- Test basic email delivery

#### Tasks

**1.1 Postmark Configuration**
```typescript
// Add to Supabase Edge Function secrets
POSTMARK_API_KEY=your_production_key
POSTMARK_API_KEY_TEST=your_test_key
POSTMARK_FROM_EMAIL=noreply@clearsightvision.com
```

**1.2 Update Edge Function**
- [ ] Backup current `process-email-queue` function
- [ ] Install Postmark npm package in Edge Function
- [ ] Update API calls from Resend to Postmark
- [ ] Add error handling for Postmark-specific errors
- [ ] Test in development environment

**Current Resend Code:**
```typescript
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${resendApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: email.from_email,
    to: email.to_email,
    subject: email.subject,
    html: email.html_body,
    text: email.text_body,
  }),
});
```

**New Postmark Code:**
```typescript
const response = await fetch('https://api.postmarkapp.com/email', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Postmark-Server-Token': postmarkApiKey,
  },
  body: JSON.stringify({
    From: email.from_email || 'noreply@clearsightvision.com',
    To: email.to_email,
    Subject: email.subject,
    HtmlBody: email.html_body,
    TextBody: email.text_body,
    ReplyTo: email.reply_to,
    MessageStream: 'outbound', // or 'broadcasts'
    TrackOpens: true,
    TrackLinks: 'HtmlAndText',
  }),
});
```

**1.3 Testing**
- [ ] Send test emails to Gmail
- [ ] Send test emails to Outlook/Hotmail
- [ ] Send test emails to Yahoo
- [ ] Send test emails to custom domain
- [ ] Verify email delivery
- [ ] Check spam folder placement
- [ ] Verify email formatting
- [ ] Test reply-to functionality

**1.4 Parallel Running Setup**
- [ ] Create feature flag for email provider selection
- [ ] Configure percentage-based rollout (start at 10%)
- [ ] Set up monitoring for both providers
- [ ] Create comparison dashboard

**Deliverables:**
- ✅ Working Postmark integration in development
- ✅ Test results documented
- ✅ Parallel running capability implemented

---

### PHASE 2: Database Enhancement (Week 3-4)

#### Objectives
- Enhance email queue for better tracking
- Add delivery events table
- Implement webhook storage

#### Tasks

**2.1 Database Schema Updates**

Create migration: `20251210_enhance_email_queue.sql`

```sql
-- Add new columns to email_queue
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS message_stream text DEFAULT 'outbound';
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS postmark_message_id text;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS template_id bigint;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS template_model jsonb;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS track_opens boolean DEFAULT true;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS track_links boolean DEFAULT true;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_postmark_message_id
  ON email_queue(postmark_message_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_message_stream
  ON email_queue(message_stream);
```

**2.2 Email Delivery Events Table**

```sql
CREATE TABLE IF NOT EXISTS email_delivery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_queue_id uuid REFERENCES email_queue(id) ON DELETE CASCADE,
  postmark_message_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'delivered', 'opened', 'clicked', 'bounced',
    'spam_complaint', 'unsubscribed', 'delivery_delayed'
  )),
  recipient text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  event_timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_delivery_events_email_queue_id
  ON email_delivery_events(email_queue_id);
CREATE INDEX idx_delivery_events_postmark_message_id
  ON email_delivery_events(postmark_message_id);
CREATE INDEX idx_delivery_events_type
  ON email_delivery_events(event_type);
CREATE INDEX idx_delivery_events_timestamp
  ON email_delivery_events(event_timestamp DESC);

-- Enable RLS
ALTER TABLE email_delivery_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view delivery events"
  ON email_delivery_events
  FOR SELECT
  TO authenticated
  USING (true);
```

**2.3 Email Templates Table**

```sql
CREATE TABLE IF NOT EXISTS email_templates (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  subject_template text NOT NULL,
  html_template text NOT NULL,
  text_template text,
  template_model jsonb DEFAULT '{}'::jsonb,
  postmark_template_id bigint,
  message_stream text DEFAULT 'outbound',
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_email_templates_slug ON email_templates(slug);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates"
  ON email_templates
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

**2.4 Database Testing**
- [ ] Run migration in development
- [ ] Test all indexes
- [ ] Verify RLS policies
- [ ] Test insert/update/delete operations
- [ ] Check query performance

**Deliverables:**
- ✅ Enhanced database schema
- ✅ Delivery events tracking capability
- ✅ Template storage system

---

### PHASE 3: Webhook Integration (Week 3-4)

#### Objectives
- Receive real-time delivery updates
- Process bounces and spam complaints
- Update email queue status automatically

#### Tasks

**3.1 Create Webhook Edge Function**

Create: `supabase/functions/postmark-webhook/index.ts`

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.58.0';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface PostmarkWebhook {
  RecordType: string;
  MessageID: string;
  Recipient: string;
  DeliveredAt?: string;
  BouncedAt?: string;
  Details?: string;
  // ... other Postmark webhook fields
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify webhook signature (optional but recommended)
    // const signature = req.headers.get('X-Postmark-Signature');
    // if (!verifySignature(signature, body)) {
    //   return new Response('Invalid signature', { status: 401 });
    // }

    const webhook: PostmarkWebhook = await req.json();

    // Map Postmark event types to our event types
    const eventTypeMap: Record<string, string> = {
      'Delivery': 'delivered',
      'Bounce': 'bounced',
      'SpamComplaint': 'spam_complaint',
      'Open': 'opened',
      'Click': 'clicked',
      'SubscriptionChange': 'unsubscribed',
    };

    const eventType = eventTypeMap[webhook.RecordType] || webhook.RecordType.toLowerCase();

    // Store event
    await supabase
      .from('email_delivery_events')
      .insert({
        postmark_message_id: webhook.MessageID,
        event_type: eventType,
        recipient: webhook.Recipient,
        details: webhook,
        event_timestamp: webhook.DeliveredAt || webhook.BouncedAt || new Date().toISOString(),
      });

    // Update email queue status based on event
    if (eventType === 'delivered') {
      await supabase
        .from('email_queue')
        .update({ status: 'sent', sent_at: webhook.DeliveredAt })
        .eq('postmark_message_id', webhook.MessageID);
    } else if (eventType === 'bounced') {
      await supabase
        .from('email_queue')
        .update({
          status: 'failed',
          error_message: webhook.Details || 'Email bounced',
        })
        .eq('postmark_message_id', webhook.MessageID);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**3.2 Configure Postmark Webhooks**
- [ ] Deploy webhook Edge Function
- [ ] Get webhook URL from Supabase
- [ ] Add webhook URL to Postmark dashboard
- [ ] Configure webhook events to receive:
  - ✅ Delivery
  - ✅ Bounce
  - ✅ Spam Complaint
  - ✅ Open
  - ✅ Click
- [ ] Test webhook delivery with Postmark's test feature

**3.3 Webhook Testing**
- [ ] Send test email through system
- [ ] Verify delivery event received
- [ ] Verify database updated
- [ ] Test bounce handling (use bounce@simulator.postmarkapp.com)
- [ ] Test spam complaint handling
- [ ] Monitor webhook endpoint logs

**Deliverables:**
- ✅ Webhook receiver deployed and functional
- ✅ Real-time delivery tracking working
- ✅ Automatic status updates implemented

---

### PHASE 4: Template Management (Week 5-6)

#### Objectives
- Create admin UI for template management
- Migrate hardcoded templates to database
- Enable non-technical staff to edit templates

#### Tasks

**4.1 Admin UI Component**

Create: `src/components/admin/EmailTemplateEditor.tsx`

Key features:
- List all email templates
- Create new templates
- Edit existing templates
- Preview templates with sample data
- Test send functionality
- Version history
- Template variables documentation

**4.2 Migrate Existing Templates**

Current templates in `src/utils/emailTemplates.ts`:
- Appointment Confirmation
- Appointment Notification

Action items:
- [ ] Create database records for each template
- [ ] Copy HTML/text content to database
- [ ] Define template variables
- [ ] Test template rendering
- [ ] Update code to use database templates

**4.3 Template Rendering Service**

Create: `src/services/emailTemplateService.ts`

```typescript
export class EmailTemplateService {
  async renderTemplate(
    templateSlug: string,
    data: Record<string, any>
  ): Promise<{ subject: string; html: string; text: string }> {
    // Fetch template from database
    const template = await this.getTemplate(templateSlug);

    // Render with variable substitution
    const subject = this.replaceVariables(template.subject_template, data);
    const html = this.replaceVariables(template.html_template, data);
    const text = this.replaceVariables(template.text_template, data);

    return { subject, html, text };
  }

  private replaceVariables(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }
}
```

**Deliverables:**
- ✅ Template editor UI
- ✅ Templates migrated to database
- ✅ Template rendering working

---

### PHASE 5: Analytics Dashboard (Week 5-6)

#### Objectives
- Visualize email performance
- Track key metrics
- Identify delivery issues

#### Tasks

**5.1 Create Analytics Queries**

```sql
-- Email volume by day
CREATE OR REPLACE FUNCTION get_email_volume_stats(
  start_date timestamptz,
  end_date timestamptz
)
RETURNS TABLE (
  date date,
  total_sent bigint,
  total_delivered bigint,
  total_bounced bigint,
  total_opened bigint,
  total_clicked bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(eq.created_at) as date,
    COUNT(*)::bigint as total_sent,
    COUNT(*) FILTER (WHERE eq.status = 'sent')::bigint as total_delivered,
    COUNT(DISTINCT ede.id) FILTER (WHERE ede.event_type = 'bounced')::bigint as total_bounced,
    COUNT(DISTINCT ede.id) FILTER (WHERE ede.event_type = 'opened')::bigint as total_opened,
    COUNT(DISTINCT ede.id) FILTER (WHERE ede.event_type = 'clicked')::bigint as total_clicked
  FROM email_queue eq
  LEFT JOIN email_delivery_events ede ON ede.email_queue_id = eq.id
  WHERE eq.created_at BETWEEN start_date AND end_date
  GROUP BY DATE(eq.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;
```

**5.2 Admin Dashboard Component**

Create: `src/components/admin/EmailAnalyticsDashboard.tsx`

Display:
- Total emails sent (last 30 days)
- Delivery rate %
- Open rate %
- Click rate %
- Bounce rate %
- Recent bounces list
- Email volume chart
- Top performing templates

**5.3 Real-time Metrics**
- [ ] Create dashboard queries
- [ ] Build visualization components
- [ ] Add date range filters
- [ ] Implement export to CSV
- [ ] Set up automatic refresh

**Deliverables:**
- ✅ Analytics dashboard live
- ✅ Key metrics tracked
- ✅ Historical data accessible

---

### PHASE 6: Enhanced Features (Week 6-7)

#### Objectives
- Add scheduling capability
- Implement preference center
- Create unsubscribe management

#### Tasks

**6.1 Email Scheduling**

Update email queue to support future scheduling:
```typescript
await emailService.queueEmail({
  to: 'patient@example.com',
  subject: 'Appointment Reminder',
  htmlBody: html,
  scheduledFor: new Date('2025-12-15T09:00:00Z'), // Send in future
});
```

**6.2 Preference Center**

Create table:
```sql
CREATE TABLE email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  appointment_reminders boolean DEFAULT true,
  marketing_emails boolean DEFAULT true,
  newsletter boolean DEFAULT true,
  unsubscribed_all boolean DEFAULT false,
  unsubscribe_token text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**6.3 Unsubscribe Management**
- [ ] Generate unsubscribe tokens
- [ ] Create unsubscribe page
- [ ] Add unsubscribe links to all marketing emails
- [ ] Honor unsubscribe preferences in queue processing
- [ ] Create resubscribe workflow

**Deliverables:**
- ✅ Scheduling working
- ✅ Preference center live
- ✅ Unsubscribe system functional

---

### PHASE 7: Testing & Launch (Week 7-8)

#### Objectives
- Comprehensive testing
- Staff training
- Production go-live

#### Tasks

**7.1 Testing Checklist**

Email Client Testing:
- [ ] Gmail (Desktop)
- [ ] Gmail (Mobile)
- [ ] Outlook (Desktop)
- [ ] Outlook (Mobile)
- [ ] Apple Mail (macOS)
- [ ] Apple Mail (iOS)
- [ ] Yahoo Mail
- [ ] ProtonMail
- [ ] Custom domains

Functionality Testing:
- [ ] Send single email
- [ ] Send bulk emails (100+)
- [ ] Email scheduling
- [ ] Template rendering
- [ ] Webhook processing
- [ ] Bounce handling
- [ ] Unsubscribe links
- [ ] Preference center
- [ ] Analytics dashboard

Performance Testing:
- [ ] Load test with 1,000 emails
- [ ] Concurrent sending
- [ ] Database query performance
- [ ] Webhook processing speed

**7.2 Deliverability Testing**

Use Mail-Tester.com:
- [ ] Send test email to provided address
- [ ] Check spam score (target: 9/10 or higher)
- [ ] Verify SPF/DKIM/DMARC
- [ ] Check blacklist status
- [ ] Review HTML/text quality

**7.3 Staff Training**

Topics:
- How to view email queue
- How to edit email templates
- How to view analytics
- How to handle bounces
- How to export reports
- Troubleshooting common issues

**7.4 Production Cutover**

- [ ] Increase Postmark percentage to 50%
- [ ] Monitor for 48 hours
- [ ] Increase to 100% if no issues
- [ ] Disable Resend integration
- [ ] Remove Resend API keys from environment
- [ ] Update documentation
- [ ] Announce completion to team

**Deliverables:**
- ✅ All testing passed
- ✅ Staff trained
- ✅ Production live on Postmark
- ✅ Resend decommissioned

---

## ROLLBACK PROCEDURE

If critical issues occur, follow this rollback procedure:

### Immediate Rollback (< 1 hour)

1. **Switch back to Resend**
   ```typescript
   // In Edge Function, set feature flag
   const USE_POSTMARK = false;
   ```

2. **Deploy updated Edge Function**
   ```bash
   supabase functions deploy process-email-queue
   ```

3. **Verify emails sending via Resend**

4. **Investigate Postmark issues**

### Partial Rollback

- Reduce Postmark percentage (100% → 50% → 10%)
- Monitor specific email types
- Identify and fix root cause
- Gradually increase percentage again

### Data Recovery

- All emails in queue table (preserved)
- Webhook events in delivery_events table (preserved)
- Can resend failed emails via admin dashboard

---

## MONITORING & ALERTS

### Key Metrics to Monitor

1. **Email Delivery Rate**
   - Target: >99%
   - Alert if: <95%

2. **Bounce Rate**
   - Target: <2%
   - Alert if: >5%

3. **Spam Complaint Rate**
   - Target: <0.1%
   - Alert if: >0.5%

4. **Email Queue Size**
   - Target: <100 pending
   - Alert if: >500 pending

5. **Webhook Processing Delay**
   - Target: <5 seconds
   - Alert if: >30 seconds

### Alert Channels

- Email to admin@clearsightvision.com
- Slack notification (if integrated)
- Dashboard warning banner

---

## POST-MIGRATION TASKS

### Week 1 After Go-Live
- [ ] Monitor dashboard daily
- [ ] Review bounce reports
- [ ] Check deliverability scores
- [ ] Verify all automations working
- [ ] Collect staff feedback

### Week 2-4 After Go-Live
- [ ] Analyze open/click rates
- [ ] Optimize email templates
- [ ] Review and improve subject lines
- [ ] Set up additional automations
- [ ] Create monthly report template

### Month 2-3
- [ ] Conduct staff survey on new system
- [ ] Identify additional features needed
- [ ] Optimize database queries
- [ ] Review and update documentation
- [ ] Plan next enhancements

---

## SUCCESS CRITERIA

Migration is considered successful when:

✅ 100% of emails sending via Postmark
✅ Zero critical errors in production
✅ Delivery rate maintained or improved
✅ Staff trained and confident using new features
✅ All templates migrated and tested
✅ Analytics dashboard providing insights
✅ Webhooks processing successfully
✅ Documentation complete and accurate

---

## CONTACTS & RESOURCES

### Postmark Support
- **Email:** support@postmarkapp.com
- **Documentation:** https://postmarkapp.com/developer
- **Status Page:** https://status.postmarkapp.com

### Supabase Support
- **Documentation:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com
- **Status Page:** https://status.supabase.com

### Internal Contacts
- **Project Lead:** [Your Name]
- **Technical Lead:** [Developer Name]
- **Practice Manager:** [Manager Name]

---

**Document Version:** 1.0
**Last Updated:** December 3, 2025
**Next Review:** After Phase 3 completion
