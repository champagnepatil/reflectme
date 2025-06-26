import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Menu, 
  Home, 
  Plus,
  Search,
  Settings,
  LogOut,
  User,
  Bell,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getNavigationByRole, getSearchSuggestions, NavigationItem } from './NavigationConfig';
import ImprovedNavigation from './ImprovedNavigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface MobileNavigationProps {
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<NavigationItem[]>([]);

  const config = getNavigationByRole(user?.role || 'client');

  // Get primary navigation items (priority 1)
  const primaryItems = config.items
    .filter(item => item.priority === 1)
    .slice(0, 4); // Limit to 4 items for mobile

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
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const isActive = (href: string) => {
    if (href === `/${user?.role}` || href === '/client' || href === '/therapist') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className={`bg-white border-b border-neutral-200 px-4 py-3 sticky top-0 z-40 ${className}`}>
        <div className="flex items-center justify-between min-h-[56px]">
          {/* Left side - Menu button and title */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="p-3 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-neutral-600" />
            </motion.button>
            
            <div className="flex items-center">
              <div className={`w-8 h-8 bg-gradient-to-r ${config.gradient} rounded-xl flex items-center justify-center shadow-soft`}>
                <Home className="w-4 h-4 text-white" />
              </div>
              <h1 className="ml-2 text-lg font-semibold text-neutral-900 truncate">
                {config.title}
              </h1>
            </div>
          </div>

          {/* Right side - Search and notifications */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(!showSearch)}
              className="p-3 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-neutral-600" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors min-h-[44px] min-w-[44px] relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-neutral-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
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
              {searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
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
                          setIsOpen(false);
                        }}
                        className="flex items-center p-4 hover:bg-neutral-50 transition-colors min-h-[44px]"
                      >
                        <Icon className="w-5 h-5 text-neutral-600 mr-3" />
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
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Navigation Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col"
            >
              <ImprovedNavigation isMobile={true} onClose={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-2 py-2 z-40">
        <div className="flex items-center justify-around">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`
                  flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px]
                  ${active 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          
          {/* More menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center p-3 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-200 min-h-[44px] min-w-[44px]"
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </motion.button>
        </div>
      </nav>

      {/* Bottom spacing for navigation bar */}
      <div className="h-20"></div>
    </>
  );
};

export default MobileNavigation; 