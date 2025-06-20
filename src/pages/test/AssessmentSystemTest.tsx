import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  testReminderSystem, 
  reminderSystemHealthCheck 
} from '@/workers/assessmentReminder';
import { generateSymptomTrendReport } from '@/services/pdfService';
import { 
  sendAssessmentReminder, 
  sendCrisisAlert, 
  generateMagicLink,
  validateMagicLink 
} from '@/services/emailService';
import { CheckCircle, XCircle, AlertTriangle, Play, Database } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export const AssessmentSystemTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Health Check
      addResult({ name: 'System Health Check', status: 'pending', message: 'Verifying system status...' });
      try {
        const healthCheck = await reminderSystemHealthCheck();
        addResult({
          name: 'System Health Check',
          status: healthCheck.status === 'healthy' ? 'success' : 'error',
          message: `Status: ${healthCheck.status}`,
          data: healthCheck.details
        });
      } catch (error) {
        addResult({
          name: 'System Health Check',
          status: 'error',
          message: `Error: ${error}`
        });
      }

      // Test 2: Magic Link Generation
      addResult({ name: 'Magic Link Generation', status: 'pending', message: 'Generating magic link...' });
      try {
        const magicLink = generateMagicLink('test-assessment-123', 'test-client-456');
        const isValid = validateMagicLink(magicLink.split('?token=')[1], 'test-assessment-123');
        addResult({
          name: 'Magic Link Generation',
          status: isValid ? 'success' : 'error',
          message: isValid ? 'Magic link generated and validated' : 'Validation failed',
          data: { link: magicLink }
        });
      } catch (error) {
        addResult({
          name: 'Magic Link Generation',
          status: 'error',
          message: `Error: ${error}`
        });
      }

      // Test 3: Email Service (Mock)
      addResult({ name: 'Email Service Test', status: 'pending', message: 'Testing email sending...' });
      try {
        const emailSent = await sendAssessmentReminder('test@example.com', {
          clientName: 'Test Client',
          instrumentName: 'PHQ-9',
          dueDate: new Date().toISOString(),
          magicLink: 'https://test.com/assessment/123?token=abc'
        });
        addResult({
          name: 'Email Service Test',
          status: emailSent ? 'success' : 'error',
          message: emailSent ? 'Email sent successfully (demo)' : 'Email sending failed'
        });
      } catch (error) {
        addResult({
          name: 'Email Service Test',
          status: 'error',
          message: `Error: ${error}`
        });
      }

      // Test 4: PDF Generation
      addResult({ name: 'PDF Generation Test', status: 'pending', message: 'Generating PDF report...' });
      try {
        const pdfUrl = await generateSymptomTrendReport('demo-client-1', '2024-01');
        addResult({
          name: 'PDF Generation Test',
          status: pdfUrl ? 'success' : 'error',
          message: pdfUrl ? 'PDF generated successfully' : 'PDF generation failed',
          data: { url: pdfUrl }
        });
      } catch (error) {
        addResult({
          name: 'PDF Generation Test',
          status: 'error',
          message: `Error: ${error}`
        });
      }

      // Test 5: Crisis Alert
      addResult({ name: 'Crisis Alert Test', status: 'pending', message: 'Testing crisis alert...' });
      try {
        const alertSent = await sendCrisisAlert('therapist@example.com', 'Test Client', {
          instrument: 'PHQ-9',
          score: 20,
          responses: { phq9_9: 2 }
        });
        addResult({
          name: 'Crisis Alert Test',
          status: alertSent ? 'success' : 'error',
          message: alertSent ? 'Crisis alert sent' : 'Crisis alert sending failed'
        });
      } catch (error) {
        addResult({
          name: 'Crisis Alert Test',
          status: 'error',
          message: `Error: ${error}`
        });
      }

      // Test 6: Reminder System
      addResult({ name: 'Reminder System Test', status: 'pending', message: 'Testing reminder system...' });
      try {
        await testReminderSystem();
        addResult({
          name: 'Reminder System Test',
          status: 'success',
          message: 'Reminder system tested successfully'
        });
      } catch (error) {
        addResult({
          name: 'Reminder System Test',
          status: 'error',
          message: `Error: ${error}`
        });
      }

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-error-600" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-warning-600 animate-pulse" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            🧪 Assessment System Test Suite
          </h1>
          <p className="text-neutral-600 mb-6">
            Verifies the functionality of all components of Phase 2
          </p>
          
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="btn btn-primary flex items-center mx-auto"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Tests in progress...' : 'Start Test Suite'}
          </button>
        </motion.div>

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 mb-8"
          >
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Test Results
            </h2>
            
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        {result.name}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        {result.message}
                      </p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-neutral-500 cursor-pointer">
                            Show details
                          </summary>
                          <pre className="mt-2 p-2 bg-neutral-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            System Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <strong className="text-neutral-900">Phase 2 Status:</strong>
              <p className="text-success-600">✅ Client-side Complete</p>
            </div>
            <div>
              <strong className="text-neutral-900">Components:</strong>
              <p className="text-neutral-600">8/8 Implemented</p>
            </div>
            <div>
              <strong className="text-neutral-900">Backend Required:</strong>
              <p className="text-warning-600">⚠️ Configurazione Supabase</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 text-sm">
              <strong>💡 Next steps:</strong> Configure the Supabase database schema, 
              provider email and CRON system. See <code>PHASE2_SETUP.md</code> for complete instructions.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            🎯 Features Implemented
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                <span>API Supabase Integration</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                <span>Email Reminder System</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                <span>PDF Report Generation</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                <span>Realtime Updates</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                <span>Crisis Alert System</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                <span>CRON Job Workers</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                <span>Magic Link Security</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                <span>Clinical Validations</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 