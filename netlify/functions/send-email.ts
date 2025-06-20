import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { to, subject, html, text, type = 'waitlist' } = JSON.parse(event.body || '{}');

    if (!to || !subject || !html) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
      };
    }

    // Initialize Resend with server-side API key
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey || resendApiKey === 'demo' || resendApiKey === 'your-resend-api-key') {
      console.log('⚠️ No valid Resend API key found, simulating email send');
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          messageId: `demo-${Date.now()}`,
          message: 'Email simulated (no API key configured)' 
        }),
      };
    }

    const resend = new Resend(resendApiKey);

    const response = await resend.emails.send({
      from: 'ReflectMe Team <hello@reflectme.app>',
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text fallback
      tags: [
        { name: 'type', value: type },
        { name: 'source', value: 'waitlist' }
      ]
    });

    if (response.error) {
      console.error('❌ Resend error:', response.error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: false, 
          error: response.error.message || 'Failed to send email' 
        }),
      };
    }

    console.log('✅ Email sent successfully:', response.data?.id);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: true, 
        messageId: response.data?.id 
      }),
    };

  } catch (error) {
    console.error('❌ Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
    };
  }
}; 