import React, { useState, useEffect } from 'react';
import { Shield, FileText, Download, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

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

const PrivacyPolicyDetailPage: React.FC = () => {
  const { i18n } = useTranslation();
  const [policyVersion, setPolicyVersion] = useState<PrivacyPolicyVersion | null>(null);
  const [policyContent, setPolicyContent] = useState<PrivacyPolicyContent | null>(null);
  const [sections, setSections] = useState<PrivacyPolicySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    fetchPrivacyPolicy();
  }, [i18n.language]);

  const fetchPrivacyPolicy = async () => {
    try {
      setLoading(true);

      // Get current version
      const { data: versionData, error: versionError } = await supabase
        .from('privacy_policy_versions')
        .select('*')
        .eq('is_current', true)
        .single();

      if (versionError) throw versionError;
      setPolicyVersion(versionData);

      // Get content for current language
      let languageCode = i18n.language || 'en';
      if (!['en', 'es-MX', 'ja', 'zh', 'ko', 'ar', 'he', 'hy', 'pt-BR', 'tl', 'vi'].includes(languageCode)) {
        languageCode = 'en';
      }

      const { data: contentData, error: contentError } = await supabase
        .from('privacy_policy_content')
        .select('*')
        .eq('version_id', versionData.id)
        .eq('language_code', languageCode)
        .maybeSingle();

      // Fallback to English if translation not available
      if (!contentData) {
        const { data: englishContent, error: englishError } = await supabase
          .from('privacy_policy_content')
          .select('*')
          .eq('version_id', versionData.id)
          .eq('language_code', 'en')
          .single();

        if (englishError) throw englishError;
        setPolicyContent(englishContent);
      } else {
        setPolicyContent(contentData);
      }

      // Get sections
      if (contentData || policyContent) {
        const contentId = contentData?.id || policyContent?.id;
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('privacy_policy_sections')
          .select('*')
          .eq('content_id', contentId)
          .order('display_order');

        if (!sectionsError && sectionsData) {
          setSections(sectionsData);
        }
      }
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!policyVersion) return;

    try {
      const userIdentifier = localStorage.getItem('userEmail') || 'anonymous';

      await supabase
        .from('user_policy_acknowledgments')
        .insert({
          user_identifier: userIdentifier,
          version_id: policyVersion.id,
          acknowledged_at: new Date().toISOString(),
          ip_address: null,
          user_agent: navigator.userAgent
        });

      alert('Thank you for acknowledging our privacy policy.');
    } catch (error) {
      console.error('Error acknowledging policy:', error);
    }
  };

  const handleDownloadPDF = () => {
    if (!policyContent) return;

    const element = document.createElement('a');
    const file = new Blob([policyContent.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `Atelier-Privacy-Policy-v${policyVersion?.version_number}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s =>
        document.getElementById(s.section_key)
      ).filter(el => el !== null);

      const scrollPosition = window.scrollY + 100;

      for (const element of sectionElements) {
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(element.id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(4)}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 mb-1">{line.substring(2)}</li>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-bold my-2">{line.substring(2, line.length - 2)}</p>;
      } else if (line.trim()) {
        return <p key={index} className="my-2">{line}</p>;
      }
      return <br key={index} />;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading privacy policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-12 w-12" />
            <div>
              <h1 className="text-4xl font-bold">{policyContent?.title}</h1>
              <p className="text-blue-200 mt-2">
                Version {policyVersion?.version_number} • Effective {new Date(policyVersion?.effective_date || '').toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50"
            >
              <Download className="h-5 w-5" />
              Download PDF
            </button>
            <button
              onClick={handleAcknowledge}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
            >
              <FileText className="h-5 w-5" />
              Acknowledge Policy
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          {sections.length > 0 && (
            <div className="lg:col-span-1">
              <div className="sticky top-4 bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg mb-4">Table of Contents</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.section_key}`}
                      className={`block text-sm py-1 px-2 rounded transition-colors ${
                        activeSection === section.section_key
                          ? 'bg-blue-100 text-blue-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {section.section_title}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={sections.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="bg-white rounded-lg shadow">
              <div className="p-8 prose prose-blue max-w-none">
                {policyContent && renderMarkdown(policyContent.content)}
              </div>

              {/* Footer */}
              <div className="border-t p-8">
                <div className="flex items-start gap-4 bg-blue-50 rounded-lg p-6">
                  <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Your Privacy Matters</h4>
                    <p className="text-gray-600 text-sm">
                      This privacy policy complies with HIPAA, GDPR, CCPA, and other applicable privacy laws.
                      We are committed to protecting your personal and health information with the highest
                      standards of security and confidentiality.
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      For questions about this privacy policy, please contact our Privacy Officer at{' '}
                      <a href="mailto:privacy@clearsightvision.com" className="text-blue-600 hover:underline">
                        privacy@clearsightvision.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                  Last Updated: {new Date(policyContent?.last_updated || '').toLocaleDateString()}
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
