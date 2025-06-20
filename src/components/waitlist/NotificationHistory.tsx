import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Gift, Calendar, X } from 'lucide-react';
import NotificationService from '../../services/NotificationService';

interface NotificationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    email: string;
    message: string;
    timestamp: Date;
    type: 'welcome' | 'update' | 'launch' | 'reminder';
  }>>([]);

  useEffect(() => {
    if (isOpen) {
      setNotifications(NotificationService.getNotificationHistory());
    }
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'update':
        return <Mail className="w-5 h-5 text-green-500" />;
      case 'launch':
        return <Gift className="w-5 h-5 text-purple-500" />;
      case 'reminder':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'bg-blue-50 border-blue-200';
      case 'update':
        return 'bg-green-50 border-green-200';
      case 'launch':
        return 'bg-purple-50 border-purple-200';
      case 'reminder':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mr-4">
                <Bell className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Notification History</h3>
                <p className="text-gray-600">Your ReflectMe waitlist updates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No notifications yet</p>
              <p className="text-gray-400 text-sm">Join the waitlist to start receiving updates!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 capitalize">
                          {notification.type} Notification
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Sent to: {notification.email}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Total subscribers: <span className="font-semibold">{NotificationService.getSubscriberCount()}</span>
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Welcome
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Updates
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Launch
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Reminders
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationHistory; 