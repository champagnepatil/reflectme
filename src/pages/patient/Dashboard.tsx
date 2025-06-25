import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  BookOpen, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Heart, 
  Brain, 
  Calendar,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Zap,
  Shield,
  Clock,
  Award,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MoodTrackerWithAI from '../../components/mood/MoodTrackerWithAI';
import EnhancedAICompanionMCP from '../../services/enhancedAICompanionMCP';
import * as Sentry from "@sentry/react";

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiInsights, setAiInsights] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showProactiveSupport, setShowProactiveSupport] = useState(false);
  const [todayStats, setTodayStats] = useState({
    journalEntries: 2,
    moodScore: 7.2,
    streakDays: 12,
    aiInteractions: 5
  });

  // Track dashboard access
  useEffect(() => {
    Sentry.addBreadcrumb({
      message: 'Client accessed optimized dashboard',
      category: 'navigation',
      level: 'info'
    });
  }, []);

  // AI-powered daily insights
  useEffect(() => {
    const generateDailyInsights = () => {
      const insights = [
        "🌟 You've maintained a positive mood trend for 3 consecutive days!",
        "💡 Your evening journal sessions show great emotional awareness.",
        "🎯 You're 80% closer to completing this week's wellness goals.",
        "🧠 AI analysis suggests you respond well to mindfulness exercises.",
        "⭐ Your consistency in mood tracking is helping identify patterns."
      ];
      setAiInsights(insights[Math.floor(Math.random() * insights.length)]);
    };

    generateDailyInsights();
  }, []);

  // Proactive AI support check
  useEffect(() => {
    const checkProactiveSupport = () => {
      // 40% chance to show proactive support
      if (Math.random() < 0.4) {
        setTimeout(() => setShowProactiveSupport(true), 3000);
      }
    };
    checkProactiveSupport();
  }, []);

  const handleMoodSelection = async (mood: number) => {
    setSelectedMood(mood);
    
    if (mood <= 2) {
      try {
        const response = await EnhancedAICompanionMCP.handleMoodTrigger({
          mood,
          context: 'dashboard_mood_selection',
          userPreferences: ['gentle', 'supportive'],
          recentJournal: []
        });
        
        setAiInsights(`🤗 ${response.message}`);
        setShowProactiveSupport(true);
      } catch (error) {
        console.error('Error handling mood trigger:', error);
      }
    }
  };

  const killerFunctions = [
    {
      id: 'ai-companion',
      title: '🤖 AI Companion',
      description: 'Chat with your personal AI therapist anytime',
      value: 'Get instant support and guidance 24/7',
      href: '/client/chat',
      color: 'from-blue-500 to-purple-600',
      stats: { sessions: 23, satisfaction: '94%', lastUsed: '2 hrs ago' },
      cta: 'Start Chat',
      features: ['Mood support', 'Coping strategies', 'Emotional guidance'],
      badge: '2 new'
    },
    {
      id: 'smart-journal',
      title: '📝 Smart Journal',
      description: 'AI-enhanced journaling with insights',
      value: 'Transform thoughts into actionable insights',
      href: '/client/journal',
      color: 'from-emerald-500 to-teal-600',
      stats: { entries: 47, insights: 12, streak: '5 days' },
      cta: 'Write Entry',
      features: ['AI analysis', 'Pattern detection', 'Mood correlation'],
      badge: 'Daily streak!'
    },
    {
      id: 'progress',
      title: '🎯 My Progress',
      description: 'Track your wellness journey',
      value: 'Visualize your mental health improvements',
      href: '/client',
      color: 'from-orange-500 to-red-500',
      stats: { score: '7.2/10', improvement: '+15%', goals: '3/4' },
      cta: 'View Progress',
      features: ['Mood trends', 'Goal tracking', 'Milestone rewards'],
      badge: 'New milestone!'
    },
    {
      id: 'insights',
      title: '✨ AI Insights',
      description: 'Personalized mental wellness insights',
      value: 'Discover patterns and get recommendations',
      href: '/client/insights',
      color: 'from-purple-500 to-pink-500',
      stats: { insights: 8, accuracy: '92%', recommendations: 5 },
      cta: 'Explore',
      features: ['Pattern analysis', 'Personalized tips', 'Progress predictions'],
      badge: 'Updated'
    }
  ];

  const quickStats = [
    { label: 'Days Active', value: todayStats.streakDays, icon: Calendar, color: 'text-blue-600' },
    { label: 'Mood Score', value: todayStats.moodScore, icon: Heart, color: 'text-red-500' },
    { label: 'AI Chats', value: todayStats.aiInteractions, icon: MessageSquare, color: 'text-purple-600' },
    { label: 'Journal Entries', value: todayStats.journalEntries, icon: BookOpen, color: 'text-green-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-6">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.name?.split(' ')[0] || 'Friend'}! 🌟
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI-powered wellness companion is ready to support your mental health journey.
          </p>
        </div>

        {/* AI Daily Insight */}
        {aiInsights && (
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <Brain className="w-6 h-6 mr-3 mt-1 text-blue-100" />
                  <div>
                    <h3 className="text-lg font-bold mb-1">🤖 AI Daily Insight</h3>
                    <p className="text-blue-100 leading-relaxed">{aiInsights}</p>
                  </div>
                </div>
                <Sparkles className="w-6 h-6 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white/70 backdrop-blur-sm shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Mood Check */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Quick Mood Check
            </CardTitle>
            <CardDescription>
              How are you feeling right now? Your AI companion is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MoodTrackerWithAI 
              onMoodSelect={handleMoodSelection}
              className="mb-4"
            />
          </CardContent>
        </Card>

        {/* Killer Functions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {killerFunctions.map((func) => (
            <Card key={func.id} className="bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl font-bold">{func.title}</CardTitle>
                      {func.badge && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                          {func.badge}
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-base">{func.description}</CardDescription>
                    <p className="text-sm text-gray-500 mt-1 italic">{func.value}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Object.entries(func.stats).map(([key, value]) => (
                    <div key={key} className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-600 capitalize">{key}</p>
                    </div>
                  ))}
                </div>
                
                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {func.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className={`w-full bg-gradient-to-r ${func.color} text-white border-none hover:scale-105 transition-transform font-medium`}
                  onClick={() => navigate(func.href)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {func.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Proactive AI Support */}
        {showProactiveSupport && (
          <Card className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <Shield className="w-6 h-6 mr-3 mt-1 text-green-100" />
                  <div>
                    <h3 className="text-lg font-bold mb-2">🤗 Your AI Companion is Here</h3>
                    <p className="text-green-100 mb-3">
                      I noticed you might need some extra support today. I'm here to listen and help you work through whatever you're experiencing.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => navigate('/client/chat')}
                        className="bg-white text-green-600 hover:bg-green-50"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Talk Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowProactiveSupport(false)}
                        className="border-white text-white hover:bg-white hover:text-green-600"
                      >
                        Maybe Later
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievement Badge */}
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-xl">
          <CardContent className="p-6">
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-yellow-100" />
              <h3 className="text-xl font-bold mb-2">🏆 You're Doing Great!</h3>
              <p className="text-yellow-100 mb-4">
                You've been consistent with your mental wellness journey. Keep up the amazing work!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">12-day streak</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">5 insights unlocked</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Mood improver</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;