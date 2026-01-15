'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  Search,
  Check,
  X,
  Save,
  RotateCcw,
  // Icon library imports
  Dog,
  Cat,
  Bird,
  Fish,
  Bug,
  Rabbit,
  Home,
  Droplets,
  GraduationCap,
  Gamepad2,
  UtensilsCrossed,
  Moon,
  Sparkles,
  Stethoscope,
  Dumbbell,
  Timer,
  Target,
  Trophy,
  Medal,
  Star,
  Heart,
  Zap,
  Flame,
  Snowflake,
  Sun,
  CloudRain,
  Footprints,
  Bike,
  Car,
  Plane,
  MapPin,
  Navigation,
  Compass,
  Bone,
  Cookie,
  Apple,
  Coffee,
  Pill,
  Syringe,
  Scissors,
  Shirt,
  Gift,
  Package,
  Key,
  Lock,
  Bell,
  Megaphone,
  Music,
  Camera,
  Video,
  Book,
  Clipboard,
  FileText,
  Calendar,
  Users,
  UserPlus,
  MessageCircle,
  Phone,
  TreePine,
  Flower,
  Leaf,
  Mountain,
  Waves,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Clock,
  Hourglass,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  PawPrint,
  type LucideIcon,
} from 'lucide-react';

// Icon registry with metadata
const ICON_REGISTRY: Record<string, { icon: LucideIcon; category: string; tags: string[] }> = {
  // Animals
  Dog: { icon: Dog, category: 'Animals', tags: ['pet', 'animal', 'walk', 'canine'] },
  Cat: { icon: Cat, category: 'Animals', tags: ['pet', 'animal', 'feline'] },
  PawPrint: { icon: PawPrint, category: 'Animals', tags: ['pet', 'animal', 'track', 'paw'] },
  Bird: { icon: Bird, category: 'Animals', tags: ['pet', 'animal', 'flying'] },
  Fish: { icon: Fish, category: 'Animals', tags: ['pet', 'animal', 'aquatic'] },
  Bug: { icon: Bug, category: 'Animals', tags: ['insect', 'critter'] },
  Rabbit: { icon: Rabbit, category: 'Animals', tags: ['pet', 'animal', 'bunny'] },

  // Activities
  Home: { icon: Home, category: 'Activities', tags: ['kennel', 'house', 'shelter', 'rest'] },
  Droplets: { icon: Droplets, category: 'Activities', tags: ['water', 'potty', 'bathroom', 'hydrate'] },
  GraduationCap: { icon: GraduationCap, category: 'Activities', tags: ['training', 'learn', 'education', 'school'] },
  Gamepad2: { icon: Gamepad2, category: 'Activities', tags: ['play', 'game', 'fun', 'recreation'] },
  UtensilsCrossed: { icon: UtensilsCrossed, category: 'Activities', tags: ['feeding', 'food', 'eat', 'meal'] },
  Moon: { icon: Moon, category: 'Activities', tags: ['rest', 'sleep', 'night', 'nap'] },
  Sparkles: { icon: Sparkles, category: 'Activities', tags: ['grooming', 'clean', 'shine', 'spa'] },
  Stethoscope: { icon: Stethoscope, category: 'Activities', tags: ['medical', 'health', 'vet', 'doctor'] },
  Dumbbell: { icon: Dumbbell, category: 'Activities', tags: ['exercise', 'workout', 'fitness', 'strength'] },
  Timer: { icon: Timer, category: 'Activities', tags: ['time', 'clock', 'schedule'] },
  Target: { icon: Target, category: 'Activities', tags: ['goal', 'focus', 'aim', 'training'] },
  Trophy: { icon: Trophy, category: 'Activities', tags: ['achievement', 'win', 'success', 'reward'] },
  Medal: { icon: Medal, category: 'Activities', tags: ['award', 'achievement', 'badge'] },
  Star: { icon: Star, category: 'Activities', tags: ['favorite', 'special', 'highlight'] },
  Heart: { icon: Heart, category: 'Activities', tags: ['love', 'care', 'favorite', 'health'] },
  Zap: { icon: Zap, category: 'Activities', tags: ['energy', 'fast', 'quick', 'electric'] },
  Flame: { icon: Flame, category: 'Activities', tags: ['hot', 'fire', 'energy', 'intense'] },
  Snowflake: { icon: Snowflake, category: 'Activities', tags: ['cold', 'winter', 'cool'] },
  Sun: { icon: Sun, category: 'Activities', tags: ['day', 'outdoor', 'bright', 'morning'] },
  CloudRain: { icon: CloudRain, category: 'Activities', tags: ['weather', 'rain', 'wet'] },

  // Movement
  Footprints: { icon: Footprints, category: 'Movement', tags: ['walk', 'steps', 'track', 'hiking'] },
  Bike: { icon: Bike, category: 'Movement', tags: ['cycle', 'exercise', 'outdoor'] },
  Car: { icon: Car, category: 'Movement', tags: ['drive', 'transport', 'travel'] },
  Plane: { icon: Plane, category: 'Movement', tags: ['fly', 'travel', 'trip'] },
  MapPin: { icon: MapPin, category: 'Movement', tags: ['location', 'place', 'destination'] },
  Navigation: { icon: Navigation, category: 'Movement', tags: ['direction', 'route', 'guide'] },
  Compass: { icon: Compass, category: 'Movement', tags: ['direction', 'explore', 'navigate'] },

  // Objects
  Bone: { icon: Bone, category: 'Objects', tags: ['treat', 'reward', 'toy', 'dog'] },
  Cookie: { icon: Cookie, category: 'Objects', tags: ['treat', 'snack', 'reward'] },
  Apple: { icon: Apple, category: 'Objects', tags: ['food', 'healthy', 'snack', 'fruit'] },
  Coffee: { icon: Coffee, category: 'Objects', tags: ['drink', 'beverage', 'break'] },
  Pill: { icon: Pill, category: 'Objects', tags: ['medicine', 'medical', 'health', 'medication'] },
  Syringe: { icon: Syringe, category: 'Objects', tags: ['injection', 'medical', 'vaccine', 'shot'] },
  Scissors: { icon: Scissors, category: 'Objects', tags: ['cut', 'grooming', 'trim'] },
  Shirt: { icon: Shirt, category: 'Objects', tags: ['clothing', 'dress', 'costume'] },
  Gift: { icon: Gift, category: 'Objects', tags: ['present', 'reward', 'surprise'] },
  Package: { icon: Package, category: 'Objects', tags: ['box', 'delivery', 'item'] },
  Key: { icon: Key, category: 'Objects', tags: ['access', 'unlock', 'security'] },
  Lock: { icon: Lock, category: 'Objects', tags: ['secure', 'safety', 'locked'] },
  Bell: { icon: Bell, category: 'Objects', tags: ['alert', 'notification', 'ring'] },
  Megaphone: { icon: Megaphone, category: 'Objects', tags: ['announce', 'loud', 'speak'] },
  Music: { icon: Music, category: 'Objects', tags: ['sound', 'audio', 'song'] },
  Camera: { icon: Camera, category: 'Objects', tags: ['photo', 'picture', 'capture'] },
  Video: { icon: Video, category: 'Objects', tags: ['record', 'movie', 'film'] },
  Book: { icon: Book, category: 'Objects', tags: ['read', 'learn', 'study'] },
  Clipboard: { icon: Clipboard, category: 'Objects', tags: ['notes', 'list', 'checklist'] },
  FileText: { icon: FileText, category: 'Objects', tags: ['document', 'notes', 'report'] },
  Calendar: { icon: Calendar, category: 'Objects', tags: ['date', 'schedule', 'event'] },

  // Social
  Users: { icon: Users, category: 'Social', tags: ['group', 'team', 'people', 'social'] },
  UserPlus: { icon: UserPlus, category: 'Social', tags: ['add', 'new', 'invite', 'person'] },
  MessageCircle: { icon: MessageCircle, category: 'Social', tags: ['chat', 'talk', 'communication'] },
  Phone: { icon: Phone, category: 'Social', tags: ['call', 'contact', 'communication'] },

  // Nature
  TreePine: { icon: TreePine, category: 'Nature', tags: ['outdoor', 'forest', 'nature', 'hike'] },
  Flower: { icon: Flower, category: 'Nature', tags: ['garden', 'nature', 'plant'] },
  Leaf: { icon: Leaf, category: 'Nature', tags: ['nature', 'plant', 'green', 'eco'] },
  Mountain: { icon: Mountain, category: 'Nature', tags: ['outdoor', 'hiking', 'adventure'] },
  Waves: { icon: Waves, category: 'Nature', tags: ['water', 'ocean', 'swim', 'beach'] },

  // Status
  CheckCircle: { icon: CheckCircle, category: 'Status', tags: ['done', 'complete', 'success', 'yes'] },
  XCircle: { icon: XCircle, category: 'Status', tags: ['cancel', 'no', 'stop', 'error'] },
  AlertCircle: { icon: AlertCircle, category: 'Status', tags: ['warning', 'caution', 'alert'] },
  Info: { icon: Info, category: 'Status', tags: ['information', 'help', 'details'] },
  HelpCircle: { icon: HelpCircle, category: 'Status', tags: ['question', 'help', 'support'] },
  Clock: { icon: Clock, category: 'Status', tags: ['time', 'schedule', 'wait'] },
  Hourglass: { icon: Hourglass, category: 'Status', tags: ['wait', 'time', 'pending'] },
  RefreshCw: { icon: RefreshCw, category: 'Status', tags: ['refresh', 'repeat', 'sync'] },
  TrendingUp: { icon: TrendingUp, category: 'Status', tags: ['progress', 'improve', 'growth'] },
  TrendingDown: { icon: TrendingDown, category: 'Status', tags: ['decline', 'decrease', 'down'] },
  ThumbsUp: { icon: ThumbsUp, category: 'Status', tags: ['good', 'approve', 'like', 'yes'] },
  ThumbsDown: { icon: ThumbsDown, category: 'Status', tags: ['bad', 'disapprove', 'dislike', 'no'] },
};

