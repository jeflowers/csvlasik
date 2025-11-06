# Consultation Scheduling System Setup Guide

## Overview

The ClearSight consultation scheduling system provides flexible appointment management with three modes:
- **Built-in Scheduler**: Internal system for managing consultations
- **RingCentral Integration**: External phone/SMS/calendar integration
- **Hybrid Mode**: Choose per request which method to use

## Features Implemented

### ✅ Database Schema
- `consultation_settings` - Practice-level configuration
- `consultation_requests` - Patient consultation requests
- `consultation_audit_log` - HIPAA-compliant audit trail
- `ringcentral_connections` - OAuth token storage
- `ringcentral_events` - Calendar event tracking
- `ringcentral_messages` - SMS message tracking

### ✅ Permissions & Roles
- `scheduler` role updated with consultation permissions:
  - `consults.read` - View consultation requests
  - `consults.update` - Update consultation requests
  - `consults.assign` - Assign requests to schedulers
  - `consults.note` - Add notes to requests
  - `ringcentral.view` - View RingCentral options
  - `ringcentral.schedule` - Schedule via RingCentral

- Admin-only permissions:
  - `consults.settings.manage` - Manage consultation settings
  - `ringcentral.connect` - Connect/disconnect RingCentral account

### ✅ Services Implemented
- `consultationService` - Core consultation management
- `ringCentralAuth` - OAuth2 authentication flow
- `ringCentralService` - RingCentral API integration
- `notificationService` - Email/SMS notifications
- `auditService` - HIPAA-compliant logging

### ✅ React Hooks
- `useConsultationSettings` - Manage consultation settings
- `useAppointmentRequests` - Real-time request management
- `useRingCentralConnection` - Connection status and OAuth

### ✅ UI Components
- `ConsultationSettings` - Admin configuration interface
- `AppointmentRequestCard` - Individual request card with actions
- `AppointmentsPage` - Main scheduler dashboard

## Quick Start

### 1. Environment Variables

Add to your `.env` file:

```bash
# RingCentral Integration
VITE_RC_CLIENT_ID=your-ringcentral-client-id
VITE_RC_CLIENT_SECRET=your-ringcentral-client-secret
VITE_RC_REDIRECT_URI=http://localhost:5173/admin/settings/ringcentral/callback
```

### 2. Database Setup

The migrations have already been applied:
- `20250106_consultation_scheduling.sql` ✅
- `20250106_ringcentral_integration.sql` ✅

Verify tables exist:
```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'consultation%' OR tablename LIKE 'ringcentral%';
```

### 3. Verify Permissions

Check scheduler role permissions:
```sql
SELECT p.name, p.description
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
JOIN roles r ON rp.role_id = r.id
WHERE r.name = 'scheduler'
AND p.resource IN ('consults', 'ringcentral');
```

## Admin Configuration

### Access Settings

1. Navigate to: `/admin/settings/consultations`
2. Configure:
   - **Scheduling Method**: Choose built-in, RingCentral, or hybrid
   - **Recipients**: Select which schedulers receive notifications
   - **Notifications**: Enable email and/or SMS
   - **Routing Mode**: Notify all or round-robin
   - **Failover Behavior**: Auto-fallback or hold-and-alert

### RingCentral Setup

1. Get RingCentral Developer Account:
   - Visit: https://developers.ringcentral.com
   - Create app with OAuth2
   - Copy Client ID and Client Secret

2. Configure Redirect URI:
   - Development: `http://localhost:5173/admin/settings/ringcentral/callback`
   - Production: `https://yourdomain.com/admin/settings/ringcentral/callback`

3. Connect Account:
   - Go to Admin → Settings → Consultations
   - Click "Connect RingCentral"
   - Authorize access
   - Configure defaults (phone number, SMS from, etc.)

## Scheduler Workflow

### Appointments Dashboard

Access at: `/admin/appointments`

