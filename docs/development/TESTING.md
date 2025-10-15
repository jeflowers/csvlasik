# ClearSight CMS - Testing Documentation

## Overview

Comprehensive testing infrastructure for the ClearSight CMS system, covering unit tests, integration tests, and end-to-end testing with specialized focus on medical content accuracy and internationalization.

## Testing Stack

### Frontend Testing
- **Vitest**: Fast unit testing framework
- **Testing Library**: React component testing utilities
- **Playwright**: End-to-end testing across browsers
- **MSW**: API mocking for integration tests

### Backend Testing
- **Vitest**: Node.js unit testing
- **Supertest**: HTTP endpoint testing
- **SQLite Memory**: In-memory database for tests
- **JWT Mocking**: Authentication testing utilities

## Test Categories

### 1. Unit Tests (`src/test/`)

#### Component Tests
- **Header/Footer**: Navigation and responsive behavior
- **LanguageSelector**: Internationalization functionality
- **Admin Components**: Dashboard, login, and management interfaces

#### Service Tests
- **API Service**: HTTP client functionality and error handling
- **Translation Service**: Multi-language support and fallbacks
- **Image Utils**: Optimization and accessibility validation

#### Hook Tests
- **useApi**: Data fetching and state management
- **useTranslationService**: Dynamic translation capabilities
- **Custom Hooks**: Specialized functionality testing

### 2. Integration Tests

#### Translation Integration
- Service integration with React components
- Fallback mechanisms between DeepL and Google Translate
- Medical term protection during translation
- Cache management and performance

#### CMS Integration
- Authentication flow with JWT tokens
- Public/admin route protection
- Error boundary integration
- State management across components

### 3. End-to-End Tests (`e2e/`)

#### User Journeys
- **Homepage**: Hero section, statistics, navigation
- **Procedures**: LASIK, PRK, ICL information pages
- **Contact**: Form submission and validation
- **Admin**: Login, dashboard, content management

#### Internationalization
- Language switching functionality
- RTL language display (Arabic, Hebrew)
- Medical term preservation across languages
- Performance of translation switching

#### Performance
- Page load times and Core Web Vitals
- Image optimization and lazy loading
- Mobile responsiveness
- Accessibility compliance

### 4. Backend API Tests (`server/test/`)

#### Authentication
- Login endpoint security
- JWT token validation
- Rate limiting implementation
- Password security

#### Content Management
- Testimonial CRUD operations
- Article management
- Media upload and processing
- Statistics management

#### Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- File upload security

## Running Tests

### Development Testing
```bash
# Frontend unit tests
npm run test              # Interactive mode
npm run test:watch        # Watch mode
npm run test:run          # Single run

# Backend tests
npm run test:server       # Server-side tests

# E2E tests
npm run test:e2e          # Full browser testing
npm run test:e2e:headed   # Visible browser mode
npm run test:e2e:ui       # Playwright UI mode

# All tests
npm run test:all          # Complete test suite
```

