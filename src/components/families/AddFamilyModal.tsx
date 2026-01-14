'use client';

import { useState, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { useCreateFamily, useCreateDog } from '@/hooks';
import { isDemoMode } from '@/lib/supabase';
import {
  Users,
  User,
  ArrowLeft,
  ArrowRight,
  Check,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Stethoscope,
  Dog,
  Plus,
  Trash2,
  Loader2,
  Home,
} from 'lucide-react';

interface AddFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FamilyFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  vet_name: string;
  vet_phone: string;
  vet_address: string;
  notes: string;
}

interface DogFormData {
  name: string;
  breed: string;
  date_of_birth: string;
  weight: string;
  gender: 'male' | 'female' | '';
  color: string;
}

const initialFamilyData: FamilyFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  vet_name: '',
  vet_phone: '',
  vet_address: '',
  notes: '',
};

const initialDogData: DogFormData = {
  name: '',
  breed: '',
  date_of_birth: '',
  weight: '',
  gender: '',
  color: '',
};

const STEPS = [
  { id: 1, title: 'Family Info', description: 'Basic contact information' },
  { id: 2, title: 'Address', description: 'Location and emergency contact' },
  { id: 3, title: 'Vet Info', description: 'Veterinarian details' },
  { id: 4, title: 'Add Dogs', description: 'Optional: Add family dogs' },
  { id: 5, title: 'Review', description: 'Confirm and save' },
];

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington DC' },
];

