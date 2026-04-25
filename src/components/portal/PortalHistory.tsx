import React, { useEffect, useState } from 'react';
import {
  LogIn,
  LogOut,
  FileText,
  Pencil,
  Star,
  KeyRound,
  Clock,
  Activity,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPatientActivityLog, type ActivityLogEntry, type ActivityType } from '../../services/patientActivityService';

const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  login: { icon: LogIn, color: 'text-teal-600', bg: 'bg-teal-50' },
  logout: { icon: LogOut, color: 'text-gray-500', bg: 'bg-gray-100' },
  form_submit: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  form_update: { icon: Pencil, color: 'text-amber-600', bg: 'bg-amber-50' },
  testimonial_submit: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  password_reset: { icon: KeyRound, color: 'text-red-500', bg: 'bg-red-50' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function groupByDate(entries: ActivityLogEntry[]): Map<string, ActivityLogEntry[]> {
  const groups = new Map<string, ActivityLogEntry[]>();
  for (const entry of entries) {
    const key = formatDate(entry.created_at);
    const group = groups.get(key) || [];
    group.push(entry);
    groups.set(key, group);
  }
  return groups;
}

const PortalHistory: React.FC = () => {
  const { t } = useTranslation('patientForms');
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getPatientActivityLog(100);
      setEntries(result.data);
      setError(result.error);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  const grouped = groupByDate(entries);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-900">
          {t('history.title', { defaultValue: 'Activity History' })}
        </h1>
        <p className="text-gray-500 mt-1">
          {t('history.subtitle', { defaultValue: 'A timeline of your recent activity in the patient portal.' })}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mx-auto mb-4">
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {t('history.empty', { defaultValue: 'No activity yet' })}
          </h3>
          <p className="text-sm text-gray-500">
            {t('history.emptyDescription', { defaultValue: 'Your login, form submission, and update history will appear here.' })}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {dateLabel}
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="space-y-3">
                {items.map((entry) => {
                  const config = ACTIVITY_CONFIG[entry.activity_type] || ACTIVITY_CONFIG.login;
                  const Icon = config.icon;

                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.activity_label}
                        </p>
                        {entry.metadata && entry.metadata.forms && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {(entry.metadata.forms as string[]).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(entry.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalHistory;
