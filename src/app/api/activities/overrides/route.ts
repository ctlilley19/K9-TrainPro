import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/activities/overrides - Get overrides for facility
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Missing facility ID' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('activity_type_overrides')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) throw error;

    return NextResponse.json({ overrides: data });
  } catch (error) {
    console.error('Error fetching overrides:', error);
    return NextResponse.json({ error: 'Failed to fetch overrides' }, { status: 500 });
  }
}

// POST /api/activities/overrides - Create or update override for built-in activity type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facilityId,
      activityType,
      customLabel,
      customIcon,
      customColor,
      customBgColor,
      customGlowColor,
      customMaxMinutes,
      customWarningMinutes,
      isHidden,
      showInQuickLog,
      sortOrder,
    } = body;

    if (!facilityId || !activityType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Valid built-in activity types
    const validTypes = [
      'kennel', 'potty', 'training', 'play', 'group_play',
      'feeding', 'rest', 'walk', 'grooming', 'medical',
    ];

    if (!validTypes.includes(activityType)) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
    }

    // Upsert the override
    const { data, error } = await supabaseAdmin
      .from('activity_type_overrides')
      .upsert(
        {
          facility_id: facilityId,
          activity_type: activityType,
          custom_label: customLabel,
          custom_icon: customIcon,
          custom_color: customColor,
          custom_bg_color: customBgColor,
          custom_glow_color: customGlowColor,
          custom_max_minutes: customMaxMinutes,
          custom_warning_minutes: customWarningMinutes,
          is_hidden: isHidden,
          show_in_quick_log: showInQuickLog,
          sort_order: sortOrder,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'facility_id,activity_type',
        }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ override: data });
  } catch (error) {
    console.error('Error saving override:', error);
    return NextResponse.json({ error: 'Failed to save override' }, { status: 500 });
  }
}

// DELETE /api/activities/overrides - Reset override to defaults
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const activityType = searchParams.get('activityType');

    if (!facilityId || !activityType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('activity_type_overrides')
      .delete()
      .eq('facility_id', facilityId)
      .eq('activity_type', activityType);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting override:', error);
    return NextResponse.json({ error: 'Failed to delete override' }, { status: 500 });
  }
}
