/**
 * ClearSight LASIK - Patient Forms Service
 *
 * Service layer for handling patient forms submissions to Supabase.
 * Implements HIPAA-compliant data handling and secure submission.
 *
 * @module services/patientFormsService
 */

import { supabase } from '../lib/supabase';
import type {
  PatientRegistrationData,
  MedicalHistoryData,
  InsuranceInfoData,
  ConsentFormData,
  FormSubmissionResult,
} from '../types/PatientForms';

// =====================================================
// Utility Functions
// =====================================================

/**
 * Sanitizes input to prevent XSS and SQL injection
 */
function sanitizeInput(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/[<>]/g, '');
}

/**
 * Gets current user ID if authenticated
 */
async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Gets client IP address and user agent for audit trail
 */
function getClientInfo(): { ipAddress?: string; userAgent?: string } {
  return {
    userAgent: navigator?.userAgent,
  };
}

// =====================================================
// Patient Registration Service
// =====================================================

export async function submitPatientRegistration(
  data: PatientRegistrationData
): Promise<FormSubmissionResult> {
  try {
    const userId = await getCurrentUserId();

    const sanitizedData = {
      user_id: userId,
      first_name: sanitizeInput(data.firstName),
      last_name: sanitizeInput(data.lastName),
      date_of_birth: data.dateOfBirth,
      phone_number: sanitizeInput(data.phoneNumber),
      email_address: sanitizeInput(data.emailAddress),
      street_address: sanitizeInput(data.streetAddress),
      city: sanitizeInput(data.city),
      state: sanitizeInput(data.state),
      zip: sanitizeInput(data.zip),
      reason_for_visit: sanitizeInput(data.reasonForVisit),
      form_source: 'web_form',
      status: 'submitted',
    };

    const { data: result, error } = await supabase
      .from('patient_registrations')
      .insert([sanitizedData])
      .select()
      .maybeSingle();

    if (error) {
      return {
        success: false,
        message: 'Failed to submit registration',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Registration submitted successfully',
      data: result || undefined,
    };
  } catch (err) {
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// =====================================================
// Medical History Service
// =====================================================

export async function submitMedicalHistory(
  data: MedicalHistoryData,
  registrationId?: string
): Promise<FormSubmissionResult> {
  try {
    const userId = await getCurrentUserId();

    const sanitizedData = {
      registration_id: registrationId,
      user_id: userId,
      vision_correction: data.visionCorrection || null,
      last_eye_exam_date: sanitizeInput(data.lastEyeExamDate),
      last_eye_exam_doctor: sanitizeInput(data.lastEyeExamDoctor),
      last_eye_exam_clinic: sanitizeInput(data.lastEyeExamClinic),
      last_eye_exam_may_verify: data.lastEyeExamMayVerify,
      prescription_age: sanitizeInput(data.prescriptionAge),
      prescription_changed_past_year: data.prescriptionChangedPastYear || null,
      current_symptoms: data.currentSymptoms || [],
      eye_injuries: data.eyeInjuries || null,
      eye_injuries_details: sanitizeInput(data.eyeInjuriesDetails),
      eye_surgery_history: data.eyeSurgeryHistory || null,
      eye_surgery_details: sanitizeInput(data.eyeSurgeryDetails),
      medical_conditions: data.medicalConditions || [],
      medical_conditions_other: sanitizeInput(data.medicalConditionsOther),
      current_medications: sanitizeInput(data.currentMedications),
      has_allergies: data.hasAllergies || null,
      allergies_details: sanitizeInput(data.allergiesDetails),
      family_history_conditions: data.familyHistoryConditions || [],
      status: 'submitted',
    };

    const { data: result, error } = await supabase
      .from('patient_medical_histories')
      .insert([sanitizedData])
      .select()
      .maybeSingle();

    if (error) {
      return {
        success: false,
        message: 'Failed to submit medical history',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Medical history submitted successfully',
      data: result || undefined,
    };
  } catch (err) {
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// =====================================================
// Insurance Information Service
// =====================================================

export async function submitInsuranceInfo(
  data: InsuranceInfoData,
  registrationId?: string
): Promise<FormSubmissionResult> {
  try {
    const userId = await getCurrentUserId();

    const sanitizedData = {
      registration_id: registrationId,
      user_id: userId,
      has_hsa_fsa: data.hasHsaFsa || null,
      hsa_fsa_provider: sanitizeInput(data.hsaFsaProvider),
      account_holder_name: sanitizeInput(data.accountHolderName),
      estimated_balance: sanitizeInput(data.estimatedBalance),
      interested_in_payment_plan: data.interestedInPaymentPlan || null,
      additional_notes: sanitizeInput(data.additionalNotes),
      status: 'submitted',
    };

    const { data: result, error } = await supabase
      .from('patient_insurance_info')
      .insert([sanitizedData])
      .select()
      .maybeSingle();

    if (error) {
      return {
        success: false,
        message: 'Failed to submit insurance information',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Insurance information submitted successfully',
      data: result || undefined,
    };
  } catch (err) {
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// =====================================================
// Consent Form Service
// =====================================================

export async function submitConsentForm(
  data: ConsentFormData,
  registrationId?: string
): Promise<FormSubmissionResult> {
  try {
    const userId = await getCurrentUserId();
    const clientInfo = getClientInfo();

    const sanitizedData = {
      registration_id: registrationId,
      user_id: userId,
      hipaa_privacy_acknowledgment: data.hipaaPrivacyAcknowledgment,
      consent_to_treatment: data.consentToTreatment,
      patient_signature: sanitizeInput(data.patientSignature),
      signature_date: data.signatureDate,
      ip_address: clientInfo.ipAddress,
      user_agent: clientInfo.userAgent,
      status: 'submitted',
    };

    const { data: result, error } = await supabase
      .from('patient_consent_forms')
      .insert([sanitizedData])
      .select()
      .maybeSingle();

    if (error) {
      return {
        success: false,
        message: 'Failed to submit consent form',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Consent form submitted successfully',
      data: result || undefined,
    };
  } catch (err) {
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// =====================================================
// Validation Functions
// =====================================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\(\)\-\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateDateOfBirth(dob: string): boolean {
  const date = new Date(dob);
  const now = new Date();
  const minDate = new Date();
  minDate.setFullYear(now.getFullYear() - 120);

  return date <= now && date >= minDate;
}

export function validateSignatureDate(date: string): boolean {
  const signDate = new Date(date);
  const now = new Date();
  const minDate = new Date();
  minDate.setDate(now.getDate() - 7);

  return signDate <= now && signDate >= minDate;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}
