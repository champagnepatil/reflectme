import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, Clock, Calendar } from 'lucide-react';
import { useTherapy } from '../../contexts/TherapyContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
  const { clients } = useTherapy();
  
  // Aggregate client mood data
  const aggregateMoodData = () => {
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
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const moodData = aggregateMoodData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h1>
        <div className="flex items-center text-neutral-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 mb-1">Total Clients</p>
              <h3 className="text-3xl font-bold text-neutral-900">{clients.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center text-success-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">+12% this month</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 mb-1">Avg. Session Duration</p>
              <h3 className="text-3xl font-bold text-neutral-900">45m</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center text-neutral-600">
              <span className="text-sm">Consistent with last month</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 mb-1">Client Engagement</p>
              <h3 className="text-3xl font-bold text-neutral-900">89%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center text-success-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">+5% improvement</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 mb-1">Avg. Mood Score</p>
              <h3 className="text-3xl font-bold text-neutral-900">3.8</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center text-success-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">+0.4 points</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mood Trends */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Client Mood Trends</h2>
          <div className="flex items-center">
            <BarChart2 className="w-5 h-5 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-600">30-Day Overview</span>
          </div>
        </div>
        
        <div className="h-80">
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
      </motion.div>
    </div>
  );
};

export default Analytics;