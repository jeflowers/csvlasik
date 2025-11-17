# Translation Service Setup Guide

## Overview
ClearSight CMS supports both DeepL and Google Translate APIs for automated content translation. You can use either service independently or configure both for redundancy and broader language support.

## Service Comparison

### DeepL
- **Strengths**: Superior translation quality, especially for European languages
- **Languages**: 31 languages with high accuracy
- **Best for**: Professional medical content, formal communications
- **Pricing**: Free tier: 500,000 characters/month

### Google Translate
- **Strengths**: Broader language support (100+ languages), reliable service
- **Languages**: 100+ languages including regional variants
- **Best for**: Broader language coverage, Asian and Pacific languages
- **Pricing**: $20 per 1M characters

## Setup Instructions

### 1. DeepL API Setup

1. **Create DeepL Account**
   - Visit [DeepL API](https://www.deepl.com/pro-api)
   - Sign up for a free or pro account
   - Navigate to your account settings

2. **Get API Key**
   - Go to "API Keys" section
   - Generate a new API key
   - Copy the key for configuration

3. **Configure Environment**
   ```bash
   # Add to server/.env
   DEEPL_API_KEY=your-deepl-api-key-here
   DEEPL_API_URL=https://api-free.deepl.com/v2
   ```

### 2. Google Translate API Setup

1. **Create Google Cloud Project**
   - Visit [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable the Cloud Translation API

2. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Restrict the key to Translation API only
   - Copy the API key

3. **Configure Environment**
   ```bash
   # Add to server/.env
   GOOGLE_TRANSLATE_API_KEY=your-google-api-key-here
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   ```

## Language Support Matrix

| Language | Code | DeepL | Google | Recommended Service |
|----------|------|-------|--------|-------------------|
| Spanish | es | ✅ | ✅ | DeepL (better quality) |
| Spanish (Mexico) | es-MX | ✅ | ✅ | DeepL |
| Portuguese (Brazil) | pt-BR | ✅ | ✅ | DeepL |
| Korean | ko | ✅ | ✅ | DeepL |
| Chinese (Simplified) | zh | ✅ | ✅ | DeepL |
| Arabic | ar | ✅ | ✅ | DeepL |
| Hebrew | he | ✅ | ✅ | DeepL |
| Tagalog | tl | ❌ | ✅ | Google (only option) |
| Vietnamese | vi | ❌ | ✅ | Google (only option) |
| Armenian | hy | ❌ | ✅ | Google (only option) |

## Configuration Options

### Service Priority
The system automatically selects the best available service:

1. **Auto Mode** (Recommended): 
   - Uses DeepL for supported languages (better quality)
   - Falls back to Google Translate for unsupported languages
   - Provides automatic failover if one service is down

2. **DeepL Only**: 
   - Uses only DeepL API
   - Limited to DeepL-supported languages
   - Higher quality translations

3. **Google Only**: 
   - Uses only Google Translate API
   - Broader language support
   - Consistent service across all languages

### Medical Term Protection
Both services are configured to protect medical terminology:

```javascript
const protectedTerms = [
  'LASIK', 'PRK', 'ICL', 'FDA',
  'Dr. Charles Flowers', 'ClearSight',
  'Visian ICL', 'Femtosecond', 'Excimer'
];
```

## Usage in CMS

### Automatic Translation
1. Navigate to Translation Management in admin panel
2. Select content to translate
3. Choose target languages
4. Select preferred service (or use Auto)
5. Click "Start Translation"

### Manual Review Workflow
1. Auto-translated content is marked as "auto_translated"
2. Editors can review and approve translations
3. Medical content should always be reviewed by qualified personnel
4. Approved translations are published to the public site

### Batch Translation
- Translate multiple articles/testimonials at once
- Progress tracking for large batches
- Error handling and retry logic
- Service failover for reliability

## Best Practices

### Content Preparation
- Use clear, simple sentences for better translation
- Avoid idioms and colloquialisms
- Structure content with proper headings
- Include context for medical terms

### Quality Assurance
- Always review medical content translations
- Test translations with native speakers
- Monitor translation quality metrics
- Update protected terms list as needed

### Performance Optimization
- Cache translations to avoid repeated API calls
- Use batch translation for efficiency
- Monitor API usage and costs
- Implement rate limiting for API protection

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   ```
   Error: Invalid API key
   Solution: Verify API key in environment variables
   ```

2. **Language Not Supported**
   ```
   Error: Language not supported by service
   Solution: Check language support matrix above
   ```

3. **Rate Limit Exceeded**
   ```
   Error: Too many requests
   Solution: Implement request throttling or upgrade plan
   ```

4. **Translation Quality Issues**
   ```
   Issue: Poor medical term translation
   Solution: Update protected terms list and review workflow
   ```

### Monitoring
- Check service status in admin panel
- Monitor API usage and costs
- Track translation quality feedback
- Review error logs regularly

## Security Considerations

### API Key Security
- Store API keys in environment variables only
- Never commit API keys to version control
- Use restricted API keys when possible
- Rotate keys regularly

### Content Security
- Review all medical translations before publishing
- Maintain audit trail of translation changes
- Implement approval workflow for sensitive content
- Backup original content before translation

## Cost Management

### DeepL Pricing
- Free: 500,000 characters/month
- Pro: $6.99/month for 1M characters
- Advanced: $22.99/month for 5M characters

### Google Translate Pricing
- $20 per 1M characters
- No free tier for API usage
- Volume discounts available

### Optimization Tips
- Cache translations to avoid duplicate API calls
- Use batch translation for efficiency
- Monitor character usage regularly
- Implement content length limits

## Support

For technical issues:
1. Check API service status pages
2. Review error logs in admin panel
3. Test API keys with simple requests
4. Contact service providers for API issues

For translation quality:
1. Use native speaker reviewers
2. Implement feedback collection
3. Maintain glossary of medical terms
4. Regular quality audits