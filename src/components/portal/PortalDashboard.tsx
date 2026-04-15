import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ClipboardList, CheckCircle2, Clock, ArrowRight, Shield } from 'lucide-react';
import { usePatient } from '../../hooks/usePatient';
import { supabase } from '../../lib/supabase';

interface FormStatus {
  registration: boolean;
  medicalHistory: boolean;
  insurance: boolean;
  consent: boolean;
}

const PortalDashboard: React.FC = () => {
  const { user } = usePatient();
  const [formStatus, setFormStatus] = useState<FormStatus>({
    registration: false,
    medicalHistory: false,
    insurance: false,
    consent: false,
  });
  const [loading, setLoading] = useState(true);
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function fetchStatus() {
      const [regRes, medRes, insRes, conRes] = await Promise.all([
        supabase
          .from('patient_registrations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user!.id),
        supabase
          .from('patient_medical_histories')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user!.id),
        supabase
          .from('patient_insurance_info')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user!.id),
        supabase
          .from('patient_consent_forms')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user!.id),
      ]);

      const status = {
        registration: (regRes.count || 0) > 0,
        medicalHistory: (medRes.count || 0) > 0,
        insurance: (insRes.count || 0) > 0,
        consent: (conRes.count || 0) > 0,
      };

      setFormStatus(status);
      setSubmissionCount(
        (regRes.count || 0) + (medRes.count || 0) + (insRes.count || 0) + (conRes.count || 0)
      );
      setLoading(false);
    }

    fetchStatus();
  }, [user]);

  const completedCount = Object.values(formStatus).filter(Boolean).length;
  const progressPercent = (completedCount / 4) * 100;

  const greeting = user?.firstName
    ? `Welcome, ${user.firstName}`
    : 'Welcome';

  const formChecklist = [
    { key: 'registration', label: 'Patient Registration', done: formStatus.registration },
    { key: 'medicalHistory', label: 'Medical History', done: formStatus.medicalHistory },
    { key: 'insurance', label: 'Insurance Information', done: formStatus.insurance },
    { key: 'consent', label: 'Consent Forms', done: formStatus.consent },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-900">{greeting}</h1>
        <p className="text-gray-500 mt-1">Manage your patient forms and view your submission history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{completedCount}/4</p>
              <p className="text-xs text-gray-500">Forms Completed</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{submissionCount}</p>
              <p className="text-xs text-gray-500">Total Submissions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">HIPAA</p>
              <p className="text-xs text-gray-500">Compliant & Secure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Forms Checklist</h2>
          <div className="space-y-3">
            {formChecklist.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-teal-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={`text-sm ${item.done ? 'text-gray-700' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
                {item.done ? (
                  <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
                    Complete
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>

          {completedCount < 4 && (
            <Link
              to="/portal/forms"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Complete your forms
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/portal/forms"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Patient Forms</p>
                <p className="text-xs text-gray-500">Fill out or update your intake forms</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </Link>

            <Link
              to="/portal/submissions"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">View Submissions</p>
                <p className="text-xs text-gray-500">Review your submitted forms</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </Link>

            <Link
              to="/portal/forms"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Book Consultation</p>
                <p className="text-xs text-gray-500">Schedule your next appointment</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalDashboard;
