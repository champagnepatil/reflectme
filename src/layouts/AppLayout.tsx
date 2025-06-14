import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { MessageCircle, Heart, FileText, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/app/chat', label: 'Chat', icon: MessageCircle },
    { path: '/app/coping-tools', label: 'Coping Tools', icon: Heart },
    { path: '/app/session-recaps', label: 'Session Recaps', icon: FileText },
    { path: '/app/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <Link to="/app" className="flex items-center group">
            <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 ml-3 group-hover:text-primary-600 transition-colors">ReflectMe</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/app/chat' && location.pathname === '/app');
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-2xl transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-neutral-200"
            >
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                    (item.path === '/app/chat' && location.pathname === '/app');
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;