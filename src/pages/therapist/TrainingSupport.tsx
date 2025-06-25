import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  Star, 
  Users, 
  MessageCircle,
  FileText,
  Video,
  Download,
  Search,
  Filter,
  Award,
  Target,
  Brain,
  Lightbulb,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Settings
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'onboarding' | 'features' | 'best-practices' | 'compliance' | 'advanced';
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  progress: number; // 0-100
  type: 'video' | 'interactive' | 'document' | 'quiz';
  rating: number;
  enrolledCount: number;
  lastUpdated: string;
  prerequisites?: string[];
  certificate?: boolean;
}

interface SupportResource {
  id: string;
  title: string;
  type: 'faq' | 'guide' | 'video' | 'webinar' | 'contact';
  category: string;
  description: string;
  url?: string;
  popular: boolean;
  lastUpdated: string;
}

interface Feedback {
  id: string;
  type: 'feature_request' | 'bug_report' | 'general_feedback' | 'training_feedback';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'submitted' | 'in_review' | 'in_progress' | 'resolved';
  submittedDate: string;
  response?: string;
}

const TrainingSupport: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'training' | 'support' | 'feedback'>('training');
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [supportResources, setSupportResources] = useState<SupportResource[]>([]);
  const [userFeedback, setUserFeedback] = useState<Feedback[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // Feedback form state
  const [feedbackType, setFeedbackType] = useState<'feature_request' | 'bug_report' | 'general_feedback' | 'training_feedback'>('general_feedback');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [feedbackPriority, setFeedbackPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const mockTrainingModules: TrainingModule[] = [
    {
      id: '1',
      title: 'Getting Started with Zentia',
      description: 'Learn the basics of navigating the platform and understanding key features',
      category: 'onboarding',
      duration: 25,
      difficulty: 'beginner',
      completed: true,
      progress: 100,
      type: 'interactive',
      rating: 4.8,
      enrolledCount: 1247,
      lastUpdated: '2024-01-15',
      certificate: true
    },
    {
      id: '2',
      title: 'AI-Powered Client Insights',
      description: 'Master the AI analytics dashboard and interpret client patterns effectively',
      category: 'features',
      duration: 35,
      difficulty: 'intermediate',
      completed: false,
      progress: 60,
      type: 'video',
      rating: 4.9,
      enrolledCount: 892,
      lastUpdated: '2024-01-20',
      prerequisites: ['1'],
      certificate: true
    },
    {
      id: '3',
      title: 'HIPAA Compliance Best Practices',
      description: 'Ensure your practice meets all privacy and security requirements',
      category: 'compliance',
      duration: 45,
      difficulty: 'intermediate',
      completed: false,
      progress: 0,
      type: 'document',
      rating: 4.7,
      enrolledCount: 1156,
      lastUpdated: '2024-01-18',
      certificate: true
    },
    {
      id: '4',
      title: 'Advanced Reporting and Analytics',
      description: 'Create custom reports and leverage predictive analytics for better outcomes',
      category: 'advanced',
      duration: 50,
      difficulty: 'advanced',
      completed: false,
      progress: 0,
      type: 'interactive',
      rating: 4.6,
      enrolledCount: 423,
      lastUpdated: '2024-01-22',
      prerequisites: ['1', '2'],
      certificate: true
    },
    {
      id: '5',
      title: 'Effective Client Communication Strategies',
      description: 'Best practices for using secure messaging and video sessions',
      category: 'best-practices',
      duration: 30,
      difficulty: 'intermediate',
      completed: true,
      progress: 100,
      type: 'video',
      rating: 4.8,
      enrolledCount: 967,
      lastUpdated: '2024-01-12',
      certificate: false
    }
  ];

  const mockSupportResources: SupportResource[] = [
    {
      id: '1',
      title: 'How to set up custom notifications for client alerts?',
      type: 'faq',
      category: 'notifications',
      description: 'Step-by-step guide to configure personalized alerts for different client events',
      popular: true,
      lastUpdated: '2024-01-20'
    },
    {
      id: '2',
      title: 'Platform Integration Guide',
      type: 'guide',
      category: 'integrations',
      description: 'Complete guide for integrating Zentia with EMR/EHR systems',
      url: '/docs/integration-guide',
      popular: true,
      lastUpdated: '2024-01-18'
    },
    {
      id: '3',
      title: 'Weekly Platform Updates Webinar',
      type: 'webinar',
      category: 'updates',
      description: 'Join our weekly sessions to learn about new features and improvements',
      url: '/webinars/weekly-updates',
      popular: false,
      lastUpdated: '2024-01-22'
    },
    {
      id: '4',
      title: 'Troubleshooting Video Call Issues',
      type: 'video',
      category: 'technical',
      description: 'Common solutions for video call connectivity and quality problems',
      url: '/support/video-troubleshooting',
      popular: true,
      lastUpdated: '2024-01-16'
    },
    {
      id: '5',
      title: 'Contact Support Team',
      type: 'contact',
      category: 'support',
      description: '24/7 technical support for urgent issues and general inquiries',
      popular: false,
      lastUpdated: '2024-01-01'
    }
  ];

  const mockUserFeedback: Feedback[] = [
    {
      id: '1',
      type: 'feature_request',
      subject: 'Calendar integration with Outlook',
      description: 'Would love to sync session appointments with my Outlook calendar automatically',
      priority: 'medium',
      status: 'in_progress',
      submittedDate: '2024-01-15',
      response: 'Thank you for the suggestion! Our team is currently working on calendar integrations and Outlook is high on our priority list.'
    },
    {
      id: '2',
      type: 'bug_report',
      subject: 'Report generation taking too long',
      description: 'Custom reports with large datasets are timing out after 5 minutes',
      priority: 'high',
      status: 'resolved',
      submittedDate: '2024-01-10',
      response: 'This issue has been resolved in our latest update. Report generation performance has been improved by 60%.'
    }
  ];

  useEffect(() => {
    setTrainingModules(mockTrainingModules);
    setSupportResources(mockSupportResources);
    setUserFeedback(mockUserFeedback);
  }, []);

  const submitFeedback = () => {
    if (!feedbackSubject.trim() || !feedbackDescription.trim()) return;

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      type: feedbackType,
      subject: feedbackSubject,
      description: feedbackDescription,
      priority: feedbackPriority,
      status: 'submitted',
      submittedDate: new Date().toISOString()
    };

    setUserFeedback(prev => [newFeedback, ...prev]);
    
    // Reset form
    setFeedbackSubject('');
    setFeedbackDescription('');
    setFeedbackPriority('medium');
    setShowFeedbackForm(false);
    
    alert('Thank you for your feedback! We\'ll review it and get back to you soon.');
  };

  const startTrainingModule = (moduleId: string) => {
    alert(`Starting training module: ${trainingModules.find(m => m.id === moduleId)?.title}`);
  };

  const filteredModules = trainingModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || module.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredResources = supportResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'interactive': return Target;
      case 'document': return FileText;
      case 'quiz': return Brain;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedModules = trainingModules.filter(m => m.completed).length;
  const totalModules = trainingModules.length;
  const completionRate = Math.round((completedModules / totalModules) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training & Support</h1>
          <p className="text-gray-600 mt-1">Master Zentia and get the support you need</p>
        </div>
        
        {/* Progress Overview */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{completedModules}/{totalModules}</div>
            <div className="text-sm text-gray-600">Modules Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['training', 'support', 'feedback'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'training' && <BookOpen className="w-4 h-4 mr-2 inline" />}
              {tab === 'support' && <HelpCircle className="w-4 h-4 mr-2 inline" />}
              {tab === 'feedback' && <MessageCircle className="w-4 h-4 mr-2 inline" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'training' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search training modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="onboarding">Onboarding</option>
              <option value="features">Features</option>
              <option value="best-practices">Best Practices</option>
              <option value="compliance">Compliance</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Training Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => {
              const IconComponent = getModuleIcon(module.type);
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                    <div className="flex items-center space-x-2">
                      {module.completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      {module.certificate && (
                        <Award className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {module.duration}m
                    </div>
                  </div>
                  
                  {module.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">{module.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Users className="w-4 h-4 mr-1" />
                      {module.enrolledCount}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => startTrainingModule(module.id)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      module.completed
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : module.progress > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {module.completed ? 'Review' : module.progress > 0 ? 'Continue' : 'Start'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search support resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Popular Resources */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Popular Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportResources.filter(r => r.popular).map((resource) => (
                <div key={resource.id} className="bg-white rounded-lg p-4 border border-blue-200">
                  <h3 className="font-medium text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {resource.type.toUpperCase()}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Resources */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Support Resources</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {resource.type === 'faq' && <HelpCircle className="w-4 h-4 text-gray-600" />}
                          {resource.type === 'guide' && <FileText className="w-4 h-4 text-gray-600" />}
                          {resource.type === 'video' && <Video className="w-4 h-4 text-gray-600" />}
                          {resource.type === 'webinar' && <Users className="w-4 h-4 text-gray-600" />}
                          {resource.type === 'contact' && <MessageCircle className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{resource.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{resource.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              Updated {new Date(resource.lastUpdated).toLocaleDateString()}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {resource.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 flex items-center">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Submit Feedback Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Submit Feedback
            </button>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Feedback</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Type
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general_feedback">General Feedback</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="bug_report">Bug Report</option>
                    <option value="training_feedback">Training Feedback</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={feedbackSubject}
                    onChange={(e) => setFeedbackSubject(e.target.value)}
                    placeholder="Brief description of your feedback"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={feedbackDescription}
                    onChange={(e) => setFeedbackDescription(e.target.value)}
                    placeholder="Provide detailed feedback..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={feedbackPriority}
                    onChange={(e) => setFeedbackPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowFeedbackForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitFeedback}
                    disabled={!feedbackSubject.trim() || !feedbackDescription.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Previous Feedback */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Feedback History</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {userFeedback.map((feedback) => (
                <div key={feedback.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{feedback.subject}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(feedback.status)}`}>
                          {feedback.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(feedback.submittedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{feedback.description}</p>
                      {feedback.response && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="font-medium text-blue-900 text-sm mb-1">Response:</h4>
                          <p className="text-blue-800 text-sm">{feedback.response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingSupport; 