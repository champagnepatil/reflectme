import React from 'react';
import { motion } from 'framer-motion';
import { Mail, X, Heart, Calendar, Gift } from 'lucide-react';

interface EmailPreviewProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ email, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Email Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Email Preview</h3>
                <p className="text-gray-600 text-sm">Confirmation email that would be sent</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Email Content */}
        <div className="p-6 overflow-y-auto">
          {/* Email Metadata */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="font-semibold">From:</span> hello@reflectme.app</div>
              <div><span className="font-semibold">To:</span> {email}</div>
              <div><span className="font-semibold">Subject:</span> Welcome to ReflectMe Waitlist! 🎉</div>
              <div><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Email Body */}
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mr-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">ReflectMe</h1>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Our Waitlist!</h2>
              <p className="text-gray-600">Thank you for joining our journey to revolutionize mental health support.</p>
            </div>

            {/* Welcome Message */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Hi there! 👋</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We're thrilled to have you as part of the ReflectMe community! Your spot on our waitlist has been confirmed, 
                and you're one step closer to experiencing the future of personalized mental health support.
              </p>
              <p className="text-gray-700 leading-relaxed">
                As a waitlist member, you'll be among the first to know when ReflectMe launches, plus you'll receive 
                exclusive benefits and early access to our platform.
              </p>
            </div>

            {/* Benefits Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">What's coming your way:</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
                  <Gift className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700"><strong>50% Launch Discount</strong> - Exclusive pricing for early supporters</span>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-700"><strong>Priority Access</strong> - Skip the line when we go live</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <Heart className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-gray-700"><strong>Beta Features</strong> - Test new features before anyone else</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  We'll send you regular updates on our development progress
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  You'll get notified immediately when ReflectMe launches
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  Your exclusive discount will be automatically applied
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-4">
              <p>Thank you for being part of our mission to transform mental health support.</p>
              <p className="mt-2">
                Questions? Reply to this email or visit{' '}
                <a 
                  href="mailto:support@zentiahealth.com"
                  className="text-primary-600 hover:underline"
                >
                  support@zentiahealth.com
                </a>
              </p>
              <p className="mt-4 text-xs">
                You're receiving this because you signed up for the ReflectMe waitlist.<br/>
                To unsubscribe, click{' '}
                <a 
                  href="mailto:unsubscribe@zentiahealth.com?subject=Unsubscribe%20Request"
                  className="text-primary-600 hover:underline"
                >
                  here
                </a>.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              💡 In a real environment, this email would be automatically sent to your inbox
            </p>
            <button
              onClick={onClose}
              className="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmailPreview; 