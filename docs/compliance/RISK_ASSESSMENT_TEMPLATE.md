# Risk Assessment Template

## Document Control

**Assessment Title**: [Name of Assessment]
**Assessment ID**: RA-[YYYY]-[###]
**Assessment Date**: [Date]
**Assessment Type**: ☐ Annual  ☐ Ad-hoc  ☐ Incident-driven  ☐ New System
**Classification**: Internal - Confidential
**Assessor**: [Name/Title]
**Review Date**: [Date + 1 Year]

---

## 1. Executive Summary

### 1.1 Assessment Overview
**Purpose**: [Brief description of why this assessment was conducted]

**Scope**: [What systems, processes, or areas were assessed]

**Key Findings**:
- Critical Risks Identified: [#]
- High Risks Identified: [#]
- Medium Risks Identified: [#]
- Low Risks Identified: [#]

### 1.2 Overall Risk Rating
☐ Critical  ☐ High  ☐ Medium  ☐ Low

### 1.3 Immediate Actions Required
1. [Action 1]
2. [Action 2]
3. [Action 3]

---

## 2. Assessment Scope and Methodology

### 2.1 Scope Definition

**In Scope**:
- [ ] Information assets
- [ ] IT systems and infrastructure
- [ ] Physical facilities
- [ ] Personnel and processes
- [ ] Third-party relationships
- [ ] Specific areas: [List]

**Out of Scope**:
- [List items explicitly excluded]

### 2.2 Assessment Methodology

**Approach**:
☐ Asset-based assessment
☐ Threat-based assessment
☐ Scenario-based assessment
☐ Combination approach

**Information Sources**:
- [ ] Interviews with stakeholders
- [ ] System documentation review
- [ ] Configuration reviews
- [ ] Vulnerability scan results
- [ ] Previous audit findings
- [ ] Incident history
- [ ] Industry threat intelligence

**Risk Calculation Method**:
```
Risk Level = Likelihood × Impact

Where:
Likelihood Scale: 1 (Very Low) to 5 (Very High)
Impact Scale: 1 (Very Low) to 5 (Very High)

Risk Rating:
1-4: Low
5-9: Medium
10-15: High
16-25: Critical
```

---

## 3. Asset Inventory

### 3.1 Information Assets

| Asset ID | Asset Name | Classification | Owner | Location | Value |
|----------|------------|----------------|-------|----------|-------|
| IA-001 | Patient Database | Critical | IT Manager | AWS Cloud | High |
| IA-002 | Email System | Confidential | IT Manager | Microsoft 365 | High |
| IA-003 | | | | | |

**Asset Valuation Criteria**:
- **Critical**: PHI, authentication credentials, financial data
- **High**: Business-critical systems, PII, intellectual property
- **Medium**: Internal communications, operational data
- **Low**: Public information, easily replaceable data

### 3.2 System Assets

| System ID | System Name | Type | Criticality | Dependencies |
|-----------|-------------|------|-------------|--------------|
| SYS-001 | Supabase Database | Database | Critical | Internet, AWS |
| SYS-002 | Web Application | Application | High | Supabase, CDN |
| SYS-003 | | | | |

### 3.3 Physical Assets

| Asset ID | Asset Name | Location | Owner | Value |
|----------|------------|----------|-------|-------|
| PA-001 | Server Room | Main Office | Facilities | High |
| PA-002 | Workstations | Various | IT Dept | Medium |
| PA-003 | | | | |

---

## 4. Threat Identification

### 4.1 Threat Categories

#### External Threats
- [ ] Cybercriminals / Hackers
- [ ] Competitors
- [ ] Nation-state actors
- [ ] Hacktivists
- [ ] Script kiddies
- [ ] Insider threats (former employees)

#### Internal Threats
- [ ] Malicious insiders
- [ ] Negligent employees
- [ ] Untrained staff
- [ ] Contractors/third parties

#### Environmental Threats
- [ ] Natural disasters (fire, flood, earthquake)
- [ ] Power failures
- [ ] HVAC failures
- [ ] Physical damage

#### Technical Threats
- [ ] Malware / Ransomware
- [ ] Phishing / Social engineering
- [ ] SQL injection
- [ ] Cross-site scripting (XSS)
- [ ] Denial of service (DoS)
- [ ] Man-in-the-middle attacks
- [ ] Zero-day exploits
- [ ] Configuration errors
- [ ] Software bugs
- [ ] Hardware failures

### 4.2 Threat Actors

| Threat ID | Threat Actor | Motivation | Capability | Resources |
|-----------|--------------|------------|------------|-----------|
| T-001 | Ransomware Groups | Financial | High | Significant |
| T-002 | Phishing Attackers | Financial/Data Theft | Medium | Moderate |
| T-003 | Negligent Employees | None (Accidental) | Varies | Organization |
| T-004 | | | | |

---

## 5. Vulnerability Assessment

### 5.1 Technical Vulnerabilities

| Vuln ID | Vulnerability | Affected Assets | Severity | CVSS Score |
|---------|---------------|-----------------|----------|------------|
| V-001 | Unpatched systems | SYS-001, SYS-005 | High | 8.5 |
| V-002 | Weak passwords | User accounts | Medium | 6.0 |
| V-003 | | | | |

### 5.2 Process Vulnerabilities

| Vuln ID | Vulnerability | Affected Process | Impact |
|---------|---------------|------------------|--------|
| PV-001 | No backup testing | Backup process | High |
| PV-002 | Delayed patching | Change management | Medium |
| PV-003 | | | |

### 5.3 Physical Vulnerabilities

| Vuln ID | Vulnerability | Location | Impact |
|---------|---------------|----------|--------|
| PHV-001 | No badge system | Server room | High |
| PHV-002 | Unlocked cabinets | Office areas | Medium |
| PHV-003 | | | |

---

## 6. Risk Analysis

### 6.1 Risk Register

| Risk ID | Risk Description | Asset | Threat | Vulnerability | Likelihood (1-5) | Impact (1-5) | Risk Score | Risk Level |
|---------|------------------|-------|--------|---------------|------------------|--------------|------------|------------|
| R-001 | Ransomware encryption of patient database | IA-001 | T-001 | V-001 | 4 | 5 | 20 | Critical |
| R-002 | Unauthorized access via stolen credentials | SYS-002 | T-002 | V-002 | 3 | 4 | 12 | High |
| R-003 | Data loss due to backup failure | IA-001 | T-004 | PV-001 | 2 | 5 | 10 | High |
| R-004 | | | | | | | | |

### 6.2 Risk Descriptions

#### Risk R-001: Ransomware Encryption of Patient Database

**Description**:
Ransomware attack could encrypt the patient database, making PHI inaccessible and violating HIPAA availability requirements.

**Threat**: Ransomware Groups (T-001)
**Vulnerability**: Unpatched systems (V-001)
**Asset**: Patient Database (IA-001)

**Likelihood Assessment (4 - High)**:
- Ransomware attacks increasing in healthcare sector
- Valuable PHI target for attackers
- Some systems not patched within 30 days
- Previous phishing attempts detected

**Impact Assessment (5 - Very High)**:
- Complete loss of access to patient records
- HIPAA breach notification required
- Potential ransom payment
- Reputation damage
- Legal and regulatory penalties
- Business disruption (3+ days)
- Financial impact: $500,000+

**Risk Score**: 20 (Critical)

**Current Controls**:
- Anti-malware software deployed
- Email filtering in place
- User awareness training conducted
- Backups performed daily

**Control Effectiveness**: Partially Effective

---

#### Risk R-002: Unauthorized Access via Stolen Credentials

**Description**:
Phishing attack could steal user credentials allowing unauthorized access to confidential systems and PHI.

**Threat**: Phishing Attackers (T-002)
**Vulnerability**: Weak passwords, no MFA (V-002)
**Asset**: Web Application (SYS-002)

**Likelihood Assessment (3 - Medium)**:
- Regular phishing attempts observed
- Some users fail phishing simulations
- Not all accounts have MFA enabled
- Password policy exists but enforcement varies

**Impact Assessment (4 - High)**:
- Unauthorized access to PHI
- Potential HIPAA violation
- Data breach notification required
- Reputation damage
- Regulatory investigation
- Financial impact: $100,000+

**Risk Score**: 12 (High)

**Current Controls**:
- Password policy (12+ characters)
- Account lockout after failed attempts
- Security awareness training
- Email filtering

**Control Effectiveness**: Partially Effective

---

## 7. Risk Treatment

### 7.1 Treatment Options

For each identified risk, select one of the following:
- **Avoid**: Eliminate the activity causing the risk
- **Reduce**: Implement controls to minimize likelihood or impact
- **Transfer**: Share risk with third party (insurance, outsourcing)
- **Accept**: Acknowledge and accept the risk

### 7.2 Risk Treatment Plan

#### Risk R-001: Ransomware Encryption (Critical)

**Treatment Decision**: ☑ Reduce  ☐ Avoid  ☐ Transfer  ☐ Accept

**Proposed Controls**:
1. **Implement automated patching** (Target: 7 days for critical patches)
   - Owner: IT Manager
   - Timeline: 30 days
   - Cost: $5,000
   - Residual Risk: Medium (Score: 8)

2. **Deploy endpoint detection and response (EDR)**
   - Owner: Security Manager
   - Timeline: 60 days
   - Cost: $15,000/year
   - Residual Risk: Low (Score: 4)

3. **Implement network segmentation**
   - Owner: IT Manager
   - Timeline: 90 days
   - Cost: $10,000
   - Residual Risk: Low (Score: 4)

4. **Test backup restoration monthly**
   - Owner: IT Manager
   - Timeline: 14 days
   - Cost: 4 hours/month
   - Residual Risk: Low (Score: 4)

**Expected Residual Risk**: Low (Score: 4)
**Treatment Priority**: 1 (Highest)
**Budget Approval**: ☐ Pending  ☐ Approved  ☐ Denied

---

#### Risk R-002: Unauthorized Access (High)

**Treatment Decision**: ☑ Reduce  ☐ Avoid  ☐ Transfer  ☐ Accept

**Proposed Controls**:
1. **Enforce MFA for all user accounts**
   - Owner: IT Manager
   - Timeline: 14 days
   - Cost: Included in existing tools
   - Residual Risk: Low (Score: 3)

2. **Implement adaptive authentication**
   - Owner: Security Manager
   - Timeline: 60 days
   - Cost: $8,000/year
   - Residual Risk: Very Low (Score: 2)

3. **Monthly phishing simulations**
   - Owner: Security Manager
   - Timeline: 30 days
   - Cost: $3,000/year
   - Residual Risk: Low (Score: 3)

**Expected Residual Risk**: Low (Score: 3)
**Treatment Priority**: 2
**Budget Approval**: ☐ Pending  ☐ Approved  ☐ Denied

---

### 7.3 Risk Treatment Summary

| Risk ID | Current Risk | Treatment | New Controls | Residual Risk | Priority | Owner | Due Date | Status |
|---------|--------------|-----------|--------------|---------------|----------|-------|----------|--------|
| R-001 | Critical (20) | Reduce | EDR, Patching, Segmentation | Low (4) | 1 | IT Mgr | [Date] | Planned |
| R-002 | High (12) | Reduce | MFA, Adaptive Auth, Training | Low (3) | 2 | Sec Mgr | [Date] | Planned |
| R-003 | High (10) | Reduce | Test procedures, Monitoring | Low (4) | 3 | IT Mgr | [Date] | Planned |

**Total Budget Required**: $41,000 (initial) + $26,000/year (ongoing)

---

## 8. Residual Risk Assessment

After implementing all planned controls:

**Expected Risk Profile**:
- Critical Risks: 0
- High Risks: 0
- Medium Risks: 2
- Low Risks: 5

**Accepted Risks**:
| Risk ID | Description | Justification | Approval |
|---------|-------------|---------------|----------|
| R-015 | Legacy system vulnerabilities | System to be replaced in 6 months | [Approver] |

---

## 9. Risk Monitoring and Review

### 9.1 Key Risk Indicators (KRIs)

| KRI | Metric | Threshold | Frequency | Owner |
|-----|--------|-----------|-----------|-------|
| Unpatched Systems | % systems unpatched > 30 days | < 5% | Weekly | IT Manager |
| Failed Logins | Failed login attempts per day | < 100 | Daily | Security Manager |
| Phishing Click Rate | % users clicking simulated phishing | < 5% | Monthly | Security Manager |
| Backup Failures | Failed backups per month | 0 | Daily | IT Manager |

### 9.2 Review Schedule

- **Weekly**: KRI monitoring
- **Monthly**: Risk treatment progress
- **Quarterly**: Risk register review and update
- **Annually**: Comprehensive risk assessment
- **Ad-hoc**: New system implementations, incidents, regulatory changes

---

## 10. Recommendations

### 10.1 Immediate Actions (0-30 days)
1. Implement MFA for all accounts
2. Test backup restoration procedures
3. Deploy automated patching for critical systems
4. Conduct emergency tabletop exercise

### 10.2 Short-term Actions (30-90 days)
1. Deploy EDR solution
2. Implement network segmentation
3. Launch monthly phishing simulation program
4. Conduct vulnerability assessment

### 10.3 Long-term Actions (90-365 days)
1. Implement Security Information and Event Management (SIEM)
2. Develop and test business continuity plan
3. Conduct penetration testing
4. Implement data loss prevention (DLP)

---

## 11. Conclusion

[Summary of assessment findings, overall risk posture, and key recommendations]

---

## 12. Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Assessor | [Name] | [Signature] | [Date] |
| Information Security Manager | [Name] | [Signature] | [Date] |
| IT Manager | [Name] | [Signature] | [Date] |
| Executive Sponsor | [Name] | [Signature] | [Date] |

---

## 13. Appendices

### Appendix A: Likelihood Definitions

| Rating | Score | Definition | Frequency |
|--------|-------|------------|-----------|
| Very High | 5 | Almost certain to occur | > 1 per month |
| High | 4 | Likely to occur | 1 per quarter |
| Medium | 3 | Possible to occur | 1 per year |
| Low | 2 | Unlikely to occur | 1 per 3 years |
| Very Low | 1 | Rare occurrence | < 1 per 5 years |

### Appendix B: Impact Definitions

| Rating | Score | Financial | Operational | Reputation | Compliance |
|--------|-------|-----------|-------------|------------|------------|
| Very High | 5 | > $500K | > 7 days downtime | National media | Criminal penalties |
| High | 4 | $100K-$500K | 3-7 days downtime | Regional media | Regulatory fines |
| Medium | 3 | $25K-$100K | 1-3 days downtime | Local media | Formal warning |
| Low | 2 | $5K-$25K | < 1 day downtime | Customer complaints | Informal warning |
| Very Low | 1 | < $5K | < 4 hours downtime | Minor complaints | No action |

### Appendix C: Supporting Documentation

- Vulnerability scan results
- Previous audit reports
- Incident history
- System diagrams
- Interview notes

---

**END OF ASSESSMENT**
