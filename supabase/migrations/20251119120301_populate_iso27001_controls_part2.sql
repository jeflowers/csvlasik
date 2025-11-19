/*
  # Populate ISO 27001 Controls Part 2

  ## Overview
  Continues populating ISO 27001 controls for domains A.12 through A.18.
*/

DO $$
DECLARE
  v_domain_a12 uuid;
  v_domain_a13 uuid;
  v_domain_a14 uuid;
  v_domain_a15 uuid;
  v_domain_a16 uuid;
  v_domain_a17 uuid;
  v_domain_a18 uuid;
BEGIN
  -- Get domain IDs
  SELECT id INTO v_domain_a12 FROM iso27001_control_domains WHERE domain_number = 'A.12';
  SELECT id INTO v_domain_a13 FROM iso27001_control_domains WHERE domain_number = 'A.13';
  SELECT id INTO v_domain_a14 FROM iso27001_control_domains WHERE domain_number = 'A.14';
  SELECT id INTO v_domain_a15 FROM iso27001_control_domains WHERE domain_number = 'A.15';
  SELECT id INTO v_domain_a16 FROM iso27001_control_domains WHERE domain_number = 'A.16';
  SELECT id INTO v_domain_a17 FROM iso27001_control_domains WHERE domain_number = 'A.17';
  SELECT id INTO v_domain_a18 FROM iso27001_control_domains WHERE domain_number = 'A.18';

  -- A.12 Operations Security (14 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a12, 'A.12.1.1', 'Documented operating procedures', 'To ensure correct and secure operations', 'Operating procedures shall be documented and made available to all users who need them.', 'directive', 57),
    (v_domain_a12, 'A.12.1.2', 'Change management', 'To ensure security is maintained', 'Changes to the organization, business processes, information processing facilities and systems shall be controlled.', 'preventive', 58),
    (v_domain_a12, 'A.12.1.3', 'Capacity management', 'To ensure required system performance', 'The use of resources shall be monitored, tuned and projections made of future capacity requirements.', 'preventive', 59),
    (v_domain_a12, 'A.12.1.4', 'Separation of development, testing and operational environments', 'To reduce risks of unauthorized access', 'Development, testing, and operational environments shall be separated.', 'preventive', 60),
    (v_domain_a12, 'A.12.2.1', 'Controls against malware', 'To ensure information and information processing facilities are protected', 'Detection, prevention and recovery controls to protect against malware shall be implemented.', 'preventive', 61),
    (v_domain_a12, 'A.12.3.1', 'Information backup', 'To protect against loss of data', 'Backup copies of information, software and system images shall be taken and tested regularly.', 'preventive', 62),
    (v_domain_a12, 'A.12.4.1', 'Event logging', 'To record events and generate evidence', 'Event logs recording user activities, exceptions, faults and information security events shall be produced, kept and regularly reviewed.', 'detective', 63),
    (v_domain_a12, 'A.12.4.2', 'Protection of log information', 'To protect against tampering', 'Logging facilities and log information shall be protected against tampering and unauthorized access.', 'preventive', 64),
    (v_domain_a12, 'A.12.4.3', 'Administrator and operator logs', 'To record privileged operations', 'System administrator and system operator activities shall be logged and the logs protected and regularly reviewed.', 'detective', 65),
    (v_domain_a12, 'A.12.4.4', 'Clock synchronization', 'To ensure accuracy of audit logs', 'The clocks of all relevant information processing systems within an organization or security domain shall be synchronized.', 'preventive', 66),
    (v_domain_a12, 'A.12.5.1', 'Installation of software on operational systems', 'To ensure integrity of operational systems', 'Procedures shall be implemented to control the installation of software on operational systems.', 'preventive', 67),
    (v_domain_a12, 'A.12.6.1', 'Management of technical vulnerabilities', 'To prevent exploitation of technical vulnerabilities', 'Information about technical vulnerabilities shall be obtained timely, exposure assessed, and appropriate measures taken.', 'preventive', 68),
    (v_domain_a12, 'A.12.6.2', 'Restrictions on software installation', 'To prevent malicious software installation', 'Rules governing the installation of software by users shall be established and implemented.', 'preventive', 69),
    (v_domain_a12, 'A.12.7.1', 'Information systems audit controls', 'To minimize impact of audit activities', 'Audit requirements and activities involving verification of operational systems shall be carefully planned and agreed to minimize disruptions.', 'preventive', 70)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.13 Communications Security (7 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a13, 'A.13.1.1', 'Network controls', 'To ensure protection of information', 'Networks shall be managed and controlled to protect information in systems and applications.', 'preventive', 71),
    (v_domain_a13, 'A.13.1.2', 'Security of network services', 'To ensure security of network services', 'Security mechanisms, service levels and management requirements of network services shall be identified and included in agreements.', 'directive', 72),
    (v_domain_a13, 'A.13.1.3', 'Segregation in networks', 'To separate information services, users and information systems', 'Groups of information services, users and information systems shall be segregated on networks.', 'preventive', 73),
    (v_domain_a13, 'A.13.2.1', 'Information transfer policies and procedures', 'To protect information being transferred', 'Formal transfer policies, procedures and controls shall be in place to protect the transfer of information.', 'directive', 74),
    (v_domain_a13, 'A.13.2.2', 'Agreements on information transfer', 'To maintain security of transferred information', 'Agreements shall address the secure transfer of business information between the organization and external parties.', 'directive', 75),
    (v_domain_a13, 'A.13.2.3', 'Electronic messaging', 'To protect electronic messaging', 'Information involved in electronic messaging shall be appropriately protected.', 'preventive', 76),
    (v_domain_a13, 'A.13.2.4', 'Confidentiality or non-disclosure agreements', 'To protect confidential information', 'Requirements for confidentiality or non-disclosure agreements reflecting organizational needs shall be identified, regularly reviewed and documented.', 'directive', 77)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.14 System Acquisition, Development and Maintenance (13 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a14, 'A.14.1.1', 'Information security requirements analysis and specification', 'To ensure security is built in', 'Information security related requirements shall be included in requirements for new information systems or enhancements.', 'preventive', 78),
    (v_domain_a14, 'A.14.1.2', 'Securing application services on public networks', 'To protect information in public networks', 'Information involved in application services passing over public networks shall be protected.', 'preventive', 79),
    (v_domain_a14, 'A.14.1.3', 'Protecting application services transactions', 'To prevent incomplete transmission, mis-routing, etc.', 'Information involved in application service transactions shall be protected.', 'preventive', 80),
    (v_domain_a14, 'A.14.2.1', 'Secure development policy', 'To establish secure development practices', 'Rules for the development of software and systems shall be established and applied.', 'directive', 81),
    (v_domain_a14, 'A.14.2.2', 'System change control procedures', 'To prevent system corruption', 'Changes to systems within the development lifecycle shall be controlled by formal change control procedures.', 'preventive', 82),
    (v_domain_a14, 'A.14.2.3', 'Technical review of applications after operating platform changes', 'To ensure continued security', 'When operating platforms are changed, business critical applications shall be reviewed and tested.', 'detective', 83),
    (v_domain_a14, 'A.14.2.4', 'Restrictions on changes to software packages', 'To reduce risk of corruption', 'Modifications to software packages shall be discouraged, limited to necessary changes, and controlled.', 'preventive', 84),
    (v_domain_a14, 'A.14.2.5', 'Secure system engineering principles', 'To establish principles for engineering secure systems', 'Principles for engineering secure systems shall be established, documented, maintained and applied.', 'directive', 85),
    (v_domain_a14, 'A.14.2.6', 'Secure development environment', 'To reduce risks to development', 'Organizations shall establish and protect secure development environments for development and integration efforts.', 'preventive', 86),
    (v_domain_a14, 'A.14.2.7', 'Outsourced development', 'To ensure security of outsourced development', 'The organization shall supervise and monitor the activity of outsourced system development.', 'preventive', 87),
    (v_domain_a14, 'A.14.2.8', 'System security testing', 'To find security issues', 'Testing of security functionality shall be carried out during development.', 'detective', 88),
    (v_domain_a14, 'A.14.2.9', 'System acceptance testing', 'To ensure systems meet requirements', 'Acceptance testing programs and related criteria shall be established for new information systems, upgrades and new versions.', 'detective', 89),
    (v_domain_a14, 'A.14.3.1', 'Protection of test data', 'To ensure protection of test data', 'Test data shall be selected carefully, protected and controlled.', 'preventive', 90)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.15 Supplier Relationships (5 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a15, 'A.15.1.1', 'Information security policy for supplier relationships', 'To protect accessible assets', 'Information security requirements for mitigating risks associated with supplier access to assets shall be agreed with supplier and documented.', 'directive', 91),
    (v_domain_a15, 'A.15.1.2', 'Addressing security within supplier agreements', 'To ensure protection provided by suppliers', 'All relevant information security requirements shall be established and agreed with each supplier.', 'directive', 92),
    (v_domain_a15, 'A.15.1.3', 'Information and communication technology supply chain', 'To reduce supply chain risks', 'Agreements with suppliers shall include requirements to address information security risks associated with supply chain.', 'directive', 93),
    (v_domain_a15, 'A.15.2.1', 'Monitoring and review of supplier services', 'To maintain agreed level of security', 'Organizations shall regularly monitor, review and audit supplier service delivery.', 'detective', 94),
    (v_domain_a15, 'A.15.2.2', 'Managing changes to supplier services', 'To maintain security during changes', 'Changes to provision of services by suppliers shall be managed, taking account of criticality of business information and re-assessment of risks.', 'preventive', 95)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.16 Information Security Incident Management (7 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a16, 'A.16.1.1', 'Responsibilities and procedures', 'To ensure quick, effective, orderly response', 'Management responsibilities and procedures shall be established to ensure a quick, effective and orderly response to incidents.', 'directive', 96),
    (v_domain_a16, 'A.16.1.2', 'Reporting information security events', 'To ensure events are reported timely', 'Information security events shall be reported through appropriate management channels as quickly as possible.', 'detective', 97),
    (v_domain_a16, 'A.16.1.3', 'Reporting information security weaknesses', 'To enable timely corrective action', 'Employees and contractors using information systems and services shall note and report any observed or suspected weaknesses.', 'detective', 98),
    (v_domain_a16, 'A.16.1.4', 'Assessment of and decision on information security events', 'To classify events', 'Information security events shall be assessed and it shall be decided if they are to be classified as incidents.', 'detective', 99),
    (v_domain_a16, 'A.16.1.5', 'Response to information security incidents', 'To respond effectively', 'Information security incidents shall be responded to in accordance with documented procedures.', 'corrective', 100),
    (v_domain_a16, 'A.16.1.6', 'Learning from information security incidents', 'To reduce likelihood and impact', 'Knowledge gained from analyzing and resolving information security incidents shall be used to reduce likelihood or impact of future incidents.', 'corrective', 101),
    (v_domain_a16, 'A.16.1.7', 'Collection of evidence', 'To meet evidential requirements', 'The organization shall define and apply procedures for identification, collection, acquisition and preservation of information as evidence.', 'directive', 102)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.17 Information Security Aspects of Business Continuity Management (4 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a17, 'A.17.1.1', 'Planning information security continuity', 'To maintain security during adversity', 'The organization shall determine its requirements for information security and continuity in adverse situations.', 'directive', 103),
    (v_domain_a17, 'A.17.1.2', 'Implementing information security continuity', 'To ensure availability of security during adversity', 'The organization shall establish, document, implement and maintain processes, procedures and controls to ensure the required level of continuity for information security.', 'preventive', 104),
    (v_domain_a17, 'A.17.1.3', 'Verify, review and evaluate information security continuity', 'To ensure plans remain valid', 'The organization shall verify established and implemented information security continuity controls at regular intervals.', 'detective', 105),
    (v_domain_a17, 'A.17.2.1', 'Availability of information processing facilities', 'To ensure availability', 'Information processing facilities shall be implemented with redundancy sufficient to meet availability requirements.', 'preventive', 106)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.18 Compliance (8 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a18, 'A.18.1.1', 'Identification of applicable legislation and contractual requirements', 'To avoid breaches', 'All relevant legislative statutory, regulatory, contractual requirements shall be explicitly identified, documented and kept up to date.', 'directive', 107),
    (v_domain_a18, 'A.18.1.2', 'Intellectual property rights', 'To ensure compliance with legal requirements', 'Appropriate procedures shall be implemented to ensure compliance with legislative, regulatory and contractual requirements related to intellectual property rights.', 'directive', 108),
    (v_domain_a18, 'A.18.1.3', 'Protection of records', 'To protect from loss, destruction, falsification', 'Records shall be protected from loss, destruction, falsification, unauthorized access and unauthorized release.', 'preventive', 109),
    (v_domain_a18, 'A.18.1.4', 'Privacy and protection of personally identifiable information', 'To ensure compliance with privacy legislation', 'Privacy and protection of personally identifiable information shall be ensured as required in relevant legislation and regulation.', 'directive', 110),
    (v_domain_a18, 'A.18.1.5', 'Regulation of cryptographic controls', 'To comply with agreements, legislation and regulations', 'Cryptographic controls shall be used in compliance with all relevant agreements, legislation and regulations.', 'directive', 111),
    (v_domain_a18, 'A.18.2.1', 'Independent review of information security', 'To ensure suitability and effectiveness', 'The organizations approach to managing information security and its implementation shall be reviewed independently at planned intervals.', 'detective', 112),
    (v_domain_a18, 'A.18.2.2', 'Compliance with security policies and standards', 'To ensure compliance', 'Managers shall regularly review compliance of information processing and procedures within their area with security policies, standards and other requirements.', 'detective', 113),
    (v_domain_a18, 'A.18.2.3', 'Technical compliance review', 'To ensure systems comply', 'Information systems shall be regularly reviewed for compliance with security policies and standards.', 'detective', 114)
  ON CONFLICT (control_number) DO NOTHING;

END $$;
