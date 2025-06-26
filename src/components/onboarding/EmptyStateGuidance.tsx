import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  BookOpen, 
  Target, 
  Users,
  Brain,
  Calendar,
  ArrowRight, 
  Play,
  CheckCircle,
  Lightbulb,
  Star,
  TrendingUp
} from 'lucide-react';

interface EmptyStateGuidanceProps {
  userRole: 'patient' | 'therapist';
  section: 'dashboard' | 'journal' | 'chat' | 'clients' | 'notes' | 'progress';
  onAction?: (action: string) => void;
  onDismiss?: () => void;
}

interface GuidanceStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  sampleData?: {
    title: string;
    items: string[];
  };
}

const EmptyStateGuidance: React.FC<EmptyStateGuidanceProps> = ({
  userRole,
  section,
  onAction,
  onDismiss
}) => {
  const [showSampleData, setShowSampleData] = useState(false);

  const getGuidanceContent = (): GuidanceStep => {
    const isTherapist = userRole === 'therapist';
    
    switch (section) {
      case 'dashboard':
        return {
          title: isTherapist ? 'Welcome to Your Practice Dashboard' : 'Welcome to Your Wellness Journey',
          description: isTherapist 
            ? 'This is your command center for managing clients, reviewing progress, and accessing AI-powered insights. Start by adding your first client or exploring the demo data.'
            : 'This is your personal wellness dashboard. Here you\'ll track your mood, view progress, and access your AI companion. Let\'s start with a quick check-in!',
          icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
          action: {
            label: isTherapist ? 'Add First Client' : 'Start Mood Check-in',
            onClick: () => onAction?.(isTherapist ? 'add-client' : 'mood-check')
          },
          sampleData: {
            title: isTherapist ? 'Sample Client Management Features' : 'Sample Wellness Features',
            items: isTherapist ? [
              '📊 Client progress tracking with AI insights',
              '🔔 Risk alerts and intervention suggestions',
              '📝 Automated session notes and summaries',
              '📈 Predictive analytics for treatment outcomes'
            ] : [
              '🧠 AI companion for 24/7 emotional support',
              '📱 Mood tracking with pattern recognition',
              '📖 Smart journaling with insights',
              '🎯 Personalized wellness goals and milestones'
            ]
          }
        };

      case 'journal':
        return {
          title: 'Start Your Healing Journey',
          description: 'Journaling is a powerful tool for self-reflection and growth. Our AI-enhanced journal provides insights into your patterns and suggests coping strategies.',
          icon: <BookOpen className="w-8 h-8 text-primary-600" />,
          action: {
            label: 'Write First Entry',
            onClick: () => onAction?.('new-journal-entry')
          },
          sampleData: {
            title: 'Journal Entry Ideas',
            items: [
              '✨ How are you feeling right now and why?',
              '🌅 What are three things you\'re grateful for today?',
              '🎯 What would make today feel successful?',
              '💭 What thoughts have been on your mind lately?',
              '🌱 What\'s one small step you can take toward your goals?'
            ]
          }
        };

      case 'chat':
        return {
          title: isTherapist ? 'Secure Client Communication' : 'Your AI Companion is Ready',
          description: isTherapist 
            ? 'Communicate securely with your clients through HIPAA-compliant messaging. Emergency protocols are automatically activated for crisis situations.'
            : 'Your AI companion is here 24/7 to provide support, help you process emotions, and guide you through difficult moments.',
          icon: <MessageSquare className="w-8 h-8 text-primary-600" />,
          action: {
            label: isTherapist ? 'Message a Client' : 'Start Conversation',
            onClick: () => onAction?.(isTherapist ? 'message-client' : 'start-chat')
          },
          sampleData: {
            title: isTherapist ? 'Communication Features' : 'AI Companion Capabilities',
            items: isTherapist ? [
              '🔒 End-to-end encrypted messaging',
              '🚨 Automatic crisis detection and alerts',
              '📋 Session scheduling and reminders',
              '📊 Client engagement analytics'
            ] : [
              '🤖 Empathetic AI trained in therapeutic techniques',
              '🎯 Personalized coping strategy suggestions',
              '📈 Mood pattern recognition and insights',
              '🆘 Crisis support and emergency resources'
            ]
          }
        };

      case 'clients':
        return {
          title: 'Build Your Client Network',
          description: 'Manage your clients with AI-powered insights. Track progress, identify patterns, and receive alerts for clients who may need additional support.',
          icon: <Users className="w-8 h-8 text-primary-600" />,
          action: {
            label: 'Add Your First Client',
            onClick: () => onAction?.('add-client')
          },
          sampleData: {
            title: 'Client Management Features',
            items: [
              '👤 Comprehensive client profiles with history',
              '📊 Progress tracking with visual analytics',
              '🎯 Treatment goal setting and monitoring',
              '⚠️ Risk assessment and early warning alerts',
              '📝 AI-generated session summaries'
            ]
          }
        };

      case 'notes':
        return {
          title: 'Smart Clinical Documentation',
          description: 'Create comprehensive session notes with AI assistance. Generate SOAP notes, treatment plans, and progress summaries automatically.',
          icon: <Brain className="w-8 h-8 text-primary-600" />,
          action: {
            label: 'Create First Note',
            onClick: () => onAction?.('create-note')
          },
          sampleData: {
            title: 'AI-Powered Note Features',
            items: [
              '📝 Auto-generated SOAP notes from session recordings',
              '🎯 Treatment plan suggestions based on client data',
              '📈 Progress summaries and outcome predictions',
              '🔍 Pattern recognition across multiple sessions',
              '📋 Homework and intervention recommendations'
            ]
          }
        };

      case 'progress':
        return {
          title: isTherapist ? 'Track Client Outcomes' : 'Monitor Your Growth',
          description: isTherapist 
            ? 'View detailed analytics on client progress, treatment effectiveness, and outcomes. AI identifies patterns and suggests adjustments to treatment plans.'
            : 'Watch your wellness journey unfold with detailed progress tracking. See patterns in your mood, celebrate milestones, and get personalized insights.',
          icon: <Target className="w-8 h-8 text-primary-600" />,
          action: {
            label: isTherapist ? 'View Analytics' : 'Set Goals',
            onClick: () => onAction?.(isTherapist ? 'view-analytics' : 'set-goals')
          },
          sampleData: {
            title: isTherapist ? 'Analytics Features' : 'Progress Tracking Features',
            items: isTherapist ? [
              '📈 Treatment outcome predictions',
              '🔄 Intervention effectiveness analysis',
              '⚡ Real-time risk assessment updates',
              '📊 Client engagement and adherence metrics'
            ] : [
              '📊 Daily mood and symptom tracking',
              '🏆 Milestone celebrations and achievements',
              '🔮 AI-powered progress predictions',
              '💡 Personalized insights and recommendations'
            ]
          }
        };

      default:
        return {
          title: 'Getting Started',
          description: 'Welcome to your mental health platform. Let\'s help you get started!',
          icon: <Star className="w-8 h-8 text-primary-600" />,
          action: {
            label: 'Get Started',
            onClick: () => onAction?.('get-started')
          }
        };
    }
  };

  const content = getGuidanceContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-6"
        >
          {content.icon}
        </motion.div>

        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          {content.title}
        </h2>
        
        <p className="text-neutral-600 leading-relaxed mb-8">
          {content.description}
        </p>

        <div className="space-y-4">
          {content.action && (
            <button
              onClick={content.action.onClick}
              className="btn btn-primary inline-flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              {content.action.label}
            </button>
          )}

          {content.sampleData && (
            <div className="border-t border-neutral-200 pt-6">
              <button
                onClick={() => setShowSampleData(!showSampleData)}
                className="flex items-center text-neutral-600 hover:text-neutral-900 mx-auto transition-colors"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showSampleData ? 'Hide' : 'Show'} {content.sampleData.title}
                <ArrowRight className={`w-4 h-4 ml-2 transition-transform ${showSampleData ? 'rotate-90' : ''}`} />
              </button>

              {showSampleData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white rounded-lg p-4 text-left"
                >
                  <ul className="space-y-2">
                    {content.sampleData.items.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start text-sm text-neutral-700"
                      >
                        <span className="mr-2">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <div className="border-t border-neutral-200 pt-6 mt-6">
            <button
              onClick={onDismiss}
              className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center mx-auto"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Got it, don't show this again
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyStateGuidance; 