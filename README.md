# Atelier - Dr. Charles Flowers LASIK Website

A comprehensive multilingual website for Dr. Charles Flowers' revolutionary LASIK surgery practice, featuring a React frontend with Supabase backend and full CMS capabilities.

## Features

### Public Website
- Revolutionary LASIK surgery information
- Dr. Flowers' Pacific mission story
- Patient testimonials and results
- Educational articles and blog
- Procedure comparisons (LASIK, PRK, ICL)
- Contact and consultation booking
- **Multilingual Support**: 11 languages including English, Spanish, Chinese, Korean, Tagalog, Vietnamese, Hebrew, Arabic, Armenian, Portuguese, and Mexican Spanish
- **RTL Language Support**: Proper right-to-left text rendering for Hebrew and Arabic
- Responsive design optimized for all devices

### CMS Features
- **Testimonial Management**: Approve, edit, and categorize patient testimonials
- **Article Management**: Create and publish educational content
- **Media Library**: Upload and organize images, videos, and documents
- **Statistics Dashboard**: Track and update key metrics
- **User Management**: Role-based access control
- **Translation Management**: Manage translations across 11 languages
- **GDPR Compliance**: Cookie consent, privacy controls, data export/deletion
- **HIPAA Audit Controls**: Comprehensive PHI access tracking and compliance monitoring
- **Audit Logging**: Track all content changes with tamper-proof logs

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Configure your Supabase credentials in .env
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Initialize Supabase Database
The database schema is automatically applied through Supabase migrations in `supabase/migrations/`.

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Application
- **Public Website**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin (Supabase Auth required)

## Project Structure

```
/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   │   └── admin/         # CMS admin components
│   ├── pages/             # Public website pages
│   │   └── procedures/    # Procedure-specific pages
│   ├── services/          # API service layer
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization setup
│   ├── lib/               # Supabase client
│   └── test/              # Unit and integration tests
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge functions (privileged user/email/retention ops)
├── public/                # Static assets
│   ├── locales/           # Translation files (11 languages)
│   └── assets/            # Images and videos
├── e2e/                   # End-to-end tests (Playwright)
└── docs/                  # Documentation (organized by topic)
    ├── setup/             # Setup and configuration guides
    ├── deployment/        # Production deployment docs
    ├── development/       # Development and troubleshooting
    ├── administration/    # Security, compliance, and admin
    ├── translations/      # Internationalization guides
    └── project-history/   # Development milestones
```

## Data Access

All data access goes through the Supabase client (`src/lib/supabase.ts`) and the domain wrappers in `src/services/` (e.g. `services/cms/`, `services/consultation/`, `services/nextech/`, `services/ringcentral/`). There is no separate REST/Express API — RLS policies on the Postgres tables enforce auth, and the `supabase/functions/` edge functions handle privileged operations (`create-user`, `delete-user`, `reset-user-password`, `update-user`, `process-email-queue`, `process-email-queue-gmail`, `run-retention-policies`).

## User Roles

- **Admin**: Full system access, user management
- **Editor**: Content creation, approval, media management
- **Contributor**: Content creation (requires approval)
- **Viewer**: Read-only access to admin interface

## Content Management

### Testimonials
- Patient privacy protection (full name, initials, or anonymous)
- Procedure-specific categorization
- Special badges for milestone patients
- Approval workflow with moderation

### Articles
- Rich text editor with medical terminology support
- SEO metadata management
- Category organization
- Scheduled publishing

### Media Library
- Automatic image optimization
- Organized by type and category
- Alt text and caption support
- Secure file serving

### Statistics
- Real-time procedure counters
- Pacific mission impact metrics
- Patient satisfaction rates
- Travel time/cost savings

## Internationalization

### Supported Languages
1. **English** (en) - Default
2. **Spanish** (es)
3. **Mexican Spanish** (es-MX)
4. **Chinese** (zh)
5. **Korean** (ko)
6. **Tagalog** (tl)
7. **Vietnamese** (vi)
8. **Hebrew** (he) - RTL
9. **Arabic** (ar) - RTL
10. **Armenian** (hy)
11. **Portuguese** (pt-BR)

### Translation Features
- Automatic language detection based on browser settings
- Manual language switcher in header
- RTL (Right-to-Left) layout support for Hebrew and Arabic
- Phone numbers and technical content maintain LTR format in RTL languages
- Translation management through CMS
- Namespace-based organization (common, navigation, home, procedures, etc.)

### Adding New Languages
1. Create translation files in `public/locales/[language-code]/`
2. Add language to `src/i18n/index.ts`
3. Update language selector in `src/components/LanguageSelector.tsx`
4. Add RTL configuration if needed in `src/components/RTLProvider.tsx`

## Security Features

