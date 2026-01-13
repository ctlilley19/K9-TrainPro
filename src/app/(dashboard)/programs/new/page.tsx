'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Save, ArrowLeft, Calendar, DollarSign, Clock, User, Dog } from 'lucide-react';

const programSchema = z.object({
  dog_id: z.string().min(1, 'Please select a dog'),
  program_type: z.enum(['board_train', 'day_train', 'private_lesson']),
  name: z.string().min(1, 'Program name is required').max(255),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  trainer_id: z.string().min(1, 'Please assign a trainer'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  goals: z.string().optional(),
  notes: z.string().optional(),
});

type ProgramFormData = z.infer<typeof programSchema>;

// Mock data
const mockDogs = [
  { value: 'a', label: 'Max - Anderson Family (German Shepherd)' },
  { value: 'b', label: 'Bella - Anderson Family (Golden Retriever)' },
  { value: 'c', label: 'Luna - Martinez Family (Border Collie)' },
  { value: 'd', label: 'Rocky - Martinez Family (Rottweiler)' },
];

const mockTrainers = [
  { value: 't1', label: 'Sarah Johnson - Lead Trainer' },
  { value: 't2', label: 'John Smith - Trainer' },
  { value: 't3', label: 'Mike Wilson - Assistant Trainer' },
];

const programTypes = [
  { value: 'board_train', label: 'Board & Train' },
  { value: 'day_train', label: 'Day Training' },
  { value: 'private_lesson', label: 'Private Lesson' },
];

const programTemplates = [
  {
    type: 'board_train',
    name: '3-Week Board & Train',
    duration: 21,
    price: 2500,
    description: 'Full immersion training program with daily sessions.',
  },
  {
    type: 'board_train',
    name: '2-Week Board & Train',
    duration: 14,
    price: 1800,
    description: 'Intensive board and train for focused skill building.',
  },
  {
    type: 'day_train',
    name: 'Puppy Foundations (6 weeks)',
    duration: 42,
    price: 1800,
    description: 'Build a strong foundation for puppies up to 6 months.',
  },
  {
    type: 'day_train',
    name: 'Obedience Bootcamp (4 weeks)',
    duration: 28,
    price: 1400,
    description: 'Intensive obedience training for adolescent dogs.',
  },
  {
    type: 'private_lesson',
    name: 'Initial Evaluation',
    duration: 1,
    price: 100,
    description: 'Comprehensive behavioral assessment.',
  },
  {
    type: 'private_lesson',
    name: '1-Hour Private Session',
    duration: 1,
    price: 150,
    description: 'One-on-one training session.',
  },
];

export default function NewProgramPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDog = searchParams.get('dog');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof programTemplates[0] | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      dog_id: preselectedDog || '',
      program_type: 'board_train',
      price: 0,
    },
  });

  const programType = watch('program_type');
  const startDate = watch('start_date');

  const filteredTemplates = programTemplates.filter((t) => t.type === programType);

  const handleTemplateSelect = (template: typeof programTemplates[0]) => {
    setSelectedTemplate(template);
    setValue('name', template.name);
    setValue('price', template.price);

    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + template.duration - 1);
      setValue('end_date', end.toISOString().split('T')[0]);
    }
  };

  const onSubmit = async (data: ProgramFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Creating program:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/programs');
    } catch (error) {
      console.error('Error creating program:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create New Program"
        description="Set up a training program for a dog"
        breadcrumbs={[
          { label: 'Programs', href: '/programs' },
          { label: 'New Program' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Templates */}
          <div className="space-y-6">
            {/* Program Type Selection */}
            <Card>
              <CardHeader title="Program Type" />
              <CardContent>
                <div className="space-y-2">
                  {programTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        programType === type.value
                          ? 'bg-brand-500/10 border-brand-500/50'
                          : 'bg-surface-800/50 border-surface-700 hover:border-surface-600'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('program_type')}
                        value={type.value}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          programType === type.value
                            ? 'border-brand-500 bg-brand-500'
                            : 'border-surface-600'
                        }`}
                      />
                      <span className="font-medium text-white">{type.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader title="Quick Templates" />
              <CardContent>
                <div className="space-y-2">
                  {filteredTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedTemplate?.name === template.name
                          ? 'bg-brand-500/10 border-brand-500/50'
                          : 'bg-surface-800/50 border-surface-700 hover:border-surface-600'
                      }`}
                    >
                      <p className="font-medium text-white">{template.name}</p>
                      <p className="text-sm text-surface-500 mt-1">{template.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {template.duration} days
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} />
                          ${template.price}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dog & Trainer */}
            <Card>
              <CardHeader title="Assignment" />
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    {...register('dog_id')}
                    label="Dog"
                    options={mockDogs}
                    placeholder="Select a dog..."
                    error={errors.dog_id?.message}
                  />
                  <Select
                    {...register('trainer_id')}
                    label="Assigned Trainer"
                    options={mockTrainers}
                    placeholder="Select trainer..."
                    error={errors.trainer_id?.message}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Program Details */}
            <Card>
              <CardHeader title="Program Details" />
              <CardContent>
                <div className="space-y-4">
                  <Input
                    {...register('name')}
                    label="Program Name"
                    placeholder="e.g., 3-Week Board & Train"
                    error={errors.name?.message}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      {...register('start_date')}
                      type="date"
                      label="Start Date"
                      leftIcon={<Calendar size={16} />}
                      error={errors.start_date?.message}
                    />
                    <Input
                      {...register('end_date')}
                      type="date"
                      label="End Date"
                      leftIcon={<Calendar size={16} />}
                      error={errors.end_date?.message}
                    />
                  </div>

                  <Input
                    {...register('price')}
                    type="number"
                    label="Price ($)"
                    placeholder="0.00"
                    leftIcon={<DollarSign size={16} />}
                    error={errors.price?.message}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Goals & Notes */}
            <Card>
              <CardHeader title="Goals & Notes" />
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    {...register('goals')}
                    label="Training Goals"
                    placeholder="What are the main objectives for this program?"
                    className="min-h-[100px]"
                    error={errors.goals?.message}
                  />

                  <Textarea
                    {...register('notes')}
                    label="Additional Notes"
                    placeholder="Any special considerations or instructions..."
                    className="min-h-[80px]"
                    error={errors.notes?.message}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                leftIcon={<ArrowLeft size={16} />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<Save size={16} />}
              >
                Create Program
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
