import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Search, Filter, Activity, Calendar, AlertCircle, TrendingUp, Plus, Star, Zap } from 'lucide-react';
import GoldenPathWizard from '@/components/onboarding/GoldenPathWizard';
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

  // Demo data aligned with actual Supabase database clients
  const demoClients: Client[] = [
    {
      id: 'f229bd3a-f1a5-4b05-9b25-f1330c03db09', // Real UUID from database
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
      id: '00000000-0000-4000-b000-000000000002', // Real UUID from database
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
      id: '00000000-0000-4000-b000-000000000003', // Real UUID from database
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
      id: '00000000-0000-4000-b000-000000000004', // Real UUID from database
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

  const filteredClients = demoClients.filter(client => {
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
                {getTrendIcon(client.progressTrend)}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Last session</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(client.lastSession).toLocaleDateString('en-US')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Next session</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(client.nextSession).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>

            {/* Risk and Assessments */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(client.riskLevel)}`}>
                Risk: {client.riskLevel}
              </span>
              
              {client.assessmentsDue > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <Calendar className="w-3 h-3 mr-1" />
                  {client.assessmentsDue} assessment due
                </span>
              )}
            </div>

            {/* Progress Trend */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Progress</span>
                <span className={`text-xs font-medium ${
                  client.progressTrend === 'improving' ? 'text-green-600' :
                  client.progressTrend === 'stable' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {client.progressTrend === 'improving' ? 'Improving' :
                   client.progressTrend === 'stable' ? 'Stable' : 'Declining'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State for Search/Filter Results */}
      {filteredClients.length === 0 && (searchTerm || filterStatus !== 'all') && (
        <EmptyState
          type="search"
          title="No clients found"
          description="We couldn't find any clients matching your search criteria. Try adjusting your filters or search terms."
          primaryAction={{
            label: 'Clear Search',
            onClick: () => setSearchTerm(''),
            variant: 'outline',
            icon: <Search className="w-4 h-4" />
          }}
          secondaryActions={[
            {
              label: 'Clear Filters',
              onClick: () => setFilterStatus('all'),
              variant: 'outline',
              icon: <Filter className="w-4 h-4" />
            },
            {
              label: 'Add New Client',
              onClick: () => setShowGoldenPath(true),
              variant: 'default',
              icon: <Plus className="w-4 h-4" />
            }
          ]}
          userRole="therapist"
        />
      )}
      
      {/* Golden Path Wizard */}
      <GoldenPathWizard
        isOpen={showGoldenPath}
        onClose={() => setShowGoldenPath(false)}
        onComplete={(clientData) => {
          console.log('Golden Path completed with client:', clientData);
          setShowGoldenPath(false);
          // Show success message
          setTimeout(() => {
            alert('🎉 Congratulations! Your new client has been successfully added with an AI-powered treatment plan.');
          }, 500);
        }}
      />
    </div>
  );
};

export default ActiveClients; 