export interface EmailTemplate {
  type: 'welcome' | 'update' | 'launch' | 'reminder';
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailData {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text: string;
  metadata?: Record<string, any>;
}

class RealEmailService {
  private fromEmail = 'hello@reflectme.app';
  private fromName = 'ReflectMe Team';

  // Send email using Netlify function (to avoid CORS issues)
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: any }> {
    try {
      console.log(`📧 Sending real email to ${emailData.to}: ${emailData.subject}`);
      
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          type: emailData.metadata?.type || 'waitlist'
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('❌ Failed to send email:', result.error);
        return { success: false, error: result.error };
      }

      console.log(`✅ Real email sent successfully. Message ID: ${result.messageId}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Real email sending error:', error);
      return { success: false, error };
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email: string, subscriberData?: any): Promise<{ success: boolean; messageId?: string; error?: any }> {
    const position = subscriberData?.position_in_queue ? `#${subscriberData.position_in_queue}` : 'early';
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to ReflectMe Waitlist</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; }
            .content { padding: 40px; }
            .welcome-box { background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #667eea30; }
            .benefit { display: flex; align-items: center; margin: 12px 0; padding: 12px; background: #f8fafc; border-radius: 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { padding: 20px; background: #f8fafc; text-align: center; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px;">💙 ReflectMe</div>
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Waitlist!</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Thank you for joining our journey to revolutionize mental health support.</p>
            </div>
            
            <div class="content">
                <div class="welcome-box">
                    <h2 style="margin: 0 0 16px; color: #334155;">Hi there! 👋</h2>
                    <p style="margin: 0; color: #475569; line-height: 1.6;">
                        We're thrilled to have you as part of the ReflectMe community! Your spot on our waitlist has been confirmed, 
                        and you're one step closer to experiencing the future of personalized mental health support.
                    </p>
                    <p style="margin: 16px 0 0; color: #475569; line-height: 1.6;">
                        You're position ${position} in line – thank you for being an early supporter!
                    </p>
                </div>

                <h3 style="color: #334155; margin: 32px 0 16px;">What's coming your way:</h3>
                <div class="benefit">
                    <div style="margin-right: 12px;">🎁</div>
                    <div>
                        <strong>50% Launch Discount</strong><br>
                        <span style="color: #64748b;">Exclusive pricing for early supporters</span>
                    </div>
                </div>
                <div class="benefit">
                    <div style="margin-right: 12px;">⚡</div>
                    <div>
                        <strong>Priority Access</strong><br>
                        <span style="color: #64748b;">Skip the line when we go live</span>
                    </div>
                </div>
                <div class="benefit">
                    <div style="margin-right: 12px;">🚀</div>
                    <div>
                        <strong>Beta Features</strong><br>
                        <span style="color: #64748b;">Test new features before anyone else</span>
                    </div>
                </div>

                <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 32px 0;">
                    <h3 style="margin: 0 0 16px; color: #334155;">What happens next?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                        <li>We'll send you regular updates on our development progress</li>
                        <li>You'll get notified immediately when ReflectMe launches</li>
                        <li>Your exclusive discount will be automatically applied</li>
                        <li>Access to our beta program before public release</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 40px 0;">
                    <a href="https://reflectme.app" class="button">Visit Our Website</a>
                </div>
            </div>

            <div class="footer">
                <p style="margin: 0 0 8px;">Thank you for being part of our mission to transform mental health support.</p>
                <p style="margin: 0 0 16px;">Questions? Reply to this email or visit <a href="mailto:support@reflectme.app" style="color: #667eea;">support@reflectme.app</a></p>
                <p style="margin: 0; font-size: 12px;">
                    You're receiving this because you signed up for the ReflectMe waitlist.<br>
                    <a href="#" style="color: #667eea;">Unsubscribe</a> | <a href="#" style="color: #667eea;">Update preferences</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const textContent = `
Welcome to ReflectMe Waitlist! 🎉

Hi there! 👋

We're thrilled to have you as part of the ReflectMe community! Your spot on our waitlist has been confirmed, and you're one step closer to experiencing the future of personalized mental health support.

You're position ${position} in line – thank you for being an early supporter!

What's coming your way:
🎁 50% Launch Discount - Exclusive pricing for early supporters
⚡ Priority Access - Skip the line when we go live  
🚀 Beta Features - Test new features before anyone else

What happens next?
• We'll send you regular updates on our development progress
• You'll get notified immediately when ReflectMe launches
• Your exclusive discount will be automatically applied
• Access to our beta program before public release

Visit our website: https://reflectme.app

Thank you for being part of our mission to transform mental health support.

Questions? Reply to this email or contact support@reflectme.app

---
You're receiving this because you signed up for the ReflectMe waitlist.
Unsubscribe: [link] | Update preferences: [link]
    `;
    
    return this.sendEmail({
      to: email,
      subject: 'Welcome to ReflectMe Waitlist! 🎉',
      html: htmlContent,
      text: textContent,
      metadata: { type: 'welcome', source: 'waitlist' }
    });
  }

  // Send update email to all subscribers
  async sendUpdateEmail(email: string, subscriberData?: any): Promise<{ success: boolean; messageId?: string; error?: any }> {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>ReflectMe Development Update</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; }
            .content { padding: 40px; }
            .update-box { background: #ecfdf5; border-radius: 16px; padding: 24px; margin: 24px 0; border-left: 4px solid #10b981; }
            .progress-bar { background: #e5e7eb; border-radius: 8px; height: 8px; margin: 16px 0; }
            .progress-fill { background: #10b981; border-radius: 8px; height: 8px; width: 75%; }
            .button { display: inline-block; background: #10b981; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { padding: 20px; background: #f8fafc; text-align: center; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px;">🚀 ReflectMe</div>
                <h1 style="color: white; margin: 0; font-size: 28px;">Development Update</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Great progress this week! We're getting closer to launch.</p>
            </div>
            
            <div class="content">
                <div class="update-box">
                    <h2 style="margin: 0 0 16px; color: #065f46;">This Week's Highlights</h2>
                    <ul style="margin: 0; padding-left: 20px; color: #047857; line-height: 1.8;">
                        <li>✅ AI chat system refined and optimized</li>
                        <li>✅ New coping tools library added</li>
                        <li>✅ Enhanced privacy and security features</li>
                        <li>✅ Mobile app UI/UX improvements</li>
                    </ul>
                </div>

                <h3 style="color: #334155; margin: 32px 0 16px;">Development Progress</h3>
                <p style="color: #64748b; margin: 0 0 8px;">Overall completion: 75%</p>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>

                <h3 style="color: #334155; margin: 32px 0 16px;">Coming Soon</h3>
                <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 16px 0;">
                    <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                        <li>🔧 Final beta testing phase</li>
                        <li>📱 Mobile apps for iOS and Android</li>
                        <li>🎨 Final UI polish and accessibility improvements</li>
                        <li>🚀 Launch preparation and onboarding flows</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 40px 0;">
                    <a href="https://reflectme.app/updates" class="button">Read Full Update</a>
                </div>
            </div>

            <div class="footer">
                <p style="margin: 0 0 8px;">Thank you for your patience and support!</p>
                <p style="margin: 0 0 16px;">Questions? Reply to this email or visit <a href="mailto:support@reflectme.app" style="color: #10b981;">support@reflectme.app</a></p>
                <p style="margin: 0; font-size: 12px;">
                    <a href="#" style="color: #10b981;">Unsubscribe</a> | <a href="#" style="color: #10b981;">Update preferences</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const textContent = `
ReflectMe Development Update 🚀

Great progress this week! We're getting closer to launch.

This Week's Highlights:
✅ AI chat system refined and optimized
✅ New coping tools library added  
✅ Enhanced privacy and security features
✅ Mobile app UI/UX improvements

Development Progress: 75% complete

Coming Soon:
🔧 Final beta testing phase
📱 Mobile apps for iOS and Android
🎨 Final UI polish and accessibility improvements
🚀 Launch preparation and onboarding flows

Read the full update: https://reflectme.app/updates

Thank you for your patience and support!

Questions? Reply to this email or contact support@reflectme.app

---
Unsubscribe: [link] | Update preferences: [link]
    `;
    
    return this.sendEmail({
      to: email,
      subject: 'ReflectMe Development Update 🚀',
      html: htmlContent,
      text: textContent,
      metadata: { type: 'update', source: 'waitlist' }
    });
  }

  // Send bulk emails to multiple subscribers
  async sendBulkEmails(
    emails: string[], 
    type: 'welcome' | 'update' | 'launch' | 'reminder',
    subscribersData?: Record<string, any>
  ): Promise<{ 
    success: number; 
    failed: number; 
    results: Array<{ email: string; success: boolean; messageId?: string; error?: any }> 
  }> {
    const results = [];
    let success = 0;
    let failed = 0;

    console.log(`📧 Starting bulk email send: ${type} to ${emails.length} recipients`);

    for (const email of emails) {
      const subscriberData = subscribersData?.[email];
      let result;

      switch (type) {
        case 'welcome':
          result = await this.sendWelcomeEmail(email, subscriberData);
          break;
        case 'update':
          result = await this.sendUpdateEmail(email, subscriberData);
          break;
        default:
          result = { success: false, error: 'Email type not implemented yet' };
          break;
      }

      if (result.success) {
        success++;
      } else {
        failed++;
      }

      results.push({
        email,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });

      // Add delay between emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📧 Bulk email send complete: ${success} sent, ${failed} failed`);
    return { success, failed, results };
  }
}

export default new RealEmailService(); 