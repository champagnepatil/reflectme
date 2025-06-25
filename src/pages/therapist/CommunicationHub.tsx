import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  MessageSquare, 
  Video, 
  BookOpen, 
  Users, 
  Bell, 
  Phone,
  Mail,
  Lock,
  FileText,
  GraduationCap,
  HelpCircle,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Send,
  Download,
  Play,
  Award,
  Lightbulb,
  MessageCircle,
  Headphones,
  Calendar
} from 'lucide-react';
import * as Sentry from "@sentry/react";

const CommunicationHub: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('communication');

  // Track communication hub usage
  React.useEffect(() => {
    Sentry.addBreadcrumb({
      message: 'Therapist accessed Communication Hub',
      category: 'navigation',
      level: 'info'
    });
  }, []);

  const communicationModules = [
    {
      id: 'secure-comm',
      title: 'Secure Communication',
      description: 'HIPAA-compliant messaging, video calls, and emergency protocols',
      icon: Shield,
      href: '/therapist/secure-communication',
      color: 'bg-green-500',
      status: 'active',
      stats: { messages: 47, calls: 12, alerts: 2 },
      features: ['End-to-end encryption', 'Emergency protocols', 'Video conferencing', 'Session scheduling']
    },
    {
      id: 'training',
      title: 'Training & Support',
      description: 'Professional development, certification programs, and expert guidance',
      icon: GraduationCap,
      href: '/therapist/training-support',
      color: 'bg-blue-500',
      status: 'available',
      stats: { courses: 24, completed: 8, certificates: 3 },
      features: ['Interactive modules', 'Certification tracks', 'Expert webinars', 'Resource library']
    }
  ];

  const quickActions = [
    {
      title: 'Start Video Call',
      description: 'Begin secure video session with client',
      icon: Video,
      action: () => navigate('/therapist/secure-communication'),
      color: 'bg-blue-500'
    },
    {
      title: 'Send Secure Message',
      description: 'Send encrypted message to client',
      icon: MessageSquare,
      action: () => navigate('/therapist/secure-communication'),
      color: 'bg-green-500'
    },
    {
      title: 'Emergency Protocol',
      description: 'Access crisis intervention tools',
      icon: AlertTriangle,
      action: () => navigate('/therapist/secure-communication'),
      color: 'bg-red-500'
    },
    {
      title: 'Training Module',
      description: 'Continue learning program',
      icon: BookOpen,
      action: () => navigate('/therapist/training-support'),
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    {
      type: 'message',
      title: 'New Message from Sarah M.',
      description: 'Feeling much better after our last session. Thank you!',
      time: '10 minutes ago',
      priority: 'normal',
      encrypted: true
    },
    {
      type: 'training',
      title: 'Training Module Completed',
      description: 'Successfully completed "CBT Techniques for Anxiety"',
      time: '2 hours ago',
      priority: 'positive',
      points: 50
    },
    {
      type: 'alert',
      title: 'Emergency Protocol Activated',
      description: 'Client David K. triggered safety check protocol',
      time: '6 hours ago',
      priority: 'high',
      resolved: true
    },
    {
      type: 'certificate',
      title: 'Certification Earned',
      description: 'Trauma-Informed Care Specialist certification awarded',
      time: '1 day ago',
      priority: 'positive',
      badge: 'new'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Advanced EMDR Techniques',
      type: 'Webinar',
      date: 'Tomorrow, 2:00 PM',
      instructor: 'Dr. Emily Chen',
      duration: '90 min',
      ceu: 1.5
    },
    {
      title: 'Crisis Intervention Workshop',
      type: 'Training',
      date: 'Friday, 10:00 AM',
      instructor: 'Prof. Michael Rodriguez',
      duration: '3 hours',
      ceu: 3.0
    },
    {
      title: 'Peer Consultation Group',
      type: 'Meeting',
      date: 'Next Week Monday',
      instructor: 'Dr. Sarah Johnson',
      duration: '60 min',
      ceu: 1.0
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛡️ Communication & Support Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Secure communication tools, professional development resources, and support systems 
            to enhance your therapeutic practice and ensure client safety.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={action.action}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {communicationModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="bg-white/70 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center mr-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl font-bold">{module.title}</CardTitle>
                          <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                            {module.status}
                          </Badge>
                        </div>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(module.href)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Stats */}
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
                    <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
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
                    Access {module.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest communications, training progress, and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const priorityColors = {
                    high: 'border-red-200 bg-red-50',
                    normal: 'border-blue-200 bg-blue-50',
                    positive: 'border-green-200 bg-green-50'
                  };
                  
                  const typeIcons = {
                    message: MessageCircle,
                    training: GraduationCap,
                    alert: AlertTriangle,
                    certificate: Award
                  };
                  
                  const TypeIcon = typeIcons[activity.type as keyof typeof typeIcons];
                  
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${priorityColors[activity.priority as keyof typeof priorityColors]}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <TypeIcon className="w-5 h-5 mr-3 mt-0.5 text-gray-600" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{activity.title}</h4>
                              {'encrypted' in activity && activity.encrypted && (
                                <Lock className="w-3 h-3 text-green-600" />
                              )}
                              {'badge' in activity && activity.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {activity.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{activity.description}</p>
                            {'points' in activity && activity.points && (
                              <p className="text-xs text-green-600 mt-1">+{activity.points} points</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Upcoming Training Events
              </CardTitle>
              <CardDescription>
                Scheduled webinars, workshops, and professional development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-purple-700">{event.type} • {event.instructor}</p>
                      </div>
                      <Badge variant="outline">{event.ceu} CEU</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {event.date} • {event.duration}
                      </span>
                      <Button size="sm" variant="outline">
                        <Play className="w-3 h-3 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                View All Events
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Support Resources */}
        <Card className="mt-8 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <CardContent className="p-8">
            <div className="text-center">
              <Headphones className="w-12 h-12 mx-auto mb-4 text-purple-100" />
              <h3 className="text-2xl font-bold mb-2">24/7 Professional Support</h3>
              <p className="text-purple-100 mb-6">
                Need immediate assistance? Our expert support team is available around the clock
                for technical help, clinical guidance, and emergency protocols.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Center
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunicationHub; 