# Email Service Setup Guide

## Overview
This guide explains how to set up real email sending for the ReflectMe waitlist system using Resend.

## Prerequisites
1. A Resend account (sign up at https://resend.com)
2. A verified domain in Resend (or use their sandbox domain for testing)

## Setup Steps

### 1. Get Your Resend API Key
1. Sign up for a Resend account at https://resend.com
2. Go to your dashboard and generate an API key
3. Copy the API key (it starts with `re_`)

### 2. Configure Environment Variables
Add the following to your `.env` file:

```env
VITE_RESEND_API_KEY=your_resend_api_key_here
```

### 3. Domain Configuration (Optional)
- For production, verify your domain in Resend
- Update the `fromEmail` in `src/services/RealEmailService.ts` to use your domain
- For testing, you can use `onboarding@resend.dev`

### 4. Email Templates
The service includes pre-built email templates for:
- **Welcome emails**: Sent when users join the waitlist
- **Update emails**: Development progress updates
- **Launch emails**: Product launch notifications
- **Reminder emails**: Re-engagement campaigns

### 5. Features Included
- ✅ Real email sending via Resend API
- ✅ HTML and text versions of all emails
- ✅ Personalized content (position in queue, etc.)
- ✅ Email delivery tracking
- ✅ Bulk email campaigns
- ✅ Rate limiting protection
- ✅ Error handling and logging

## Usage

### Automatic Welcome Emails
When someone joins the waitlist via the homepage, they automatically receive a welcome email with:
- Personal welcome message
- Their position in the queue
- Benefits overview (50% discount, priority access, beta features)
- Next steps and expectations

### Manual Email Campaigns
Visit `/email-campaigns` to:
- Send development updates to all subscribers
- Send test welcome emails
- View campaign results and statistics
- Track delivery success rates

### Admin Access
- **Waitlist Management**: `/waitlist-admin`
- **Email Campaigns**: `/email-campaigns`

## API Limits
Resend free tier includes:
- 3,000 emails per month
- 100 emails per day
- All features included

For higher volumes, check Resend's pricing plans.

## Troubleshooting

### Email Not Sending
1. Check your API key is correct
2. Verify your domain is set up properly
3. Check the browser console for error messages
4. Ensure you're not hitting rate limits

### Testing
Use the "Welcome Email" campaign type to send test emails to verify your setup.

## Security Notes
- Never commit your Resend API key to version control
- Use environment variables for sensitive configuration
- Consider using different API keys for development and production

## Support
For issues with the email service:
1. Check Resend documentation: https://resend.com/docs
2. Review the console logs for error messages
3. Test with a single email first before bulk campaigns 