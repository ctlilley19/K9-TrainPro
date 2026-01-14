// Billing and Payments Service
// Integrates with Stripe for payment processing

// Invoice status
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

// Payment method types
export type PaymentMethodType = 'card' | 'bank_transfer' | 'cash' | 'check';

// Invoice interface
export interface Invoice {
  id: string;
  facility_id: string;
  family_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  due_date: string;
  paid_date?: string;
  notes?: string;
  payment_method?: PaymentMethodType;
  stripe_invoice_id?: string;
  stripe_payment_intent_id?: string;
  created_at: string;
  sent_at?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  program_id?: string;
  service_type?: string;
}

// Payment interface
export interface Payment {
  id: string;
  invoice_id: string;
  facility_id: string;
  family_id: string;
  amount: number;
  payment_method: PaymentMethodType;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_id?: string;
  notes?: string;
  created_at: string;
}

// Subscription/Plan interface
export interface FacilitySubscription {
  id: string;
  facility_id: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

// Plan configurations
export const subscriptionPlans = {
  starter: {
    name: 'Starter',
    price: 49,
    interval: 'month',
    features: [
      'Up to 25 active dogs',
      '2 staff accounts',
      'Basic reporting',
      'Client portal',
      'Email support',
    ],
    limits: {
      active_dogs: 25,
      staff_accounts: 2,
      storage_gb: 5,
    },
  },
  professional: {
    name: 'Professional',
    price: 99,
    interval: 'month',
    features: [
      'Up to 100 active dogs',
      '10 staff accounts',
      'Advanced analytics',
      'Client portal',
      'Automated reports',
      'Priority support',
      'Custom branding',
    ],
    limits: {
      active_dogs: 100,
      staff_accounts: 10,
      storage_gb: 25,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 249,
    interval: 'month',
    features: [
      'Unlimited dogs',
      'Unlimited staff',
      'Advanced analytics',
      'Client portal',
      'Automated reports',
      '24/7 support',
      'Custom branding',
      'API access',
      'Multi-location',
    ],
    limits: {
      active_dogs: -1, // unlimited
      staff_accounts: -1,
      storage_gb: 100,
    },
  },
};

// Service pricing templates
export const servicePricing = {
  consultation: { name: 'Free Consultation', price: 0 },
  evaluation: { name: 'Dog Evaluation', price: 75 },
  private_session: { name: 'Private Training Session (1 hr)', price: 95 },
  private_package_4: { name: 'Private Training Package (4 sessions)', price: 340 },
  private_package_8: { name: 'Private Training Package (8 sessions)', price: 640 },
  board_train_2week: { name: '2-Week Board & Train', price: 2500 },
  board_train_4week: { name: '4-Week Board & Train', price: 4500 },
  day_train_week: { name: 'Day Training (per week)', price: 450 },
  day_train_month: { name: 'Day Training (4 weeks)', price: 1600 },
  group_class: { name: 'Group Class (6 weeks)', price: 175 },
  puppy_package: { name: 'Puppy Foundation Package', price: 495 },
};

// Billing service
export const billingService = {
  // Generate invoice number
  generateInvoiceNumber(facilityPrefix: string = 'INV') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${facilityPrefix}-${timestamp}-${random}`;
  },

  // Calculate invoice totals
  calculateTotals(items: InvoiceItem[], taxRate: number, discountAmount: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;

    return {
      subtotal,
      tax_amount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },

  // Create invoice
  async createInvoice(data: {
    facility_id: string;
    family_id: string;
    items: Omit<InvoiceItem, 'id'>[];
    tax_rate?: number;
    discount_amount?: number;
    due_date: string;
    notes?: string;
  }) {
    const items = data.items.map((item, index) => ({
      ...item,
      id: `item_${index}`,
      total: item.quantity * item.unit_price,
    }));

    const taxRate = data.tax_rate ?? 0;
    const discountAmount = data.discount_amount ?? 0;
    const totals = this.calculateTotals(items, taxRate, discountAmount);

    const invoice: Omit<Invoice, 'id' | 'created_at'> = {
      facility_id: data.facility_id,
      family_id: data.family_id,
      invoice_number: this.generateInvoiceNumber(),
      status: 'draft',
      items,
      subtotal: totals.subtotal,
      tax_rate: taxRate,
      tax_amount: totals.tax_amount,
      discount_amount: discountAmount,
      total: totals.total,
      amount_paid: 0,
      balance_due: totals.total,
      due_date: data.due_date,
      notes: data.notes,
    };

    console.log('Creating invoice:', invoice);

    // In production, this would save to Supabase and optionally create Stripe invoice
    return {
      ...invoice,
      id: `inv_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
  },

  // Send invoice
  async sendInvoice(invoiceId: string) {
    console.log('Sending invoice:', invoiceId);

    // In production:
    // 1. Update invoice status to 'sent'
    // 2. Send email with payment link
    // 3. If using Stripe, finalize and send Stripe invoice

    return { success: true };
  },

  // Record payment
  async recordPayment(data: {
    invoice_id: string;
    facility_id: string;
    family_id: string;
    amount: number;
    payment_method: PaymentMethodType;
    notes?: string;
  }) {
    console.log('Recording payment:', data);

    const payment: Omit<Payment, 'id' | 'created_at'> = {
      ...data,
      status: 'completed',
    };

    // In production:
    // 1. Save payment record
    // 2. Update invoice amount_paid and balance_due
    // 3. Update invoice status if fully paid

    return {
      ...payment,
      id: `pay_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
  },

  // Process Stripe payment
  async processStripePayment(invoiceId: string, paymentMethodId: string) {
    console.log('Processing Stripe payment:', { invoiceId, paymentMethodId });

    // In production:
    // 1. Create Stripe PaymentIntent
    // 2. Confirm payment
    // 3. Handle webhook for payment confirmation
    // 4. Update invoice status

    return {
      success: true,
      payment_intent_id: `pi_${Date.now()}`,
    };
  },

  // Refund payment
  async refundPayment(paymentId: string, amount?: number) {
    console.log('Refunding payment:', { paymentId, amount });

    // In production:
    // 1. Process Stripe refund if applicable
    // 2. Update payment status
    // 3. Update invoice balance

    return { success: true };
  },

  // Get overdue invoices
  async getOverdueInvoices(facilityId: string) {
    const today = new Date().toISOString().split('T')[0];

    console.log('Getting overdue invoices for facility:', facilityId);

    // In production, query database
    return [];
  },

  // Generate payment link
  generatePaymentLink(invoiceId: string, facilitySlug: string) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/pay/${facilitySlug}/${invoiceId}`;
  },

  // Create Stripe checkout session
  async createCheckoutSession(data: {
    invoice_id: string;
    success_url: string;
    cancel_url: string;
  }) {
    console.log('Creating Stripe checkout session:', data);

    // In production:
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [...],
    //   mode: 'payment',
    //   success_url: data.success_url,
    //   cancel_url: data.cancel_url,
    //   metadata: { invoice_id: data.invoice_id },
    // });

    return {
      session_id: `cs_${Date.now()}`,
      url: `https://checkout.stripe.com/pay/cs_test_${Date.now()}`,
    };
  },
};

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Get status color
export function getInvoiceStatusColor(status: InvoiceStatus) {
  switch (status) {
    case 'draft':
      return 'surface';
    case 'sent':
      return 'info';
    case 'paid':
      return 'success';
    case 'overdue':
      return 'error';
    case 'cancelled':
      return 'warning';
    case 'refunded':
      return 'warning';
    default:
      return 'surface';
  }
}
