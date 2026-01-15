// Email Notification Service
// Handles sending email notifications for various events

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
    // In production, integrate with email service provider
    // Example with SendGrid:
    // await sgMail.send({
    //   to: params.to,
    //   from: 'noreply@k9protrain.com',
    //   subject: params.subject,
    //   templateId: templateIds[params.template],
    //   dynamicTemplateData: params.data,
    // });

    // For now, just log
    console.log('Email sent:', params);

    return {
      success: true,
      messageId: `msg_${Date.now()}`,
    };
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
