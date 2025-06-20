import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, AlertCircle, CheckCircle, Clock, Users, Target } from 'lucide-react';
import RealEmailService from '../../services/RealEmailService';
import SupabaseWaitlistService from '../../services/SupabaseWaitlistService';

interface EmailCampaignAdminProps {
  className?: string;
}

const EmailCampaignAdmin: React.FC<EmailCampaignAdminProps> = ({ className = '' }) => {
  const [selectedCampaign, setSelectedCampaign] = useState<'update' | 'welcome'>('update');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: number; failed: number; total: number } | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadSubscriberCount();
  }, []);

  const loadSubscriberCount = async () => {
    try {
      const count = await SupabaseWaitlistService.getSubscriberCount();
      setSubscriberCount(count);
    } catch (error) {
      console.error('Error loading subscriber count:', error);
    }
  };

  const handleSendCampaign = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsSending(true);
    setSendResult(null);
    setShowConfirmation(false);

    try {
      // Get all active subscribers
      const subscribers = await SupabaseWaitlistService.getAllSubscribers();
      const emails = subscribers.map(sub => sub.email);
      
      console.log(`📧 Starting ${selectedCampaign} email campaign to ${emails.length} subscribers`);

      // Create subscriber data map for personalization
      const subscribersData: Record<string, any> = {};
      subscribers.forEach(sub => {
        subscribersData[sub.email] = {
          position_in_queue: sub.position_in_queue,
          created_at: sub.created_at
        };
      });

      // Send bulk emails
      const result = await RealEmailService.sendBulkEmails(emails, selectedCampaign, subscribersData);
      
      setSendResult({
        success: result.success,
        failed: result.failed,
        total: emails.length
      });

      console.log(`📧 Campaign complete: ${result.success} sent, ${result.failed} failed`);

    } catch (error) {
      console.error('Error sending email campaign:', error);
      setSendResult({
        success: 0,
        failed: subscriberCount,
        total: subscriberCount
      });
    } finally {
      setIsSending(false);
    }
  };

  const resetResults = () => {
    setSendResult(null);
    setShowConfirmation(false);
  };

  const campaignTypes = [
    {
      id: 'update',
      name: 'Development Update',
      description: 'Weekly progress updates and feature highlights',
      icon: Target,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'Onboarding email for new subscribers (testing)',
      icon: Mail,
      color: 'from-blue-500 to-indigo-600'
    }
  ];

  return (
    <div className={`bg-white rounded-3xl shadow-2xl p-8 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">📧 Email Campaign Manager</h2>
        <p className="text-gray-600">Send real emails to your waitlist subscribers</p>
        <div className="flex items-center justify-center mt-4 space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{subscriberCount} active subscribers</span>
        </div>
      </div>

      {!sendResult ? (
        <div className="space-y-6">
          {/* Campaign Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Campaign Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaignTypes.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedCampaign === campaign.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCampaign(campaign.id as 'update' | 'welcome')}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${campaign.color} flex items-center justify-center`}>
                      <campaign.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                      selectedCampaign === campaign.id
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedCampaign === campaign.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Email Preview */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Preview</h3>
            <div className="text-sm text-gray-600 space-y-2">
              {selectedCampaign === 'update' && (
                <>
                  <p><strong>Subject:</strong> ReflectMe Development Update 🚀</p>
                  <p><strong>Content:</strong> Weekly highlights, progress bar (75%), coming soon features</p>
                  <p><strong>Includes:</strong> AI system updates, new tools, security improvements</p>
                </>
              )}
              {selectedCampaign === 'welcome' && (
                <>
                  <p><strong>Subject:</strong> Welcome to ReflectMe Waitlist! 🎉</p>
                  <p><strong>Content:</strong> Welcome message, benefits, next steps, position in queue</p>
                  <p><strong>Includes:</strong> 50% discount, priority access, beta features</p>
                </>
              )}
            </div>
          </div>

          {/* Send Campaign Button */}
          <div className="text-center">
            {!showConfirmation ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendCampaign}
                disabled={isSending}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Send to {subscriberCount} Subscribers</span>
                </div>
              </motion.button>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-center justify-center space-x-2 text-amber-800 mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Confirm Email Campaign</span>
                </div>
                <p className="text-amber-700 text-sm mb-6 text-center">
                  You're about to send <strong>{selectedCampaign}</strong> emails to <strong>{subscriberCount}</strong> subscribers.
                  This action cannot be undone. Are you sure?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendCampaign}
                    disabled={isSending}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isSending ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'Yes, Send Campaign'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Results Display
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
            sendResult.failed === 0 ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            {sendResult.failed === 0 ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <AlertCircle className="w-10 h-10 text-amber-600" />
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Campaign Complete!</h3>
            <div className="text-lg text-gray-600 space-y-1">
              <p><strong>{sendResult.success}</strong> emails sent successfully</p>
              {sendResult.failed > 0 && (
                <p className="text-amber-600"><strong>{sendResult.failed}</strong> failed to send</p>
              )}
              <p className="text-sm">Total: {sendResult.total} subscribers</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="font-semibold text-gray-900 mb-2">Campaign Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Campaign Type: <span className="font-medium">{selectedCampaign}</span></p>
              <p>Success Rate: <span className="font-medium">{Math.round((sendResult.success / sendResult.total) * 100)}%</span></p>
              <p>Sent at: <span className="font-medium">{new Date().toLocaleString()}</span></p>
            </div>
          </div>

          <button
            onClick={resetResults}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            Send Another Campaign
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default EmailCampaignAdmin; 