### Coverage Reports
```bash
# Frontend coverage
npm run test:coverage

# View coverage report
open coverage/index.html

# Backend coverage
cd server && npm run test:coverage
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
- **Environment**: jsdom for DOM testing
- **Setup**: Automatic test environment configuration
- **Coverage**: C8 provider with 70% thresholds
- **Timeout**: 10 seconds for async operations

### Playwright Configuration (`playwright.config.ts`)
- **Browsers**: Chrome, Firefox, Safari, Mobile variants
- **Base URL**: http://localhost:5173
- **Retries**: 2 retries in CI environment
- **Screenshots**: On failure only
- **Video**: Retained on failure

## Testing Utilities

### Test Utils (`src/test/utils/testUtils.tsx`)
- **Custom Render**: Includes all necessary providers
- **Mock Factories**: Consistent test data generation
- **API Mocking**: Standardized API response mocking
- **Async Utilities**: Helper functions for async testing

### Mock Services
- **API Mock**: Complete API service mocking
- **i18n Mock**: Internationalization testing support
- **Translation Mock**: Translation service simulation

## Medical Content Testing

### Accuracy Validation
- Medical terminology preservation during translation
- Procedure information accuracy across languages
- Patient privacy protection in testimonials
- HIPAA compliance in data handling

### Translation Quality
- Protected medical terms (LASIK, PRK, ICL, Dr. Flowers)
- Professional medical content review simulation
- Fallback mechanisms for translation failures
- Cache validation for translated content

## Security Testing

### Authentication Security
- JWT token validation and expiration
- Password hashing verification
- Rate limiting effectiveness
- Session management security

### Input Validation
- SQL injection prevention
- XSS attack prevention
- File upload security
- Path traversal protection

### API Security
- Authorization enforcement
- Role-based access control
- Request validation
- Error handling without information disclosure

## Performance Testing

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100 milliseconds
- **CLS (Cumulative Layout Shift)**: < 0.1

### Image Performance
- Lazy loading implementation
- Format optimization (WebP, AVIF)
- Responsive image delivery
- Accessibility compliance

### Translation Performance
- API response time monitoring
- Cache hit rate validation
- Batch translation efficiency
- Service failover speed

## Accessibility Testing

### WCAG 2.1 Compliance
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast validation
- Focus management

### Internationalization Accessibility
- RTL language support
- Font rendering for different scripts
- Cultural adaptation testing
- Language announcement for screen readers

## CI/CD Integration

### GitHub Actions (`.github/workflows/test.yml`)
- **Frontend Tests**: Unit and integration tests
- **Backend Tests**: API and security tests
- **E2E Tests**: Cross-browser testing
- **Security Scan**: Vulnerability assessment

### Test Reporting
- **Coverage Reports**: Uploaded to Codecov
- **E2E Results**: Playwright HTML reports
- **Performance Metrics**: Core Web Vitals tracking
- **Security Scan**: Audit results and vulnerability reports

## Best Practices

### Test Writing Guidelines
1. **Descriptive Names**: Clear test descriptions
2. **Arrange-Act-Assert**: Consistent test structure
3. **Mock Isolation**: Proper mock setup and cleanup
4. **Async Handling**: Proper async/await usage
5. **Error Testing**: Both success and failure scenarios

### Medical Content Testing
1. **Accuracy First**: Medical information must be precise
2. **Privacy Protection**: Patient data handling validation
3. **Translation Review**: Medical translations require human verification
4. **Compliance**: HIPAA and medical regulation adherence

### Performance Testing
1. **Real Conditions**: Test with realistic data sizes
2. **Mobile First**: Mobile performance prioritization
3. **Network Simulation**: Various connection speeds
4. **Accessibility**: Screen reader and keyboard testing

## Troubleshooting

### Common Issues
1. **Test Timeouts**: Increase timeout for slow operations
2. **Mock Failures**: Verify mock setup and cleanup
3. **Translation Tests**: Check API key configuration
4. **E2E Flakiness**: Add proper wait conditions

### Debug Mode
```bash
# Debug specific tests
npm run test -- --reporter=verbose

# Debug E2E tests
npm run test:e2e:headed

# Debug with UI
npm run test:ui
npm run test:e2e:ui
```

## Maintenance

### Regular Tasks
- **Weekly**: Review test coverage and update thresholds
- **Monthly**: Update test data and scenarios
- **Quarterly**: Performance baseline updates
- **Annually**: Complete testing strategy review

### Test Data Management
- **Mock Data**: Keep test data current with production
- **Translation Tests**: Update with new languages
- **Medical Content**: Verify accuracy with medical professionals
- **Security Tests**: Update with latest threat patterns

This comprehensive testing infrastructure ensures the ClearSight CMS maintains the highest standards of quality, security, and medical accuracy while supporting the complex internationalization and content management requirements of a modern medical practice website.