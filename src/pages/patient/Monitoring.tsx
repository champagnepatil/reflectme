import React from 'react';
import { motion } from 'framer-motion';
import { PatientMonitoringForm } from '../../components/monitoring/PatientMonitoringForm';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

const Monitoring: React.FC = () => {
  const handleSubmitSuccess = () => {
    // Could trigger a refresh of monitoring data or show additional feedback
    console.log('Monitoring form submitted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Wellness Monitoring</h1>
          <p className="text-neutral-600 mt-1">
            Track your daily wellness activities to help your therapist understand your progress
          </p>
        </div>
        <div className="flex items-center text-neutral-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 mb-1">Daily Check-ins</p>
              <h3 className="text-2xl font-bold text-neutral-900">7</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center text-success-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">This week</span>
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
              <p className="text-neutral-500 mb-1">Average Wellness</p>
              <h3 className="text-2xl font-bold text-success-600">7.2/10</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-success-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center text-success-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">+0.8 from last week</span>
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
              <p className="text-neutral-500 mb-1">Streak</p>
              <h3 className="text-2xl font-bold text-warning-600">5 days</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-warning-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <span className="text-sm text-neutral-600">Keep it up!</span>
          </div>
        </motion.div>
      </div>

      {/* Monitoring Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PatientMonitoringForm 
          onSubmitSuccess={handleSubmitSuccess}
        />
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6 bg-primary-50 border-primary-200"
      >
        <h3 className="font-medium text-primary-900 mb-3">How Wellness Monitoring Helps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-800">
          <div>
            <h4 className="font-medium mb-2">For You:</h4>
            <ul className="space-y-1">
              <li>• Track daily wellness patterns</li>
              <li>• Identify what activities improve your mood</li>
              <li>• Build healthy habits consistently</li>
              <li>• Monitor progress over time</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">For Your Therapist:</h4>
            <ul className="space-y-1">
              <li>• Understand your daily wellness patterns</li>
              <li>• Adjust treatment plans based on real data</li>
              <li>• Identify triggers and positive influences</li>
              <li>• Provide more personalized support</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Monitoring;