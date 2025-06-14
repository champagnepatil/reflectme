import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TherapyProvider } from './contexts/TherapyContext';
import { ReflectMeProvider } from './contexts/ReflectMeContext';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Demo from './pages/Demo';
import HeroDemo from './pages/HeroDemo';

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

// Patient Pages (Original)
import PatientDashboard from './pages/patient/Dashboard';
import PatientChat from './pages/patient/Chat';
import PatientJournal from './pages/patient/Journal';
import PatientMonitoring from './pages/patient/Monitoring';

// ReflectMe App Pages
import Chat from './pages/Chat';
import CopingTools from './pages/CopingTools';
import SessionRecaps from './pages/SessionRecaps';
import Profile from './pages/Profile';

// Settings
import Settings from './pages/settings/Settings';

// Layouts
import TherapistLayout from './layouts/TherapistLayout';
import PatientLayout from './layouts/PatientLayout';
import AppLayout from './layouts/AppLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TherapyProvider>
          <ReflectMeProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/hero-demo" element={<HeroDemo />} />
              
              {/* ReflectMe App Routes */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/chat" replace />} />
                <Route path="chat" element={<Chat />} />
                <Route path="coping-tools" element={<CopingTools />} />
                <Route path="session-recaps" element={<SessionRecaps />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* Therapist routes */}
              <Route path="/therapist" element={<TherapistLayout />}>
                <Route index element={<TherapistDashboard />} />
                <Route path="client/:clientId" element={<TherapistClientDetails />} />
                <Route path="client/:clientId/session-recap" element={<SessionRecap />} />
                <Route path="notes" element={<TherapistNotesOverview />} />
                <Route path="notes/:clientId" element={<TherapistNotes />} />
                <Route path="analytics" element={<TherapistAnalytics />} />
                <Route path="case-histories" element={<CaseHistories />} />
                <Route path="case-histories/new" element={<CaseHistoryForm />} />
                <Route path="case-histories/:id" element={<CaseHistoryView />} />
                <Route path="case-histories/:id/edit" element={<CaseHistoryForm />} />
                <Route path="monitoring" element={<MonitoringReview />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* Patient routes (Original) */}
              <Route path="/patient" element={<PatientLayout />}>
                <Route index element={<PatientDashboard />} />
                <Route path="chat" element={<PatientChat />} />
                <Route path="journal" element={<PatientJournal />} />
                <Route path="monitoring" element={<PatientMonitoring />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </ReflectMeProvider>
        </TherapyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;