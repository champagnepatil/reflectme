import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Download, 
  Activity, 
  Cloud, 
  BarChart3, 
  FileText, 
  Brain, 
  Users, 
  Calendar,
  PieChart,
  LineChart,
  Target,
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import * as Sentry from "@sentry/react";

const AnalyticsHub: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('overview');

  // Track analytics hub usage
  React.useEffect(() => {
    Sentry.addBreadcrumb({
      message: 'Therapist accessed Analytics Hub',
      category: 'navigation',
      level: 'info'
    });
  }, []);

  const analyticsModules = [
    {
      id: 'monitoring',
      title: 'Client Monitoring',
      description: 'Track client progress, mood patterns, and engagement metrics',
      icon: Activity,
      href: '/therapist/monitoring',
      color: 'bg-blue-500',
      stats: { clients: 24, alerts: 3, trends: 'up' },
      features: ['Real-time monitoring', 'Mood tracking', 'Engagement alerts', 'Progress indicators']
    },
    {
      id: 'patterns',
      title: 'Pattern Analysis',
      description: 'Identify behavioral patterns and therapeutic insights across clients',
      icon: Cloud,
      href: '/therapist/patterns',
      color: 'bg-purple-500',
      stats: { patterns: 12, insights: 8, accuracy: '94%' },
      features: ['Behavioral patterns', 'Mood correlations', 'Treatment response', 'Risk indicators']
    },
    {
      id: 'predictive',
      title: 'Predictive Analytics',
      description: 'AI-powered predictions for client outcomes and intervention timing',
      icon: TrendingUp,
      href: '/therapist/predictive-analytics',
      color: 'bg-green-500',
      stats: { predictions: 18, accuracy: '87%', alerts: 5 },
      features: ['Outcome prediction', 'Crisis prevention', 'Treatment optimization', 'Risk assessment']
    },
    {
      id: 'reports',
      title: 'Custom Reports',
      description: 'Generate comprehensive reports for clients, sessions, and outcomes',
      icon: Download,
      href: '/therapist/custom-reports',
      color: 'bg-orange-500',
      stats: { reports: 156, formats: 3, automation: 'enabled' },
      features: ['PDF reports', 'Excel exports', 'Automated scheduling', 'Custom templates']
    }
  ];

  const quickStats = [
    { label: 'Active Clients', value: '24', change: '+2', icon: Users, color: 'text-blue-600' },
    { label: 'This Week Sessions', value: '47', change: '+8', icon: Calendar, color: 'text-green-600' },
    { label: 'Avg. Progress Score', value: '7.2', change: '+0.3', icon: Target, color: 'text-purple-600' },
    { label: 'Risk Alerts', value: '3', change: '-1', icon: AlertTriangle, color: 'text-orange-600' }
  ];

  const recentInsights = [
    {
      type: 'pattern',
      title: 'Anxiety Pattern Detected',
      description: 'Client Sarah M. shows consistent anxiety spikes on Monday mornings',
      priority: 'medium',
      time: '2 hours ago'
    },
    {
      type: 'progress',
      title: 'Significant Improvement',
      description: 'Client David K. achieved 3-week mood stability milestone',
      priority: 'positive',
      time: '5 hours ago'
    },
    {
      type: 'alert',
      title: 'Missed Check-in',
      description: 'Client Maria L. missed scheduled check-in for 48 hours',
      priority: 'high',
      time: '1 day ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Analytics & Reports Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive analytics, monitoring, and reporting tools to gain insights into client progress, 
            identify patterns, and optimize therapeutic outcomes.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white/70 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} from last week
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Analytics Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {analyticsModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center mr-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">{module.title}</CardTitle>
                        <CardDescription className="text-sm">{module.description}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(module.href)}
                      className="group-hover:bg-primary-50 group-hover:border-primary-300"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {Object.entries(module.stats).map(([key, value]) => (
                      <div key={key} className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-600 capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Key Features:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {module.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    className="w-full mt-4"
                    onClick={() => navigate(module.href)}
                  >
                    Open {module.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Insights */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2 text-purple-600" />
              Recent Analytics Insights
            </CardTitle>
            <CardDescription>
              Latest patterns, alerts, and discoveries from your client data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInsights.map((insight, index) => {
                const priorityColors = {
                  high: 'border-red-200 bg-red-50',
                  medium: 'border-orange-200 bg-orange-50',
                  positive: 'border-green-200 bg-green-50'
                };
                
                const priorityIcons = {
                  high: AlertTriangle,
                  medium: Clock,
                  positive: CheckCircle
                };
                
                const PriorityIcon = priorityIcons[insight.priority as keyof typeof priorityIcons];
                
                return (
                  <div key={index} className={`p-4 rounded-lg border ${priorityColors[insight.priority as keyof typeof priorityColors]}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <PriorityIcon className="w-5 h-5 mr-3 mt-0.5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-700">{insight.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{insight.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">Generate Report</h3>
                  <p className="text-blue-100 text-sm">Create custom analytics report</p>
                </div>
                <FileText className="w-8 h-8 text-blue-100" />
              </div>
              <Button 
                variant="secondary" 
                className="w-full mt-4"
                onClick={() => navigate('/therapist/custom-reports')}
              >
                Start Report
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">AI Analysis</h3>
                  <p className="text-green-100 text-sm">Run predictive analytics</p>
                </div>
                <Brain className="w-8 h-8 text-green-100" />
              </div>
              <Button 
                variant="secondary" 
                className="w-full mt-4"
                onClick={() => navigate('/therapist/predictive-analytics')}
              >
                Analyze Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">Monitor Clients</h3>
                  <p className="text-orange-100 text-sm">Check real-time status</p>
                </div>
                <Activity className="w-8 h-8 text-orange-100" />
              </div>
              <Button 
                variant="secondary" 
                className="w-full mt-4"
                onClick={() => navigate('/therapist/monitoring')}
              >
                View Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHub; 