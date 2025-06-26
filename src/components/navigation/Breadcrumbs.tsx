import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getBreadcrumbs } from './NavigationConfig';

interface BreadcrumbsProps {
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  className = '', 
  showBackButton = true,
  onBack 
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname, user?.role || 'client');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Go back in history or to parent route
      const parentPath = breadcrumbs.length > 1 
        ? breadcrumbs[breadcrumbs.length - 2].href 
        : `/${user?.role}`;
      window.history.pushState(null, '', parentPath);
      window.location.reload();
    }
  };

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {/* Back Button */}
      {showBackButton && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-600 hover:text-neutral-900"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
      )}

      {/* Breadcrumb Items */}
      {breadcrumbs.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;
        
        return (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )}
            
            {isLast ? (
              // Current page - not clickable
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4 text-neutral-600" />
                <span className="font-medium text-neutral-900">
                  {item.label}
                </span>
              </div>
            ) : (
              // Clickable breadcrumb
              <Link
                to={item.href}
                className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="hover:underline">
                  {isFirst ? 'Home' : item.label}
                </span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </motion.nav>
  );
};

export default Breadcrumbs; 