'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  incidentTypes,
  severityConfig,
  locationPresets,
  incidentService,
  type IncidentType,
  type IncidentSeverity,
} from '@/services/supabase/incidents';
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Camera,
  MapPin,
  Clock,
  User,
  Users,
  Stethoscope,
  Bell,
  FileText,
} from 'lucide-react';

// Mock dogs for selection
const mockDogs = [
  { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
  { id: 'b', name: 'Bella', breed: 'Golden Retriever', photo_url: null },
  { id: 'c', name: 'Luna', breed: 'Border Collie', photo_url: null },
  { id: 'd', name: 'Cooper', breed: 'Labrador', photo_url: null },
  { id: 'e', name: 'Charlie', breed: 'Beagle', photo_url: null },
];

// Mock staff for witnesses
const mockStaff = [
  { id: 'staff_1', name: 'Sarah Johnson' },
  { id: 'staff_2', name: 'Mike Chen' },
  { id: 'staff_3', name: 'Emily Rodriguez' },
  { id: 'staff_4', name: 'David Kim' },
];

export default function NewIncidentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [selectedDog, setSelectedDog] = useState('');
  const [incidentType, setIncidentType] = useState<IncidentType | ''>('');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );
  const [witnesses, setWitnesses] = useState<string[]>([]);
  const [otherDogsInvolved, setOtherDogsInvolved] = useState<string[]>([]);
  const [injuriesReported, setInjuriesReported] = useState(false);
  const [injuryDetails, setInjuryDetails] = useState('');
  const [medicalRequired, setMedicalRequired] = useState(false);
  const [medicalDetails, setMedicalDetails] = useState('');
  const [notifyParentNow, setNotifyParentNow] = useState(false);

  const selectedDogData = mockDogs.find((d) => d.id === selectedDog);

  // Auto-set severity based on incident type
  const handleTypeChange = (type: IncidentType) => {
    setIncidentType(type);
    setSeverity(incidentTypes[type].defaultSeverity);
  };

  const handleSubmit = async () => {
    if (!selectedDog || !incidentType || !title || !description) return;

    setIsSubmitting(true);
    try {
      const incident = await incidentService.createIncident({
        facility_id: 'facility_1',
        dog_id: selectedDog,
        reported_by: 'current_user_id',
        incident_type: incidentType,
        severity,
        title,
        description,
        location: location === 'Other' ? customLocation : location,
        incident_date: incidentDate,
        incident_time: incidentTime,
        witnesses: witnesses.length > 0 ? witnesses : undefined,
        other_dogs_involved: otherDogsInvolved.length > 0 ? otherDogsInvolved : undefined,
        injuries_reported: injuriesReported,
        injury_details: injuriesReported ? injuryDetails : undefined,
        medical_attention_required: medicalRequired,
        medical_details: medicalRequired ? medicalDetails : undefined,
      });

      if (notifyParentNow) {
        await incidentService.markParentNotified(incident.id, 'current_user_id');
      }

      router.push('/incidents');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedDog && incidentType;
      case 2:
        return title && description && location;
      case 3:
        return true; // Optional details
      default:
        return false;
    }
  };

  return (
    <div>
      <PageHeader
        title="Report Incident"
        description="Document a safety incident or concern"
        breadcrumbs={[
          { label: 'Incidents', href: '/incidents' },
          { label: 'New Report' },
        ]}
      />

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors',
                  currentStep === step
                    ? 'bg-brand-500 text-white'
                    : currentStep > step
                      ? 'bg-green-500 text-white'
                      : 'bg-surface-700 text-surface-400'
                )}
              >
                {currentStep > step ? '✓' : step}
              </div>
              {step < 3 && (
                <div
                  className={cn(
                    'w-20 h-1 mx-2 rounded',
                    currentStep > step ? 'bg-green-500' : 'bg-surface-700'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <div className="flex gap-16 text-sm text-surface-400">
            <span>Basic Info</span>
            <span>Details</span>
            <span>Additional</span>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Dog Selection */}
          <Card>
            <CardHeader title="Select Dog" />
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {mockDogs.map((dog) => (
                  <button
                    key={dog.id}
                    type="button"
                    onClick={() => setSelectedDog(dog.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-center',
                      selectedDog === dog.id
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-surface-700 hover:border-surface-600'
                    )}
                  >
                    <Avatar name={dog.name} size="lg" className="mx-auto mb-2" />
                    <p className="font-medium text-white text-sm">{dog.name}</p>
                    <p className="text-xs text-surface-400">{dog.breed}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Incident Type Selection */}
          <Card>
            <CardHeader title="Incident Type" />
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.entries(incidentTypes) as [IncidentType, typeof incidentTypes[IncidentType]][]).map(
                  ([type, config]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeChange(type)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-left',
                        incidentType === type
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-surface-700 hover:border-surface-600'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <p className="font-medium text-white">{config.label}</p>
                          <p className="text-xs text-surface-400">
                            Default: {severityConfig[config.defaultSeverity].label}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Severity Override */}
          {incidentType && (
            <Card>
              <CardHeader title="Severity Level" />
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.entries(severityConfig) as [IncidentSeverity, typeof severityConfig[IncidentSeverity]][]).map(
                    ([sev, config]) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-center',
                          severity === sev
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-surface-700 hover:border-surface-600'
                        )}
                      >
                        <div className={cn('w-4 h-4 rounded-full mx-auto mb-2', config.bgColor)} />
                        <p className={cn('font-medium', config.color)}>{config.label}</p>
                      </button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Incident Details */}
      {currentStep === 2 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader title="Incident Details" />
            <CardContent className="space-y-4">
              <Input
                label="Title"
                placeholder="Brief summary of the incident"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                leftIcon={<FileText size={16} />}
              />

              <Textarea
                label="Description"
                placeholder="Describe what happened in detail. Include any relevant context, behavior observations, and actions taken..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    <MapPin size={14} className="inline mr-1" />
                    Location
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {locationPresets.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm transition-colors',
                          location === loc
                            ? 'bg-brand-500 text-white'
                            : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                        )}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                  {location === 'Other' && (
                    <Input
                      placeholder="Specify location"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <Input
                    label="Date"
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    leftIcon={<Clock size={14} />}
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Witnesses */}
          <Card>
            <CardHeader title="Witnesses" />
            <CardContent>
              <p className="text-sm text-surface-400 mb-3">
                Select any staff members who witnessed the incident
              </p>
              <div className="flex flex-wrap gap-2">
                {mockStaff.map((staff) => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => {
                      setWitnesses((prev) =>
                        prev.includes(staff.id)
                          ? prev.filter((id) => id !== staff.id)
                          : [...prev, staff.id]
                      );
                    }}
                    className={cn(
                      'px-3 py-2 rounded-lg flex items-center gap-2 transition-colors',
                      witnesses.includes(staff.id)
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                    )}
                  >
                    <User size={14} />
                    {staff.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Additional Information */}
      {currentStep === 3 && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Other Dogs Involved */}
          <Card>
            <CardHeader title="Other Dogs Involved" />
            <CardContent>
              <p className="text-sm text-surface-400 mb-3">
                Were any other dogs involved in this incident?
              </p>
              <div className="flex flex-wrap gap-2">
                {mockDogs
                  .filter((d) => d.id !== selectedDog)
                  .map((dog) => (
                    <button
                      key={dog.id}
                      type="button"
                      onClick={() => {
                        setOtherDogsInvolved((prev) =>
                          prev.includes(dog.id)
                            ? prev.filter((id) => id !== dog.id)
                            : [...prev, dog.id]
                        );
                      }}
                      className={cn(
                        'px-3 py-2 rounded-lg flex items-center gap-2 transition-colors',
                        otherDogsInvolved.includes(dog.id)
                          ? 'bg-brand-500 text-white'
                          : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                      )}
                    >
                      <Users size={14} />
                      {dog.name}
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Injuries */}
          <Card>
            <CardHeader title="Injuries & Medical" />
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInjuriesReported(!injuriesReported)}
                  className={cn(
                    'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                    injuriesReported
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'border-surface-600'
                  )}
                >
                  {injuriesReported && '✓'}
                </button>
                <span className="text-white">Injuries were reported</span>
              </div>

              {injuriesReported && (
                <Textarea
                  label="Injury Details"
                  placeholder="Describe the injuries observed..."
                  value={injuryDetails}
                  onChange={(e) => setInjuryDetails(e.target.value)}
                  rows={3}
                />
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMedicalRequired(!medicalRequired)}
                  className={cn(
                    'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                    medicalRequired
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'border-surface-600'
                  )}
                >
                  {medicalRequired && '✓'}
                </button>
                <span className="text-white">Medical attention was required</span>
              </div>

              {medicalRequired && (
                <Textarea
                  label="Medical Details"
                  placeholder="Describe the medical care provided or needed..."
                  value={medicalDetails}
                  onChange={(e) => setMedicalDetails(e.target.value)}
                  rows={3}
                />
              )}
            </CardContent>
          </Card>

          {/* Parent Notification */}
          <Card>
            <CardHeader title="Parent Notification" />
            <CardContent>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNotifyParentNow(!notifyParentNow)}
                  className={cn(
                    'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                    notifyParentNow
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'border-surface-600'
                  )}
                >
                  {notifyParentNow && '✓'}
                </button>
                <div>
                  <span className="text-white">Notify parent immediately</span>
                  <p className="text-sm text-surface-400">
                    Send an email notification to the pet parent about this incident
                  </p>
                </div>
              </div>
              {(severity === 'high' || severity === 'critical' || injuriesReported) && !notifyParentNow && (
                <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">
                      Recommended: Notify parent for high severity or injury incidents
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-brand-500/30">
            <CardHeader title="Summary" />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-surface-400">Dog:</span>
                  <span className="text-white ml-2">{selectedDogData?.name}</span>
                </div>
                <div>
                  <span className="text-surface-400">Type:</span>
                  <span className="text-white ml-2">
                    {incidentType && incidentTypes[incidentType].label}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400">Severity:</span>
                  <span className={cn('ml-2', severityConfig[severity].color)}>
                    {severityConfig[severity].label}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400">Location:</span>
                  <span className="text-white ml-2">
                    {location === 'Other' ? customLocation : location}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-surface-400">Title:</span>
                  <span className="text-white ml-2">{title}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="max-w-3xl mx-auto mt-8 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => (currentStep === 1 ? router.back() : setCurrentStep(currentStep - 1))}
          leftIcon={<ArrowLeft size={16} />}
        >
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>

        {currentStep < 3 ? (
          <Button
            variant="primary"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<Save size={16} />}
          >
            Submit Report
          </Button>
        )}
      </div>
    </div>
  );
}
