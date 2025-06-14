import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Loader2, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'patient' | 'therapist' | null>(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get role from URL params if provided
  const roleFromUrl = searchParams.get('role') as 'patient' | 'therapist' | null;

  // Redirect user if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'therapist') {
        navigate('/therapist');
      } else {
        navigate('/app');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    // If role is specified in URL, auto-trigger demo login
    if (roleFromUrl && (roleFromUrl === 'patient' || roleFromUrl === 'therapist') && !user) {
      handleDemoLogin(roleFromUrl);
    }
  }, [roleFromUrl, user]);

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
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'patient' | 'therapist') => {
    const demoCredentials = {
      patient: { email: 'patient@mindtwin.demo', password: 'demo123456' },
      therapist: { email: 'therapist@mindtwin.demo', password: 'demo123456' }
    };

    const { email: demoEmail, password: demoPassword } = demoCredentials[role];
    
    try {
      setError('');
      setDemoLoading(role);
      
      await login(demoEmail, demoPassword);
      
      // Navigation will happen automatically when user state updates
      
    } catch (err: any) {
      const errorMessage = err.message || 'Demo login failed';
      console.error('Demo login error:', errorMessage);
      setError(`Demo login failed: ${errorMessage}`);
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">Welcome Back</h1>
            <p className="text-neutral-600 mt-2">Sign in to continue to MindTwin</p>
          </div>
          
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 p-4 rounded-md mb-6 text-sm leading-relaxed flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Login Buttons */}
          <div className="mb-6 space-y-3">
            <div className="text-center text-sm text-neutral-600 mb-3">Try the demo:</div>
            
            <button
              onClick={() => handleDemoLogin('patient')}
              disabled={loading || demoLoading !== null}
              className="w-full btn bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {demoLoading === 'patient' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up demo...
                </>
              ) : (
                'Demo as Patient'
              )}
            </button>
            
            <button
              onClick={() => handleDemoLogin('therapist')}
              disabled={loading || demoLoading !== null}
              className="w-full btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {demoLoading === 'therapist' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up demo...
                </>
              ) : (
                'Demo as Therapist'
              )}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">Or sign in with your account</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="label">Email Address</label>
              <input
                type="email"
                id="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={demoLoading !== null}
              />
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="label">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={demoLoading !== null}
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
          
          <p className="text-center mt-6 text-neutral-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>

          {/* Demo Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Demo Instructions</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Patient Demo:</strong> Experience the ReflectMe chat interface and coping tools</p>
              <p>• <strong>Therapist Demo:</strong> Review client monitoring data and case histories</p>
              <p>• Demo accounts are created automatically on first login</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;