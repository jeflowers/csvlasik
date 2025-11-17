import React, { lazy, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TranslationProvider } from './components/TranslationProvider';
import RTLProvider from './components/RTLProvider';
import TranslationStatus from './components/TranslationStatus';
import Header from './components/Header';
import Footer from './components/Footer';
import ConsentBanner from './components/ConsentBanner';
import { useAdmin } from './hooks/useAdmin';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const LoginForm = lazy(() => import('./components/admin/LoginForm'));
const Dashboard = lazy(() => import('./components/admin/Dashboard'));
const TestimonialsManager = lazy(() => import('./components/admin/TestimonialsManager'));
const ArticlesManager = lazy(() => import('./components/admin/ArticlesManager'));
const MediaLibrary = lazy(() => import('./components/admin/MediaLibrary'));
const StatisticsManager = lazy(() => import('./components/admin/StatisticsManager'));
const UserManager = lazy(() => import('./components/admin/UserManager'));
const SettingsPanel = lazy(() => import('./components/admin/SettingsPanel'));
const TranslationDashboard = lazy(() => import('./components/admin/TranslationDashboard'));
const TranslationEditor = lazy(() => import('./components/admin/TranslationEditor'));
const ComplianceManager = lazy(() => import('./components/admin/ComplianceManager'));
const DataRetentionManager = lazy(() => import('./components/admin/DataRetentionManager'));
const ManagementReviewManager = lazy(() => import('./components/admin/ManagementReviewManager'));
const EncryptionManager = lazy(() => import('./components/admin/EncryptionManager'));
const GDPRManager = lazy(() => import('./components/admin/GDPRManager'));
const RoleManager = lazy(() => import('./components/admin/RoleManager'));
const SecurityDashboard = lazy(() => import('./components/admin/SecurityDashboard'));
const ForgotPassword = lazy(() => import('./components/admin/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/admin/ResetPassword'));
const ExternalReviewsManager = lazy(() => import('./components/admin/ExternalReviewsManager'));
const AppointmentRequestsManager = lazy(() => import('./components/admin/AppointmentRequestsManager'));

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Procedures = lazy(() => import('./pages/Procedures'));
const Lasik = lazy(() => import('./pages/procedures/Lasik'));
const PRK = lazy(() => import('./pages/procedures/PRK'));
const ICL = lazy(() => import('./pages/procedures/ICL'));
const PacificStory = lazy(() => import('./pages/PacificStory'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Technology = lazy(() => import('./pages/Technology'));
const Financing = lazy(() => import('./pages/Financing'));
const Contact = lazy(() => import('./pages/Contact'));
const Media = lazy(() => import('./pages/Media'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const AppointmentRequestForm = lazy(() => import('./components/booking/AppointmentRequestForm'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
  </div>
);


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <a
            href="/admin/login"
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

function AdminRoutes() {
  const { user, loading, error } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <a
            href="/admin/login"
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="login" element={
        user ? <Navigate to="/admin" replace /> : <LoginForm />
      } />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="appointments" element={<AppointmentRequestsManager />} />
        <Route path="testimonials" element={<TestimonialsManager />} />
        <Route path="external-reviews" element={<ExternalReviewsManager />} />
        <Route path="articles" element={<ArticlesManager />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="statistics" element={<StatisticsManager />} />
        <Route path="compliance" element={<ComplianceManager />} />
        <Route path="data-retention" element={<DataRetentionManager />} />
        <Route path="management-review" element={<ManagementReviewManager />} />
        <Route path="compliance/encryption" element={<EncryptionManager />} />
        <Route path="compliance/gdpr" element={<GDPRManager />} />
        <Route path="users" element={<UserManager />} />
        <Route path="roles" element={<RoleManager />} />
        <Route path="security" element={<SecurityDashboard />} />
        <Route path="settings" element={<SettingsPanel />} />
        <Route path="translations" element={<TranslationDashboard />} />
        <Route path="translations/editor" element={<TranslationEditor />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Public Routes */}
          <Route path="/*" element={
            <TranslationProvider preferredService="auto">
              <RTLProvider>
                <div className="min-h-screen bg-white">
                  <TranslationStatus className="fixed top-4 right-4 z-50" />
                  <Header />
                  <main>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/procedures" element={<Procedures />} />
                        <Route path="/procedures/lasik" element={<Lasik />} />
                        <Route path="/procedures/prk" element={<PRK />} />
                        <Route path="/procedures/icl" element={<ICL />} />
                        <Route path="/pacific-story" element={<PacificStory />} />
                        <Route path="/testimonials" element={<Testimonials />} />
                        <Route path="/technology" element={<Technology />} />
                        <Route path="/financing" element={<Financing />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/book-consultation" element={<AppointmentRequestForm />} />
                        <Route path="/blog" element={<Media />} />
                        <Route path="/media" element={<Media />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                  <ConsentBanner />
                </div>
              </RTLProvider>
            </TranslationProvider>
          } />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;