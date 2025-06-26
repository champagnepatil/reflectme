import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  ChevronRight, 
  Home, 
  ArrowLeft,
  Menu,
  Plus,
  Settings,
  LogOut,
  User,
  Bell,
  HelpCircle,
  Star,
  Zap,
  Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getNavigationByRole, getBreadcrumbs, getSearchSuggestions, NavigationItem } from './NavigationConfig';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface ImprovedNavigationProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const ImprovedNavigation: React.FC<ImprovedNavigationProps> = ({ 
  isMobile = false, 
  onClose 
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<NavigationItem[]>([]);

  const config = getNavigationByRole(user?.role || 'client');
  const breadcrumbs = getBreadcrumbs(location.pathname, user?.role || 'client');

  // Group items by category
  const groupedItems = config.items.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  // Sort items by priority within each category
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => (a.priority || 999) - (b.priority || 999));
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const suggestions = getSearchSuggestions(query, user?.role || 'client');
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const isActive = (href: string) => {
    if (href === `/${user?.role}` || href === '/client' || href === '/therapist') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'primary': return 'Main Features';
      case 'management': return 'Management Tools';
      case 'clinical': return 'Clinical Tools';
      case 'advanced': return 'Advanced Features';
      case 'wellness': return 'Wellness Tools';
      case 'system': return 'Settings & Support';
      default: return 'Other';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'primary': return <Star className="w-4 h-4" />;
      case 'management': return <Settings className="w-4 h-4" />;
      case 'clinical': return <User className="w-4 h-4" />;
      case 'advanced': return <Zap className="w-4 h-4" />;
      case 'wellness': return <Heart className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <ChevronRight className="w-4 h-4" />;
    }
  };

  return (
    <div className={`${isMobile ? 'w-full' : 'w-72'} bg-white border-r border-neutral-200 flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <Link to={`/${user?.role}`} className="flex items-center group">
            <div className={`w-10 h-10 bg-gradient-to-r ${config.gradient} rounded-2xl flex items-center justify-center shadow-soft`}>
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                {config.title}
              </h1>
              <p className="text-xs text-neutral-500 leading-tight">
                {config.subtitle}
              </p>
            </div>
          </Link>
          
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-primary-400 to-secondary-400">
              <img 
                src={user?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${user?.email}`}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-neutral-500 capitalize">
                {user?.role === 'patient' ? 'client' : user?.role}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <Bell className="w-4 h-4 text-neutral-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <HelpCircle className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {config.searchEnabled && (
        <div className="p-4 border-b border-neutral-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              onFocus={() => setShowSearch(true)}
            />
          </div>
          
          {/* Search Suggestions */}
          <AnimatePresence>
            {showSearch && searchSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
              >
                {searchSuggestions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery('');
                        onClose?.();
                      }}
                      className="flex items-center p-3 hover:bg-neutral-50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-neutral-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-neutral-500">{item.description}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Breadcrumbs */}
      {config.breadcrumbs && breadcrumbs.length > 1 && (
        <div className="px-4 py-2 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center space-x-1 text-sm">
            {breadcrumbs.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === breadcrumbs.length - 1;
              
              return (
                <React.Fragment key={item.id}>
                  {index > 0 && <ChevronRight className="w-3 h-3 text-neutral-400" />}
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-1 ${
                      isLast 
                        ? 'text-neutral-900 font-medium' 
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.label}</span>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {config.quickActions && config.quickActions.length > 0 && (
        <div className="p-4 border-b border-neutral-200">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {config.quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.id}
                  to={action.href}
                  onClick={onClose}
                  className="flex items-center p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-neutral-600 mr-2" />
                  <span className="text-sm font-medium text-neutral-700">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center mb-3">
                {getCategoryIcon(category)}
                <h3 className="ml-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {getCategoryLabel(category)}
                </h3>
              </div>
              
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center p-3 rounded-xl transition-all duration-200
                        ${active 
                          ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm' 
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        }
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                        ${active 
                          ? 'bg-primary-100 text-primary-600' 
                          : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
                        }
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 ml-3">
                        <div className="flex items-center">
                          <span className="font-medium text-sm">{item.label}</span>
                          {item.isNew && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                              New
                            </span>
                          )}
                          {item.isBeta && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                              Beta
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
                        )}
                      </div>
                      
                      {item.badge && (
                        <span className="ml-2 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-neutral-200">
        <div className="space-y-2">
          <Link
            to={`/${user?.role}/settings`}
            onClick={onClose}
            className="flex items-center p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <Settings className="w-4 h-4 text-neutral-600 mr-2" />
            <span className="text-sm font-medium text-neutral-700">Settings</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-2 rounded-lg hover:bg-neutral-100 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-neutral-600 mr-2" />
            <span className="text-sm font-medium text-neutral-700">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImprovedNavigation; 