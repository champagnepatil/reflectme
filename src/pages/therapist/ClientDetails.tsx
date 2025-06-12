import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTherapy } from '../../contexts/TherapyContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, FileText, PlusCircle, MessageSquare, BarChart2, Award, ChevronRight, Clock, Mic } from 'lucide-react';

const ClientDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { getClient, addNote, addCopingStrategy } = useTherapy();
  const client = getClient(clientId || '');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'coping'>('overview');
  
  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-neutral-900">Client not found</h2>
        <Link to="/therapist" className="btn btn-primary mt-4">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
            <img 
              src={client.avatar} 
              alt={client.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{client.name}</h1>
            <p className="text-neutral-500">{client.email}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link to={`/therapist/client/${client.id}/session-recap`} className="btn btn-outline">
            <Mic className="w-4 h-4 mr-2" />
            Dictate 60-sec Recap
          </Link>
          <Link to={`/therapist/notes/${client.id}`} className="btn btn-outline">
            <FileText className="w-4 h-4 mr-2" />
            Add Note
          </Link>
          <button className="btn btn-primary">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'notes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Notes ({client.notes.length})
          </button>
          
          <button
            onClick={() => setActiveTab('coping')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'coping'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Coping Strategies ({client.copingStrategies.length})
          </button>
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
              transition={{ duration: 0.4 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-neutral-500 mb-1">Next Session</p>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {new Date(client.nextSessionDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-primary-500 mr-2" />
                  <span className="text-sm text-neutral-600">2:00 PM (45 min)</span>
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
                  <p className="text-neutral-500 mb-1">Current Mood</p>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {client.mood === 'good' 
                      ? 'Stable / Positive' 
                      : client.mood === 'neutral' 
                        ? 'Neutral' 
                        : 'Needs Attention'}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  client.mood === 'good' 
                    ? 'bg-success-100' 
                    : client.mood === 'neutral' 
                      ? 'bg-warning-100' 
                      : 'bg-error-100'
                }`}>
                  <span className="text-xl">
                    {client.mood === 'good' 
                      ? '😊' 
                      : client.mood === 'neutral' 
                        ? '😐' 
                        : '😔'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center">
                  <BarChart2 className="w-4 h-4 text-primary-500 mr-2" />
                  <span className="text-sm text-neutral-600">
                    {client.mood === 'good' 
                      ? '+0.5 since last week' 
                      : client.mood === 'neutral' 
                        ? 'Stable over last week' 
                        : '-0.8 since last week'}
                  </span>
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
                  <p className="text-neutral-500 mb-1">Digital Twin Activity</p>
                  <h3 className="text-lg font-bold text-neutral-900">High</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-success-500 mr-2" />
                  <span className="text-sm text-neutral-600">Used coping tools 8 times</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mood Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">Mood Tracking</h2>
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-600">30-Day History</span>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={client.moodHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis domain={[1, 5]} />
                  <Tooltip 
                    formatter={(value) => [`Mood: ${value}`, 'Mood Score']}
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
          </motion.div>

          {/* Triggers */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Identified Triggers</h2>
            
            <div className="flex flex-wrap gap-3">
              {client.triggers.map((trigger, index) => (
                <div 
                  key={index}
                  className="bg-neutral-100 text-neutral-800 px-4 py-2 rounded-full"
                >
                  {trigger}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Notes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="card overflow-hidden"
          >
            <div className="bg-white p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900">Recent Notes</h2>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className="btn btn-ghost text-sm"
                >
                  View All
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-neutral-200">
              {client.notes.slice(0, 2).map(note => (
                <div key={note.id} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-neutral-900">{note.title}</h3>
                    <span className="text-sm text-neutral-500">
                      {new Date(note.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-700 line-clamp-2 mb-3">
                    {note.content}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <span key={index} className="inline-block px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex justify-end space-x-3">
            <Link to={`/therapist/client/${client.id}/session-recap`} className="btn btn-outline">
              <Mic className="w-4 h-4 mr-2" />
              Dictate Recap
            </Link>
            <Link to={`/therapist/notes/${client.id}`} className="btn btn-primary">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Note
            </Link>
          </div>
          
          {client.notes.length > 0 ? (
            <div className="space-y-6">
              {client.notes.map(note => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-neutral-900">{note.title}</h3>
                    <span className="text-sm text-neutral-500">
                      {new Date(note.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-neutral-700 whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <div key={index} className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">No Notes Yet</h2>
              <p className="text-neutral-600 mb-6">
                Create your first note to start building this client's digital twin.
              </p>
              <div className="flex justify-center space-x-3">
                <Link to={`/therapist/client/${client.id}/session-recap`} className="btn btn-outline">
                  <Mic className="w-4 h-4 mr-2" />
                  Dictate Recap
                </Link>
                <Link to={`/therapist/notes/${client.id}`} className="btn btn-primary">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create First Note
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'coping' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button className="btn btn-primary">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Strategy
            </button>
          </div>
          
          {client.copingStrategies.length > 0 ? (
            <div className="space-y-6">
              {client.copingStrategies.map(strategy => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card overflow-hidden"
                >
                  <div className="bg-white p-6 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-neutral-900">{strategy.title}</h3>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">Effectiveness:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg 
                              key={star}
                              className={`w-5 h-5 ${
                                star <= strategy.effectiveness ? 'text-yellow-400' : 'text-neutral-300'
                              }`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-neutral-700 mb-6">{strategy.description}</p>
                    
                    <h4 className="font-medium text-neutral-900 mb-3">Steps:</h4>
                    <ol className="list-decimal pl-5 mb-6 space-y-2">
                      {strategy.steps.map((step, index) => (
                        <li key={index} className="text-neutral-700">{step}</li>
                      ))}
                    </ol>
                    
                    <div className="flex flex-wrap gap-2">
                      {strategy.tags.map((tag, index) => (
                        <div key={index} className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Award className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">No Coping Strategies Yet</h2>
              <p className="text-neutral-600 mb-6">
                Add personalized coping strategies to help this client between sessions.
              </p>
              <button className="btn btn-primary mx-auto">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add First Strategy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Access */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link 
            to={`/therapist/client/${client.id}/session-recap`}
            className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <span>Dictate Session Recap</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </Link>
          
          <button className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            <span>Schedule Next Session</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
          
          <button className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            <span>Send Resource Materials</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
          
          <button className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            <span>View Chat History</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;