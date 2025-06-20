import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, AlertTriangle, CheckCircle, Clock, Users, TrendingUp, TrendingDown, Minus, Calendar, MoreVertical } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'at-risk';
  lastAssessment: string;
  nextSession: string;
  trend: 'improving' | 'stable' | 'declining';
  riskScore: number;
}

const Monitoring: React.FC = () => {
  const { user } = useAuth();
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Demo data aligned with actual Supabase database clients
  const demoClients: Client[] = [
    {
      id: 'f229bd3a-f1a5-4b05-9b25-f1330c03db09', // Real UUID from database
      name: 'Sarah Mitchell',
      email: 'patient@mindtwin.demo',
      status: 'active',
      lastAssessment: '2024-12-18',
      nextSession: '2024-12-20',
      trend: 'improving',
      riskScore: 3
    },
    {
      id: '00000000-0000-4000-b000-000000000002', // Real UUID from database
      name: 'John Thompson',
      email: 'client2@mindtwin.demo',
      status: 'active',
      lastAssessment: '2024-12-17',
      nextSession: '2024-12-21',
      trend: 'stable',
      riskScore: 5
    },
    {
      id: '00000000-0000-4000-b000-000000000003', // Real UUID from database
      name: 'Emily Rodriguez',
      email: 'client3@mindtwin.demo',
      status: 'at-risk',
      lastAssessment: '2024-12-15',
      nextSession: '2024-12-19',
      trend: 'declining',
      riskScore: 8
    },
    {
      id: '00000000-0000-4000-b000-000000000004', // Real UUID from database
      name: 'Michael Chen',
      email: 'client4@mindtwin.demo',
      status: 'pending',
      lastAssessment: '2024-12-10',
      nextSession: '2024-12-22',
      trend: 'stable',
      riskScore: 4
    }
  ];

  const filteredClients = demoClients.filter(client => 
    riskFilter === 'all' || client.riskScore >= 5
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minimal': return 'text-green-600 bg-green-100';
      case 'mild': return 'text-yellow-600 bg-yellow-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'severe': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'stable': return <Minus className="w-5 h-5 text-blue-600" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Ora';
    if (diffInHours < 24) return `${diffInHours}h fa`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}g fa`;
  };

  // Stats calculation
  const stats = {
    total: demoClients.length,
    highRisk: demoClients.filter(c => c.riskScore >= 5).length,
    assessmentsDue: demoClients.reduce((sum, c) => sum + c.riskScore, 0),
    improving: demoClients.filter(c => c.trend === 'improving').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Client Monitoring
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of all clients' status
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-gray-600">Total Clients</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.highRisk}</p>
              <p className="text-gray-600">High Risk</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.assessmentsDue}</p>
              <p className="text-gray-600">Assessment Due</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.improving}</p>
              <p className="text-gray-600">Improving</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by risk:</span>
          <div className="flex gap-2">
            {(['all', 'low', 'medium', 'high'] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setRiskFilter(risk)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  riskFilter === risk
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {risk === 'all' ? 'All' : 
                 risk === 'low' ? 'Low' :
                 risk === 'medium' ? 'Medium' : 'High'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Client Status ({filteredClients.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {client.name}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {client.riskScore}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTrendIcon(client.trend)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {client.trend === 'improving' ? 'Improving' :
                         client.trend === 'stable' ? 'Stable' : 'Declining'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRiskColor(riskFilter)}`}>
                      {riskFilter === 'all' ? (client.riskScore >= 5 ? 'High' : 'Low') :
                       riskFilter === 'low' ? 'Low' :
                       riskFilter === 'medium' ? 'Medium' : 'High'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.riskScore > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {client.riskScore}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTimeAgo(client.lastAssessment)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/therapist/clients/${client.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/therapist/monitoring/${client.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Monitor
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No client found</h3>
          <p className="text-gray-500">
            No clients with the selected risk level.
          </p>
        </div>
      )}
    </div>
  );
};

export default Monitoring; 