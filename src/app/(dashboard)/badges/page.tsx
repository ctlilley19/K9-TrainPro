'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { BadgeCard, TierDots, AwardBadgeModal, type BadgeTier } from '@/components/badges';
import { cn } from '@/lib/utils';
import {
  Award,
  Star,
  Trophy,
  Target,
  Heart,
  Shield,
  Crown,
  Zap,
  Search,
  Plus,
  Dog,
  Calendar,
  Flame,
  GraduationCap,
  Footprints,
  Users,
  Building2,
  Sparkles,
  Medal,
  Clock,
  Sun,
  Moon,
  MapPin,
  Timer,
  CheckCircle2,
  TrendingUp,
  Compass,
  Handshake,
  Home,
  Route,
  PartyPopper,
  CircleDot,
  BadgeCheck,
  Milestone,
  Camera,
  MessageCircle,
  Dumbbell,
  Mountain,
  Waves,
  TreePine,
  CloudRain,
  Snowflake,
  Gift,
  Cake,
  ThumbsUp,
  Brain,
  Eye,
  Ear,
  UserCheck,
  UsersRound,
  Briefcase,
  Lightbulb,
  HeartHandshake,
  Phone,
  Video,
  Bike,
  Tent,
  Sunrise,
  Map,
  Backpack,
  Wind,
  Droplets,
  Fish,
  Anchor,
  Rocket,
  Activity,
  CircleDashed,
  X,
} from 'lucide-react';

// Tier colors for styling
const tierColors: Record<BadgeTier, string> = {
  bronze: '#cd7f32',
  silver: '#94a3b8',
  gold: '#f59e0b',
  platinum: '#22d3ee',
  diamond: '#c084fc',
};

// Badge icon components
const badgeIcons: Record<string, (color: string, size?: number) => React.ReactNode> = {
  star: (color, size = 32) => <Star size={size} stroke={color} />,
  target: (color, size = 32) => <Target size={size} stroke={color} />,
  shield: (color, size = 32) => <Shield size={size} stroke={color} />,
  trophy: (color, size = 32) => <Trophy size={size} stroke={color} />,
  crown: (color, size = 32) => <Crown size={size} stroke={color} />,
  zap: (color, size = 32) => <Zap size={size} stroke={color} />,
  heart: (color, size = 32) => <Heart size={size} stroke={color} />,
  dog: (color, size = 32) => <Dog size={size} stroke={color} />,
  flame: (color, size = 32) => <Flame size={size} stroke={color} />,
  graduation: (color, size = 32) => <GraduationCap size={size} stroke={color} />,
  footprints: (color, size = 32) => <Footprints size={size} stroke={color} />,
  users: (color, size = 32) => <Users size={size} stroke={color} />,
  building: (color, size = 32) => <Building2 size={size} stroke={color} />,
  sparkles: (color, size = 32) => <Sparkles size={size} stroke={color} />,
  medal: (color, size = 32) => <Medal size={size} stroke={color} />,
  clock: (color, size = 32) => <Clock size={size} stroke={color} />,
  sun: (color, size = 32) => <Sun size={size} stroke={color} />,
  moon: (color, size = 32) => <Moon size={size} stroke={color} />,
  mappin: (color, size = 32) => <MapPin size={size} stroke={color} />,
  timer: (color, size = 32) => <Timer size={size} stroke={color} />,
  check: (color, size = 32) => <CheckCircle2 size={size} stroke={color} />,
  trending: (color, size = 32) => <TrendingUp size={size} stroke={color} />,
  compass: (color, size = 32) => <Compass size={size} stroke={color} />,
  handshake: (color, size = 32) => <Handshake size={size} stroke={color} />,
  home: (color, size = 32) => <Home size={size} stroke={color} />,
  route: (color, size = 32) => <Route size={size} stroke={color} />,
  party: (color, size = 32) => <PartyPopper size={size} stroke={color} />,
  circle: (color, size = 32) => <CircleDot size={size} stroke={color} />,
  badge: (color, size = 32) => <BadgeCheck size={size} stroke={color} />,
  milestone: (color, size = 32) => <Milestone size={size} stroke={color} />,
  award: (color, size = 32) => <Award size={size} stroke={color} />,
  calendar: (color, size = 32) => <Calendar size={size} stroke={color} />,
  camera: (color, size = 32) => <Camera size={size} stroke={color} />,
  message: (color, size = 32) => <MessageCircle size={size} stroke={color} />,
  dumbbell: (color, size = 32) => <Dumbbell size={size} stroke={color} />,
  mountain: (color, size = 32) => <Mountain size={size} stroke={color} />,
  waves: (color, size = 32) => <Waves size={size} stroke={color} />,
  tree: (color, size = 32) => <TreePine size={size} stroke={color} />,
  rain: (color, size = 32) => <CloudRain size={size} stroke={color} />,
  snow: (color, size = 32) => <Snowflake size={size} stroke={color} />,
  gift: (color, size = 32) => <Gift size={size} stroke={color} />,
  cake: (color, size = 32) => <Cake size={size} stroke={color} />,
  thumbsup: (color, size = 32) => <ThumbsUp size={size} stroke={color} />,
  brain: (color, size = 32) => <Brain size={size} stroke={color} />,
  eye: (color, size = 32) => <Eye size={size} stroke={color} />,
  ear: (color, size = 32) => <Ear size={size} stroke={color} />,
  usercheck: (color, size = 32) => <UserCheck size={size} stroke={color} />,
  group: (color, size = 32) => <UsersRound size={size} stroke={color} />,
  briefcase: (color, size = 32) => <Briefcase size={size} stroke={color} />,
  lightbulb: (color, size = 32) => <Lightbulb size={size} stroke={color} />,
  helping: (color, size = 32) => <HeartHandshake size={size} stroke={color} />,
  phone: (color, size = 32) => <Phone size={size} stroke={color} />,
  video: (color, size = 32) => <Video size={size} stroke={color} />,
  bike: (color, size = 32) => <Bike size={size} stroke={color} />,
  tent: (color, size = 32) => <Tent size={size} stroke={color} />,
  sunrise: (color, size = 32) => <Sunrise size={size} stroke={color} />,
  map: (color, size = 32) => <Map size={size} stroke={color} />,
  backpack: (color, size = 32) => <Backpack size={size} stroke={color} />,
  wind: (color, size = 32) => <Wind size={size} stroke={color} />,
  droplets: (color, size = 32) => <Droplets size={size} stroke={color} />,
  fish: (color, size = 32) => <Fish size={size} stroke={color} />,
  anchor: (color, size = 32) => <Anchor size={size} stroke={color} />,
  rocket: (color, size = 32) => <Rocket size={size} stroke={color} />,
  activity: (color, size = 32) => <Activity size={size} stroke={color} />,
  circledashed: (color, size = 32) => <CircleDashed size={size} stroke={color} />,
};

