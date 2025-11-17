# Privacy Policy Management System

## Overview

Comprehensive multi-language privacy policy system with version control, user acknowledgment tracking, and database integration tailored to ClearSight Vision Center's healthcare services.

---

## Key Features

### Multi-Language Support
- **11 Languages**: English, Spanish (Mexico), Japanese, Chinese, Korean, Arabic, Hebrew, Armenian, Portuguese (Brazil), Tagalog, Vietnamese
- **Structured JSON**: Easy to update and translate
- **Translation Status**: Tracks automated vs. professional translations
- **Fallback System**: Shows English if translation unavailable

### Version Control
- **Database-driven**: All versions stored in database
- **Change Tracking**: Summary of changes per version
- **Effective Dates**: Version activation dates
- **Reacknowledgment**: Flag for material changes requiring re-consent

### User Acknowledgment
- **Tracking**: Records when users acknowledge policy
- **Audit Trail**: IP address, user agent, timestamp
- **Version Linking**: Links acknowledgment to specific version
- **Analytics**: Tracks policy views and interactions

### Healthcare Compliance
- **HIPAA**: Protected Health Information (PHI) handling
- **GDPR**: European privacy requirements
- **CCPA**: California consumer privacy rights
- **Multi-Jurisdictional**: International data transfer safeguards

---

## Database Schema

### privacy_policy_versions
Version control for policies

```sql
id                        uuid PRIMARY KEY
version_number            text UNIQUE (1.0, 2.0, etc.)
effective_date            date
is_current                boolean
requires_reacknowledgment boolean
change_summary            text
created_at                timestamptz
```

**Example**:
```sql
INSERT INTO privacy_policy_versions
(version_number, effective_date, is_current, requires_reacknowledgment, change_summary)
VALUES
('1.0', CURRENT_DATE, true, false, 'Initial privacy policy version');
```

### privacy_policy_content
Multi-language policy content

```sql
id              uuid PRIMARY KEY
version_id      uuid REFERENCES privacy_policy_versions
language_code   text (en, es-MX, ja, zh, ko, ar, he, hy, pt-BR, tl, vi)
title           text
content         text (markdown format)
last_updated    timestamptz
updated_by      uuid REFERENCES auth.users
```

**Unique Constraint**: (version_id, language_code)

### privacy_policy_sections
Structured policy sections for granular updates

```sql
id              uuid PRIMARY KEY
content_id      uuid REFERENCES privacy_policy_content
section_key     text (collection, usage, rights, etc.)
section_title   text
section_content text
display_order   integer
created_at      timestamptz
```

**Example**:
```sql
INSERT INTO privacy_policy_sections
(content_id, section_key, section_title, section_content, display_order)
VALUES
(content_id, 'collection', '1. Information We Collect', 'We collect...', 1);
```

### user_policy_acknowledgments
Track user acceptance

```sql
id                uuid PRIMARY KEY
user_identifier   text (email or anonymous ID)
version_id        uuid REFERENCES privacy_policy_versions
acknowledged_at   timestamptz
ip_address        inet
user_agent        text
```

---

## Privacy Policy Content

### Tailored to ClearSight Vision Center

The privacy policy covers:

**Healthcare Services**:
- Eye examinations and treatments
- LASIK, PRK, and ICL procedures
- Medical record management
- Insurance and billing
- Prescription fulfillment

**Website Services**:
- Online appointment scheduling
- Patient portal access
- Educational content
- Multi-language support
- Contact forms

**Data Types Collected**:
- **Personal**: Name, DOB, gender, contact info
- **Health**: Medical history, exam results, prescriptions
- **Financial**: Payment details, insurance info
- **Technical**: IP address, browser, device info
- **Usage**: Page views, interactions, preferences

### 14 Comprehensive Sections

1. **Information We Collect**
   - Personal and health information
   - Protected Health Information (PHI)
   - Technical and usage data

2. **How We Use Your Information**
   - Healthcare services
   - Website improvement
   - Marketing communications
   - Legal compliance

3. **Legal Basis for Processing (GDPR)**
   - Consent
   - Contract performance
   - Legal obligations
   - Legitimate interests
   - Vital interests

4. **Sharing Your Information**
   - Healthcare providers
   - Service providers
   - Legal requirements
   - NO SALE guarantee

5. **Data Retention**
   - Medical records: 7+ years
   - Financial: 7 years
   - Marketing: Until withdrawal
   - Analytics: 26 months
   - Logs: 90 days

