import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateAdminSession } from '@/services/admin/auth';
import { logSystemEvent } from '@/services/admin/audit';


// GET /api/admin/settings - Get all settings
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

    // Only super_admin can view settings
    if (session.admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Get feature flags
    if (type === 'feature_flags' || !type) {
      const { data: featureFlags, error: flagsError } = await supabaseAdmin
        .from('feature_flags')
        .select('*')
        .order('name');

      if (flagsError) {
        console.error('Error fetching feature flags:', flagsError);
        // Return empty array if table doesn't exist yet
        if (type === 'feature_flags') {
          return NextResponse.json({ featureFlags: [] });
        }
      }

      if (type === 'feature_flags') {
        return NextResponse.json({ featureFlags: featureFlags || [] });
      }

      // Return all settings
      return NextResponse.json({
        featureFlags: featureFlags || [],
      });
    }

    return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/settings - Create or update settings
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

    // Only super_admin can modify settings
    if (session.admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { type, action } = body;

    // Get IP for audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Feature flag operations
    if (type === 'feature_flag') {
      const { flagId, name, key, description, enabled, rollout_percentage, allowed_roles } = body;

      if (action === 'toggle') {
        // Toggle an existing flag
        const { data: currentFlag, error: fetchError } = await supabaseAdmin
          .from('feature_flags')
          .select('*')
          .eq('id', flagId)
          .single();

        if (fetchError) {
          return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
        }

        const { data: updatedFlag, error: updateError } = await supabaseAdmin
          .from('feature_flags')
          .update({ enabled: !currentFlag.enabled })
          .eq('id', flagId)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: 'Failed to toggle flag' }, { status: 500 });
        }

        // Log the change
        await logSystemEvent(
          session.admin.id,
          'feature_flag_toggle',
          flagId,
          `Toggled feature flag "${currentFlag.name}" to ${!currentFlag.enabled ? 'enabled' : 'disabled'}`,
          'feature_management',
          { ipAddress, userAgent }
        );

        return NextResponse.json({ flag: updatedFlag });
      }

      if (action === 'create') {
        // Create new flag
        if (!name || !key) {
          return NextResponse.json({ error: 'Name and key are required' }, { status: 400 });
        }

        const { data: newFlag, error: createError } = await supabaseAdmin
          .from('feature_flags')
          .insert({
            name,
            description,
            enabled: enabled ?? false,
            rollout_percentage: rollout_percentage ?? 100,
            allowed_roles: allowed_roles ?? [],
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating flag:', createError);
          return NextResponse.json({ error: 'Failed to create flag' }, { status: 500 });
        }

        await logSystemEvent(
          session.admin.id,
          'feature_flag_create',
          newFlag.id,
          `Created feature flag "${name}"`,
          'feature_management',
          { ipAddress, userAgent }
        );

        return NextResponse.json({ flag: newFlag });
      }

      if (action === 'update') {
        // Update existing flag
        if (!flagId) {
          return NextResponse.json({ error: 'Flag ID is required' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (enabled !== undefined) updateData.enabled = enabled;
        if (rollout_percentage !== undefined) updateData.rollout_percentage = rollout_percentage;
        if (allowed_roles !== undefined) updateData.allowed_roles = allowed_roles;

        const { data: updatedFlag, error: updateError } = await supabaseAdmin
          .from('feature_flags')
          .update(updateData)
          .eq('id', flagId)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 });
        }

        await logSystemEvent(
          session.admin.id,
          'feature_flag_update',
          flagId,
          `Updated feature flag "${updatedFlag.name}"`,
          'feature_management',
          { ipAddress, userAgent }
        );

        return NextResponse.json({ flag: updatedFlag });
      }

      if (action === 'delete') {
        // Delete a flag
        if (!flagId) {
          return NextResponse.json({ error: 'Flag ID is required' }, { status: 400 });
        }

        const { data: deletedFlag, error: deleteError } = await supabaseAdmin
          .from('feature_flags')
          .delete()
          .eq('id', flagId)
          .select()
          .single();

        if (deleteError) {
          return NextResponse.json({ error: 'Failed to delete flag' }, { status: 500 });
        }

        await logSystemEvent(
          session.admin.id,
          'feature_flag_delete',
          flagId,
          `Deleted feature flag "${deletedFlag.name}"`,
          'feature_management',
          { ipAddress, userAgent }
        );

        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