// Badge definitions with full tier support
const skillBadges = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'First steps in training',
    tier: 'bronze' as BadgeTier,
    icon: 'dog',
    category: 'tier',
  },
  {
    id: 'novice',
    name: 'Novice',
    description: 'Building foundations',
    tier: 'silver' as BadgeTier,
    icon: 'dog',
    category: 'tier',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Mastering skills',
    tier: 'gold' as BadgeTier,
    icon: 'star',
    category: 'tier',
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Elite trainer status',
    tier: 'platinum' as BadgeTier,
    icon: 'crown',
    category: 'tier',
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Legendary achievement',
    tier: 'diamond' as BadgeTier,
    icon: 'crown',
    category: 'tier',
  },
];

const achievementBadges = [
  {
    id: 'recall-pro',
    name: 'Recall Pro',
    description: 'Perfect recall at distance',
    color: 'green' as const,
    icon: 'target',
  },
  {
    id: 'heel-master',
    name: 'Heel Master',
    description: 'Perfect heel position',
    color: 'blue' as const,
    icon: 'footprints',
  },
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: '15+ min place/stay',
    color: 'purple' as const,
    icon: 'shield',
  },
  {
    id: 'star-pupil',
    name: 'Star Pupil',
    description: 'Learned 3 skills in 1 day',
    color: 'yellow' as const,
    icon: 'star',
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: '10 successful play sessions',
    color: 'pink' as const,
    icon: 'heart',
  },
  {
    id: 'graduate',
    name: 'Graduate',
    description: 'Completed full program',
    color: 'orange' as const,
    icon: 'graduation',
  },
  {
    id: 'cgc-ready',
    name: 'CGC Ready',
    description: 'Canine Good Citizen prep',
    color: 'blue' as const,
    icon: 'badge',
  },
  {
    id: 'trick-star',
    name: 'Trick Star',
    description: 'Learned 10+ tricks',
    color: 'purple' as const,
    icon: 'sparkles',
  },
];

