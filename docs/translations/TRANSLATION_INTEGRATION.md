# Translation Services Integration Guide

## Overview

ClearSight LASIK website supports comprehensive internationalization with both API-based translation services (DeepL and Google Translate) and local JSON file fallbacks for 11 languages.

## Architecture

### Translation Service Hierarchy
1. **Local JSON Files** (Primary) - Pre-translated, medically reviewed content
2. **DeepL API** (Secondary) - High-quality translation for dynamic content
3. **Google Translate API** (Tertiary) - Broader language support
4. **Fallback** - Original English text if all services fail

### Supported Languages
- **English (en)** - Source language
- **Spanish (es)** - Spain
- **Spanish Mexico (es-MX)** - Regional variant
- **Portuguese Brazil (pt-BR)** - Brazilian Portuguese
- **Tagalog (tl)** - Philippines (Google only)
- **Korean (ko)** - South Korea
- **Vietnamese (vi)** - Vietnam (Google only)
- **Chinese (zh)** - Simplified Chinese
- **Arabic (ar)** - RTL support
- **Armenian (hy)** - Armenia (Google only)
- **Hebrew (he)** - RTL support

## Environment Configuration

### Frontend Environment Variables (.env)
```bash
# Translation Services
VITE_DEEPL_API_KEY=your-deepl-api-key-here
VITE_DEEPL_API_URL=https://api-free.deepl.com/v2
VITE_GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key-here
VITE_GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Internationalization
VITE_DEFAULT_LANGUAGE=en
VITE_FALLBACK_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,es,es-MX,pt-BR,tl,ko,vi,zh,ar,hy,he
VITE_RTL_LANGUAGES=ar,he

# Cache Configuration
VITE_TRANSLATION_CACHE_ENABLED=true
VITE_TRANSLATION_CACHE_EXPIRY=86400000
```

### Backend Environment Variables (server/.env)
```bash
# Translation Services
DEEPL_API_KEY=your-deepl-api-key-here
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key-here
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Service Configuration
TRANSLATION_SERVICE_ENABLED=true
TRANSLATION_PREFERRED_SERVICE=auto
TRANSLATION_BATCH_SIZE=10
TRANSLATION_RATE_LIMIT_PER_MINUTE=100
TRANSLATION_CACHE_TTL=86400
```

## Service Setup