6. **Your Privacy Rights**
   - Access, correction, deletion
   - Restriction, portability
   - Withdraw consent
   - HIPAA rights to medical records

7. **Cookies and Tracking**
   - Necessary, Analytics, Marketing, Functional
   - Cookie management options
   - Third-party cookies

8. **Data Security**
   - 256-bit encryption
   - HIPAA Security Rule compliance
   - Multi-factor authentication
   - Physical safeguards

9. **Children's Privacy**
   - Not directed to under 13
   - Parental consent for minors

10. **International Data Transfers**
    - US data storage
    - Standard Contractual Clauses (SCCs)
    - Adequate safeguards

11. **HIPAA Compliance**
    - Notice of Privacy Practices
    - Patient rights under HIPAA
    - Complaint procedures

12. **California Privacy Rights (CCPA)**
    - Right to Know, Delete, Opt-Out
    - Non-discrimination
    - Verification procedures

13. **Changes to Privacy Policy**
    - Notification methods
    - Effective date updates
    - Material change consent

14. **Contact Information**
    - Privacy Officer
    - Data Protection Officer (DPO)
    - HHS Office for Civil Rights

---

## File Structure

### JSON Files (per language)

Location: `/public/locales/{language}/privacy.json`

**Structure**:
```json
{
  "_meta": {
    "language": "en",
    "translationStatus": "complete",
    "requiresProfessionalTranslation": false,
    "baseVersion": "1.0"
  },
  "meta": {
    "title": "Privacy Policy - ClearSight Vision Center",
    "lastUpdated": "November 16, 2025",
    "effectiveDate": "November 16, 2025",
    "version": "1.0"
  },
  "introduction": "Welcome to ClearSight Vision Center...",
  "agreement": "By using our website...",
  "tableOfContents": { ... },
  "sections": {
    "collection": { ... },
    "usage": { ... },
    "legalBasis": { ... },
    ...
  }
}
```

### Language Files Created

- ✅ English (en) - Complete
- ⚠️ Spanish-MX (es-MX) - Awaiting professional translation
- ⚠️ Japanese (ja) - Awaiting professional translation
- ⚠️ Chinese (zh) - Awaiting professional translation
- ⚠️ Korean (ko) - Awaiting professional translation
- ⚠️ Arabic (ar) - Awaiting professional translation
- ⚠️ Hebrew (he) - Awaiting professional translation
- ⚠️ Armenian (hy) - Awaiting professional translation
- ⚠️ Portuguese-BR (pt-BR) - Awaiting professional translation
- ⚠️ Tagalog (tl) - Awaiting professional translation
- ⚠️ Vietnamese (vi) - Awaiting professional translation

**Note**: Non-English versions include translation notice and reference English for legal accuracy.

---

## Helper Functions

### get_current_privacy_policy(language_code)
**Returns**: Current policy for specified language

```sql
SELECT * FROM get_current_privacy_policy('en');
```

**Output**:
- version_number
- effective_date
- title
- content (full text)
- sections (JSONB array)

**Use**: Load current policy in user's language

### has_user_acknowledged_current_policy(user_identifier)
**Returns**: Boolean - whether user has acknowledged current version

```sql
SELECT has_user_acknowledged_current_policy('user@example.com');
```

**Use**: Check if user needs to re-acknowledge policy

---

## User Interface

### PrivacyPolicyPage Component

**Features**:
- Responsive design
- Section navigation
- Table of contents
- Translation notice (non-English)
- Version information
- Action buttons (Manage Preferences, Export Data, Contact)

**Analytics Integration**:
- Logs policy views
- Tracks section interactions
- Records acknowledgments

**Path**: `/privacy-policy`

**Usage**:
```tsx
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
```

### Integration with Consent Banner

Link from cookie banner:
```tsx
<a href="/privacy-policy">Learn more about our privacy practices</a>
```

---

## Updating the Privacy Policy

### Process for Updates

**1. Create New Version**:
```sql
INSERT INTO privacy_policy_versions
(version_number, effective_date, is_current, requires_reacknowledgment, change_summary)
VALUES
('2.0', '2026-01-01', false, true, 'Updated data retention periods and added new cookie categories');
```

**2. Update JSON Files**:
- Modify `/public/locales/en/privacy.json`
- Update `meta.version` and `meta.lastUpdated`
- Make content changes
- Document changes in summary

