import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TranslationProvider } from './components/TranslationProvider';
import RTLProvider from './components/RTLProvider';
import TranslationStatus from './components/TranslationStatus';
import Header from './components/Header';
import Footer from './components/Footer';
import ConsentBanner from './components/ConsentBanner';
import { useAdmin } from './hooks/useAdmin';

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
const ComplianceManager = lazy(() => import('./components/admin/ComplianceManager'));
const EncryptionManager = lazy(() => import('./components/admin/EncryptionManager'));
const GDPRManager = lazy(() => import('./components/admin/GDPRManager'));
const RoleManager = lazy(() => import('./components/admin/RoleManager'));
const SecurityDashboard = lazy(() => import('./components/admin/SecurityDashboard'));
const ForgotPassword = lazy(() => import('./components/admin/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/admin/ResetPassword'));
const ExternalReviewsManager = lazy(() => import('./components/admin/ExternalReviewsManager'));

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

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
  </div>
);


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/admin/login" />;
}

function AdminRoutes() {
  const { user, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/admin/login" element={
        user ? <Navigate to="/admin" /> : <LoginForm />
      } />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="testimonials" element={<TestimonialsManager />} />
        <Route path="external-reviews" element={<ExternalReviewsManager />} />
        <Route path="articles" element={<ArticlesManager />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="statistics" element={<StatisticsManager />} />
        <Route path="compliance" element={<ComplianceManager />} />
        <Route path="compliance/encryption" element={<EncryptionManager />} />
        <Route path="compliance/gdpr" element={<GDPRManager />} />
        <Route path="users" element={<UserManager />} />
        <Route path="roles" element={<RoleManager />} />
        <Route path="security" element={<SecurityDashboard />} />
        <Route path="settings" element={<SettingsPanel />} />
        <Route path="translations" element={<TranslationDashboard />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
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
  );
}


export default App;