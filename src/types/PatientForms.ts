/**
 * Atelier LASIK - Patient Forms Type Definitions
 *
 * TypeScript interfaces for the tabbed patient forms system including:
 * - New Patient Registration
 * - Medical History
 * - Insurance Information
 * - Consent Forms
 *
 * @module types/PatientForms
 */

// =====================================================
// Tab 1: New Patient Registration
// =====================================================

export interface PatientRegistrationData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  emailAddress: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  reasonForVisit?: string;
}

export interface PatientRegistrationFormData extends PatientRegistrationData {
  id?: string;
  userId?: string;
  status?: 'submitted' | 'in_review' | 'processed' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// Tab 2: Medical History
// =====================================================

export interface VisionCorrectionData {
  glasses: boolean;
  contacts: boolean;
  contactType?: 'soft' | 'hard' | 'extended_wear' | 'toric' | '';
  toricDetails?: string;
}

export interface MedicalHistoryData {
  visionCorrection?: VisionCorrectionData;
  lastEyeExamDate?: string;
  lastEyeExamDoctor?: string;
  lastEyeExamClinic?: string;
  lastEyeExamMayVerify?: boolean;
  prescriptionAge?: string;
  prescriptionChangedPastYear?: 'no' | 'yes' | 'not_sure' | '';
  currentSymptoms?: string[];
  eyeInjuries?: 'no' | 'yes' | '';
  eyeInjuriesDetails?: string;
  eyeSurgeryHistory?: 'no' | 'yes' | '';
  eyeSurgeryDetails?: string;
  medicalConditions?: string[];
  medicalConditionsOther?: string;
  currentMedications?: string;
  hasAllergies?: 'yes' | 'no' | '';
  allergiesDetails?: string;
  familyHistoryConditions?: string[];
}

export interface MedicalHistoryFormData extends MedicalHistoryData {
  id?: string;
  registrationId?: string;
  userId?: string;
  status?: 'submitted' | 'in_review' | 'processed' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// Tab 3: HSA / FSA Information
// =====================================================

export interface InsuranceInfoData {
  hasHsaFsa?: 'hsa' | 'fsa' | 'both' | 'none' | '';
  hsaFsaProvider?: string;
  accountHolderName?: string;
  estimatedBalance?: string;
  interestedInPaymentPlan?: 'yes' | 'no' | '';
  additionalNotes?: string;
}

export interface InsuranceInfoFormData extends InsuranceInfoData {
  id?: string;
  registrationId?: string;
  userId?: string;
  status?: 'submitted' | 'in_review' | 'processed' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// Tab 4: Consent Forms
// =====================================================

export interface ConsentFormData {
  hipaaPrivacyAcknowledgment: boolean;
  consentToTreatment: boolean;
  patientSignature: string;
  signatureDate: string;
}

export interface ConsentFormDataComplete extends ConsentFormData {
  id?: string;
  registrationId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: 'submitted' | 'in_review' | 'processed' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// Combined Form State
// =====================================================

export interface PatientFormsState {
  registration: PatientRegistrationData;
  medicalHistory: MedicalHistoryData;
  insuranceInfo: InsuranceInfoData;
  consent: ConsentFormData;
}

// =====================================================
// Form Submission Status
// =====================================================

export interface FormSubmissionStatus {
  registration: boolean;
  medicalHistory: boolean;
  insuranceInfo: boolean;
  consent: boolean;
}

export interface FormSubmissionResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    [key: string]: unknown;
  };
  error?: string;
}

// =====================================================
// Tab Configuration
// =====================================================

export type PatientFormTab =
  | 'registration'
  | 'medicalHistory'
  | 'insuranceInfo'
  | 'consent';

export interface TabConfig {
  id: PatientFormTab;
  label: string;
  icon: string;
}

// =====================================================
// Validation Errors
// =====================================================

export interface ValidationErrors {
  [key: string]: string | undefined;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}
