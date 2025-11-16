# Asset Management Policy and Procedures

## Document Control

**Document Title**: Asset Management Policy and Procedures
**Version**: 1.0
**Date**: 2025-11-16
**Classification**: Internal - Confidential
**Owner**: IT Manager
**Review Cycle**: Annual
**Next Review Date**: 2026-11-16

---

## 1. Purpose

This document defines the policy and procedures for managing information assets throughout their lifecycle to ensure appropriate protection based on their value to the organization.

---

## 2. Scope

This policy applies to all information assets including:
- **Information Assets**: Databases, files, documents, data
- **Physical Assets**: Hardware, equipment, media
- **Software Assets**: Applications, systems, licenses
- **Service Assets**: Cloud services, utilities, communications
- **People Assets**: Key personnel, specialized skills
- **Intangible Assets**: Reputation, intellectual property

---

## 3. Asset Management Principles

### 3.1 Asset Accountability
- Every asset must have an identified owner
- Owners are responsible for appropriate protection
- Asset inventory maintained and current

### 3.2 Asset Classification
- Assets classified based on confidentiality, integrity, and availability requirements
- Protection measures match classification level
- Classification reviewed periodically

### 3.3 Lifecycle Management
- Assets managed from acquisition to disposal
- Security controls applied at each lifecycle stage
- Proper disposal prevents data leakage

---

## 4. Roles and Responsibilities

### 4.1 Asset Owner
**Responsibilities**:
- Determine asset classification
- Define access requirements
- Ensure appropriate protection
- Review access rights periodically
- Approve changes affecting the asset
- Ensure compliance with policies

**Note**: Asset owner is typically a business manager, not IT

### 4.2 Asset Custodian
**Responsibilities**:
- Implement technical controls
- Perform backups and recovery
- Maintain system configurations
- Apply patches and updates
- Monitor asset health
- Report issues to owner

**Note**: Asset custodian is typically IT or system administrator

### 4.3 IT Asset Manager
**Responsibilities**:
- Maintain central asset inventory
- Track asset lifecycle stages
- Coordinate asset procurement
- Manage asset disposal process
- Generate asset reports
- Conduct asset audits

### 4.4 Users
**Responsibilities**:
- Use assets for authorized purposes only
- Protect assigned assets
- Report loss, theft, or damage
- Follow acceptable use policies
- Return assets upon request

---

## 5. Asset Classification

### 5.1 Classification Levels

#### Critical
**Definition**: Information or assets whose compromise would cause severe harm

**Examples**:
- Patient health information (PHI)
- Financial records and banking information
- Authentication credentials (passwords, keys)
- Cryptographic keys
- Legal documents under seal

**Protection Requirements**:
- Encryption at rest and in transit (AES-256, TLS 1.2+)
- Multi-factor authentication required
- Access logging and monitoring
- Annual access review
- Secure disposal required
- Offsite encrypted backups
- 6-year retention minimum (HIPAA)

#### Confidential
**Definition**: Information or assets whose compromise would cause significant harm

**Examples**:
- Personally identifiable information (PII)
- Employee records
- Business plans and strategies
- Vendor contracts
- Internal communications
- Source code

**Protection Requirements**:
- Access controls enforced
- Encryption for transmission
- Quarterly access review
- Secure disposal required
- Regular backups
- Minimum retention per legal requirements

#### Internal
**Definition**: Information or assets for internal use only

**Examples**:
- Policies and procedures
- Internal announcements
- Employee directory
- Training materials
- Meeting minutes

**Protection Requirements**:
- Authentication required
- Annual access review
- Standard disposal acceptable
- Backups per IT policy

#### Public
**Definition**: Information approved for public disclosure

**Examples**:
- Marketing materials
- Published website content
- Press releases
- Public job postings

**Protection Requirements**:
- Integrity protection
- Availability protection
- No special confidentiality requirements

### 5.2 Classification Marking