export function AddFamilyModal({ isOpen, onClose, onSuccess }: AddFamilyModalProps) {
  const [step, setStep] = useState(1);
  const [familyData, setFamilyData] = useState<FamilyFormData>(initialFamilyData);
  const [dogs, setDogs] = useState<DogFormData[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FamilyFormData, string>>>({});

  const createFamily = useCreateFamily();
  const createDog = useCreateDog();

  const totalSteps = STEPS.length;

  // Update family field
  const updateFamilyField = (field: keyof FamilyFormData, value: string) => {
    setFamilyData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Update dog field
  const updateDogField = (index: number, field: keyof DogFormData, value: string) => {
    setDogs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Add a new dog
  const addDog = () => {
    setDogs((prev) => [...prev, { ...initialDogData }]);
  };

  // Remove a dog
  const removeDog = (index: number) => {
    setDogs((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof FamilyFormData, string>> = {};

    switch (step) {
      case 1:
        if (!familyData.name.trim()) {
          newErrors.name = 'Family name is required';
        }
        break;
      // Other steps have no required fields
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if can proceed
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!familyData.name.trim();
      default:
        return true;
    }
  };

  // Navigate
  const nextStep = () => {
    if (!validateStep()) return;
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Handle close - reset state
  const handleClose = () => {
    setStep(1);
    setFamilyData(initialFamilyData);
    setDogs([]);
    setErrors({});
    onClose();
  };

  // Submit
  const handleSubmit = async () => {
    try {
      // Create the family first
      const newFamily = await createFamily.mutateAsync({
        name: familyData.name,
        phone: familyData.phone || undefined,
        email: familyData.email || undefined,
        address: familyData.address || undefined,
        city: familyData.city || undefined,
        state: familyData.state || undefined,
        zip: familyData.zip || undefined,
        emergency_contact_name: familyData.emergency_contact_name || undefined,
        emergency_contact_phone: familyData.emergency_contact_phone || undefined,
        vet_name: familyData.vet_name || undefined,
        vet_phone: familyData.vet_phone || undefined,
        notes: familyData.notes || undefined,
      });

      // Create dogs if any
      for (const dog of dogs) {
        if (dog.name.trim()) {
          await createDog.mutateAsync({
            family_id: newFamily.id,
            name: dog.name,
            breed: dog.breed || undefined,
            date_of_birth: dog.date_of_birth || undefined,
            weight: dog.weight ? parseFloat(dog.weight) : undefined,
            gender: dog.gender || undefined,
            color: dog.color || undefined,
          });
        }
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create family:', error);
    }
  };

  const isSubmitting = createFamily.isPending || createDog.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      raw
      closeOnOverlayClick={false}
    >
      {/* Custom Header with Progress */}
      <ModalHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Add New Family</h2>
            <p className="text-sm text-surface-400">
              Step {step} of {totalSteps}: {STEPS[step - 1].description}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-surface-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={cn(
                  'text-xs transition-colors',
                  step >= s.id ? 'text-brand-400 font-medium' : 'text-surface-500'
                )}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </ModalHeader>

      {/* Body - Step Content */}
      <ModalBody className="min-h-[380px]">
        {/* Step 1: Family Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-3">
                <Users size={32} className="text-brand-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Family Information</h3>
              <p className="text-sm text-surface-400">
                Enter the family's basic contact details
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Family Name *"
                value={familyData.name}
                onChange={(e) => updateFamilyField('name', e.target.value)}
                placeholder="e.g., Johnson Family"
                leftIcon={<Users size={16} />}
                error={errors.name}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={familyData.phone}
                  onChange={(e) => updateFamilyField('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  leftIcon={<Phone size={16} />}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={familyData.email}
                  onChange={(e) => updateFamilyField('email', e.target.value)}
                  placeholder="family@email.com"
                  leftIcon={<Mail size={16} />}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address & Emergency */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <MapPin size={32} className="text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Address & Emergency Contact</h3>
              <p className="text-sm text-surface-400">
                Location and emergency contact information
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Street Address"
                value={familyData.address}
                onChange={(e) => updateFamilyField('address', e.target.value)}
                placeholder="123 Main Street"
                leftIcon={<Home size={16} />}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Input
                    label="City"
                    value={familyData.city}
                    onChange={(e) => updateFamilyField('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <Select
                  label="State"
                  value={familyData.state}
                  onChange={(e) => updateFamilyField('state', e.target.value)}
                  options={US_STATES}
                  placeholder="State"
                />
                <Input
                  label="ZIP"
                  value={familyData.zip}
                  onChange={(e) => updateFamilyField('zip', e.target.value)}
                  placeholder="12345"
                />
              </div>

              <div className="pt-4 border-t border-surface-700">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-orange-400" />
                  <span className="text-sm font-medium text-white">Emergency Contact</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Name"
                    value={familyData.emergency_contact_name}
                    onChange={(e) => updateFamilyField('emergency_contact_name', e.target.value)}
                    placeholder="Emergency contact name"
                    leftIcon={<User size={16} />}
                  />
                  <Input
                    label="Contact Phone"
                    value={familyData.emergency_contact_phone}
                    onChange={(e) => updateFamilyField('emergency_contact_phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    leftIcon={<Phone size={16} />}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Vet Info */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <Stethoscope size={32} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Veterinarian Information</h3>
              <p className="text-sm text-surface-400">
                Add the family's veterinarian details
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Veterinarian Name"
                value={familyData.vet_name}
                onChange={(e) => updateFamilyField('vet_name', e.target.value)}
                placeholder="Dr. Smith"
                leftIcon={<Stethoscope size={16} />}
              />

              <Input
                label="Vet Phone Number"
                value={familyData.vet_phone}
                onChange={(e) => updateFamilyField('vet_phone', e.target.value)}
                placeholder="(555) 123-4567"
                leftIcon={<Phone size={16} />}
              />

              <Input
                label="Vet Address"
                value={familyData.vet_address}
                onChange={(e) => updateFamilyField('vet_address', e.target.value)}
                placeholder="123 Vet Clinic Blvd"
                leftIcon={<MapPin size={16} />}
              />

              <Textarea
                label="Notes"
                value={familyData.notes}
                onChange={(e) => updateFamilyField('notes', e.target.value)}
                placeholder="Any additional notes about this family..."
              />
            </div>
          </div>
        )}

        {/* Step 4: Add Dogs */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Dog size={32} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Add Dogs (Optional)</h3>
              <p className="text-sm text-surface-400">
                Add dogs to this family now, or skip to add them later
              </p>
            </div>

            {dogs.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-surface-700 rounded-xl">
                <Dog size={40} className="mx-auto text-surface-500 mb-3" />
                <p className="text-surface-400 mb-4">No dogs added yet</p>
                <Button variant="outline" leftIcon={<Plus size={16} />} onClick={addDog}>
                  Add a Dog
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dogs.map((dog, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-surface-700 bg-surface-800/50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Dog size={16} className="text-blue-400" />
                        </div>
                        <span className="font-medium text-white">
                          {dog.name || `Dog ${index + 1}`}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeDog(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Name *"
                        value={dog.name}
                        onChange={(e) => updateDogField(index, 'name', e.target.value)}
                        placeholder="Dog's name"
                      />
                      <Input
                        label="Breed"
                        value={dog.breed}
                        onChange={(e) => updateDogField(index, 'breed', e.target.value)}
                        placeholder="e.g., German Shepherd"
                      />
                      <Select
                        label="Gender"
                        value={dog.gender}
                        onChange={(e) => updateDogField(index, 'gender', e.target.value as 'male' | 'female' | '')}
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                        ]}
                        placeholder="Select"
                      />
                      <Input
                        label="Color"
                        value={dog.color}
                        onChange={(e) => updateDogField(index, 'color', e.target.value)}
                        placeholder="e.g., Black and Tan"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  leftIcon={<Plus size={16} />}
                  onClick={addDog}
                  className="w-full"
                >
                  Add Another Dog
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Check size={32} className="text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Review & Confirm</h3>
              <p className="text-sm text-surface-400">
                Make sure everything looks good
              </p>
            </div>

            {/* Summary Card */}
            <div className="rounded-xl border border-surface-700 bg-surface-800/50 overflow-hidden">
              {/* Family Preview */}
              <div className="p-4 flex items-center gap-4 border-b border-surface-700">
                <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <Users size={24} className="text-brand-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {familyData.name || 'Unnamed Family'}
                  </h4>
                  <p className="text-sm text-surface-400">
                    {familyData.email || familyData.phone || 'No contact info'}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                {familyData.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">Phone</span>
                    <span className="text-sm text-white">{familyData.phone}</span>
                  </div>
                )}

                {familyData.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">Email</span>
                    <span className="text-sm text-white">{familyData.email}</span>
                  </div>
                )}

                {(familyData.address || familyData.city) && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">Address</span>
                    <span className="text-sm text-white text-right">
                      {[familyData.address, familyData.city, familyData.state, familyData.zip]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}

                {familyData.emergency_contact_name && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">Emergency Contact</span>
                    <span className="text-sm text-white">
                      {familyData.emergency_contact_name}
                      {familyData.emergency_contact_phone && ` - ${familyData.emergency_contact_phone}`}
                    </span>
                  </div>
                )}

                {familyData.vet_name && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">Veterinarian</span>
                    <span className="text-sm text-white">{familyData.vet_name}</span>
                  </div>
                )}

                {/* Dogs */}
                {dogs.length > 0 && (
                  <div className="pt-3 border-t border-surface-700">
                    <span className="text-xs text-surface-500 uppercase tracking-wider">
                      Dogs ({dogs.length})
                    </span>
                    <div className="mt-2 space-y-2">
                      {dogs.map((dog, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg bg-surface-700/50"
                        >
                          <Avatar name={dog.name || 'Dog'} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-white">{dog.name || 'Unnamed'}</p>
                            <p className="text-xs text-surface-400">
                              {[dog.breed, dog.gender].filter(Boolean).join(' - ') || 'No details'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      {/* Footer - Navigation */}
      <ModalFooter className="justify-between">
        <Button
          variant="ghost"
          onClick={step === 1 ? handleClose : prevStep}
          disabled={isSubmitting}
        >
          <ArrowLeft size={16} className="mr-2" />
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        <Button
          variant="primary"
          onClick={nextStep}
          disabled={!canProceed() || isSubmitting}
          isLoading={isSubmitting}
        >
          {step === totalSteps ? (
            <>
              <Check size={16} className="mr-2" />
              Create Family
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default AddFamilyModal;
