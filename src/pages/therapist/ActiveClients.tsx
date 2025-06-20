import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Search, Filter, Activity, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

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

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No client found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try modifying the search filters.'
              : 'No active clients at the moment.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveClients; 