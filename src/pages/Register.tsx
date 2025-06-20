import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Loader2, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'therapist' | 'patient'>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'patient' | 'therapist' | null>(null);
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
      await register(name, email, password, role);
      
      // Try to sign in after registration
      await login(email, password);
      
      // Redirect based on user role
      navigate(role === 'therapist' ? '/therapist' : '/client');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create an account');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'patient' | 'therapist') => {
    const demoCredentials = {
      patient: { email: 'democlient@mindtwin.demo', password: 'demo123456' },
      therapist: { email: 'demotherapist@mindtwin.demo', password: 'demo123456' }
    };

    const { email: demoEmail, password: demoPassword } = demoCredentials[role];
    
    try {
      setError('');
      setDemoLoading(role);
      await login(demoEmail, demoPassword);
      navigate(role === 'therapist' ? '/therapist' : '/client');
    } catch (err: any) {
      const errorMessage = err.message.includes('password is incorrect') || err.message.includes('Please use password')
        ? err.message
        : err.message.includes('Database error')
        ? 'System error. Please try again in a few minutes.'
        : 'Demo login failed. Please try again.';
      
      setError(errorMessage);
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
            <h1 className="text-2xl font-bold text-neutral-900">Create Your Account</h1>
            <p className="text-neutral-600 mt-2">Join MindTwin to begin your mental health journey</p>
          </div>
          
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 p-4 rounded-md mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Demo Login Buttons */}
          <div className="text-center text-sm text-neutral-600 mb-3">Try the demo:</div>
          <button
            onClick={() => handleDemoLogin('patient')}
            disabled={loading || demoLoading !== null}
            className="w-full btn bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-3"
          >
            {demoLoading === 'patient' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up demo...
              </>
            ) : (
              'Demo Client'
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
              'Demo Therapist'
            )}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">Or create a new account</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="label">Full Name</label>
              <input
                type="text"
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={demoLoading !== null}
              />
            </div>
            
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
            
            <div className="mb-6">
              <label htmlFor="password" className="label">Password</label>
              <input
                type="password"
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                disabled={demoLoading !== null}
              />
              <p className="text-xs text-neutral-500 mt-1">Must be at least 6 characters</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={demoLoading !== null}
              />
            </div>
            
            <div className="mb-8">
              <label className="label">I am a:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-4 rounded-md border transition-all ${
                    role === 'patient' 
                      ? 'border-primary-600 bg-primary-50 text-primary-700' 
                      : 'border-neutral-300 text-neutral-700 hover:border-primary-300'
                  }`}
                  onClick={() => setRole('patient')}
                  disabled={demoLoading !== null}
                >
                  <span className="font-medium">Client</span>
                </button>
                
                <button
                  type="button"
                  className={`p-4 rounded-md border transition-all ${
                    role === 'therapist' 
                      ? 'border-primary-600 bg-primary-50 text-primary-700' 
                      : 'border-neutral-300 text-neutral-700 hover:border-primary-300'
                  }`}
                  onClick={() => setRole('therapist')}
                  disabled={demoLoading !== null}
                >
                  <span className="font-medium">Therapist</span>
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
          
          <p className="text-center mt-6 text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
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