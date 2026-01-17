import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateAdminSession } from '@/services/admin/auth';
import { logSupportEvent } from '@/services/admin/audit';


// POST /api/admin/tickets/[id]/messages - Add message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;

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
    const { content, isInternal } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Verify ticket exists
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .select('id, status')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Create message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'admin',
        sender_id: session.admin.id,
        sender_name: session.admin.name,
        content: content.trim(),
        is_internal: isInternal || false,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update ticket status to in_progress if it was new
    if (ticket.status === 'new') {
      await supabaseAdmin
        .from('support_tickets')
        .update({
          status: 'in_progress',
          first_response_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);
    } else {
      await supabaseAdmin
        .from('support_tickets')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);
    }

    // Log the action
    await logSupportEvent(
      session.admin.id,
      'ticket_responded',
      ticketId,
      isInternal ? 'Internal note added' : 'Response sent to user'
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Add message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/admin/tickets/[id]/messages - Get all messages for ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;

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

    // Get messages
    const { data: messages, error } = await supabaseAdmin
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
