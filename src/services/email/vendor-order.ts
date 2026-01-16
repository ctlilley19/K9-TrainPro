import { getSupabaseAdmin } from '@/lib/supabase-admin';


interface TagOrder {
  id: string;
  order_number: string;
  quantity: number;
  design_type: string;
  product_type: string;
  design_image_url?: string;
  shipping_name: string;
  shipping_company?: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_phone?: string;
}

interface TagInfo {
  tag_code: string;
  url: string;
}

interface VendorInfo {
  name: string;
  contact_email: string;
}

/**
 * Generate vendor order email content
 */
export function generateVendorEmailContent(
  order: TagOrder,
  tags: TagInfo[],
  vendor: VendorInfo
): { subject: string; text: string; html: string } {
  const subject = `K9 ProTrain Order #${order.order_number} — ${order.quantity} Tags`;

  const tagList = tags
    .map((tag, idx) => `Tag ${idx + 1}: ${tag.url}`)
    .join('\n');

  const productDescription = order.product_type === 'double_sided'
    ? 'Custom NFC Keychain - Double Sided'
    : 'Custom NFC Keychain - Single Sided';

  const text = `
NEW ORDER FROM K9 PROTRAIN
===========================

Order ID: ${order.order_number}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Quantity: ${order.quantity}

PRODUCT: ${productDescription}

ENCODE EACH TAG WITH THESE UNIQUE URLs:
---------------------------------------
${tagList}

DESIGN:
-------
Front: ${order.design_type === 'custom' ? 'See attached image' : 'K9 ProTrain Default Logo'}
Back: ${order.product_type === 'double_sided' ? 'See attached image for double-sided' : 'QR code auto-generated to match NFC URL'}

SHIP TO:
--------
${order.shipping_name}
${order.shipping_company ? order.shipping_company + '\n' : ''}${order.shipping_address_line1}
${order.shipping_address_line2 ? order.shipping_address_line2 + '\n' : ''}${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}
${order.shipping_country}
${order.shipping_phone ? 'Phone: ' + order.shipping_phone : ''}

NOTES:
------
- Ship in unbranded packaging
- Include standard setup instructions

Please confirm receipt and provide tracking number when shipped.

Thank you,
K9 ProTrain Automated Orders
orders@k9protrain.com
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; color: #6366f1; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    .tag-list { background: #f5f5f5; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; max-height: 300px; overflow-y: auto; }
    .ship-to { background: #f0f9ff; padding: 15px; border-radius: 8px; }
    .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>New Order from K9 ProTrain</h1>
    <p>Order #${order.order_number}</p>
  </div>

  <div class="content">
    <div class="section">
      <div class="section-title">Order Details</div>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p><strong>Quantity:</strong> ${order.quantity} tags</p>
      <p><strong>Product:</strong> ${productDescription}</p>
    </div>

    <div class="section">
      <div class="section-title">Unique URLs to Encode</div>
      <div class="tag-list">
        ${tags.map((tag, idx) => `Tag ${idx + 1}: <a href="${tag.url}">${tag.url}</a>`).join('<br>')}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Design</div>
      <p><strong>Front:</strong> ${order.design_type === 'custom' ? 'See attached image' : 'K9 ProTrain Default Logo'}</p>
      <p><strong>Back:</strong> ${order.product_type === 'double_sided' ? 'See attached image' : 'QR code auto-generated to match NFC URL'}</p>
    </div>

    <div class="section">
      <div class="section-title">Ship To</div>
      <div class="ship-to">
        <p><strong>${order.shipping_name}</strong></p>
        ${order.shipping_company ? `<p>${order.shipping_company}</p>` : ''}
        <p>${order.shipping_address_line1}</p>
        ${order.shipping_address_line2 ? `<p>${order.shipping_address_line2}</p>` : ''}
        <p>${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}</p>
        <p>${order.shipping_country}</p>
        ${order.shipping_phone ? `<p>Phone: ${order.shipping_phone}</p>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Notes</div>
      <ul>
        <li>Ship in unbranded packaging</li>
        <li>Include standard setup instructions</li>
      </ul>
    </div>
  </div>

  <div class="footer">
    <p>Please confirm receipt and provide tracking number when shipped.</p>
    <p>K9 ProTrain Automated Orders | orders@k9protrain.com</p>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}

/**
 * Send order to vendor via email
 *
 * Note: In production, this would use a service like SendGrid, Postmark, or AWS SES.
 * For now, it logs the email content and marks the order as sent.
 */
