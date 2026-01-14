'use client';

import { useState, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { useFamilies, useCreateDog, useCreateFamily } from '@/hooks';
import { isDemoMode } from '@/lib/supabase';
import {
  Dog,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Calendar,
  Scale,
  Loader2,
  Upload,
  Heart,
  Pill,
  UtensilsCrossed,
  AlertCircle,
  Plus,
  Phone,
  Mail,
} from 'lucide-react';

interface AddDogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DogFormData {
  family_id: string;
  name: string;
  breed: string;
  date_of_birth: string;
  weight: string;
  gender: 'male' | 'female' | '';
  color: string;
  microchip_id: string;
  medical_notes: string;
  behavior_notes: string;
  feeding_instructions: string;
  medications: string;
}

interface NewFamilyData {
  name: string;
  phone: string;
  email: string;
}

const initialFormData: DogFormData = {
  family_id: '',
  name: '',
  breed: '',
  date_of_birth: '',
  weight: '',
  gender: '',
  color: '',
  microchip_id: '',
  medical_notes: '',
  behavior_notes: '',
  feeding_instructions: '',
  medications: '',
};

const initialNewFamilyData: NewFamilyData = {
  name: '',
  phone: '',
  email: '',
};

const STEPS = [
  { id: 1, title: 'Family', description: 'Select the owner family' },
  { id: 2, title: 'Basic Info', description: 'Name, breed, and details' },
  { id: 3, title: 'Care Info', description: 'Feeding and medications' },
  { id: 4, title: 'Review', description: 'Confirm and save' },
];

export function AddDogModal({ isOpen, onClose, onSuccess }: AddDogModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DogFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof DogFormData, string>>>({});
  const [isCreatingNewFamily, setIsCreatingNewFamily] = useState(false);
  const [newFamilyData, setNewFamilyData] = useState<NewFamilyData>(initialNewFamilyData);
  const [newFamilyErrors, setNewFamilyErrors] = useState<Partial<Record<keyof NewFamilyData, string>>>({});

  const { data: families, isLoading: familiesLoading } = useFamilies();
  const createDog = useCreateDog();
  const createFamily = useCreateFamily();

  const totalSteps = STEPS.length;

  // Transform families for select
  const familyOptions = useMemo(() => {
    if (!families) return [];
    return families.map((f) => ({ value: f.id, label: f.name }));
  }, [families]);

  // Get selected family name for review
  const selectedFamilyName = useMemo(() => {
    if (isCreatingNewFamily) {
      return newFamilyData.name || 'New Family';
    }
    return families?.find((f) => f.id === formData.family_id)?.name || '';
  }, [families, formData.family_id, isCreatingNewFamily, newFamilyData.name]);

  // Update form field
  const updateField = (field: keyof DogFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Update new family field
  const updateNewFamilyField = (field: keyof NewFamilyData, value: string) => {
    setNewFamilyData((prev) => ({ ...prev, [field]: value }));
    if (newFamilyErrors[field]) {
      setNewFamilyErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof DogFormData, string>> = {};
    const familyErrors: Partial<Record<keyof NewFamilyData, string>> = {};

    switch (step) {
      case 1:
        if (isCreatingNewFamily) {
          if (!newFamilyData.name.trim()) {
            familyErrors.name = 'Family name is required';
          }
        } else if (!formData.family_id) {
          newErrors.family_id = 'Please select a family';
        }
        break;
      case 2:
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
        }
        break;
      // Steps 3 and 4 have no required fields
    }

    setErrors(newErrors);
    setNewFamilyErrors(familyErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(familyErrors).length === 0;
  };

  // Check if can proceed
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return isCreatingNewFamily ? !!newFamilyData.name.trim() : !!formData.family_id;
      case 2:
        return !!formData.name.trim();
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
    setFormData(initialFormData);
    setErrors({});
    setIsCreatingNewFamily(false);
    setNewFamilyData(initialNewFamilyData);
    setNewFamilyErrors({});
    onClose();
  };

  // Submit
  const handleSubmit = async () => {
    try {
      let familyId = formData.family_id;

      // Create family first if needed
      if (isCreatingNewFamily) {
        const newFamily = await createFamily.mutateAsync({
          name: newFamilyData.name,
          phone: newFamilyData.phone || undefined,
          email: newFamilyData.email || undefined,
        });
        familyId = newFamily.id;
      }

      // In demo mode, simulate success after family creation
      if (isDemoMode() && !isCreatingNewFamily) {
        console.log('Creating dog (demo mode):', formData);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        handleClose();
        onSuccess?.();
        return;
      }

      await createDog.mutateAsync({
        family_id: familyId,
        name: formData.name,
        breed: formData.breed || null,
        date_of_birth: formData.date_of_birth || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        gender: formData.gender || null,
        color: formData.color || null,
        microchip_id: formData.microchip_id || null,
        medical_notes: formData.medical_notes || null,
        behavior_notes: formData.behavior_notes || null,
        feeding_instructions: formData.feeding_instructions || null,
        medications: formData.medications || null,
      });
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create dog:', error);
    }
  };

  const isSubmitting = createDog.isPending || createFamily.isPending;

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
            <h2 className="text-lg font-semibold text-white">Add New Dog</h2>
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
      <ModalBody className="min-h-[320px]">
        {/* Step 1: Family Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-3">
                <User size={32} className="text-brand-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Who owns this dog?</h3>
              <p className="text-sm text-surface-400">
                Select an existing family or create a new one
              </p>
            </div>

            {/* Create New Family Option */}
            <button
              type="button"
              onClick={() => {
                setIsCreatingNewFamily(true);
                updateField('family_id', '');
              }}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                isCreatingNewFamily
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-dashed border-surface-600 hover:border-surface-500 bg-surface-800/30'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isCreatingNewFamily ? 'bg-green-500' : 'bg-surface-700'
                )}
              >
                <Plus
                  size={20}
                  className={isCreatingNewFamily ? 'text-white' : 'text-surface-400'}
                />
              </div>
              <span
                className={cn(
                  'font-medium',
                  isCreatingNewFamily ? 'text-white' : 'text-surface-300'
                )}
              >
                Create New Family
              </span>
              {isCreatingNewFamily && (
                <Check size={20} className="ml-auto text-green-400" />
              )}
            </button>

            {/* New Family Form */}
            {isCreatingNewFamily && (
              <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5 space-y-3">
                <Input
                  label="Family Name *"
                  value={newFamilyData.name}
                  onChange={(e) => updateNewFamilyField('name', e.target.value)}
                  placeholder="e.g., Johnson Family"
                  leftIcon={<User size={16} />}
                  error={newFamilyErrors.name}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Phone"
                    value={newFamilyData.phone}
                    onChange={(e) => updateNewFamilyField('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    leftIcon={<Phone size={16} />}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={newFamilyData.email}
                    onChange={(e) => updateNewFamilyField('email', e.target.value)}
                    placeholder="email@example.com"
                    leftIcon={<Mail size={16} />}
                  />
                </div>
              </div>
            )}

            {/* Divider */}
            {!isCreatingNewFamily && (
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-surface-700" />
                <span className="text-xs text-surface-500 uppercase">or select existing</span>
                <div className="flex-1 h-px bg-surface-700" />
              </div>
            )}

            {/* Existing Families */}
            {!isCreatingNewFamily && (
              <>
                {familiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                  </div>
                ) : familyOptions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-surface-400 text-sm">No existing families</p>
                    <p className="text-surface-500 text-xs">Use "Create New Family" above</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {familyOptions.map((family) => (
                      <button
                        key={family.value}
                        type="button"
                        onClick={() => {
                          setIsCreatingNewFamily(false);
                          updateField('family_id', family.value);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                          formData.family_id === family.value
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-surface-700 hover:border-surface-600 bg-surface-800/50'
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            formData.family_id === family.value
                              ? 'bg-brand-500'
                              : 'bg-surface-700'
                          )}
                        >
                          <User
                            size={20}
                            className={
                              formData.family_id === family.value
                                ? 'text-white'
                                : 'text-surface-400'
                            }
                          />
                        </div>
                        <span
                          className={cn(
                            'font-medium',
                            formData.family_id === family.value
                              ? 'text-white'
                              : 'text-surface-300'
                          )}
                        >
                          {family.label}
                        </span>
                        {formData.family_id === family.value && (
                          <Check size={20} className="ml-auto text-brand-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {errors.family_id && !isCreatingNewFamily && (
              <p className="text-sm text-red-400">{errors.family_id}</p>
            )}
          </div>
        )}

        {/* Step 2: Basic Information */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-3">
                <Dog size={32} className="text-brand-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Dog Details</h3>
              <p className="text-sm text-surface-400">
                Enter the dog's basic information
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Name *"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Dog's name"
                leftIcon={<Dog size={16} />}
                error={errors.name}
              />

              <Input
                label="Breed"
                value={formData.breed}
                onChange={(e) => updateField('breed', e.target.value)}
                placeholder="e.g., German Shepherd"
              />

              <Input
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => updateField('date_of_birth', e.target.value)}
                leftIcon={<Calendar size={16} />}
              />

              <Input
                label="Weight (lbs)"
                type="number"
                value={formData.weight}
                onChange={(e) => updateField('weight', e.target.value)}
                placeholder="e.g., 65"
                leftIcon={<Scale size={16} />}
              />

              <Select
                label="Gender"
                value={formData.gender}
                onChange={(e) => updateField('gender', e.target.value as 'male' | 'female' | '')}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                placeholder="Select gender"
              />

              <Input
                label="Color"
                value={formData.color}
                onChange={(e) => updateField('color', e.target.value)}
                placeholder="e.g., Black and Tan"
              />

              <div className="sm:col-span-2">
                <Input
                  label="Microchip ID"
                  value={formData.microchip_id}
                  onChange={(e) => updateField('microchip_id', e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Care Information */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-3">
                <Heart size={32} className="text-brand-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Care Information</h3>
              <p className="text-sm text-surface-400">
                Add feeding instructions and medical notes
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-6">
                  <UtensilsCrossed size={20} className="text-green-400" />
                </div>
                <div className="flex-1">
                  <Textarea
                    label="Feeding Instructions"
                    value={formData.feeding_instructions}
                    onChange={(e) => updateField('feeding_instructions', e.target.value)}
                    placeholder="e.g., 2 cups morning, 2 cups evening - Purina Pro Plan"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-6">
                  <Pill size={20} className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <Textarea
                    label="Medications"
                    value={formData.medications}
                    onChange={(e) => updateField('medications', e.target.value)}
                    placeholder="List any medications and dosages"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-6">
                  <AlertCircle size={20} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <Textarea
                    label="Medical Notes"
                    value={formData.medical_notes}
                    onChange={(e) => updateField('medical_notes', e.target.value)}
                    placeholder="Allergies, health conditions, vaccination status, etc."
                  />
                </div>
              </div>

              <Textarea
                label="Behavior Notes"
                value={formData.behavior_notes}
                onChange={(e) => updateField('behavior_notes', e.target.value)}
                placeholder="Temperament, triggers, special handling instructions, etc."
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
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
              {/* Dog Preview */}
              <div className="p-4 flex items-center gap-4 border-b border-surface-700">
                <Avatar name={formData.name || 'New Dog'} size="lg" />
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {formData.name || 'Unnamed Dog'}
                  </h4>
                  <p className="text-sm text-surface-400">
                    {formData.breed || 'Unknown breed'}
                    {formData.gender && ` • ${formData.gender === 'male' ? 'Male' : 'Female'}`}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-surface-400">Family</span>
                  <span className="text-sm text-white font-medium flex items-center gap-2">
                    {selectedFamilyName}
                    {isCreatingNewFamily && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                        New
                      </span>
                    )}
                  </span>
                </div>

                {formData.date_of_birth && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">Date of Birth</span>
                    <span className="text-sm text-white">
                      {new Date(formData.date_of_birth).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {formData.weight && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">Weight</span>
                    <span className="text-sm text-white">{formData.weight} lbs</span>
                  </div>
                )}

                {formData.color && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">Color</span>
                    <span className="text-sm text-white">{formData.color}</span>
                  </div>
                )}

                {formData.microchip_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">Microchip ID</span>
                    <span className="text-sm text-white font-mono">{formData.microchip_id}</span>
                  </div>
                )}

                {formData.feeding_instructions && (
                  <div className="pt-2 border-t border-surface-700">
                    <span className="text-xs text-surface-500 uppercase tracking-wider">Feeding</span>
                    <p className="text-sm text-surface-300 mt-1">{formData.feeding_instructions}</p>
                  </div>
                )}

                {formData.medications && (
                  <div className="pt-2 border-t border-surface-700">
                    <span className="text-xs text-surface-500 uppercase tracking-wider">Medications</span>
                    <p className="text-sm text-surface-300 mt-1">{formData.medications}</p>
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
              Add Dog
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

export default AddDogModal;
