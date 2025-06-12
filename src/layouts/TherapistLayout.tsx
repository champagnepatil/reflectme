import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, FileText, BarChart2, Settings, LogOut, ClipboardList, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';

const TherapistLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'therapist') {
      navigate('/patient');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user || user.role !== 'therapist') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header title="Therapist Portal" />
      
      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex-shrink-0">
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center mb-8 pl-2">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3 hidden md:block">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">Therapist</p>
              </div>
            </div>
            
            <nav className="flex-grow space-y-1">
              <Link 
                to="/therapist" 
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === '/therapist' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Clients</span>
              </Link>
              
              <Link 
                to="/therapist/case-histories" 
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname.includes('/therapist/case-histories') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Case Histories</span>
              </Link>
              
              <Link 
                to="/therapist/monitoring" 
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === '/therapist/monitoring' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Client Monitoring</span>
              </Link>
              
              <Link 
                to="/therapist/analytics" 
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === '/therapist/analytics' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart2 className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Analytics</span>
              </Link>
              
              <Link 
                to="/therapist/notes" 
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname.includes('/therapist/notes') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Notes</span>
              </Link>
              
              <Link 
                to="/therapist/settings" 
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === '/therapist/settings' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Settings</span>
              </Link>
            </nav>
            
            <button 
              onClick={handleLogout}
              className="flex items-center p-2 rounded-md text-slate-600 hover:bg-slate-100 mt-auto transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3 hidden md:block">Logout</span>
            </button>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TherapistLayout;