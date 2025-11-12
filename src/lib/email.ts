import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  response?: string;
  error?: string;
}

// Create SMTP transporter
function createTransporter() {
  // Check if SMTP is configured
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️  SMTP not configured. Emails will be logged only.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// Send email via SMTP
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  try {
    const transporter = createTransporter();

    // If SMTP not configured, log and return success (dev mode)
    if (!transporter) {
      console.log('📧 Email (not sent, SMTP not configured):');
      console.log('   To:', options.to.join(', '));
      console.log('   Subject:', options.subject);
      console.log('   Body:', options.text.substring(0, 100) + '...');
      
      return {
        success: true,
        messageId: `dev-${Date.now()}`,
        response: 'Email logged (SMTP not configured)',
      };
    }

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to.join(', '),
      cc: options.cc?.join(', '),
      bcc: options.bcc?.join(', '),
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Verify SMTP connection
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;
    
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('SMTP verification failed:', error);
    return false;
  }
}

