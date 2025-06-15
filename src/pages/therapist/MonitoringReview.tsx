import React from 'react';
import { motion } from 'framer-motion';
import { TherapistMonitoringReview } from '../../components/monitoring/TherapistMonitoringReview';
import { BarChart3, Users, TrendingUp, Calendar } from 'lucide-react';
import { useTherapy } from '../../contexts/TherapyContext';

const MonitoringReview: React.FC = () => {
  const { clients } = useTherapy();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 mb-1">Active Clients</p>
              <h3 className="text-2xl font-bold text-neutral-900">{clients.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <span className="text-sm text-neutral-600">Monitoring wellness</span>
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
              <p className="text-neutral-500 mb-1">Avg Compliance</p>
              <h3 className="text-2xl font-bold text-success-600">87%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-success-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center text-success-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">+5% this month</span>
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
              <p className="text-neutral-500 mb-1">Check-ins Today</p>
              <h3 className="text-2xl font-bold text-primary-600">8</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <span className="text-sm text-neutral-600">4 pending review</span>
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
              <p className="text-neutral-500 mb-1">Avg Wellness</p>
              <h3 className="text-2xl font-bold text-warning-600">6.8/10</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-warning-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <span className="text-sm text-neutral-600">Across all clients</span>
          </div>
        </motion.div>
      </div>

      {/* Main Review Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <TherapistMonitoringReview />
      </motion.div>
    </div>
  );
};

export default MonitoringReview;