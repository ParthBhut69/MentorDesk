const nodemailer = require('nodemailer');

/**
 * Email service for sending OTP and other emails
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        // Check if email configuration exists
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
            console.warn('⚠️  Email service not configured. OTP emails will be logged to console.');
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            console.log('✅ Email service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
        }
    }

    /**
     * Send OTP email to user
     * @param {string} email - Recipient email
     * @param {string} otp - 6-digit OTP code
     * @param {string} userName - User's name
     */
    async sendOTP(email, otp, userName = 'User') {
        const subject = 'Your MentorDesk Login Code';
        const html = this.getOTPEmailTemplate(otp, userName);
        const text = `Your MentorDesk login code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`;

        return this.sendEmail(email, subject, html, text);
    }

    /**
     * Send email
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - HTML content
     * @param {string} text - Plain text content
     */
    async sendEmail(to, subject, html, text) {
        // If transporter is not configured, log to console (development mode)
        if (!this.transporter) {
            console.log('\n📧 EMAIL (Development Mode - Not Sent)');
            console.log('═══════════════════════════════════════');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${text}`);
            console.log('═══════════════════════════════════════\n');
            return { success: true, mode: 'development' };
        }

        try {
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || `"MentorDesk" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text,
                html,
            });

            console.log(`✅ Email sent to ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`❌ Failed to send email to ${to}:`, error.message);
            throw new Error('Failed to send email. Please try again later.');
        }
    }

    /**
     * Get HTML template for OTP email
     * @param {string} otp - 6-digit OTP code
     * @param {string} userName - User's name
     * @returns {string} HTML template
     */
    getOTPEmailTemplate(otp, userName) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your MentorDesk Login Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">MentorDesk</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Hi ${userName},</h2>
                            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                You requested a login code for your MentorDesk account. Use the code below to complete your sign-in:
                            </p>
                            
                            <!-- OTP Code Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td align="center" style="padding: 20px; background-color: #f7fafc; border-radius: 8px; border: 2px dashed #cbd5e0;">
                                        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                                            ${otp}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                This code will <strong>expire in 5 minutes</strong>.
                            </p>
                            
                            <!-- Warning Box -->
                            <div style="margin: 30px 0; padding: 16px; background-color: #fff5f5; border-left: 4px solid #f56565; border-radius: 4px;">
                                <p style="margin: 0; color: #742a2a; font-size: 14px; line-height: 1.6;">
                                    <strong>Security Notice:</strong> If you didn't request this code, please ignore this email and ensure your account is secure.
                                </p>
                            </div>
                            
                            <p style="margin: 20px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                Best regards,<br>
                                <strong>The MentorDesk Team</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.6;">
                                This is an automated message from MentorDesk. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }
}

// Export singleton instance
module.exports = new EmailService();
