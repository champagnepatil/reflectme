// Test endpoint per verificare l'integrazione Resend
// URL: /api/test/send-email

import { NextApiRequest, NextApiResponse } from 'next';
import { sendAssessmentReminder, sendCrisisAlert } from '../../../services/emailService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, to, data } = req.body;

    if (!type || !to) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, to' 
      });
    }

    let result: boolean;

    switch (type) {
      case 'assessment-reminder':
        if (!data?.clientName || !data?.instrumentName || !data?.dueDate) {
          return res.status(400).json({
            error: 'Missing assessment reminder data: clientName, instrumentName, dueDate'
          });
        }

        // Genera magic link di test
        const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5174'}/assessment/test-123?token=demo_token_12345`;

        result = await sendAssessmentReminder(to, {
          clientName: data.clientName,
          instrumentName: data.instrumentName,
          dueDate: data.dueDate,
          magicLink: magicLink
        });
        break;

      case 'crisis-alert':
        if (!data?.clientName || !data?.therapistEmail || !data?.assessmentData) {
          return res.status(400).json({
            error: 'Missing crisis alert data: clientName, therapistEmail, assessmentData'
          });
        }

        result = await sendCrisisAlert(
          data.therapistEmail,
          data.clientName,
          data.assessmentData
        );
        break;

      default:
        return res.status(400).json({
          error: 'Invalid email type. Use: assessment-reminder, crisis-alert'
        });
    }

    if (result) {
      res.status(200).json({
        success: true,
        message: `${type} email sent successfully`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to send ${type} email`
      });
    }

  } catch (error) {
    console.error('Email test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Esempi di utilizzo:

/*
1. Test Assessment Reminder:
POST /api/test/send-email
{
  "type": "assessment-reminder",
  "to": "test@example.com",
  "data": {
    "clientName": "Mario Rossi",
    "instrumentName": "PHQ-9",
    "dueDate": "2024-12-25"
  }
}

2. Test Crisis Alert:
POST /api/test/send-email
{
  "type": "crisis-alert",
  "to": "therapist@example.com",
  "data": {
    "clientName": "Mario Rossi",
    "therapistEmail": "therapist@example.com",
    "assessmentData": {
      "instrument": "PHQ-9",
      "score": 22,
      "responses": {
        "phq9_9": 2
      }
    }
  }
}
*/ 