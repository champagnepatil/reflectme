import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Settings, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'ReflectMe' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 py-4 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-xl font-semibold text-slate-900 ml-2">{title}</h1>
          </Link>
        </div>

        {user ? (
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700">{user.name}</span>
              <Menu className="w-5 h-5 text-slate-500" />
            </motion.button>

            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-slate-200"
              >
                <Link
                  to="/app"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/app/profile"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;