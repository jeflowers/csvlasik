/*
  # Populate GDPR Privacy Policy Content

  ## Overview
  Creates comprehensive GDPR-compliant privacy policy content for
  ClearSight Vision Institute covering all required sections for
  healthcare data processing and international compliance.

  ## What This Does
  - Creates initial privacy policy version 1.0
  - Populates English content with all required GDPR sections
  - Sets up structure for multi-language translations
  - Includes HIPAA healthcare-specific provisions
  - Covers CCPA California requirements
  - Addresses international data transfers

  ## Policy Sections
  1. Introduction and Scope
  2. Information We Collect
  3. Legal Basis for Processing
  4. How We Use Your Information
  5. Data Sharing and Disclosure
  6. International Data Transfers
  7. Data Security
  8. Data Retention
  9. Your Privacy Rights
  10. Cookies and Tracking
  11. Children's Privacy
  12. Changes to Privacy Policy
  13. Contact Information
*/

-- ============================================================================
-- 1. CREATE PRIVACY POLICY VERSION 1.0
-- ============================================================================

INSERT INTO privacy_policy_versions (
  version_number,
  effective_date,
  is_current,
  requires_reacknowledgment,
  change_summary
) VALUES (
  '1.0',
  CURRENT_DATE,
  true,
  false,
  'Initial comprehensive GDPR and HIPAA compliant privacy policy for ClearSight Vision Institute'
) ON CONFLICT (version_number) DO NOTHING;

-- ============================================================================
-- 2. CREATE ENGLISH PRIVACY POLICY CONTENT
-- ============================================================================

INSERT INTO privacy_policy_content (
  version_id,
  language_code,
  title,
  content,
  last_updated
)
SELECT
  id,
  'en',
  'Privacy Policy - ClearSight Vision Institute',
  E'# Privacy Policy

**Effective Date:** ' || TO_CHAR(CURRENT_DATE, 'Month DD, YYYY') || E'
**Last Updated:** ' || TO_CHAR(CURRENT_DATE, 'Month DD, YYYY') || E'

## 1. Introduction

ClearSight Vision Institute ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

This policy complies with:
- Health Insurance Portability and Accountability Act (HIPAA)
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Other applicable privacy laws

By using our services, you consent to the practices described in this policy.

## 2. Information We Collect

### 2.1 Protected Health Information (PHI)
As a healthcare provider, we collect PHI necessary for treatment, payment, and healthcare operations:
- Medical history and eye health information
- Vision test results and diagnoses
- Treatment plans and surgical records
- Insurance information
- Prescription and medication records

### 2.2 Personal Information
- Full name and contact information (address, phone, email)
- Date of birth and age
- Government-issued identification
- Emergency contact information
- Payment and billing information

### 2.3 Technical Information
- IP address and browser type
- Device information and operating system
- Usage data and website interactions
- Cookies and similar tracking technologies
- Geolocation data (with consent)

### 2.4 Information from Third Parties
- Insurance verification data
- Referral information from other healthcare providers
- Background check information (employees only)

## 3. Legal Basis for Processing

Under GDPR, we process your data based on:

### 3.1 Consent
You have given clear consent for us to process your personal data for specific purposes.

### 3.2 Contract Performance
Processing is necessary to fulfill our contract with you for healthcare services.

### 3.3 Legal Obligations
We must process data to comply with HIPAA, healthcare regulations, and legal requirements.

### 3.4 Vital Interests
Processing is necessary to protect your life or health in emergency situations.

### 3.5 Legitimate Interests
We process data for legitimate business interests that do not override your rights and freedoms.

## 4. How We Use Your Information

### 4.1 Treatment Purposes
- Providing eye care and vision correction services
- Conducting examinations and diagnostic tests
- Planning and performing surgical procedures
- Post-operative care and follow-up
- Coordinating care with other healthcare providers

### 4.2 Payment and Billing
- Processing payments and insurance claims
- Billing and collection activities
- Fraud prevention and detection

### 4.3 Healthcare Operations
- Quality assessment and improvement
- Staff training and competency evaluation
- Business planning and management
- Legal and regulatory compliance

### 4.4 Marketing and Communication
- Appointment reminders and follow-ups
- Health education and wellness information
- Service updates and new offerings
- Patient satisfaction surveys

**Note:** We will not use your PHI for marketing without your explicit authorization.

## 5. Data Sharing and Disclosure

### 5.1 Healthcare Providers
We share information with:
- Referring physicians and specialists
- Surgical facilities and laboratories
- Emergency care providers
- Pharmacies for prescriptions

