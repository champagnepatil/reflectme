import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { AppError, ErrorType, ErrorSeverity, logError } from '../utils/errorHandling';

type VerificationState = 'loading' | 'success' | 'error' | 'expired' | 'already_verified' | 'resend';

interface VerificationError {
  message: string;
  canResend: boolean;
  needsNewRegistration: boolean;
}

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [state, setState] = useState<VerificationState>('loading');
  const [error, setError] = useState<VerificationError | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get tokens from URL parameters
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const email = searchParams.get('email');

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle email verification on component mount
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // If no token, show resend form
        if (!token || !type) {
          setState('resend');
          return;
        }

        setState('loading');

        // Verify the email with Supabase
        const { data, error: verificationError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any
        });

        if (verificationError) {
          console.error('Email verification error:', verificationError);
          
          if (verificationError.message.includes('expired')) {
            setError({
              message: 'This verification link has expired. Please request a new one.',
              canResend: true,
              needsNewRegistration: false
            });
            setState('expired');
          } else if (verificationError.message.includes('already confirmed')) {
            setState('already_verified');
          } else {
            setError({
              message: verificationError.message || 'Verification failed. Please try again.',
              canResend: true,
              needsNewRegistration: false
            });
            setState('error');
          }
          return;
        }

        if (data.user) {
          setState('success');
          
          // Log successful verification
          logError(new AppError(
            'Email verification successful',
            ErrorType.UNKNOWN,
            ErrorSeverity.LOW,
            { userId: data.user.id, email: data.user.email }
          ), {
            action: 'email_verification_success',
            userId: data.user.id
          });

          // Redirect to welcome page after a delay
          setTimeout(() => {
            navigate('/welcome', { 
              state: { 
                newUser: true, 
                role: data.user.user_metadata?.role || 'patient' 
              } 
            });
          }, 3000);
        }
      } catch (err) {
        console.error('Verification process error:', err);
        
        const appError = err instanceof AppError ? err : new AppError(
          `Email verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          ErrorType.AUTHENTICATION,
          ErrorSeverity.HIGH,
          { token: !!token, type, email }
        );
        
        logError(appError, {
          action: 'email_verification_error',
          additionalData: { token: !!token, type, email }
        });

        setError({
          message: 'Something went wrong during verification. Please try again.',
          canResend: true,
          needsNewRegistration: false
        });
        setState('error');
      }
    };

    verifyEmail();
  }, [token, type, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      setError({
        message: 'Email address is required to resend verification.',
        canResend: false,
        needsNewRegistration: true
      });
      return;
    }

    try {
      setIsResending(true);
      setResendSuccess(false);

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (resendError) {
        throw new AppError(
          resendError.message,
          ErrorType.AUTHENTICATION,
          ErrorSeverity.MEDIUM,
          { email, supabaseError: resendError }
        );
      }

      setResendSuccess(true);
      setCountdown(60); // 60-second cooldown
      
      logError(new AppError(
        'Email verification resent successfully',
        ErrorType.UNKNOWN,
        ErrorSeverity.LOW,
        { email }
      ), {
        action: 'email_verification_resend',
        additionalData: { email }
      });

    } catch (err) {
      const appError = err instanceof AppError ? err : new AppError(
        `Failed to resend verification email: ${err instanceof Error ? err.message : 'Unknown error'}`,
        ErrorType.AUTHENTICATION,
        ErrorSeverity.MEDIUM,
        { email }
      );
      
      logError(appError, {
        action: 'email_verification_resend_error',
        additionalData: { email }
      });

      setError({
        message: appError.userMessage || 'Failed to resend verification email. Please try again.',
        canResend: true,
        needsNewRegistration: false
      });
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verifying Your Email</h1>
              <p className="text-neutral-600">Please wait while we confirm your email address...</p>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-900 mb-2">Email Verified Successfully!</h1>
              <p className="text-neutral-600 mb-4">
                Your email has been confirmed. You'll be redirected to complete your profile setup.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  Redirecting you to the welcome page in a few seconds...
                </p>
              </div>
            </div>
            <Link
              to="/welcome"
              className="btn btn-primary inline-flex items-center"
            >
              Continue to Setup
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Link>
          </motion.div>
        );

      case 'already_verified':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Already Verified</h1>
              <p className="text-neutral-600 mb-4">
                Your email has already been verified. You can now sign in to your account.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/login"
                className="btn btn-primary inline-flex items-center"
              >
                Go to Sign In
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Link>
              <Link
                to="/"
                className="btn btn-outline inline-flex items-center ml-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </motion.div>
        );

      case 'expired':
      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-900 mb-2">
                {state === 'expired' ? 'Verification Link Expired' : 'Verification Failed'}
              </h1>
              <p className="text-neutral-600 mb-4">
                {error?.message || 'Something went wrong. Please try again.'}
              </p>
            </div>

            {error?.canResend && (
              <div className="bg-neutral-50 border rounded-lg p-6 space-y-4">
                <h3 className="font-medium text-neutral-900">Need a new verification link?</h3>
                {email ? (
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-600">
                      We'll send a new verification email to: <strong>{email}</strong>
                    </p>
                    {resendSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verification email sent! Please check your inbox.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending || countdown > 0}
                      className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : countdown > 0 ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Resend in {countdown}s
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resend Verification Email
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/register"
                    className="btn btn-primary inline-flex items-center"
                  >
                    Register Again
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/login"
                className="btn btn-outline inline-flex items-center"
              >
                Try Signing In
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Link>
              <Link
                to="/"
                className="btn btn-outline inline-flex items-center ml-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </motion.div>
        );

      case 'resend':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verify Your Email</h1>
              <p className="text-neutral-600 mb-4">
                Please check your email and click the verification link to activate your account.
              </p>
            </div>

            <div className="bg-neutral-50 border rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-neutral-900">Didn't receive the email?</h3>
              <div className="text-sm text-neutral-600 space-y-2">
                <p>• Check your spam/junk folder</p>
                <p>• Make sure you entered the correct email address</p>
                <p>• Wait a few minutes for the email to arrive</p>
              </div>
              
              {email && (
                <div className="space-y-3 pt-4 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    Resend verification email to: <strong>{email}</strong>
                  </p>
                  {resendSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verification email sent! Please check your inbox.
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending || countdown > 0}
                    className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Resend in {countdown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Link
                to="/register"
                className="btn btn-outline inline-flex items-center"
              >
                Register with Different Email
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Link>
              <Link
                to="/"
                className="btn btn-outline inline-flex items-center ml-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </motion.div>
        );

      default:
        return null;
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
          {renderContent()}
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EmailVerification; 