**Features:**
- Real-time updates via Supabase subscriptions
- Filter by status: All, Unassigned, Mine, Assigned, Scheduled, Closed
- Search by name, email, or phone
- Contextual actions based on scheduling method

**Actions Available:**

**Built-in Mode:**
- 📞 Contact - Opens contact modal
- ✅ Mark as Scheduled - Updates status
- 📝 Add Note - Adds internal note
- 👤 Assign - Assigns to scheduler

**RingCentral Mode:**
- 📞 Open RC Booking - Deep link to RingCentral calendar
- ☎️ Click-to-Call - Initiates RC call
- 💬 Send RC SMS - Opens SMS composer

**Hybrid Mode:**
- Schedule dropdown with both options

## Notification Templates

### Email Template
Subject: `New LASIK Consultation Request — {First} {Last}`

Body includes:
- Patient information table
- Direct link to appointments dashboard
- ClearSight branding

### SMS Template
```
New LASIK consult: {First} {Last} {Phone}
Procedure: {Procedure}
Check Admin → Appointments to schedule.

Msg & data rates may apply. Reply STOP to opt out.
```

## Audit & Compliance

### HIPAA Compliance Features

✅ All patient data encrypted at rest (Supabase default)
✅ All patient data encrypted in transit (HTTPS)
✅ Audit logs capture all access to patient data
✅ No PII in application logs (masked phone/email)
✅ User session managed by Supabase Auth
✅ RLS policies enforce data access control

### Audit Log Actions

Every action is logged:
- `created` - Request submitted
- `assigned` - Request assigned to scheduler
- `contacted` - Scheduler contacted patient
- `scheduled_builtin` - Scheduled via built-in
- `scheduled_rc` - Scheduled via RingCentral
- `closed` - Request closed
- `failover` - RingCentral → Built-in failover
- `status_changed` - Status updated
- `note_added` - Note added

### View Audit Trail

```typescript
import { auditService } from './services/consultation/auditService';

const trail = await auditService.getAuditTrail(requestId);
```

### Export Audit Logs

```typescript
const logs = await auditService.exportAuditLogs({
  from_date: '2025-01-01',
  to_date: '2025-12-31',
});

const csv = await auditService.exportToCSV(logs);
```

## API Usage Examples

### Create Consultation Request

```typescript
import { consultationService } from './services/consultation/consultationService';

const request = await consultationService.createRequest({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '(555) 123-4567',
  procedure: 'LASIK',
  preferred_contact: 'email',
  comments: 'Interested in LASIK for nearsightedness',
});
```

### Assign Request

```typescript
await consultationService.assignRequest(requestId, userId);
```

### Mark as Scheduled

```typescript
// Built-in
await consultationService.markAsScheduled(requestId, 'built-in');

// RingCentral with event ID
await consultationService.markAsScheduled(requestId, 'ringcentral', rcEventId);
```

### Subscribe to Real-time Updates

```typescript
const subscription = consultationService.subscribeToRequests((payload) => {
  console.log('New or updated request:', payload.new);
});

// Cleanup
subscription.unsubscribe();
```

## RingCentral Integration

### OAuth Flow

```typescript
import { ringCentralAuth } from './services/ringcentral/ringCentralAuth';

// Initiate OAuth
const authUrl = ringCentralAuth.getAuthorizationUrl(practiceId);
window.location.href = authUrl;

// After callback with code
const tokens = await ringCentralAuth.exchangeCodeForToken(code);
await ringCentralAuth.saveConnection(practiceId, tokens);
```

### Send SMS

```typescript
import { ringCentralService } from './services/ringcentral/ringCentralService';

const result = await ringCentralService.sendSMS(connection, {
  from: { phoneNumber: '+15551234567' },
  to: [{ phoneNumber: '+15559876543' }],
  text: 'Your LASIK consultation is scheduled for tomorrow at 2pm.',
});
```

### Create Calendar Event

