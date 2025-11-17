-- Privacy Policy Content for ClearSight Vision Center
-- Version 1.0 - All Supported Languages

-- Get the version ID
DO $$
DECLARE
  v_version_id uuid;
  v_content_en_id uuid;
  v_content_es_id uuid;
  v_content_ja_id uuid;
  v_content_zh_id uuid;
  v_content_ko_id uuid;
  v_content_ar_id uuid;
  v_content_he_id uuid;
  v_content_hy_id uuid;
  v_content_pt_id uuid;
  v_content_tl_id uuid;
  v_content_vi_id uuid;
BEGIN
  -- Get version ID
  SELECT id INTO v_version_id FROM privacy_policy_versions WHERE version_number = '1.0';

  -- ===========================================================================
  -- ENGLISH (en)
  -- ===========================================================================
  INSERT INTO privacy_policy_content (version_id, language_code, title, content)
  VALUES (
    v_version_id,
    'en',
    'Privacy Policy - ClearSight Vision Center',
    '# Privacy Policy

**Last Updated:** ' || TO_CHAR(CURRENT_DATE, 'Month DD, YYYY') || '
**Effective Date:** ' || TO_CHAR(CURRENT_DATE, 'Month DD, YYYY') || '

## Introduction

Welcome to ClearSight Vision Center. We are committed to protecting your privacy and ensuring the security of your personal health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.

By using our website or services, you agree to the collection and use of information in accordance with this policy.

---

## Table of Contents

1. Information We Collect
2. How We Use Your Information
3. Legal Basis for Processing (GDPR)
4. Sharing Your Information
5. Data Retention
6. Your Privacy Rights
7. Cookies and Tracking Technologies
8. Data Security
9. Children''s Privacy
10. International Data Transfers
11. HIPAA Compliance
12. California Privacy Rights (CCPA)
13. Changes to This Privacy Policy
14. Contact Us

---

## 1. Information We Collect

### Personal Information
We may collect the following types of personal information:

- **Identification Information:** Name, date of birth, gender
- **Contact Information:** Address, email, phone number
- **Health Information:** Medical history, eye exam results, prescription information, insurance details
- **Financial Information:** Payment card details, billing address
- **Technical Information:** IP address, browser type, device information
- **Usage Data:** Pages visited, time spent on site, referral sources

### Protected Health Information (PHI)
As a healthcare provider, we collect Protected Health Information as defined by HIPAA, including:
- Medical records and clinical notes
- Diagnostic test results
- Treatment plans and prescriptions
- Insurance and billing information
- Communications regarding your care

---

## 2. How We Use Your Information

We use your information for the following purposes:

### Healthcare Services
- Providing eye care services and treatments
- Scheduling and managing appointments
- Maintaining medical records
- Processing insurance claims and payments
- Communicating about your care and treatment

### Website and Service Improvement
- Improving our website functionality
- Analyzing usage patterns
- Personalizing your experience
- Responding to inquiries and support requests

### Marketing and Communication
- Sending appointment reminders
- Providing educational materials about eye health
- Notifying you about new services or promotions
- Sending newsletters (with your consent)

### Legal and Compliance
- Complying with legal obligations
- Protecting our legal rights
- Preventing fraud and abuse
- Ensuring patient safety

---

## 3. Legal Basis for Processing (GDPR)

For users in the European Economic Area (EEA), we process your personal data under the following legal bases:

- **Consent:** You have given explicit consent for specific purposes
- **Contract:** Processing is necessary to perform our services
- **Legal Obligation:** Required by law (HIPAA, medical records retention)
- **Legitimate Interest:** For our business operations, fraud prevention, and security
- **Vital Interest:** To protect your life or health in emergency situations

---

## 4. Sharing Your Information

We may share your information with:

### Healthcare Providers
- Referring physicians and specialists
- Laboratory and diagnostic services
- Insurance companies for claims processing
- Pharmacies for prescription fulfillment

### Service Providers
- Cloud storage and IT services
- Payment processors
- Appointment scheduling systems
- Email and communication platforms
- Analytics providers

### Legal Requirements
- Law enforcement and regulatory agencies when required by law
- Court orders and legal proceedings
- Public health authorities
- Protection of rights and safety

**We do not sell your personal information to third parties.**

---

## 5. Data Retention

We retain your information for the following periods:

- **Medical Records:** Minimum 7 years from last visit (longer if required by state law)
- **Financial Records:** 7 years for tax and accounting purposes
- **Marketing Consent:** Until you withdraw consent
- **Website Analytics:** 26 months
- **Security Logs:** 90 days

You may request deletion of your information subject to legal retention requirements.

---

## 6. Your Privacy Rights

You have the following rights regarding your personal information:

### General Rights
- **Access:** Request a copy of your information
- **Correction:** Request corrections to inaccurate information
- **Deletion:** Request deletion of your information (subject to legal requirements)
- **Restriction:** Request limitation of processing
- **Objection:** Object to certain types of processing
- **Portability:** Receive your data in a machine-readable format
- **Withdraw Consent:** Withdraw consent at any time

### HIPAA Rights
- Right to access your medical records
- Right to request amendments to your records
- Right to an accounting of disclosures
- Right to request restrictions on uses and disclosures
- Right to request confidential communications
- Right to a paper copy of this notice

### How to Exercise Your Rights
Contact our Privacy Officer:
- Email: privacy@clearsightvision.com
- Phone: [Practice Phone Number]
- Mail: [Practice Address]

We will respond to your request within 30 days (45 days for GDPR requests).

---

## 7. Cookies and Tracking Technologies

We use cookies and similar technologies to enhance your experience:

### Types of Cookies We Use

**Necessary Cookies** (Required)
- Session management
- Security features
- Authentication
- Form functionality

**Analytics Cookies** (Optional)
- Google Analytics: Usage statistics and patterns
- Heatmap tracking: User interaction analysis
- Performance monitoring

**Marketing Cookies** (Optional)
- Facebook Pixel: Ad campaign tracking
- Google Ads: Remarketing
- Email tracking: Newsletter engagement

**Functional Cookies** (Optional)
- Language preferences
- Accessibility settings
- User interface customization

### Managing Cookies
You can control cookies through:
- Our Cookie Preference Center
- Browser settings
- Third-party opt-out tools

For more information, see our [Cookie Policy](#).

---

## 8. Data Security

We implement comprehensive security measures:

### Technical Safeguards
- 256-bit SSL/TLS encryption for data transmission
- AES-256 encryption for data at rest
- Firewall protection and intrusion detection
- Regular security audits and penetration testing
- Multi-factor authentication for staff access

### Administrative Safeguards
- HIPAA Security Rule compliance
- Staff training on privacy and security
- Access controls and audit logs
- Incident response procedures
- Business Associate Agreements with vendors

### Physical Safeguards
- Secure server locations
- Restricted facility access
- Video surveillance
- Secure document disposal

Despite our efforts, no transmission over the Internet is 100% secure. We cannot guarantee absolute security.

---

## 9. Children''s Privacy

Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13 without parental consent. If you believe we have collected information from a child under 13, please contact us immediately.

For patients under 18, we require parental or guardian consent for treatment and will obtain appropriate authorization before collecting or using their information.

---

## 10. International Data Transfers

Our servers are located in the United States. If you access our services from outside the U.S., your information may be transferred to, stored, and processed in the United States.

We ensure adequate safeguards through:
- Standard Contractual Clauses (SCCs) for EU data transfers
- Privacy Shield principles (where applicable)
- Binding Corporate Rules
- Explicit consent for transfers

---

## 11. HIPAA Compliance

As a covered healthcare provider, we comply with the Health Insurance Portability and Accountability Act (HIPAA) Privacy and Security Rules.

### Notice of Privacy Practices
Our full HIPAA Notice of Privacy Practices is available:
- At our office reception
- On our website
- Upon request

### Your HIPAA Rights
You have specific rights under HIPAA to:
- Access and obtain copies of your medical records
- Request amendments to your records
- Receive an accounting of disclosures
- Request restrictions on certain uses and disclosures
- File a complaint with us or the HHS Office for Civil Rights

---

## 12. California Privacy Rights (CCPA)

California residents have additional rights under the California Consumer Privacy Act (CCPA):

### Your CCPA Rights
- **Right to Know:** What personal information we collect, use, and share
- **Right to Delete:** Request deletion of your personal information
- **Right to Opt-Out:** Opt-out of the sale of personal information (we do not sell your information)
- **Right to Non-Discrimination:** Equal service regardless of privacy choices

### How to Exercise CCPA Rights
- Email: privacy@clearsightvision.com
- Phone: [Practice Phone Number]
- Online Form: [Privacy Request Form URL]

We will verify your identity before processing requests and respond within 45 days.

---

## 13. Changes to This Privacy Policy

We may update this Privacy Policy periodically. We will notify you of significant changes by:
- Posting the new policy on our website
- Updating the "Last Updated" date
- Emailing registered users (for material changes)
- Obtaining new consent where required by law

Your continued use of our services after changes constitutes acceptance of the updated policy.

---

## 14. Contact Us

### Privacy Officer
**Email:** privacy@clearsightvision.com
**Phone:** [Practice Phone Number]
**Mail:**
ClearSight Vision Center
[Practice Address]
[City, State ZIP]

### Data Protection Officer (for EU inquiries)
**Email:** dpo@clearsightvision.com

### File a Complaint
If you believe your privacy rights have been violated, you may file a complaint with:

**U.S. Department of Health and Human Services**
Office for Civil Rights
200 Independence Avenue, S.W.
Washington, D.C. 20201
Phone: 1-877-696-6775
Website: www.hhs.gov/ocr/privacy

**EU Data Protection Authority**
[For EU residents - local supervisory authority]

---

## Consent and Acknowledgment

By using our website and services, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.

For specific consents (marketing, cookies, data sharing), please see our [Consent Management Center](#).

---

**ClearSight Vision Center**
© ' || EXTRACT(YEAR FROM CURRENT_DATE) || ' All Rights Reserved.

This Privacy Policy is effective as of ' || TO_CHAR(CURRENT_DATE, 'Month DD, YYYY') || '.'
  ) RETURNING id INTO v_content_en_id;

-- Rest of languages will be added in separate inserts for manageability
END $$;