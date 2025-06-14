import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Loader2, AlertCircle, Heart } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'demo' | null>(null);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await register(name, email, password, 'patient'); // Default to patient role
      
      // Try to sign in after registration
      await login(email, password);
      
      // Redirect to app
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create an account');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoCredentials = { email: 'demo@reflectme.app', password: 'demo123456' };
    
    try {
      setError('');
      setDemoLoading('demo');
      await login(demoCredentials.email, demoCredentials.password);
      navigate('/app');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Demo login failed';
      
      if (errorMessage.includes('created but sign-in failed')) {
        setError('Demo account created! Please try the demo login button again.');
      } else {
        setError(`Demo login failed: ${errorMessage}`);
      }
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center px-4 py-12 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Join ReflectMe</h1>
            <p className="text-slate-600 mt-2">Start your personalized mental health journey</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Demo Login Button */}
          <div className="mb-6">
            <div className="text-center text-sm text-slate-600 mb-3">Try ReflectMe first:</div>
            <button
              onClick={handleDemoLogin}
              disabled={loading || demoLoading !== null}
              className="w-full btn bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {demoLoading === 'demo' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up demo...
                </>
              ) : (
                'Try Demo Account'
              )}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or create a new account</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={demoLoading !== null}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={demoLoading !== null}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                disabled={demoLoading !== null}
              />
              <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
            </div>
            
            <div className="mb-8">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={demoLoading !== null}
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              disabled={loading || demoLoading !== null}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <p className="text-center mt-6 text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;