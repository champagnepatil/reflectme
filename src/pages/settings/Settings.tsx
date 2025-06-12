import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { User, Lock, Bell, Shield, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' });
      console.error('Error updating password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (confirmed) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user?.id);

        if (error) throw error;

        await logout();
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        setMessage({ type: 'error', text: 'Failed to delete account' });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Settings</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-success-50 text-success-700'
              : 'bg-error-50 text-error-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center mb-6">
            <User className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-neutral-900">Profile</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="input"
                value={email}
                disabled
              />
              <p className="text-sm text-neutral-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center mb-6">
            <Lock className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-neutral-900">Security</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="label">
                Current Password
              </label>
              <input
                type="password"
                id="current-password"
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="new-password" className="label">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="label">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Lock className="w-4 h-4 mr-2" />
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center mb-6">
            <Bell className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-neutral-900">
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900">Email Notifications</h3>
                <p className="text-sm text-neutral-600">
                  Receive email notifications about your therapy sessions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900">App Notifications</h3>
                <p className="text-sm text-neutral-600">
                  Receive in-app notifications and reminders
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Privacy & Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center mb-6">
            <Shield className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-neutral-900">Privacy & Data</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-neutral-900 mb-2">Data Export</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Download a copy of your personal data
              </p>
              <button className="btn btn-outline">
                Request Data Export
              </button>
            </div>

            <div>
              <h3 className="font-medium text-error-600 mb-2">Delete Account</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Permanently delete your account and all associated data
              </p>
              <button
                onClick={handleDeleteAccount}
                className="btn bg-error-600 text-white hover:bg-error-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;