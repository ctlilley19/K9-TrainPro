// Email Notification Service
// Handles sending email notifications for various events

import { sendEmail } from '@/services/email/sender';

// Email template types
export type EmailTemplateType =
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_cancelled'
  | 'report_sent'
  | 'message_received'
  | 'graduation_certificate'
  | 'payment_receipt'
  | 'welcome'
  | 'password_reset';

// Email template configurations
export const emailTemplates: Record<
  EmailTemplateType,
  {
    subject: string;
    preheader: string;
    category: 'transactional' | 'notification' | 'marketing';
  }
> = {
  booking_confirmation: {
    subject: 'Booking Confirmed - {dogName} at {facilityName}',
    preheader: 'Your appointment has been confirmed for {date}',
    category: 'transactional',
  },
  booking_reminder: {
    subject: 'Reminder: Appointment Tomorrow for {dogName}',
    preheader: 'Don\'t forget your appointment at {time}',
    category: 'notification',
  },
  booking_cancelled: {
    subject: 'Booking Cancelled - {dogName}',
    preheader: 'Your appointment for {date} has been cancelled',
    category: 'transactional',
  },
  report_sent: {
    subject: '{dogName}\'s Daily Report - {date}',
    preheader: 'See how {dogName} did today!',
    category: 'notification',
  },
  message_received: {
    subject: 'New Message from {facilityName}',
    preheader: 'You have a new message about {dogName}',
    category: 'notification',
  },
  graduation_certificate: {
    subject: 'Congratulations! {dogName} Has Graduated! 🎓',
    preheader: '{dogName} has completed their training program',
    category: 'notification',
  },
  payment_receipt: {
    subject: 'Payment Receipt - {facilityName}',
    preheader: 'Thank you for your payment of {amount}',
    category: 'transactional',
  },
  welcome: {
    subject: 'Welcome to {facilityName}!',
    preheader: 'Let\'s get started with {dogName}\'s training journey',
    category: 'marketing',
  },
  password_reset: {
    subject: 'Reset Your Password - {facilityName}',
    preheader: 'Click here to reset your password',
    category: 'transactional',
  },
};

// Email data interfaces with index signatures for compatibility with Record<string, unknown>
interface BaseEmailData {
  to: string;
  toName: string;
  facilityName: string;
  facilityLogo?: string;
  [key: string]: unknown;
}

interface BookingEmailData extends BaseEmailData {
  dogName: string;
  date: string;
  time: string;
  serviceName: string;
  location: string;
  confirmationLink?: string;
  cancelLink?: string;
}

interface ReportEmailData extends BaseEmailData {
  dogName: string;
  date: string;
  summary: string;
  mood: string;
  highlights: string[];
  viewReportLink: string;
  photos?: string[];
}

interface MessageEmailData extends BaseEmailData {
  dogName: string;
  senderName: string;
  messagePreview: string;
  viewMessageLink: string;
}

interface CertificateEmailData extends BaseEmailData {
  dogName: string;
  programName: string;
  certificateLink: string;
  downloadLink: string;
}

