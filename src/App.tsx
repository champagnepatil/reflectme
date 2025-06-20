import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TherapyProvider } from './contexts/TherapyContext';
import { ReflectMeProvider } from './contexts/ReflectMeContext';
import { AssessmentProvider } from './contexts/AssessmentContext';

// Public Pages
import Home from './pages/Home';
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

// ReflectMe App Pages
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

function App() {
  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <div className="App">
        <AuthProvider>
          <TherapyProvider>
            <ReflectMeProvider>
              <AssessmentProvider>
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/hero-demo" element={<HeroDemo />} />
                
                {/* Assessment Route (standalone) */}
                <Route path="/assessment/:clientId" element={<AssessmentPage />} />
                
                {/* Legacy ReflectMe App Routes - redirect to new client routes */}
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
                
                {/* Waitlist Admin Route */}
                <Route path="/waitlist-admin" element={<WaitlistAdmin />} />
                
                {/* Email Campaign Admin Route */}
                <Route path="/email-campaigns" element={<EmailCampaignAdmin />} />

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
            </ReflectMeProvider>
          </TherapyProvider>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;