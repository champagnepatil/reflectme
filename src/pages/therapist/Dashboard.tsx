import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTherapy } from '../../contexts/TherapyContext';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarIcon, Clock, BarChart2, FileText, ArrowRight, Users, UserCheck, AlertCircle, Plus, Target, TrendingUp, Brain, AlertTriangle, Download, Settings, Filter, Bell, BarChart3, FileDown, Video, Upload } from 'lucide-react';
import { TopicCloud } from '../../components/therapist/TopicCloud';
import { TaskCreator } from '../../components/therapist/TaskCreator';
import { AdherenceGauge } from '../../components/therapist/AdherenceGauge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  MessageSquare, 
  Award, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  BarChart,
  Play,
  Star
} from 'lucide-react';
import * as Sentry from "@sentry/react";

// New interfaces for therapist features
interface CustomReport {
  id: string;
  name: string;
  metrics: string[];
  format: 'PDF' | 'CSV' | 'Excel';
  dateRange: string;
  clients: string[];
}

interface TherapistNotification {
  id: string;
  type: 'mood_drop' | 'overdue_activity' | 'session_reminder' | 'progress_milestone';
  clientId: string;
  clientName: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  read: boolean;
}

interface WorkloadMetrics {
  totalClients: number;
  activeClients: number;
  weeklySessionHours: number;
  avgTimePerClient: number;
  aiInteractions: number;
  pendingTasks: number;
}

