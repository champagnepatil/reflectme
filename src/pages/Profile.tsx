import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Save, LogOut, Heart, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { useZentia } from '../contexts/ZentiaContext';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { sessionRecaps, moodEntries } = useZentia();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [name, setName] = useState('Demo Patient');
  const [notifications, setNotifications] = useState({
    dailyCheckins: true,
    sessionReminders: true,
    copingToolSuggestions: true,
    progressUpdates: false,
  });

  const handleSave = () => {
    // In a real app, this would update the user profile
    console.log('Saving profile:', { name, notifications });
  };

  const handleLogout = () => {
    navigate('/');
  };

  const totalSessions = sessionRecaps.length;
  const totalMoodEntries = moodEntries.length;
  const averageMood = moodEntries.length > 0 
    ? (moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <Link to="/app" className="p-2 rounded-full hover:bg-neutral-200 mr-3 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Profile & Settings</h1>
            <p className="text-neutral-600">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-neutral-900">Profile Information</h2>
              </div>

              <div className="flex items-center mb-6">
                <img 
                  src="https://api.dicebear.com/7.x/personas/svg?seed=demo-patient"
                  alt="Demo Patient"
                  className="w-16 h-16 rounded-2xl mr-4"
                />
                <div>
                  <h3 className="text-lg font-medium text-neutral-900">Demo Patient</h3>
                  <p className="text-neutral-600">patient@demo.com</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value="patient@demo.com"
                    disabled
                    className="input bg-neutral-100 text-neutral-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Email cannot be changed in demo mode</p>
                </div>

                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center mb-6">
                <Bell className="w-5 h-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-neutral-900">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        {key === 'dailyCheckins' && 'Daily Check-ins'}
                        {key === 'sessionReminders' && 'Session Reminders'}
                        {key === 'copingToolSuggestions' && 'Coping Tool Suggestions'}
                        {key === 'progressUpdates' && 'Progress Updates'}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {key === 'dailyCheckins' && 'Gentle reminders to check in with Zentia'}
                        {key === 'sessionReminders' && 'Notifications about upcoming therapy sessions'}
                        {key === 'copingToolSuggestions' && 'Personalized coping tool recommendations'}
                        {key === 'progressUpdates' && 'Weekly summaries of your progress'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Privacy & Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center mb-6">
                <Shield className="w-5 h-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-neutral-900">Privacy & Security</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-success-50 border border-success-200 rounded-2xl">
                  <h3 className="font-medium text-success-900 mb-2">Your Data is Secure</h3>
                  <p className="text-sm text-success-800">
                    All your conversations and data are encrypted and stored securely. 
                    Only you and your therapist have access to your information.
                  </p>
                </div>

                <button className="w-full p-4 text-left border border-neutral-300 rounded-2xl hover:bg-neutral-50 transition-colors">
                  <h3 className="font-medium text-neutral-900">Download My Data</h3>
                  <p className="text-sm text-neutral-600">Export all your Zentia data</p>
                </button>

                <button className="w-full p-4 text-left border border-error-300 rounded-2xl hover:bg-error-50 transition-colors text-error-700">
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-sm text-error-600">Permanently delete your account and all data</p>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
                Your Progress
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600">Total Sessions</span>
                  </div>
                  <span className="font-semibold text-neutral-900">{totalSessions}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600">Mood Entries</span>
                  </div>
                  <span className="font-semibold text-neutral-900">{totalMoodEntries}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm text-neutral-600">Average Mood</span>
                  </div>
                  <span className="font-semibold text-neutral-900">{averageMood}</span>
                </div>
              </div>
            </motion.div>

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Demo Account</h2>
              
              <button
                onClick={handleLogout}
                className="w-full btn btn-soft hover:bg-neutral-800 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit Demo
              </button>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          {user?.isDemo && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <span className="font-semibold text-yellow-800">Modalità Demo Attiva</span>
              <span className="text-yellow-700 text-xs">(i dati non saranno salvati in modo permanente)</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;