### 5.2 Business Associates
We share data with HIPAA-compliant vendors:
- Practice management software providers
- Electronic health record systems
- Billing and coding services
- IT and security services
- Translation services for multilingual patients

All business associates sign Business Associate Agreements (BAAs) ensuring HIPAA compliance.

### 5.3 Legal Requirements
We may disclose information when required by:
- Court orders or legal proceedings
- Law enforcement requests
- Public health authorities
- Workers\' compensation programs
- Medical examiners or coroners

### 5.4 With Your Authorization
We will obtain your written authorization before using or disclosing PHI for purposes not covered by this policy.

## 6. International Data Transfers

### 6.1 Data Storage Location
Your data is primarily stored in secure data centers in the United States.

### 6.2 Cross-Border Transfers
When transferring data internationally, we ensure:
- Adequate safeguards are in place
- Standard Contractual Clauses (SCCs) are executed
- Recipient countries provide adequate protection
- Transfer Impact Assessments are conducted

### 6.3 International Patient Services
We serve patients from multiple countries. Data transfers comply with applicable international privacy laws.

## 7. Data Security

### 7.1 Technical Safeguards
- 256-bit AES encryption at rest
- TLS 1.3 encryption in transit
- Multi-factor authentication
- Intrusion detection systems
- Regular security assessments

### 7.2 Physical Safeguards
- Secure facility access controls
- Surveillance and monitoring
- Equipment security measures
- Secure disposal procedures

### 7.3 Administrative Safeguards
- Staff security training
- Access control policies
- Incident response procedures
- Regular risk assessments
- Business continuity planning

### 7.4 Breach Notification
In the event of a data breach:
- We will notify affected individuals within 60 days
- Regulatory authorities will be informed as required
- We will provide information about the breach and steps to protect yourself

## 8. Data Retention

### 8.1 Retention Periods
- Medical records: Minimum 7 years from last treatment
- Financial records: 7 years from transaction date
- Marketing data: Until consent withdrawn or 3 years of inactivity
- Website logs: 90 days for security purposes

### 8.2 Automated Retention Policies
Our system automatically:
- Archives records according to retention schedules
- Deletes data when retention periods expire
- Maintains audit logs of retention activities

### 8.3 Legal Holds
Data subject to legal proceedings or investigations will be retained until released.

## 9. Your Privacy Rights

### 9.1 HIPAA Rights
- **Access:** Inspect and copy your medical records
- **Amendment:** Request corrections to your records
- **Accounting:** Receive a list of disclosures
- **Restriction:** Request limits on uses and disclosures
- **Confidential Communication:** Request alternative contact methods
- **Paper Copy:** Receive a paper copy of this privacy policy

### 9.2 GDPR Rights (for EU residents)
- **Right to Access:** Obtain confirmation of data processing
- **Right to Rectification:** Correct inaccurate personal data
- **Right to Erasure:** Request deletion ("right to be forgotten")
- **Right to Restriction:** Limit processing under certain conditions
- **Right to Data Portability:** Receive data in machine-readable format
- **Right to Object:** Object to processing based on legitimate interests
- **Right to Withdraw Consent:** Withdraw consent at any time
- **Right to Lodge a Complaint:** File complaints with supervisory authorities

### 9.3 CCPA Rights (for California residents)
- **Right to Know:** What personal information we collect and how we use it
- **Right to Delete:** Request deletion of personal information
- **Right to Opt-Out:** Opt out of sale of personal information (we do not sell data)
- **Right to Non-Discrimination:** Equal service regardless of privacy rights exercise

### 9.4 Exercising Your Rights
To exercise any privacy rights:
- Email: privacy@clearsightvision.com
- Phone: (619) 222-2020
- Mail: ClearSight Vision Institute, ATTN: Privacy Officer, [Address]
- Online: Submit request through our website privacy portal

We will respond to requests within:
- 30 days for GDPR requests (extendable to 60 days)
- 45 days for CCPA requests (extendable to 90 days)
- Reasonable time for HIPAA requests (typically 30 days)

## 10. Cookies and Tracking Technologies

### 10.1 Types of Cookies We Use
- **Essential Cookies:** Required for website functionality
- **Analytics Cookies:** Understand how visitors use our site
- **Preference Cookies:** Remember your settings and preferences
- **Marketing Cookies:** Deliver relevant advertisements (with consent)

### 10.2 Third-Party Tracking
We use:
- Google Analytics for website analytics
- Social media plugins (Facebook, Instagram, TikTok)
- YouTube embedded videos
- Map services for location display

