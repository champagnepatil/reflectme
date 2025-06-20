import React, { useState, useEffect } from 'react';
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  const loadSubscriberCount = async () => {
    try {
      const count = await SupabaseWaitlistService.getSubscriberCount();
      setSubscriberCount(count);
    } catch (error) {
      console.error('Error loading subscriber count:', error);
    }
  };

  const requestNotificationPermission = async () => {
    await NotificationService.requestPermission();
  };

  const WaitlistForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-3xl p-8 md:p-12 shadow-2xl ${className}`}
    >
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-200 text-sm bg-red-500/20 rounded-xl p-3 border border-red-400/30"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            onClick={requestNotificationPermission}
            className="w-full bg-white text-primary-600 py-4 px-8 rounded-2xl font-semibold hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-3"></div>
                Joining Waitlist...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-3" />
                Join {subscriberCount.toLocaleString()}+ People on Waitlist
              </>
            )}
          </button>

          <p className="text-white/70 text-xs text-center leading-relaxed">
            By joining, you agree to receive updates about ReflectMe. Unsubscribe anytime.
            <br />We respect your privacy and never share your information.
          </p>
        </form>
      </div>
    </motion.div>
  );

  const SuccessState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-teal-600 rounded-3xl p-8 md:p-12 shadow-2xl ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>
      
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        
        <h3 className="text-3xl font-bold text-white mb-4">You're on the List! 🎉</h3>
        <p className="text-xl text-white/90 mb-6 leading-relaxed">
          Welcome to the ReflectMe family! A confirmation email will be sent to <span className="font-semibold">{email}</span>
        </p>
        
        <div className="bg-yellow-500/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-400/30 mb-6">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <span className="text-yellow-900 text-sm font-bold">!</span>
            </div>
            <div className="text-yellow-100">
              <p className="font-semibold text-sm mb-1">Demo Mode Notice</p>
              <p className="text-xs leading-relaxed">
                This is a demo environment. Real email confirmations are not sent, but you'll receive browser notifications and can view the notification history below.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">What happens next?</h4>
          <div className="space-y-3 text-white/90">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
              <span>You'll receive priority access when we launch</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
              <span>Exclusive 50% discount on your first subscription</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
              <span>Beta access to new features before anyone else</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
              <span>Monthly updates on our development progress</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/80 text-sm mb-4">
            Position in line: <span className="font-bold text-white">#{userPosition ? userPosition.toLocaleString() : subscriberCount.toLocaleString()}</span>
          </p>
          <div className="flex items-center justify-center space-x-4 text-white/70 text-xs mb-6">
            <span>📧 Confirmation sent</span>
            <span>🔔 Notifications enabled</span>
            <span>🎁 Perks activated</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowEmailPreview(true)}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-300 text-sm flex items-center justify-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              📧 View Email Preview
            </button>
            
            <button
              onClick={() => NotificationService.simulateEmailReply(email, "Looking forward to the launch!")}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-300 text-sm"
            >
              💬 Send Quick Reply (Demo)
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {isSubmitted ? <SuccessState /> : <WaitlistForm />}
      </AnimatePresence>
      
      <AnimatePresence>
        {showEmailPreview && (
          <EmailPreview
            email={email}
            isOpen={showEmailPreview}
            onClose={() => setShowEmailPreview(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default WaitlistCTA; 