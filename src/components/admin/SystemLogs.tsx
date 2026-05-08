import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Mail } from 'lucide-react';
import { ErrorMonitor } from './ErrorMonitor';
import { EmailQueueMonitor } from './EmailQueueMonitor';

type LogTab = 'errors' | 'email-queue';

interface TabConfig {
  id: LogTab;
  label: string;
  description: string;
  icon: typeof AlertCircle;
}

const TABS: TabConfig[] = [
  {
    id: 'errors',
    label: 'Error Log',
    description: 'Application errors, stack traces, and unhandled exceptions.',
    icon: AlertCircle,
  },
  {
    id: 'email-queue',
    label: 'Email Queue',
    description: 'Outbound email delivery status, retries, and failures.',
    icon: Mail,
  },
];

const resolveTabFromPath = (pathname: string): LogTab => {
  if (pathname.endsWith('/email-queue')) return 'email-queue';
  return 'errors';
};

const SystemLogs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LogTab>(() => resolveTabFromPath(location.pathname));

  const handleTabChange = (tab: LogTab) => {
    setActiveTab(tab);
    const base = '/admin/system/logs';
    const next = tab === 'errors' ? base : `${base}/${tab}`;
    if (location.pathname !== next) {
      navigate(next, { replace: true });
    }
  };

  const activeConfig = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-gray-900">System Logs</h1>
        <p className="mt-1 text-sm text-gray-600">
          Operational diagnostics for the platform. For compliance and access audit trails, see
          {' '}
          <button
            type="button"
            onClick={() => navigate('/admin/compliance/hipaa-audit')}
            className="text-teal-700 hover:text-teal-900 underline underline-offset-2"
          >
            HIPAA Audit
          </button>
          .
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="System log tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`group inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <p className="text-sm text-gray-500">{activeConfig.description}</p>

      <div>
        {activeTab === 'errors' && <ErrorMonitor />}
        {activeTab === 'email-queue' && <EmailQueueMonitor />}
      </div>
    </div>
  );
};

export default SystemLogs;
