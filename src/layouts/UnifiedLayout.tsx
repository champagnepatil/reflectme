import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  // Common icons
  Heart, ArrowLeft, LogOut, Settings, Bell, Search, Menu, X,
  // Client icons
  MessageSquare, LineChart, BookOpen, Brain, Target, Sparkles,
  // Therapist icons
  Users, FileText, BarChart2, Activity, Cloud, Download, Plus,
  // Status icons
  CheckCircle, AlertCircle, Clock
} from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

interface UnifiedLayoutProps {
  children?: React.ReactNode;
}

const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Redirect logic
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Get navigation items based on user role
  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    if (user.role === 'patient' || user.role === 'client') {
      return [
        { icon: LineChart, label: 'Dashboard', href: '/client' },
        { icon: MessageSquare, label: 'Chat AI', href: '/client/chat' },
        { icon: Activity, label: 'Monitoring', href: '/client/monitoring' },
        { icon: Target, label: 'Plan', href: '/client/plan' },
        { icon: Sparkles, label: 'Insights', href: '/client/insights' },
        { icon: BookOpen, label: 'Journal', href: '/client/journal' }
      ];
    }

    if (user.role === 'therapist') {
      return [
        { icon: BarChart2, label: 'Dashboard', href: '/therapist' },
        { icon: Users, label: 'Active Clients', href: '/therapist/clients' },
        { icon: Activity, label: 'Monitoring', href: '/therapist/monitoring' },
        { icon: Brain, label: 'Analytics', href: '/therapist/analytics' },
        { icon: Cloud, label: 'Patterns', href: '/therapist/patterns' },
        { icon: FileText, label: 'Clinical Notes', href: '/therapist/notes-overview' },
        { icon: Download, label: 'Reports', href: '/therapist/reports' }
      ];
    }

    return [];
  };

  const navItems = getNavItems();
  const isActive = (href: string) => {
    if (href === '/client' || href === '/therapist') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  const roleConfig = {
    client: {
      title: 'ReflectMe Companion',
      subtitle: 'Your digital companion for mental wellness',
      gradient: 'from-primary-600 to-secondary-600'
    },
    therapist: {
      title: 'ReflectMe Professional',
      subtitle: 'Advanced clinical platform with AI',
      gradient: 'from-secondary-600 to-teal-600'
    }
  };

  const config = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.client;

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <aside className={`
        ${isCollapsed ? 'w-16' : 'w-20 md:w-72'} 
        bg-white border-r border-neutral-200 flex-shrink-0 transition-all duration-300
        ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden md:flex'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center group">
              <div className={`w-10 h-10 bg-gradient-to-r ${config.gradient} rounded-2xl flex items-center justify-center shadow-soft`}>
                <Heart className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div className="ml-3 hidden md:block">
                  <h1 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                    {config.title}
                  </h1>
                  <p className="text-xs text-neutral-500 leading-tight">
                    {config.subtitle}
                  </p>
                </div>
              )}
            </Link>
            
            {/* Collapse button - desktop only */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:block p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Menu className="w-4 h-4 text-neutral-600" />
            </button>
            
            {/* Close button - mobile only */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-primary-400 to-secondary-400">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="ml-3 hidden md:block">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-500 capitalize">
                  {user.role === 'patient' ? 'client' : user.role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center p-3 rounded-xl transition-all duration-200 group
                  ${active 
                    ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm' 
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-neutral-500'} group-hover:scale-110 transition-transform`} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 font-medium hidden md:block">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="ml-auto bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && user.role === 'therapist' && (
          <div className="p-4 border-t border-neutral-200">
            <div className="space-y-2">
              <Link
                to="/analytics-demo"
                className="flex items-center p-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Brain className="w-4 h-4 mr-2" />
                <span className="hidden md:block">Analytics Demo</span>
              </Link>
              <Link
                to="/data-seeder"
                className="flex items-center p-2 text-sm text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden md:block">Generate Data</span>
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-200 space-y-2">
          <Link
            to={user.role === 'therapist' ? '/therapist/settings' : '/client/settings'}
            className="flex items-center p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            {!isCollapsed && (
              <span className="ml-3 hidden md:block">Settings</span>
            )}
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && (
              <span className="ml-3 hidden md:block">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-neutral-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors mr-4"
              >
                <Menu className="w-5 h-5 text-neutral-600" />
              </button>
              
              {/* Back button */}
              <Link to="/" className="p-2 rounded-lg hover:bg-neutral-100 transition-colors mr-3">
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </Link>
              
              {/* Page breadcrumb */}
              <div>
                <h1 className="text-xl font-semibold text-neutral-900 capitalize">
                  {location.pathname.split('/').pop() || 'Dashboard'}
                </h1>
                <p className="text-sm text-neutral-500">
                  {new Date().toLocaleDateString('it-IT', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-4">
              {/* Search (placeholder) */}
              <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                <Search className="w-5 h-5 text-neutral-600" />
              </button>
              
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors relative">
                <Bell className="w-5 h-5 text-neutral-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-4 md:p-6 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default UnifiedLayout; 