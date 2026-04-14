import React, { useEffect, useState } from 'react';
import { FileText, Clipboard, CreditCard, Shield, ChevronDown, ChevronUp } from 'lucide-react';
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
}

interface InsuranceRecord {
  id: string;
  insurance_provider?: string;
  policy_number?: string;
  group_number?: string;
  policyholder_name?: string;
  relationship_to_patient?: string;
  secondary_insurance?: string;
  status: string;
  created_at: string;
}

interface ConsentRecord {
  id: string;
  hipaa_privacy_acknowledgment: boolean;
  consent_to_treatment: boolean;
  patient_signature: string;
  signature_date: string;
  status: string;
  created_at: string;
}

type ExpandedSection = 'registration' | 'medicalHistory' | 'insurance' | 'consent' | null;

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

  const totalSubmissions = registrations.length + medicalHistories.length + insurance.length + consents.length;

  const sections = [
    {
      key: 'registration' as ExpandedSection,
      icon: FileText,
      label: 'Patient Registrations',
      count: registrations.length,
      color: 'teal',
    },
    {
      key: 'medicalHistory' as ExpandedSection,
      icon: Clipboard,
      label: 'Medical Histories',
      count: medicalHistories.length,
      color: 'blue',
    },
    {
      key: 'insurance' as ExpandedSection,
      icon: CreditCard,
      label: 'Insurance Information',
      count: insurance.length,
      color: 'emerald',
    },
    {
      key: 'consent' as ExpandedSection,
      icon: Shield,
      label: 'Consent Forms',
      count: consents.length,
      color: 'amber',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-900">My Submissions</h1>
        <p className="text-gray-500 mt-1">
          {totalSubmissions === 0
            ? 'You haven\'t submitted any forms yet.'
            : `You have ${totalSubmissions} form submission${totalSubmissions === 1 ? '' : 's'}.`
          }
        </p>
      </div>

      {totalSubmissions === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h2>
          <p className="text-sm text-gray-500 mb-6">Complete your patient forms to see them here.</p>
          <a
            href="/portal/forms"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go to Forms
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const isOpen = expanded === section.key;

            return (
              <div key={section.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggle(section.key)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{section.label}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {section.count}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                {isOpen && section.count > 0 && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {section.key === 'registration' && registrations.map((r) => (
                      <div key={r.id} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {r.first_name} {r.last_name}
                          </span>
                          <StatusBadge status={r.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500">
                          <span>DOB: {formatDate(r.date_of_birth)}</span>
                          <span>Phone: {r.phone_number}</span>
                          <span>Email: {r.email_address}</span>
                          {r.city && <span>Location: {r.city}{r.state ? `, ${r.state}` : ''}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Submitted {formatDateTime(r.created_at)}</p>
                      </div>
                    ))}

                    {section.key === 'medicalHistory' && medicalHistories.map((m) => (
                      <div key={m.id} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">Medical History</span>
                          <StatusBadge status={m.status} />
                        </div>
                        <div className="grid grid-cols-1 gap-y-1 text-xs text-gray-500">
                          {m.vision_correction && (
                            <span>
                              Vision: {[m.vision_correction.glasses && 'Glasses', m.vision_correction.contacts && 'Contacts'].filter(Boolean).join(', ') || 'None'}
                            </span>
                          )}
                          {m.last_eye_exam_date && <span>Last Exam: {m.last_eye_exam_date}{m.last_eye_exam_doctor ? ` with Dr. ${m.last_eye_exam_doctor}` : ''}</span>}
                          {m.current_symptoms && m.current_symptoms.length > 0 && (
                            <span>Symptoms: {m.current_symptoms.length} reported</span>
                          )}
                          {m.medical_conditions && m.medical_conditions.length > 0 && (
                            <span>Conditions: {m.medical_conditions.length} reported</span>
                          )}
                          {m.current_medications && <span>Medications: {m.current_medications}</span>}
                          {m.has_allergies && <span>Allergies: {m.has_allergies === 'yes' ? 'Yes' : 'No'}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Submitted {formatDateTime(m.created_at)}</p>
                      </div>
                    ))}

                    {section.key === 'insurance' && insurance.map((i) => (
                      <div key={i.id} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {i.insurance_provider || 'Insurance Info'}
                          </span>
                          <StatusBadge status={i.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500">
                          {i.policy_number && <span>Policy: {i.policy_number}</span>}
                          {i.group_number && <span>Group: {i.group_number}</span>}
                          {i.policyholder_name && <span>Policyholder: {i.policyholder_name}</span>}
                          {i.relationship_to_patient && <span>Relationship: {i.relationship_to_patient}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Submitted {formatDateTime(i.created_at)}</p>
                      </div>
                    ))}

                    {section.key === 'consent' && consents.map((c) => (
                      <div key={c.id} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">Consent Form</span>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="grid grid-cols-1 gap-y-1 text-xs text-gray-500">
                          <span>HIPAA Acknowledged: {c.hipaa_privacy_acknowledgment ? 'Yes' : 'No'}</span>
                          <span>Treatment Consent: {c.consent_to_treatment ? 'Yes' : 'No'}</span>
                          <span>Signed by: {c.patient_signature}</span>
                          <span>Signed on: {formatDate(c.signature_date)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Submitted {formatDateTime(c.created_at)}</p>
                      </div>
                    ))}

                    {section.count === 0 && (
                      <div className="px-5 py-6 text-center text-sm text-gray-400">
                        No submissions yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortalSubmissions;
