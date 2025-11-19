# HIPAA Audit Controls - Quick Start Guide

## 🚀 Quick Access

**Admin Dashboard**: Login at `/admin` → Click "HIPAA Audit Controls"

## 📊 Dashboard Overview

### Key Metrics (Top Cards)
- **Total PHI Accesses** - Count of all PHI operations
- **Unique Users** - Number of users who accessed PHI
- **Emergency Accesses** - Break-glass events count
- **Compliance Score** - Overall compliance percentage (target: ≥95%)

### Five Tabs
1. **Overview** - Recent activity summary
2. **PHI Access Log** - Complete access history
3. **Emergency Access** - Break-glass events
4. **Security Events** - Login attempts, password changes
5. **Audit Search** - Advanced filtering and search

## 🔍 Common Tasks

### View Recent PHI Access
1. Go to **Overview** tab
2. See last 10 PHI access events
3. Check compliance status (green badge = compliant)

### Search Specific User Activity
1. Click **Audit Search** tab
2. Select filters (user, date range, action type)
3. Click **Search Audit Logs**

### Export Compliance Report
1. Select date range (top right calendar)
2. Click **Export Report** button
3. Check **Compliance Reports** section for download

### Review Emergency Access
1. Click **Emergency Access** tab
2. Review justifications for each break-glass event
3. Verify all emergencies are legitimate

### Check for Suspicious Activity
- **Red alert banner** appears at dashboard top if detected
- Shows pattern type, affected user, risk level
- Click to expand for details

## 🚨 Alerts & Actions

### Suspicious Activity Detected
**What it means**: System detected unusual patterns
**What to do**:
1. Review the specific pattern (excessive access, multiple failures, etc.)
2. Check user's audit trail
3. Contact user/supervisor
4. Generate incident report if needed

### Low Compliance Score (<90%)
**What it means**: Too many non-compliant accesses
**What to do**:
1. Review non-compliant access events
2. Verify purpose of use is documented
3. Check minimum necessary access
4. Update user training if needed

### Tampered Audit Logs
**What it means**: Integrity check failed (CRITICAL)
**What to do**:
1. Immediately notify security team
2. Generate incident report
3. Investigate affected logs
4. Review backup integrity

## 🛠️ For Developers

### Log PHI Access
```typescript
import { hipaaAuditService } from '../services/hipaaAuditService';

await hipaaAuditService.logPHIAccess(
  patientId,
  'phi_access',
  'Patient chart review',
  ['encrypted_patient_data'],
  ['medical_history']
);
```

### Log Emergency Access
```typescript
await hipaaAuditService.logEmergencyAccess(
  patientId,
  'Life-threatening medical emergency',
  ['encrypted_patient_data']
);
```

### Log Data Export
```typescript
await hipaaAuditService.logDataExport(
  'backup',
  150,
  ['encrypted_patient_data'],
  'Annual backup',
  '/exports/backup.zip'
);
```

### Get Metrics
```typescript
const metrics = await hipaaAuditService.getHIPAAMetrics(
  '2024-01-01',
  '2024-12-31'
);
console.log(`Compliance: ${metrics.compliance_score}%`);
```

## 📋 Compliance Checklist

### Daily
- [ ] Check dashboard for alerts
- [ ] Review suspicious activity (if any)
- [ ] Verify compliance score >95%

### Weekly
- [ ] Review emergency accesses
- [ ] Check security events
- [ ] Export weekly report

### Monthly
- [ ] Generate comprehensive audit report
- [ ] Review compliance metrics trend
- [ ] Update procedures if needed

### Quarterly
- [ ] Run integrity verification
- [ ] Conduct comprehensive audit review
- [ ] Update compliance documentation

## 📞 Support

**Documentation**: `docs/compliance/HIPAA_AUDIT_CONTROLS.md`
**Issues**: Check troubleshooting section in full docs
**Questions**: Contact security/compliance team

## 🎯 Best Practices

✅ **Always document** purpose of PHI access
✅ **Use emergency access** only for true emergencies
✅ **Review alerts** immediately when received
✅ **Generate reports** regularly for compliance review
✅ **Verify integrity** periodically (monthly recommended)

## 🚫 Common Mistakes

❌ Not documenting purpose of PHI access
❌ Using emergency access for non-emergencies
❌ Ignoring suspicious activity alerts
❌ Not reviewing audit logs regularly
❌ Forgetting to generate compliance reports

---

**Quick Reference Version**: 1.0
**Last Updated**: November 19, 2024
