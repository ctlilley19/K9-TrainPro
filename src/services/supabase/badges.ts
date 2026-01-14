import { supabase, isDemoMode } from '@/lib/supabase';
import type { Badge, BadgeTier } from '@/types/database';

// Badge definitions (could be moved to database)
export const badgeDefinitions = {
  // Obedience
  sit_master: {
    name: 'Sit Master',
    description: 'Mastered the sit command',
    category: 'obedience',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    criteria: {
      bronze: 'Sit on command 50% of the time',
      silver: 'Sit on command 70% of the time',
      gold: 'Sit on command 90% of the time',
      platinum: 'Sit with duration and distractions',
      diamond: 'Perfect sit in any environment',
    },
  },
  stay_champion: {
    name: 'Stay Champion',
    description: 'Mastered the stay command',
    category: 'obedience',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    criteria: {
      bronze: 'Stay for 10 seconds',
      silver: 'Stay for 30 seconds',
      gold: 'Stay for 1 minute',
      platinum: 'Stay with movement and distractions',
      diamond: 'Perfect stay in any environment',
    },
  },
  recall_master: {
    name: 'Recall Master',
    description: 'Mastered the recall command',
    category: 'obedience',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    criteria: {
      bronze: 'Recall from 10ft',
      silver: 'Recall from 25ft',
      gold: 'Recall from 50ft',
      platinum: 'Recall with distractions',
      diamond: 'Perfect recall in any environment',
    },
  },
  // Leash Skills
  loose_leash_walker: {
    name: 'Loose Leash Walker',
    description: 'Walks without pulling on leash',
    category: 'leash',
    tiers: ['bronze', 'silver', 'gold'],
    criteria: {
      bronze: 'Minimal pulling on walks',
      silver: 'Consistent loose leash',
      gold: 'Perfect loose leash in all environments',
    },
  },
  heel_master: {
    name: 'Heel Master',
    description: 'Walks in perfect heel position',
    category: 'leash',
    tiers: ['bronze', 'silver', 'gold'],
    criteria: {
      bronze: 'Basic heel position',
      silver: 'Consistent heel with turns',
      gold: 'Perfect heel in all situations',
    },
  },
  // Behavior
  impulse_control: {
    name: 'Impulse Control',
    description: 'Shows excellent self-control',
    category: 'behavior',
    tiers: ['bronze', 'silver', 'gold'],
    criteria: {
      bronze: 'Wait before eating',
      silver: 'Ignore dropped food',
      gold: 'Perfect impulse control',
    },
  },
  calm_collected: {
    name: 'Calm & Collected',
    description: 'Remains calm in exciting situations',
    category: 'behavior',
    tiers: ['bronze', 'silver', 'gold'],
    criteria: {
      bronze: 'Calm during basic activities',
      silver: 'Calm with mild distractions',
      gold: 'Calm in any situation',
    },
  },
  // Socialization
  dog_friendly: {
    name: 'Dog Friendly',
    description: 'Plays well with other dogs',
    category: 'social',
    tiers: ['bronze', 'silver', 'gold'],
    criteria: {
      bronze: 'Tolerates other dogs',
      silver: 'Plays appropriately',
      gold: 'Model dog park citizen',
    },
  },
  // Milestones
  first_steps: {
    name: 'First Steps',
    description: 'Completed first training session',
    category: 'milestone',
    tiers: ['bronze'],
    criteria: {
      bronze: 'Completed first day',
    },
  },
  week_champion: {
    name: 'Week Champion',
    description: 'Completed first week of training',
    category: 'milestone',
    tiers: ['bronze'],
    criteria: {
      bronze: 'Completed one week',
    },
  },
  graduate: {
    name: 'Graduate',
    description: 'Completed training program',
    category: 'milestone',
    tiers: ['gold'],
    criteria: {
      gold: 'Completed full program',
    },
  },
};

export type BadgeDefinitionKey = keyof typeof badgeDefinitions;