const milestoneBadges = [
  {
    id: 'day-1',
    name: 'Day 1',
    description: 'First day in training',
    color: 'cyan' as const,
    icon: 'flame',
  },
  {
    id: 'week-1',
    name: 'Week 1',
    description: '7 days of progress',
    color: 'purple' as const,
    icon: 'trophy',
  },
  {
    id: 'perfect-potty',
    name: 'Perfect Potty',
    description: 'No accidents for 7 days',
    color: 'green' as const,
    icon: 'check',
  },
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Mastered skill in <3 days',
    color: 'yellow' as const,
    icon: 'zap',
  },
  {
    id: 'month-1',
    name: 'Month 1',
    description: '30 days milestone',
    color: 'orange' as const,
    icon: 'calendar',
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'All goals met for 7 days',
    color: 'green' as const,
    icon: 'star',
  },
];

// Streak badges
const streakBadges = [
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Training 3 days in a row',
    color: 'orange' as const,
    icon: 'flame',
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: '7 day training streak',
    color: 'yellow' as const,
    icon: 'flame',
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: '30 day training streak',
    color: 'green' as const,
    icon: 'flame',
  },
  {
    id: 'streak-90',
    name: 'Quarter Champ',
    description: '90 day training streak',
    color: 'purple' as const,
    icon: 'flame',
  },
  {
    id: 'streak-365',
    name: 'Year Legend',
    description: '365 day training streak',
    color: 'red' as const,
    icon: 'crown',
  },
];