**Electronic Documents**:
- Header: "[CLASSIFICATION]"
- Footer: "ClearSight Vision Institute - [CLASSIFICATION]"
- Metadata: Classification field populated

**Physical Documents**:
- Stamp or label on first page and cover
- Color coding: Red (Critical), Orange (Confidential), Green (Internal), None (Public)

**Email**:
- Subject line prefix: "[CRITICAL]", "[CONFIDENTIAL]", "[INTERNAL]"
- Email signature includes classification
- Automatic classification based on content scanning

---

## 6. Asset Inventory

### 6.1 Inventory Requirements

**Information to Track**:
- Asset ID (unique identifier)
- Asset name and description
- Asset type and category
- Classification level
- Owner and custodian
- Location (physical or logical)
- Acquisition date and cost
- Warranty/support expiration
- Dependencies
- Disposal date (when applicable)

### 6.2 Asset Inventory Template

| Asset ID | Asset Name | Type | Classification | Owner | Custodian | Location | Status |
|----------|------------|------|----------------|-------|-----------|----------|--------|
| IA-001 | Patient Database | Information | Critical | Medical Director | IT Manager | AWS Cloud | Active |
| PA-001 | Server-01 | Physical | N/A | IT Manager | IT Admin | Server Room | Active |
| SA-001 | Supabase Subscription | Service | Critical | CTO | IT Manager | Cloud | Active |
| SW-001 | Practice Management Software | Software | Confidential | Operations Mgr | IT Manager | Cloud | Active |

### 6.3 Inventory Maintenance

**Update Triggers**:
- New asset acquisition
- Asset transfer or relocation
- Ownership change
- Classification change
- Asset retirement or disposal
- Significant configuration change

**Review Schedule**:
- IT assets: Quarterly review
- Information assets: Semi-annual review
- Physical assets: Annual review
- Complete inventory audit: Annual

### 6.4 Discovery and Validation

**Automated Discovery**:
- Network scanning for devices
- Cloud asset inventory APIs
- Software asset management tools
- Database catalogs
- File system scans

**Manual Validation**:
- Physical walk-throughs
- Department interviews
- License reviews
- Contract reviews

---

## 7. Asset Lifecycle Management

### 7.1 Acquisition

**Process**:
1. Business need identified
2. Classification determined
3. Security requirements defined
4. Procurement approval obtained
5. Asset acquired and received
6. Asset tagged and recorded
7. Security controls implemented
8. Asset deployed

**Security Considerations**:
- Vendor security assessment
- Licensing compliance
- Configuration hardening
- Initial backup
- Access controls configured

### 7.2 Operation and Maintenance

**Ongoing Activities**:
- Regular patching and updates
- Configuration management
- Access rights review
- Performance monitoring
- Backup verification
- Vulnerability scanning
- Change management

**Maintenance Schedule**:
- Daily: Backup verification, monitoring
- Weekly: Log review, security alerts
- Monthly: Patch deployment, access review
- Quarterly: Vulnerability scan, configuration review
- Annually: Security assessment, owner review

### 7.3 Transfer or Relocation

**Requirements**:
- Owner approval required
- Asset inventory updated
- Security controls verified at new location
- Access rights reviewed
- Documentation updated
- Users notified of changes

**Physical Asset Transfer**:
- Transfer form completed
- Physical security during transport
- Chain of custody maintained
- Receipt confirmed
- Asset location updated

### 7.4 Disposal and Decommissioning

**General Requirements**:
- Owner approval required
- Data backup if needed
- Secure data destruction
- Asset inventory updated
- License deactivation
- Documentation archived

**Data Destruction Methods**:

| Media Type | Method | Standard |
|------------|--------|----------|
| Hard Drives (reuse) | Cryptographic erasure | NIST 800-88 |
| Hard Drives (disposal) | Physical destruction (shredding) | DOD 5220.22-M |
| SSDs | Cryptographic erasure + physical destruction | NIST 800-88 |
| Optical Media | Physical destruction (shredding) | DOD 5220.22-M |
| Paper Documents | Cross-cut shredding | NSA 02-01 |
| Mobile Devices | Factory reset + physical destruction if Critical data | NIST 800-88 |

