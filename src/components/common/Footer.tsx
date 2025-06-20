import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-6">
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-neutral-800 ml-3">Zentia</h2>
            </Link>
            <p className="text-neutral-600 mb-6 leading-relaxed">Your personalized digital therapy companion, providing empathetic support between sessions.</p>
            <div className="flex items-center text-neutral-500">
              <Heart className="w-5 h-5 mr-3 text-primary-500" />
              <span>Made with care for mental health</span>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-neutral-800 mb-6">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-neutral-600 hover:text-primary-600 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-neutral-600 hover:text-primary-600 transition-colors">Pricing</Link></li>
              <li><Link to="/demo" className="text-neutral-600 hover:text-primary-600 transition-colors">Demo</Link></li>
              <li><Link to="/research" className="text-neutral-600 hover:text-primary-600 transition-colors">Research</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-neutral-800 mb-6">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-neutral-600 hover:text-primary-600 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-neutral-600 hover:text-primary-600 transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="text-neutral-600 hover:text-primary-600 transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-neutral-600 hover:text-primary-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-neutral-800 mb-6">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-neutral-600 hover:text-primary-600 transition-colors">Help Center</Link></li>
              <li><Link to="/privacy" className="text-neutral-600 hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-neutral-600 hover:text-primary-600 transition-colors">Terms of Service</Link></li>
              <li>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-success-500" />
                  <span className="text-neutral-600">HIPAA Compliant</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500">&copy; {new Date().getFullYear()} Zentia Health. All rights reserved.</p>
          <div className="flex items-center mt-4 md:mt-0">
            <Link to="/help" className="text-neutral-500 hover:text-primary-600 flex items-center mr-6 transition-colors">
              <HelpCircle className="w-4 h-4 mr-2" />
              <span>Get Help</span>
            </Link>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;