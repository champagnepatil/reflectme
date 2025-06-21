import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BottomNavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
}

interface MobileBottomNavProps {
  items: BottomNavItem[];
  className?: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ items, className = '' }) => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/client' || href === '/therapist') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-30 md:hidden
      bg-white/95 backdrop-blur-sm border-t border-neutral-200
      px-2 py-2 safe-area-inset-bottom
      ${className}
    `}>
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <motion.div
              key={item.href}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link
                to={item.href}
                className={`
                  flex flex-col items-center p-2 rounded-xl transition-all duration-200
                  min-w-[60px] min-h-[60px] justify-center
                  ${active 
                    ? 'text-primary-600' 
                    : 'text-neutral-500 hover:text-neutral-700'
                  }
                `}
              >
                <div className={`
                  relative p-2 rounded-xl transition-all duration-200
                  ${active 
                    ? 'bg-primary-50 scale-110' 
                    : 'hover:bg-neutral-50'
                  }
                `}>
                  <Icon className="w-6 h-6" />
                  
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                
                <span className={`
                  text-xs font-medium mt-1 truncate max-w-[50px]
                  ${active ? 'text-primary-600' : 'text-neutral-500'}
                `}>
                  {item.label}
                </span>

                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeBottomNavIndicator"
                    className="absolute -top-0.5 left-1/2 w-1 h-1 bg-primary-500 rounded-full transform -translate-x-1/2"
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
      
      {/* Safe area spacer for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
};

export default MobileBottomNav; 