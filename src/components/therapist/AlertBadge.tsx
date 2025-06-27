import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Badge } from '../ui/badge';
import { Bell, AlertTriangle } from 'lucide-react';
import * as Sentry from '@sentry/react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AlertBadgeProps {
  therapistId: string;
  className?: string;
}

export default function AlertBadge({ therapistId, className }: AlertBadgeProps) {
  const [alertCount, setAlertCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { logger } = Sentry;

  useEffect(() => {
    fetchAlertCount();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        () => {
          fetchAlertCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [therapistId]);

  const fetchAlertCount = async () => {
    return Sentry.startSpan(
      {
        op: "db.query",
        name: "Fetch Alert Count",
      },
      async (span) => {
        try {
          setLoading(true);
          span.setAttribute("therapist_id", therapistId);

          logger.debug("Fetching alert count", { therapistId });
          
          // Get all unresolved alerts for therapist's clients
          const { data: alerts, error } = await supabase
            .from('alerts')
            .select(`
              id,
              reason,
              details,
              is_resolved,
              clients!inner(
                id,
                therapist_client_matrix!inner(
                  therapist_id
                )
              )
            `)
            .eq('is_resolved', false)
            .eq('clients.therapist_client_matrix.therapist_id', therapistId);

          if (error) {
            logger.error("Error fetching alerts", {
              therapistId,
              error: error.message
            });
            Sentry.captureException(error);
            return;
          }

          const totalAlerts = alerts?.length || 0;
          const criticalAlerts = alerts?.filter(alert => 
            alert.details?.severity === 'critical' || 
            alert.reason === 'crisis_keyword_detected'
          ).length || 0;

          span.setAttribute("total_alerts", totalAlerts);
          span.setAttribute("critical_alerts", criticalAlerts);

          logger.info("Alert count updated", {
            therapistId,
            totalAlerts,
            criticalAlerts
          });

          setAlertCount(totalAlerts);
          setCriticalCount(criticalAlerts);
        } catch (error) {
          logger.error("Critical error in fetchAlertCount", {
            therapistId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          Sentry.captureException(error);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  if (loading) {
    return (
      <Badge variant="outline" className={className}>
        <Bell className="h-4 w-4 mr-1" />
        Loading...
      </Badge>
    );
  }

  if (alertCount === 0) {
    return (
      <Badge variant="outline" className={className}>
        <Bell className="h-4 w-4 mr-1" />
        No alerts
      </Badge>
    );
  }

  return (
    <Badge 
      variant={criticalCount > 0 ? "destructive" : "default"}
      className={`${className} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={() => {
        Sentry.startSpan(
          {
            op: "ui.click",
            name: "Alert Badge Click",
          },
          (span) => {
            span.setAttribute("therapist_id", therapistId);
            span.setAttribute("alert_count", alertCount);
            span.setAttribute("critical_count", criticalCount);

            logger.info("Alert badge clicked", {
              therapistId,
              alertCount,
              criticalCount
            });

            // Navigate to alerts page or open alerts modal
            window.location.href = '/therapist/alerts';
          }
        );
      }}
    >
      {criticalCount > 0 ? (
        <AlertTriangle className="h-4 w-4 mr-1" />
      ) : (
        <Bell className="h-4 w-4 mr-1" />
      )}
      {criticalCount > 0 ? `${criticalCount} Critical` : `${alertCount} Alerts`}
    </Badge>
  );
} 