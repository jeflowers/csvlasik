import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clipboard,
  CreditCard,
  Shield,
  ChevronDown,
  ChevronUp,
  Pencil,
  Clock,
  CalendarClock,
  Star,
} from 'lucide-react';
import { usePatient } from '../../hooks/usePatient';
import { supabase } from '../../lib/supabase';

interface RegistrationRecord {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  email_address: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  reason_for_visit?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MedicalHistoryRecord {
  id: string;
  vision_correction?: { glasses?: boolean; contacts?: boolean; contactType?: string };
  last_eye_exam_date?: string;
  last_eye_exam_doctor?: string;
  prescription_age?: string;
  current_symptoms?: string[];
  eye_injuries?: string;
  eye_surgery_history?: string;
  medical_conditions?: string[];
  current_medications?: string;
  has_allergies?: string;
  family_history_conditions?: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface InsuranceRecord {
  id: string;
  insurance_provider?: string;
  policy_number?: string;
  group_number?: string;
  policyholder_name?: string;
  relationship_to_patient?: string;
  secondary_insurance?: string;
  has_hsa_fsa?: string;
  hsa_fsa_provider?: string;
  account_holder_name?: string;
  estimated_balance?: string;
  interested_in_payment_plan?: string;
  additional_notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ConsentRecord {
  id: string;
  hipaa_privacy_acknowledgment: boolean;
  consent_to_treatment: boolean;
  patient_signature: string;
  signature_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

type ExpandedSection = 'registration' | 'medicalHistory' | 'insurance' | 'consent' | null;

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    submitted: 'bg-blue-50 text-blue-700',
    in_review: 'bg-amber-50 text-amber-700',
    processed: 'bg-teal-50 text-teal-700',
    archived: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded ${styles[status] || styles.submitted}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

function wasUpdated(created: string, updated: string): boolean {
  const c = new Date(created).getTime();
  const u = new Date(updated).getTime();
  return Math.abs(u - c) > 2000;
}

const FORM_SECTIONS = [
  { key: 'registration' as const, stepIndex: 0, icon: FileText, label: 'Patient Registration', color: 'teal' },
  { key: 'medicalHistory' as const, stepIndex: 1, icon: Clipboard, label: 'Medical History', color: 'blue' },
  { key: 'insurance' as const, stepIndex: 2, icon: CreditCard, label: 'Insurance Information', color: 'emerald' },
  { key: 'consent' as const, stepIndex: 3, icon: Shield, label: 'Consent Form', color: 'amber' },
];

const PortalSubmissions: React.FC = () => {
  const { user } = usePatient();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistoryRecord[]>([]);
  const [insurance, setInsurance] = useState<InsuranceRecord[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [expanded, setExpanded] = useState<ExpandedSection>('registration');

  useEffect(() => {
    if (!user) return;

    async function fetchSubmissions() {
      const [regRes, medRes, insRes, conRes] = await Promise.all([
        supabase
          .from('patient_registrations')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('patient_medical_histories')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('patient_insurance_info')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('patient_consent_forms')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);

      setRegistrations(regRes.data || []);
      setMedicalHistories(medRes.data || []);
      setInsurance(insRes.data || []);
      setConsents(conRes.data || []);
      setLoading(false);
    }

    fetchSubmissions();
  }, [user]);

  const toggle = (section: ExpandedSection) => {
    setExpanded(expanded === section ? null : section);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  const hasSubmissions = registrations.length > 0;
  const latestReg = registrations[0];
  const latestMed = medicalHistories[0];
  const latestIns = insurance[0];
  const latestCon = consents[0];

  const originalDate = latestReg?.created_at;
  const allUpdatedDates = [
    latestReg?.updated_at,
    latestMed?.updated_at,
    latestIns?.updated_at,
    latestCon?.updated_at,
  ].filter(Boolean);
  const lastUpdatedDate = allUpdatedDates.length > 0
    ? allUpdatedDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    : null;

  const updatedForms: string[] = [];
  if (latestReg && wasUpdated(latestReg.created_at, latestReg.updated_at)) updatedForms.push('Registration');
  if (latestMed && wasUpdated(latestMed.created_at, latestMed.updated_at)) updatedForms.push('Medical History');
  if (latestIns && wasUpdated(latestIns.created_at, latestIns.updated_at)) updatedForms.push('Insurance');
  if (latestCon && wasUpdated(latestCon.created_at, latestCon.updated_at)) updatedForms.push('Consent');

  const getRecordForSection = (key: string) => {
    switch (key) {
      case 'registration': return latestReg;
      case 'medicalHistory': return latestMed;
      case 'insurance': return latestIns;
      case 'consent': return latestCon;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-900">My Submissions</h1>
        <p className="text-gray-500 mt-1">
          {!hasSubmissions
            ? 'You haven\'t submitted any forms yet.'
            : 'View and manage your submitted patient forms.'}
        </p>
      </div>

      {!hasSubmissions ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h2>
          <p className="text-sm text-gray-500 mb-6">Complete your patient forms to see them here.</p>
          <Link
            to="/portal/forms"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go to Forms
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Submission Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {latestReg.first_name} {latestReg.last_name}
                </h2>
                <StatusBadge status={latestReg.status} />
              </div>
              <Link
                to="/portal/forms?edit=true"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Update Forms
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>
                  <span className="text-gray-500">Original Submission</span>{' '}
                  <span className="font-medium text-gray-800">{formatDateTime(originalDate)}</span>
                </span>
              </div>
              {lastUpdatedDate && wasUpdated(originalDate, lastUpdatedDate) && (
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-gray-400" />
                  <span>
                    <span className="text-gray-500">Last Updated</span>{' '}
                    <span className="font-medium text-gray-800">{formatDateTime(lastUpdatedDate)}</span>
                  </span>
                </div>
              )}
            </div>

            {updatedForms.length > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Updated:</span>
                {updatedForms.map((name) => (
                  <span
                    key={name}
                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Individual Form Sections */}
          <div className="space-y-3">
            {FORM_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isOpen = expanded === section.key;
              const record = getRecordForSection(section.key);
              const hasRecord = !!record;

              return (
                <div key={section.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggle(section.key)}
                      className="flex-1 flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{section.label}</span>
                        {hasRecord && wasUpdated(record.created_at, record.updated_at) && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-50 text-teal-600">
                            Updated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasRecord && <StatusBadge status={record.status} />}
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {hasRecord && (
                      <Link
                        to={`/portal/forms?edit=true&step=${section.stepIndex}`}
                        className="px-4 py-4 border-l border-gray-100 text-gray-400 hover:text-teal-600 hover:bg-teal-50/50 transition-colors"
                        title={`Edit ${section.label}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    )}
                  </div>

                  {isOpen && hasRecord && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      {section.key === 'registration' && latestReg && (
                        <>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-600">
                            <span>DOB: {formatDate(latestReg.date_of_birth)}</span>
                            <span>Phone: {latestReg.phone_number}</span>
                            <span>Email: {latestReg.email_address}</span>
                            {latestReg.city && (
                              <span>Location: {latestReg.city}{latestReg.state ? `, ${latestReg.state}` : ''}</span>
                            )}
                            {latestReg.reason_for_visit && (
                              <span className="col-span-2">Reason: {latestReg.reason_for_visit}</span>
                            )}
                          </div>
                          <div className="mt-3 text-xs text-gray-400">
                            Submitted {formatDateTime(latestReg.created_at)}
                            {wasUpdated(latestReg.created_at, latestReg.updated_at) && (
                              <span className="ml-2">| Updated {formatDateTime(latestReg.updated_at)}</span>
                            )}
                          </div>
                        </>
                      )}

                      {section.key === 'medicalHistory' && latestMed && (
                        <>
                          <div className="grid grid-cols-1 gap-y-1.5 text-xs text-gray-600">
                            {latestMed.vision_correction && (
                              <span>
                                Vision: {[latestMed.vision_correction.glasses && 'Glasses', latestMed.vision_correction.contacts && 'Contacts'].filter(Boolean).join(', ') || 'None'}
                              </span>
                            )}
                            {latestMed.last_eye_exam_date && (
                              <span>Last Exam: {latestMed.last_eye_exam_date}{latestMed.last_eye_exam_doctor ? ` with Dr. ${latestMed.last_eye_exam_doctor}` : ''}</span>
                            )}
                            {latestMed.current_symptoms && latestMed.current_symptoms.length > 0 && (
                              <span>Symptoms: {latestMed.current_symptoms.length} reported</span>
                            )}
                            {latestMed.medical_conditions && latestMed.medical_conditions.length > 0 && (
                              <span>Conditions: {latestMed.medical_conditions.length} reported</span>
                            )}
                            {latestMed.current_medications && <span>Medications: {latestMed.current_medications}</span>}
                            {latestMed.has_allergies && <span>Allergies: {latestMed.has_allergies === 'yes' ? 'Yes' : 'No'}</span>}
                          </div>
                          <div className="mt-3 text-xs text-gray-400">
                            Submitted {formatDateTime(latestMed.created_at)}
                            {wasUpdated(latestMed.created_at, latestMed.updated_at) && (
                              <span className="ml-2">| Updated {formatDateTime(latestMed.updated_at)}</span>
                            )}
                          </div>
                        </>
                      )}

                      {section.key === 'insurance' && latestIns && (
                        <>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-600">
                            {latestIns.has_hsa_fsa && latestIns.has_hsa_fsa !== 'none' && (
                              <span>HSA/FSA: {latestIns.has_hsa_fsa.toUpperCase()}</span>
                            )}
                            {latestIns.hsa_fsa_provider && <span>Provider: {latestIns.hsa_fsa_provider}</span>}
                            {latestIns.account_holder_name && <span>Account Holder: {latestIns.account_holder_name}</span>}
                            {latestIns.estimated_balance && <span>Est. Balance: {latestIns.estimated_balance}</span>}
                            {latestIns.interested_in_payment_plan && (
                              <span>Payment Plan: {latestIns.interested_in_payment_plan === 'yes' ? 'Interested' : 'Not needed'}</span>
                            )}
                            {latestIns.additional_notes && (
                              <span className="col-span-2">Notes: {latestIns.additional_notes}</span>
                            )}
                          </div>
                          <div className="mt-3 text-xs text-gray-400">
                            Submitted {formatDateTime(latestIns.created_at)}
                            {wasUpdated(latestIns.created_at, latestIns.updated_at) && (
                              <span className="ml-2">| Updated {formatDateTime(latestIns.updated_at)}</span>
                            )}
                          </div>
                        </>
                      )}

                      {section.key === 'consent' && latestCon && (
                        <>
                          <div className="grid grid-cols-1 gap-y-1.5 text-xs text-gray-600">
                            <span>HIPAA Acknowledged: {latestCon.hipaa_privacy_acknowledgment ? 'Yes' : 'No'}</span>
                            <span>Treatment Consent: {latestCon.consent_to_treatment ? 'Yes' : 'No'}</span>
                            <span>Signed by: {latestCon.patient_signature}</span>
                            <span>Signed on: {formatDate(latestCon.signature_date)}</span>
                          </div>
                          <div className="mt-3 text-xs text-gray-400">
                            Submitted {formatDateTime(latestCon.created_at)}
                            {wasUpdated(latestCon.created_at, latestCon.updated_at) && (
                              <span className="ml-2">| Updated {formatDateTime(latestCon.updated_at)}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Share Your Story CTA */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Star className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">Had a great experience?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Share your story to help others considering vision correction.
                </p>
              </div>
              <Link
                to="/portal/testimonial"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shrink-0"
              >
                <Star className="h-4 w-4" />
                Share Your Story
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalSubmissions;
