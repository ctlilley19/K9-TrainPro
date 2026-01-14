'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, formatDate } from '@/lib/utils';
import {
  vaccinationConfig,
  healthService,
  commonAllergens,
  commonMedications,
  medicationFrequencies,
  type VaccinationType,
  type VaccinationStatus,
  type Vaccination,
  type HealthCondition,
  type Medication,
  type Allergy,
  type WeightRecord,
} from '@/services/supabase/health';
import {
  Syringe,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Pill,
  Heart,
  Scale,
  Stethoscope,
  FileText,
  Upload,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

// Mock dog data
const mockDog = {
  id: 'a',
  name: 'Max',
  breed: 'German Shepherd',
  age: '3 years',
  weight: 85,
  photo_url: null,
};

// Mock health data
const mockVaccinations: (Vaccination & { status: VaccinationStatus })[] = [
  {
    id: '1',
    dog_id: 'a',
    type: 'rabies',
    name: 'Rabies 3-Year',
    date_administered: '2024-03-15',
    expiration_date: '2027-03-15',
    administered_by: 'City Vet Clinic',
    lot_number: 'RAB-2024-001',
    status: 'current',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
  },
  {
    id: '2',
    dog_id: 'a',
    type: 'dhpp',
    name: 'DHPP',
    date_administered: '2024-03-15',
    expiration_date: '2027-03-15',
    administered_by: 'City Vet Clinic',
    status: 'current',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
  },
  {
    id: '3',
    dog_id: 'a',
    type: 'bordetella',
    name: 'Bordetella',
    date_administered: '2024-12-01',
    expiration_date: '2025-02-01',
    administered_by: 'City Vet Clinic',
    status: 'due_soon',
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
];

const mockMedications: Medication[] = [
  {
    id: '1',
    dog_id: 'a',
    name: 'Heartgard',
    dosage: '68-136 lbs tablet',
    frequency: 'Monthly',
    start_date: '2024-01-01',
    prescribing_vet: 'Dr. Smith',
    reason: 'Heartworm prevention',
    instructions: 'Give with food on the 1st of each month',
    is_active: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
];

const mockAllergies: Allergy[] = [
  {
    id: '1',
    dog_id: 'a',
    allergen: 'Chicken',
    severity: 'moderate',
    reaction_type: 'Skin irritation, itching',
    treatment: 'Avoid chicken-based foods and treats',
    created_at: '2024-01-15T10:00:00Z',
  },
];

const mockConditions: HealthCondition[] = [
  {
    id: '1',
    dog_id: 'a',
    name: 'Hip Dysplasia',
    description: 'Mild hip dysplasia in left hip',
    severity: 'mild',
    status: 'managed',
    diagnosed_date: '2023-06-15',
    diagnosed_by: 'Dr. Smith - City Vet Clinic',
    treatment_plan: 'Joint supplements, moderate exercise, weight management',
    created_at: '2023-06-15T10:00:00Z',
    updated_at: '2023-06-15T10:00:00Z',
  },
];

const mockWeightHistory: WeightRecord[] = [
  { id: '1', dog_id: 'a', weight: 85, unit: 'lbs', recorded_date: '2025-01-10', recorded_by: 'Sarah', created_at: '2025-01-10T10:00:00Z' },
  { id: '2', dog_id: 'a', weight: 84, unit: 'lbs', recorded_date: '2024-12-10', recorded_by: 'Mike', created_at: '2024-12-10T10:00:00Z' },
  { id: '3', dog_id: 'a', weight: 83, unit: 'lbs', recorded_date: '2024-11-10', recorded_by: 'Sarah', created_at: '2024-11-10T10:00:00Z' },
  { id: '4', dog_id: 'a', weight: 82, unit: 'lbs', recorded_date: '2024-10-10', recorded_by: 'Sarah', created_at: '2024-10-10T10:00:00Z' },
];

const mockVet = {
  id: '1',
  dog_id: 'a',
  clinic_name: 'City Vet Clinic',
  vet_name: 'Dr. Sarah Smith',
  phone: '(555) 123-4567',
  email: 'info@cityvetclinic.com',
  address: '123 Main St, Anytown, USA 12345',
  is_primary: true,
  emergency_contact: true,
  created_at: '2024-01-01T10:00:00Z',
};

type TabType = 'vaccinations' | 'medications' | 'conditions' | 'allergies' | 'weight' | 'vet';

export default function DogHealthPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('vaccinations');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['required', 'optional']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const requiredVaccinations = mockVaccinations.filter(
    (v) => vaccinationConfig[v.type]?.required
  );
  const optionalVaccinations = mockVaccinations.filter(
    (v) => !vaccinationConfig[v.type]?.required
  );

  const getStatusBadge = (status: VaccinationStatus) => {
    const colors = healthService.getStatusColor(status);
    const labels = {
      current: 'Current',
      due_soon: 'Due Soon',
      overdue: 'Overdue',
      not_required: 'Not Required',
    };

    return (
      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', colors.bg, colors.color)}>
        {labels[status]}
      </span>
    );
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'vaccinations', label: 'Vaccinations', icon: <Syringe size={16} />, count: mockVaccinations.length },
    { id: 'medications', label: 'Medications', icon: <Pill size={16} />, count: mockMedications.filter((m) => m.is_active).length },
    { id: 'conditions', label: 'Conditions', icon: <Heart size={16} />, count: mockConditions.filter((c) => c.status !== 'resolved').length },
    { id: 'allergies', label: 'Allergies', icon: <AlertTriangle size={16} />, count: mockAllergies.length },
    { id: 'weight', label: 'Weight', icon: <Scale size={16} /> },
    { id: 'vet', label: 'Veterinarian', icon: <Stethoscope size={16} /> },
  ];

  return (
    <div>
      <PageHeader
        title={`${mockDog.name}'s Health Records`}
        description="Vaccinations, medications, and health information"
        breadcrumbs={[
          { label: 'Dogs', href: '/dogs' },
          { label: mockDog.name, href: `/dogs/${params.id}` },
          { label: 'Health Records' },
        ]}
      />

      {/* Dog Summary Card */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={mockDog.name} size="xl" />
              <div>
                <h2 className="text-xl font-bold text-white">{mockDog.name}</h2>
                <p className="text-surface-400">
                  {mockDog.breed} • {mockDog.age} • {mockDog.weight} lbs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {mockVaccinations.filter((v) => v.status === 'current').length}
                  </div>
                  <div className="text-xs text-surface-400">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {mockVaccinations.filter((v) => v.status === 'due_soon').length}
                  </div>
                  <div className="text-xs text-surface-400">Due Soon</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {mockVaccinations.filter((v) => v.status === 'overdue').length}
                  </div>
                  <div className="text-xs text-surface-400">Overdue</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-brand-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-xs',
                  activeTab === tab.id ? 'bg-white/20' : 'bg-surface-700'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Vaccinations Tab */}
      {activeTab === 'vaccinations' && (
        <div className="space-y-6">
          {/* Required Vaccinations */}
          <Card>
            <button
              onClick={() => toggleSection('required')}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Required Vaccinations</h3>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                  Required for boarding
                </span>
              </div>
              {expandedSections.includes('required') ? (
                <ChevronUp size={20} className="text-surface-400" />
              ) : (
                <ChevronDown size={20} className="text-surface-400" />
              )}
            </button>
            {expandedSections.includes('required') && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {['rabies', 'dhpp', 'bordetella'].map((type) => {
                    const vax = requiredVaccinations.find((v) => v.type === type);
                    const config = vaccinationConfig[type as VaccinationType];

                    return (
                      <div
                        key={type}
                        className={cn(
                          'p-4 rounded-xl border',
                          vax?.status === 'overdue'
                            ? 'border-red-500/30 bg-red-500/5'
                            : vax?.status === 'due_soon'
                              ? 'border-yellow-500/30 bg-yellow-500/5'
                              : 'border-surface-700 bg-surface-800/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                vax ? 'bg-green-500/20' : 'bg-surface-700'
                              )}
                            >
                              <Syringe
                                size={20}
                                className={vax ? 'text-green-400' : 'text-surface-500'}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-white">{config.name}</h4>
                                {vax && getStatusBadge(vax.status)}
                              </div>
                              <p className="text-sm text-surface-400">{config.description}</p>
                            </div>
                          </div>
                          {vax ? (
                            <div className="text-right">
                              <p className="text-sm text-white">
                                Expires: {formatDate(vax.expiration_date)}
                              </p>
                              <p className="text-xs text-surface-400">
                                {healthService.getDaysUntilExpiration(vax.expiration_date)} days remaining
                              </p>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" leftIcon={<Plus size={14} />}>
                              Add Record
                            </Button>
                          )}
                        </div>
                        {vax && (
                          <div className="mt-3 pt-3 border-t border-surface-700 flex items-center justify-between">
                            <div className="text-xs text-surface-400">
                              Administered: {formatDate(vax.date_administered)} • {vax.administered_by}
                              {vax.lot_number && ` • Lot: ${vax.lot_number}`}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon-sm">
                                <FileText size={14} />
                              </Button>
                              <Button variant="ghost" size="icon-sm">
                                <Edit size={14} />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Optional Vaccinations */}
          <Card>
            <button
              onClick={() => toggleSection('optional')}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Optional Vaccinations</h3>
                <span className="px-2 py-0.5 rounded bg-surface-700 text-surface-400 text-xs">
                  Recommended
                </span>
              </div>
              {expandedSections.includes('optional') ? (
                <ChevronUp size={20} className="text-surface-400" />
              ) : (
                <ChevronDown size={20} className="text-surface-400" />
              )}
            </button>
            {expandedSections.includes('optional') && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {['leptospirosis', 'canine_influenza', 'lyme'].map((type) => {
                    const vax = optionalVaccinations.find((v) => v.type === type);
                    const config = vaccinationConfig[type as VaccinationType];

                    return (
                      <div
                        key={type}
                        className="p-4 rounded-xl border border-surface-700 bg-surface-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-700">
                              <Syringe size={20} className="text-surface-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{config.name}</h4>
                              <p className="text-sm text-surface-400">{config.description}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" leftIcon={<Plus size={14} />}>
                            Add Record
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Medications Tab */}
      {activeTab === 'medications' && (
        <Card>
          <CardHeader
            title="Current Medications"
            action={
              <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                Add Medication
              </Button>
            }
          />
          <CardContent>
            {mockMedications.length > 0 ? (
              <div className="space-y-4">
                {mockMedications.map((med) => (
                  <div
                    key={med.id}
                    className="p-4 rounded-xl border border-surface-700 bg-surface-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/20">
                          <Pill size={20} className="text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{med.name}</h4>
                          <p className="text-sm text-surface-400">
                            {med.dosage} • {med.frequency}
                          </p>
                          {med.reason && (
                            <p className="text-sm text-surface-500 mt-1">{med.reason}</p>
                          )}
                          {med.instructions && (
                            <p className="text-xs text-surface-400 mt-2 p-2 rounded bg-surface-700/50">
                              {med.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon-sm">
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-surface-700 text-xs text-surface-400">
                      Started: {formatDate(med.start_date)}
                      {med.prescribing_vet && ` • Prescribed by: ${med.prescribing_vet}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Pill size={40} className="mx-auto text-surface-600 mb-3" />
                <p className="text-surface-400">No medications on record</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conditions Tab */}
      {activeTab === 'conditions' && (
        <Card>
          <CardHeader
            title="Health Conditions"
            action={
              <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                Add Condition
              </Button>
            }
          />
          <CardContent>
            {mockConditions.length > 0 ? (
              <div className="space-y-4">
                {mockConditions.map((condition) => (
                  <div
                    key={condition.id}
                    className="p-4 rounded-xl border border-surface-700 bg-surface-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{condition.name}</h4>
                          <StatusBadge
                            variant={
                              condition.status === 'active'
                                ? 'error'
                                : condition.status === 'managed'
                                  ? 'warning'
                                  : 'success'
                            }
                            size="xs"
                          >
                            {condition.status}
                          </StatusBadge>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-xs',
                              condition.severity === 'severe'
                                ? 'bg-red-500/20 text-red-400'
                                : condition.severity === 'moderate'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-blue-500/20 text-blue-400'
                            )}
                          >
                            {condition.severity}
                          </span>
                        </div>
                        {condition.description && (
                          <p className="text-sm text-surface-400">{condition.description}</p>
                        )}
                        {condition.treatment_plan && (
                          <div className="mt-2 p-2 rounded bg-surface-700/50">
                            <p className="text-xs text-surface-400">Treatment Plan:</p>
                            <p className="text-sm text-white">{condition.treatment_plan}</p>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon-sm">
                        <Edit size={14} />
                      </Button>
                    </div>
                    {condition.diagnosed_date && (
                      <div className="mt-3 pt-3 border-t border-surface-700 text-xs text-surface-400">
                        Diagnosed: {formatDate(condition.diagnosed_date)}
                        {condition.diagnosed_by && ` • ${condition.diagnosed_by}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart size={40} className="mx-auto text-surface-600 mb-3" />
                <p className="text-surface-400">No health conditions on record</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Allergies Tab */}
      {activeTab === 'allergies' && (
        <Card>
          <CardHeader
            title="Known Allergies"
            action={
              <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                Add Allergy
              </Button>
            }
          />
          <CardContent>
            {mockAllergies.length > 0 ? (
              <div className="space-y-4">
                {mockAllergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className={cn(
                      'p-4 rounded-xl border',
                      allergy.severity === 'severe'
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-surface-700 bg-surface-800/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            allergy.severity === 'severe'
                              ? 'bg-red-500/20'
                              : 'bg-yellow-500/20'
                          )}
                        >
                          <AlertTriangle
                            size={20}
                            className={
                              allergy.severity === 'severe' ? 'text-red-400' : 'text-yellow-400'
                            }
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{allergy.allergen}</h4>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                allergy.severity === 'severe'
                                  ? 'bg-red-500/20 text-red-400'
                                  : allergy.severity === 'moderate'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-blue-500/20 text-blue-400'
                              )}
                            >
                              {allergy.severity}
                            </span>
                          </div>
                          <p className="text-sm text-surface-400">{allergy.reaction_type}</p>
                          {allergy.treatment && (
                            <p className="text-sm text-surface-500 mt-1">
                              Treatment: {allergy.treatment}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon-sm">
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle size={40} className="mx-auto text-surface-600 mb-3" />
                <p className="text-surface-400">No allergies on record</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weight Tab */}
      {activeTab === 'weight' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              title="Weight History"
              action={
                <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                  Record Weight
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-3">
                {mockWeightHistory.map((record, index) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/20">
                        <Scale size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {record.weight} {record.unit}
                        </p>
                        <p className="text-xs text-surface-400">
                          {formatDate(record.recorded_date)}
                        </p>
                      </div>
                    </div>
                    {index > 0 && (
                      <div
                        className={cn(
                          'text-sm',
                          record.weight > mockWeightHistory[index - 1].weight
                            ? 'text-green-400'
                            : record.weight < mockWeightHistory[index - 1].weight
                              ? 'text-red-400'
                              : 'text-surface-400'
                        )}
                      >
                        {record.weight > mockWeightHistory[index - 1].weight ? '+' : ''}
                        {record.weight - mockWeightHistory[index - 1].weight} lbs
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Weight Trend" />
            <CardContent>
              <div className="h-48 flex items-center justify-center text-surface-500">
                Weight chart would go here
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vet Tab */}
      {activeTab === 'vet' && (
        <Card>
          <CardHeader
            title="Veterinarian Information"
            action={
              <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                Add Vet
              </Button>
            }
          />
          <CardContent>
            <div className="p-4 rounded-xl border border-surface-700 bg-surface-800/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-500/20">
                    <Stethoscope size={24} className="text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{mockVet.clinic_name}</h4>
                      {mockVet.is_primary && (
                        <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 text-xs">
                          Primary
                        </span>
                      )}
                      {mockVet.emergency_contact && (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                          Emergency
                        </span>
                      )}
                    </div>
                    {mockVet.vet_name && (
                      <p className="text-sm text-surface-300">{mockVet.vet_name}</p>
                    )}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-surface-400">
                        <Phone size={14} />
                        <a href={`tel:${mockVet.phone}`} className="hover:text-white">
                          {mockVet.phone}
                        </a>
                      </div>
                      {mockVet.email && (
                        <div className="flex items-center gap-2 text-sm text-surface-400">
                          <Mail size={14} />
                          <a href={`mailto:${mockVet.email}`} className="hover:text-white">
                            {mockVet.email}
                          </a>
                        </div>
                      )}
                      {mockVet.address && (
                        <div className="flex items-center gap-2 text-sm text-surface-400">
                          <MapPin size={14} />
                          <span>{mockVet.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <Edit size={14} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
