import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ReflectMeProvider } from './contexts/ReflectMeContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import CopingTools from './pages/CopingTools';
import SessionRecaps from './pages/SessionRecaps';
import Profile from './pages/Profile';
import Demo from './pages/Demo';

// Layouts
import AppLayout from './layouts/AppLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ReflectMeProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/demo" element={<Demo />} />
            
            {/* App routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Chat />} />
              <Route path="chat" element={<Chat />} />
              <Route path="coping-tools" element={<CopingTools />} />
              <Route path="session-recaps" element={<SessionRecaps />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </ReflectMeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;