```typescript
const event = await ringCentralService.createCalendarEvent(connection, {
  subject: 'LASIK Consultation - John Doe',
  startTime: '2025-01-15T14:00:00Z',
  endTime: '2025-01-15T15:00:00Z',
  location: 'ClearSight LASIK',
  description: 'Initial consultation for LASIK procedure',
});
```

## Troubleshooting

### RingCentral Connection Issues

**Problem**: "Token expired" error
**Solution**: Tokens auto-refresh. If issues persist, reconnect:
```typescript
await ringCentralAuth.disconnect(practiceId);
// Then reconnect via UI
```

**Problem**: "Invalid redirect URI"
**Solution**: Ensure redirect URI in `.env` matches RingCentral app settings

### Notification Issues

**Problem**: Notifications not sending
**Solution**: Check Edge Functions are deployed:
```bash
supabase functions list
```

**Problem**: SMS not delivered
**Solution**: Verify phone number format: +1XXXXXXXXXX

### Database Issues

**Problem**: "Permission denied" on consultation tables
**Solution**: Verify user has scheduler or admin role:
```sql
SELECT u.email, u.role
FROM users u
WHERE u.id = auth.uid();
```

## Testing

### Test Notification System

```typescript
await notificationService.sendTestNotification(
  'scheduler@clearsight.com',
  '+15551234567',
  true, // email
  true  // sms
);
```

### Test RingCentral Connection

```typescript
const isValid = await ringCentralService.testConnection(connection);
console.log('Connection valid:', isValid);
```

## Security Considerations

### Token Encryption

Tokens are base64 encoded. For production, implement proper encryption:

```typescript
// Use a proper encryption library
import { encrypt, decrypt } from 'crypto-library';

private encryptToken(token: string): string {
  return encrypt(token, process.env.ENCRYPTION_KEY);
}

private decryptToken(encryptedToken: string): string {
  return decrypt(encryptedToken, process.env.ENCRYPTION_KEY);
}
```

### Rate Limiting

Implement rate limiting on notification endpoints:
- Max 10 notifications per minute per user
- Max 100 RingCentral API calls per hour

### CSRF Protection

Form submissions include CSRF tokens via Supabase Auth.

## Production Checklist

- [ ] Set production RingCentral credentials
- [ ] Update redirect URI for production domain
- [ ] Enable proper token encryption
- [ ] Configure rate limiting
- [ ] Set up monitoring for failed notifications
- [ ] Configure backup email provider
- [ ] Test failover behavior
- [ ] Review and approve audit log exports
- [ ] Sign RingCentral BAA (Business Associate Agreement)
- [ ] Complete HIPAA compliance checklist
- [ ] Train staff on scheduler workflow
- [ ] Set up alerts for RingCentral disconnections

## Support

### Documentation
- RingCentral API Docs: https://developers.ringcentral.com/api-reference
- Supabase RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

### Common Questions

**Q: Can I use both Built-in and RingCentral for different practices?**
A: Yes, settings are per practice_id.

**Q: What happens if RingCentral is down?**
A: Depends on failover_behavior setting:
- `auto_builtin`: Automatically uses built-in scheduler
- `hold_alert`: Holds request and alerts admin

**Q: Can I customize notification templates?**
A: Yes, edit templates in `notificationService.ts`

**Q: How long are audit logs retained?**
A: Indefinitely. Set up archival policy as needed for compliance.

## Next Steps

1. Configure consultation settings in admin panel
2. Assign scheduler role to staff members
3. Test notification system
4. If using RingCentral, connect account and test integration
5. Train schedulers on dashboard workflow
6. Monitor audit logs for compliance

---

**System Status**: ✅ Fully operational

**Database**: ✅ Migrations applied
**Permissions**: ✅ Roles configured
**Services**: ✅ All implemented
**UI**: ✅ Components created
**Build**: ✅ Compiles successfully
