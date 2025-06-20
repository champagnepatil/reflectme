import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTherapy } from '../../contexts/TherapyContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, BarChart2, FileText, ArrowRight, Users, UserCheck, AlertCircle, Plus, Target } from 'lucide-react';
import { TopicCloud } from '../../components/therapist/TopicCloud';
import { TaskCreator } from '../../components/therapist/TaskCreator';
import { AdherenceGauge } from '../../components/therapist/AdherenceGauge';

const Dashboard: React.FC = () => {
  const { clients } = useTherapy();
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [selectedClientForTask, setSelectedClientForTask] = useState<string>('');
  
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Therapist Dashboard</h1>
        <div className="flex items-center text-neutral-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Debug Info for Demo */}
      {clients.length === 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center text-warning-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">No clients loaded</span>
          </div>
          <p className="text-warning-600 text-sm mt-1">
            If you're using the demo account, please refresh the page or check the console for errors.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 mb-1">Active Clients</p>
              <h3 className="text-3xl font-bold text-neutral-900">{clients.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center">
              <UserCheck className="w-4 h-4 text-success-500 mr-2" />
              <span className="text-sm text-neutral-600">{clients.length} active this week</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 mb-1">Upcoming Sessions</p>
              <h3 className="text-3xl font-bold text-neutral-900">{upcomingSessions}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-primary-500 mr-2" />
              <span className="text-sm text-neutral-600">{todaySessions} sessions today</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 mb-1">Notes to Review</p>
              <h3 className="text-3xl font-bold text-neutral-900">{clients.reduce((sum, client) => sum + client.notes.length, 0)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-warning-500 mr-2" />
              <span className="text-sm text-neutral-600">Recent session notes</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mood Chart */}
      {moodData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Client Mood Trends</h2>
            <div className="flex items-center">
              <BarChart2 className="w-5 h-5 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-600">Aggregate Data</span>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={moodData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={[1, 5]} />
                <Tooltip 
                  formatter={(value) => [`Avg Mood: ${Number(value).toFixed(2)}`, 'Mood Score']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4A6FA5" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900">
                  {moodData.length > 0 
                    ? Number(moodData[moodData.length - 1].value).toFixed(1) 
                    : 'N/A'}
                </div>
                <div className="text-sm text-neutral-500">Current Avg</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-success-600">
                  +0.4
                </div>
                <div className="text-sm text-neutral-500">Weekly Change</div>
              </div>
            </div>
            
            <Link to="/therapist/analytics" className="btn btn-outline">
              View Detailed Reports
            </Link>
          </div>
        </motion.div>
      )}

      {/* AI-Powered Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Cloud - Overview of all clients */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <TopicCloud 
            timeRange="week"
            maxTags={15}
            className="h-full"
          />
        </motion.div>

        {/* Adherence Gauge for Demo Client */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <AdherenceGauge 
            clientId="demo-client-1"
            timeRange="month"
            showDetails={true}
            className="h-full"
          />
        </motion.div>
      </div>

              {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Quick Actions</h2>
          <div className="flex items-center">
            <Target className="w-5 h-5 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-600">Task Management</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSelectedClientForTask('demo-client-1');
              setShowTaskCreator(true);
            }}
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
          >
            <Plus className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-neutral-900">Create Task</div>
              <div className="text-sm text-neutral-500">for Demo Client 1</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              setSelectedClientForTask('demo-client-2');
              setShowTaskCreator(true);
            }}
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
          >
            <Plus className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-neutral-900">Create Task</div>
              <div className="text-sm text-neutral-500">for Demo Client 2</div>
            </div>
          </button>
          
          <Link
            to="/therapist/analytics"
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
          >
            <BarChart2 className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-neutral-900">Analytics AI</div>
              <div className="text-sm text-neutral-500">Advanced insights</div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Client List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="card overflow-hidden"
      >
        <div className="bg-white p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">Clients ({clients.length})</h2>
            <Link to="/therapist/case-histories" className="btn btn-ghost text-sm">
              View All
            </Link>
          </div>
        </div>
        
        {clients.length > 0 ? (
          <div className="divide-y divide-neutral-200">
            {clients.slice(0, 8).map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={`/therapist/client/${client.id}`}
                  className="flex items-center justify-between p-6 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img 
                        src={client.avatar} 
                        alt={client.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">{client.name}</h3>
                      <p className="text-sm text-neutral-500">
                        Last session: {new Date(client.lastSessionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-8 text-right">
                      <p className="text-sm text-neutral-700">Next Session</p>
                      <p className="font-medium text-neutral-900">
                        {new Date(client.nextSessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        client.mood >= 4
                          ? 'bg-success-500' 
                          : client.mood >= 3
                            ? 'bg-warning-500' 
                            : 'bg-error-500'
                      }`}></div>
                      <span className="text-sm font-medium mr-4">
                        {client.mood >= 4
                          ? 'Stable' 
                          : client.mood >= 3
                            ? 'Neutral' 
                            : 'Needs Attention'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {clients.length > 8 && (
              <div className="p-6 text-center">
                <Link to="/therapist/case-histories" className="btn btn-outline">
                  View All {clients.length} Clients
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Clients Found</h3>
            <p className="text-neutral-600">
              Your client list will appear here once you have active patients.
            </p>
          </div>
        )}
      </motion.div>

      {/* Task Creator Modal */}
      <TaskCreator
        isOpen={showTaskCreator}
        onClose={() => {
          setShowTaskCreator(false);
          setSelectedClientForTask('');
        }}
        clientId={selectedClientForTask}
        onTaskCreated={(task) => {
          console.log('✅ New task created:', task);
          // Qui si potrebbe aggiornare lo stato locale o ricaricare i dati
        }}
      />
    </div>
  );
};

export default Dashboard;