import React, { useState, useEffect, useMemo } from 'react';
import { Shield, FileText, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getVisitorId } from '../lib/consent';
import { useTranslation } from 'react-i18next';
import ConsentStatusCard from '../components/ConsentStatusCard';

interface PrivacyPolicyVersion {
  id: string;
  version_number: string;
  effective_date: string;
  is_current: boolean;
}

interface PrivacyPolicyContent {
  id: string;
  version_id: string;
  language_code: string;
  title: string;
  content: string;
  last_updated: string;
}

interface PrivacyPolicySection {
  id: string;
  content_id: string;
  section_key: string;
  section_title: string;
  section_content: string;
  display_order: number;
}

interface DisplaySection {
  key: string;
  title: string;
  paragraphs: string[];
}

const SECTION_KEYS = [
  'collection',
  'usage',
  'legalBasis',
  'sharing',
  'retention',
  'rights',
  'cookies',
  'security',
  'children',
  'international',
  'hipaa',
  'ccpa',
  'changes',
  'contact',
];

const flattenValues = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(flattenValues);
  if (value && typeof value === 'object') return Object.values(value).flatMap(flattenValues);
  return [];
};

const PrivacyPolicyDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation('privacy');
  const [policyVersion, setPolicyVersion] = useState<PrivacyPolicyVersion | null>(null);
  const [policyContent, setPolicyContent] = useState<PrivacyPolicyContent | null>(null);
  const [sections, setSections] = useState<PrivacyPolicySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');

  const languageCode = i18n.language;

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      setLoading(true);
      try {
        const { data: version, error: versionError } = await supabase
          .from('privacy_policy_versions')
          .select('*')
          .eq('is_current', true)
          .maybeSingle();

        if (versionError || !version) {
          setPolicyVersion(null);
          setPolicyContent(null);
          setSections([]);
          return;
        }
        setPolicyVersion(version);

        const { data: content } = await supabase
          .from('privacy_policy_content')
          .select('*')
          .eq('version_id', version.id)
          .eq('language_code', languageCode)
          .maybeSingle();

        setPolicyContent(content ?? null);

        if (content) {
          const { data: sectionRows } = await supabase
            .from('privacy_policy_sections')
            .select('*')
            .eq('content_id', content.id)
            .order('display_order');
          setSections(sectionRows ?? []);
        } else {
          setSections([]);
        }
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, [languageCode]);

  const displaySections: DisplaySection[] = useMemo(() => {
    if (sections.length > 0) {
      return sections.map((s) => ({
        key: s.section_key,
        title: s.section_title,
        paragraphs: s.section_content.split('\n').filter((line) => line.trim()),
      }));
    }
    return SECTION_KEYS.map((key) => {
      const raw = t(`sections.${key}`, { returnObjects: true }) as Record<string, unknown> | string;
      if (!raw || typeof raw !== 'object') {
        return { key, title: String(raw ?? key), paragraphs: [] };
      }
      const { title, ...rest } = raw;
      return { key, title: String(title ?? key), paragraphs: flattenValues(rest) };
    });
  }, [sections, t]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of displaySections) {
        const element = document.getElementById(section.key);
        if (element && element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition) {
          setActiveSection(section.key);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displaySections]);

  const formatDate = (value: string | undefined | null, fallbackKey: string) => {
    const date = value ? new Date(value) : null;
    if (date && !isNaN(date.getTime())) {
      return date.toLocaleDateString(languageCode, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return t(fallbackKey);
  };

  const versionNumber = policyVersion?.version_number || t('meta.version');
  const effectiveDate = formatDate(policyVersion?.effective_date, 'meta.effectiveDate');
  const lastUpdated = formatDate(policyContent?.last_updated, 'meta.lastUpdated');
  const pageTitle = policyContent?.title || t('meta.title');

  const handleAcknowledge = async () => {
    if (!policyVersion) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userIdentifier = user?.id || getVisitorId() || 'anonymous';

      const { error } = await supabase.from('user_policy_acknowledgments').insert({
        user_identifier: userIdentifier,
        version_id: policyVersion.id,
        acknowledged_at: new Date().toISOString(),
        ip_address: null,
        user_agent: navigator.userAgent,
      });

      if (error) throw error;
      alert(t('ui.acknowledgeThanks'));
    } catch (error) {
      console.error('Error acknowledging policy:', error);
    }
  };

  const handleDownloadPDF = () => {
    const text = policyContent
      ? policyContent.content
      : [
          `# ${pageTitle}`,
          `${t('ui.version', { version: versionNumber })} - ${t('ui.effective', { date: effectiveDate })}`,
          '',
          t('introduction'),
          '',
          ...displaySections.flatMap((s) => [`## ${s.title}`, ...s.paragraphs, '']),
          t('agreement'),
        ].join('\n');

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Atelier-Privacy-Policy-v${versionNumber}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('ui.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-12 w-12 flex-shrink-0" />
            <div>
              <h1 className="text-4xl font-bold leading-tight">{pageTitle}</h1>
              <p className="text-blue-200 mt-2">
                {t('ui.version', { version: versionNumber })} • {t('ui.effective', { date: effectiveDate })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Download className="h-5 w-5" />
              {t('ui.downloadPdf')}
            </button>
            <button
              onClick={handleAcknowledge}
              disabled={!policyVersion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <FileText className="h-5 w-5" />
              {t('ui.acknowledge')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">{t('tableOfContents.title')}</h3>
              <nav className="space-y-2">
                {displaySections.map((section) => (
                  <a
                    key={section.key}
                    href={`#${section.key}`}
                    className={`block text-sm py-1 px-2 rounded transition-colors ${
                      activeSection === section.key
                        ? 'bg-blue-100 text-blue-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-8 max-w-none text-gray-700 leading-relaxed">
                <p className="mb-6">{t('introduction')}</p>
                {displaySections.map((section) => (
                  <section key={section.key} id={section.key} className="mb-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
                    {section.paragraphs.map((paragraph, idx) => (
                      <p key={idx} className="mb-3">{paragraph}</p>
                    ))}
                  </section>
                ))}
                <p className="mt-6 font-medium text-gray-900">{t('agreement')}</p>
              </div>

              <div className="border-t p-8">
                <div className="flex items-start gap-4 bg-blue-50 rounded-lg p-6">
                  <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">{t('ui.privacyMattersTitle')}</h4>
                    <p className="text-gray-600 text-sm">{t('ui.privacyMattersBody')}</p>
                    <p className="text-gray-600 text-sm mt-2">
                      {t('ui.questionsContact')}{' '}
                      <a href="mailto:privacy@atelierlasik.com" dir="ltr" className="text-blue-600 hover:underline">
                        privacy@atelierlasik.com
                      </a>
                    </p>
                  </div>
                </div>

                <ConsentStatusCard />

                <div className="mt-6 text-center text-sm text-gray-500">
                  {t('ui.lastUpdated', { date: lastUpdated })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyDetailPage;
