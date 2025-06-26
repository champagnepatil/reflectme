import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { ArrowLeft, Shield, AlertTriangle, Calendar } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const lastUpdated = "January 15, 2024";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow bg-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="flex items-center mb-6">
                <Link
                  to="/register"
                  className="flex items-center text-neutral-600 hover:text-neutral-900 mr-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Registration
                </Link>
                <div className="flex items-center text-sm text-neutral-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Last updated: {lastUpdated}
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">Terms of Service</h1>
                  <p className="text-neutral-600">Mental Health Platform Agreement</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 mb-1">Important Notice</p>
                  <p className="text-amber-700">
                    This platform provides mental health support tools and is not a substitute for professional medical care. 
                    In case of emergency, please contact 911 or your local emergency services immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
              
              {/* Section 1: Agreement to Terms */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Agreement to Terms</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    By accessing and using our mental health platform ("Platform"), you agree to be bound by these Terms of Service 
                    and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from 
                    using or accessing this Platform.
                  </p>
                  <p>
                    These terms apply to all users of the Platform, including patients/clients, therapists, and healthcare providers.
                  </p>
                </div>
              </section>

              {/* Section 2: Platform Description */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Platform Description</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>Our Platform provides:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>AI-powered mental health support tools and chatbots</li>
                    <li>Digital journaling and mood tracking capabilities</li>
                    <li>Secure communication between patients and healthcare providers</li>
                    <li>Progress tracking and analytics for mental health wellness</li>
                    <li>Educational resources and coping strategy suggestions</li>
                    <li>Crisis intervention resources and emergency contacts</li>
                  </ul>
                  <p>
                    <strong>The Platform is not intended to provide medical diagnosis, treatment, or emergency services.</strong> 
                    It is designed to supplement, not replace, professional mental healthcare.
                  </p>
                </div>
              </section>

              {/* Section 3: User Eligibility */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. User Eligibility</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>To use this Platform, you must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Be at least 18 years old or have parental/guardian consent</li>
                    <li>Provide accurate and complete registration information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                  <p>
                    For users under 18, parental or guardian consent is required, and certain features may be limited 
                    to ensure appropriate care and privacy protection.
                  </p>
                </div>
              </section>

              {/* Section 4: HIPAA and Privacy */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. HIPAA Compliance and Privacy</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    Our Platform is designed to comply with the Health Insurance Portability and Accountability Act (HIPAA) 
                    and other applicable privacy regulations:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All health information is encrypted in transit and at rest</li>
                    <li>Access to your information is limited to authorized personnel only</li>
                    <li>We maintain detailed audit logs of all data access</li>
                    <li>You have the right to access, correct, and delete your health information</li>
                    <li>We will not share your information without your explicit consent, except as required by law</li>
                  </ul>
                  <p>
                    By using the Platform, you acknowledge that you have received and reviewed our 
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-700 underline">Privacy Policy</Link>, 
                    which forms part of these Terms.
                  </p>
                </div>
              </section>

              {/* Section 5: Prohibited Uses */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Prohibited Uses</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>You may not use the Platform to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violate any laws or regulations</li>
                    <li>Share or distribute harmful, inappropriate, or illegal content</li>
                    <li>Attempt to gain unauthorized access to other users' accounts or data</li>
                    <li>Use the Platform for commercial purposes without authorization</li>
                    <li>Interfere with or disrupt the Platform's operation</li>
                    <li>Impersonate other users or healthcare professionals</li>
                    <li>Share personal health information of others without consent</li>
                  </ul>
                </div>
              </section>

              {/* Section 6: Crisis and Emergency Situations */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Crisis and Emergency Situations</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    <strong>The Platform is not designed for emergency mental health situations.</strong> 
                    If you are experiencing a mental health crisis or emergency:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Call 911 immediately</li>
                    <li>Contact the National Suicide Prevention Lifeline: 988</li>
                    <li>Go to your nearest emergency room</li>
                    <li>Contact your mental health provider's emergency line</li>
                  </ul>
                  <p>
                    Our AI systems may detect potential crisis indicators and provide appropriate resources, 
                    but this should not be relied upon as a substitute for immediate professional help.
                  </p>
                </div>
              </section>

              {/* Section 7: AI and Technology Limitations */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">7. AI and Technology Limitations</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>You acknowledge and understand that:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>AI systems have limitations and may not always provide accurate or appropriate responses</li>
                    <li>Technology can fail, and the Platform may experience downtime or technical issues</li>
                    <li>AI-generated insights should be considered supplementary to professional medical advice</li>
                    <li>You should always consult with qualified healthcare professionals for medical decisions</li>
                  </ul>
                </div>
              </section>

              {/* Section 8: Limitation of Liability */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">8. Limitation of Liability</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    To the fullest extent permitted by law, the Platform and its operators shall not be liable for any 
                    indirect, incidental, special, consequential, or punitive damages, including but not limited to 
                    loss of profits, data, use, goodwill, or other intangible losses resulting from your use of the Platform.
                  </p>
                  <p>
                    Our total liability to you for any damages shall not exceed the amount you have paid us in the 
                    twelve (12) months preceding the event giving rise to liability.
                  </p>
                </div>
              </section>

              {/* Section 9: Termination */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">9. Account Termination</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
                    including breach of these Terms. Upon termination:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your right to use the Platform will cease immediately</li>
                    <li>You may request a copy of your data within 30 days</li>
                    <li>We will securely delete your data according to our retention policies</li>
                    <li>Any provisions that should survive termination will remain in effect</li>
                  </ul>
                </div>
              </section>

              {/* Section 10: Changes to Terms */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">10. Changes to Terms</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    We reserve the right to modify these Terms at any time. We will notify you of significant changes 
                    via email or through the Platform. Your continued use of the Platform after such changes constitutes 
                    your acceptance of the new Terms.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="border-t border-neutral-200 pt-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Contact Information</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <ul className="list-none space-y-1">
                    <li>Email: legal@mentalhealth-platform.com</li>
                    <li>Phone: 1-800-MENTAL-HEALTH</li>
                    <li>Address: 123 Wellness Street, Mental Health City, MH 12345</li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-8 flex items-center justify-between">
              <Link
                to="/register"
                className="btn btn-outline flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Registration
              </Link>
              <Link
                to="/privacy"
                className="btn btn-primary flex items-center"
              >
                View Privacy Policy
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService; 