import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTranslationService } from '../hooks/useTranslationService';

interface TranslationStatusProps {
  showDetails?: boolean;
  className?: string;
}

const TranslationStatus: React.FC<TranslationStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { i18n } = useTranslation();
  const { serviceStatus } = useTranslationService();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getTranslationMode = () => {
    if (!isOnline) return 'offline';
    if (serviceStatus.deepl?.enabled || serviceStatus.google?.enabled) return 'api';
    return 'local';
  };

  const getStatusIcon = () => {
    const mode = getTranslationMode();
    
    switch (mode) {
      case 'api':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'local':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    const mode = getTranslationMode();
    
    switch (mode) {
      case 'api':
        return 'Live Translation Active';
      case 'local':
        return 'Using Local Translations';
      case 'offline':
        return 'Offline Mode';
      default:
        return 'Translation Status Unknown';
    }
  };

  const getStatusColor = () => {
    const mode = getTranslationMode();
    
    switch (mode) {
      case 'api':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'local':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (i18n.language === 'en') {
    return null; // Don't show status for English
  }

  return (
    <div className={`${className} ${isRTL ? 'rtl' : ''}`}>
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()} ${
        isRTL ? 'flex-row-reverse space-x-reverse' : ''
      }`}>
        {getStatusIcon()}
        <span className={isRTL ? 'mr-2' : 'ml-2'}>{getStatusText()}</span>
        {!isOnline && <WifiOff className={`h-3 w-3 ${isRTL ? 'mr-2' : 'ml-2'}`} />}
        {isOnline && <Wifi className={`h-3 w-3 ${isRTL ? 'mr-2' : 'ml-2'}`} />}
      </div>
      
      {showDetails && (
        <div className={`mt-2 text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div>Language: {i18n.language}</div>
          <div>Services: {serviceStatus.deepl?.enabled ? 'DeepL ' : ''}{serviceStatus.google?.enabled ? 'Google' : ''}</div>
          <div>Cache: {serviceStatus.cache?.entries || 0} entries</div>
        </div>
      )}
    </div>
  );
};

export default TranslationStatus;