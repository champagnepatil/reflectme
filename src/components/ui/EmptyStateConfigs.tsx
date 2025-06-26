import React from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Target, 
  MessageSquare, 
  Brain,
  Calendar,
  Activity,
  ClipboardList,
  Heart,
  TrendingUp,
  Lightbulb,
  Play,
  ArrowRight,
  Star,
  CheckCircle,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  UserPlus,
  Import,
  Template,
  Video,
  HelpCircle
} from 'lucide-react';
import { EmptyStateProps } from './EmptyState';

export const getEmptyStateConfig = (
  type: string, 
  userRole: 'therapist' | 'client' = 'therapist',
  context?: any
): Omit<EmptyStateProps, 'type'> => {
  
  const isTherapist = userRole === 'therapist';

  switch (type) {
    case 'clients':
      return {
        title: isTherapist 
          ? 'Welcome to Client Management' 
          : 'Connect with Your Care Team',
        description: isTherapist
          ? 'Start building your practice by adding your first client. Our AI-powered platform helps you provide better care with intelligent insights and automated workflows.'
          : 'Connect with your therapist and care team to begin your wellness journey. Share your progress and receive personalized support.',
        primaryAction: {
          label: isTherapist ? 'Add Your First Client' : 'Connect with Therapist',
          onClick: () => context?.onCreateClient?.(),
          variant: 'default' as const,
          icon: <UserPlus className="w-5 h-5" />
        },
        secondaryActions: isTherapist ? [
          {
            label: 'Import Clients',
            onClick: () => context?.onImportClients?.(),
            variant: 'outline' as const,
            icon: <Import className="w-4 h-4" />
          },
          {
            label: 'View Templates',
            onClick: () => context?.onViewTemplates?.(),
            variant: 'outline' as const,
            icon: <Template className="w-4 h-4" />
          }
        ] : [],
        sampleData: {
          title: 'Client Management Features',
          items: isTherapist ? [
            '👤 Comprehensive client profiles with medical history',
            '📊 AI-powered progress tracking and insights',
            '🎯 Personalized treatment plan recommendations',
            '⚠️ Risk assessment and early warning alerts',
            '📝 Automated session notes and summaries',
            '📈 Predictive analytics for treatment outcomes'
          ] : [
            '🤝 Secure communication with your therapist',
            '📱 Easy appointment scheduling and reminders',
            '📊 Track your progress with visual analytics',
            '🎯 Personalized wellness goals and milestones',
            '🆘 24/7 crisis support when you need it'
          ]
        }
      };

    case 'tasks':
      return {
        title: 'Task & Homework Management',
        description: isTherapist
          ? 'Create meaningful assignments and track client progress. Our AI helps generate personalized tasks based on treatment goals and client needs.'
          : 'Complete therapeutic homework and track your progress. These tasks are designed to support your wellness journey.',
        primaryAction: {
          label: isTherapist ? 'Create First Task' : 'View Assigned Tasks',
          onClick: () => context?.onCreateTask?.(),
          variant: 'default' as const,
          icon: <Plus className="w-5 h-5" />
        },
        secondaryActions: isTherapist ? [
          {
            label: 'Use Templates',
            onClick: () => context?.onUseTemplates?.(),
            variant: 'outline' as const,
            icon: <Template className="w-4 h-4" />
          },
          {
            label: 'AI Task Generator',
            onClick: () => context?.onGenerateTasks?.(),
            variant: 'outline' as const,
            icon: <Sparkles className="w-4 h-4" />
          }
        ] : [
          {
            label: 'Set Goals',
            onClick: () => context?.onSetGoals?.(),
            variant: 'outline' as const,
            icon: <Target className="w-4 h-4" />
          }
        ],
        sampleData: {
          title: 'Task Ideas & Templates',
          items: isTherapist ? [
            '🧠 Cognitive behavioral therapy exercises',
            '📝 Daily mood and thought journaling',
            '🧘 Mindfulness and relaxation practices',
            '🎯 Goal-setting and progress tracking',
            '💪 Coping skill development activities',
            '📊 Assessment and self-reflection tasks'
          ] : [
            '📖 Daily gratitude journaling practice',
            '🧘 5-minute mindfulness meditation',
            '🎯 Weekly goal setting and review',
            '💭 Thought pattern recognition exercises',
            '🏃 Physical wellness activities',
            '🤝 Social connection and support tasks'
          ]
        }
      };

    case 'assessments':
      return {
        title: 'Assessment & Progress Tracking',
        description: isTherapist
          ? 'Schedule and monitor client assessments to track treatment progress. Our platform supports multiple validated instruments with automated scoring and insights.'
          : 'Complete assessments to track your progress and help your therapist understand your needs better.',
        primaryAction: {
          label: isTherapist ? 'Schedule Assessment' : 'Take Assessment',
          onClick: () => context?.onScheduleAssessment?.(),
          variant: 'default' as const,
          icon: <ClipboardList className="w-5 h-5" />
        },
        secondaryActions: [
          {
            label: 'View Available Instruments',
            onClick: () => context?.onViewInstruments?.(),
            variant: 'outline' as const,
            icon: <FileText className="w-4 h-4" />
          },
          {
            label: 'Learn More',
            onClick: () => context?.onLearnMore?.(),
            variant: 'outline' as const,
            icon: <HelpCircle className="w-4 h-4" />
          }
        ],
        sampleData: {
          title: 'Available Assessment Instruments',
          items: [
            '📊 PHQ-9 - Depression screening and severity',
            '😰 GAD-7 - Anxiety assessment and monitoring',
            '🌍 WHODAS-2.0 - Disability and functioning',
            '🧠 DSM-5 Cross-Cutting - Comprehensive symptoms',
            '💪 Resilience Scale - Coping ability assessment',
            '🎯 Goal Attainment Scale - Treatment progress'
          ]
        }
      };

    case 'notes':
      return {
        title: 'Clinical Documentation',
        description: isTherapist
          ? 'Create comprehensive session notes with AI assistance. Generate SOAP notes, treatment plans, and progress summaries automatically.'
          : 'Your therapist creates detailed notes to track your progress and provide the best care possible.',
        primaryAction: {
          label: 'Create Session Note',
          onClick: () => context?.onCreateNote?.(),
          variant: 'default' as const,
          icon: <FileText className="w-5 h-5" />
        },
        secondaryActions: [
          {
            label: 'Use AI Assistant',
            onClick: () => context?.onUseAI?.(),
            variant: 'outline' as const,
            icon: <Brain className="w-4 h-4" />
          },
          {
            label: 'View Templates',
            onClick: () => context?.onViewTemplates?.(),
            variant: 'outline' as const,
            icon: <Template className="w-4 h-4" />
          }
        ],
        sampleData: {
          title: 'AI-Powered Note Features',
          items: [
            '📝 Auto-generated SOAP notes from session recordings',
            '🎯 Treatment plan suggestions based on client data',
            '📈 Progress summaries and outcome predictions',
            '🔍 Pattern recognition across multiple sessions',
            '📋 Homework and intervention recommendations',
            '⚡ Real-time clinical decision support'
          ]
        }
      };

    case 'journal':
      return {
        title: 'Start Your Healing Journey',
        description: 'Journaling is a powerful tool for self-reflection and growth. Our AI-enhanced journal provides insights into your patterns and suggests coping strategies.',
        primaryAction: {
          label: 'Write First Entry',
          onClick: () => context?.onCreateEntry?.(),
          variant: 'default' as const,
          icon: <BookOpen className="w-5 h-5" />
        },
        secondaryActions: [
          {
            label: 'Voice Journal',
            onClick: () => context?.onVoiceJournal?.(),
            variant: 'outline' as const,
            icon: <MessageSquare className="w-4 h-4" />
          },
          {
            label: 'View Prompts',
            onClick: () => context?.onViewPrompts?.(),
            variant: 'outline' as const,
            icon: <Lightbulb className="w-4 h-4" />
          }
        ],
        sampleData: {
          title: 'Journal Entry Ideas',
          items: [
            '✨ How are you feeling right now and why?',
            '🌅 What are three things you\'re grateful for today?',
            '🎯 What would make today feel successful?',
            '💭 What thoughts have been on your mind lately?',
            '🌱 What\'s one small step you can take toward your goals?',
            '🤝 How have your relationships been this week?'
          ]
        }
      };

    case 'chat':
      return {
        title: isTherapist ? 'Secure Client Communication' : 'Your AI Companion is Ready',
        description: isTherapist
          ? 'Communicate securely with your clients through HIPAA-compliant messaging. Emergency protocols are automatically activated for crisis situations.'
          : 'Your AI companion is here 24/7 to provide support, help you process emotions, and guide you through difficult moments.',
        primaryAction: {
          label: isTherapist ? 'Message a Client' : 'Start Conversation',
          onClick: () => context?.onStartChat?.(),
          variant: 'default' as const,
          icon: <MessageSquare className="w-5 h-5" />
        },
        secondaryActions: [
          {
            label: 'View Guidelines',
            onClick: () => context?.onViewGuidelines?.(),
            variant: 'outline' as const,
            icon: <HelpCircle className="w-4 h-4" />
          }
        ],
        sampleData: {
          title: isTherapist ? 'Communication Features' : 'AI Companion Capabilities',
          items: isTherapist ? [
            '🔒 End-to-end encrypted messaging',
            '🚨 Automatic crisis detection and alerts',
            '📋 Session scheduling and reminders',
            '📊 Client engagement analytics',
            '⚡ Real-time notifications',
            '📱 Mobile-optimized interface'
          ] : [
            '🤖 Empathetic AI trained in therapeutic techniques',
            '🎯 Personalized coping strategy suggestions',
            '📈 Mood pattern recognition and insights',
            '🆘 Crisis support and emergency resources',
            '🌙 24/7 availability for support',
            '🔒 Private and secure conversations'
          ]
        }
      };

    case 'analytics':
      return {
        title: isTherapist ? 'Client Analytics Dashboard' : 'Your Progress Dashboard',
        description: isTherapist
          ? 'View detailed analytics on client progress, treatment effectiveness, and outcomes. AI identifies patterns and suggests adjustments to treatment plans.'
          : 'Watch your wellness journey unfold with detailed progress tracking. See patterns in your mood, celebrate milestones, and get personalized insights.',
        primaryAction: {
          label: isTherapist ? 'View Sample Analytics' : 'Set Goals',
          onClick: () => context?.onViewAnalytics?.(),
          variant: 'default' as const,
          icon: <BarChart3 className="w-5 h-5" />
        },
        secondaryActions: [
          {
            label: 'Generate Report',
            onClick: () => context?.onGenerateReport?.(),
            variant: 'outline' as const,
            icon: <Download className="w-4 h-4" />
          },
          {
            label: 'Learn More',
            onClick: () => context?.onLearnMore?.(),
            variant: 'outline' as const,
            icon: <HelpCircle className="w-4 h-4" />
          }
        ],
        sampleData: {
          title: 'Analytics Features',
          items: isTherapist ? [
            '📈 Treatment outcome predictions',
            '🔄 Intervention effectiveness analysis',
            '⚡ Real-time risk assessment updates',
            '📊 Client engagement and adherence metrics',
            '🎯 Goal attainment tracking',
            '🧠 AI-powered clinical insights'
          ] : [
            '📊 Daily mood and symptom tracking',
            '🏆 Milestone celebrations and achievements',
            '🔮 AI-powered progress predictions',
            '💡 Personalized insights and recommendations',
            '📈 Wellness trend analysis',
            '🎯 Goal progress visualization'
          ]
        }
      };

    case 'search':
      return {
        title: 'No Results Found',
        description: 'We couldn\'t find any items matching your search. Try adjusting your search terms or explore our suggestions below.',
        primaryAction: {
          label: 'Clear Search',
          onClick: () => context?.onClearSearch?.(),
          variant: 'outline' as const,
          icon: <RefreshCw className="w-4 h-4" />
        },
        secondaryActions: [
          {
            label: 'Advanced Search',
            onClick: () => context?.onAdvancedSearch?.(),
            variant: 'outline' as const,
            icon: <Search className="w-4 h-4" />
          }
        ],
        sampleData: {
          title: 'Search Tips',
          items: [
            '🔍 Try using fewer or different keywords',
            '📝 Check your spelling and try synonyms',
            '🎯 Use specific terms rather than general ones',
            '📅 Filter by date range if applicable',
            '🏷️ Try searching by tags or categories',
            '💡 Browse popular or trending items'
          ]
        }
      };

    case 'filter':
      return {
        title: 'No Items Match Your Filters',
        description: 'The current filters are too restrictive. Try broadening your criteria or removing some filters to see more results.',
        primaryAction: {
          label: 'Clear All Filters',
          onClick: () => context?.onClearFilters?.(),
          variant: 'default' as const,
          icon: <Filter className="w-4 h-4" />
        },
        secondaryActions: [
          {
            label: 'Adjust Filters',
            onClick: () => context?.onAdjustFilters?.(),
            variant: 'outline' as const,
            icon: <Settings className="w-4 h-4" />
          }
        ],
        sampleData: {
          title: 'Available Items',
          items: [
            `📊 Total items available: ${context?.totalItems || 0}`,
            '🔍 Try removing date restrictions',
            '📝 Expand your search criteria',
            '🏷️ Use broader category filters',
            '📅 Check different time periods',
            '💡 View all items without filters'
          ]
        }
      };

    default:
      return {
        title: 'Getting Started',
        description: 'Welcome to your mental health platform. Let\'s help you get started with your wellness journey!',
        primaryAction: {
          label: 'Get Started',
          onClick: () => context?.onGetStarted?.(),
          variant: 'default' as const,
          icon: <Star className="w-5 h-5" />
        },
        sampleData: {
          title: 'Platform Features',
          items: [
            '🧠 AI-powered therapeutic support',
            '📊 Comprehensive progress tracking',
            '🔒 HIPAA-compliant security',
            '📱 Mobile-optimized experience',
            '🎯 Personalized care plans',
            '🆘 24/7 crisis support'
          ]
        }
      };
  }
}; 