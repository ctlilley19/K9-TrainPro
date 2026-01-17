import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateAdminSession } from '@/services/admin/auth';
import { logSupportEvent } from '@/services/admin/audit';


// GET /api/admin/tickets - List all tickets with filters
export async function GET(request: NextRequest) {
  try {
    // Validate session
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check permissions - support, super_admin can view tickets
    if (!['super_admin', 'support'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const supabaseAdmin = getSupabaseAdmin();

    // Build query
    let query = supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data: tickets, error, count } = await query;

    if (error) {
      console.error('Error fetching tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    return NextResponse.json({
      tickets: tickets || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Tickets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/tickets - Create a new ticket (for admin-initiated tickets)
export async function POST(request: NextRequest) {
  try {
    // Validate session
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check permissions
    if (!['super_admin', 'support'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, userEmail, subject, description, priority, category } = body;

    // Validate required fields
    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Create ticket
    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        user_id: userId,
        user_email: userEmail,
        subject,
        description,
        priority: priority || 'normal',
        category: category || 'general',
        status: 'new',
        created_by_admin: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ticket:', error);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    // Log the action
    await logSupportEvent(
      session.admin.id,
      'ticket_created',
      ticket.id,
      `Admin created ticket: ${subject}`
    );

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/tickets - Bulk update tickets
export async function PATCH(request: NextRequest) {
  try {
    // Validate session
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check permissions
    if (!['super_admin', 'support'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { ticketIds, updates } = body;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json({ error: 'Ticket IDs required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Update tickets
    const { error } = await supabaseAdmin
      .from('support_tickets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', ticketIds);

    if (error) {
      console.error('Error updating tickets:', error);
      return NextResponse.json({ error: 'Failed to update tickets' }, { status: 500 });
    }

    // Log the action for each ticket
    for (const ticketId of ticketIds) {
      await logSupportEvent(
        session.admin.id,
        'ticket_assigned',
        ticketId,
        `Bulk updated ticket: ${JSON.stringify(updates)}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk update tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
