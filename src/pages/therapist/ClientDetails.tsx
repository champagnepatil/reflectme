import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTherapy } from '../../contexts/TherapyContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, FileText, PlusCircle, MessageSquare, BarChart2, Award, ChevronRight, Clock, Mic, User, TrendingUp } from 'lucide-react';
import { getClientDisplayName, getClientEmail, normalizeClientId } from '../../utils/clientUtils';

// Demo trend data generator
const generateTrendData = (clientId: string) => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const baseData = {
    'f229bd3a-f1a5-4b05-9b25-f1330c03db09': { mood: 6, anxiety: 4, depression: 3, sleep: 7 }, // Sarah Mitchell
    '00000000-0000-4000-b000-000000000002': { mood: 5, anxiety: 6, depression: 5, sleep: 6 }, // John Thompson
    '00000000-0000-4000-b000-000000000003': { mood: 3, anxiety: 8, depression: 7, sleep: 4 }, // Emily Rodriguez
    '00000000-0000-4000-b000-000000000004': { mood: 7, anxiety: 3, depression: 2, sleep: 8 }, // Michael Chen
  };
  
  const normalizedId = normalizeClientId(clientId);
  const base = baseData[normalizedId] || baseData['f229bd3a-f1a5-4b05-9b25-f1330c03db09'];
  
  return weeks.map((week, index) => ({
    week,
    mood: Math.max(1, Math.min(10, base.mood + (Math.random() - 0.5) * 2)),
    anxiety: Math.max(1, Math.min(10, base.anxiety + (Math.random() - 0.5) * 2)),
    depression: Math.max(1, Math.min(10, base.depression + (Math.random() - 0.5) * 2)),
    sleep: Math.max(1, Math.min(10, base.sleep + (Math.random() - 0.5) * 1)),
  }));
};

const ClientDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { getClient, addNote, addCopingStrategy } = useTherapy();
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'notes'>('overview');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [clientInfo, setClientInfo] = useState<any>(null);
  
  useEffect(() => {
    if (clientId) {
      // Generate demo client info
      const normalizedId = normalizeClientId(clientId);
      const displayName = getClientDisplayName(clientId);
      const email = getClientEmail(normalizedId);
      
      setClientInfo({
        id: normalizedId,
        name: displayName,
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
        nextSessionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        mood: normalizedId === '00000000-0000-4000-b000-000000000003' ? 'poor' : 
              normalizedId === 'f229bd3a-f1a5-4b05-9b25-f1330c03db09' ? 'good' : 'neutral',
        lastActivity: new Date(),
        notes: [],
        copingStrategies: []
      });
      
      setTrendData(generateTrendData(clientId));
    }
  }, [clientId]);
  
  if (!clientInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden mr-4 bg-blue-100 flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clientInfo.name}</h1>
            <p className="text-gray-500">{clientInfo.email}</p>
            <p className="text-sm text-blue-600">ID: {clientInfo.id.substring(0, 8)}...</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link to={`/assessment/${clientId}?scale=phq9`} className="btn btn-outline">
            <FileText className="w-4 h-4 mr-2" />
            New Assessment
          </Link>
          <button className="btn btn-primary">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {['overview', 'trends', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 text-sm font-medium border-b-2 capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 mb-1">Next Session</p>
                  <h3 className="text-lg font-bold text-gray-900">
                    {clientInfo.nextSessionDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">2:00 PM (45 min)</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 mb-1">Current Status</p>
                  <h3 className="text-lg font-bold text-gray-900">
                    {clientInfo.mood === 'good' 
                      ? 'Stable / Improving' 
                      : clientInfo.mood === 'neutral' 
                        ? 'Stable' 
                        : 'Needs Attention'}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  clientInfo.mood === 'good' 
                    ? 'bg-green-100' 
                    : clientInfo.mood === 'neutral' 
                      ? 'bg-yellow-100' 
                      : 'bg-red-100'
                }`}>
                  <span className="text-xl">
                    {clientInfo.mood === 'good' 
                      ? '😊' 
                      : clientInfo.mood === 'neutral' 
                        ? '😐' 
                        : '😔'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {clientInfo.mood === 'good' 
                      ? 'Improving trend' 
                      : clientInfo.mood === 'neutral' 
                        ? 'Stable trend' 
                        : 'Declining trend'}
                  </span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 mb-1">Assessment Activity</p>
                  <h3 className="text-lg font-bold text-gray-900">Active</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">3 assessments this month</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Trends</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mood & Anxiety Chart */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Mood & Anxiety Levels</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} name="Mood" />
                    <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" strokeWidth={2} name="Anxiety" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Depression & Sleep Chart */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Depression & Sleep Quality</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="depression" fill="#ef4444" name="Depression" />
                    <Bar dataKey="sleep" fill="#6366f1" name="Sleep Quality" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Assessment History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assessments</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">PHQ-9 Depression Scale</p>
                  <p className="text-sm text-gray-600">Completed 2 days ago</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Score: 9</p>
                  <p className="text-sm text-yellow-600">Mild</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">GAD-7 Anxiety Scale</p>
                  <p className="text-sm text-gray-600">Completed 1 week ago</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Score: 12</p>
                  <p className="text-sm text-orange-600">Moderate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Session Notes</h3>
            <button className="btn btn-primary">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Note
            </button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No notes available yet.</p>
            <p className="text-sm">Add your first session note to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetails;