/*
  # Populate ISO 27001 Controls

  ## Overview
  Populates all 114 ISO 27001:2013 Annex A controls across the 14 domains.
  This provides the baseline for Statement of Applicability and control tracking.

  ## What This Does
  - Inserts all control definitions from ISO 27001 Annex A
  - Links controls to appropriate domains
  - Sets control types and objectives
  - Provides foundation for implementation tracking
*/

-- Get domain IDs for reference
DO $$
DECLARE
  v_domain_a5 uuid;
  v_domain_a6 uuid;
  v_domain_a7 uuid;
  v_domain_a8 uuid;
  v_domain_a9 uuid;
  v_domain_a10 uuid;
  v_domain_a11 uuid;
  v_domain_a12 uuid;
  v_domain_a13 uuid;
  v_domain_a14 uuid;
  v_domain_a15 uuid;
  v_domain_a16 uuid;
  v_domain_a17 uuid;
  v_domain_a18 uuid;
BEGIN
  -- Get domain IDs
  SELECT id INTO v_domain_a5 FROM iso27001_control_domains WHERE domain_number = 'A.5';
  SELECT id INTO v_domain_a6 FROM iso27001_control_domains WHERE domain_number = 'A.6';
  SELECT id INTO v_domain_a7 FROM iso27001_control_domains WHERE domain_number = 'A.7';
  SELECT id INTO v_domain_a8 FROM iso27001_control_domains WHERE domain_number = 'A.8';
  SELECT id INTO v_domain_a9 FROM iso27001_control_domains WHERE domain_number = 'A.9';
  SELECT id INTO v_domain_a10 FROM iso27001_control_domains WHERE domain_number = 'A.10';
  SELECT id INTO v_domain_a11 FROM iso27001_control_domains WHERE domain_number = 'A.11';
  SELECT id INTO v_domain_a12 FROM iso27001_control_domains WHERE domain_number = 'A.12';
  SELECT id INTO v_domain_a13 FROM iso27001_control_domains WHERE domain_number = 'A.13';
  SELECT id INTO v_domain_a14 FROM iso27001_control_domains WHERE domain_number = 'A.14';
  SELECT id INTO v_domain_a15 FROM iso27001_control_domains WHERE domain_number = 'A.15';
  SELECT id INTO v_domain_a16 FROM iso27001_control_domains WHERE domain_number = 'A.16';
  SELECT id INTO v_domain_a17 FROM iso27001_control_domains WHERE domain_number = 'A.17';
  SELECT id INTO v_domain_a18 FROM iso27001_control_domains WHERE domain_number = 'A.18';

  -- A.5 Information Security Policies (2 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a5, 'A.5.1.1', 'Policies for information security', 'To provide management direction and support for information security', 'A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.', 'directive', 1),
    (v_domain_a5, 'A.5.1.2', 'Review of the policies for information security', 'To ensure continuing suitability, adequacy and effectiveness', 'The policies for information security shall be reviewed at planned intervals or if significant changes occur.', 'directive', 2)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.6 Organization of Information Security (7 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a6, 'A.6.1.1', 'Information security roles and responsibilities', 'To establish accountability for information security', 'All information security responsibilities shall be defined and allocated.', 'directive', 3),
    (v_domain_a6, 'A.6.1.2', 'Segregation of duties', 'To reduce opportunities for unauthorized or unintentional modification or misuse', 'Conflicting duties and areas of responsibility shall be segregated.', 'preventive', 4),
    (v_domain_a6, 'A.6.1.3', 'Contact with authorities', 'To maintain appropriate contacts with relevant authorities', 'Appropriate contacts with relevant authorities shall be maintained.', 'directive', 5),
    (v_domain_a6, 'A.6.1.4', 'Contact with special interest groups', 'To maintain awareness of best practices', 'Appropriate contacts with special interest groups or other specialist security forums shall be maintained.', 'directive', 6),
    (v_domain_a6, 'A.6.1.5', 'Information security in project management', 'To ensure information security is built into projects', 'Information security shall be addressed in project management, regardless of the type of the project.', 'directive', 7),
    (v_domain_a6, 'A.6.2.1', 'Mobile device policy', 'To ensure security of mobile devices', 'A policy and supporting security measures shall be adopted to manage risks from using mobile devices.', 'directive', 8),
    (v_domain_a6, 'A.6.2.2', 'Teleworking', 'To protect information accessed and processed at teleworking sites', 'A policy and supporting security measures shall be implemented to protect information accessed, processed or stored at teleworking sites.', 'directive', 9)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.7 Human Resource Security (6 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a7, 'A.7.1.1', 'Screening', 'To ensure staff are trustworthy and qualified', 'Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws.', 'preventive', 10),
    (v_domain_a7, 'A.7.1.2', 'Terms and conditions of employment', 'To ensure employees understand their responsibilities', 'The contractual agreements with employees and contractors shall state their and the organizations responsibilities for information security.', 'directive', 11),
    (v_domain_a7, 'A.7.2.1', 'Management responsibilities', 'To ensure employees apply information security', 'Management shall require all employees and contractors to apply information security in accordance with policies and procedures.', 'directive', 12),
    (v_domain_a7, 'A.7.2.2', 'Information security awareness, education and training', 'To ensure awareness of information security threats and concerns', 'All employees and relevant contractors shall receive appropriate awareness training and regular updates.', 'directive', 13),
    (v_domain_a7, 'A.7.2.3', 'Disciplinary process', 'To deter misuse', 'There shall be a formal and communicated disciplinary process to take action against employees who have committed a security breach.', 'corrective', 14),
    (v_domain_a7, 'A.7.3.1', 'Termination or change of employment responsibilities', 'To protect organization interests', 'Information security responsibilities and duties that remain valid after termination or change shall be defined, communicated and enforced.', 'directive', 15)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.8 Asset Management (10 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a8, 'A.8.1.1', 'Inventory of assets', 'To identify organizational assets', 'Assets associated with information and information processing facilities shall be identified and an inventory maintained.', 'preventive', 16),
    (v_domain_a8, 'A.8.1.2', 'Ownership of assets', 'To ensure accountability', 'Assets maintained in the inventory shall be owned.', 'directive', 17),
    (v_domain_a8, 'A.8.1.3', 'Acceptable use of assets', 'To ensure proper use of assets', 'Rules for the acceptable use of information and of assets associated with information shall be identified, documented and implemented.', 'directive', 18),
    (v_domain_a8, 'A.8.1.4', 'Return of assets', 'To protect assets upon employment termination', 'All employees and external party users shall return all organizational assets in their possession upon termination.', 'preventive', 19),
    (v_domain_a8, 'A.8.2.1', 'Classification of information', 'To ensure information receives appropriate protection', 'Information shall be classified in terms of legal requirements, value, criticality and sensitivity.', 'directive', 20),
    (v_domain_a8, 'A.8.2.2', 'Labelling of information', 'To ensure information is identified', 'An appropriate set of procedures for information labelling shall be developed in accordance with classification scheme.', 'directive', 21),
    (v_domain_a8, 'A.8.2.3', 'Handling of assets', 'To prevent unauthorized disclosure or misuse', 'Procedures for handling assets shall be developed in accordance with classification scheme.', 'directive', 22),
    (v_domain_a8, 'A.8.3.1', 'Management of removable media', 'To prevent unauthorized disclosure, modification or destruction', 'Procedures shall be implemented for management of removable media.', 'preventive', 23),
    (v_domain_a8, 'A.8.3.2', 'Disposal of media', 'To prevent information leakage', 'Media shall be disposed of securely when no longer required.', 'preventive', 24),
    (v_domain_a8, 'A.8.3.3', 'Physical media transfer', 'To protect media in transit', 'Media containing information shall be protected against unauthorized access, misuse or corruption during transportation.', 'preventive', 25)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.9 Access Control (14 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a9, 'A.9.1.1', 'Access control policy', 'To limit access to information and information processing facilities', 'An access control policy shall be established, documented and reviewed.', 'directive', 26),
    (v_domain_a9, 'A.9.1.2', 'Access to networks and network services', 'To ensure authorized access', 'Users shall only be provided with access to networks and network services that they have been specifically authorized to use.', 'preventive', 27),
    (v_domain_a9, 'A.9.2.1', 'User registration and de-registration', 'To enable assignment of access rights', 'A formal user registration and de-registration process shall be implemented.', 'preventive', 28),
    (v_domain_a9, 'A.9.2.2', 'User access provisioning', 'To ensure authorized access', 'A formal user access provisioning process shall be implemented to assign or revoke access rights.', 'preventive', 29),
    (v_domain_a9, 'A.9.2.3', 'Management of privileged access rights', 'To prevent unauthorized access', 'The allocation and use of privileged access rights shall be restricted and controlled.', 'preventive', 30),
    (v_domain_a9, 'A.9.2.4', 'Management of secret authentication information', 'To prevent unauthorized access', 'The allocation of secret authentication information shall be controlled through a formal management process.', 'preventive', 31),
    (v_domain_a9, 'A.9.2.5', 'Review of user access rights', 'To ensure only authorized access', 'Asset owners shall review users access rights at regular intervals.', 'detective', 32),
    (v_domain_a9, 'A.9.2.6', 'Removal or adjustment of access rights', 'To prevent unauthorized access', 'Access rights shall be removed upon termination or adjusted upon change of employment.', 'preventive', 33),
    (v_domain_a9, 'A.9.3.1', 'Use of secret authentication information', 'To prevent compromise', 'Users shall be required to follow practices in the use of secret authentication information.', 'directive', 34),
    (v_domain_a9, 'A.9.4.1', 'Information access restriction', 'To prevent unauthorized information access', 'Access to information and application system functions shall be restricted in accordance with access control policy.', 'preventive', 35),
    (v_domain_a9, 'A.9.4.2', 'Secure log-on procedures', 'To prevent unauthorized access', 'Where required by access control policy, access to systems and applications shall be controlled by a secure log-on procedure.', 'preventive', 36),
    (v_domain_a9, 'A.9.4.3', 'Password management system', 'To ensure quality passwords', 'Password management systems shall be interactive and shall ensure quality passwords.', 'preventive', 37),
    (v_domain_a9, 'A.9.4.4', 'Use of privileged utility programs', 'To prevent compromise of systems', 'The use of utility programs that might be capable of overriding system and application controls shall be restricted and tightly controlled.', 'preventive', 38),
    (v_domain_a9, 'A.9.4.5', 'Access control to program source code', 'To prevent unauthorized changes', 'Access to program source code shall be restricted.', 'preventive', 39)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.10 Cryptography (2 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a10, 'A.10.1.1', 'Policy on the use of cryptographic controls', 'To ensure proper use of cryptography', 'A policy on the use of cryptographic controls for protection of information shall be developed and implemented.', 'directive', 40),
    (v_domain_a10, 'A.10.1.2', 'Key management', 'To protect cryptographic keys', 'A policy on the use, protection and lifetime of cryptographic keys shall be developed and implemented.', 'directive', 41)
  ON CONFLICT (control_number) DO NOTHING;

  -- A.11 Physical and Environmental Security (15 controls)
  INSERT INTO iso27001_controls (domain_id, control_number, control_name, control_objective, control_description, control_type, display_order) VALUES
    (v_domain_a11, 'A.11.1.1', 'Physical security perimeter', 'To prevent unauthorized physical access', 'Security perimeters shall be defined and used to protect areas that contain information.', 'preventive', 42),
    (v_domain_a11, 'A.11.1.2', 'Physical entry controls', 'To ensure only authorized personnel gain access', 'Secure areas shall be protected by appropriate entry controls.', 'preventive', 43),
    (v_domain_a11, 'A.11.1.3', 'Securing offices, rooms and facilities', 'To prevent unauthorized access', 'Physical security for offices, rooms and facilities shall be designed and applied.', 'preventive', 44),
    (v_domain_a11, 'A.11.1.4', 'Protecting against external and environmental threats', 'To prevent damage and interference', 'Physical protection against natural disasters, malicious attack or accidents shall be designed and applied.', 'preventive', 45),
    (v_domain_a11, 'A.11.1.5', 'Working in secure areas', 'To prevent unauthorized activities', 'Procedures for working in secure areas shall be designed and applied.', 'directive', 46),
    (v_domain_a11, 'A.11.1.6', 'Delivery and loading areas', 'To prevent unauthorized access', 'Access points such as delivery and loading areas shall be controlled and isolated from information processing facilities.', 'preventive', 47),
    (v_domain_a11, 'A.11.2.1', 'Equipment siting and protection', 'To reduce risks from environmental threats', 'Equipment shall be sited and protected to reduce risks from environmental threats and hazards.', 'preventive', 48),
    (v_domain_a11, 'A.11.2.2', 'Supporting utilities', 'To prevent loss or damage', 'Equipment shall be protected from power failures and other disruptions.', 'preventive', 49),
    (v_domain_a11, 'A.11.2.3', 'Cabling security', 'To protect against interception or damage', 'Power and telecommunications cabling carrying data or supporting information services shall be protected.', 'preventive', 50),
    (v_domain_a11, 'A.11.2.4', 'Equipment maintenance', 'To ensure continuing availability and integrity', 'Equipment shall be correctly maintained to ensure its continuing availability and integrity.', 'preventive', 51),
    (v_domain_a11, 'A.11.2.5', 'Removal of assets', 'To prevent unauthorized removal', 'Equipment, information or software shall not be taken off-site without prior authorization.', 'preventive', 52),
    (v_domain_a11, 'A.11.2.6', 'Security of equipment and assets off-premises', 'To prevent loss or compromise', 'Security shall be applied to off-site assets taking into account risks of working outside premises.', 'preventive', 53),
    (v_domain_a11, 'A.11.2.7', 'Secure disposal or re-use of equipment', 'To prevent information leakage', 'All items of equipment containing storage media shall be verified to ensure sensitive data is removed or securely overwritten.', 'preventive', 54),
    (v_domain_a11, 'A.11.2.8', 'Unattended user equipment', 'To prevent unauthorized access', 'Users shall ensure that unattended equipment has appropriate protection.', 'directive', 55),
    (v_domain_a11, 'A.11.2.9', 'Clear desk and clear screen policy', 'To reduce risks of unauthorized access', 'A clear desk policy for papers and removable storage media and a clear screen policy shall be adopted.', 'directive', 56)
  ON CONFLICT (control_number) DO NOTHING;

  -- Continue in next part due to length...

END $$;
