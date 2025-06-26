import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Brain, 
  Target, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  Calendar,
  MessageSquare,
  FileText,
  Lightbulb,
  Play,
  Star,
  Award,
  Zap,
  Wand2,
  Timer,
  Send,
  Plus,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { TaskCreator } from '../therapist/TaskCreator';
import GenAIService, { ClientProfile, TherapeuticHomework } from '../../services/genAIService';

interface GoldenPathStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  estimatedTime: string;
  completed?: boolean;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  age: string;
  concerns: string[];
  goals: string[];
  urgency: 'low' | 'medium' | 'high';
  sessionFrequency: 'weekly' | 'biweekly' | 'monthly';
}

interface GoldenPathWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (clientData: any) => void;
}

const GoldenPathWizard: React.FC<GoldenPathWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [clientData, setClientData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    age: '',
    concerns: [],
    goals: [],
    urgency: 'medium',
    sessionFrequency: 'weekly'
  });
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [generatedTasks, setGeneratedTasks] = useState<TherapeuticHomework[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  const commonConcerns = [
    'Anxiety & Stress',
    'Depression & Mood',
    'Trauma & PTSD', 
    'Relationship Issues',
    'Sleep Problems',
    'Substance Use',
    'Work Stress',
    'Self-Esteem',
    'Grief & Loss',
    'Life Transitions'
  ];

  const commonGoals = [
    'Reduce anxiety symptoms',
    'Improve mood stability',
    'Better sleep quality',
    'Enhance relationships',
    'Develop coping skills',
    'Increase self-confidence',
    'Process trauma',
    'Improve communication',
    'Find life purpose',
    'Build healthy habits'
  ];

  const goldenPathSteps: GoldenPathStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Golden Path',
      subtitle: 'Let\'s create your first client profile and treatment plan in under 5 minutes',
      icon: <Star className="w-8 h-8 text-primary-600" />,
      estimatedTime: '30 seconds'
    },
    {
      id: 'client-basics',
      title: 'Client Information',
      subtitle: 'Basic details to get started quickly',
      icon: <User className="w-8 h-8 text-primary-600" />,
      estimatedTime: '1 minute'
    },
    {
      id: 'concerns-goals',
      title: 'Concerns & Goals',
      subtitle: 'What brings your client to therapy?',
      icon: <Target className="w-8 h-8 text-primary-600" />,
      estimatedTime: '1 minute'
    },
    {
      id: 'ai-plan',
      title: 'AI Treatment Plan',
      subtitle: 'Let AI generate a personalized treatment approach',
      icon: <Brain className="w-8 h-8 text-primary-600" />,
      estimatedTime: '1 minute'
    },
    {
      id: 'tasks-homework',
      title: 'Assign Tasks',
      subtitle: 'AI-generated therapeutic tasks and homework',
      icon: <FileText className="w-8 h-8 text-primary-600" />,
      estimatedTime: '1.5 minutes'
    },
    {
      id: 'success',
      title: 'You\'re All Set!',
      subtitle: 'Your client profile and treatment plan are ready',
      icon: <Award className="w-8 h-8 text-primary-600" />,
      estimatedTime: 'Complete!'
    }
  ];

  const handleNext = () => {
    if (currentStep < goldenPathSteps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateAIPlan = async () => {
    setIsGenerating(true);
    try {
      const genAIService = new GenAIService();
      
      // Create client profile for AI
      const profile: ClientProfile = {
        name: clientData.name,
        age: parseInt(clientData.age) || 25,
        concerns: clientData.concerns,
        goals: clientData.goals,
        sessionHistory: [],
        preferences: []
      };

      // Generate treatment plan
      const plan = await genAIService.generateTherapeuticContent(
        'treatment_plan',
        profile,
        `Create a comprehensive treatment plan for ${clientData.name} addressing: ${clientData.concerns.join(', ')}. Goals: ${clientData.goals.join(', ')}`
      );

      // Generate initial homework tasks
      const homeworkTasks = await genAIService.generateTherapeuticHomework(
        profile,
        clientData.concerns[0] || 'anxiety',
        'beginner'
      );

      setGeneratedPlan(plan);
      setGeneratedTasks([homeworkTasks]);
    } catch (error) {
      console.error('Error generating AI plan:', error);
      // Fallback plan
      setGeneratedPlan({
        title: `Treatment Plan for ${clientData.name}`,
        content: `Evidence-based approach for ${clientData.concerns.join(' and ')} using CBT techniques, mindfulness practices, and behavioral interventions.`,
        phases: [
          'Assessment and rapport building',
          'Skill development and coping strategies', 
          'Practice and integration',
          'Maintenance and relapse prevention'
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    const completeClientData = {
      ...clientData,
      plan: generatedPlan,
      tasks: generatedTasks,
      id: `client-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      therapistId: user?.id
    };
    
    onComplete(completeClientData);
    
    // Add completion celebration
    setTimeout(() => {
      navigate('/therapist/clients');
    }, 2000);
  };

  const toggleConcern = (concern: string) => {
    setClientData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };

  const toggleGoal = (goal: string) => {
    setClientData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                Ready to Transform Your Practice?
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                This guided workflow will help you add your first client, create an AI-powered treatment plan, 
                and assign therapeutic tasks - all in under 5 minutes.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-neutral-900 flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                What You'll Accomplish:
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm text-neutral-700">Create comprehensive client profile</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm text-neutral-700">Generate AI treatment plan</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm text-neutral-700">Assign personalized tasks</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm text-neutral-700">Set up progress tracking</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-amber-800">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">Estimated completion time: 5 minutes</span>
              </div>
            </div>
          </div>
        );

      case 1: // Client Basics
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Client Information</h2>
              <p className="text-neutral-600">Start with the essentials - you can add more details later</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientData.name}
                  onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Sarah Johnson"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={clientData.age}
                  onChange={(e) => setClientData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="28"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="sarah@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={clientData.phone}
                  onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Session Frequency
                </label>
                <select
                  value={clientData.sessionFrequency}
                  onChange={(e) => setClientData(prev => ({ ...prev, sessionFrequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Urgency Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setClientData(prev => ({ ...prev, urgency: level }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        clientData.urgency === level
                          ? level === 'high' 
                            ? 'bg-red-100 text-red-700 border-red-300' 
                            : level === 'medium' 
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-300' 
                              : 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <strong>Pro Tip:</strong> You can always update this information later. 
                  Focus on getting the basics right for now.
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Concerns & Goals
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Concerns & Goals</h2>
              <p className="text-neutral-600">Help our AI understand what your client needs</p>
            </div>

            <div>
              <h3 className="font-medium text-neutral-900 mb-3">
                Primary Concerns <span className="text-neutral-500">(select 1-3)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonConcerns.map((concern) => (
                  <button
                    key={concern}
                    onClick={() => toggleConcern(concern)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      clientData.concerns.includes(concern)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-300 hover:border-primary-300 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{concern}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-neutral-900 mb-3">
                Treatment Goals <span className="text-neutral-500">(select 2-4)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonGoals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      clientData.goals.includes(goal)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-neutral-300 hover:border-green-300 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{goal}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
                <div className="text-sm text-purple-700">
                  <strong>AI Insight:</strong> Based on your selections, our AI will recommend 
                  evidence-based interventions and create personalized therapeutic content.
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // AI Plan Generation
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-2">AI Treatment Plan</h2>
              <p className="text-neutral-600">Let our AI create a personalized treatment approach</p>
            </div>

            {!generatedPlan && !isGenerating && (
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-8">
                  <Brain className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ready to Generate</h3>
                  <p className="text-neutral-600 mb-6">
                    Based on {clientData.name}'s concerns ({clientData.concerns.join(', ')}) and goals 
                    ({clientData.goals.join(', ')}), our AI will create a comprehensive treatment plan.
                  </p>
                  <button
                    onClick={handleGenerateAIPlan}
                    className="btn btn-primary inline-flex items-center"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate AI Plan
                  </button>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="text-center space-y-6">
                <div className="bg-white border-2 border-dashed border-primary-300 rounded-xl p-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mx-auto w-12 h-12 text-primary-600 mb-4"
                  >
                    <Brain className="w-full h-full" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">AI is Working...</h3>
                  <p className="text-neutral-600">
                    Analyzing concerns, reviewing evidence-based treatments, and creating your personalized plan.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 bg-primary-600 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {generatedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Treatment Plan Generated!</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-neutral-900 mb-2">{generatedPlan.title || `Treatment Plan for ${clientData.name}`}</h4>
                    <p className="text-neutral-700 text-sm mb-3">{generatedPlan.content || generatedPlan.description}</p>
                    {generatedPlan.phases && (
                      <div>
                        <h5 className="font-medium text-neutral-900 mb-2">Treatment Phases:</h5>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-neutral-700">
                          {generatedPlan.phases.map((phase: string, index: number) => (
                            <li key={index}>{phase}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 4: // Tasks & Homework
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Assign Initial Tasks</h2>
              <p className="text-neutral-600">Get your client started with AI-generated therapeutic activities</p>
            </div>

            {generatedTasks.length > 0 && (
              <div className="space-y-4">
                {generatedTasks.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-neutral-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-neutral-900">{task.title}</h4>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {task.estimatedTime || '10-15 min'}
                      </span>
                    </div>
                    <p className="text-neutral-700 text-sm mb-3">{task.description}</p>
                    {task.instructions && (
                      <div className="text-xs text-neutral-600">
                        <strong>Instructions:</strong> {task.instructions}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-neutral-900 mb-2 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Want to Add More Tasks?
              </h3>
              <p className="text-neutral-700 text-sm mb-3">
                Use our advanced task creator to generate more personalized assignments.
              </p>
              <button
                onClick={() => setShowTaskCreator(true)}
                className="btn btn-outline text-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Open Task Creator
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Quick Start:</strong> These initial tasks will help {clientData.name} begin 
                  their therapeutic journey. You can always add, modify, or remove tasks later.
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Success
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center"
            >
              <Award className="w-10 h-10 text-white" />
            </motion.div>
            
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                🎉 Congratulations!
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                You've successfully created a comprehensive client profile for <strong>{clientData.name}</strong> 
                with an AI-powered treatment plan and initial therapeutic tasks.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-neutral-900">What's Next?</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-neutral-900">Schedule First Session</span>
                    <p className="text-xs text-neutral-600">Book your initial appointment</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-neutral-900">Send Welcome Message</span>
                    <p className="text-xs text-neutral-600">Introduce the platform</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-neutral-900">Review Treatment Plan</span>
                    <p className="text-xs text-neutral-600">Fine-tune as needed</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-neutral-900">Track Progress</span>
                    <p className="text-xs text-neutral-600">Monitor client outcomes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleComplete}
                className="btn btn-primary flex-1"
              >
                <Users className="w-4 h-4 mr-2" />
                Go to Client Dashboard
              </button>
              <button
                onClick={() => setCurrentStep(0)}
                className="btn btn-outline"
              >
                Add Another Client
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return clientData.name.trim() !== '';
      case 2: return clientData.concerns.length > 0 && clientData.goals.length > 0;
      case 3: return generatedPlan !== null;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Progress Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Golden Path Client Setup</h1>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {currentStep + 1} of {goldenPathSteps.length}</span>
                <span>{goldenPathSteps[currentStep]?.estimatedTime}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / goldenPathSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-neutral-200 p-6 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center text-neutral-600 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="flex space-x-2">
              {goldenPathSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index < currentStep 
                      ? 'bg-green-500' 
                      : index === currentStep 
                        ? 'bg-primary-500' 
                        : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceed() || currentStep === goldenPathSteps.length - 1}
              className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === goldenPathSteps.length - 1 ? (
                <>
                  Complete
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Task Creator Modal */}
        {showTaskCreator && (
          <TaskCreator
            isOpen={showTaskCreator}
            onClose={() => setShowTaskCreator(false)}
            clientId="new-client"
            onTaskCreated={(task) => {
              console.log('New task created:', task);
              setShowTaskCreator(false);
            }}
          />
        )}
      </div>
    </AnimatePresence>
  );
};

export default GoldenPathWizard; 