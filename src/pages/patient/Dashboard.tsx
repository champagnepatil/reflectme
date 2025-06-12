import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTherapy } from '../../contexts/TherapyContext';
import { useAuth } from '../../contexts/AuthContext';
import { SpeechJournalMood } from '../../components/SpeechJournalMood';
import { Calendar, ArrowUp, ArrowDown, BookOpen, MessageSquare, Bell } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { journalEntries, chatHistory, addJournalEntry } = useTherapy();
  const { user } = useAuth();
  
  // Prepare mood data for chart
  const moodData = journalEntries.map(entry => ({
    date: entry.date,
    mood: entry.mood
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate mood change
  const moodChange = moodData.length >= 2 
    ? moodData[moodData.length - 1].mood - moodData[0].mood 
    : 0;
  
  // Get latest chat message
  const latestChat = chatHistory.length > 0 
    ? chatHistory[chatHistory.length - 1] 
    : null;

  const handleVoiceJournalUpdate = (data: { journal: string; mood: number }) => {
    if (data.journal && data.mood > 0) {
      addJournalEntry({
        date: new Date().toISOString().split('T')[0],
        mood: data.mood,
        content: data.journal,
        tags: ['voice-recorded'],
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Your Dashboard</h1>
        <div className="flex items-center text-neutral-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Voice Journal Interface */}
      {user?.role === 'patient' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SpeechJournalMood 
            onDataUpdate={handleVoiceJournalUpdate}
            className="mb-6"
          />
        </motion.div>
      )}

      {/* Mood Tracker */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Mood Tracking</h2>
          <div className="flex items-center">
            <span className={`flex items-center text-sm font-medium ${
              moodChange > 0 ? 'text-success-600' : moodChange < 0 ? 'text-error-600' : 'text-neutral-500'
            }`}>
              {moodChange > 0 ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : moodChange < 0 ? (
                <ArrowDown className="w-4 h-4 mr-1" />
              ) : null}
              {Math.abs(moodChange).toFixed(1)} points {moodChange > 0 ? 'improvement' : moodChange < 0 ? 'decrease' : 'no change'}
            </span>
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
                formatter={(value) => [`Mood: ${value}`, 'Mood Score']}
                labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#4A6FA5" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">
                {moodData.length > 0 
                  ? moodData[moodData.length - 1].mood.toFixed(1) 
                  : 'N/A'}
              </div>
              <div className="text-sm text-neutral-500">Current Mood</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">
                {moodData.length > 0 
                  ? (moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length).toFixed(1) 
                  : 'N/A'}
              </div>
              <div className="text-sm text-neutral-500">Average Mood</div>
            </div>
          </div>
          
          <button className="btn btn-outline">
            View Trends
          </button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Journal Entries</h2>
            <BookOpen className="w-5 h-5 text-primary-600" />
          </div>
          
          {journalEntries.length > 0 ? (
            <div className="space-y-4">
              {journalEntries.slice(0, 3).map(entry => (
                <div key={entry.id} className="p-3 bg-neutral-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-900">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Mood: {entry.mood}/5
                    </span>
                  </div>
                  <p className="text-neutral-700 text-sm line-clamp-2">
                    {entry.content}
                  </p>
                  <div className="flex mt-2 flex-wrap gap-1">
                    {entry.tags.map((tag, index) => (
                      <span key={index} className="inline-block px-2 py-1 text-xs bg-neutral-200 text-neutral-700 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              
              <button className="w-full p-2 text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All Journal Entries
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No journal entries yet</p>
              <p className="text-sm text-neutral-400 mt-2">Use the voice journal above to get started</p>
            </div>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Your Companion</h2>
            <MessageSquare className="w-5 h-5 text-primary-600" />
          </div>
          
          {latestChat ? (
            <div>
              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <p className="text-primary-800 mb-2 font-medium">Recent Conversation</p>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="bg-white rounded-lg p-3 text-sm text-neutral-800 shadow-sm max-w-[80%]">
                      {chatHistory[chatHistory.length - 2]?.content || "How are you feeling today?"}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary-100 rounded-lg p-3 text-sm text-primary-900 shadow-sm max-w-[80%]">
                      {latestChat.content}
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full btn btn-primary">
                Continue Conversation
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No conversations yet</p>
              <button className="mt-4 btn btn-primary">Start Chatting</button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Upcoming & Reminders */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Reminders & Upcoming</h2>
          <Bell className="w-5 h-5 text-primary-600" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-primary-50 rounded-lg border-l-4 border-primary-600">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-4">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-primary-900">Therapy Session</p>
              <p className="text-sm text-primary-700">Tomorrow at 2:00 PM with Dr. Williams</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mr-4">
              <Bell className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">Daily Voice Journal</p>
              <p className="text-sm text-neutral-600">Record your thoughts and mood</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mr-4">
              <BookOpen className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">Evening Reflection</p>
              <p className="text-sm text-neutral-600">Daily reminder at 8:00 PM</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;