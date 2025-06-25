import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bell, 
  Calendar, 
  Shield, 
  Wifi, 
  Clock, 
  Users, 
  Brain,
  Settings,
  Save,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Toggle,
  Mail,
  Phone,
  Monitor
} from 'lucide-react';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  category: 'alerts' | 'reminders' | 'reports' | 'communication';
  enabled: boolean;
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
  priority: 'low' | 'medium' | 'high';
}

interface IntegrationSetting {
  id: string;
  name: string;
  description: string;
  provider: string;
  connected: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: string;
  settings?: Record<string, any>;
}

interface WorkloadSetting {
  id: string;
  name: string;
  description: string;
  value: number | boolean;
  type: 'number' | 'boolean' | 'time' | 'select';
  options?: string[];
  unit?: string;
  min?: number;
  max?: number;
}

const TherapistSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'integrations' | 'workload' | 'privacy'>('notifications');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSetting[]>([]);
  const [workloadSettings, setWorkloadSettings] = useState<WorkloadSetting[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const mockNotificationSettings: NotificationSetting[] = [
    {
      id: '1',
      name: 'Crisis Alerts',
      description: 'Immediate notifications for high-risk client situations',
      category: 'alerts',
      enabled: true,
      channels: ['email', 'sms', 'push', 'in-app'],
      priority: 'high'
    },
    {
      id: '2',
      name: 'Mood Drop Alerts',
      description: 'Notifications when clients report significant mood decline',
      category: 'alerts',
      enabled: true,
      channels: ['email', 'in-app'],
      priority: 'high'
    },
    {
      id: '3',
      name: 'Missed Appointment Alerts',
      description: 'Alerts when clients miss scheduled appointments',
      category: 'reminders',
      enabled: true,
      channels: ['email', 'in-app'],
      priority: 'medium'
    },
    {
      id: '4',
      name: 'Treatment Non-Adherence',
      description: 'Notifications for clients not completing assigned tasks',
      category: 'alerts',
      enabled: true,
      channels: ['in-app'],
      priority: 'medium'
    },
    {
      id: '5',
      name: 'Session Reminders',
      description: 'Reminders for upcoming client sessions',
      category: 'reminders',
      enabled: true,
      channels: ['email', 'push'],
      priority: 'medium'
    },
    {
      id: '6',
      name: 'Weekly Progress Reports',
      description: 'Automated weekly summary of client progress',
      category: 'reports',
      enabled: false,
      channels: ['email'],
      priority: 'low'
    },
    {
      id: '7',
      name: 'New Messages',
      description: 'Notifications for new secure messages from clients',
      category: 'communication',
      enabled: true,
      channels: ['email', 'push', 'in-app'],
      priority: 'medium'
    }
  ];

  const mockIntegrationSettings: IntegrationSetting[] = [
    {
      id: '1',
      name: 'Epic MyChart Integration',
      description: 'Sync patient data with Epic electronic health records',
      provider: 'Epic Systems',
      connected: false,
      status: 'disconnected'
    },
    {
      id: '2',
      name: 'Google Calendar',
      description: 'Sync appointment schedules with Google Calendar',
      provider: 'Google',
      connected: true,
      status: 'connected',
      lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Microsoft Outlook',
      description: 'Sync appointments and notifications with Outlook',
      provider: 'Microsoft',
      connected: false,
      status: 'disconnected'
    },
    {
      id: '4',
      name: 'Cerner PowerChart',
      description: 'Integration with Cerner electronic health records',
      provider: 'Cerner',
      connected: false,
      status: 'disconnected'
    },
    {
      id: '5',
      name: 'Zoom Video Conferencing',
      description: 'Seamless video session integration with Zoom',
      provider: 'Zoom',
      connected: true,
      status: 'connected',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];

  const mockWorkloadSettings: WorkloadSetting[] = [
    {
      id: '1',
      name: 'Maximum Daily Sessions',
      description: 'Limit the number of client sessions per day',
      value: 8,
      type: 'number',
      min: 1,
      max: 12,
      unit: 'sessions'
    },
    {
      id: '2',
      name: 'Session Duration',
      description: 'Default duration for therapy sessions',
      value: 50,
      type: 'number',
      min: 30,
      max: 90,
      unit: 'minutes'
    },
    {
      id: '3',
      name: 'Break Time Between Sessions',
      description: 'Minimum time between consecutive sessions',
      value: 10,
      type: 'number',
      min: 5,
      max: 30,
      unit: 'minutes'
    },
    {
      id: '4',
      name: 'AI Interaction Limit',
      description: 'Maximum AI interactions per client per day',
      value: 5,
      type: 'number',
      min: 1,
      max: 20,
      unit: 'interactions'
    },
    {
      id: '5',
      name: 'Auto-Generate Progress Notes',
      description: 'Automatically generate session notes using AI',
      value: true,
      type: 'boolean'
    },
    {
      id: '6',
      name: 'Working Hours Start',
      description: 'Start of your typical working day',
      value: 9,
      type: 'time',
      unit: 'AM'
    },
    {
      id: '7',
      name: 'Working Hours End',
      description: 'End of your typical working day',
      value: 17,
      type: 'time',
      unit: 'PM'
    }
  ];

  useEffect(() => {
    setNotificationSettings(mockNotificationSettings);
    setIntegrationSettings(mockIntegrationSettings);
    setWorkloadSettings(mockWorkloadSettings);
  }, []);

  const handleNotificationToggle = (settingId: string) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const handleChannelToggle = (settingId: string, channel: string) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { 
              ...setting, 
              channels: setting.channels.includes(channel as any)
                ? setting.channels.filter(c => c !== channel)
                : [...setting.channels, channel as any]
            }
          : setting
      )
    );
  };

  const handleIntegrationConnect = (integrationId: string) => {
    setIntegrationSettings(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              connected: !integration.connected,
              status: integration.connected ? 'disconnected' : 'connected',
              lastSync: integration.connected ? undefined : new Date().toISOString()
            }
          : integration
      )
    );
  };

  const handleWorkloadChange = (settingId: string, value: number | boolean) => {
    setWorkloadSettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, value }
          : setting
      )
    );
  };

  const saveSettings = async () => {
    setSaving(true);
    
    // Simulate saving delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLastSaved(new Date().toLocaleTimeString());
    setSaving(false);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return Mail;
      case 'sms': return Phone;
      case 'push': return Bell;
      case 'in-app': return Monitor;
      default: return Bell;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle2;
      case 'error': return AlertTriangle;
      case 'syncing': return RefreshCw;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'syncing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            Therapist Settings
          </h1>
          <p className="text-gray-600 mt-1">Customize your platform experience and preferences</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved}
            </span>
          )}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'notifications', label: 'Notifications', icon: Bell },
            { key: 'integrations', label: 'Integrations', icon: Wifi },
            { key: 'workload', label: 'Workload Management', icon: Clock },
            { key: 'privacy', label: 'Privacy & Security', icon: Shield }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-blue-900">Smart Notification System</h3>
                <p className="text-blue-800 text-sm mt-1">
                  Our AI-powered system prioritizes notifications based on urgency and your availability.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {['alerts', 'reminders', 'reports', 'communication'].map(category => (
              <div key={category} className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900 capitalize">{category}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {notificationSettings
                    .filter(setting => setting.category === category)
                    .map((setting) => (
                      <div key={setting.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{setting.name}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(setting.priority)}`}>
                                {setting.priority}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{setting.description}</p>
                            
                            {setting.enabled && (
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700 font-medium">Delivery channels:</span>
                                {['email', 'sms', 'push', 'in-app'].map(channel => {
                                  const ChannelIcon = getChannelIcon(channel);
                                  const isActive = setting.channels.includes(channel as any);
                                  return (
                                    <button
                                      key={channel}
                                      onClick={() => handleChannelToggle(setting.id, channel)}
                                      className={`flex items-center px-2 py-1 rounded text-xs transition-colors ${
                                        isActive 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      <ChannelIcon className="w-3 h-3 mr-1" />
                                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleNotificationToggle(setting.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                setting.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-green-900">HIPAA Compliant Integrations</h3>
                <p className="text-green-800 text-sm mt-1">
                  All integrations maintain strict HIPAA compliance and data encryption standards.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrationSettings.map((integration) => {
              const StatusIcon = getStatusIcon(integration.status);
              return (
                <div key={integration.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{integration.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{integration.description}</p>
                      <p className="text-gray-500 text-xs mt-2">Provider: {integration.provider}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${getStatusColor(integration.status)}`}>
                      <StatusIcon className={`w-5 h-5 ${integration.status === 'syncing' ? 'animate-spin' : ''}`} />
                    </div>
                  </div>
                  
                  {integration.lastSync && (
                    <p className="text-gray-500 text-xs mb-4">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      integration.connected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {integration.connected ? 'Connected' : 'Not Connected'}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {integration.connected && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                          <Settings className="w-4 h-4 mr-1" />
                          Configure
                        </button>
                      )}
                      <button
                        onClick={() => handleIntegrationConnect(integration.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          integration.connected
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {integration.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Workload Management Tab */}
      {activeTab === 'workload' && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-purple-900">Intelligent Workload Management</h3>
                <p className="text-purple-800 text-sm mt-1">
                  AI-powered scheduling and workload optimization to prevent burnout and maximize effectiveness.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workloadSettings.map((setting) => (
              <div key={setting.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-2">{setting.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{setting.description}</p>
                
                {setting.type === 'number' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Value</span>
                      <span className="text-sm font-medium text-gray-900">
                        {setting.value} {setting.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={setting.min}
                      max={setting.max}
                      value={setting.value as number}
                      onChange={(e) => handleWorkloadChange(setting.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{setting.min} {setting.unit}</span>
                      <span>{setting.max} {setting.unit}</span>
                    </div>
                  </div>
                )}
                
                {setting.type === 'boolean' && (
                  <button
                    onClick={() => handleWorkloadChange(setting.id, !setting.value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      setting.value ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        setting.value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                )}
                
                {setting.type === 'time' && (
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={setting.value as number}
                    onChange={(e) => handleWorkloadChange(setting.id, parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy & Security Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-green-900">Enterprise-Grade Security</h3>
                <p className="text-green-800 text-sm mt-1">
                  Your data is protected with bank-level encryption and HIPAA compliance.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Data Encryption
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">End-to-end encryption</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">AES-256 encryption</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Encrypted backups</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Access Control
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Two-factor authentication</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Role-based permissions</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Session timeout</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI & Data Processing
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Local AI processing</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Data anonymization</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">No data sharing</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                Data Retention
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">7-year retention policy</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Secure deletion</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Audit trails</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">Compliance & Certifications</h3>
                <p className="text-yellow-800 text-sm mt-1">
                  Zentia is SOC 2 Type II certified, HIPAA compliant, and undergoes regular security audits. 
                  All data is processed and stored in secure, geographically distributed data centers.
                </p>
                <button className="text-yellow-800 hover:text-yellow-900 text-sm font-medium mt-2 flex items-center">
                  View Security Documentation <ExternalLink className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistSettings; 