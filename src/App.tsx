import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TherapyProvider } from './contexts/TherapyContext';
import { ZentiaProvider } from './contexts/ZentiaContext';
import { AssessmentProvider } from './contexts/AssessmentContext';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Register from './pages/Register';
import Demo from './pages/Demo';
import HeroDemo from './pages/HeroDemo';
import Login from './pages/Login';

// Therapist Pages
import TherapistDashboard from './pages/therapist/Dashboard';
import TherapistClientDetails from './pages/therapist/ClientDetails';
import TherapistNotes from './pages/therapist/Notes';
import TherapistAnalytics from './pages/therapist/Analytics';
import TherapistNotesOverview from './pages/therapist/NotesOverview';
import CaseHistories from './pages/therapist/CaseHistories';
import CaseHistoryForm from './pages/therapist/CaseHistoryForm';
import CaseHistoryView from './pages/therapist/CaseHistoryView';
import SessionRecap from './pages/therapist/SessionRecap';
import MonitoringReview from './pages/therapist/MonitoringReview';
import ActiveClients from './pages/therapist/ActiveClients';
import Monitoring from './pages/therapist/Monitoring';
import Patterns from './pages/therapist/Patterns';

// Patient Pages (Original)
import PatientDashboard from './pages/patient/Dashboard';
import PatientJournal from './pages/patient/Journal';
import PatientMonitoring from './pages/patient/Monitoring';
import AssessmentPage from './pages/AssessmentPage';

// Client Pages (New Architecture)
import ClientInsights from './pages/client/Insights';
import Plan from './pages/client/Plan';

// Zentia App Pages
import Chat from './pages/Chat';
import CopingTools from './pages/CopingTools';
import SessionRecaps from './pages/SessionRecaps';
import Profile from './pages/Profile';
import ConnectHealthPage from './pages/ConnectHealth';
import OAuthCallbackPage from './pages/OAuthCallback';

// Settings
import Settings from './pages/settings/Settings';

// Test Components
import { PDFTestComponent } from './components/test/PDFTestComponent';
import Phase4Test from './pages/Phase4Test';
import DataSeeder from './pages/DataSeeder';
import PrototypeOverview from './pages/PrototypeOverview';
import GeminiTest from './pages/GeminiTest';
import WaitlistAdmin from './components/waitlist/WaitlistAdmin';
import EmailCampaignAdmin from './components/waitlist/EmailCampaignAdmin';

// Layouts
import UnifiedLayout from './layouts/UnifiedLayout';
import TherapistLayout from './layouts/TherapistLayout';
import PatientLayout from './layouts/PatientLayout';
import AppLayout from './layouts/AppLayout';

import { AITestPanel } from './components/AITestPanel';

// Access Denied Component
const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-4">Access Denied</h1>
        <p className="text-neutral-600 mb-8">
          You don't have permission to access this admin area. 
          This section is restricted to authorized administrators only.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Return to Homepage
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
};

// Admin Route Protection Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is admin (same logic as in Home.tsx)
  const isAdmin = user?.email?.includes('admin') || 
                  user?.email?.includes('l.de.angelis') || 
                  user?.role === 'admin' ||
                  false;

  // If not loading and not admin, show access denied page
  if (!loading && !isAdmin) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <div className="App">
        <AuthProvider>
          <TherapyProvider>
            <ZentiaProvider>
              <AssessmentProvider>
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/hero-demo" element={<HeroDemo />} />
                
                {/* Assessment Route (standalone) */}
                <Route path="/assessment/:clientId" element={<AssessmentPage />} />
                
                {/* Legacy Zentia App Routes - redirect to new client routes */}
                <Route path="/app" element={<Navigate to="/client" replace />} />
                <Route path="/app/*" element={<Navigate to="/client" replace />} />
                
                {/* NEW UNIFIED CLIENT ROUTES */}
                <Route path="/client" element={<UnifiedLayout />}>
                  <Route index element={<PatientDashboard />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="monitoring" element={<PatientMonitoring />} />
                  <Route path="plan" element={<Plan />} />
                  <Route path="insights" element={<ClientInsights />} />
                  <Route path="journal" element={<PatientJournal />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* NEW UNIFIED THERAPIST ROUTES */}
                <Route path="/therapist" element={<UnifiedLayout />}>
                  <Route index element={<TherapistDashboard />} />
                  <Route path="clients" element={<ActiveClients />} />
                  <Route path="clients/:clientId" element={<TherapistClientDetails />} />
                  <Route path="client/:clientId" element={<TherapistClientDetails />} />
                  <Route path="monitoring" element={<Monitoring />} />
                  <Route path="monitoring/:clientId" element={<MonitoringReview />} />
                  <Route path="analytics" element={<TherapistAnalytics />} />
                  <Route path="patterns" element={<Patterns />} />
                  <Route path="reports" element={<CaseHistories />} /> {/* Reusing case histories as reports */}
                  <Route path="notes" element={<Navigate to="/therapist/notes-overview" replace />} />
                  <Route path="notes/:clientId" element={<TherapistNotes />} />
                  <Route path="notes-overview" element={<TherapistNotesOverview />} />
                  <Route path="case-histories" element={<CaseHistories />} />
                  <Route path="case-histories/new" element={<CaseHistoryForm />} />
                  <Route path="case-history/:id" element={<CaseHistoryView />} />
                  <Route path="session-recap/:clientId" element={<SessionRecap />} />
                  <Route path="settings" element={<Settings />} />
                  
                  {/* Legacy routes - keep for backwards compatibility */}
                  <Route path="active-clients" element={<Navigate to="/therapist/clients" replace />} />
                </Route>

                {/* Health & OAuth routes */}
                <Route path="/connect-health" element={<ConnectHealthPage />} />
                <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

                {/* Settings standalone */}
                <Route path="/settings" element={<Settings />} />
                
                {/* Prototype Overview */}
                <Route path="/prototype" element={<PrototypeOverview />} />
                
                {/* PROTECTED ADMIN ROUTES */}
                <Route path="/waitlist-admin" element={
                  <AdminRoute>
                    <WaitlistAdmin />
                  </AdminRoute>
                } />
                
                <Route path="/email-campaigns" element={
                  <AdminRoute>
                    <EmailCampaignAdmin />
                  </AdminRoute>
                } />

                {/* Test Routes (Development Only) */}
                <Route path="/test/pdf" element={<PDFTestComponent />} />
                <Route path="/analytics-demo" element={<Phase4Test />} />
                <Route path="/data-seeder" element={<DataSeeder />} />

                {/* Development AI Test Panel */}
                {import.meta.env.MODE === 'development' && (
                  <>
                    <Route path="/ai-test" element={<AITestPanel />} />
                    <Route path="/gemini-test" element={<GeminiTest />} />
                  </>
                )}

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AssessmentProvider>
            </ZentiaProvider>
          </TherapyProvider>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;