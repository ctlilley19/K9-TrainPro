import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateAdminSession } from '@/services/admin/auth';
import { logSupportEvent } from '@/services/admin/audit';


// GET /api/admin/tickets/[id] - Get single ticket with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const supabaseAdmin = getSupabaseAdmin();

    // Get ticket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

    return NextResponse.json({
      ticket,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/tickets/[id] - Update ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const { status, priority, assignedTo, tags, internalNotes } = body;

    // Build updates
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;
    if (tags !== undefined) updates.tags = tags;
    if (internalNotes !== undefined) updates.internal_notes = internalNotes;

    const supabaseAdmin = getSupabaseAdmin();

    // Update ticket
    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket:', error);
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    // Log based on what was updated
    if (status === 'resolved') {
      await logSupportEvent(session.admin.id, 'ticket_resolved', id, `Ticket resolved`);
    } else if (status === 'closed') {
      await logSupportEvent(session.admin.id, 'ticket_closed', id, `Ticket closed`);
    } else if (assignedTo) {
      await logSupportEvent(session.admin.id, 'ticket_assigned', id, `Ticket assigned to ${assignedTo}`);
    } else if (priority === 'urgent') {
      await logSupportEvent(session.admin.id, 'ticket_escalated', id, `Ticket escalated to urgent`);
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
