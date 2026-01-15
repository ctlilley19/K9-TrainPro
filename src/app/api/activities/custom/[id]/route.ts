import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/activities/custom/[id] - Get single custom activity type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('custom_activity_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ activityType: data });
  } catch (error) {
    console.error('Error fetching activity type:', error);
    return NextResponse.json({ error: 'Failed to fetch activity type' }, { status: 500 });
  }
}

// PATCH /api/activities/custom/[id] - Update custom activity type
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      label,
      description,
      iconName,
      color,
      bgColor,
      glowColor,
      maxMinutes,
      warningMinutes,
      category,
      sortOrder,
      showInQuickLog,
      allowNotes,
      allowBuddy,
      trackLocation,
      isActive,
    } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (label !== undefined) updateData.label = label;
    if (description !== undefined) updateData.description = description;
    if (iconName !== undefined) updateData.icon_name = iconName;
    if (color !== undefined) updateData.color = color;
    if (bgColor !== undefined) updateData.bg_color = bgColor;
    if (glowColor !== undefined) updateData.glow_color = glowColor;
    if (maxMinutes !== undefined) updateData.max_minutes = maxMinutes;
    if (warningMinutes !== undefined) updateData.warning_minutes = warningMinutes;
    if (category !== undefined) updateData.category = category;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;
    if (showInQuickLog !== undefined) updateData.show_in_quick_log = showInQuickLog;
    if (allowNotes !== undefined) updateData.allow_notes = allowNotes;
    if (allowBuddy !== undefined) updateData.allow_buddy = allowBuddy;
    if (trackLocation !== undefined) updateData.track_location = trackLocation;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabaseAdmin
      .from('custom_activity_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ activityType: data });
  } catch (error) {
    console.error('Error updating activity type:', error);
    return NextResponse.json({ error: 'Failed to update activity type' }, { status: 500 });
  }
}

// DELETE /api/activities/custom/[id] - Delete custom activity type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if any activities are using this custom type
    const { data: activities } = await supabaseAdmin
      .from('activities')
      .select('id')
      .eq('custom_activity_type_id', id)
      .limit(1);

    if (activities && activities.length > 0) {
      // Soft delete by deactivating
      await supabaseAdmin
        .from('custom_activity_types')
        .update({ is_active: false })
        .eq('id', id);

      return NextResponse.json({
        success: true,
        deactivated: true,
        message: 'Activity type has been deactivated because it has existing logs',
      });
    }

    // Hard delete if no activities using it
    const { error } = await supabaseAdmin
      .from('custom_activity_types')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity type:', error);
    return NextResponse.json({ error: 'Failed to delete activity type' }, { status: 500 });
  }
}
