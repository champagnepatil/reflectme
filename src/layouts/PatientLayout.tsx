import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, LineChart, BookOpen, Settings, LogOut, BarChart3, ArrowLeft, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PatientLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'patient') {
      navigate('/therapist');
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

  if (!user || user.role !== 'patient') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-2 sm:px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between min-h-[56px] sm:min-h-[64px]">
          <div className="flex items-center">
            <Link to="/" className="p-3 sm:p-2 rounded-full hover:bg-slate-100 mr-2 sm:mr-3 transition-colors min-h-[44px] min-w-[44px]" aria-label="Back to home">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <Link to="/client" className="flex items-center group min-h-[44px]">
              <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 ml-2 sm:ml-3 group-hover:text-primary-600 transition-colors">Zentia Companion</h1>
            </Link>
          </div>
          {/* Hamburger menu for mobile */}
          <button
            className="md:hidden p-3 rounded-2xl hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px]"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>
      
      <div className="flex flex-grow">
        {/* Sidebar - hidden on mobile, visible on md+ */}
        <aside className="hidden md:flex w-20 md:w-64 bg-white border-r border-slate-200 flex-shrink-0">
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
                <p className="text-xs text-slate-500">Patient</p>
              </div>
            </div>
            
            <nav className="flex-grow space-y-1">
              <Link 
                to="/client" 
                className={`flex items-center p-2 rounded-md ${
                  location.pathname === '/client' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LineChart className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Dashboard</span>
              </Link>
              
              <Link 
                to="/client/chat" 
                className={`flex items-center p-2 rounded-md ${
                  location.pathname === '/client/chat' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Chat</span>
              </Link>
              
              <Link 
                to="/client/journal" 
                className={`flex items-center p-2 rounded-md ${
                  location.pathname === '/client/journal' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Journal</span>
              </Link>
              
              <Link 
                to="/client/monitoring" 
                className={`flex items-center p-2 rounded-md ${
                  location.pathname === '/client/monitoring' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Wellness</span>
              </Link>
              
              <Link 
                to="/client/settings" 
                className={`flex items-center p-2 rounded-md ${
                  location.pathname === '/client/settings' 
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
              className="flex items-center p-2 rounded-md text-slate-600 hover:bg-slate-100 mt-auto min-h-[44px]"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3 hidden md:block">Logout</span>
            </button>
          </div>
        </aside>
        
        {/* Mobile Drawer Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="w-64 max-w-[85vw] bg-white shadow-2xl h-full flex flex-col p-4 border-r border-slate-200 animate-slide-in-left">
              <div className="flex items-center mb-8 pl-2">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">Patient</p>
                </div>
                <button
                  className="ml-auto p-2 rounded-xl hover:bg-slate-100 transition-colors"
                  aria-label="Close menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-grow space-y-1">
                <Link 
                  to="/client" 
                  className={`flex items-center p-2 rounded-md ${
                    location.pathname === '/client' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LineChart className="w-5 h-5" />
                  <span className="ml-3 hidden md:block">Dashboard</span>
                </Link>
                
                <Link 
                  to="/client/chat" 
                  className={`flex items-center p-2 rounded-md ${
                    location.pathname === '/client/chat' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="ml-3 hidden md:block">Chat</span>
                </Link>
                
                <Link 
                  to="/client/journal" 
                  className={`flex items-center p-2 rounded-md ${
                    location.pathname === '/client/journal' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="ml-3 hidden md:block">Journal</span>
                </Link>
                
                <Link 
                  to="/client/monitoring" 
                  className={`flex items-center p-2 rounded-md ${
                    location.pathname === '/client/monitoring' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="ml-3 hidden md:block">Wellness</span>
                </Link>
                
                <Link 
                  to="/client/settings" 
                  className={`flex items-center p-2 rounded-md ${
                    location.pathname === '/client/settings' 
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
                className="flex items-center p-2 rounded-md text-slate-600 hover:bg-slate-100 mt-auto min-h-[44px]"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Logout</span>
              </button>
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-grow p-2 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;