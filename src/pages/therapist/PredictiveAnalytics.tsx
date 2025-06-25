import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterPlot } from 'recharts';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Clock,
  Users,
  Calendar,
  Shield,
  Activity,
  Heart,
  Eye,
  Filter,
  Download,
  Settings,
  Bell,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

interface RiskAlert {
  id: string;
  clientId: string;
  clientName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskType: 'mood_decline' | 'treatment_adherence' | 'crisis_indicator' | 'engagement_drop' | 'relapse_risk';
  confidence: number;
  description: string;
  predictedOutcome: string;
  recommendedActions: string[];
  timeframe: string;
  lastUpdated: string;
  acknowledged: boolean;
}

interface PredictiveMetric {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  prediction: number;
  accuracy: number;
  description: string;
}

interface PatternInsight {
  id: string;
  title: string;
  description: string;
  affectedClients: number;
  confidence: number;
  category: 'behavioral' | 'temporal' | 'emotional' | 'treatment';
  actionable: boolean;
  insights: string[];
}

const PredictiveAnalytics: React.FC = () => {
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [predictiveMetrics, setPredictiveMetrics] = useState<PredictiveMetric[]>([]);
  const [patternInsights, setPatternInsights] = useState<PatternInsight[]>([]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7_days');

  const mockRiskAlerts: RiskAlert[] = [
    {
      id: '1',
      clientId: 'client_1',
      clientName: 'Sarah Johnson',
      riskLevel: 'high',
      riskType: 'mood_decline',
      confidence: 87,
      description: 'Significant mood pattern decline detected with 87% confidence',
      predictedOutcome: 'Potential depressive episode within 5-7 days',
      recommendedActions: [
        'Schedule immediate check-in session',
        'Review current medication effectiveness',
        'Activate crisis intervention protocol',
        'Increase monitoring frequency'
      ],
      timeframe: '5-7 days',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      acknowledged: false
    },
    {
      id: '2',
      clientId: 'client_2',
      clientName: 'Michael Chen',
      riskLevel: 'medium',
      riskType: 'treatment_adherence',
      confidence: 73,
      description: 'Declining engagement with treatment activities',
      predictedOutcome: 'Treatment non-compliance within 2 weeks',
      recommendedActions: [
        'Discuss barriers to treatment',
        'Adjust treatment plan complexity',
        'Implement reminder system',
        'Schedule motivational interview'
      ],
      timeframe: '10-14 days',
      lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      acknowledged: true
    },
    {
      id: '3',
      clientId: 'client_3',
      clientName: 'Emily Davis',
      riskLevel: 'critical',
      riskType: 'crisis_indicator',
      confidence: 92,
      description: 'Multiple crisis indicators detected in recent activity',
      predictedOutcome: 'High risk of self-harm within 24-48 hours',
      recommendedActions: [
        'IMMEDIATE INTERVENTION REQUIRED',
        'Contact emergency services if needed',
        'Schedule emergency session',
        'Activate safety planning protocol',
        'Contact emergency contacts'
      ],
      timeframe: '24-48 hours',
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      acknowledged: false
    }
  ];

  const mockPredictiveMetrics: PredictiveMetric[] = [
    {
      id: '1',
      name: 'Treatment Success Rate',
      value: 78,
      trend: 'up',
      prediction: 82,
      accuracy: 89,
      description: 'Percentage of clients achieving treatment goals'
    },
    {
      id: '2',
      name: 'Crisis Prevention',
      value: 94,
      trend: 'stable',
      prediction: 95,
      accuracy: 91,
      description: 'Successful early intervention rate'
    },
    {
      id: '3',
      name: 'Engagement Rate',
      value: 71,
      trend: 'down',
      prediction: 68,
      accuracy: 85,
      description: 'Client participation in treatment activities'
    },
    {
      id: '4',
      name: 'Relapse Risk',
      value: 23,
      trend: 'down',
      prediction: 19,
      accuracy: 88,
      description: 'Predicted probability of symptom relapse'
    }
  ];

  const mockPatternInsights: PatternInsight[] = [
    {
      id: '1',
      title: 'Weekend Mood Patterns',
      description: 'Clients show 23% higher mood instability on weekends',
      affectedClients: 8,
      confidence: 84,
      category: 'temporal',
      actionable: true,
      insights: [
        'Weekend sessions may be beneficial for high-risk clients',
        'Consider weekend check-in protocols',
        'Develop weekend coping strategies'
      ]
    },
    {
      id: '2',
      title: 'Sleep-Mood Correlation',
      description: 'Strong correlation between sleep quality and next-day mood scores',
      affectedClients: 12,
      confidence: 91,
      category: 'behavioral',
      actionable: true,
      insights: [
        'Sleep hygiene interventions show high ROI',
        'Monitor sleep patterns more closely',
        'Integrate sleep tracking in treatment plans'
      ]
    },
    {
      id: '3',
      title: 'Therapy Session Timing',
      description: 'Morning sessions show 15% better engagement rates',
      affectedClients: 6,
      confidence: 76,
      category: 'temporal',
      actionable: true,
      insights: [
        'Consider shifting sessions to morning hours',
        'Account for chronotype in scheduling',
        'Monitor energy levels throughout day'
      ]
    }
  ];

  useEffect(() => {
    setRiskAlerts(mockRiskAlerts);
    setPredictiveMetrics(mockPredictiveMetrics);
    setPatternInsights(mockPatternInsights);
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    setRiskAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'mood_decline': return TrendingDown;
      case 'treatment_adherence': return Target;
      case 'crisis_indicator': return AlertTriangle;
      case 'engagement_drop': return Users;
      case 'relapse_risk': return Activity;
      default: return AlertTriangle;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'behavioral': return 'bg-blue-100 text-blue-800';
      case 'temporal': return 'bg-purple-100 text-purple-800';
      case 'emotional': return 'bg-pink-100 text-pink-800';
      case 'treatment': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = riskAlerts.filter(alert => {
    if (selectedRiskLevel === 'all') return true;
    return alert.riskLevel === selectedRiskLevel;
  });

  const unacknowledgedAlerts = riskAlerts.filter(alert => !alert.acknowledged).length;

  // Mock trend data for charts
  const trendData = [
    { name: 'Week 1', riskScore: 24, engagement: 78, mood: 6.2 },
    { name: 'Week 2', riskScore: 28, engagement: 75, mood: 5.8 },
    { name: 'Week 3', riskScore: 22, engagement: 82, mood: 6.5 },
    { name: 'Week 4', riskScore: 19, engagement: 85, mood: 6.8 },
    { name: 'This Week', riskScore: 16, engagement: 87, mood: 7.1 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-purple-600" />
            Predictive Analytics
          </h1>
          <p className="text-gray-600 mt-1">AI-powered insights and risk assessment for proactive care</p>
        </div>
        
        {/* Alert Summary */}
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
            <div className="flex items-center space-x-2">
              <Bell className={`w-5 h-5 ${unacknowledgedAlerts > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900">{unacknowledgedAlerts}</span>
              <span className="text-gray-600 text-sm">New Alerts</span>
            </div>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Predictive Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {predictiveMetrics.map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend);
          return (
            <div key={metric.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{metric.name}</h3>
                <TrendIcon className={`w-5 h-5 ${
                  metric.trend === 'up' ? 'text-green-500' : 
                  metric.trend === 'down' ? 'text-red-500' : 
                  'text-gray-500'
                }`} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-900">{metric.value}%</span>
                  <span className="text-sm text-gray-600">
                    Pred: {metric.prediction}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{metric.description}</span>
                  <span>{metric.accuracy}% accurate</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Trends Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Risk & Engagement Trends</h2>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7_days">Last 7 days</option>
              <option value="30_days">Last 30 days</option>
              <option value="90_days">Last 90 days</option>
            </select>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={3} name="Risk Score" />
            <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={3} name="Engagement %" />
            <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} name="Avg Mood" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Alerts */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Risk Alerts</h2>
            <div className="flex items-center space-x-2">
              <select
                value={selectedRiskLevel}
                onChange={(e) => setSelectedRiskLevel(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAlerts.map((alert) => {
            const RiskIcon = getRiskIcon(alert.riskType);
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 ${!alert.acknowledged ? 'bg-red-25' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${getRiskColor(alert.riskLevel)}`}>
                    <RiskIcon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{alert.clientName}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(alert.riskLevel)}`}>
                          {alert.riskLevel.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {alert.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 mb-2">{alert.description}</p>
                    <p className="text-gray-600 text-sm mb-3">
                      <strong>Predicted:</strong> {alert.predictedOutcome}
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <h4 className="font-medium text-gray-900 text-sm mb-2">Recommended Actions:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {alert.recommendedActions.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          <Clock className="w-4 h-4 inline mr-1" />
                          {alert.timeframe}
                        </span>
                        <span>
                          Updated {new Date(alert.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pattern Insights */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pattern Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {patternInsights.map((insight) => (
            <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{insight.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(insight.category)}`}>
                  {insight.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
              
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-gray-500">
                  <Users className="w-4 h-4 inline mr-1" />
                  {insight.affectedClients} clients
                </span>
                <span className="text-gray-500">
                  {insight.confidence}% confidence
                </span>
              </div>
              
              {insight.actionable && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 text-sm mb-2">Actionable Insights:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {insight.insights.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics; 