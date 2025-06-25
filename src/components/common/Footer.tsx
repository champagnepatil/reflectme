import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, HelpCircle, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const handleUnavailableFeature = (featureName: string) => {
    alert(`The ${featureName} page is coming soon! This feature is currently under development.`);
  };

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com/zentiahealth',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
        </svg>
      )
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/zentiahealth',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/zentiahealth',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" clipRule="evenodd"></path>
        </svg>
      )
    }
  ];

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
              <li>
                <button 
                  onClick={() => handleUnavailableFeature('Features')}
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-left flex items-center"
                >
                  Features <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleUnavailableFeature('Pricing')}
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-left flex items-center"
                >
                  Pricing <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </li>
              <li><Link to="/demo" className="text-neutral-600 hover:text-primary-600 transition-colors">Demo</Link></li>
              <li>
                <button 
                  onClick={() => handleUnavailableFeature('Research')}
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-left flex items-center"
                >
                  Research <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-neutral-800 mb-6">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-neutral-600 hover:text-primary-600 transition-colors">About Us</Link></li>
              <li>
                <button 
                  onClick={() => handleUnavailableFeature('Careers')}
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-left flex items-center"
                >
                  Careers <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleUnavailableFeature('Blog')}
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-left flex items-center"
                >
                  Blog <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </li>
              <li>
                <a 
                  href="mailto:contact@zentiahealth.com"
                  className="text-neutral-600 hover:text-primary-600 transition-colors flex items-center"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-neutral-800 mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:help@zentiahealth.com"
                  className="text-neutral-600 hover:text-primary-600 transition-colors flex items-center"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Help Center
                </a>
              </li>
              <li>
                <button 
                  onClick={() => handleUnavailableFeature('Privacy Policy')}
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-left flex items-center"
                >
                  Privacy Policy <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleUnavailableFeature('Terms of Service')}
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-left flex items-center"
                >
                  Terms of Service <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </li>
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
            <a 
              href="mailto:help@zentiahealth.com"
              className="text-neutral-500 hover:text-primary-600 flex items-center mr-6 transition-colors"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              <span>Get Help</span>
            </a>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-primary-600 transition-colors"
                  aria-label={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;