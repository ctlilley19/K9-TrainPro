'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { TagDeactivated } from './TagDeactivated';
import { TagNotAssigned } from './TagNotAssigned';
import { LostPetProfile } from './LostPetProfile';
import { QuickLogScreen } from './QuickLogScreen';
import { Loader2 } from 'lucide-react';

interface TagData {
  id: string;
  tag_code: string;
  status: string;
  facility_id: string;
  dog_id: string | null;
  dog: {
    id: string;
    name: string;
    breed: string;
    color: string;
    photo_url: string | null;
    weight: number | null;
    age_years: number | null;
    age_months: number | null;
    microchip_id: string | null;
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
      id: string;
      name: string;
      primary_contact_id: string;
      primary_contact: {
        id: string;
        name: string;
        phone: string;
        email: string;
      };
    } | null;
  } | null;
  facility: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
}

interface TagRouterProps {
  tag: TagData;
}

export function TagRouter({ tag }: TagRouterProps) {
  const { user, facility, isAuthenticated, isInitialized, initialize } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) {
      initialize().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  // Tag is deactivated
  if (tag.status === 'deactivated') {
    return <TagDeactivated tag={tag} />;
  }

  // Tag not assigned to a dog
  if (!tag.dog) {
    return <TagNotAssigned tag={tag} isAuthenticated={isAuthenticated} />;
  }

  // Not logged in - show lost pet profile (public view)
  if (!isAuthenticated || !user) {
    return <LostPetProfile tag={tag} />;
  }

  // Logged in - determine relationship
  const isOwner = tag.dog.family?.primary_contact_id === user.id;
  const isTrainer = user.role === 'trainer' || user.role === 'admin' || user.role === 'owner';
  const isSameFacility = facility?.id === tag.facility_id;

  // Owner viewing their own dog
  if (isOwner) {
    // Redirect to full dog profile
    if (typeof window !== 'undefined') {
      window.location.href = `/parent/dogs/${tag.dog.id}`;
    }
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  // Trainer/staff at same facility - show quick log
  if (isTrainer && isSameFacility) {
    return <QuickLogScreen tag={tag} user={user} />;
  }

  // Logged in but no relationship - show lost pet profile
  return <LostPetProfile tag={tag} />;
}
