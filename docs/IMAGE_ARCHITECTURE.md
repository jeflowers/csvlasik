# ClearSight LASIK Website - Image Architecture Documentation

## Overview
This document outlines the comprehensive image architecture refactoring for the ClearSight LASIK website, implementing best practices for medical imagery, performance optimization, and HIPAA compliance.

## Directory Structure

```
public/assets/images/
├── procedures/
│   ├── lasik/
│   │   ├── hero-lasik-surgery-1920x1080.jpg
│   │   ├── hero-lasik-surgery-1920x1080.webp
│   │   ├── process/
│   │   │   ├── step-01-examination.png
│   │   │   ├── step-02-flap-creation.png
│   │   │   ├── step-03-laser-reshaping.png
│   │   │   └── step-04-recovery.png
│   │   └── thumbnails/
│   │       └── lasik-overview-150x150.webp
│   ├── prk/
│   │   ├── hero-prk-surgery-1920x1080.jpg
│   │   └── thumbnails/
│   └── icl/
│       ├── hero-icl-surgery-1920x1080.jpg
│       └── thumbnails/
├── diagrams/
│   ├── anatomy/
│   │   ├── eye-cross-section-detailed.jpg
│   │   └── cornea-layers-diagram.jpg
│   └── educational/
│       ├── advanced-technology-overview.png
│       ├── icare-drs-plus-device.png
│       ├── femtosecond-laser-system.jpg
│       ├── excimer-laser-platform.jpg
│       └── corneal-topographer.jpg
├── brand/
│   ├── logos/
│   │   ├── clearsight-logo-primary.svg
│   │   └── clearsight-logo-white.svg
│   └── icons/
│       └── eye-icon.svg
├── testimonials/
│   └── pacific-mission-impact.jpg
└── team/
    ├── dr-flowers-portrait-primary.jpg
    └── dr-flowers-portrait-secondary.jpg
```

## Naming Conventions

### Format
- Use kebab-case: `lasik-procedure-diagram.webp`
- Include descriptive context: `eye-anatomy-cornea-cross-section.webp`
- Add version/date stamps for medical diagrams: `lasik-technique-v2-2024.webp`
- Responsive variants: `hero-image-800w.webp`, `hero-image-1200w.webp`

### Categories
- **Procedures**: `{procedure-name}-{description}-{dimensions}.{ext}`
- **Diagrams**: `{subject}-{type}-{detail}.{ext}`
- **Team**: `{name}-{type}-{variant}.{ext}`
- **Brand**: `{brand}-{element}-{variant}.{ext}`

## Image Optimization

### Formats
1. **Primary**: WebP for modern browsers
2. **Fallback**: JPEG/PNG for legacy support
3. **Next-gen**: AVIF for cutting-edge optimization

### Quality Settings
- **Medical diagrams**: 90-95% (high accuracy required)
- **Photography**: 80-85% (balanced quality/size)
- **UI elements**: 70-75% (optimized for speed)

### Responsive Breakpoints
- **Small**: 400px (mobile)
- **Medium**: 800px (tablet)
- **Large**: 1200px (desktop)
- **X-Large**: 1920px (high-res displays)

## Components

### ImageOptimizer
Advanced image component with:
- Lazy loading with intersection observer
- Format detection and fallbacks
- Progressive loading with placeholders
- Error handling and retry logic

### ResponsiveImage
Wrapper component providing:
- Automatic responsive image generation
- SEO-optimized alt text validation
- Performance monitoring integration
- Accessibility compliance

### SEOImageMeta
SEO enhancement component:
- Structured data for medical images
- Open Graph image optimization
- Twitter Card integration
- Image sitemap generation

## Performance Features

### Loading Strategies
- **Critical images**: Preloaded and eager loading
- **Above-fold**: Eager loading with high priority
- **Below-fold**: Lazy loading with intersection observer
- **Background**: Deferred loading after page interaction

### Caching
- **Browser cache**: 1 year for immutable images
- **CDN cache**: Global distribution with edge caching
- **Service worker**: Offline image availability
- **Memory cache**: Runtime optimization

### Monitoring
- Core Web Vitals tracking (LCP, CLS)
- Image load time monitoring
- Format adoption analytics
- Error rate tracking

## Security & Compliance

### HIPAA Compliance
- No patient-identifiable images in public directories
- Watermarked proprietary medical diagrams
- Access logging for sensitive medical content
- Secure transmission (HTTPS only)

### Content Security Policy
```
img-src 'self' data: https://images.pexels.com https://cdn.clearsightlasik.com;
```

### Hotlink Protection
- Referrer-based access control
- Watermark replacement for unauthorized use
- Rate limiting for image requests

## Accessibility

### Alt Text Standards
- Descriptive and contextual (minimum 10 characters)
- Medical accuracy for procedure images
- No redundant words like "image" or "picture"
- Structured format: `{procedure} - {description}`

### Examples
```html
<!-- Good -->
<img alt="LASIK Step 1: Comprehensive eye examination and corneal mapping" />

<!-- Bad -->
<img alt="Image of eye exam" />
```

## SEO Optimization

### Image Sitemap
- Comprehensive image catalog
- Medical procedure categorization
- Structured data integration
- Regular updates with new content

### Structured Data
```json
{
  "@type": "ImageObject",
  "contentUrl": "/assets/images/procedures/lasik/hero.jpg",
  "description": "LASIK eye surgery procedure",
  "about": {
    "@type": "MedicalProcedure",
    "name": "LASIK Surgery"
  }
}
```

## Migration Guide

### Phase 1: Directory Setup
1. Create new directory structure
2. Move existing images to appropriate locations
3. Update image references in components

### Phase 2: Component Integration
1. Implement ImageOptimizer component
2. Replace standard img tags with ResponsiveImage
3. Add SEOImageMeta to relevant pages

### Phase 3: Optimization
1. Generate responsive image variants
2. Implement lazy loading
3. Set up performance monitoring

### Phase 4: Enhancement
1. Add AVIF format support
2. Implement CDN integration
3. Enable advanced caching strategies

## Maintenance

### Regular Tasks
- **Weekly**: Monitor image performance metrics
- **Monthly**: Update image sitemaps
- **Quarterly**: Review and optimize large images
- **Annually**: Audit accessibility compliance

### Content Guidelines
- Maximum file size: 500KB for web images
- Minimum dimensions: 400px width for responsive images
- Required formats: Original + WebP + thumbnails
- Alt text review: Medical accuracy verification

## Tools & Scripts

### Build Process
- Image optimization pipeline
- Responsive variant generation
- Format conversion automation
- Quality assurance checks

### Monitoring
- Performance tracking dashboard
- Broken image detection
- Load time analytics
- Format adoption metrics

## Expected Outcomes

### Performance Improvements
- **Page load time**: 40-60% reduction
- **Image load time**: 50-70% improvement
- **Bandwidth usage**: 30-50% reduction
- **Core Web Vitals**: Significant LCP and CLS improvements

### SEO Benefits
- Enhanced image search visibility
- Improved page ranking factors
- Better mobile performance scores
- Comprehensive structured data

### User Experience
- Faster page loads across all devices
- Improved accessibility for screen readers
- Better visual quality on high-DPI displays
- Reduced data usage on mobile connections

### Compliance
- WCAG 2.1 Level AA compliance
- HIPAA-compliant medical image handling
- Enhanced security for proprietary content
- Professional medical imagery standards