**3. Professional Translation**:
- Send updated English to translation service
- Update all language files
- Mark as professionally translated
- Set `requiresProfessionalTranslation: false`

**4. Activate New Version**:
```sql
-- Deactivate old version
UPDATE privacy_policy_versions SET is_current = false WHERE version_number = '1.0';

-- Activate new version
UPDATE privacy_policy_versions SET is_current = true WHERE version_number = '2.0';
```

**5. Notify Users** (if requires_reacknowledgment = true):
- Send email to all users
- Show banner on website
- Require new acknowledgment before service use

### Testing Updates

**1. Preview**: Test in staging environment
**2. Legal Review**: Have attorney review changes
**3. Translation QA**: Verify all translations accurate
**4. User Testing**: Test with sample users
**5. Go Live**: Activate on effective date

---

## Compliance Checklist

### Before Publishing

- [ ] Legal review completed
- [ ] All sections accurate and complete
- [ ] Contact information updated
- [ ] Effective date set appropriately
- [ ] Professional translations completed
- [ ] Links to other policies verified
- [ ] Cookie policy aligned
- [ ] HIPAA Notice of Privacy Practices consistent

### After Publishing

- [ ] Website updated
- [ ] Email notifications sent (if required)
- [ ] Staff trained on changes
- [ ] FAQ updated
- [ ] Compliance logs updated
- [ ] Audit trail verified

---

## Best Practices

### Content

**Be Clear and Concise**:
- Use simple language
- Avoid legal jargon
- Break into sections
- Use bullet points

**Be Comprehensive**:
- Cover all data types
- Explain all uses
- List all third parties
- Detail all rights

**Be Specific**:
- Name actual services (Google Analytics, not "analytics provider")
- Provide exact retention periods
- List specific rights and how to exercise them

### Translation

**Professional Quality**:
- Use certified medical translators
- Maintain legal accuracy
- Cultural appropriateness
- Technical terminology correct

**Consistency**:
- Use same terminology across languages
- Maintain structure
- Keep formatting consistent

### Maintenance

**Regular Reviews**:
- Quarterly: Check for needed updates
- Annually: Full legal review
- As Needed: Service changes, law changes

**Version Control**:
- Meaningful version numbers
- Clear change summaries
- Documented effective dates
- Archive old versions

---

## Legal Compliance

### HIPAA Requirements

**Privacy Rule** ✅:
- Notice of Privacy Practices provided
- Patient rights explained
- Uses and disclosures detailed
- Complaint procedures included

**Security Rule** ✅:
- Technical safeguards described
- Administrative safeguards outlined
- Physical safeguards documented

### GDPR Requirements

**Transparency** ✅:
- Clear language
- Easy to access
- Free of charge
- Complete information

**Legal Bases** ✅:
- Consent clearly requested
- Contractual necessity explained
- Legal obligations noted
- Legitimate interests detailed

**Individual Rights** ✅:
- Access, rectification, erasure
- Restriction, objection, portability
- Withdraw consent
- Lodge complaint

### CCPA Requirements

**Notice at Collection** ✅:
- Categories of info collected
- Purposes for use
- Third-party sharing
- No sale statement

**Consumer Rights** ✅:
- Right to know
- Right to delete
- Right to opt-out
- Non-discrimination

---

## Support and Resources

### Internal Resources

**Privacy Officer**: privacy@clearsightvision.com
**Legal Department**: legal@clearsightvision.com
**IT Security**: security@clearsightvision.com

### External Resources

**HHS HIPAA**:
- Website: www.hhs.gov/hipaa
- Phone: 1-877-696-6775
- Email: OCRPrivacy@hhs.gov

**GDPR Information**:
- Website: gdpr.eu
- EU Supervisory Authorities Directory

**CCPA Information**:
- Website: oag.ca.gov/privacy/ccpa
- California Attorney General

---

## Troubleshooting

### Policy not loading

**Check**:
1. JSON file exists in `/public/locales/{lang}/privacy.json`
2. JSON syntax valid
3. Language code matches exactly
4. Translation key paths correct

### Database version mismatch

**Check**:
1. Only one version marked `is_current = true`
2. Effective date is today or past
3. Content exists for current version
4. Language code correct

### User acknowledgment not recording

**Check**:
1. User identifier valid
2. Current version ID correct
3. Database permissions
4. Network connectivity

---

**Document Owner**: Privacy Officer / Legal Department
**Last Updated**: November 16, 2025
**Next Review**: May 16, 2026
