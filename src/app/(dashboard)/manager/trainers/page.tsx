'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  UserCog,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Dog,
  Clock,
  TrendingUp,
  Award,
  Edit,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';

// Demo data for trainers
const demoTrainers = [
  {
    id: 't1',
    name: 'Sarah Johnson',
    email: 'sarah@k9trainpro.com',
    phone: '(301) 555-1234',
    role: 'lead_trainer',
    status: 'active',
    avatar_url: null,
    hire_date: '2023-03-15',
    specialties: ['Obedience', 'Behavior Modification', 'Puppy Training'],
    certifications: ['CPDT-KA', 'AKC CGC Evaluator'],
    stats: {
      dogsAssigned: 3,
      dogsCompleted: 45,
      totalHours: 1250,
      avgRating: 4.9,
      badgesAwarded: 120,
    },
    schedule: {
      monday: '8:00 AM - 5:00 PM',
      tuesday: '8:00 AM - 5:00 PM',
      wednesday: '8:00 AM - 5:00 PM',
      thursday: '8:00 AM - 5:00 PM',
      friday: '8:00 AM - 3:00 PM',
    },
  },
  {
    id: 't2',
    name: 'John Smith',
    email: 'john@k9trainpro.com',
    phone: '(301) 555-2345',
    role: 'trainer',
    status: 'active',
    avatar_url: null,
    hire_date: '2023-06-01',
    specialties: ['Obedience', 'Leash Training'],
    certifications: ['CPDT-KA'],
    stats: {
      dogsAssigned: 2,
      dogsCompleted: 28,
      totalHours: 820,
      avgRating: 4.7,
      badgesAwarded: 75,
    },
    schedule: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: 'Off',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
    },
  },
  {
    id: 't3',
    name: 'Mike Wilson',
    email: 'mike@k9trainpro.com',
    phone: '(301) 555-3456',
    role: 'trainer',
    status: 'active',
    avatar_url: null,
    hire_date: '2023-09-15',
    specialties: ['Puppy Training', 'Socialization'],
    certifications: ['CPDT-KA'],
    stats: {
      dogsAssigned: 2,
      dogsCompleted: 15,
      totalHours: 480,
      avgRating: 4.6,
      badgesAwarded: 42,
    },
    schedule: {
      monday: '8:00 AM - 5:00 PM',
      tuesday: 'Off',
      wednesday: '8:00 AM - 5:00 PM',
      thursday: '8:00 AM - 5:00 PM',
      friday: '8:00 AM - 5:00 PM',
    },
  },
  {
    id: 't4',
    name: 'Emily Davis',
    email: 'emily@k9trainpro.com',
    phone: '(301) 555-4567',
    role: 'trainer',
    status: 'inactive',
    avatar_url: null,
    hire_date: '2024-01-10',
    specialties: ['Obedience', 'Agility'],
    certifications: [],
    stats: {
      dogsAssigned: 0,
      dogsCompleted: 8,
      totalHours: 180,
      avgRating: 4.5,
      badgesAwarded: 18,
    },
    schedule: {
      monday: 'Off',
      tuesday: '10:00 AM - 6:00 PM',
      wednesday: '10:00 AM - 6:00 PM',
      thursday: 'Off',
      friday: '10:00 AM - 6:00 PM',
    },
  },
];

const roleLabels: Record<string, string> = {
  lead_trainer: 'Lead Trainer',
  trainer: 'Trainer',
  assistant: 'Assistant',
};

