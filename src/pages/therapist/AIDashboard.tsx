import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Line } from 'react-chartjs-2';
import { Card, CardContent } from '../../components/ui/card';

interface ClientProfile {
  id: string;
  name: string;
  email: string;
}

interface MoodEntry {
  created_at: string;
  mood_score: number;
}

interface AISuggestionLog {
  created_at: string;
  suggestion_id: string;
  context: string;
  accepted: boolean;
  feedback: string;
}

const AIDashboard: React.FC = () => {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [aiLogs, setAILogs] = useState<AISuggestionLog[]>([]);

  // Fetch clients assigned to therapist (mock: all users)
  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from('profiles').select('id, name, email').limit(20);
      setClients(data || []);
    }
    fetchClients();
  }, []);

  // Fetch mood entries and AI logs for selected client
  useEffect(() => {
    if (!selectedClient) return;
    async function fetchClientData() {
      const { data: moods } = await supabase
        .from('mood_entries')
        .select('created_at, mood_score')
        .eq('user_id', selectedClient.id)
        .order('created_at', { ascending: true })
        .limit(30);
      setMoodEntries(moods || []);
      const { data: logs } = await supabase
        .from('ai_suggestions_log')
        .select('created_at, suggestion_id, context, accepted, feedback')
        .eq('user_id', selectedClient.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setAILogs(logs || []);
    }
    fetchClientData();
  }, [selectedClient]);

  // Chart data
  const moodChartData = {
    labels: moodEntries.map(e => new Date(e.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Mood Score',
        data: moodEntries.map(e => e.mood_score),
        fill: false,
        borderColor: '#6366f1',
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Therapist AI Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Client List */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Clients</h2>
          <ul className="space-y-2">
            {clients.map(client => (
              <li key={client.id}>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg ${selectedClient?.id === client.id ? 'bg-primary-100 font-bold' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedClient(client)}
                >
                  {client.name || client.email}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Client Data */}
        <div className="md:col-span-3">
          {selectedClient ? (
            <>
              <h2 className="text-xl font-semibold mb-4">{selectedClient.name || selectedClient.email}</h2>
              <Card className="mb-6">
                <CardContent>
                  <h3 className="font-medium mb-2">Mood Trend</h3>
                  <div className="h-64">
                    <Line data={moodChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <h3 className="font-medium mb-2">Recent AI Suggestions & Feedback</h3>
                  <ul className="divide-y divide-gray-200">
                    {aiLogs.map((log, i) => (
                      <li key={i} className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-primary-700">{log.suggestion_id}</div>
                            <div className="text-xs text-gray-500">{log.context}</div>
                          </div>
                          <div className="text-xs">
                            {log.accepted ? <span className="text-green-600">Accepted</span> : <span className="text-gray-400">Not used</span>}
                          </div>
                        </div>
                        {log.feedback && (
                          <div className="text-xs text-gray-700 mt-1">Feedback: {log.feedback}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">{new Date(log.created_at).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-gray-500 text-center py-24">Select a client to view AI insights and trends.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDashboard; 