// Badge library definitions (for trainers to award)
const badgeLibrary = [
  // === OBEDIENCE BASICS ===
  {
    id: 'sit-master',
    name: 'Sit Master',
    description: 'Master the sit command with reliability',
    category: 'obedience',
    icon: 'star',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'stay-champion',
    name: 'Stay Champion',
    description: 'Master the stay command with duration',
    category: 'obedience',
    icon: 'shield',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'recall-master',
    name: 'Recall Master',
    description: 'Come when called from any distance',
    category: 'obedience',
    icon: 'target',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'down-master',
    name: 'Down Master',
    description: 'Reliable down command on cue',
    category: 'obedience',
    icon: 'star',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'leave-it-pro',
    name: 'Leave It Pro',
    description: 'Impulse control around distractions',
    category: 'obedience',
    icon: 'shield',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'drop-it-star',
    name: 'Drop It Star',
    description: 'Reliable release of items on command',
    category: 'obedience',
    icon: 'star',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === LEASH & WALKING ===
  {
    id: 'leash-walking',
    name: 'Leash Walking Pro',
    description: 'Walk calmly on leash without pulling',
    category: 'leash',
    icon: 'route',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'heel-master',
    name: 'Heel Master',
    description: 'Perfect heel position beside handler',
    category: 'leash',
    icon: 'footprints',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'loose-leash',
    name: 'Loose Leash Legend',
    description: 'Walk without tension on leash',
    category: 'leash',
    icon: 'route',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === SOCIAL SKILLS ===
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Positive interactions with dogs and people',
    category: 'social',
    icon: 'heart',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'dog-friendly',
    name: 'Dog Friendly',
    description: 'Calm and appropriate with other dogs',
    category: 'social',
    icon: 'dog',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'stranger-friendly',
    name: 'Stranger Friendly',
    description: 'Calm greetings with new people',
    category: 'social',
    icon: 'users',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'polite-greeter',
    name: 'Polite Greeter',
    description: 'No jumping when meeting people',
    category: 'social',
    icon: 'handshake',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === BEHAVIOR & MANNERS ===
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: 'Extended place/stay command mastery',
    category: 'behavior',
    icon: 'shield',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'crate-comfortable',
    name: 'Crate Comfortable',
    description: 'Relaxed and calm in kennel/crate',
    category: 'behavior',
    icon: 'home',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'potty-pro',
    name: 'Potty Pro',
    description: 'House training mastery',
    category: 'behavior',
    icon: 'check',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'calm-traveler',
    name: 'Calm Traveler',
    description: 'Relaxed behavior during car rides',
    category: 'behavior',
    icon: 'compass',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'impulse-control',
    name: 'Impulse Control',
    description: 'Wait patiently for food and doors',
    category: 'behavior',
    icon: 'timer',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === AKC-INSPIRED CERTIFICATIONS ===
  {
    id: 'cgc-ready',
    name: 'CGC Ready',
    description: 'Canine Good Citizen test preparation',
    category: 'certification',
    icon: 'badge',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'community-canine',
    name: 'Community Canine',
    description: 'Advanced CGC in real-world settings',
    category: 'certification',
    icon: 'building',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'urban-canine',
    name: 'Urban Canine',
    description: 'City environment proficiency',
    category: 'certification',
    icon: 'building',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'therapy-ready',
    name: 'Therapy Dog Ready',
    description: 'Temperament for therapy work',
    category: 'certification',
    icon: 'heart',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === TRICK DOG ===
  {
    id: 'trick-novice',
    name: 'Novice Tricks',
    description: 'Learned 10 basic tricks',
    category: 'tricks',
    icon: 'sparkles',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'trick-intermediate',
    name: 'Intermediate Tricks',
    description: 'Mastered intermediate tricks',
    category: 'tricks',
    icon: 'sparkles',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'trick-advanced',
    name: 'Advanced Tricks',
    description: 'Expert level trick performance',
    category: 'tricks',
    icon: 'sparkles',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'trick-performer',
    name: 'Trick Performer',
    description: 'Can perform trick routines',
    category: 'tricks',
    icon: 'star',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'trick-elite',
    name: 'Elite Performer',
    description: 'Scripted performance mastery',
    category: 'tricks',
    icon: 'crown',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === OBEDIENCE COMPETITION ===
  {
    id: 'companion-dog',
    name: 'Companion Dog',
    description: 'Novice obedience competition ready',
    category: 'competition',
    icon: 'medal',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'companion-excellent',
    name: 'Companion Excellent',
    description: 'Open class obedience skills',
    category: 'competition',
    icon: 'medal',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'utility-dog',
    name: 'Utility Dog',
    description: 'Advanced utility obedience',
    category: 'competition',
    icon: 'trophy',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === MILESTONES ===
  {
    id: 'first-week',
    name: 'First Week Star',
    description: 'Complete the first week of training',
    category: 'milestone',
    icon: 'trophy',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'first-month',
    name: 'First Month',
    description: 'One month training milestone',
    category: 'milestone',
    icon: 'calendar',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'three-months',
    name: 'Quarter Complete',
    description: 'Three months of progress',
    category: 'milestone',
    icon: 'milestone',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: 'graduate',
    name: 'Program Graduate',
    description: 'Successfully complete a training program',
    category: 'milestone',
    icon: 'graduation',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === STREAKS ===
  {
    id: 'streak-week',
    name: 'Week Warrior',
    description: '7 consecutive training days',
    category: 'streak',
    icon: 'flame',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'streak-month',
    name: 'Monthly Master',
    description: '30 consecutive training days',
    category: 'streak',
    icon: 'flame',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: 'streak-quarter',
    name: 'Quarter Champion',
    description: '90 consecutive training days',
    category: 'streak',
    icon: 'flame',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'streak-year',
    name: 'Year Legend',
    description: '365 consecutive training days',
    category: 'streak',
    icon: 'crown',
    tiers: ['gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === SPECIAL ACHIEVEMENTS ===
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Morning training sessions before 7 AM',
    category: 'special',
    icon: 'sunrise',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Evening training dedication',
    category: 'special',
    icon: 'moon',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Mastered skill in under 3 days',
    category: 'special',
    icon: 'zap',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'perfect-session',
    name: 'Perfect Session',
    description: 'Flawless training performance',
    category: 'special',
    icon: 'star',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Overcame a training challenge',
    category: 'special',
    icon: 'trending',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'celebration',
    name: 'Celebration',
    description: 'Special achievement unlocked',
    category: 'special',
    icon: 'party',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === FAMILY/PET PARENT BADGES ===
  {
    id: 'parent-mvp',
    name: 'Parent MVP',
    description: 'Most engaged pet parent this month',
    category: 'family',
    icon: 'trophy',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'photo-pro',
    name: 'Photo Pro',
    description: 'Uploaded 50+ photos to gallery',
    category: 'family',
    icon: 'camera',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'comm-star',
    name: 'Communication Star',
    description: 'Responds quickly to updates',
    category: 'family',
    icon: 'message',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'homework-hero',
    name: 'Homework Hero',
    description: 'Consistently follows training homework',
    category: 'family',
    icon: 'check',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'event-attendee',
    name: 'Event Attendee',
    description: 'Attended graduation or demo day',
    category: 'family',
    icon: 'party',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'referral-champ',
    name: 'Referral Champion',
    description: 'Referred new clients to training',
    category: 'family',
    icon: 'users',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'loyal-client',
    name: 'Loyal Client',
    description: '1+ year training relationship',
    category: 'family',
    icon: 'heart',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'video-star',
    name: 'Video Star',
    description: 'Shared training progress videos',
    category: 'family',
    icon: 'video',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === TRAINER BADGES ===
  {
    id: 'trainer-pro',
    name: 'Training Pro',
    description: 'Completed 100+ training sessions',
    category: 'trainer',
    icon: 'briefcase',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Trained and guided new trainers',
    category: 'trainer',
    icon: 'helping',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'attendance-perfect',
    name: 'Perfect Attendance',
    description: 'No missed shifts this month',
    category: 'trainer',
    icon: 'calendar',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'graduation-guru',
    name: 'Graduation Guru',
    description: 'Graduated 10+ dogs successfully',
    category: 'trainer',
    icon: 'graduation',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'behavior-specialist',
    name: 'Behavior Specialist',
    description: 'Resolved complex behavioral cases',
    category: 'trainer',
    icon: 'brain',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'customer-champ',
    name: 'Customer Champion',
    description: 'High parent satisfaction scores',
    category: 'trainer',
    icon: 'thumbsup',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'cert-master',
    name: 'Certification Master',
    description: 'Multiple professional certifications',
    category: 'trainer',
    icon: 'badge',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'innovator',
    name: 'Innovator',
    description: 'Created new training methods',
    category: 'trainer',
    icon: 'lightbulb',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Excellent collaboration with team',
    category: 'trainer',
    icon: 'group',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === RUNNING & JOGGING BADGES ===
  {
    id: 'first-run',
    name: 'First Run',
    description: 'First outdoor running session',
    category: 'fitness',
    icon: 'footprints',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: '5k-champion',
    name: '5K Champion',
    description: 'Completed first 5K run together',
    category: 'fitness',
    icon: 'medal',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: '10k-warrior',
    name: '10K Warrior',
    description: 'Conquered the 10K distance',
    category: 'fitness',
    icon: 'medal',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'marathon-master',
    name: 'Marathon Master',
    description: 'Finished a full marathon together',
    category: 'fitness',
    icon: 'trophy',
    tiers: ['gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Personal best time achieved',
    category: 'fitness',
    icon: 'zap',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === HIKING & TRAIL BADGES ===
  {
    id: 'trailblazer',
    name: 'Trailblazer',
    description: 'First hiking adventure completed',
    category: 'fitness',
    icon: 'map',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'summit-seeker',
    name: 'Summit Seeker',
    description: 'Reached a mountain peak',
    category: 'fitness',
    icon: 'mountain',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'forest-explorer',
    name: 'Forest Explorer',
    description: 'Completed forest trail adventures',
    category: 'fitness',
    icon: 'tree',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: '50-mile-club',
    name: '50 Mile Club',
    description: '50 miles of hiking logged',
    category: 'fitness',
    icon: 'mappin',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: '100-mile-legend',
    name: '100 Mile Legend',
    description: '100 miles hiking milestone',
    category: 'fitness',
    icon: 'medal',
    tiers: ['silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'trail-master',
    name: 'Trail Master',
    description: '250+ miles conquered on trails',
    category: 'fitness',
    icon: 'crown',
    tiers: ['gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === CYCLING BADGES ===
  {
    id: 'bike-buddy',
    name: 'Bike Buddy',
    description: 'First cycling session together',
    category: 'fitness',
    icon: 'bike',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'trail-rider',
    name: 'Trail Rider',
    description: 'Off-road cycling adventure',
    category: 'fitness',
    icon: 'bike',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: 'century-cyclist',
    name: 'Century Cyclist',
    description: '100 mile cycling achievement',
    category: 'fitness',
    icon: 'trophy',
    tiers: ['gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === SWIMMING & WATER BADGES ===
  {
    id: 'water-pup',
    name: 'Water Pup',
    description: 'First swimming session',
    category: 'fitness',
    icon: 'droplets',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'lake-explorer',
    name: 'Lake Explorer',
    description: 'Open water swimming adventures',
    category: 'fitness',
    icon: 'waves',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: 'beach-lover',
    name: 'Beach Lover',
    description: 'Beach running and swimming',
    category: 'fitness',
    icon: 'waves',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'dock-diver',
    name: 'Dock Diver',
    description: 'Dock diving training mastery',
    category: 'fitness',
    icon: 'anchor',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'swim-star',
    name: 'Swimming Star',
    description: 'Pool or water training sessions',
    category: 'fitness',
    icon: 'waves',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === OUTDOOR ADVENTURE BADGES ===
  {
    id: 'camp-companion',
    name: 'Camp Companion',
    description: 'Overnight camping trip partner',
    category: 'fitness',
    icon: 'tent',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'sunrise-chaser',
    name: 'Sunrise Chaser',
    description: 'Dawn outdoor adventure sessions',
    category: 'fitness',
    icon: 'sunrise',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: 'wilderness-explorer',
    name: 'Wilderness Explorer',
    description: 'Backcountry adventures mastered',
    category: 'fitness',
    icon: 'compass',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'all-terrain-pup',
    name: 'All-Terrain Pup',
    description: 'Various terrain mastery',
    category: 'fitness',
    icon: 'mountain',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'pack-leader',
    name: 'Pack Leader',
    description: 'Expedition leader status achieved',
    category: 'fitness',
    icon: 'backpack',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'adventure-dog',
    name: 'Adventure Dog',
    description: 'Trail and hiking training',
    category: 'fitness',
    icon: 'mountain',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === FITNESS MILESTONES ===
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'First fitness milestone achieved',
    category: 'fitness',
    icon: 'footprints',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: '10k-steps',
    name: '10K Steps',
    description: '10,000 steps in a single day',
    category: 'fitness',
    icon: 'activity',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: '7-day consecutive activity streak',
    category: 'fitness',
    icon: 'flame',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: '30-day-challenge',
    name: '30 Day Challenge',
    description: 'Month of daily activity completed',
    category: 'fitness',
    icon: 'calendar',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'iron-paws',
    name: 'Iron Paws',
    description: 'Elite fitness level achieved',
    category: 'fitness',
    icon: 'dumbbell',
    tiers: ['silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'ultimate-athlete',
    name: 'Ultimate Athlete',
    description: 'Peak physical conditioning',
    category: 'fitness',
    icon: 'rocket',
    tiers: ['gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === EXISTING FITNESS BADGES (updated with full tiers) ===
  {
    id: 'first-walk',
    name: 'First Walk',
    description: 'Completed first outdoor walk',
    category: 'fitness',
    icon: 'footprints',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'walker-5k',
    name: '5K Walker',
    description: 'Walked 5 kilometers total',
    category: 'fitness',
    icon: 'route',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'walker-10k',
    name: '10K Walker',
    description: 'Walked 10 kilometers total',
    category: 'fitness',
    icon: 'route',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: '26.2 miles walked total',
    category: 'fitness',
    icon: 'medal',
    tiers: ['silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: '100 miles walked total',
    category: 'fitness',
    icon: 'trophy',
    tiers: ['gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'cardio-king',
    name: 'Cardio King',
    description: 'High activity training sessions',
    category: 'fitness',
    icon: 'dumbbell',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'endurance-expert',
    name: 'Endurance Expert',
    description: 'Long duration training sessions',
    category: 'fitness',
    icon: 'timer',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'agility-star',
    name: 'Agility Star',
    description: 'Completed agility course training',
    category: 'fitness',
    icon: 'zap',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'urban-explorer',
    name: 'Urban Explorer',
    description: 'City environment walks',
    category: 'fitness',
    icon: 'building',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'park-hopper',
    name: 'Park Hopper',
    description: 'Visited multiple parks',
    category: 'fitness',
    icon: 'tree',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },

  // === WEATHER & ENVIRONMENT BADGES ===
  {
    id: 'weather-warrior',
    name: 'Weather Warrior',
    description: 'Trained in rain or challenging weather',
    category: 'environment',
    icon: 'rain',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'snow-trooper',
    name: 'Snow Trooper',
    description: 'Trained in snowy conditions',
    category: 'environment',
    icon: 'snow',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'distraction-destroyer',
    name: 'Distraction Destroyer',
    description: 'Focused around major distractions',
    category: 'environment',
    icon: 'eye',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'sound-steady',
    name: 'Sound Steady',
    description: 'Calm around loud noises',
    category: 'environment',
    icon: 'ear',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'wind-walker',
    name: 'Wind Walker',
    description: 'Calm in windy conditions',
    category: 'environment',
    icon: 'wind',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },

  // === FUN & CELEBRATION BADGES ===
  {
    id: 'birthday-pup',
    name: 'Birthday Pup',
    description: 'Celebrated training birthday',
    category: 'fun',
    icon: 'cake',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'holiday-hero',
    name: 'Holiday Hero',
    description: 'Training on holidays',
    category: 'fun',
    icon: 'gift',
    tiers: ['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[],
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Dedicated weekend sessions',
    category: 'fun',
    icon: 'sun',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'photogenic',
    name: 'Photogenic',
    description: 'Best photo of the month',
    category: 'fun',
    icon: 'camera',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'focus-master',
    name: 'Focus Master',
    description: 'Extended attention span achieved',
    category: 'fun',
    icon: 'brain',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'vet-ready',
    name: 'Vet Ready',
    description: 'Calm during vet visits',
    category: 'fun',
    icon: 'usercheck',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'groomer-friendly',
    name: 'Groomer Friendly',
    description: 'Cooperative during grooming',
    category: 'fun',
    icon: 'sparkles',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
];

// Mock recently awarded badges
const recentAwards = [
  { id: '1', dog_name: 'Max', dog_photo: null, badge_name: 'Sit Master', tier: 'silver' as BadgeTier, awarded_at: '2025-01-13', awarded_by: 'Sarah Johnson' },
  { id: '2', dog_name: 'Bella', dog_photo: null, badge_name: 'First Week Star', tier: 'bronze' as BadgeTier, awarded_at: '2025-01-12', awarded_by: 'John Smith' },
  { id: '3', dog_name: 'Luna', dog_photo: null, badge_name: 'Stay Champion', tier: 'bronze' as BadgeTier, awarded_at: '2025-01-11', awarded_by: 'Sarah Johnson' },
  { id: '4', dog_name: 'Max', dog_photo: null, badge_name: 'Leash Walking Pro', tier: 'bronze' as BadgeTier, awarded_at: '2025-01-10', awarded_by: 'Mike Wilson' },
];

// Stats
const stats = {
  totalAwarded: 156,
  thisWeek: 12,
  goldBadges: 23,
  activeDogs: 18,
};

// Badge detail type
interface BadgeDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tiers: BadgeTier[];
}

export default function BadgesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDetail | null>(null);

  const categories = ['all', 'obedience', 'leash', 'social', 'behavior', 'certification', 'tricks', 'competition', 'milestone', 'streak', 'special', 'family', 'trainer', 'fitness', 'environment', 'fun'];

  const filteredBadges = useMemo(() => {
    return badgeLibrary.filter((badge) => {
      const matchesSearch =
        badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Badges"
        description="Manage and award training badges"
        action={
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setIsAwardModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400"
          >
            Award Badge
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <Award size={24} className="mx-auto text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalAwarded}</p>
            <p className="text-xs text-surface-500">Total Awarded</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Trophy size={24} className="mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
            <p className="text-xs text-surface-500">This Week</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Star size={24} className="mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.goldBadges}</p>
            <p className="text-xs text-surface-500">Gold Badges</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Target size={24} className="mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.activeDogs}</p>
            <p className="text-xs text-surface-500">Dogs in Training</p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Tier Badges */}
      <section>
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4 pb-3 border-b border-white/[0.06]">
          Skill Tier Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {skillBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              tier={badge.tier}
              title={badge.name}
              description={badge.description}
              icon={badgeIcons[badge.icon]?.(tierColors[badge.tier]) || <Award size={32} />}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Special Achievement Badges */}
      <section>
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4 pb-3 border-b border-white/[0.06]">
          Special Achievement Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {achievementBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              achievementColor={badge.color}
              title={badge.name}
              description={badge.description}
              icon={badgeIcons[badge.icon]?.(
                badge.color === 'green' ? '#4ade80' :
                badge.color === 'blue' ? '#60a5fa' :
                badge.color === 'purple' ? '#a78bfa' :
                badge.color === 'yellow' ? '#facc15' :
                badge.color === 'pink' ? '#f472b6' :
                badge.color === 'orange' ? '#fb923c' : '#9ca3af'
              ) || <Award size={32} />}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Milestone Badges */}
      <section>
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4 pb-3 border-b border-white/[0.06]">
          Milestone Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {milestoneBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              achievementColor={badge.color}
              title={badge.name}
              description={badge.description}
              icon={badgeIcons[badge.icon]?.(
                badge.color === 'cyan' ? '#22d3ee' :
                badge.color === 'purple' ? '#a78bfa' :
                badge.color === 'green' ? '#4ade80' :
                badge.color === 'orange' ? '#fb923c' :
                badge.color === 'yellow' ? '#facc15' : '#9ca3af'
              ) || <Award size={32} />}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Streak Badges */}
      <section>
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4 pb-3 border-b border-white/[0.06]">
          Streak Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {streakBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              achievementColor={badge.color}
              title={badge.name}
              description={badge.description}
              icon={badgeIcons[badge.icon]?.(
                badge.color === 'orange' ? '#fb923c' :
                badge.color === 'yellow' ? '#facc15' :
                badge.color === 'green' ? '#4ade80' :
                badge.color === 'purple' ? '#a78bfa' :
                badge.color === 'red' ? '#f87171' : '#9ca3af'
              ) || <Award size={32} />}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Recent Awards */}
      <Card>
        <CardHeader title="Recently Awarded" />
        <CardContent>
          <div className="space-y-3">
            {recentAwards.map((award) => {
              const badge = badgeLibrary.find(b => b.name === award.badge_name);
              return (
                <div
                  key={award.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
                >
                  <Avatar name={award.dog_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {award.dog_name} earned <span className="text-amber-400">{award.badge_name}</span>
                    </p>
                    <p className="text-xs text-surface-500">
                      Awarded by {award.awarded_by} • {new Date(award.awarded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(145deg, ${tierColors[award.tier]}33, ${tierColors[award.tier]}1a)`,
                      boxShadow: `0 0 12px ${tierColors[award.tier]}66`,
                    }}
                  >
                    {badgeIcons[badge?.icon || 'star']?.(tierColors[award.tier], 20) || <Star size={20} />}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge Library */}
      <Card>
        <CardHeader
          title="Badge Library"
          action={
            <Input
              placeholder="Search badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              className="w-48"
            />
          }
        />
        <CardContent>
          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors',
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white'
                    : 'bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Badge Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className="p-4 rounded-xl bg-gradient-to-br from-surface-800/90 to-surface-900/95 border border-white/[0.06] hover:border-white/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(145deg, rgba(107,114,128,0.15), rgba(107,114,128,0.08))' }}
                  >
                    {badgeIcons[badge.icon]?.('#9ca3af', 20) || <Award size={20} className="text-surface-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{badge.name}</h3>
                    <p className="text-xs text-surface-500 capitalize">{badge.category}</p>
                  </div>
                </div>
                <p className="text-sm text-surface-400 mb-4">{badge.description}</p>
                <TierDots availableTiers={badge.tiers} size="sm" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Award Badge Modal */}
      <AwardBadgeModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        onSuccess={() => {
          // Refresh data
          console.log('Badge awarded successfully');
        }}
      />

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setSelectedBadge(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-surface-700">
                <h2 className="text-lg font-semibold text-white">{selectedBadge.name}</h2>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="text-surface-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Badge Icon */}
                <div className="flex justify-center mb-6">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, rgba(107,114,128,0.2), rgba(107,114,128,0.08))',
                      boxShadow: '0 0 30px rgba(107,114,128,0.3)',
                    }}
                  >
                    {badgeIcons[selectedBadge.icon]?.('#9ca3af', 48) || <Award size={48} className="text-surface-400" />}
                  </div>
                </div>

                {/* Description */}
                <p className="text-center text-surface-400 mb-6">{selectedBadge.description}</p>

                {/* Category */}
                <div className="flex justify-center mb-6">
                  <span className="px-3 py-1 rounded-full bg-surface-800 text-surface-300 text-sm capitalize">
                    {selectedBadge.category}
                  </span>
                </div>

                {/* Tier Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Available Tiers</h3>
                  {selectedBadge.tiers.map((tier) => (
                    <div
                      key={tier}
                      className="flex items-center gap-4 p-3 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${tierColors[tier]}15, ${tierColors[tier]}05)`,
                        border: `1px solid ${tierColors[tier]}30`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(145deg, ${tierColors[tier]}33, ${tierColors[tier]}1a)`,
                          boxShadow: `0 0 12px ${tierColors[tier]}40`,
                        }}
                      >
                        {badgeIcons[selectedBadge.icon]?.(tierColors[tier], 20) || <Award size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize" style={{ color: tierColors[tier] }}>
                          {tier}
                        </p>
                        <p className="text-xs text-surface-500">
                          {tier === 'bronze' && 'Beginning level - First steps in mastering this skill'}
                          {tier === 'silver' && 'Intermediate level - Building solid foundations'}
                          {tier === 'gold' && 'Advanced level - Demonstrating strong proficiency'}
                          {tier === 'platinum' && 'Expert level - Exceptional mastery achieved'}
                          {tier === 'diamond' && 'Master level - Legendary achievement unlocked'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-4 border-t border-surface-700">
                <Button variant="outline" onClick={() => setSelectedBadge(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="bg-amber-500 hover:bg-amber-400"
                  onClick={() => {
                    setSelectedBadge(null);
                    setIsAwardModalOpen(true);
                  }}
                >
                  Award This Badge
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setIsAwardModalOpen(true)}
        className="fixed bottom-20 right-4 sm:hidden w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:bg-amber-400 active:scale-95 transition-all z-40"
        style={{ boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}
        aria-label="Award Badge"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
