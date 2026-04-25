import { supabase } from '../lib/supabase';
import type {
  PatientRegistrationData,
  MedicalHistoryData,
  InsuranceInfoData,
  ConsentFormData,
  FormSubmissionResult,
} from '../types/PatientForms';

function sanitizeInput(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/[<>]/g, '');
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

function getClientInfo(): { ipAddress?: string; userAgent?: string } {
  return {
    userAgent: navigator?.userAgent,
  };
}

function formatPhoneForStorage(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

interface AllFormsPayload {
  registration: PatientRegistrationData;
  medicalHistory: MedicalHistoryData;
  insurance: InsuranceInfoData;
  consent: ConsentFormData;
}

export async function submitAllPatientForms(
  payload: AllFormsPayload
): Promise<FormSubmissionResult> {
  try {
    const userId = await getCurrentUserId();
    const clientInfo = getClientInfo();
    const { registration, medicalHistory, insurance, consent } = payload;

    const registrationData = {
      user_id: userId,
      first_name: sanitizeInput(registration.firstName),
      last_name: sanitizeInput(registration.lastName),
      date_of_birth: registration.dateOfBirth || null,
      phone_number: sanitizeInput(formatPhoneForStorage(registration.phoneNumber)),
      email_address: sanitizeInput(registration.emailAddress),
      street_address: sanitizeInput(registration.streetAddress),
      city: sanitizeInput(registration.city),
      state: sanitizeInput(registration.state),
      zip: sanitizeInput(registration.zip),
      reason_for_visit: sanitizeInput(registration.reasonForVisit),
      form_source: 'web_form',
      status: 'submitted',
    };

    const { data: regResult, error: regError } = await supabase
      .from('patient_registrations')
      .insert([registrationData])
      .select()
      .maybeSingle();

    if (regError) {
      return {
        success: false,
        message: 'Failed to submit registration',
        error: regError.message,
      };
    }

    const registrationId = regResult?.id;

    const medicalHistoryData = {
      registration_id: registrationId,
      user_id: userId,
      vision_correction: medicalHistory.visionCorrection || null,
      last_eye_exam_date: sanitizeInput(medicalHistory.lastEyeExamDate),
      last_eye_exam_doctor: sanitizeInput(medicalHistory.lastEyeExamDoctor),
      last_eye_exam_clinic: sanitizeInput(medicalHistory.lastEyeExamClinic),
      last_eye_exam_may_verify: medicalHistory.lastEyeExamMayVerify,
      prescription_age: sanitizeInput(medicalHistory.prescriptionAge),
      prescription_changed_past_year: medicalHistory.prescriptionChangedPastYear || null,
      current_symptoms: medicalHistory.currentSymptoms || [],
      eye_injuries: medicalHistory.eyeInjuries || null,
      eye_injuries_details: sanitizeInput(medicalHistory.eyeInjuriesDetails),
      eye_surgery_history: medicalHistory.eyeSurgeryHistory || null,
      eye_surgery_details: sanitizeInput(medicalHistory.eyeSurgeryDetails),
      medical_conditions: medicalHistory.medicalConditions || [],
      medical_conditions_other: sanitizeInput(medicalHistory.medicalConditionsOther),
      current_medications: sanitizeInput(medicalHistory.currentMedications),
      has_allergies: medicalHistory.hasAllergies || null,
      allergies_details: sanitizeInput(medicalHistory.allergiesDetails),
      family_history_conditions: medicalHistory.familyHistoryConditions || [],
      status: 'submitted',
    };

    const { error: medError } = await supabase
      .from('patient_medical_histories')
      .insert([medicalHistoryData]);

    if (medError) {
      return {
        success: false,
        message: 'Failed to submit medical history',
        error: medError.message,
      };
    }

    const insuranceData = {
      registration_id: registrationId,
      user_id: userId,
      has_hsa_fsa: insurance.hasHsaFsa || null,
      hsa_fsa_provider: sanitizeInput(insurance.hsaFsaProvider),
      account_holder_name: sanitizeInput(insurance.accountHolderName),
      estimated_balance: sanitizeInput(insurance.estimatedBalance),
      interested_in_payment_plan: insurance.interestedInPaymentPlan || null,
      additional_notes: sanitizeInput(insurance.additionalNotes),
      status: 'submitted',
    };

    const { error: insError } = await supabase
      .from('patient_insurance_info')
      .insert([insuranceData]);

    if (insError) {
      return {
        success: false,
        message: 'Failed to submit insurance information',
        error: insError.message,
      };
    }

    const consentData = {
      registration_id: registrationId,
      user_id: userId,
      hipaa_privacy_acknowledgment: consent.hipaaPrivacyAcknowledgment,
      consent_to_treatment: consent.consentToTreatment,
      patient_signature: sanitizeInput(consent.patientSignature),
      signature_date: consent.signatureDate,
      ip_address: clientInfo.ipAddress,
      user_agent: clientInfo.userAgent,
      status: 'submitted',
    };

    const { error: consentError } = await supabase
      .from('patient_consent_forms')
      .insert([consentData]);

    if (consentError) {
      return {
        success: false,
        message: 'Failed to submit consent form',
        error: consentError.message,
      };
    }

    return {
      success: true,
      message: 'All forms submitted successfully',
      data: regResult || undefined,
    };
  } catch (err) {
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\(\)\-\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateDateOfBirth(dob: string): boolean {
  const parts = dob.split('-');
  if (parts.length !== 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  const now = new Date();
  const minYear = now.getFullYear() - 120;

  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day &&
    date <= now &&
    year >= minYear
  );
}

export function validateSignatureDate(dateStr: string): boolean {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 7);

  return date <= today && date >= minDate;
}

export function formatPhoneNumber(phone: string): string {
  return formatPhoneForStorage(phone);
}

export interface ExistingSubmission {
  registrationId: string;
  medicalHistoryId: string;
  insuranceId: string;
  consentId: string;
  registration: PatientRegistrationData;
  medicalHistory: MedicalHistoryData;
  insurance: InsuranceInfoData;
  consent: ConsentFormData;
}

export async function loadLatestSubmission(): Promise<{
  data: ExistingSubmission | null;
  error: string | null;
}> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { data: null, error: 'Not authenticated' };

    const { data: reg, error: regErr } = await supabase
      .from('patient_registrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (regErr || !reg) return { data: null, error: regErr?.message || null };

    const [medRes, insRes, conRes] = await Promise.all([
      supabase
        .from('patient_medical_histories')
        .select('*')
        .eq('registration_id', reg.id)
        .maybeSingle(),
      supabase
        .from('patient_insurance_info')
        .select('*')
        .eq('registration_id', reg.id)
        .maybeSingle(),
      supabase
        .from('patient_consent_forms')
        .select('*')
        .eq('registration_id', reg.id)
        .maybeSingle(),
    ]);

    const med = medRes.data;
    const ins = insRes.data;
    const con = conRes.data;

    if (!med || !ins || !con) return { data: null, error: 'Incomplete submission' };

    return {
      data: {
        registrationId: reg.id,
        medicalHistoryId: med.id,
        insuranceId: ins.id,
        consentId: con.id,
        registration: {
          firstName: reg.first_name || '',
          lastName: reg.last_name || '',
          dateOfBirth: reg.date_of_birth || '',
          phoneNumber: reg.phone_number || '',
          emailAddress: reg.email_address || '',
          streetAddress: reg.street_address || '',
          city: reg.city || '',
          state: reg.state || '',
          zip: reg.zip || '',
          reasonForVisit: reg.reason_for_visit || '',
        },
        medicalHistory: {
          visionCorrection: med.vision_correction || { glasses: false, contacts: false, contactType: '', toricDetails: '' },
          lastEyeExamDate: med.last_eye_exam_date || '',
          lastEyeExamDoctor: med.last_eye_exam_doctor || '',
          lastEyeExamClinic: med.last_eye_exam_clinic || '',
          lastEyeExamMayVerify: med.last_eye_exam_may_verify || false,
          prescriptionAge: med.prescription_age || '',
          prescriptionChangedPastYear: med.prescription_changed_past_year || '',
          currentSymptoms: med.current_symptoms || [],
          eyeInjuries: med.eye_injuries || '',
          eyeInjuriesDetails: med.eye_injuries_details || '',
          eyeSurgeryHistory: med.eye_surgery_history || '',
          eyeSurgeryDetails: med.eye_surgery_details || '',
          medicalConditions: med.medical_conditions || [],
          medicalConditionsOther: med.medical_conditions_other || '',
          currentMedications: med.current_medications || '',
          hasAllergies: med.has_allergies || '',
          allergiesDetails: med.allergies_details || '',
          familyHistoryConditions: med.family_history_conditions || [],
        },
        insurance: {
          hasHsaFsa: ins.has_hsa_fsa || '',
          hsaFsaProvider: ins.hsa_fsa_provider || '',
          accountHolderName: ins.account_holder_name || '',
          estimatedBalance: ins.estimated_balance || '',
          interestedInPaymentPlan: ins.interested_in_payment_plan || '',
          additionalNotes: ins.additional_notes || '',
        },
        consent: {
          hipaaPrivacyAcknowledgment: con.hipaa_privacy_acknowledgment || false,
          consentToTreatment: con.consent_to_treatment || false,
          patientSignature: con.patient_signature || '',
          signatureDate: con.signature_date || '',
        },
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function updateAllPatientForms(
  ids: { registrationId: string; medicalHistoryId: string; insuranceId: string; consentId: string },
  payload: AllFormsPayload
): Promise<FormSubmissionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: 'Not authenticated', error: 'Not authenticated' };
    }

    const clientInfo = getClientInfo();
    const { registration, medicalHistory, insurance, consent } = payload;

    const { error: regError } = await supabase
      .from('patient_registrations')
      .update({
        first_name: sanitizeInput(registration.firstName),
        last_name: sanitizeInput(registration.lastName),
        date_of_birth: registration.dateOfBirth || null,
        phone_number: sanitizeInput(formatPhoneForStorage(registration.phoneNumber)),
        email_address: sanitizeInput(registration.emailAddress),
        street_address: sanitizeInput(registration.streetAddress),
        city: sanitizeInput(registration.city),
        state: sanitizeInput(registration.state),
        zip: sanitizeInput(registration.zip),
        reason_for_visit: sanitizeInput(registration.reasonForVisit),
      })
      .eq('id', ids.registrationId)
      .eq('user_id', userId);

    if (regError) {
      return { success: false, message: 'Failed to update registration', error: regError.message };
    }

    const { error: medError } = await supabase
      .from('patient_medical_histories')
      .update({
        vision_correction: medicalHistory.visionCorrection || null,
        last_eye_exam_date: sanitizeInput(medicalHistory.lastEyeExamDate),
        last_eye_exam_doctor: sanitizeInput(medicalHistory.lastEyeExamDoctor),
        last_eye_exam_clinic: sanitizeInput(medicalHistory.lastEyeExamClinic),
        last_eye_exam_may_verify: medicalHistory.lastEyeExamMayVerify,
        prescription_age: sanitizeInput(medicalHistory.prescriptionAge),
        prescription_changed_past_year: medicalHistory.prescriptionChangedPastYear || null,
        current_symptoms: medicalHistory.currentSymptoms || [],
        eye_injuries: medicalHistory.eyeInjuries || null,
        eye_injuries_details: sanitizeInput(medicalHistory.eyeInjuriesDetails),
        eye_surgery_history: medicalHistory.eyeSurgeryHistory || null,
        eye_surgery_details: sanitizeInput(medicalHistory.eyeSurgeryDetails),
        medical_conditions: medicalHistory.medicalConditions || [],
        medical_conditions_other: sanitizeInput(medicalHistory.medicalConditionsOther),
        current_medications: sanitizeInput(medicalHistory.currentMedications),
        has_allergies: medicalHistory.hasAllergies || null,
        allergies_details: sanitizeInput(medicalHistory.allergiesDetails),
        family_history_conditions: medicalHistory.familyHistoryConditions || [],
      })
      .eq('id', ids.medicalHistoryId)
      .eq('user_id', userId);

    if (medError) {
      return { success: false, message: 'Failed to update medical history', error: medError.message };
    }

    const { error: insError } = await supabase
      .from('patient_insurance_info')
      .update({
        has_hsa_fsa: insurance.hasHsaFsa || null,
        hsa_fsa_provider: sanitizeInput(insurance.hsaFsaProvider),
        account_holder_name: sanitizeInput(insurance.accountHolderName),
        estimated_balance: sanitizeInput(insurance.estimatedBalance),
        interested_in_payment_plan: insurance.interestedInPaymentPlan || null,
        additional_notes: sanitizeInput(insurance.additionalNotes),
      })
      .eq('id', ids.insuranceId)
      .eq('user_id', userId);

    if (insError) {
      return { success: false, message: 'Failed to update insurance info', error: insError.message };
    }

    const { error: consentError } = await supabase
      .from('patient_consent_forms')
      .update({
        hipaa_privacy_acknowledgment: consent.hipaaPrivacyAcknowledgment,
        consent_to_treatment: consent.consentToTreatment,
        patient_signature: sanitizeInput(consent.patientSignature),
        signature_date: consent.signatureDate,
        ip_address: clientInfo.ipAddress,
        user_agent: clientInfo.userAgent,
      })
      .eq('id', ids.consentId)
      .eq('user_id', userId);

    if (consentError) {
      return { success: false, message: 'Failed to update consent form', error: consentError.message };
    }

    return { success: true, message: 'All forms updated successfully' };
  } catch (err) {
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
