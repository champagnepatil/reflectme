import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Save, LogOut, Heart, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useReflectMe } from '../contexts/ReflectMeContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { sessionRecaps, moodEntries } = useReflectMe();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const totalSessions = sessionRecaps.length;
  const totalMoodEntries = moodEntries.length;
  const averageMood = moodEntries.length > 0 
    ? (moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile & Settings</h1>
          <p className="text-slate-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
              </div>

              <div className="flex items-center mb-6">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${user?.email}`}
                  alt={user?.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{user?.name}</h3>
                  <p className="text-slate-600">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>

                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center mb-6">
                <Bell className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-slate-900">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {key === 'dailyCheckins' && 'Daily Check-ins'}
                        {key === 'sessionReminders' && 'Session Reminders'}
                        {key === 'copingToolSuggestions' && 'Coping Tool Suggestions'}
                        {key === 'progressUpdates' && 'Progress Updates'}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {key === 'dailyCheckins' && 'Gentle reminders to check in with ReflectMe'}
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
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center mb-6">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-slate-900">Privacy & Security</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Your Data is Secure</h3>
                  <p className="text-sm text-green-800">
                    All your conversations and data are encrypted and stored securely. 
                    Only you and your therapist have access to your information.
                  </p>
                </div>

                <button className="w-full p-3 text-left border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  <h3 className="font-medium text-slate-900">Download My Data</h3>
                  <p className="text-sm text-slate-600">Export all your ReflectMe data</p>
                </button>

                <button className="w-full p-3 text-left border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-700">
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
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
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                Your Progress
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-sm text-slate-600">Total Sessions</span>
                  </div>
                  <span className="font-semibold text-slate-900">{totalSessions}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-sm text-slate-600">Mood Entries</span>
                  </div>
                  <span className="font-semibold text-slate-900">{totalMoodEntries}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-sm text-slate-600">Average Mood</span>
                  </div>
                  <span className="font-semibold text-slate-900">{averageMood}</span>
                </div>
              </div>
            </motion.div>

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Account</h2>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;