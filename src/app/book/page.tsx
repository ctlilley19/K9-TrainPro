'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { cn, formatDate } from '@/lib/utils';
import { bookingTypes, intakeQuestions } from '@/services/supabase/bookings';
import {
  Calendar,
  Clock,
  Dog,
  User,
  Mail,
  Phone,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle,
  MapPin,
  Star,
} from 'lucide-react';

// Mock available slots
const generateMockSlots = (date: string) => {
  const slots = [];
  const baseHour = 9;
  for (let i = 0; i < 8; i++) {
    const hour = baseHour + i;
    const available = Math.random() > 0.3;
    slots.push({
      date,
      start_time: `${hour.toString().padStart(2, '0')}:00`,
      end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
      available,
    });
  }
  return slots;
};

// Generate next 14 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    // Skip Sundays
    if (date.getDay() !== 0) {
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  return dates;
};

type Step = 'service' | 'datetime' | 'info' | 'confirm';

export default function BookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<keyof typeof bookingTypes | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    dog_name: '',
    dog_breed: '',
    dog_age: '',
    goals: '',
    notes: '',
    heard_about: '',
  });

  const dates = generateDates();
  const slots = selectedDate ? generateMockSlots(selectedDate) : [];

  const handleNext = () => {
    const steps: Step[] = ['service', 'datetime', 'info', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['service', 'datetime', 'info', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Booking submitted:', {
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        ...formData,
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentStep('confirm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'service':
        return !!selectedService;
      case 'datetime':
        return !!selectedDate && !!selectedTime;
      case 'info':
        return (
          formData.contact_name &&
          formData.contact_email &&
          formData.contact_phone &&
          formData.dog_name
        );
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="bg-surface-900 border-b border-surface-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center">
              <Dog size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">K9 Training Academy</h1>
              <p className="text-sm text-surface-400">Book Your Appointment</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      {currentStep !== 'confirm' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {['service', 'datetime', 'info'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    currentStep === step
                      ? 'bg-brand-500 text-white'
                      : ['service', 'datetime', 'info'].indexOf(currentStep) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-surface-800 text-surface-400'
                  )}
                >
                  {['service', 'datetime', 'info'].indexOf(currentStep) > index ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'ml-2 text-sm hidden sm:block',
                    currentStep === step ? 'text-white' : 'text-surface-500'
                  )}
                >
                  {step === 'service' && 'Select Service'}
                  {step === 'datetime' && 'Date & Time'}
                  {step === 'info' && 'Your Info'}
                </span>
                {index < 2 && (
                  <div className="w-12 sm:w-24 h-px bg-surface-700 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        {/* Step 1: Select Service */}
        {currentStep === 'service' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                What would you like to book?
              </h2>
              <p className="text-surface-400">
                Select the service that best fits your needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(bookingTypes).map(([key, service]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedService(key as keyof typeof bookingTypes)}
                  className={cn(
                    'p-6 rounded-2xl border text-left transition-all',
                    selectedService === key
                      ? 'bg-brand-500/10 border-brand-500/50'
                      : 'bg-surface-900 border-surface-800 hover:border-surface-700'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white">{service.name}</h3>
                    {selectedService === key && (
                      <CheckCircle size={20} className="text-brand-400" />
                    )}
                  </div>
                  <p className="text-sm text-surface-400 mb-3">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-surface-500">
                      <Clock size={14} />
                      {service.duration} min
                    </span>
                    <span className="text-brand-400 font-medium">
                      {service.price === 0 ? 'Free' : `$${service.price}`}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {currentStep === 'datetime' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Choose a date and time
              </h2>
              <p className="text-surface-400">
                Select an available slot that works for you
              </p>
            </div>

            {/* Date Selection */}
            <Card>
              <CardHeader title="Select Date" />
              <CardContent>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map((date) => {
                    const d = new Date(date);
                    const isSelected = selectedDate === date;
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                        className={cn(
                          'flex-shrink-0 w-20 py-3 rounded-xl border text-center transition-all',
                          isSelected
                            ? 'bg-brand-500/10 border-brand-500/50'
                            : 'bg-surface-800/50 border-surface-700 hover:border-surface-600'
                        )}
                      >
                        <p className="text-xs text-surface-400">
                          {d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="text-lg font-bold text-white">
                          {d.getDate()}
                        </p>
                        <p className="text-xs text-surface-500">
                          {d.toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            {selectedDate && (
              <Card>
                <CardHeader
                  title="Select Time"
                  action={
                    <span className="text-sm text-surface-400">
                      {formatDate(selectedDate, 'EEEE, MMMM d')}
                    </span>
                  }
                />
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.start_time}
                        type="button"
                        onClick={() => slot.available && setSelectedTime(slot.start_time)}
                        disabled={!slot.available}
                        className={cn(
                          'py-3 px-4 rounded-xl border text-center transition-all',
                          !slot.available
                            ? 'bg-surface-800/30 border-surface-800 text-surface-600 cursor-not-allowed'
                            : selectedTime === slot.start_time
                            ? 'bg-brand-500/10 border-brand-500/50 text-white'
                            : 'bg-surface-800/50 border-surface-700 hover:border-surface-600 text-white'
                        )}
                      >
                        {slot.start_time}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Contact Info */}
        {currentStep === 'info' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Tell us about yourself
              </h2>
              <p className="text-surface-400">
                We'll use this information to prepare for your visit
              </p>
            </div>

            <Card>
              <CardHeader title="Contact Information" />
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Your Name"
                    value={formData.contact_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contact_name: e.target.value }))
                    }
                    placeholder="John Smith"
                    leftIcon={<User size={16} />}
                    required
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, contact_email: e.target.value }))
                      }
                      placeholder="john@email.com"
                      leftIcon={<Mail size={16} />}
                      required
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))
                      }
                      placeholder="(555) 123-4567"
                      leftIcon={<Phone size={16} />}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Dog Information" />
              <CardContent>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Dog's Name"
                      value={formData.dog_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, dog_name: e.target.value }))
                      }
                      placeholder="Max"
                      leftIcon={<Dog size={16} />}
                      required
                    />
                    <Input
                      label="Breed"
                      value={formData.dog_breed}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, dog_breed: e.target.value }))
                      }
                      placeholder="German Shepherd"
                    />
                  </div>
                  <Select
                    label="Age"
                    value={formData.dog_age}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dog_age: e.target.value }))
                    }
                    options={[
                      { value: 'puppy', label: 'Puppy (under 6 months)' },
                      { value: '6m-1y', label: '6 months - 1 year' },
                      { value: '1-3y', label: '1-3 years' },
                      { value: '3-7y', label: '3-7 years' },
                      { value: '7+', label: '7+ years' },
                    ]}
                    placeholder="Select age"
                  />
                  <Textarea
                    label="Training Goals"
                    value={formData.goals}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, goals: e.target.value }))
                    }
                    placeholder="What would you like to work on with your dog?"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Additional Information" />
              <CardContent>
                <div className="space-y-4">
                  <Select
                    label="How did you hear about us?"
                    value={formData.heard_about}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, heard_about: e.target.value }))
                    }
                    options={[
                      { value: 'google', label: 'Google search' },
                      { value: 'social', label: 'Social media' },
                      { value: 'referral', label: 'Friend/family referral' },
                      { value: 'vet', label: 'Vet referral' },
                      { value: 'ad', label: 'Local advertisement' },
                      { value: 'other', label: 'Other' },
                    ]}
                    placeholder="Select one"
                  />
                  <Textarea
                    label="Anything else we should know?"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Any special requirements, concerns, or questions..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Confirmation */}
        {currentStep === 'confirm' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-surface-400 mb-8 max-w-md mx-auto">
              We've sent a confirmation email to {formData.contact_email}. We look
              forward to meeting you and {formData.dog_name}!
            </p>

            <Card className="max-w-md mx-auto text-left">
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                      <Calendar size={20} className="text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm text-surface-400">Date & Time</p>
                      <p className="text-white font-medium">
                        {selectedDate && formatDate(selectedDate, 'EEEE, MMMM d')} at{' '}
                        {selectedTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                      <Dog size={20} className="text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm text-surface-400">Service</p>
                      <p className="text-white font-medium">
                        {selectedService && bookingTypes[selectedService].name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                      <MapPin size={20} className="text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm text-surface-400">Location</p>
                      <p className="text-white font-medium">
                        123 Training Lane, Waldorf, MD 20601
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <Button variant="outline" onClick={() => router.push('/')}>
                Return to Home
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {currentStep !== 'confirm' && (
          <div className="flex items-center justify-between mt-8">
            {currentStep !== 'service' ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                leftIcon={<ChevronLeft size={16} />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}
            {currentStep === 'info' ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!canProceed()}
              >
                Confirm Booking
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed()}
                rightIcon={<ChevronRight size={16} />}
              >
                Continue
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-900 border-t border-surface-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-surface-400 text-sm">
            Trusted by 500+ families in Southern Maryland
          </p>
          <p className="text-surface-500 text-xs mt-4">
            K9 Training Academy • (301) 555-K9K9 • info@k9protrain.com
          </p>
        </div>
      </footer>
    </div>
  );
}
