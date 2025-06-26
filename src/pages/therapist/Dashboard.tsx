import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTherapy } from '../../contexts/TherapyContext';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  CalendarIcon, 
  Clock, 
  BarChart2, 
  FileText, 
  ArrowRight, 
  Users, 
  UserCheck, 
  AlertCircle, 
  Plus, 
  Target, 
  TrendingUp, 
  Brain, 
  AlertTriangle, 
  Download, 
  Settings, 
  Filter, 
  Bell, 
  BarChart3, 
  FileDown, 
  Video, 
  Upload,
  MessageSquare, 
  Award, 
  Sparkles, 
  BarChart,
  Play,
  Star,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { TopicCloud } from '../../components/therapist/TopicCloud';
import { TaskCreator } from '../../components/therapist/TaskCreator';
import { AdherenceGauge } from '../../components/therapist/AdherenceGauge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import GoldenPathWizard from '../../components/onboarding/GoldenPathWizard';
import * as Sentry from "@sentry/react";

// Simplified interfaces
interface DashboardWidget {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  content: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  }[];
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

const Dashboard: React.FC = () => {
  const { clients } = useTherapy();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Simplified state management
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedWidgets, setExpandedWidgets] = useState<Set<string>>(new Set(['overview', 'quick-actions']));
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [showGoldenPath, setShowGoldenPath] = useState(false);
  const [notifications, setNotifications] = useState<TherapistNotification[]>([]);

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
      .slice(-14);
  };

  const moodData = aggregateMoodData();
  
  // Calculate key metrics
  const activeClients = clients.filter(c => c.status === 'active').length;
  const todaySessions = clients.filter(client => {
    const nextSession = new Date(client.nextSessionDate);
    const today = new Date();
    return nextSession.toDateString() === today.toDateString();
  }).length;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
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
      }
    ];
    setNotifications(mockNotifications);
  };

  const toggleWidget = (widgetId: string) => {
    const newExpanded = new Set(expandedWidgets);
    if (newExpanded.has(widgetId)) {
      newExpanded.delete(widgetId);
    } else {
      newExpanded.add(widgetId);
    }
    setExpandedWidgets(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  // Simplified widgets configuration
  const widgets: DashboardWidget[] = [
    {
      id: 'overview',
      title: 'Overview',
      priority: 'high',
      defaultExpanded: true,
      content: (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
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
                  <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{todaySessions}</p>
                  <p className="text-sm text-purple-600">Scheduled</p>
                </div>
                <CalendarIcon className="w-6 h-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600">Risk Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                  <p className="text-sm text-orange-600">Need attention</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      priority: 'high',
      defaultExpanded: true,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            className="h-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:scale-105 transition-transform font-medium"
            onClick={() => navigate('/therapist/clients')}
          >
            <Users className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-bold">Manage Clients</div>
              <div className="text-sm opacity-90">View and manage client cases</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:scale-105 transition-transform font-medium"
            onClick={() => navigate('/therapist/ai-toolbox')}
          >
            <Brain className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-bold">AI Assistant</div>
              <div className="text-sm opacity-90">Generate content and insights</div>
            </div>
          </Button>
        </div>
      )
    },
    {
      id: 'mood-trends',
      title: 'Client Mood Trends',
      priority: 'medium',
      collapsible: true,
      content: (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ),
      actions: [
        {
          label: 'View Details',
          onClick: () => navigate('/therapist/analytics-hub'),
          variant: 'outline'
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Recent Notifications',
      priority: 'medium',
      collapsible: true,
      content: (
        <div className="space-y-3">
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className={`w-5 h-5 mt-0.5 ${
                notification.severity === 'high' ? 'text-red-500' :
                notification.severity === 'medium' ? 'text-orange-500' : 'text-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.clientName}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ),
      actions: [
        {
          label: 'View All',
          onClick: () => navigate('/therapist/notifications'),
          variant: 'outline'
        }
      ]
    }
  ];

  // Filter widgets based on advanced mode
  const visibleWidgets = widgets.filter(widget => {
    if (!showAdvanced && widget.priority === 'low') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Therapist'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showAdvanced ? 'Simple View' : 'Advanced View'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGoldenPath(true)}
          >
            <Play className="w-4 h-4 mr-2" />
            Quick Setup
          </Button>
        </div>
      </div>

      {/* Widgets */}
      <div className="space-y-6">
        {visibleWidgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-l-4 border-l-transparent hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(widget.priority)}`}>
                      {getPriorityIcon(widget.priority)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{widget.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(widget.priority)}`}>
                          {widget.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {widget.actions?.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={action.onClick}
                      >
                        {action.label}
                      </Button>
                    ))}
                    
                    {widget.collapsible && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWidget(widget.id)}
                        className="p-1"
                      >
                        {expandedWidgets.has(widget.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {(!widget.collapsible || expandedWidgets.has(widget.id)) && (
                <CardContent className="pt-0">
                  {widget.content}
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Golden Path Wizard */}
      {showGoldenPath && (
        <GoldenPathWizard
          isOpen={showGoldenPath}
          onClose={() => setShowGoldenPath(false)}
          onComplete={() => {
            setShowGoldenPath(false);
            navigate('/therapist/clients');
          }}
        />
      )}

      {/* Task Creator */}
      {showTaskCreator && (
        <TaskCreator
          isOpen={showTaskCreator}
          onClose={() => setShowTaskCreator(false)}
          onComplete={() => setShowTaskCreator(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;