import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Settings, 
  Eye, 
  EyeOff,
  MoreHorizontal,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';

interface DashboardWidget {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  content: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  }[];
}

interface SimplifiedDashboardProps {
  title: string;
  widgets: DashboardWidget[];
  onCustomize?: () => void;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
  className?: string;
}

const SimplifiedDashboard: React.FC<SimplifiedDashboardProps> = ({
  title,
  widgets,
  onCustomize,
  showAdvanced = false,
  onToggleAdvanced,
  className = ''
}) => {
  const [expandedWidgets, setExpandedWidgets] = useState<Set<string>>(
    new Set(widgets.filter(w => w.defaultExpanded).map(w => w.id))
  );
  const [hiddenWidgets, setHiddenWidgets] = useState<Set<string>>(new Set());

  // Sort widgets by priority
  const sortedWidgets = widgets.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Filter widgets based on advanced mode and hidden state
  const visibleWidgets = sortedWidgets.filter(widget => {
    if (hiddenWidgets.has(widget.id)) return false;
    if (!showAdvanced && widget.priority === 'low') return false;
    return true;
  });

  const toggleWidget = (widgetId: string) => {
    const newExpanded = new Set(expandedWidgets);
    if (newExpanded.has(widgetId)) {
      newExpanded.delete(widgetId);
    } else {
      newExpanded.add(widgetId);
    }
    setExpandedWidgets(newExpanded);
  };

  const hideWidget = (widgetId: string) => {
    setHiddenWidgets(prev => new Set([...prev, widgetId]));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">
            {visibleWidgets.length} of {widgets.length} widgets visible
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {onToggleAdvanced && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAdvanced}
              className="flex items-center"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showAdvanced ? 'Simple View' : 'Advanced View'}
            </Button>
          )}
          
          {onCustomize && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCustomize}
              className="flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </Button>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-6">
        {visibleWidgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-l-4 border-l-transparent hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(widget.priority)}`}>
                      {getPriorityIcon(widget.priority)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{widget.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(widget.priority)}`}>
                          {widget.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {widget.actions?.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={action.onClick}
                      >
                        {action.label}
                      </Button>
                    ))}
                    
                    {widget.collapsible && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWidget(widget.id)}
                        className="p-1"
                      >
                        {expandedWidgets.has(widget.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => hideWidget(widget.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {(!widget.collapsible || expandedWidgets.has(widget.id)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="pt-0">
                      {widget.content}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <EyeOff className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No widgets visible</h3>
            <p className="text-gray-600 mb-4">
              All widgets have been hidden. Customize your dashboard to show the information you need.
            </p>
            <Button onClick={onCustomize}>
              <Settings className="w-4 h-4 mr-2" />
              Customize Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hidden Widgets Summary */}
      {hiddenWidgets.size > 0 && (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <EyeOff className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {hiddenWidgets.size} widget{hiddenWidgets.size !== 1 ? 's' : ''} hidden
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHiddenWidgets(new Set())}
              >
                Show All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimplifiedDashboard; 