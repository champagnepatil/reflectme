import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Shield, AlertTriangle, Eye, Clock } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GuardrailEntry {
  id: string;
  client_id: string;
  direction: 'in' | 'out';
  reason: string;
  raw: string;
  ts: string;
  client_name?: string;
}

interface GuardrailTableProps {
  therapistId: string;
  limit?: number;
}

export default function GuardrailTable({ therapistId, limit = 10 }: GuardrailTableProps) {
  const [entries, setEntries] = useState<GuardrailEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuardrailLogs();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('guardrail_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guardrail_log'
        },
        () => {
          fetchGuardrailLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [therapistId, limit]);

  const fetchGuardrailLogs = async () => {
    try {
      setLoading(true);
      
      const { data: logs, error } = await supabase
        .from('guardrail_log')
        .select(`
          id,
          client_id,
          direction,
          reason,
          raw,
          ts,
          profiles!inner(
            full_name,
            therapist_client_matrix!inner(
              therapist_id
            )
          )
        `)
        .eq('profiles.therapist_client_matrix.therapist_id', therapistId)
        .order('ts', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching guardrail logs:', error);
        return;
      }

      const formattedLogs = logs?.map(log => ({
        id: log.id,
        client_id: log.client_id,
        direction: log.direction,
        reason: log.reason,
        raw: log.raw,
        ts: log.ts,
        client_name: log.profiles?.full_name || 'Unknown Client'
      })) || [];

      setEntries(formattedLogs);
    } catch (error) {
      console.error('Error in fetchGuardrailLogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReasonBadge = (reason: string) => {
    const reasonMap: Record<string, { variant: "default" | "destructive" | "secondary", label: string }> = {
      'crisis_keyword_critical': { variant: 'destructive', label: 'Critical Crisis' },
      'crisis_keyword_high': { variant: 'destructive', label: 'High Risk' },
      'crisis_keyword_medium': { variant: 'secondary', label: 'Medium Risk' },
      'gemini_flag': { variant: 'secondary', label: 'Content Flag' },
      'ai_crisis_keyword_critical': { variant: 'destructive', label: 'AI Critical' },
      'ai_crisis_keyword_high': { variant: 'destructive', label: 'AI High Risk' },
      'ai_gemini_flag': { variant: 'secondary', label: 'AI Content Flag' },
      'api_error': { variant: 'secondary', label: 'System Error' }
    };

    return reasonMap[reason] || { variant: 'default', label: reason };
  };

  const getDirectionIcon = (direction: 'in' | 'out') => {
    return direction === 'in' ? <Eye className="h-4 w-4" /> : <Shield className="h-4 w-4" />;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Safety Guardrails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Safety Guardrails
          {entries.length > 0 && (
            <Badge variant="outline" className="ml-auto">
              {entries.length} recent
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No safety events detected</p>
            <p className="text-sm">All conversations are within safety guidelines</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const reasonBadge = getReasonBadge(entry.reason);
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDirectionIcon(entry.direction)}
                        <Badge variant={entry.direction === 'in' ? 'outline' : 'secondary'}>
                          {entry.direction === 'in' ? 'Input' : 'Output'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.client_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={reasonBadge.variant}>
                        {reasonBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={entry.raw}>
                        {truncateText(entry.raw, 60)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(entry.ts)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        
        {entries.length > 0 && (
          <div className="mt-4 text-center">
            <button 
              onClick={() => window.location.href = '/therapist/guardrails'}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View all guardrail logs →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 