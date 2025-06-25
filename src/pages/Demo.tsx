import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  BookOpen, 
  Target, 
  Sparkles, 
  Users, 
  Brain, 
  Analytics, 
  Heart, 
  ArrowRight, 
  Play, 
  Star,
  CheckCircle,
  Award,
  TrendingUp,
  Shield,
  Zap,
  Timer,
  BarChart,
  Activity,
  Clock
} from 'lucide-react';

const Demo: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'patient' | 'therapist'>('patient');

  const patientKillerFunctions = [
    {
      id: 'ai-companion',
      title: '🤖 AI Companion',
      description: 'Chat with your personal AI therapist anytime',
      value: 'Get instant support and guidance 24/7',
      features: ['Mood support', 'Coping strategies', 'Emotional guidance'],
      stats: { users: '10K+', satisfaction: '94%', sessions: '2M+' },
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'smart-journal',
      title: '📝 Smart Journal',
      description: 'AI-enhanced journaling with insights',
      value: 'Transform thoughts into actionable insights',
      features: ['AI analysis', 'Pattern detection', 'Mood correlation'],
      stats: { entries: '500K+', insights: '50K+', accuracy: '89%' },
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'progress-tracking',
      title: '🎯 Progress Tracking',
      description: 'Visualize your wellness journey',
      value: 'Track improvements with AI analytics',
      features: ['Mood trends', 'Goal tracking', 'Milestone rewards'],
      stats: { improvement: '+73%', goals: '85%', streaks: '21 days' },
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'ai-insights',
      title: '✨ AI Insights',
      description: 'Personalized mental wellness insights',
      value: 'Discover patterns and get recommendations',
      features: ['Pattern analysis', 'Personalized tips', 'Progress predictions'],
      stats: { insights: '25K+', accuracy: '92%', predictions: '87%' },
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const therapistKillerFunctions = [
    {
      id: 'client-management',
      title: '👥 Smart Client Management',
      description: 'AI-powered client oversight and monitoring',
      value: 'Streamline workflows and improve outcomes',
      features: ['Real-time monitoring', 'Risk alerts', 'Progress tracking'],
      stats: { clients: '500+', efficiency: '+65%', outcomes: '+40%' },
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'ai-assistant',
      title: '🧠 AI Clinical Assistant',
      description: 'Generate therapeutic content and insights',
      value: 'AI-powered clinical tools and automation',
      features: ['Content generation', 'Clinical notes', 'Homework automation'],
      stats: { generated: '10K+', accuracy: '94%', timeSaved: '5hrs/day' },
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'predictive-analytics',
      title: '📊 Predictive Analytics',
      description: 'AI-driven insights and risk prediction',
      value: 'Data-driven clinical decision making',
      features: ['Pattern detection', 'Risk prediction', 'Outcome forecasting'],
      stats: { predictions: '87%', patterns: '15K+', accuracy: '91%' },
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'secure-communication',
      title: '💬 Secure Communication',
      description: 'HIPAA-compliant messaging and video',
      value: 'Encrypted, secure patient communications',
      features: ['End-to-end encryption', 'Emergency protocols', 'Video sessions'],
      stats: { messages: '100K+', security: '99.9%', satisfaction: '96%' },
      color: 'from-orange-500 to-red-500'
    }
  ];

  const benefits = {
    patient: [
      { icon: Heart, title: 'Better Mental Health', value: '73% improvement in symptoms' },
      { icon: Clock, title: 'Faster Support', value: '24/7 AI companion availability' },
      { icon: TrendingUp, title: 'Track Progress', value: '89% users report better awareness' },
      { icon: Shield, title: 'Privacy First', value: 'End-to-end encrypted conversations' }
    ],
    therapist: [
      { icon: Activity, title: 'Increased Efficiency', value: '65% reduction in admin time' },
      { icon: Brain, title: 'AI-Enhanced Care', value: '40% better patient outcomes' },
      { icon: BarChart, title: 'Data-Driven Insights', value: '91% prediction accuracy' },
      { icon: Users, title: 'Scale Practice', value: 'Manage 3x more clients effectively' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl mb-8">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Mental Health AI Revolution
          </h1>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto mb-8">
            Experience the future of mental healthcare with AI-powered tools that transform lives
          </p>
          
          {/* Section Toggle */}
          <div className="inline-flex bg-white rounded-2xl p-2 shadow-xl">
            <button
              onClick={() => setActiveSection('patient')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeSection === 'patient'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌟 For Patients
            </button>
            <button
              onClick={() => setActiveSection('therapist')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeSection === 'therapist'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🧠 For Therapists
            </button>
          </div>
        </div>

        {/* Benefits Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits[activeSection].map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="bg-white/70 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Killer Functions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {activeSection === 'patient' ? '🌟 Revolutionary Features for Patients' : '🧠 Game-Changing Tools for Therapists'}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(activeSection === 'patient' ? patientKillerFunctions : therapistKillerFunctions).map((func) => (
              <Card key={func.id} className="bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold mb-2">{func.title}</CardTitle>
                      <CardDescription className="text-lg mb-2">{func.description}</CardDescription>
                      <p className="text-purple-600 font-semibold italic">{func.value}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {Object.entries(func.stats).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-lg font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-600 capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Features */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {func.features.map((feature, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full bg-gradient-to-r ${func.color} text-white border-none hover:scale-105 transition-transform font-medium text-lg py-3`}
                    onClick={() => {
                      if (activeSection === 'patient') {
                        switch (func.id) {
                          case 'ai-companion':
                            navigate('/client/chat');
                            break;
                          case 'smart-journal':
                            navigate('/client/journal');
                            break;
                          case 'progress-tracking':
                            navigate('/client');
                            break;
                          case 'ai-insights':
                            navigate('/client/insights');
                            break;
                          default:
                            navigate('/register');
                        }
                      } else {
                        switch (func.id) {
                          case 'client-management':
                            navigate('/therapist/clients');
                            break;
                          case 'ai-assistant':
                            navigate('/therapist/ai-toolbox');
                            break;
                          case 'predictive-analytics':
                            navigate('/therapist/analytics-hub');
                            break;
                          case 'secure-communication':
                            navigate('/therapist/communication-hub');
                            break;
                          default:
                            navigate('/register');
                        }
                      }
                    }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Try This Feature
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <Card className="mb-16 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center">
              <Award className="w-16 h-16 mx-auto mb-6 text-yellow-100" />
              <h3 className="text-3xl font-bold mb-4">
                {activeSection === 'patient' ? '🌟 Transforming Lives Daily' : '🧠 Empowering Clinical Excellence'}
              </h3>
              <p className="text-xl text-yellow-100 mb-8 max-w-3xl mx-auto">
                {activeSection === 'patient' 
                  ? 'Join thousands of people who have improved their mental health with AI-powered support and personalized care.'
                  : 'Join the community of forward-thinking therapists using AI to deliver exceptional patient care and streamline their practice.'
                }
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {activeSection === 'patient' ? (
                  <>
                    <div>
                      <div className="text-4xl font-bold mb-2">10,000+</div>
                      <div className="text-yellow-100">Active Users</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold mb-2">73%</div>
                      <div className="text-yellow-100">Symptom Improvement</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold mb-2">94%</div>
                      <div className="text-yellow-100">User Satisfaction</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-4xl font-bold mb-2">500+</div>
                      <div className="text-yellow-100">Therapists Using AI</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold mb-2">65%</div>
                      <div className="text-yellow-100">Time Savings</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold mb-2">40%</div>
                      <div className="text-yellow-100">Better Outcomes</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Experience the Future?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {activeSection === 'patient' 
              ? 'Start your AI-powered mental wellness journey today. No commitment required.'
              : 'Transform your practice with AI-powered clinical tools. Join the mental health revolution.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-4 text-lg hover:scale-105 transition-transform"
              onClick={() => navigate('/register')}
            >
              <Star className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-purple-500 text-purple-600 px-8 py-4 text-lg hover:bg-purple-50"
              onClick={() => navigate('/login')}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Sign In & Explore
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;