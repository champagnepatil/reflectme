import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Target, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useReflectMe } from '../contexts/ReflectMeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SessionRecaps: React.FC = () => {
  const { sessionRecaps, getProgressData } = useReflectMe();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  const progressData = getProgressData();

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1: return '😔';
      case 2: return '🙁';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😊';
      default: return '😐';
    }
  };

  const getMoodLabel = (mood: number) => {
    switch (mood) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'Neutral';
      case 4: return 'Good';
      case 5: return 'Very Good';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Session Recaps & Insights</h1>
          <p className="text-slate-600">Track your therapy progress and key takeaways</p>
        </div>

        {/* Progress Toggle */}
        <div className="mb-8">
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            <span className="font-medium">View Progress Chart</span>
            {showProgress ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </button>
        </div>

        {/* Progress Chart */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white rounded-xl border border-slate-200 p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Mood Progress Over Time</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
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
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Session Recaps */}
        <div className="space-y-6">
          {sessionRecaps.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Session Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{session.title}</h3>
                      <p className="text-sm text-slate-600">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Mood Change */}
                  {session.moodBefore && session.moodAfter && (
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl">{getMoodEmoji(session.moodBefore)}</div>
                        <div className="text-xs text-slate-500">Before</div>
                      </div>
                      <div className="text-slate-400">→</div>
                      <div className="text-center">
                        <div className="text-2xl">{getMoodEmoji(session.moodAfter)}</div>
                        <div className="text-xs text-slate-500">After</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Content */}
              <div className="p-6">
                {/* Key Takeaways */}
                <div className="mb-6">
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                    Key Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {session.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-slate-700">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expandable Content */}
                <button
                  onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  {expandedSession === session.id ? 'Show Less' : 'Show More Details'}
                  {expandedSession === session.id ? 
                    <ChevronUp className="w-4 h-4 ml-1" /> : 
                    <ChevronDown className="w-4 h-4 ml-1" />
                  }
                </button>

                {expandedSession === session.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-6"
                  >
                    {/* Therapist Suggestions */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-green-500" />
                        Therapist Suggestions
                      </h4>
                      <ul className="space-y-2">
                        {session.therapistSuggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-slate-700">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Items */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-purple-500" />
                        Action Items
                      </h4>
                      <ul className="space-y-2">
                        {session.actionItems.map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {sessionRecaps.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No session recaps yet</h3>
            <p className="text-slate-600">Your therapy session summaries will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionRecaps;