import React, { useState } from 'react';
import { generateSymptomTrendReport } from '@/services/pdfService';
import { Download, FileText, Loader, CheckCircle, AlertCircle, TestTube } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

export const PDFTestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const testPDFGeneration = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing PDF generation...');
      
      // Test with real client ID from database
      const clientId = '00000000-0000-4000-a000-000000000002';
      const month = '2024-01';
      
      const downloadUrl = await generateSymptomTrendReport(clientId, month);
      
      if (downloadUrl) {
        setTestResult({
          success: true,
          message: 'PDF generated successfully!',
          downloadUrl,
          fileName: `symptom-report-${clientId}-${month}.pdf`
        });
      } else {
        setTestResult({
          success: false,
          message: 'Error generating PDF',
          error: 'The function returned null'
        });
      }
    } catch (error) {
      console.error('PDF test error:', error);
      setTestResult({
        success: false,
        message: 'Error during test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testMockPDF = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing MOCK PDF generation...');
      
      // Simulate PDF generation without Supabase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful result
      setTestResult({
        success: true,
        message: 'Mock PDF generated successfully!',
        downloadUrl: 'data:application/pdf;base64,mock-pdf-content',
        fileName: 'symptom-report-test-client-123-2024-01.pdf'
      });
      
    } catch (error) {
      console.error('Mock PDF test error:', error);
      setTestResult({
        success: false,
        message: 'Error during mock test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (testResult?.downloadUrl) {
      if (testResult.downloadUrl.startsWith('data:')) {
        // Mock download
        alert('📄 This is a mock test.\n\nIn production, the real PDF from Supabase Storage would open here.');
      } else {
        // Real download
        window.open(testResult.downloadUrl, '_blank');
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <FileText className="w-12 h-12 mx-auto mb-2 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Test PDF Generation - Supabase Ready
        </h2>
        <p className="text-sm text-gray-600">
          Database configured ✅ | Storage active ✅
        </p>
      </div>

      <div className="space-y-4">
        {/* Real Test Button */}
        <button
          onClick={testPDFGeneration}
          disabled={isLoading}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              🚀 Test with Supabase
            </>
          )}
        </button>

        {/* Mock Test Button */}
        <button
          onClick={testMockPDF}
          disabled={isLoading}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors border-2 ${
            isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
          }`}
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Generating Mock...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              Test Mock (Without Supabase)
            </>
          )}
        </button>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.message}
                </p>
                
                {testResult.success && testResult.fileName && (
                  <div className="mt-2">
                    <p className="text-sm text-green-700 mb-2">
                      File: {testResult.fileName}
                    </p>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download PDF
                    </button>
                  </div>
                )}
                
                {testResult.error && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-sm">
                    <p className="text-red-800 font-medium">Error:</p>
                    <p className="text-red-700">{testResult.error}</p>
                    {testResult.error.includes('Client not found') && (
                      <p className="text-red-600 mt-1 text-xs">
                        💡 This error is normal without Supabase configured.
                        Use the "Mock Test" above to see the working system.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
          <p><strong>📋 Test Details:</strong></p>
          <p>• <strong>🚀 Test with Supabase:</strong> DB configured, real client</p>
          <p>• <strong>🧪 Mock Test:</strong> Simulates operation without DB</p>
          <p>• Client ID: 00000000-0000-4000-a000-000000000002</p>
          <p>• Email: therapist2@mindtwin.demo</p>
          <p>• Month: 2024-01</p>
          <p>• Template: React PDF Renderer</p>
          <p>• Storage: Supabase (reports bucket)</p>
        </div>
      </div>
    </div>
  );
}; 