### 10.3 Cookie Management
You can control cookies through:
- Our cookie consent banner
- Browser settings and preferences
- Third-party opt-out tools
- Do Not Track signals (we honor DNT)

## 11. Children\'s Privacy

Our services are intended for adults and teens with parental consent. We do not knowingly collect information from children under 13 without parental authorization. Parents may:
- Review their child\'s information
- Request deletion of their child\'s data
- Refuse further collection or use

## 12. Changes to This Privacy Policy

### 12.1 Updates
We may update this policy to:
- Reflect changes in our practices
- Comply with new legal requirements
- Improve clarity and transparency

### 12.2 Notification of Changes
- Material changes will require re-acknowledgment
- Non-material changes will be posted with updated effective date
- Notice will be provided via email and website banner
- Previous versions archived and available upon request

## 13. Contact Information

### 13.1 Privacy Inquiries
**Privacy Officer / Data Protection Officer**
Email: privacy@clearsightvision.com
Phone: (619) 222-2020
Address: ClearSight Vision Institute
[Complete Address]

### 13.2 Supervisory Authorities

**For GDPR Complaints:**
Contact your local EU Data Protection Authority
List available at: https://edpb.europa.eu/

**For HIPAA Complaints:**
U.S. Department of Health and Human Services
Office for Civil Rights
Website: https://www.hhs.gov/ocr/

**For CCPA Complaints:**
California Attorney General\'s Office
Website: https://oag.ca.gov/

### 13.3 Business Hours
Monday - Friday: 8:00 AM - 5:00 PM Pacific Time
Emergency privacy concerns: Available 24/7 via email

---

## Acknowledgment

By using our services, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use our services.

**Thank you for trusting ClearSight Vision Institute with your eye care and your privacy.**

---

*This privacy policy was prepared in compliance with HIPAA Privacy Rule, GDPR Articles 12-14, and CCPA Section 1798.100.*',
  now()
FROM privacy_policy_versions
WHERE version_number = '1.0' AND language_code NOT IN (
  SELECT language_code FROM privacy_policy_content WHERE version_id IN (
    SELECT id FROM privacy_policy_versions WHERE version_number = '1.0'
  )
)
LIMIT 1;

-- ============================================================================
-- 3. CREATE PRIVACY POLICY SECTIONS FOR STRUCTURED ACCESS
-- ============================================================================

-- Get the content_id for English version
DO $$
DECLARE
  v_content_id uuid;
BEGIN
  SELECT ppc.id INTO v_content_id
  FROM privacy_policy_content ppc
  JOIN privacy_policy_versions ppv ON ppc.version_id = ppv.id
  WHERE ppv.version_number = '1.0' AND ppc.language_code = 'en';

  IF v_content_id IS NOT NULL THEN
    -- Insert structured sections
    INSERT INTO privacy_policy_sections (content_id, section_key, section_title, section_content, display_order)
    VALUES
      (v_content_id, 'introduction', '1. Introduction', 'Introduction and scope of privacy policy', 1),
      (v_content_id, 'information_collected', '2. Information We Collect', 'Types of information collected including PHI and personal data', 2),
      (v_content_id, 'legal_basis', '3. Legal Basis for Processing', 'GDPR legal basis including consent, contract, legal obligation', 3),
      (v_content_id, 'data_usage', '4. How We Use Your Information', 'Treatment, payment, operations, and marketing purposes', 4),
      (v_content_id, 'data_sharing', '5. Data Sharing and Disclosure', 'When and how we share data with third parties', 5),
      (v_content_id, 'international_transfers', '6. International Data Transfers', 'Cross-border data transfer safeguards', 6),
      (v_content_id, 'data_security', '7. Data Security', 'Technical, physical, and administrative safeguards', 7),
      (v_content_id, 'data_retention', '8. Data Retention', 'How long we keep data and retention policies', 8),
      (v_content_id, 'privacy_rights', '9. Your Privacy Rights', 'HIPAA, GDPR, and CCPA rights and how to exercise them', 9),
      (v_content_id, 'cookies', '10. Cookies and Tracking Technologies', 'Use of cookies and tracking technologies', 10),
      (v_content_id, 'children', '11. Children\'s Privacy', 'Protection of children\'s privacy', 11),
      (v_content_id, 'changes', '12. Changes to This Privacy Policy', 'How we update and notify changes', 12),
      (v_content_id, 'contact', '13. Contact Information', 'How to contact us and supervisory authorities', 13)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
