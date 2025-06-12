import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TherapyProvider } from './contexts/TherapyContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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
import PatientDashboard from './pages/patient/Dashboard';
import PatientChat from './pages/patient/Chat';
import PatientJournal from './pages/patient/Journal';
import PatientMonitoring from './pages/patient/Monitoring';
import Settings from './pages/settings/Settings';
import HeroDemo from './pages/HeroDemo';

// Layouts
import TherapistLayout from './layouts/TherapistLayout';
import PatientLayout from './layouts/PatientLayout';

// Demo
import Demo from './pages/Demo';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TherapyProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/hero-demo" element={<HeroDemo />} />
            
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
            
            {/* Patient routes */}
            <Route path="/patient" element={<PatientLayout />}>
              <Route index element={<PatientDashboard />} />
              <Route path="chat" element={<PatientChat />} />
              <Route path="journal" element={<PatientJournal />} />
              <Route path="monitoring" element={<PatientMonitoring />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </TherapyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;