**Disposal Process**:
1. Submit disposal request
2. Owner approval
3. Data classification review
4. Backup if required
5. Data destruction performed
6. Certificate of destruction issued
7. Physical disposal
8. Asset record updated

**Third-Party Disposal**:
- Vendor security assessment required
- Chain of custody documented
- Certificate of destruction required
- Witnessed destruction for Critical assets

---

## 8. Access Control

### 8.1 Access Principles
- **Need-to-know**: Access based on job requirements
- **Least privilege**: Minimum access necessary
- **Separation of duties**: Critical functions divided
- **Time-bound**: Temporary access expires

### 8.2 Access Request Process
1. User submits access request
2. Manager reviews business justification
3. Asset owner approves/denies
4. IT implements access
5. Access logged in inventory
6. Periodic review scheduled

### 8.3 Access Review

**Review Frequency**:
- Critical assets: Quarterly
- Confidential assets: Semi-annually
- Internal assets: Annually

**Review Process**:
1. Asset manager generates access report
2. Asset owner reviews current access
3. Remove unnecessary access
4. Document review completion
5. Report exceptions

---

## 9. Protection Requirements by Asset Type

### 9.1 Information Assets

**Databases**:
- Encrypted at rest
- Encrypted in transit
- Access logging enabled
- Backups encrypted
- Access reviewed quarterly
- Data retention policies applied

**File Shares**:
- Access controls enforced
- Versioning enabled
- Backups performed daily
- Malware scanning active
- Access reviewed semi-annually

**Email**:
- Encryption for sensitive data
- Data loss prevention (DLP)
- Retention policies enforced
- Archive for compliance
- Phishing protection

### 9.2 Physical Assets

**Servers**:
- Asset tags applied
- Locked in secure room
- Environmental controls
- Remote management capability
- Hardware inventory current
- End-of-life tracking

**Workstations**:
- Asset tags applied
- Full disk encryption
- Anti-malware installed
- Screen lock enforced
- Regular backups
- Clear desk policy

**Mobile Devices**:
- Device enrollment required
- Encryption enabled
- Remote wipe capability
- Lost/stolen reporting mandatory
- Acceptable use policy

**Removable Media**:
- Encrypted if containing Critical/Confidential data
- Inventory maintained
- Secure disposal required
- Malware scanning before use

### 9.3 Software Assets

**Applications**:
- License compliance tracking
- Vulnerability management
- Patch management
- Access controls
- Secure configuration

**Operating Systems**:
- Hardening standards applied
- Automatic updates enabled
- Endpoint protection deployed
- Configuration management

### 9.4 Cloud Services

**SaaS Applications**:
- Approved service list maintained
- Security assessment completed
- Data Processing Agreement signed
- Access provisioning/deprovisioning
- Usage monitoring

**IaaS/PaaS**:
- Security controls documented
- Configuration standards applied
- Monitoring and logging enabled
- Backup and disaster recovery tested

---

## 10. Physical Security

### 10.1 Facility Security

**Access Controls**:
- Badge access system
- Visitor management
- Security cameras
- Intrusion alarms
- Reception desk

**Server Room**:
- Restricted access (badge + PIN)
- Access logging
- Environmental monitoring
- Fire suppression
- Uninterruptible power supply (UPS)

### 10.2 Equipment Security

**Workstation Security**:
- Cable locks for laptops
- Privacy screens
- Clean desk policy
- Secure storage for devices

**Mobile Device Security**:
- Lost/stolen reporting process
- Remote tracking capability
- Remote wipe capability
- Encryption required

---

## 11. Compliance and Auditing

### 11.1 Compliance Requirements

**HIPAA**:
- PHI assets identified
- Access tracked and reviewed
- Disposal documented
- Encryption enforced

