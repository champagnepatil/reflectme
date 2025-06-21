import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

interface MobileMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MobileMenuItem[];
  title: string;
  subtitle?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  onLogout?: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  items,
  title,
  subtitle,
  user,
  onLogout
}) => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/client' || href === '/therapist') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const menuVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    }
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    closed: {
      x: -20,
      opacity: 0
    },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut'
      }
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden flex flex-col"
            style={{
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-secondary-50">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-xl bg-white/80 hover:bg-white transition-colors shadow-sm"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </motion.button>
            </div>

            {/* User Profile */}
            {user && (
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-primary-400 to-secondary-400 ring-2 ring-white shadow-sm">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-neutral-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-neutral-600 capitalize">
                      {user.role === 'patient' ? 'client' : user.role}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {items.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <motion.div
                    key={item.href}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    custom={index}
                  >
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center p-4 rounded-2xl transition-all duration-200
                        ${active 
                          ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm' 
                          : 'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100'
                        }
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                        ${active 
                          ? 'bg-primary-100 text-primary-600' 
                          : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
                        }
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 ml-4">
                        <span className="font-medium text-base">
                          {item.label}
                        </span>
                      </div>

                      {item.badge && (
                        <span className="bg-error-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}

                      <ChevronRight className={`
                        w-4 h-4 ml-2 transition-all duration-200
                        ${active ? 'text-primary-400' : 'text-neutral-400 group-hover:text-neutral-600'}
                      `} />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 space-y-2">
              <Link
                to={user?.role === 'therapist' ? '/therapist/settings' : '/client/settings'}
                onClick={onClose}
                className="flex items-center p-3 text-neutral-600 hover:bg-white hover:text-neutral-900 rounded-xl transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-medium">Settings</span>
              </Link>
              
              {onLogout && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onLogout}
                  className="flex items-center p-3 text-error-600 hover:bg-error-50 rounded-xl transition-all duration-200 w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-error-100 flex items-center justify-center mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="font-medium">Sign Out</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu; 