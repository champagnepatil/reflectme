import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Eye, 
  Calendar,
  Server,
  Users,
  AlertTriangle,
  CheckCircle,
  Globe
} from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">Privacy Policy</h1>
                  <p className="text-neutral-600">How we protect and handle your health information</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-900 mb-1">HIPAA Compliant</p>
                  <p className="text-green-700">
                    Our platform is designed to comply with HIPAA regulations and maintains the highest standards 
                    for protecting your personal health information.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Overview */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Privacy at a Glance</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-neutral-900 mb-2">Data Protection</h3>
                  <p className="text-sm text-neutral-600">End-to-end encryption and secure storage of all health data</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-neutral-900 mb-2">Limited Access</h3>
                  <p className="text-sm text-neutral-600">Only authorized healthcare providers can access your information</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-neutral-900 mb-2">Your Control</h3>
                  <p className="text-sm text-neutral-600">You control who can see your data and can request deletion anytime</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
              
              {/* Section 1: Information We Collect */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Information We Collect</h2>
                <div className="prose prose-neutral max-w-none">
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Personal Health Information (PHI)</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Mental health assessments and screening results</li>
                    <li>Mood tracking data and journal entries</li>
                    <li>Communication with healthcare providers</li>
                    <li>Treatment goals and progress notes</li>
                    <li>Crisis intervention records and safety plans</li>
                    <li>Medication information and adherence data</li>
                  </ul>

                  <h3 className="text-lg font-medium text-neutral-900 mb-3 mt-6">Account Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name, email address, and contact information</li>
                    <li>Date of birth and demographic information</li>
                    <li>Emergency contact details</li>
                    <li>Healthcare provider information</li>
                    <li>Insurance information (if applicable)</li>
                  </ul>

                  <h3 className="text-lg font-medium text-neutral-900 mb-3 mt-6">Technical Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Device information and operating system</li>
                    <li>IP address and location data (if enabled)</li>
                    <li>Usage patterns and feature interactions</li>
                    <li>Error logs and technical diagnostics</li>
                  </ul>
                </div>
              </section>

              {/* Section 2: How We Use Your Information */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. How We Use Your Information</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>We use your information solely for legitimate healthcare purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Treatment Support:</strong> Providing AI-powered insights and personalized recommendations</li>
                    <li><strong>Care Coordination:</strong> Facilitating communication between you and your healthcare providers</li>
                    <li><strong>Progress Tracking:</strong> Monitoring your mental health journey and treatment outcomes</li>
                    <li><strong>Crisis Prevention:</strong> Identifying patterns that may indicate risk and providing appropriate interventions</li>
                    <li><strong>Platform Improvement:</strong> Analyzing aggregated, de-identified data to enhance our services</li>
                    <li><strong>Legal Compliance:</strong> Meeting regulatory requirements and responding to legal requests</li>
                  </ul>
                </div>
              </section>

              {/* Section 3: Information Sharing */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. When We Share Your Information</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>We share your information only in specific, limited circumstances:</p>
                  
                  <h3 className="text-lg font-medium text-neutral-900 mb-3 mt-6">With Your Consent</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Healthcare providers you've authorized to access your data</li>
                    <li>Family members or caregivers you've designated</li>
                    <li>Research studies you've chosen to participate in</li>
                  </ul>

                  <h3 className="text-lg font-medium text-neutral-900 mb-3 mt-6">For Treatment Purposes</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Emergency medical personnel during crisis situations</li>
                    <li>Healthcare providers involved in your care team</li>
                    <li>Insurance companies for coverage verification (with your consent)</li>
                  </ul>

                  <h3 className="text-lg font-medium text-neutral-900 mb-3 mt-6">Legal Requirements</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Court orders or legal subpoenas</li>
                    <li>Reporting requirements for abuse or neglect</li>
                    <li>Public health emergencies or disease outbreaks</li>
                    <li>Imminent threats to health or safety</li>
                  </ul>
                </div>
              </section>

              {/* Section 4: Data Security */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. How We Protect Your Information</h2>
                <div className="prose prose-neutral max-w-none">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start">
                    <Server className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">Enterprise-Grade Security</p>
                      <p className="text-blue-700">
                        We employ bank-level security measures to protect your sensitive health information.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Technical Safeguards</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>AES-256 encryption for data at rest and in transit</li>
                    <li>Multi-factor authentication for all user accounts</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Secure cloud infrastructure with redundant backups</li>
                    <li>Access logging and monitoring for all data interactions</li>
                  </ul>

                  <h3 className="text-lg font-medium text-neutral-900 mb-3 mt-6">Administrative Safeguards</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Strict employee background checks and training</li>
                    <li>Role-based access controls limiting data exposure</li>
                    <li>Business Associate Agreements with all vendors</li>
                    <li>Incident response procedures for data breaches</li>
                    <li>Regular compliance training and awareness programs</li>
                  </ul>
                </div>
              </section>

              {/* Section 5: Your Rights */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Your Privacy Rights</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>Under HIPAA and other privacy laws, you have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> Request a copy of your health information</li>
                    <li><strong>Correct:</strong> Request amendments to inaccurate information</li>
                    <li><strong>Restrict:</strong> Limit how your information is used or shared</li>
                    <li><strong>Delete:</strong> Request deletion of your account and data</li>
                    <li><strong>Portable:</strong> Export your data in a machine-readable format</li>
                    <li><strong>Complain:</strong> File complaints about privacy practices</li>
                  </ul>

                  <p className="mt-4">
                    To exercise these rights, contact our Privacy Officer at privacy@mentalhealth-platform.com 
                    or use the privacy controls in your account settings.
                  </p>
                </div>
              </section>

              {/* Section 6: Data Retention */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Data Retention</h2>
                <div className="prose prose-neutral max-w-none">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Active Accounts:</strong> We retain your data while your account is active and for legitimate healthcare purposes</li>
                    <li><strong>Inactive Accounts:</strong> Data is deleted after 7 years of inactivity, unless legally required to retain longer</li>
                    <li><strong>Deleted Accounts:</strong> Data is permanently deleted within 30 days of account deletion request</li>
                    <li><strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal or regulatory requirements</li>
                    <li><strong>De-identified Data:</strong> Anonymized data may be retained indefinitely for research and platform improvement</li>
                  </ul>
                </div>
              </section>

              {/* Section 7: International Users */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">7. International Data Transfers</h2>
                <div className="prose prose-neutral max-w-none">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start">
                    <Globe className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900 mb-1">Cross-Border Data Processing</p>
                      <p className="text-amber-700">
                        Your data may be processed in countries with different privacy laws. We ensure adequate protection through appropriate safeguards.
                      </p>
                    </div>
                  </div>
                  <p>
                    If you are located outside the United States, please note that we may transfer your information to the U.S. 
                    where our servers are located. We implement appropriate safeguards to ensure your data remains protected 
                    according to this Privacy Policy and applicable law.
                  </p>
                </div>
              </section>

              {/* Section 8: Changes to Privacy Policy */}
              <section>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">8. Changes to This Privacy Policy</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Sending an email notification to your registered address</li>
                    <li>Posting a prominent notice on our Platform</li>
                    <li>Requesting your consent for significant changes affecting your rights</li>
                  </ul>
                  <p>
                    Your continued use of the Platform after such changes constitutes your acceptance of the updated Privacy Policy.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="border-t border-neutral-200 pt-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Contact Our Privacy Team</h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    If you have questions about this Privacy Policy or our privacy practices:
                  </p>
                  <div className="bg-neutral-50 rounded-lg p-4 mt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-2">Privacy Officer</h4>
                        <ul className="text-sm text-neutral-600 space-y-1">
                          <li>Email: privacy@mentalhealth-platform.com</li>
                          <li>Phone: 1-800-PRIVACY-HELP</li>
                          <li>Response time: 48 hours</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-2">Mailing Address</h4>
                        <div className="text-sm text-neutral-600">
                          <p>Privacy Department<br />
                          Mental Health Platform Inc.<br />
                          123 Wellness Street<br />
                          Mental Health City, MH 12345</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                to="/terms"
                className="btn btn-primary flex items-center"
              >
                View Terms of Service
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

export default PrivacyPolicy; 