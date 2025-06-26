import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, Plus, TrendingUp, Activity, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import EmptyState from '../../components/ui/EmptyState';

interface Client {
  id: string;
  name: string;
  email: string;
  lastSession: string;
  nextSession: string;
  status: 'active' | 'pending' | 'on-hold';
  riskLevel: 'low' | 'medium' | 'high';
  assessmentsDue: number;
  progressTrend: 'improving' | 'stable' | 'declining';
}

const ActiveClients: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'on-hold'>('all');
  const [showGoldenPath, setShowGoldenPath] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo data only for demo users
  const demoClients: Client[] = [
    {
      id: 'f229bd3a-f1a5-4b05-9b25-f1330c03db09',
      name: 'Sarah Mitchell',
      email: 'patient@mindtwin.demo',
      lastSession: '2024-12-18',
      nextSession: '2024-12-20',
      status: 'active',
      riskLevel: 'low',
      assessmentsDue: 1,
      progressTrend: 'improving'
    },
    {
      id: '00000000-0000-4000-b000-000000000002',
      name: 'John Thompson',
      email: 'client2@mindtwin.demo',
      lastSession: '2024-12-17',
      nextSession: '2024-12-21',
      status: 'active',
      riskLevel: 'medium',
      assessmentsDue: 2,
      progressTrend: 'stable'
    },
    {
      id: '00000000-0000-4000-b000-000000000003',
      name: 'Emily Rodriguez',
      email: 'client3@mindtwin.demo',
      lastSession: '2024-12-15',
      nextSession: '2024-12-22',
      status: 'active',
      riskLevel: 'high',
      assessmentsDue: 0,
      progressTrend: 'declining'
    },
    {
      id: '00000000-0000-4000-b000-000000000004',
      name: 'Michael Chen',
      email: 'client4@mindtwin.demo',
      lastSession: '2024-12-10',
      nextSession: '2024-12-24',
      status: 'pending',
      riskLevel: 'low', 
      assessmentsDue: 3,
      progressTrend: 'stable'
    }
  ];

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      
      // For demo users, show demo data
      if (user?.isDemo) {
        setClients(demoClients);
        setLoading(false);
        return;
      }

      // For real users, load from database
      try {
        // TODO: Replace with actual API call to load real clients
        // const response = await fetch('/api/clients');
        // const realClients = await response.json();
        // setClients(realClients);
        
        // For now, show empty state for real users
        setClients([]);
      } catch (error) {
        console.error('Error loading clients:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [user]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />;
      case 'declining': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Active Clients
            </h1>
            <p className="text-gray-600 mt-1">Loading your clients...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Active Clients
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor your active clients
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {filteredClients.length} clients
          </span>
          <button
            onClick={() => setShowGoldenPath(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="on-hold">On hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State for New Users */}
      {filteredClients.length === 0 && !searchTerm && filterStatus === 'all' && (
        <EmptyState
          type="clients"
          title="🚀 Ready to Start Your Journey?"
          description="Add your first client and experience the power of AI-enhanced therapy management. Our guided setup will have you ready in under 5 minutes."
          primaryAction={{
            label: 'Start Golden Path (5 min)',
            onClick: () => setShowGoldenPath(true),
            variant: 'default',
            icon: <Zap className="w-5 h-5" />
          }}
          secondaryActions={[
            {
              label: 'Quick Add Client',
              onClick: () => setShowGoldenPath(true),
              variant: 'outline',
              icon: <Plus className="w-4 h-4" />
            }
          ]}
          sampleData={{
            title: 'What You\'ll Get',
            items: [
              '✓ Quick Setup - Add client details in minutes',
              '✓ AI Treatment Plan - Generate personalized approach',
              '✓ Progress Tracking - Monitor outcomes with analytics',
              '✓ Risk Assessment - Early warning alerts',
              '✓ Automated Notes - AI-powered session summaries',
              '✓ Smart Scheduling - Intelligent appointment management'
            ]
          }}
          userRole="therapist"
        />
      )}

      {/* Clients Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Link
            key={client.id}
            to={`/therapist/clients/${client.id}`}
            className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
          >
            {/* Client Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {client.name}
                </h3>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(client.riskLevel)}`}>
                  {client.riskLevel} risk
                </span>
              </div>
            </div>

            {/* Client Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last session:</span>
                <span className="font-medium">{client.lastSession}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Next session:</span>
                <span className="font-medium">{client.nextSession}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Assessments due:</span>
                <span className={`font-medium ${client.assessmentsDue > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {client.assessmentsDue}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress:</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(client.progressTrend)}
                  <span className="font-medium capitalize">{client.progressTrend}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
                  View Details
                </button>
                <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
                  Schedule
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Golden Path Modal would go here */}
      {showGoldenPath && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>
            <p className="text-gray-600 mb-4">
              This feature will be available in the full version. For now, you can manually add clients through the database.
            </p>
            <button
              onClick={() => setShowGoldenPath(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveClients; 