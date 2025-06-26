import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, BookOpen, Target, Sparkles, Users, Brain, Analytics } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === '/client' || path === '/therapist') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const patientNavItems = [
    {
      icon: MessageSquare,
      label: 'AI Chat',
      href: '/client/chat',
      emoji: '🤖',
      color: 'text-blue-600'
    },
    {
      icon: BookOpen,
      label: 'Journal',
      href: '/client/journal',
      emoji: '📝',
      color: 'text-green-600'
    },
    {
      icon: Target,
      label: 'Progress',
      href: '/client',
      emoji: '🎯',
      color: 'text-orange-600'
    },
    {
      icon: Sparkles,
      label: 'Insights',
      href: '/client/insights',
      emoji: '✨',
      color: 'text-purple-600'
    }
  ];

  const therapistNavItems = [
    {
      icon: Users,
      label: 'Clients',
      href: '/therapist/clients',
      emoji: '👥',
      color: 'text-blue-600'
    },
    {
      icon: Brain,
      label: 'AI Tools',
      href: '/therapist/ai-toolbox',
      emoji: '🧠',
      color: 'text-purple-600'
    },
    {
      icon: Analytics,
      label: 'Analytics',
      href: '/therapist/analytics-hub',
      emoji: '📊',
      color: 'text-green-600'
    },
    {
      icon: MessageSquare,
      label: 'Secure Chat',
      href: '/therapist/communication-hub',
      emoji: '💬',
      color: 'text-orange-600'
    }
  ];

  const navItems = user.role === 'therapist' ? therapistNavItems : patientNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl md:hidden">
      <div className="grid grid-cols-4 h-16 sm:h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-label={item.label}
              className={`
                flex flex-col items-center justify-center p-2 relative transition-all duration-200 min-h-[44px] min-w-[44px]
                ${active 
                  ? 'text-white' 
                  : 'text-gray-500'
                }
              `}
            >
              {/* Active Background */}
              {active && (
                <div className={`
                  absolute inset-1 rounded-2xl bg-gradient-to-r 
                  ${user.role === 'therapist' 
                    ? 'from-purple-500 to-blue-600' 
                    : 'from-emerald-500 to-teal-600'
                  }
                  shadow-lg
                `} />
              )}
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-1">
                  <span className="text-base sm:text-lg">{item.emoji}</span>
                </div>
                <span className={`text-xs sm:text-sm font-medium ${
                  active ? 'text-white' : item.color
                }`}>
                  {item.label}
                </span>
                
                {/* Notification Badge */}
                {(item.href === '/client/chat' || item.href === '/therapist/clients') && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">!</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav; 