export async function sendVendorOrderEmail(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get order with tags
    const { data: order, error: orderError } = await getSupabaseAdmin()
      .from('tag_orders')
      .select(`
        *,
        vendor:vendors(name, contact_email)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: 'Order not found' };
    }

    // Get tags for this order
    const { data: tags, error: tagsError } = await getSupabaseAdmin()
      .from('tags')
      .select('tag_code, url')
      .eq('order_id', orderId)
      .order('created_at');

    if (tagsError || !tags) {
      return { success: false, error: 'Tags not found' };
    }

    const vendor = order.vendor as VendorInfo;
    const emailContent = generateVendorEmailContent(order, tags, vendor);

    // Log the email (in production, send via email service)
    console.log('=== VENDOR ORDER EMAIL ===');
    console.log(`To: ${vendor.contact_email}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log('---');
    console.log(emailContent.text);
    console.log('=========================');

    // TODO: Integrate with email service (SendGrid, Postmark, etc.)
    // Example with SendGrid:
    // await sgMail.send({
    //   to: vendor.contact_email,
    //   from: 'orders@k9protrain.com',
    //   subject: emailContent.subject,
    //   text: emailContent.text,
    //   html: emailContent.html,
    //   attachments: order.design_image_url ? [{
    //     content: await fetchImageAsBase64(order.design_image_url),
    //     filename: 'front_design.png',
    //     type: 'image/png',
    //     disposition: 'attachment'
    //   }] : []
    // });

    // Update order status
    await getSupabaseAdmin()
      .from('tag_orders')
      .update({
        status: 'sent_to_vendor',
        vendor_email_sent_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return { success: true };
  } catch (error) {
    console.error('Error sending vendor email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  orderId: string,
  customerEmail: string,
  customerName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: order, error } = await getSupabaseAdmin()
      .from('tag_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return { success: false, error: 'Order not found' };
    }

    const subject = `Your K9 ProTrain Tag Order #${order.order_number} ✓`;

    const text = `
Hey ${customerName},

Your tag order is confirmed!

Order Summary:
━━━━━━━━━━━━━━━━━━━━━━━━
${order.quantity}x NFC Dog Tag (${order.design_type === 'custom' ? 'Custom' : 'Default'})
Total: $${(order.total_amount / 100).toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━

Shipping to:
${order.shipping_name}
${order.shipping_company ? order.shipping_company + '\n' : ''}${order.shipping_address_line1}
${order.shipping_address_line2 ? order.shipping_address_line2 + '\n' : ''}${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}

What's Next:
1. Our partner begins production (1-2 business days)
2. Ships direct to you (3-5 business days)
3. You'll get a tracking email when it's on the way

Questions? Reply to this email.

— The K9 ProTrain Team
`;

    // Log the email (in production, send via email service)
    console.log('=== CUSTOMER CONFIRMATION EMAIL ===');
    console.log(`To: ${customerEmail}`);
    console.log(`Subject: ${subject}`);
    console.log('---');
    console.log(text);
    console.log('===================================');

    // TODO: Send via email service

    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send shipped notification email to customer
 */
export async function sendShippedNotificationEmail(
  orderId: string,
  customerEmail: string,
  customerName: string,
  trackingNumber: string,
  trackingUrl: string,
  carrier: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: order, error } = await getSupabaseAdmin()
      .from('tag_orders')
      .select('order_number')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return { success: false, error: 'Order not found' };
    }

    const subject = `Your K9 ProTrain Tags Have Shipped! 📦`;

    const text = `
Hey ${customerName},

Your tags are on the way!

Tracking: ${trackingNumber}
Carrier: ${carrier}
Track here: ${trackingUrl}

When they arrive:
1. Open the K9 ProTrain app
2. Go to Tags → My Tags
3. You'll see your new tags ready to assign
4. Assign each tag to a pet
5. Clip to collar and start tapping!

Questions? Reply to this email.

— The K9 ProTrain Team
`;

    // Log the email (in production, send via email service)
    console.log('=== SHIPPED NOTIFICATION EMAIL ===');
    console.log(`To: ${customerEmail}`);
    console.log(`Subject: ${subject}`);
    console.log('---');
    console.log(text);
    console.log('==================================');

    // TODO: Send via email service

    return { success: true };
  } catch (error) {
    console.error('Error sending shipped notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
