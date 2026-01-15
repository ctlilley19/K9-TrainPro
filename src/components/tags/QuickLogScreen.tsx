'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import type { User } from '@/types/database';
import {
  Footprints,
  Utensils,
  GraduationCap,
  Pill,
  Scissors,
  Moon,
  Droplets,
  MessageSquare,
  Check,
  X,
  Loader2,
} from 'lucide-react';

interface QuickLogScreenProps {
  tag: {
    id: string;
    dog: {
      id: string;
      name: string;
      breed: string;
      photo_url: string | null;
      family: {
        name: string;
        primary_contact: {
          name: string;
        };
      } | null;
    } | null;
    facility: {
      name: string;
    } | null;
  };
  user: User;
}

const ACTIVITIES = [
  { key: 'walk', label: 'Walk', icon: Footprints, color: 'bg-green-500/20 text-green-400' },
  { key: 'feed', label: 'Feed', icon: Utensils, color: 'bg-amber-500/20 text-amber-400' },
  { key: 'train', label: 'Train', icon: GraduationCap, color: 'bg-blue-500/20 text-blue-400' },
  { key: 'meds', label: 'Meds', icon: Pill, color: 'bg-red-500/20 text-red-400' },
  { key: 'groom', label: 'Groom', icon: Scissors, color: 'bg-purple-500/20 text-purple-400' },
  { key: 'rest', label: 'Rest', icon: Moon, color: 'bg-surface-500/20 text-surface-400' },
  { key: 'potty', label: 'Potty', icon: Droplets, color: 'bg-cyan-500/20 text-cyan-400' },
];

export function QuickLogScreen({ tag, user }: QuickLogScreenProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [loggedActivity, setLoggedActivity] = useState<string | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);

  const dog = tag.dog;
  if (!dog) return null;

  const handleActivityTap = async (activityKey: string) => {
    setSelectedActivity(activityKey);
    setIsLogging(true);

    try {
      // Log the activity
      await supabase.from('activities').insert({
        dog_id: dog.id,
        facility_id: tag.facility?.name ? undefined : undefined, // Get from tag if available
        type: activityKey,
        performed_by: user.id,
        notes: note || null,
        logged_via: 'nfc_tag',
      });

      // Log the tag scan
      await supabase.from('tag_scans').insert({
        tag_id: tag.id,
        scanned_by: user.id,
        is_authenticated: true,
        user_role: user.role,
        action_taken: 'quick_log',
        activity_logged: activityKey,
      });

      setLoggedActivity(activityKey);

      // Reset after 2 seconds
      setTimeout(() => {
        setLoggedActivity(null);
        setSelectedActivity(null);
        setNote('');
        setShowNoteInput(false);
      }, 2000);
    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const handleAddNote = () => {
    setShowNoteInput(true);
  };

  const handleCancelNote = () => {
    setShowNoteInput(false);
    setNote('');
  };

  return (
    <div className="min-h-screen bg-surface-950 p-4">
      <div className="max-w-md mx-auto">
        {/* Dog Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 flex-shrink-0">
            {dog.photo_url ? (
              <Image
                src={dog.photo_url}
                alt={dog.name}
                fill
                className="rounded-full object-cover border-2 border-brand-500/30"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-surface-800 flex items-center justify-center border-2 border-brand-500/30">
                <span className="text-2xl">🐕</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{dog.name}</h1>
            <p className="text-surface-400 text-sm">{dog.breed}</p>
            {dog.family && (
              <p className="text-surface-500 text-xs">
                Owner: {dog.family.primary_contact.name}
              </p>
            )}
          </div>
        </div>

        {/* Success Message */}
        {loggedActivity && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6 text-center animate-pulse">
            <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-medium">
              {ACTIVITIES.find(a => a.key === loggedActivity)?.label} Logged!
            </p>
          </div>
        )}

        {/* Activity Grid */}
        {!loggedActivity && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ACTIVITIES.map((activity) => {
                const Icon = activity.icon;
                const isSelected = selectedActivity === activity.key;

                return (
                  <button
                    key={activity.key}
                    onClick={() => handleActivityTap(activity.key)}
                    disabled={isLogging}
                    className={`
                      p-6 rounded-xl border transition-all
                      ${isSelected
                        ? 'border-brand-500 bg-brand-500/10 scale-95'
                        : 'border-surface-700 bg-surface-800/50 hover:border-surface-600 hover:bg-surface-800'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <div className={`w-12 h-12 rounded-xl ${activity.color} flex items-center justify-center mx-auto mb-2`}>
                      {isLogging && isSelected ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Icon size={24} />
                      )}
                    </div>
                    <span className="text-white font-medium">{activity.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Add Note Section */}
            {showNoteInput ? (
              <div className="bg-surface-800/50 rounded-xl p-4 mb-6">
                <Textarea
                  placeholder="Add a note about this activity..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelNote}
                    leftIcon={<X size={14} />}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowNoteInput(false)}
                    leftIcon={<Check size={14} />}
                  >
                    Save Note
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddNote}
                leftIcon={<MessageSquare size={16} />}
              >
                Add Note
              </Button>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-surface-800 text-center">
          <p className="text-xs text-surface-600">
            Logged by {user.name} • {tag.facility?.name || 'K9 ProTrain'}
          </p>
        </div>
      </div>
    </div>
  );
}