// Email service
export const emailService = {
  // Send booking confirmation
  async sendBookingConfirmation(data: BookingEmailData) {
    const template = emailTemplates.booking_confirmation;
    const subject = this.replaceVariables(template.subject, data);

    console.log('Sending booking confirmation email:', {
      to: data.to,
      subject,
      data,
    });

    // In production, this would call an email API like SendGrid, Resend, etc.
    return this.sendEmail({
      to: data.to,
      toName: data.toName,
      subject,
      template: 'booking_confirmation',
      data,
    });
  },

  // Send booking reminder
  async sendBookingReminder(data: BookingEmailData) {
    const template = emailTemplates.booking_reminder;
    const subject = this.replaceVariables(template.subject, data);

    console.log('Sending booking reminder email:', {
      to: data.to,
      subject,
      data,
    });

    return this.sendEmail({
      to: data.to,
      toName: data.toName,
      subject,
      template: 'booking_reminder',
      data,
    });
  },

  // Send daily report
  async sendDailyReport(data: ReportEmailData) {
    const template = emailTemplates.report_sent;
    const subject = this.replaceVariables(template.subject, data);

    console.log('Sending daily report email:', {
      to: data.to,
      subject,
      data,
    });

    return this.sendEmail({
      to: data.to,
      toName: data.toName,
      subject,
      template: 'report_sent',
      data,
    });
  },

  // Send new message notification
  async sendMessageNotification(data: MessageEmailData) {
    const template = emailTemplates.message_received;
    const subject = this.replaceVariables(template.subject, data);

    console.log('Sending message notification email:', {
      to: data.to,
      subject,
      data,
    });

    return this.sendEmail({
      to: data.to,
      toName: data.toName,
      subject,
      template: 'message_received',
      data,
    });
  },

  // Send graduation certificate
  async sendGraduationCertificate(data: CertificateEmailData) {
    const template = emailTemplates.graduation_certificate;
    const subject = this.replaceVariables(template.subject, data);

    console.log('Sending graduation certificate email:', {
      to: data.to,
      subject,
      data,
    });

    return this.sendEmail({
      to: data.to,
      toName: data.toName,
      subject,
      template: 'graduation_certificate',
      data,
    });
  },

  // Generic send email function
  async sendEmail(params: {
    to: string;
    toName: string;
    subject: string;
    template: EmailTemplateType;
    data: Record<string, unknown>;
  }) {
    const templateConfig = emailTemplates[params.template];

    // Generate HTML content from template
    const html = this.generateHtmlTemplate(params.template, params.data);
    const text = this.generateTextTemplate(params.template, params.data);

    // Send via the email sender service
    const result = await sendEmail({
      to: params.to,
      toName: params.toName,
      subject: params.subject,
      html,
      text,
    });

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    };
  },

  // Generate HTML email template
  generateHtmlTemplate(template: EmailTemplateType, data: Record<string, unknown>): string {
    const templateConfig = emailTemplates[template];
    const preheader = this.replaceVariables(templateConfig.preheader, data);
    const facilityName = data.facilityName as string || 'K9 ProTrain';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.replaceVariables(templateConfig.subject, data)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .content { padding: 32px; }
    .button { display: inline-block; background: #ef4444; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { background: #f4f4f5; padding: 24px; text-align: center; font-size: 12px; color: #666; }
    .preheader { display: none !important; visibility: hidden; opacity: 0; }
  </style>
</head>
<body>
  <span class="preheader">${preheader}</span>
  <div class="container">
    <div class="header">
      <h1>${facilityName}</h1>
    </div>
    <div class="content">
      ${this.getTemplateContent(template, data)}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${facilityName}. All rights reserved.</p>
      <p>You're receiving this because you're a ${facilityName} customer.</p>
    </div>
  </div>
</body>
</html>`;
  },

  // Get template-specific content
  getTemplateContent(template: EmailTemplateType, data: Record<string, unknown>): string {
    const dogName = data.dogName as string || 'your dog';
    const date = data.date as string || '';
    const time = data.time as string || '';

    switch (template) {
      case 'booking_confirmation':
        return `
          <h2>Booking Confirmed! ✓</h2>
          <p>Great news! Your appointment for <strong>${dogName}</strong> has been confirmed.</p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Service:</strong> ${data.serviceName || 'Training Session'}</p>
          </div>
          ${data.confirmationLink ? `<p><a href="${data.confirmationLink}" class="button">View Booking</a></p>` : ''}
        `;

      case 'booking_reminder':
        return `
          <h2>Reminder: Tomorrow's Appointment</h2>
          <p>Don't forget! <strong>${dogName}</strong> has an appointment tomorrow.</p>
          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Location:</strong> ${data.location || 'See booking details'}</p>
          </div>
        `;

      case 'report_sent':
        return `
          <h2>${dogName}'s Daily Report</h2>
          <p>Here's how ${dogName} did today:</p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Mood:</strong> ${data.mood || 'Great!'}</p>
            <p><strong>Summary:</strong> ${data.summary || 'Had a wonderful day!'}</p>
          </div>
          ${data.viewReportLink ? `<p><a href="${data.viewReportLink}" class="button">View Full Report</a></p>` : ''}
        `;

      case 'welcome':
        return `
          <h2>Welcome to ${data.facilityName}! 🎉</h2>
          <p>We're excited to have you and <strong>${dogName}</strong> join us!</p>
          <p>Here's what you can expect:</p>
          <ul>
            <li>Daily updates on ${dogName}'s progress</li>
            <li>Photos and videos from training sessions</li>
            <li>Direct messaging with trainers</li>
          </ul>
          <p>Let's make ${dogName}'s training journey amazing!</p>
        `;

      case 'graduation_certificate':
        return `
          <h2>Congratulations! 🎓</h2>
          <p><strong>${dogName}</strong> has graduated from <strong>${data.programName || 'training'}</strong>!</p>
          <p>This is a huge accomplishment. We're so proud of the progress ${dogName} has made.</p>
          ${data.certificateLink ? `<p><a href="${data.certificateLink}" class="button">View Certificate</a></p>` : ''}
        `;

      default:
        return `<p>${data.message || 'Thank you for being a valued customer.'}</p>`;
    }
  },

  // Generate plain text version
  generateTextTemplate(template: EmailTemplateType, data: Record<string, unknown>): string {
    const templateConfig = emailTemplates[template];
    const facilityName = data.facilityName as string || 'K9 ProTrain';
    const dogName = data.dogName as string || 'your dog';

    let content = '';

    switch (template) {
      case 'booking_confirmation':
        content = `Your appointment for ${dogName} has been confirmed for ${data.date} at ${data.time}.`;
        break;
      case 'booking_reminder':
        content = `Reminder: ${dogName} has an appointment tomorrow at ${data.time}.`;
        break;
      case 'report_sent':
        content = `${dogName}'s Daily Report:\n\nMood: ${data.mood}\nSummary: ${data.summary}`;
        break;
      case 'welcome':
        content = `Welcome to ${facilityName}! We're excited to have you and ${dogName} join us.`;
        break;
      default:
        content = data.message as string || 'Thank you for being a valued customer.';
    }

    return `${content}\n\n--\n${facilityName}`;
  },

  // Replace template variables
  replaceVariables(template: string, data: Record<string, unknown>): string {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    return result;
  },

  // Schedule email for later
  async scheduleEmail(
    params: {
      to: string;
      toName: string;
      subject: string;
      template: EmailTemplateType;
      data: Record<string, unknown>;
    },
    sendAt: Date
  ) {
    console.log('Scheduling email for:', sendAt, params);

    // In production, this would use a job queue like Bull or cloud scheduler
    return {
      success: true,
      scheduledId: `scheduled_${Date.now()}`,
      sendAt,
    };
  },

  // Cancel scheduled email
  async cancelScheduledEmail(scheduledId: string) {
    console.log('Cancelling scheduled email:', scheduledId);

    return {
      success: true,
    };
  },
};

