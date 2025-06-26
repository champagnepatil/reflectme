import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { MessageCircle, Heart, FileText, User, Menu, X, ArrowLeft } from 'lucide-react';
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
      <header className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 px-2 sm:px-4 py-3 sm:py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between min-h-[56px] sm:min-h-[64px]">
          <div className="flex items-center">
            <Link to="/" className="p-3 sm:p-2 rounded-full hover:bg-neutral-100 mr-2 sm:mr-3 transition-colors min-h-[44px] min-w-[44px]" aria-label="Back to home">
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <Link to="/app" className="flex items-center group min-h-[44px]">
              <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-neutral-800 ml-2 sm:ml-3 group-hover:text-primary-600 transition-colors">Zentia</h1>
            </Link>
          </div>

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

          {/* Mobile Menu Button - Optimized for touch */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-4 -mr-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 rounded-2xl transition-colors min-h-[44px] min-w-[44px]"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Navigation - Optimized for touch */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.04, 0.62, 0.23, 0.98]
              }}
              className="md:hidden mt-4 pt-6 border-t border-neutral-200 bg-neutral-50/50 -mx-2 sm:-mx-4 px-2 sm:px-4 pb-4"
            >
              <div className="space-y-3">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                    (item.path === '/app/chat' && location.pathname === '/app');
                  
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center p-4 rounded-2xl transition-all duration-200 group min-h-[44px]
                          ${isActive 
                            ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm' 
                            : 'text-neutral-700 hover:bg-white active:bg-neutral-100'
                          }
                        `}
                      >
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                          ${isActive 
                            ? 'bg-primary-100 text-primary-600' 
                            : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
                          }
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="ml-3 sm:ml-4 font-medium text-sm sm:text-base">
                          {item.label}
                        </span>
                        <div className={`
                          ml-auto w-2 h-2 rounded-full transition-all duration-200
                          ${isActive ? 'bg-primary-400' : 'bg-transparent'}
                        `} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      
      {/* Main content */}
      <main className="flex-grow px-2 sm:px-4 pt-2 pb-20 sm:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;