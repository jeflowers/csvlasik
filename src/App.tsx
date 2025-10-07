import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TranslationProvider } from './components/TranslationProvider';
import RTLProvider from './components/RTLProvider';
import TranslationStatus from './components/TranslationStatus';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/admin/AdminLayout';
import LoginForm from './components/admin/LoginForm';
import Dashboard from './components/admin/Dashboard';
import TestimonialsManager from './components/admin/TestimonialsManager';
import ArticlesManager from './components/admin/ArticlesManager';
import MediaLibrary from './components/admin/MediaLibrary';
import StatisticsManager from './components/admin/StatisticsManager';
import UserManager from './components/admin/UserManager';
import SettingsPanel from './components/admin/SettingsPanel';
import TranslationDashboard from './components/admin/TranslationDashboard';
import ComplianceManager from './components/admin/ComplianceManager';
import EncryptionManager from './components/admin/EncryptionManager';
import GDPRManager from './components/admin/GDPRManager';
import ConsentBanner from './components/ConsentBanner';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Home from './pages/Home';
import About from './pages/About';
import Procedures from './pages/Procedures';
import Lasik from './pages/procedures/Lasik';
import PRK from './pages/procedures/PRK'
import ICL from './pages/procedures/ICL';
import PacificStory from './pages/PacificStory';
import Testimonials from './pages/Testimonials';
import Technology from './pages/Technology';
import Financing from './pages/Financing';
import Contact from './pages/Contact';
import Media from './pages/Media';

// Admin authentication hook
function useAuth() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('cms_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp > Date.now() / 1000) {
          setUser(payload);
        } else {
          localStorage.removeItem('cms_token');
        }
      } catch (error) {
        localStorage.removeItem('cms_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: any) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cms_token');
  };

  return { user, login, logout, loading };
}

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/admin/login" />;
}

function App() {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/login" element={
        user ? <Navigate to="/admin" /> : <LoginForm onLogin={login} />
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout user={user} onLogout={logout} />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="testimonials" element={<TestimonialsManager />} />
        <Route path="articles" element={<ArticlesManager />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="statistics" element={<StatisticsManager />} />
        <Route path="compliance" element={<ComplianceManager />} />
        <Route path="compliance/encryption" element={<EncryptionManager />} />
        <Route path="compliance/gdpr" element={<GDPRManager />} />
        <Route path="users" element={<UserManager />} />
        <Route path="settings" element={<SettingsPanel />} />
        <Route path="translations" element={<TranslationDashboard />} />
      </Route>

      {/* Public Routes */}
      <Route path="/*" element={
        <TranslationProvider preferredService="auto">
          <RTLProvider>
            <div className="min-h-screen bg-white">
              <TranslationStatus className="fixed top-4 right-4 z-50" />
              <Header />
              <main>
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
              </main>
              <Footer />
              <ConsentBanner />
            </div>
          </RTLProvider>
        </TranslationProvider>
      } />
    </Routes>
  );
}

export default App;