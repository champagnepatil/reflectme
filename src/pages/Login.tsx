import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Loader2, AlertCircle, Heart } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'demo' | null>(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect user if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // Navigation will happen automatically when user state updates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
      
      // Navigation will happen automatically when user state updates
      setTimeout(() => {
        if (!user) {
          navigate('/app');
        }
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Demo login failed';
      console.error('Demo login error:', errorMessage);
      
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
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-600 mt-2">Sign in to continue your journey with ReflectMe</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm leading-relaxed flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Login Button */}
          <div className="mb-6">
            <div className="text-center text-sm text-slate-600 mb-3">Try ReflectMe:</div>
            
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
              <span className="px-2 bg-white text-slate-500">Or sign in with your account</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
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
            
            <div className="mb-8">
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <p className="text-center mt-6 text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>

          {/* Demo Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Demo Features</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Experience personalized chat support</p>
              <p>• Browse therapist-approved coping tools</p>
              <p>• View session recaps and progress insights</p>
              <p>• Demo account is created automatically</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;