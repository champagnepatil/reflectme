import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { CRUDTable, CRUDColumn } from '../../components/crud/CRUDTable';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Heart,
  Brain,
  MessageSquare,
  FileText,
  Activity
} from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medical_info?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
  preferred_therapist_id?: string;
  last_session_date?: string;
  next_session_date?: string;
  session_frequency?: string;
  risk_level?: 'low' | 'medium' | 'high';
  mood_trend?: number;
}

interface TherapistClientRelation {
  id: string;
  therapist_id: string;
  client_id: string;
  status: string;
  session_frequency: string;
  start_date: string;
  end_date?: string;
  notes: any;
}

const ClientManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, [user]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load clients and their relationships with the current therapist
      const { data: relations, error: relationsError } = await supabase
        .from('therapist_client_relations')
        .select(`
          *,
          clients!inner (
            id,
            first_name,
            last_name,
            email,
            phone,
            status,
            created_at,
            updated_at,
            emergency_contact,
            medical_info,
            preferred_therapist_id
          )
        `)
        .eq('therapist_id', user?.id)
        .eq('status', 'active');

      if (relationsError) throw relationsError;

      // Transform the data to include relation information
      const transformedClients = relations?.map((relation: any) => ({
        ...relation.clients,
        session_frequency: relation.session_frequency,
        start_date: relation.start_date,
        end_date: relation.end_date,
        relation_notes: relation.notes,
        relation_id: relation.id,
        // Mock additional data for demonstration
        last_session_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        next_session_date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        mood_trend: Math.floor(Math.random() * 10) + 1
      })) || [];

      setClients(transformedClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      setError(error instanceof Error ? error.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = () => {
    navigate('/therapist/clients/new');
  };

  const handleEditClient = (client: Client) => {
    navigate(`/therapist/clients/${client.id}/edit`);
  };

  const handleViewClient = (client: Client) => {
    navigate(`/therapist/clients/${client.id}`);
  };

  const handleDeleteClient = async (client: Client) => {
    try {
      // Instead of deleting, we'll deactivate the relationship
      const { error } = await supabase
        .from('therapist_client_relations')
        .update({ status: 'inactive', end_date: new Date().toISOString() })
        .eq('therapist_id', user?.id)
        .eq('client_id', client.id);

      if (error) throw error;

      await loadClients();
    } catch (error) {
      console.error('Error removing client:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove client');
    }
  };

  const handleBulkDelete = async (clients: Client[]) => {
    try {
      const clientIds = clients.map(c => c.id);
      const { error } = await supabase
        .from('therapist_client_relations')
        .update({ status: 'inactive', end_date: new Date().toISOString() })
        .eq('therapist_id', user?.id)
        .in('client_id', clientIds);

      if (error) throw error;

      await loadClients();
    } catch (error) {
      console.error('Error removing clients:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove clients');
    }
  };

  const columns: CRUDColumn<Client>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (_, client) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-neutral-900">
              {client.first_name} {client.last_name}
            </div>
            <div className="text-sm text-neutral-500">{client.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      filterable: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' }
      ],
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-success-100 text-success-800' :
          value === 'inactive' ? 'bg-neutral-100 text-neutral-800' :
          'bg-warning-100 text-warning-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'risk_level',
      label: 'Risk Level',
      type: 'select',
      filterable: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' }
      ],
      render: (value) => (
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            value === 'low' ? 'bg-success-500' :
            value === 'medium' ? 'bg-warning-500' :
            'bg-error-500'
          }`} />
          <span className="capitalize">{value}</span>
        </div>
      )
    },
    {
      key: 'mood_trend',
      label: 'Mood Trend',
      render: (value) => (
        <div className="flex items-center">
          <div className="flex-1 bg-neutral-200 rounded-full h-2 mr-2">
            <div 
              className={`h-2 rounded-full ${
                value >= 7 ? 'bg-success-500' :
                value >= 4 ? 'bg-warning-500' :
                'bg-error-500'
              }`}
              style={{ width: `${(value / 10) * 100}%` }}
            />
          </div>
          <span className="text-sm text-neutral-600">{value}/10</span>
        </div>
      )
    },
    {
      key: 'session_frequency',
      label: 'Frequency',
      render: (value) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-neutral-400 mr-1" />
          <span className="capitalize">{value}</span>
        </div>
      )
    },
    {
      key: 'last_session_date',
      label: 'Last Session',
      type: 'date',
      render: (value) => value ? (
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-neutral-400 mr-1" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : (
        <span className="text-neutral-400">No sessions</span>
      )
    },
    {
      key: 'next_session_date',
      label: 'Next Session',
      type: 'date',
      render: (value) => value ? (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-neutral-400 mr-1" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : (
        <span className="text-neutral-400">Not scheduled</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions'
    }
  ];

  const customActions = [
    {
      label: 'Schedule Session',
      icon: <Calendar className="w-4 h-4" />,
      onClick: (client: Client) => navigate(`/therapist/sessions/schedule/${client.id}`)
    },
    {
      label: 'View Notes',
      icon: <FileText className="w-4 h-4" />,
      onClick: (client: Client) => navigate(`/therapist/notes/${client.id}`)
    },
    {
      label: 'Chat',
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: (client: Client) => navigate(`/therapist/chat/${client.id}`)
    }
  ];

  const bulkActions = [
    {
      label: 'Schedule Sessions',
      icon: <Calendar className="w-4 h-4" />,
      onClick: (clients: Client[]) => navigate(`/therapist/sessions/bulk-schedule?clients=${clients.map(c => c.id).join(',')}`)
    },
    {
      label: 'Export Data',
      icon: <FileText className="w-4 h-4" />,
      onClick: (clients: Client[]) => console.log('Export data for:', clients)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Client Management</h1>
              <p className="text-neutral-600">Manage your therapy clients and their information</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-neutral-900">{clients.length}</div>
              <div className="text-sm text-neutral-600">Active Clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">
                {clients.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-neutral-600">Active</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center mr-3">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">
                {clients.filter(c => c.status === 'pending').length}
              </div>
              <div className="text-sm text-neutral-600">Pending</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center mr-3">
              <AlertTriangle className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">
                {clients.filter(c => c.risk_level === 'high').length}
              </div>
              <div className="text-sm text-neutral-600">High Risk</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
              <Heart className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">
                {Math.round(clients.reduce((sum, c) => sum + (c.mood_trend || 0), 0) / clients.length) || 0}
              </div>
              <div className="text-sm text-neutral-600">Avg Mood</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Client Table */}
      <CRUDTable
        title="Clients"
        data={clients}
        columns={columns}
        loading={loading}
        error={error}
        onCreate={handleCreateClient}
        onEdit={handleEditClient}
        onView={handleViewClient}
        onDelete={handleDeleteClient}
        onBulkDelete={handleBulkDelete}
        onRefresh={loadClients}
        customActions={customActions}
        bulkActions={bulkActions}
        canExport={true}
        searchPlaceholder="Search clients..."
        emptyMessage="No clients found"
        emptyActionText="Add New Client"
        onEmptyAction={handleCreateClient}
      />
    </div>
  );
};

export default ClientManagement; 