// API endpoint per scaricare report PDF
// URL: /api/reports/download?clientId=xxx&month=xxx

import { NextApiRequest, NextApiResponse } from 'next';
import { generateSymptomTrendReport } from '../../../services/pdfService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientId, month } = req.query;

    // Validate parameters
    if (!clientId || !month) {
      return res.status(400).json({ 
        error: 'Missing required parameters: clientId, month' 
      });
    }

    if (typeof clientId !== 'string' || typeof month !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid parameter types' 
      });
    }

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({ 
        error: 'Invalid month format. Use YYYY-MM (e.g., 2024-01)' 
      });
    }

    console.log(`📄 Generating PDF report for client ${clientId}, month ${month}`);

    // Generate PDF report
    const pdfUrl = await generateSymptomTrendReport(clientId, month);

    if (!pdfUrl) {
      return res.status(500).json({
        error: 'Failed to generate PDF report'
      });
    }

    // Return signed URL for download
    res.status(200).json({
      success: true,
      downloadUrl: pdfUrl,
      fileName: `symptom-report-${clientId}-${month}.pdf`,
      expiresIn: '1 hour',
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('PDF download endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Esempi di utilizzo:
/*
GET /api/reports/download?clientId=12345&month=2024-01

Response:
{
  "success": true,
  "downloadUrl": "https://supabase-url/storage/...",
  "fileName": "symptom-report-12345-2024-01.pdf",
  "expiresIn": "1 hour",
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
*/ 