export default function TrainersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<typeof demoTrainers[0] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredTrainers = demoTrainers.filter((trainer) =>
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Trainer Management"
        description="Manage your training team, schedules, and performance"
        icon={<UserCog className="text-purple-400" size={24} />}
        action={
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Trainer
          </Button>
        }
      />

      {/* Search Bar */}
      <Card className="mb-6" padding="sm">
        <div className="max-w-md">
          <Input
            placeholder="Search trainers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
      </Card>

      {/* Trainers Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTrainers.map((trainer) => (
          <Card key={trainer.id} className="overflow-hidden">
            {/* Header */}
            <div className={`p-4 ${
              trainer.role === 'lead_trainer'
                ? 'bg-gradient-to-r from-purple-500/20 to-purple-500/5'
                : 'bg-surface-800/50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={trainer.name} size="lg" src={trainer.avatar_url} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{trainer.name}</h3>
                      <StatusBadge
                        variant={trainer.status === 'active' ? 'success' : 'default'}
                        size="xs"
                      >
                        {trainer.status === 'active' ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-surface-400">
                      {roleLabels[trainer.role] || trainer.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedTrainer(trainer)}
                >
                  <MoreVertical size={18} />
                </Button>
              </div>
            </div>

            <CardContent>
              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <a
                  href={`mailto:${trainer.email}`}
                  className="flex items-center gap-1.5 text-surface-400 hover:text-white"
                >
                  <Mail size={14} />
                  {trainer.email}
                </a>
                <a
                  href={`tel:${trainer.phone}`}
                  className="flex items-center gap-1.5 text-surface-400 hover:text-white"
                >
                  <Phone size={14} />
                  {trainer.phone}
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 rounded-lg bg-surface-800/50">
                  <Dog size={16} className="mx-auto text-brand-400 mb-1" />
                  <p className="text-lg font-semibold text-white">{trainer.stats.dogsAssigned}</p>
                  <p className="text-xs text-surface-500">Current</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-surface-800/50">
                  <Clock size={16} className="mx-auto text-blue-400 mb-1" />
                  <p className="text-lg font-semibold text-white">{trainer.stats.totalHours}</p>
                  <p className="text-xs text-surface-500">Hours</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-surface-800/50">
                  <Award size={16} className="mx-auto text-yellow-400 mb-1" />
                  <p className="text-lg font-semibold text-white">{trainer.stats.badgesAwarded}</p>
                  <p className="text-xs text-surface-500">Badges</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-surface-800/50">
                  <TrendingUp size={16} className="mx-auto text-green-400 mb-1" />
                  <p className="text-lg font-semibold text-white">{trainer.stats.avgRating}</p>
                  <p className="text-xs text-surface-500">Rating</p>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-xs text-surface-500 mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1.5">
                  {trainer.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 rounded-md bg-surface-800 text-xs text-surface-300"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {trainer.certifications.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-surface-500 mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {trainer.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-2 py-1 rounded-md bg-green-500/10 text-xs text-green-400 border border-green-500/20"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-surface-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  leftIcon={<Edit size={14} />}
                >
                  Edit
                </Button>
                <Link href={`/manager/assignments?trainer=${trainer.id}`} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">
                    View Assignments
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTrainers.length === 0 && (
        <Card className="text-center py-12">
          <UserCog size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No trainers found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery ? 'Try adjusting your search' : 'Add your first trainer to get started'}
          </p>
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
            Add Trainer
          </Button>
        </Card>
      )}

      {/* Add Trainer Modal (placeholder) */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Trainer"
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Enter trainer's name" />
          <Input label="Email" type="email" placeholder="trainer@example.com" />
          <Input label="Phone" type="tel" placeholder="(555) 555-5555" />
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Role</label>
            <select className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none">
              <option value="trainer">Trainer</option>
              <option value="lead_trainer">Lead Trainer</option>
              <option value="assistant">Assistant</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1">
              Add Trainer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trainer Detail Modal (placeholder) */}
      <Modal
        isOpen={!!selectedTrainer}
        onClose={() => setSelectedTrainer(null)}
        title={selectedTrainer?.name || 'Trainer Details'}
      >
        {selectedTrainer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-surface-800">
              <Avatar name={selectedTrainer.name} size="xl" />
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedTrainer.name}</h3>
                <p className="text-surface-400">{roleLabels[selectedTrainer.role]}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-surface-500 mb-2">Schedule</p>
              <div className="space-y-1 text-sm">
                {Object.entries(selectedTrainer.schedule).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize text-surface-400">{day}</span>
                    <span className={hours === 'Off' ? 'text-surface-600' : 'text-white'}>
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedTrainer(null)}>
                Close
              </Button>
              <Button variant="primary" className="flex-1" leftIcon={<Edit size={16} />}>
                Edit Trainer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