// Notification preferences
export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  preferences: {
    daily_reports: boolean;
    messages: boolean;
    booking_reminders: boolean;
    graduation_certificates: boolean;
    marketing: boolean;
  };
}

// Default preferences
export const defaultNotificationPreferences: NotificationPreferences['preferences'] = {
  daily_reports: true,
  messages: true,
  booking_reminders: true,
  graduation_certificates: true,
  marketing: false,
};

// Check if notification should be sent
export function shouldSendNotification(
  type: keyof NotificationPreferences['preferences'],
  preferences: NotificationPreferences
): boolean {
  if (!preferences.email_enabled) return false;
  return preferences.preferences[type] ?? false;
}

// Email queue for batch sending
export const emailQueue = {
  items: [] as Array<{
    id: string;
    template: EmailTemplateType;
    data: Record<string, unknown>;
    priority: 'high' | 'normal' | 'low';
    createdAt: Date;
  }>,

  // Add to queue
  add(
    template: EmailTemplateType,
    data: Record<string, unknown>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ) {
    const item = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      template,
      data,
      priority,
      createdAt: new Date(),
    };
    this.items.push(item);
    return item.id;
  },

  // Process queue (called by cron job or worker)
  async process(batchSize = 10) {
    // Sort by priority and creation time
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    this.items.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const batch = this.items.splice(0, batchSize);

    for (const item of batch) {
      try {
        await emailService.sendEmail({
          to: item.data.to as string,
          toName: item.data.toName as string,
          subject: emailService.replaceVariables(
            emailTemplates[item.template].subject,
            item.data
          ),
          template: item.template,
          data: item.data,
        });
      } catch (error) {
        console.error('Failed to send email:', item.id, error);
        // Re-queue failed emails with lower priority
        this.add(item.template, item.data, 'low');
      }
    }

    return batch.length;
  },

  // Get queue status
  getStatus() {
    return {
      total: this.items.length,
      high: this.items.filter((i) => i.priority === 'high').length,
      normal: this.items.filter((i) => i.priority === 'normal').length,
      low: this.items.filter((i) => i.priority === 'low').length,
    };
  },
};
