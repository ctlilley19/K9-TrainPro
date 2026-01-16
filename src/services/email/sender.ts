// Email Sender Service
// Integrates with email providers (Resend, SendGrid) or falls back to console logging

interface EmailOptions {
  to: string;
  toName?: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    contentType: string;
  }>;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Check if we're in production with email configured
const isEmailConfigured = (): boolean => {
  return !!(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
};

// Send via Resend (recommended for new projects)
async function sendViaResend(options: EmailOptions): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || process.env.EMAIL_FROM || 'K9 ProTrain <noreply@k9protrain.com>',
        to: [options.to],
        subject: options.subject,
        text: options.text,
        html: options.html,
        reply_to: options.replyTo || process.env.EMAIL_REPLY_TO,
        attachments: options.attachments?.map(a => ({
          filename: a.filename,
          content: a.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to send email' };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Send via SendGrid (alternative)
async function sendViaSendGrid(options: EmailOptions): Promise<SendResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'SENDGRID_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: options.to, name: options.toName }],
        }],
        from: {
          email: process.env.EMAIL_FROM_ADDRESS || 'noreply@k9protrain.com',
          name: options.fromName || process.env.EMAIL_FROM_NAME || 'K9 ProTrain',
        },
        reply_to: options.replyTo ? { email: options.replyTo } : undefined,
        subject: options.subject,
        content: [
          options.text ? { type: 'text/plain', value: options.text } : null,
          options.html ? { type: 'text/html', value: options.html } : null,
        ].filter(Boolean),
        attachments: options.attachments?.map(a => ({
          content: a.content,
          filename: a.filename,
          type: a.contentType,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: error || 'Failed to send email' };
    }

    // SendGrid returns 202 with no body on success
    return { success: true, messageId: `sg_${Date.now()}` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Console logging fallback for development
function logEmailToConsole(options: EmailOptions): SendResult {
  console.log('\n=== EMAIL (Development Mode) ===');
  console.log(`To: ${options.toName ? `${options.toName} <${options.to}>` : options.to}`);
  console.log(`From: ${options.from || 'noreply@k9protrain.com'}`);
  console.log(`Subject: ${options.subject}`);
  console.log('---');
  if (options.text) {
    console.log(options.text.slice(0, 500));
    if (options.text.length > 500) console.log('... [truncated]');
  }
  console.log('================================\n');

  return { success: true, messageId: `dev_${Date.now()}` };
}

// Main email sender
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  // Try Resend first, then SendGrid, then fallback to console
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(options);
  }

  if (process.env.SENDGRID_API_KEY) {
    return sendViaSendGrid(options);
  }

  // Development fallback
  return logEmailToConsole(options);
}

// Batch send emails with rate limiting
export async function sendEmailBatch(
  emails: EmailOptions[],
  options?: {
    delayMs?: number;
    onProgress?: (sent: number, total: number) => void;
  }
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const delayMs = options?.delayMs || 100;
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < emails.length; i++) {
    const result = await sendEmail(emails[i]);

    if (result.success) {
      sent++;
    } else {
      failed++;
      errors.push(`${emails[i].to}: ${result.error}`);
    }

    options?.onProgress?.(i + 1, emails.length);

    // Rate limiting delay between emails
    if (i < emails.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { sent, failed, errors };
}

// Export utility
export { isEmailConfigured };
