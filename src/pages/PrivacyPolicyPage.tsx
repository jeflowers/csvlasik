import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, Lock, Globe, Mail, CheckCircle, ArrowRight, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Cookies from 'js-cookie';

const PrivacyPolicyPage: React.FC = () => {
  const { t, i18n } = useTranslation(['privacy', 'common']);

  useEffect(() => {
    // Log that user viewed privacy policy
    logPolicyView();
  }, []);

  const logPolicyView = async () => {
    const userIdentifier = Cookies.get('user_id') || 'anonymous';

    try {
      await supabase.from('consent_analytics_events').insert({
        user_identifier: userIdentifier,
        event_type: 'policy_viewed',
        event_data: { language: i18n.language },
        page_url: window.location.href
      });
    } catch (error) {
      console.error('Failed to log policy view:', error);
    }
  };

  const acknowledgePolicyacknowledgePolicy = async () => {
    const userIdentifier = Cookies.get('user_id');
    if (!userIdentifier) return;

    try {
      const { data: currentVersion } = await supabase
        .from('privacy_policy_versions')
        .select('id')
        .eq('is_current', true)
        .single();

      if (currentVersion) {
        await supabase.from('user_policy_acknowledgments').insert({
          user_identifier: userIdentifier,
          version_id: currentVersion.id,
          ip_address: null,
          user_agent: navigator.userAgent
        });

        alert('Thank you for acknowledging our Privacy Policy.');
      }
    } catch (error) {
      console.error('Failed to acknowledge policy:', error);
    }
  };

  const sections = [
    {
      id: 'collection',
      icon: Eye,
      title: t('sections.collection.title'),
      content: [
        t('sections.collection.personal'),
        t('sections.collection.phi')
      ]
    },
    {
      id: 'usage',
      icon: Lock,
      title: t('sections.usage.title'),
      content: [t('sections.usage.purposes')]
    },
    {
      id: 'legalBasis',
      icon: Shield,
      title: t('sections.legalBasis.title'),
      content: [t('sections.legalBasis.bases')]
    },
    {
      id: 'sharing',
      icon: Globe,
      title: t('sections.sharing.title'),
      content: [t('sections.sharing.parties')]
    },
    {
      id: 'retention',
      icon: CheckCircle,
      title: t('sections.retention.title'),
      content: [t('sections.retention.periods')]
    },
    {
      id: 'rights',
      icon: Shield,
      title: t('sections.rights.title'),
      content: [t('sections.rights.list')]
    },
    {
      id: 'cookies',
      icon: Eye,
      title: t('sections.cookies.title'),
      content: [t('sections.cookies.types')]
    },
    {
      id: 'security',
      icon: Lock,
      title: t('sections.security.title'),
      content: [t('sections.security.measures')]
    },
    {
      id: 'children',
      icon: Shield,
      title: t('sections.children.title'),
      content: [t('sections.children.policy')]
    },
    {
      id: 'international',
      icon: Globe,
      title: t('sections.international.title'),
      content: [t('sections.international.info')]
    },
    {
      id: 'hipaa',
      icon: Shield,
      title: t('sections.hipaa.title'),
      content: [t('sections.hipaa.compliance')]
    },
    {
      id: 'ccpa',
      icon: CheckCircle,
      title: t('sections.ccpa.title'),
      content: [t('sections.ccpa.rights')]
    },
    {
      id: 'changes',
      icon: ArrowRight,
      title: t('sections.changes.title'),
      content: [t('sections.changes.notification')]
    },
    {
      id: 'contact',
      icon: Mail,
      title: t('sections.contact.title'),
      content: [
        `Privacy Officer: ${t('sections.contact.privacyOfficer')}`,
        `DPO: ${t('sections.contact.dpo')}`,
        t('sections.contact.hhs')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">{t('meta.title')}</h1>
          <p className="text-xl text-teal-100 mb-6">
            Your privacy and security are our top priorities
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div>
              <span className="font-semibold">Version:</span> {t('meta.version')}
            </div>
            <div>
              <span className="font-semibold">Last Updated:</span> {t('meta.lastUpdated')}
            </div>
            <div>
              <span className="font-semibold">Effective:</span> {t('meta.effectiveDate')}
            </div>
          </div>
        </div>
      </div>

      {/* Translation Notice (if not English) */}
      {i18n.language !== 'en' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Globe className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {t('translationNotice')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            {t('introduction')}
          </p>
          <p className="text-gray-600 italic">
            {t('agreement')}
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('tableOfContents.title')}</h2>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(t('tableOfContents.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-teal-600 font-semibold mr-3">{index + 1}.</span>
                <a
                  href={`#section-${index}`}
                  className="text-gray-700 hover:text-teal-600 transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.id}
              id={`section-${index}`}
              className="bg-white rounded-lg shadow-sm p-8 scroll-mt-8"
            >
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0">
                  <section.icon className="h-8 w-8 text-teal-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.content.map((text, idx) => (
                      <p key={idx} className="text-gray-700 leading-relaxed">
                        {text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Take Action</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/privacy-center"
              className="flex items-center justify-center px-6 py-3 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
            >
              <Shield className="h-5 w-5 mr-2" />
              Manage Preferences
            </a>
            <a
              href="/privacy-center#export"
              className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Export My Data
            </a>
            <a
              href="/contact"
              className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Privacy Officer
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">
            © {new Date().getFullYear()} ClearSight Vision Center. All Rights Reserved.
          </p>
          <p>
            This Privacy Policy is effective as of {t('meta.effectiveDate')}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