export const badgesService = {
  // Get all badges for a dog
  async getByDog(dogId: string): Promise<Badge[]> {
    if (isDemoMode) {
      return mockBadges.filter((b) => b.dog_id === dogId);
    }

    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('dog_id', dogId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all badges for a facility
  async getByFacility(facilityId: string): Promise<Badge[]> {
    if (isDemoMode) {
      return mockBadges;
    }

    const { data, error } = await supabase
      .from('badges')
      .select(`
        *,
        dogs!inner(facility_id)
      `)
      .eq('dogs.facility_id', facilityId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Award a badge to a dog
  async award(
    dogId: string,
    badgeKey: string,
    tier: BadgeTier,
    awardedBy: string,
    notes?: string
  ): Promise<Badge> {
    const definition = badgeDefinitions[badgeKey as BadgeDefinitionKey];
    if (!definition) {
      throw new Error(`Unknown badge: ${badgeKey}`);
    }

    if (!definition.tiers.includes(tier)) {
      throw new Error(`Invalid tier ${tier} for badge ${badgeKey}`);
    }

    if (isDemoMode) {
      const newBadge: Badge = {
        id: crypto.randomUUID(),
        dog_id: dogId,
        badge_type: badgeKey,
        tier,
        earned_at: new Date().toISOString(),
        awarded_by: awardedBy,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockBadges.push(newBadge);
      return newBadge;
    }

    const { data, error } = await supabase
      .from('badges')
      .insert({
        dog_id: dogId,
        badge_type: badgeKey,
        tier,
        earned_at: new Date().toISOString(),
        awarded_by: awardedBy,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upgrade an existing badge to a higher tier
  async upgrade(badgeId: string, newTier: BadgeTier, notes?: string): Promise<Badge> {
    if (isDemoMode) {
      const badge = mockBadges.find((b) => b.id === badgeId);
      if (badge) {
        badge.tier = newTier;
        badge.earned_at = new Date().toISOString();
        if (notes) badge.notes = notes;
      }
      return badge!;
    }

    const { data, error } = await supabase
      .from('badges')
      .update({
        tier: newTier,
        earned_at: new Date().toISOString(),
        notes,
      })
      .eq('id', badgeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove a badge
  async remove(badgeId: string): Promise<void> {
    if (isDemoMode) {
      const index = mockBadges.findIndex((b) => b.id === badgeId);
      if (index > -1) mockBadges.splice(index, 1);
      return;
    }

    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('id', badgeId);

    if (error) throw error;
  },

  // Get badge statistics for a dog
  async getStats(dogId: string): Promise<{
    total: number;
    byTier: Record<BadgeTier, number>;
    byCategory: Record<string, number>;
    recentBadges: Badge[];
  }> {
    const badges = await this.getByDog(dogId);

    const byTier: Record<BadgeTier, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      diamond: 0,
    };

    const byCategory: Record<string, number> = {};

    badges.forEach((badge) => {
      byTier[badge.tier]++;

      const definition = badgeDefinitions[badge.badge_type as BadgeDefinitionKey];
      if (definition) {
        byCategory[definition.category] = (byCategory[definition.category] || 0) + 1;
      }
    });

    return {
      total: badges.length,
      byTier,
      byCategory,
      recentBadges: badges.slice(0, 5),
    };
  },

  // Get available badges (not yet earned) for a dog
  async getAvailable(dogId: string): Promise<{
    badgeKey: string;
    name: string;
    description: string;
    category: string;
    availableTiers: string[];
    earnedTier: string | null;
  }[]> {
    const earnedBadges = await this.getByDog(dogId);
    const earnedMap = new Map(earnedBadges.map((b) => [b.badge_type, b.tier]));

    return Object.entries(badgeDefinitions).map(([key, def]) => ({
      badgeKey: key,
      name: def.name,
      description: def.description,
      category: def.category,
      availableTiers: def.tiers,
      earnedTier: earnedMap.get(key) || null,
    }));
  },

  // Get badge definition
  getDefinition(badgeKey: string) {
    return badgeDefinitions[badgeKey as BadgeDefinitionKey] || null;
  },
};

// Mock data for demo mode
const mockBadges: Badge[] = [
  {
    id: '1',
    dog_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    badge_type: 'sit_master',
    tier: 'gold',
    earned_at: '2025-01-10T10:00:00Z',
    awarded_by: '22222222-2222-2222-2222-222222222222',
    notes: 'Excellent sit command at 95% accuracy',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    dog_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    badge_type: 'loose_leash_walker',
    tier: 'silver',
    earned_at: '2025-01-08T14:00:00Z',
    awarded_by: '22222222-2222-2222-2222-222222222222',
    notes: null,
    created_at: '2025-01-08T14:00:00Z',
    updated_at: '2025-01-08T14:00:00Z',
  },
  {
    id: '3',
    dog_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    badge_type: 'first_steps',
    tier: 'bronze',
    earned_at: '2025-01-06T09:00:00Z',
    awarded_by: '22222222-2222-2222-2222-222222222222',
    notes: 'Welcome to training!',
    created_at: '2025-01-06T09:00:00Z',
    updated_at: '2025-01-06T09:00:00Z',
  },
];

export default badgesService;