// Preset colors
const PRESET_COLORS = [
  { name: 'Gray', value: '#9ca3af' },
  { name: 'Red', value: '#f87171' },
  { name: 'Orange', value: '#fb923c' },
  { name: 'Amber', value: '#fbbf24' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Lime', value: '#a3e635' },
  { name: 'Green', value: '#4ade80' },
  { name: 'Emerald', value: '#34d399' },
  { name: 'Teal', value: '#2dd4bf' },
  { name: 'Cyan', value: '#22d3ee' },
  { name: 'Sky', value: '#38bdf8' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Indigo', value: '#818cf8' },
  { name: 'Violet', value: '#a78bfa' },
  { name: 'Purple', value: '#c084fc' },
  { name: 'Fuchsia', value: '#e879f9' },
  { name: 'Pink', value: '#f472b6' },
  { name: 'Rose', value: '#fb7185' },
];

interface IconBuilderProps {
  initialIcon?: string;
  initialColor?: string;
  onSave: (iconName: string, color: string) => void;
  onCancel: () => void;
  showTimerConfig?: boolean;
  initialMaxMinutes?: number;
  initialWarningMinutes?: number;
  onSaveWithTimer?: (iconName: string, color: string, maxMinutes: number, warningMinutes: number) => void;
}

export function IconBuilder({
  initialIcon = 'Star',
  initialColor = '#6366f1',
  onSave,
  onCancel,
  showTimerConfig = false,
  initialMaxMinutes = 60,
  initialWarningMinutes = 45,
  onSaveWithTimer,
}: IconBuilderProps) {
  const [selectedIcon, setSelectedIcon] = useState(initialIcon);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxMinutes, setMaxMinutes] = useState(initialMaxMinutes);
  const [warningMinutes, setWarningMinutes] = useState(initialWarningMinutes);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    Object.values(ICON_REGISTRY).forEach((item) => cats.add(item.category));
    return Array.from(cats).sort();
  }, []);

  // Filter icons based on search and category
  const filteredIcons = useMemo(() => {
    return Object.entries(ICON_REGISTRY).filter(([name, data]) => {
      const matchesCategory = !selectedCategory || data.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const SelectedIconComponent = ICON_REGISTRY[selectedIcon]?.icon || Star;

  const handleSave = () => {
    if (showTimerConfig && onSaveWithTimer) {
      onSaveWithTimer(selectedIcon, selectedColor, maxMinutes, warningMinutes);
    } else {
      onSave(selectedIcon, selectedColor);
    }
  };

  const handleReset = () => {
    setSelectedIcon(initialIcon);
    setSelectedColor(initialColor);
    setMaxMinutes(initialMaxMinutes);
    setWarningMinutes(initialWarningMinutes);
  };

  // Generate glow color from selected color
  const glowColor = selectedColor + '66'; // 40% opacity

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Icon Selection */}
      <div className="space-y-4">
        {/* Search and Filter */}
        <Card>
          <CardHeader title="Choose Icon" />
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={16} />}
              />

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    !selectedCategory
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-800 text-surface-400 hover:text-white'
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                      selectedCategory === cat
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-800 text-surface-400 hover:text-white'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Icon Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-1">
                {filteredIcons.map(([name, data]) => {
                  const IconComponent = data.icon;
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedIcon(name)}
                      className={cn(
                        'aspect-square rounded-lg flex items-center justify-center transition-all',
                        selectedIcon === name
                          ? 'bg-brand-500 text-white ring-2 ring-brand-500 ring-offset-2 ring-offset-surface-900'
                          : 'bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700'
                      )}
                      title={name}
                    >
                      <IconComponent size={20} />
                    </button>
                  );
                })}
              </div>

              {filteredIcons.length === 0 && (
                <p className="text-center text-surface-500 py-4">No icons found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Color Selection */}
        <Card>
          <CardHeader title="Choose Color" />
          <CardContent>
            <div className="space-y-4">
              {/* Preset Colors */}
              <div className="grid grid-cols-9 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      'aspect-square rounded-lg transition-all relative',
                      selectedColor === color.value && 'ring-2 ring-white ring-offset-2 ring-offset-surface-900'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {selectedColor === color.value && (
                      <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Color Picker */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <Input
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-28"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timer Configuration */}
        {showTimerConfig && (
          <Card>
            <CardHeader title="Timer Limits" />
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Max Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={maxMinutes}
                    onChange={(e) => setMaxMinutes(parseInt(e.target.value) || 60)}
                    min={1}
                    max={480}
                  />
                  <p className="text-xs text-surface-500 mt-1">
                    Timer turns red after this
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Warning Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={warningMinutes}
                    onChange={(e) => setWarningMinutes(parseInt(e.target.value) || 45)}
                    min={1}
                    max={maxMinutes - 1}
                  />
                  <p className="text-xs text-surface-500 mt-1">
                    Timer turns yellow after this
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        <Card className="sticky top-6">
          <CardHeader title="Preview" />
          <CardContent>
            {/* Large Preview */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-32 h-32 rounded-2xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: selectedColor + '20',
                  boxShadow: `0 0 30px ${glowColor}`,
                }}
              >
                <SelectedIconComponent size={64} style={{ color: selectedColor }} />
              </div>
              <p className="mt-4 text-lg font-medium text-white">{selectedIcon}</p>
              <p className="text-sm text-surface-400">{ICON_REGISTRY[selectedIcon]?.category}</p>
            </div>

            {/* Context Previews */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-surface-300">In Context</p>

              {/* Quick Log Button Preview */}
              <div className="flex items-center gap-3 p-3 bg-surface-800 rounded-xl">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedColor + '30' }}
                >
                  <SelectedIconComponent size={20} style={{ color: selectedColor }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Custom Activity</p>
                  <p className="text-xs text-surface-400">Quick Log Button</p>
                </div>
              </div>

              {/* Activity Card Preview */}
              <div className="p-3 bg-surface-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <SelectedIconComponent size={14} style={{ color: selectedColor }} />
                    <span className="text-xs font-medium" style={{ color: selectedColor }}>
                      Custom Activity
                    </span>
                  </div>
                  <span className="text-xs text-surface-400">0:00</span>
                </div>
                <p className="text-sm text-white">Buddy (Demo)</p>
                <p className="text-xs text-surface-500">Activity Card</p>
              </div>

              {/* Timeline Preview */}
              <div className="flex items-center gap-3 p-3 bg-surface-800 rounded-xl">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
                <div className="flex-1">
                  <p className="text-xs text-surface-400">10:30 AM</p>
                  <p className="text-sm text-white">Custom Activity - Timeline</p>
                </div>
                <SelectedIconComponent size={16} style={{ color: selectedColor }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleReset} leftIcon={<RotateCcw size={16} />}>
            Reset
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} className="flex-1" leftIcon={<Save size={16} />}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

// Export the icon registry for use in other components
export { ICON_REGISTRY, PRESET_COLORS };
export type { LucideIcon };
