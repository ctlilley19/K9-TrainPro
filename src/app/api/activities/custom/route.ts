import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';


// GET /api/activities/custom - List all activity types for a facility (built-in + custom)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Missing facility ID' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get custom activity types
    const { data: customTypes, error: customError } = await supabaseAdmin
      .from('custom_activity_types')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (customError) throw customError;

    // Get activity type overrides
    const { data: overrides, error: overridesError } = await supabaseAdmin
      .from('activity_type_overrides')
      .select('*')
      .eq('facility_id', facilityId);

    if (overridesError) throw overridesError;

    // Define built-in activity types with defaults
    const builtInTypes = [
      { code: 'kennel', label: 'Kennel', iconName: 'Home', color: '#9ca3af', maxMinutes: 240, warningMinutes: 180, sortOrder: 1 },
      { code: 'potty', label: 'Potty', iconName: 'Droplets', color: '#facc15', maxMinutes: 30, warningMinutes: 20, sortOrder: 2 },
      { code: 'training', label: 'Training', iconName: 'GraduationCap', color: '#60a5fa', maxMinutes: 45, warningMinutes: 30, sortOrder: 3 },
      { code: 'play', label: 'Play', iconName: 'Gamepad2', color: '#4ade80', maxMinutes: 60, warningMinutes: 45, sortOrder: 4 },
      { code: 'group_play', label: 'Group Play', iconName: 'Gamepad2', color: '#4ade80', maxMinutes: 60, warningMinutes: 45, sortOrder: 5 },
      { code: 'feeding', label: 'Feeding', iconName: 'UtensilsCrossed', color: '#a78bfa', maxMinutes: 30, warningMinutes: 20, sortOrder: 6 },
      { code: 'rest', label: 'Rest', iconName: 'Moon', color: '#38bdf8', maxMinutes: 120, warningMinutes: 90, sortOrder: 7 },
      { code: 'walk', label: 'Walk', iconName: 'Dog', color: '#fb923c', maxMinutes: 45, warningMinutes: 30, sortOrder: 8 },
      { code: 'grooming', label: 'Grooming', iconName: 'Sparkles', color: '#f472b6', maxMinutes: 60, warningMinutes: 45, sortOrder: 9 },
      { code: 'medical', label: 'Medical', iconName: 'Stethoscope', color: '#f87171', maxMinutes: 120, warningMinutes: 60, sortOrder: 10 },
    ];

    // Apply overrides to built-in types
    const overrideMap = new Map(overrides?.map((o) => [o.activity_type, o]) || []);

    const mergedBuiltIn = builtInTypes
      .map((type) => {
        const override = overrideMap.get(type.code);
        if (override?.is_hidden) return null;

        return {
          code: type.code,
          label: override?.custom_label || type.label,
          iconName: override?.custom_icon || type.iconName,
          color: override?.custom_color || type.color,
          maxMinutes: override?.custom_max_minutes || type.maxMinutes,
          warningMinutes: override?.custom_warning_minutes || type.warningMinutes,
          sortOrder: override?.sort_order || type.sortOrder,
          showInQuickLog: override?.show_in_quick_log ?? true,
          isCustom: false,
          isBuiltIn: true,
        };
      })
      .filter(Boolean);

    // Transform custom types
    const transformedCustom = (customTypes || []).map((ct) => ({
      id: ct.id,
      code: ct.code,
      label: ct.label,
      description: ct.description,
      iconName: ct.icon_name,
      color: ct.color,
      bgColor: ct.bg_color,
      glowColor: ct.glow_color,
      maxMinutes: ct.max_minutes,
      warningMinutes: ct.warning_minutes,
      category: ct.category,
      sortOrder: ct.sort_order,
      showInQuickLog: ct.show_in_quick_log,
      allowNotes: ct.allow_notes,
      allowBuddy: ct.allow_buddy,
      trackLocation: ct.track_location,
      isCustom: true,
      isBuiltIn: false,
    }));

    // Combine and sort
    const allTypes = [...mergedBuiltIn, ...transformedCustom].sort(
      (a, b) => (a?.sortOrder || 100) - (b?.sortOrder || 100)
    );

    return NextResponse.json({
      activityTypes: allTypes,
      customTypes: transformedCustom,
      overrides: overrides || [],
    });
  } catch (error) {
    console.error('Error fetching activity types:', error);
    return NextResponse.json({ error: 'Failed to fetch activity types' }, { status: 500 });
  }
}

// POST /api/activities/custom - Create custom activity type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facilityId,
      userId,
      code,
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
    } = body;

    if (!facilityId || !code || !label || !iconName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Validate code format (snake_case)
    const codeRegex = /^[a-z][a-z0-9_]*$/;
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        { error: 'Code must be lowercase with underscores (e.g., my_activity)' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const { data: existing } = await supabaseAdmin
      .from('custom_activity_types')
      .select('id')
      .eq('facility_id', facilityId)
      .eq('code', code)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'An activity with this code already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('custom_activity_types')
      .insert({
        facility_id: facilityId,
        code,
        label,
        description,
        icon_name: iconName,
        color,
        bg_color: bgColor,
        glow_color: glowColor,
        max_minutes: maxMinutes || 60,
        warning_minutes: warningMinutes || 45,
        category: category || 'custom',
        sort_order: sortOrder || 100,
        show_in_quick_log: showInQuickLog ?? true,
        allow_notes: allowNotes ?? true,
        allow_buddy: allowBuddy ?? false,
        track_location: trackLocation ?? false,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ activityType: data });
  } catch (error) {
    console.error('Error creating custom activity type:', error);
    return NextResponse.json({ error: 'Failed to create activity type' }, { status: 500 });
  }
}