### DeepL API Setup
1. Create account at [DeepL Pro](https://www.deepl.com/pro-api)
2. Get API key from dashboard
3. Add to environment variables
4. Supports: es, es-MX, pt-BR, ko, zh, ar, he

### Google Translate API Setup
1. Create Google Cloud project
2. Enable Cloud Translation API
3. Create API key with Translation API access
4. Add to environment variables
5. Supports: All 11 languages including tl, vi, hy

## Usage Examples

### Basic Translation Hook
```typescript
import { useTranslationService } from '../hooks/useTranslationService';

const MyComponent = () => {
  const { translateText, isTranslating } = useTranslationService();
  
  const handleTranslate = async () => {
    const result = await translateText('Schedule your consultation', 'es');
    console.log(result); // "Programe su consulta"
  };
};
```

### Dynamic Content Translation
```typescript
import { useDynamicTranslation } from '../hooks/useTranslationService';

const DynamicContent = ({ content }) => {
  const { translatedContent, isLoading } = useDynamicTranslation(
    content, 
    'hero.title', 
    'common'
  );
  
  return <h1>{translatedContent}</h1>;
};
```

### Translation Provider
```typescript
import { TranslationProvider } from '../components/TranslationProvider';

const App = () => (
  <TranslationProvider preferredService="deepl">
    <YourApp />
  </TranslationProvider>
);
```

### Dynamic Translation Component
```typescript
import DynamicTranslation from '../components/DynamicTranslation';

const Example = () => (
  <DynamicTranslation
    text="Revolutionary vision care"
    translationKey="hero.title"
    namespace="common"
    as="h1"
    className="text-4xl font-bold"
  />
);
```

## Medical Content Protection

### Protected Terms
The following medical terms are never translated:
- LASIK, PRK, ICL, SMILE
- Dr. Charles Flowers, ClearSight
- FDA, Visian ICL
- Femtosecond, Excimer
- Medical device names

### Implementation
```typescript
const protectedTerms = [
  'LASIK', 'PRK', 'ICL', 'Dr. Charles Flowers', 'ClearSight'
];

// Terms are automatically preserved in translations
const translation = await translateText(
  'Dr. Charles Flowers performs LASIK surgery'
);
// Result: "Dr. Charles Flowers realiza cirugía LASIK"
```

## File Structure

### Local Translation Files
```
public/locales/
├── en/
│   ├── common.json      # UI elements, buttons
│   ├── forms.json       # Form labels, validation
│   ├── medical.json     # Medical terminology
│   └── navigation.json  # Menu items, links
├── es/
│   ├── common.json
│   ├── forms.json
│   ├── medical.json
│   └── navigation.json
└── [other languages...]
```

### Service Integration Files
```
src/
├── services/
│   └── translationService.ts    # Main service class
├── hooks/
│   └── useTranslationService.ts # React hooks
├── components/
│   ├── TranslationProvider.tsx  # Context provider
│   ├── DynamicTranslation.tsx   # Dynamic components
│   └── TranslationStatus.tsx    # Status indicator
├── utils/
│   ├── translationUtils.ts      # Utility functions
│   └── environmentValidator.ts  # Config validation
└── scripts/
    └── generateTranslations.ts  # Batch generation
```

## Best Practices

### 1. Content Strategy
- **Static Content**: Use local JSON files (pre-translated, medically reviewed)
- **Dynamic Content**: Use API services with caching
- **Medical Content**: Always use local files for accuracy
- **User-Generated**: Use API services with human review

### 2. Performance Optimization
- **Caching**: 24-hour cache for API translations
- **Batch Processing**: Group multiple translations
- **Rate Limiting**: Respect API limits (100 requests/minute)
- **Lazy Loading**: Load translations on demand

### 3. Quality Assurance
- **Medical Review**: All medical translations reviewed by professionals
- **Term Protection**: Medical terms preserved in original language
- **Validation**: Automated checks for translation quality
- **Fallbacks**: Multiple fallback strategies

### 4. Error Handling
- **Service Failures**: Automatic fallback between services
- **Network Issues**: Graceful degradation to local files
- **Rate Limits**: Intelligent retry with exponential backoff
- **Invalid Keys**: Fallback to original text

## Monitoring and Maintenance

### Translation Dashboard
Access at `/admin/translations` to:
- Monitor service status
- Test translation quality
- Clear cache
- View usage statistics
- Manage translation jobs

### Health Checks
```typescript
import { validateEnvironment } from '../utils/environmentValidator';

const validation = validateEnvironment();
console.log('Translation services ready:', validation.isValid);
```

### Performance Metrics
- Translation cache hit rate
- API response times
- Service availability
- Translation quality scores

## Security Considerations

### API Key Management
- Store keys in environment variables only
- Use restricted API keys when possible
- Rotate keys regularly
- Monitor usage for anomalies

### Content Security
- Validate all translated content
- Protect medical terminology
- Audit translation changes
- Maintain translation logs

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   ```
   Error: DeepL API error: 403 Forbidden
   Solution: Verify API key in environment variables
   ```

2. **Language Not Supported**
   ```
   Error: Language 'tl' not supported by DeepL
   Solution: Service automatically falls back to Google Translate
   ```

3. **Rate Limit Exceeded**
   ```
   Error: Too many requests
   Solution: Implement exponential backoff and caching
   ```

4. **Translation Quality Issues**
   ```
   Issue: Medical terms incorrectly translated
   Solution: Update protected terms list and use local files
   ```

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('translation_debug', 'true');

// View service status
console.log(translationService.getServiceStatus());

// Test specific translation
await translationService.translate('test text', 'es', 'en', {
  preferredService: 'deepl'
});
```

## Cost Management

### DeepL Pricing
- **Free**: 500,000 characters/month
- **Pro**: $6.99/month for 1M characters
- **Advanced**: $22.99/month for 5M characters

### Google Translate Pricing
- **Standard**: $20 per 1M characters
- **No free tier** for API usage

### Optimization Strategies
- Use local files for static content
- Cache API translations aggressively
- Batch translate during off-peak hours
- Monitor character usage closely

## Production Deployment

### Environment Validation
```bash
# Check configuration
npm run validate:env

# Generate missing translations
npm run generate:translations

# Test translation services
npm run test:translations
```

### Deployment Checklist
- [ ] API keys configured and valid
- [ ] All translation files present
- [ ] Service health checks passing
- [ ] Cache configuration optimized
- [ ] RTL styles working correctly
- [ ] Medical content reviewed
- [ ] Error handling tested
- [ ] Performance metrics baseline established

## Support and Maintenance

### Regular Tasks
- **Weekly**: Review translation quality metrics
- **Monthly**: Update protected medical terms
- **Quarterly**: Audit translation costs and usage
- **Annually**: Review and update all translations

### Emergency Procedures
- **Service Outage**: Automatic fallback to local files
- **API Limit Exceeded**: Temporary disable dynamic translation
- **Quality Issues**: Revert to previous translations
- **Security Breach**: Rotate API keys immediately

This integration provides robust, scalable translation services while maintaining the medical accuracy and professional quality required for a LASIK surgery website.