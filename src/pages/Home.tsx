import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import WaitlistCTA from '../components/waitlist/WaitlistCTA';
import NotificationHistory from '../components/waitlist/NotificationHistory';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Brain, Shield, Clock, Users, ArrowRight, Bell } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Check if user is admin (you can modify this logic based on your admin criteria)
  const isAdmin = user?.email?.includes('admin') || 
                  user?.email?.includes('l.de.angelis') || 
                  user?.role === 'admin' ||
                  false; // Add your admin check logic here

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90"></div>
        <div className="relative z-10 px-6 py-20 lg:py-32">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mr-6 border border-white/30">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-6xl md:text-7xl font-bold text-white">Zentia</h1>
              </div>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
                Your personalized digital therapy companion, providing empathetic support between sessions using AI and your therapy history.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={() => navigate('/client')}
                  className="group px-10 py-4 bg-white text-primary-600 rounded-2xl font-semibold hover:bg-white/95 transition-all duration-300 shadow-large flex items-center justify-center"
                >
                  <Heart className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Zentia Companion
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => {
                    // Scroll to waitlist section
                    const waitlistSection = document.querySelector('[data-waitlist-section]');
                    if (waitlistSection) {
                      waitlistSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="group px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-2xl font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-large flex items-center justify-center"
                >
                  <Bell className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Join the Waitlist
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => navigate('/therapist')}
                  className="group px-10 py-4 border-2 border-white text-white rounded-2xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300 flex items-center justify-center"
                >
                  <Users className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Zentia Professional
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-neutral-800 mb-6">How Zentia Supports Your Journey</h2>
            <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
              Bridging the gap between therapy sessions with personalized, AI-powered support that understands your unique therapeutic journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="card card-hover p-8 text-center"
            >
              <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">Personalized Chat Support</h3>
              <p className="text-neutral-600 leading-relaxed">
                Chat with an AI companion that knows your therapy history and provides contextual support when you need it most.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card card-hover p-8 text-center"
            >
              <div className="w-20 h-20 bg-secondary-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-secondary-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">Therapist-Approved Tools</h3>
              <p className="text-neutral-600 leading-relaxed">
                Access a library of coping techniques and exercises specifically recommended by your therapist for your unique needs.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="card card-hover p-8 text-center"
            >
              <div className="w-20 h-20 bg-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-teal-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">Session Insights</h3>
              <p className="text-neutral-600 leading-relaxed">
                Review key takeaways from your therapy sessions and track your progress over time with visual insights.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-neutral-800 mb-8">Always There When You Need Support</h2>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mr-6 mt-2 flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-3">24/7 Availability</h3>
                    <p className="text-neutral-600 leading-relaxed">Get support whenever you need it, not just during therapy hours.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center mr-6 mt-2 flex-shrink-0">
                    <Brain className="w-6 h-6 text-secondary-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-3">Contextual Understanding</h3>
                    <p className="text-neutral-600 leading-relaxed">AI that remembers your therapy sessions and provides relevant, personalized guidance.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mr-6 mt-2 flex-shrink-0">
                    <Shield className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-3">Privacy & Security</h3>
                    <p className="text-neutral-600 leading-relaxed">Your conversations and data are encrypted and completely confidential.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card p-10 shadow-large"
            >
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-primary-50 rounded-2xl p-4 flex-grow">
                    <p className="text-primary-800 font-medium">I'm feeling anxious about my presentation tomorrow...</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-neutral-300 rounded-2xl flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-neutral-600" />
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex-grow shadow-soft">
                    <p className="text-neutral-700 leading-relaxed">I understand that presentations trigger your anxiety. Based on your recent sessions, the 4-7-8 breathing technique has been helpful. Would you like to practice it together?</p>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <span className="text-sm text-neutral-500 bg-neutral-100 px-4 py-2 rounded-full">
                    Personalized support based on your therapy history
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-24 px-6 bg-neutral-50" data-waitlist-section>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-neutral-800 mb-6">Be Among the First</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Zentia is launching soon! Join our exclusive waitlist for early access, special launch pricing, and beta features.
            </p>
          </motion.div>
          
          <WaitlistCTA />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-teal opacity-90"></div>
        <div className="relative z-10 py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Mental Health Journey?</h2>
              <p className="text-xl text-white/90 mb-12 leading-relaxed">
                Join thousands who are already experiencing the benefits of personalized digital therapy support.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={() => navigate('/client')}
                  className="group px-10 py-4 bg-white text-teal-600 rounded-2xl font-semibold hover:bg-white/95 transition-all duration-300 shadow-large flex items-center justify-center"
                >
                  <Heart className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Zentia Companion
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => navigate('/therapist')}
                  className="group px-10 py-4 border-2 border-white text-white rounded-2xl font-semibold hover:bg-white hover:text-teal-600 transition-all duration-300 flex items-center justify-center"
                >
                  <Users className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Zentia Professional
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons - Only show to admins */}
      {isAdmin && (
        <div className="fixed bottom-8 right-8 z-40 space-y-3">
          {/* Admin Button */}
          <motion.a
            href="/waitlist-admin"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 150 }}
            className="block w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            title="Waitlist Admin"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </motion.a>

          {/* Notification Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 150 }}
            onClick={() => setShowNotifications(true)}
            className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
            title="View Notifications"
          >
            <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">3</span>
            </div>
          </motion.button>
        </div>
      )}

      {/* Notification History Modal - Only for admins */}
      <AnimatePresence>
        {showNotifications && isAdmin && (
          <NotificationHistory
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Home;