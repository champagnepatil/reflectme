import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import AlertBadge from './AlertBadge';
import GuardrailTable from './GuardrailTable';
import { Shield, AlertTriangle, Activity } from 'lucide-react';
import * as Sentry from '@sentry/react';

interface SafetyDashboardProps {
  therapistId: string;
}

export default function SafetyDashboard({ therapistId }: SafetyDashboardProps) {
  const { logger } = Sentry;

  // Track dashboard view
  React.useEffect(() => {
    Sentry.startSpan(
      {
        op: "ui.load",
        name: "Safety Dashboard View",
      },
      (span) => {
        span.setAttribute("therapist_id", therapistId);
        logger.info("Safety dashboard accessed", { therapistId });
      }
    );
  }, [therapistId, logger]);

  const handleQuickAction = (action: string, path: string) => {
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Safety Dashboard Quick Action",
      },
      (span) => {
        span.setAttribute("action", action);
        span.setAttribute("therapist_id", therapistId);
        
        logger.info("Safety dashboard quick action clicked", {
          action,
          therapistId,
          path
        });

        window.location.href = path;
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Alert Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safety & Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Monitor client safety, guardrail events, and crisis alerts
          </p>
        </div>
        <AlertBadge therapistId={therapistId} className="text-lg px-4 py-2" />
      </div>

      {/* Safety Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Events</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Guardrail Table */}
      <GuardrailTable therapistId={therapistId} limit={10} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleQuickAction('view_alerts', '/therapist/alerts')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              <span>View All Alerts</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('safety_logs', '/therapist/guardrails')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              <span>Safety Logs</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('client_monitoring', '/therapist/clients')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="h-5 w-5 mr-2 text-green-500" />
              <span>Client Monitoring</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('safety_settings', '/therapist/settings')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-5 w-5 mr-2 text-gray-500" />
              <span>Safety Settings</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 