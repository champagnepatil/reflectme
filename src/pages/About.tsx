import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, ArrowRight } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90"></div>
        <div className="relative z-10 px-6 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-8 border border-white/30">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">About Zentia</h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                Building the future of mental health support through compassionate AI technology
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary-50 via-secondary-50 to-teal-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl mb-8">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl font-bold text-neutral-800 mb-8">Our Mission</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-2xl text-neutral-700 font-medium mb-8 leading-relaxed">
                "We're building Zentia to help therapists stay 24x7 with their clients."
              </p>
              <p className="text-xl text-neutral-600 leading-relaxed mb-8">
                Zentia handles your clients 24x7 based on your patterns: therapy style, therapy notes and client history. 
                It's like your <span className="font-semibold text-primary-600">AI clone</span> which chats with clients based on your instructions. 
                Give your clients the premium support that they deserve.
              </p>
              <div className="bg-white/80 backdrop-blur-sm border border-orange-200 rounded-2xl p-6 inline-block">
                <p className="text-lg text-orange-800 font-semibold">
                  🚫 "People are going to ChatGPT when they feel lonely or overwhelmed. Let's stop that!"
                </p>
              </div>
            </div>
          </motion.div>

          {/* Psychology Quote */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-20 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-6xl text-primary-600 mb-4">"</div>
              <blockquote className="text-2xl font-medium text-neutral-800 italic mb-6 leading-relaxed">
                The therapeutic relationship is the most powerful predictor of positive outcomes in mental health treatment. 
                Technology should enhance, not replace, this human connection.
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-secondary-600 rounded-full mr-4"></div>
                <cite className="text-lg text-neutral-600 font-semibold">Dr. Carl Rogers</cite>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Founding Team */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-neutral-800 mb-4">Meet Our Founding Team</h3>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Passionate entrepreneurs and mental health advocates committed to revolutionizing therapy support
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Luca De Angelis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="card p-8 text-center group hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">LD</span>
              </div>
              <h4 className="text-2xl font-bold text-neutral-800 mb-2">Luca De Angelis</h4>
              <p className="text-primary-600 font-semibold mb-4">Co-Founder</p>
              <p className="text-neutral-600 leading-relaxed mb-6">
                 Tech entrepreneur with expertise in AI and mental health applications. Passionate about creating 
                technology that enhances human connection and therapeutic outcomes.
              </p>
              <a 
                href="https://www.linkedin.com/in/luca-de-angelis/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn Profile
              </a>
            </motion.div>

            {/* Saurabh Lohiya */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card p-8 text-center group hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">SL</span>
              </div>
              <h4 className="text-2xl font-bold text-neutral-800 mb-2">Saurabh Lohiya</h4>
              <p className="text-secondary-600 font-semibold mb-4">Co-Founder</p>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Visionary leader focused on scaling mental health solutions. Expert in product strategy and 
                building teams that deliver impactful healthcare technology.
              </p>
              <a 
                href="https://www.linkedin.com/in/saurabhlohiya1/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-secondary-600 hover:text-secondary-700 font-semibold transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn Profile
              </a>
            </motion.div>

            {/* Vaibhav Patil */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="card p-8 text-center group hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">VP</span>
              </div>
              <h4 className="text-2xl font-bold text-neutral-800 mb-2">Vaibhav Patil</h4>
              <p className="text-teal-600 font-semibold mb-4">Co-Founder</p>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Product innovation expert with deep understanding of user experience in healthcare. 
                Drives product development that puts therapists and clients first.
              </p>
              <a 
                href="https://www.linkedin.com/in/vaibhavpatill/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn Profile
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary-50 via-secondary-50 to-teal-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 text-white max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">Join Our Mission</h3>
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                Ready to witness first-hand how we empower therapists? Join our founding team for an exclusive demo.
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-white/80 mb-1">Date</div>
                    <div className="text-lg font-semibold">Saturday, 21st June</div>
                  </div>
                  <div className="hidden md:block w-px h-12 bg-white/30"></div>
                  <div className="text-center">
                    <div className="text-sm text-white/80 mb-1">Time</div>
                    <div className="text-lg font-semibold">11:00 AM IST</div>
                  </div>
                  <div className="hidden md:block w-px h-12 bg-white/30"></div>
                  <div className="text-center">
                    <div className="text-sm text-white/80 mb-1">Duration</div>
                    <div className="text-lg font-semibold">30 minutes</div>
                  </div>
                </div>
              </div>
              <button className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-2xl font-semibold hover:bg-white/95 transition-all duration-300 shadow-lg group">
                <Calendar className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Join the Demo Call
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About; 