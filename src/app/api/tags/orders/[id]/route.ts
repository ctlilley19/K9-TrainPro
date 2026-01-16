import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendShippedNotificationEmail } from '@/services/email/vendor-order';


// GET /api/tags/orders/[id] - Get single order with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('tag_orders')
      .select(`
        *,
        tags(*),
        design_template:tag_design_templates(id, name, front_image_url),
        user:users(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH /api/tags/orders/[id] - Update order (status, tracking, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, trackingNumber, trackingUrl, carrier, notes } = body;

    // Get current order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('tag_orders')
      .select(`
        *,
        user:users(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    switch (action) {
      case 'mark_shipped': {
        if (!trackingNumber || !carrier) {
          return NextResponse.json(
            { error: 'Tracking number and carrier are required' },
            { status: 400 }
          );
        }

        updateData.status = 'shipped';
        updateData.tracking_number = trackingNumber;
        updateData.tracking_url = trackingUrl || generateTrackingUrl(carrier, trackingNumber);
        updateData.carrier = carrier;
        updateData.shipped_at = new Date().toISOString();

        // Update all tags in this order to shipped status
        await supabaseAdmin
          .from('tags')
          .update({ status: 'shipped' })
          .eq('order_id', id);

        // Send notification email to customer
        if (order.user?.email) {
          await sendShippedNotificationEmail(
            id,
            order.user.email,
            order.user.name || 'Customer',
            trackingNumber,
            updateData.tracking_url as string,
            carrier
          );
        }
        break;
      }

      case 'mark_delivered': {
        updateData.status = 'delivered';
        updateData.delivered_at = new Date().toISOString();

        // Update all tags to unassigned (ready for use)
        await supabaseAdmin
          .from('tags')
          .update({ status: 'unassigned' })
          .eq('order_id', id);
        break;
      }

      case 'update_tracking': {
        if (trackingNumber) updateData.tracking_number = trackingNumber;
        if (trackingUrl) updateData.tracking_url = trackingUrl;
        if (carrier) {
          updateData.carrier = carrier;
          if (trackingNumber && !trackingUrl) {
            updateData.tracking_url = generateTrackingUrl(carrier, trackingNumber);
          }
        }
        break;
      }

      case 'add_notes': {
        updateData.admin_notes = notes;
        break;
      }

      case 'cancel': {
        if (['shipped', 'delivered'].includes(order.status)) {
          return NextResponse.json(
            { error: 'Cannot cancel shipped or delivered orders' },
            { status: 400 }
          );
        }
        updateData.status = 'canceled';
        updateData.canceled_at = new Date().toISOString();

        // Mark tags as canceled
        await supabaseAdmin
          .from('tags')
          .update({ status: 'deactivated', deactivation_reason: 'Order canceled' })
          .eq('order_id', id);
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('tag_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// Helper to generate tracking URL based on carrier
function generateTrackingUrl(carrier: string, trackingNumber: string): string {
  const carrierUrls: Record<string, string> = {
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    dhl: `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`,
  };

  return carrierUrls[carrier.toLowerCase()] || '';
}
