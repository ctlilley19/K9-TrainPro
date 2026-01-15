'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, AlertTriangle, Heart, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LostPetProfileProps {
  tag: {
    dog: {
      name: string;
      breed: string;
      color: string;
      photo_url: string | null;
      weight: number | null;
      notes: string | null;
      lost_mode_enabled: boolean;
      lost_pet_settings: {
        show_name: boolean;
        show_photo: boolean;
        show_description: boolean;
        show_lost_message: boolean;
        show_owner_phone: boolean;
        show_owner_email: boolean;
        show_general_location: boolean;
        show_vet_info: boolean;
        show_medical_info: boolean;
        custom_message: string;
      };
      family: {
        name: string;
        primary_contact: {
          name: string;
          phone: string;
          email: string;
        };
      } | null;
    } | null;
  };
}

export function LostPetProfile({ tag }: LostPetProfileProps) {
  const dog = tag.dog;
  if (!dog) return null;

  const settings = dog.lost_pet_settings;
  const owner = dog.family?.primary_contact;
  const isLostMode = dog.lost_mode_enabled;

  const handleCall = () => {
    if (owner?.phone) {
      window.location.href = `tel:${owner.phone}`;
    }
  };

  const handleEmail = () => {
    if (owner?.email) {
      window.location.href = `mailto:${owner.email}?subject=Found your pet ${dog.name}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-950 to-surface-900">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Pet Photo */}
        {settings.show_photo && (
          <div className="relative w-40 h-40 mx-auto mb-6">
            {dog.photo_url ? (
              <Image
                src={dog.photo_url}
                alt={settings.show_name ? dog.name : 'Pet'}
                fill
                className="rounded-full object-cover border-4 border-brand-500/30 shadow-lg shadow-brand-500/20"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-surface-800 flex items-center justify-center border-4 border-brand-500/30">
                <span className="text-5xl">🐕</span>
              </div>
            )}
          </div>
        )}

        {/* Pet Name */}
        {settings.show_name && (
          <h1 className="text-3xl font-bold text-white text-center mb-1">
            {dog.name}
          </h1>
        )}

        {/* Description */}
        {settings.show_description && (
          <p className="text-surface-400 text-center mb-6">
            {dog.breed}
            {dog.color && ` • ${dog.color}`}
            {dog.weight && ` • ${dog.weight} lbs`}
          </p>
        )}

        {/* Lost Mode Message */}
        {isLostMode && settings.show_lost_message && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 mb-3">
              <AlertTriangle size={20} />
              <span className="font-medium">Lost Pet</span>
            </div>
            <p className="text-white text-lg">
              {settings.custom_message || "I'm lost! Please help me get home to my family!"}
            </p>
          </div>
        )}

        {/* Contact Buttons */}
        <div className="space-y-3 mb-8">
          {settings.show_owner_phone && owner?.phone && (
            <Button
              variant="primary"
              className="w-full py-4 text-lg"
              leftIcon={<Phone size={20} />}
              onClick={handleCall}
            >
              Call My Owner
            </Button>
          )}

          {settings.show_owner_email && owner?.email && (
            <Button
              variant="outline"
              className="w-full py-4"
              leftIcon={<Mail size={20} />}
              onClick={handleEmail}
            >
              Email My Owner
            </Button>
          )}
        </div>

        {/* Medical Info */}
        {settings.show_medical_info && dog.notes && (
          <div className="bg-surface-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">Important Info</span>
            </div>
            <p className="text-surface-300 text-sm">{dog.notes}</p>
          </div>
        )}

        {/* Non-lost mode - just show basic profile */}
        {!isLostMode && (
          <div className="bg-surface-800/50 rounded-xl p-6 text-center">
            <Heart className="w-8 h-8 text-brand-400 mx-auto mb-3" />
            <p className="text-surface-300">
              {settings.show_name ? dog.name : 'This pet'} is loved and cared for.
            </p>
            {owner && (
              <p className="text-surface-500 text-sm mt-2">
                Owner: {owner.name}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-surface-800 text-center">
          <p className="text-xs text-surface-600 mb-4">
            Powered by K9 ProTrain
          </p>
          <Link href="/login" className="text-sm text-brand-400 hover:text-brand-300 inline-flex items-center gap-1">
            <LogIn size={14} />
            Are you a trainer? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
