import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, FileText, BarChart2, Settings, ClipboardList, Activity, ArrowLeft, Heart } from 'lucide-react';

const TherapistLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="p-2 rounded-full hover:bg-slate-100 mr-3 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <Link to="/therapist" className="flex items-center group">
              <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900 ml-3 group-hover:text-primary-600 transition-colors">Zentia Therapist Portal</h1>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex-shrink-0">
          <div className="flex flex-col h-full p-4">
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
                <span className="ml-3 hidden md:block">Dashboard</span>
              </Link>
              
              <Link 
                to="/therapist/active-clients" 
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === '/therapist/active-clients' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="ml-3 hidden md:block">Active Clients</span>
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
                <span className="ml-3 hidden md:block">Monitoring</span>
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
                to="/therapist/notes-overview" 
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