import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, Clock, Sparkles, Bell, Gift, Eye } from 'lucide-react';
import NotificationService from '../../services/NotificationService';
import SupabaseWaitlistService from '../../services/SupabaseWaitlistService';
import RealEmailService from '../../services/RealEmailService';
import EmailPreview from './EmailPreview';

interface WaitlistCTAProps {
  className?: string;
}

const WaitlistCTA: React.FC<WaitlistCTAProps> = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [userPosition, setUserPosition] = useState<number | null>(null);

  // Check if user already subscribed
  useEffect(() => {
    const savedSubscription = localStorage.getItem('reflectme_waitlist_email');
    if (savedSubscription) {
      setIsSubmitted(true);
      setEmail(savedSubscription);
    }
    
    // Update subscriber count from Supabase
    loadSubscriberCount();
  }, []);

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const loadSubscriberCount = useCallback(async () => {
    try {
      const count = await SupabaseWaitlistService.getSubscriberCount();
      setSubscriberCount(count);
    } catch (error) {
      console.error('Error loading subscriber count:', error);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const isAlreadySubscribed = await SupabaseWaitlistService.isEmailSubscribed(email);
      if (isAlreadySubscribed) {
        setError('You are already on our waitlist!');
        setIsLoading(false);
        return;
      }

      // Add subscriber to Supabase
      const { data: subscriber, error: supabaseError } = await SupabaseWaitlistService.addSubscriber({
        email,
        source: 'homepage',
        notification_preferences: { email: true, browser: true },
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          referrer: document.referrer || 'direct'
        }
      });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError('Unable to join waitlist. Please try again.');
        return;
      }

      // Save to localStorage for demo
      localStorage.setItem('reflectme_waitlist_email', email);
      localStorage.setItem('reflectme_waitlist_date', new Date().toISOString());
      
      // Add subscriber to notification service for demo notifications
      NotificationService.addSubscriber(email);
      
      // Send real welcome email
      if (subscriber) {
        console.log('📧 Sending real welcome email to:', email);
        const emailResult = await RealEmailService.sendWelcomeEmail(email, {
          position_in_queue: subscriber.position_in_queue
        });
        
        if (emailResult.success) {
          console.log('✅ Welcome email sent successfully!');
        } else {
          console.error('❌ Failed to send welcome email:', emailResult.error);
        }
      }
      
      // Add notification record to Supabase
      if (subscriber?.id) {
        await SupabaseWaitlistService.addNotification({
          subscriber_id: subscriber.id,
          type: 'welcome',
          title: 'Welcome to ReflectMe Waitlist! 🎉',
          message: 'Thank you for joining! We\'ll keep you updated on our launch progress.',
          delivery_status: 'sent',
          metadata: { channel: 'email' }
        });
        
        // Set user position from Supabase data
        if (subscriber.position_in_queue) {
          setUserPosition(subscriber.position_in_queue);
        }
      }
      
      // Update subscriber count and set success state
      await loadSubscriberCount();
      setIsSubmitted(true);

    } catch (err) {
      console.error('Error joining waitlist:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail, loadSubscriberCount]);

  const requestNotificationPermission = useCallback(async () => {
    await NotificationService.requestPermission();
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  }, [error]);

  // Memoize the form content to prevent unnecessary re-renders
  const formContent = useMemo(() => (
    <>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 border border-white/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-3xl font-bold text-white">Join the Waitlist</h3>
              <p className="text-white/80 text-sm">Be first to experience ReflectMe</p>
            </div>
          </div>
          
          <p className="text-xl text-white/90 mb-6 leading-relaxed">
            Get early access to our revolutionary mental health platform and receive exclusive launch benefits.
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-white/80 text-sm mb-8">
            <div className="flex items-center">
              <Gift className="w-4 h-4 mr-2" />
              50% Launch Discount
            </div>
            <div className="flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Priority Access
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Beta Features
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-white/60" />
            </div>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email address"
              className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-200 text-sm bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-3"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full py-4 px-6 bg-white text-primary-600 font-semibold rounded-2xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Joining Waitlist...
                </div>
              ) : (
                'Join the Waitlist'
              )}
            </button>

            <div className="flex items-center justify-between text-white/70 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                {subscriberCount.toLocaleString()} already joined
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEmailPreview(true)}
                  className="flex items-center hover:text-white transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  className="flex items-center hover:text-white transition-colors"
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Notify
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  ), [email, error, isLoading, subscriberCount, handleSubmit, handleEmailChange, requestNotificationPermission]);

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-3xl p-8 md:p-12 shadow-2xl ${className}`}
      >
        {/* Success state content */}
        <div className="text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10" />
          </motion.div>
          
          <h3 className="text-3xl font-bold mb-4">Welcome to the Waitlist! 🎉</h3>
          <p className="text-xl opacity-90 mb-6">
            Thank you for joining! We've sent a confirmation email to <strong>{email}</strong>
          </p>
          
          {userPosition && (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <p className="text-lg mb-2">Your position in queue:</p>
              <p className="text-4xl font-bold">#{userPosition}</p>
            </div>
          )}
          
          <div className="space-y-3 text-sm opacity-80">
            <p>✅ Confirmation email sent</p>
            <p>🎁 50% launch discount reserved</p>
            <p>⚡ Priority access guaranteed</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-3xl p-8 md:p-12 shadow-2xl ${className}`}
      >
        {formContent}
      </motion.div>

      {/* Email Preview Modal */}
      <AnimatePresence>
        {showEmailPreview && (
          <EmailPreview
            isOpen={showEmailPreview}
            onClose={() => setShowEmailPreview(false)}
            subscriberData={{ position_in_queue: subscriberCount + 1 }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default WaitlistCTA; 