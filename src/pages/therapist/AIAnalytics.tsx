import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Bar, Pie } from 'react-chartjs-2';

interface SuggestionStat {
  suggestion_id: string;
  count: number;
  accepted: number;
  feedback_count: number;
}

const AIAnalytics: React.FC = () => {
  const [stats, setStats] = useState<SuggestionStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Aggregate suggestion usage
      const { data } = await supabase.rpc('ai_suggestion_stats');
      setStats(data || []);
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Prepare chart data
  const barData = {
    labels: stats.map(s => s.suggestion_id),
    datasets: [
      {
        label: 'Times Suggested',
        data: stats.map(s => s.count),
        backgroundColor: '#6366f1',
      },
      {
        label: 'Accepted',
        data: stats.map(s => s.accepted),
        backgroundColor: '#10b981',
      },
    ],
  };

  const pieData = {
    labels: ['Accepted', 'Not Accepted'],
    datasets: [
      {
        data: [stats.reduce((a, s) => a + s.accepted, 0), stats.reduce((a, s) => a + (s.count - s.accepted), 0)],
        backgroundColor: ['#10b981', '#f87171'],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">AI Analytics Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Suggestion Usage</h2>
            <div className="h-96">
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
            </div>
          </div>
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Engagement Rate</h2>
            <div className="h-64 w-64 mx-auto">
              <Pie data={pieData} options={{ responsive: true }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAnalytics; 