**GDPR**:
- PII assets identified
- Data minimization applied
- Retention limits enforced
- Processing activities documented

**ISO 27001**:
- Asset inventory maintained
- Asset owners identified
- Classification scheme implemented
- Acceptable use policy enforced

### 11.2 Audit Activities

**Internal Audits**:
- Asset inventory accuracy
- Classification appropriateness
- Access rights review compliance
- Disposal procedures
- Physical security controls

**Audit Frequency**: Annual minimum

**Audit Reporting**: Findings reported to management with corrective action plans

---

## 12. Metrics and Reporting

### 12.1 Key Metrics

| Metric | Target | Frequency |
|--------|--------|-----------|
| Asset inventory accuracy | > 95% | Quarterly |
| Assets with current owner | 100% | Monthly |
| Overdue access reviews | 0 | Monthly |
| Unclassified information assets | 0 | Monthly |
| Disposal certificate on file | 100% | Per disposal |
| Software license compliance | 100% | Quarterly |

### 12.2 Management Reports

**Monthly**:
- New assets acquired
- Assets disposed
- Access review status
- License expiration alerts

**Quarterly**:
- Asset inventory summary
- Classification distribution
- Access review compliance
- Security incidents affecting assets

**Annual**:
- Complete asset inventory
- Asset value summary
- Compliance status
- Recommendations

---

## 13. Templates and Forms

### 13.1 Asset Registration Form

```
ASSET REGISTRATION FORM

Asset Information:
- Asset Name: ___________________________
- Asset Type: ☐ Information  ☐ Physical  ☐ Software  ☐ Service
- Description: ___________________________
- Serial Number / License Key: ___________________________

Classification:
☐ Critical  ☐ Confidential  ☐ Internal  ☐ Public

Ownership:
- Asset Owner: ___________________________
- Department: ___________________________
- Asset Custodian: ___________________________

Location:
- Physical Location: ___________________________
- Logical Location: ___________________________

Acquisition:
- Date Acquired: ___________________________
- Purchase Order: ___________________________
- Cost: ___________________________
- Warranty Expiration: ___________________________

Dependencies:
___________________________

Security Controls Required:
☐ Encryption  ☐ Access logging  ☐ Backups  ☐ MFA
☐ Other: ___________________________

Approval:
Asset Owner Signature: ___________________  Date: _______
IT Asset Manager: ___________________  Date: _______
```

### 13.2 Asset Disposal Form

```
ASSET DISPOSAL FORM

Asset Information:
- Asset ID: ___________________________
- Asset Name: ___________________________
- Current Classification: ___________________________

Disposal Information:
- Reason for Disposal: ☐ End of Life  ☐ Upgrade  ☐ Obsolete  ☐ Damaged
- Disposal Method: ☐ Recycle  ☐ Donate  ☐ Destroy  ☐ Return
- Data Present: ☐ Yes  ☐ No
- Data Classification: ___________________________

Data Destruction:
- Method: ☐ Cryptographic Erase  ☐ Physical Destruction  ☐ N/A
- Performed By: ___________________________
- Date: ___________________________
- Certificate of Destruction: ☐ Attached  ☐ N/A

Approvals:
Asset Owner: ___________________  Date: _______
IT Asset Manager: ___________________  Date: _______
Security Manager (if Critical): ___________________  Date: _______
```

---

## 14. Related Documents

- [ISMS Framework](./ISMS_FRAMEWORK.md)
- [Information Security Policy](./INFORMATION_SECURITY_POLICY.md)
- [Data Protection Policy](./DATA_PROTECTION_POLICY.md)
- [Physical Security Policy](./PHYSICAL_SECURITY_POLICY.md)

---

## 15. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| IT Manager | [Name] | [Signature] | [Date] |
| Information Security Manager | [Name] | [Signature] | [Date] |
| Executive Sponsor | [Name] | [Signature] | [Date] |

---

## 16. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-16 | IT Manager | Initial policy creation |

---

**END OF DOCUMENT**