- **Supabase Authentication**: Email/password authentication with JWT tokens
- **Row Level Security (RLS)**: Database-level security policies
- **Role-based access control**: Admin, Editor, Contributor, Viewer roles
- **Rate limiting**: API endpoint protection
- **File upload validation**: Secure media handling
- **GDPR Compliance**: Cookie consent, data export, right to be forgotten
- **HIPAA-compliant audit logging**: Track all content changes
- **Secure password hashing**: bcrypt for password storage
- **XSS Protection**: Input sanitization and validation

## Testing

### Unit Tests
```bash
npm run test              # Run all tests
npm run test:ui           # Run tests with UI
npm run test:coverage     # Generate coverage report
```

### End-to-End Tests
```bash
npm run test:e2e          # Run Playwright tests
npm run test:e2e:ui       # Run with Playwright UI
npm run test:e2e:headed   # Run in headed mode
```

## Documentation

Comprehensive documentation is organized by topic in the `/docs` folder:

### Quick Links
- **📚 [Full Documentation Index](./docs/README.md)** - Complete documentation guide
- **🚀 [Quick Admin Setup](./docs/setup/QUICK_ADMIN_SETUP.md)** - Get started in 5 minutes
- **🔐 [Security Guide](./docs/administration/SECURITY.md)** - Security best practices
- **🌐 [Deployment Guide](./docs/deployment/DEPLOYMENT.md)** - Production deployment
- **🔧 [Troubleshooting](./docs/development/TROUBLESHOOTING.md)** - Common issues and fixes

### Documentation Categories
- **[Setup](./docs/setup/)** - Initial configuration and admin setup
- **[Deployment](./docs/deployment/)** - Production deployment and operations
- **[Development](./docs/development/)** - Development guides and troubleshooting
- **[Administration](./docs/administration/)** - Security, compliance, and admin operations
- **[Translations](./docs/translations/)** - Internationalization and translation guides
- **[Project History](./docs/project-history/)** - Development milestones and status

## Deployment

For detailed deployment instructions, see **[Deployment Guide](./docs/deployment/DEPLOYMENT.md)**.

### Quick Deployment
```bash
npm run build
# Deploy dist/ folder to Netlify, Vercel, or any static hosting provider
```

### Supabase Setup
See **[Admin Setup Guide](./docs/setup/ADMIN_SETUP.md)** for complete instructions.

### Environment Variables
```bash
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## Integration with Existing Site

The CMS integrates seamlessly with the existing React application:

1. **Dynamic Testimonials**: Patient Results page automatically loads approved testimonials
2. **Blog Content**: Articles are dynamically loaded in the Blog section
3. **Statistics**: Homepage counters update from CMS data
4. **Media**: All images and videos served through the media API

## Development

### Adding New Content Types
1. Add a migration in `supabase/migrations/` (timestamp-prefixed) defining the table and RLS policies
2. Add a service wrapper in `src/services/` (or a domain sub-folder) that calls Supabase via `src/lib/supabase.ts`
3. Create admin components in `src/components/admin/`
4. Add to navigation in `AdminLayout.tsx`

### Customizing the Admin Interface
- Modify `src/components/admin/` components
- Update navigation in `AdminLayout.tsx`
- Add new service methods in `src/services/` as needed

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **i18next** for internationalization
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Supabase** for database, authentication, storage, and edge functions
- **PostgreSQL** with Row Level Security
- **Deno** edge functions for privileged operations (`supabase/functions/`)

### Testing
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **React Testing Library** for component testing

### Dev Tools
- **ESLint** for code linting
- **TypeScript** for type safety
- **Git** for version control

## Documentation

Additional documentation can be found in the `docs/` directory:
- `SECURITY.md` - Security guidelines and best practices
- `TESTING.md` - Testing strategy and guidelines
- `TRANSLATION_SETUP.md` - Translation system setup
- `TRANSLATION_INTEGRATION.md` - Translation integration guide
- `COMPLIANCE_IMPLEMENTATION.md` - GDPR compliance details
- `IMAGE_ARCHITECTURE.md` - Image optimization guide

## Support

For technical support or questions:
1. Review documentation in `docs/` directory
2. Check Supabase dashboard for database issues
3. Review browser console for frontend errors
4. Ensure environment variables are correctly set
5. Check `TROUBLESHOOTING.md` for common issues

## License

This system is proprietary software developed specifically for Atelier - Dr. Charles Flowers' practice.

## Recent Updates

### RTL Language Support (Latest)
- Fixed phone number display in RTL languages (Hebrew, Arabic)
- Phone numbers now maintain LTR format with proper icon positioning
- Applied fix to both homepage hero section and footer

### Internationalization
- Added support for 11 languages
- Implemented automatic language detection
- Added RTL layout support for Hebrew and Arabic
- Translation management through CMS

### Supabase Migration
- Migrated from SQLite to Supabase PostgreSQL
- Implemented Row Level Security (RLS)
- Added Supabase authentication
- Database migrations in `supabase/migrations/`