const Dashboard: React.FC = () => {
  const { clients } = useTherapy();
  const { user } = useAuth();
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [selectedClientForTask, setSelectedClientForTask] = useState<string>('');
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [notifications, setNotifications] = useState<TherapistNotification[]>([]);
  const [workloadMetrics, setWorkloadMetrics] = useState<WorkloadMetrics | null>(null);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  
  // Report Builder State
  const [reportName, setReportName] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'CSV' | 'Excel'>('PDF');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('last_30_days');

  console.log('🏥 Therapist Dashboard - Clients loaded:', {
    count: clients.length,
    clientNames: clients.map(c => c.name)
  });
  
  // Aggregate client mood data
  const aggregateMoodData = () => {
    if (clients.length === 0) return [];
    
    const allMoodData: Record<string, { count: number; sum: number }> = {};
    
    clients.forEach(client => {
      client.moodHistory.forEach(entry => {
        if (!allMoodData[entry.date]) {
          allMoodData[entry.date] = { count: 0, sum: 0 };
        }
        allMoodData[entry.date].count += 1;
        allMoodData[entry.date].sum += entry.value;
      });
    });
    
    return Object.entries(allMoodData)
      .map(([date, data]) => ({
        date,
        value: data.sum / data.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  };
  
  const moodData = aggregateMoodData();
  
  // Calculate upcoming sessions
  const upcomingSessions = clients.filter(client => {
    const nextSession = new Date(client.nextSessionDate);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return nextSession >= today && nextSession <= nextWeek;
  }).length;
  
  // Calculate today's sessions
  const todaySessions = clients.filter(client => {
    const nextSession = new Date(client.nextSessionDate);
    const today = new Date();
    return nextSession.toDateString() === today.toDateString();
  }).length;

  const availableMetrics = [
    { id: 'mood_trends', name: 'Mood Trends', description: 'Average mood scores over time' },
    { id: 'treatment_adherence', name: 'Treatment Adherence', description: 'Completion rates for assigned tasks' },
    { id: 'topic_cloud', name: 'Topic Cloud', description: 'Most discussed themes and topics' },
    { id: 'session_frequency', name: 'Session Frequency', description: 'Attendance and scheduling patterns' },
    { id: 'progress_milestones', name: 'Progress Milestones', description: 'Goal achievement and breakthroughs' },
    { id: 'ai_interactions', name: 'AI Interactions', description: 'AI companion usage and effectiveness' },
    { id: 'crisis_indicators', name: 'Crisis Indicators', description: 'Risk flags and intervention needs' },
    { id: 'engagement_metrics', name: 'Engagement Metrics', description: 'Platform usage and participation' }
  ];

  const mockClients = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Michael Chen' },
    { id: '3', name: 'Emily Davis' },
    { id: '4', name: 'James Wilson' }
  ];

  useEffect(() => {
    loadTherapistData();
  }, []);

  const loadTherapistData = async () => {
    // Load notifications
    const mockNotifications: TherapistNotification[] = [
      {
        id: '1',
        type: 'mood_drop',
        clientId: '1',
        clientName: 'Sarah Johnson',
        message: 'Significant mood drop detected (3.2 → 1.8) over last 3 days',
        severity: 'high',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'overdue_activity',
        clientId: '2',
        clientName: 'Michael Chen',
        message: 'Mindfulness exercise overdue by 2 days',
        severity: 'medium',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: '3',
        type: 'progress_milestone',
        clientId: '3',
        clientName: 'Emily Davis',
        message: 'Completed 30-day consistency streak in mood tracking',
        severity: 'low',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ];
    setNotifications(mockNotifications);

    // Load workload metrics
    setWorkloadMetrics({
      totalClients: 12,
      activeClients: 8,
      weeklySessionHours: 24,
      avgTimePerClient: 45,
      aiInteractions: 156,
      pendingTasks: 7
    });

    // Load existing custom reports
    const mockReports: CustomReport[] = [
      {
        id: '1',
        name: 'Weekly Progress Summary',
        metrics: ['mood_trends', 'treatment_adherence'],
        format: 'PDF',
        dateRange: 'last_7_days',
        clients: ['1', '2']
      }
    ];
    setCustomReports(mockReports);
  };

  const generateReport = async () => {
    if (!reportName || selectedMetrics.length === 0) return;

    const newReport: CustomReport = {
      id: Date.now().toString(),
      name: reportName,
      metrics: selectedMetrics,
      format: selectedFormat,
      dateRange,
      clients: selectedClients
    };

    setCustomReports(prev => [...prev, newReport]);
    
    // Simulate report generation
    console.log('Generating report:', newReport);
    alert(`Report "${reportName}" generated successfully! In a real implementation, this would download the ${selectedFormat} file.`);
    
    // Reset form
    setReportName('');
    setSelectedMetrics([]);
    setSelectedClients([]);
    setShowReportBuilder(false);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const getNotificationIcon = (type: TherapistNotification['type']) => {
    switch (type) {
      case 'mood_drop': return TrendingUp;
      case 'overdue_activity': return Clock;
      case 'session_reminder': return CalendarIcon;
      case 'progress_milestone': return Brain;
      default: return Bell;
    }
  };

  const getNotificationColor = (severity: TherapistNotification['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl mb-6">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Good {getTimeOfDay()}, Dr. {user?.name?.split(' ')[0] || 'Therapist'}! 🧠
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI-powered clinical platform is ready to enhance patient care and streamline your practice.
          </p>
        </div>

        {/* Quick Clinical Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-sm text-green-600">+3 this week</p>
                </div>
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Insights</p>
                  <p className="text-2xl font-bold text-gray-900">47</p>
                  <p className="text-sm text-purple-600">Generated today</p>
                </div>
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">8.3</p>
                  <p className="text-sm text-green-600">+0.7 improvement</p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Risk Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                  <p className="text-sm text-orange-600">Need attention</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Clinical Insight */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-blue-600 text-white border-none shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <Brain className="w-6 h-6 mr-3 mt-1 text-purple-100" />
                <div>
                  <h3 className="text-lg font-bold mb-1">🧠 AI Clinical Insight</h3>
                  <p className="text-purple-100 leading-relaxed">
                    Client Sarah M. shows 85% improvement in anxiety scores over the past month. 
                    AI recommends continuing CBT techniques with added mindfulness exercises.
                  </p>
                </div>
              </div>
              <Sparkles className="w-6 h-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        {/* Killer Functions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* My Clients */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl font-bold">👥 My Clients</CardTitle>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                      3 alerts
                    </span>
                  </div>
                  <CardDescription className="text-base">
                    Manage client cases with AI-powered insights
                  </CardDescription>
                  <p className="text-sm text-gray-500 mt-1 italic">
                    Streamline clinical workflow and improve outcomes
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">24</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">94%</p>
                  <p className="text-xs text-gray-600">Engagement</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">7.8</p>
                  <p className="text-xs text-gray-600">Avg Score</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Real-time monitoring</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Progress tracking</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Risk alerts</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:scale-105 transition-transform font-medium"
                onClick={() => navigate('/therapist/clients')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Clients
              </Button>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl font-bold">🧠 AI Assistant</CardTitle>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      Enhanced
                    </span>
                  </div>
                  <CardDescription className="text-base">
                    Generate therapeutic content and insights
                  </CardDescription>
                  <p className="text-sm text-gray-500 mt-1 italic">
                    AI-powered clinical tools and content generation
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">156</p>
                  <p className="text-xs text-gray-600">Generated</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">92%</p>
                  <p className="text-xs text-gray-600">Accuracy</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">5</p>
                  <p className="text-xs text-gray-600">Tools</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Content creation</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Homework generator</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Clinical notes</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:scale-105 transition-transform font-medium"
                onClick={() => navigate('/therapist/ai-toolbox')}
              >
                <Brain className="w-4 h-4 mr-2" />
                Open AI Tools
              </Button>
            </CardContent>
          </Card>

          {/* Smart Analytics */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl font-bold">📊 Smart Analytics</CardTitle>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      Real-time
                    </span>
                  </div>
                  <CardDescription className="text-base">
                    Monitor patterns and predict outcomes
                  </CardDescription>
                  <p className="text-sm text-gray-500 mt-1 italic">
                    Data-driven insights for better clinical decisions
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">18</p>
                  <p className="text-xs text-gray-600">Insights</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">87%</p>
                  <p className="text-xs text-gray-600">Prediction</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">12</p>
                  <p className="text-xs text-gray-600">Patterns</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Predictive analytics</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Pattern detection</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Custom reports</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white border-none hover:scale-105 transition-transform font-medium"
                onClick={() => navigate('/therapist/analytics-hub')}
              >
                <BarChart className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Secure Chat */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl font-bold">💬 Secure Chat</CardTitle>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      HIPAA
                    </span>
                  </div>
                  <CardDescription className="text-base">
                    Communicate securely with clients
                  </CardDescription>
                  <p className="text-sm text-gray-500 mt-1 italic">
                    Encrypted messaging and video calls
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">47</p>
                  <p className="text-xs text-gray-600">Messages</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">12</p>
                  <p className="text-xs text-gray-600">Video calls</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">2</p>
                  <p className="text-xs text-gray-600">Urgent</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">End-to-end encryption</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Emergency protocols</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Training support</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white border-none hover:scale-105 transition-transform font-medium"
                onClick={() => navigate('/therapist/communication-hub')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Open Communications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Clinical Excellence Badge */}
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-xl">
          <CardContent className="p-6">
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-yellow-100" />
              <h3 className="text-xl font-bold mb-2">🏆 Clinical Excellence Achieved!</h3>
              <p className="text-yellow-100 mb-4">
                Your AI-enhanced practice is delivering outstanding patient outcomes. 
                94% client satisfaction and 87% improvement rates this month.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Top Performer</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">AI Champion</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Innovation Leader</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;