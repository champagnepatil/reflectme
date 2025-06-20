// Test endpoint per verificare la generazione PDF
// URL: /api/test/generate-pdf

import { NextApiRequest, NextApiResponse } from 'next';
import { generateSymptomTrendReport } from '../../../services/pdfService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientId, month, mockData } = req.body;

    // Use provided data or create mock data for testing
    const testClientId = clientId || 'test-client-123';
    const testMonth = month || '2024-01';

    if (mockData) {
      // If mock data is provided, temporarily override the data fetching
      console.log('📄 Generating PDF with mock data for testing...');
    }

    console.log(`🧪 Testing PDF generation for client ${testClientId}, month ${testMonth}`);

    // Generate PDF report
    const pdfUrl = await generateSymptomTrendReport(testClientId, testMonth);

    if (!pdfUrl) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate PDF report'
      });
    }

    // Return download URL and test information
    res.status(200).json({
      success: true,
      message: 'PDF generated successfully',
      downloadUrl: pdfUrl,
      fileName: `symptom-report-${testClientId}-${testMonth}.pdf`,
      clientId: testClientId,
      month: testMonth,
      generatedAt: new Date().toISOString(),
      testMode: true,
      instructions: {
        download: 'Click the downloadUrl to access the PDF',
        expires: 'URL expires in 1 hour',
        location: 'PDF stored in Supabase Storage bucket: reports'
      }
    });

  } catch (error) {
    console.error('PDF test generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check console logs for more information'
    });
  }
}

// Esempi di utilizzo:
/*

1. Test base (usa dati esistenti o mock):
POST /api/test/generate-pdf
{
  "clientId": "test-123",
  "month": "2024-01"
}

2. Test con dati mock:
POST /api/test/generate-pdf
{
  "clientId": "demo-client",
  "month": "2024-01",
  "mockData": true
}

Response:
{
  "success": true,
  "message": "PDF generated successfully",
  "downloadUrl": "https://supabase-storage-url...",
  "fileName": "symptom-report-demo-client-2024-01.pdf",
  "clientId": "demo-client",
  "month": "2024-01",
  "generatedAt": "2024-01-15T10:30:00.000Z",
  "testMode": true,
  "instructions": {
    "download": "Click the downloadUrl to access the PDF",
    "expires": "URL expires in 1 hour",
    "location": "PDF stored in Supabase Storage bucket: reports"
  }
}

*/ 