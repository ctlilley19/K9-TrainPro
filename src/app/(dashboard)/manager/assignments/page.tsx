'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import {
  Target,
  Search,
  Plus,
  Dog,
  Calendar,
  User,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit,
  Shuffle,
} from 'lucide-react';

// Demo data for assignments
const demoAssignments = [
  {
    id: 'a1',
    dog: { id: '1', name: 'Max', breed: 'German Shepherd', photo_url: null },
    trainer: { id: 't1', name: 'Sarah Johnson', avatar_url: null },
    program: { id: 'p1', name: '2-Week Board & Train', type: 'board_train' },
    startDate: '2025-01-08',
    endDate: '2025-01-22',
    status: 'active',
    progress: 45,
    notes: 'Focus on separation anxiety',
  },
  {
    id: 'a2',
    dog: { id: '2', name: 'Rocky', breed: 'Rottweiler', photo_url: null },
    trainer: { id: 't1', name: 'Sarah Johnson', avatar_url: null },
    program: { id: 'p2', name: '3-Week Board & Train', type: 'board_train' },
    startDate: '2025-01-03',
    endDate: '2025-01-24',
    status: 'active',
    progress: 65,
    notes: 'Strong puller, needs consistent corrections',
  },
  {
    id: 'a3',
    dog: { id: '3', name: 'Bella', breed: 'Golden Retriever', photo_url: null },
    trainer: { id: 't2', name: 'John Smith', avatar_url: null },
    program: { id: 'p3', name: 'Day Training', type: 'day_train' },
    startDate: '2025-01-10',
    endDate: '2025-02-07',
    status: 'active',
    progress: 25,
    notes: 'Basic obedience focus',
  },
  {
    id: 'a4',
    dog: { id: '4', name: 'Luna', breed: 'Border Collie', photo_url: null },
    trainer: { id: 't2', name: 'John Smith', avatar_url: null },
    program: { id: 'p4', name: '2-Week Board & Train', type: 'board_train' },
    startDate: '2025-01-06',
    endDate: '2025-01-20',
    status: 'active',
    progress: 55,
    notes: 'High energy, agility foundation',
  },
  {
    id: 'a5',
    dog: { id: '5', name: 'Charlie', breed: 'Labrador', photo_url: null },
    trainer: { id: 't3', name: 'Mike Wilson', avatar_url: null },
    program: { id: 'p5', name: '2-Week Board & Train', type: 'board_train' },
    startDate: '2025-01-11',
    endDate: '2025-01-25',
    status: 'active',
    progress: 30,
    notes: 'Limited jumping due to hip dysplasia',
  },
  {
    id: 'a6',
    dog: { id: '6', name: 'Daisy', breed: 'Beagle', photo_url: null },
    trainer: { id: 't3', name: 'Mike Wilson', avatar_url: null },
    program: { id: 'p6', name: 'Puppy Foundation', type: 'day_train' },
    startDate: '2024-12-30',
    endDate: '2025-01-27',
    status: 'active',
    progress: 50,
    notes: 'Young pup, lots of energy',
  },
  {
    id: 'a7',
    dog: { id: '7', name: 'Cooper', breed: 'Husky', photo_url: null },
    trainer: { id: 't1', name: 'Sarah Johnson', avatar_url: null },
    program: { id: 'p7', name: '3-Week Board & Train', type: 'board_train' },
    startDate: '2025-01-09',
    endDate: '2025-01-30',
    status: 'active',
    progress: 35,
    notes: 'Working on quiet command, recall',
  },
];

const trainers = [
  { id: 't1', name: 'Sarah Johnson', dogsAssigned: 3 },
  { id: 't2', name: 'John Smith', dogsAssigned: 2 },
  { id: 't3', name: 'Mike Wilson', dogsAssigned: 2 },
  { id: 't4', name: 'Emily Davis', dogsAssigned: 0 },
];

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('all');
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<typeof demoAssignments[0] | null>(null);

  const filteredAssignments = useMemo(() => {
    return demoAssignments.filter((assignment) => {
      const matchesSearch =
        assignment.dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.trainer.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrainer =
        trainerFilter === 'all' || assignment.trainer.id === trainerFilter;
      return matchesSearch && matchesTrainer;
    });
  }, [searchQuery, trainerFilter]);

  // Group assignments by trainer
  const groupedByTrainer = useMemo(() => {
    const grouped: Record<string, typeof demoAssignments> = {};
    filteredAssignments.forEach((assignment) => {
      const trainerId = assignment.trainer.id;
      if (!grouped[trainerId]) {
        grouped[trainerId] = [];
      }
      grouped[trainerId].push(assignment);
    });
    return grouped;
  }, [filteredAssignments]);

  const handleReassign = (assignment: typeof demoAssignments[0]) => {
    setSelectedAssignment(assignment);
    setShowReassignModal(true);
  };

  return (
    <div>
      <PageHeader
        title="Dog Assignments"
        description="Manage trainer-dog assignments and workload distribution"
        icon={<Target className="text-purple-400" size={24} />}
        action={
          <Button variant="primary" leftIcon={<Plus size={18} />}>
            New Assignment
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by dog or trainer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <select
            value={trainerFilter}
            onChange={(e) => setTrainerFilter(e.target.value)}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Trainers</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name} ({trainer.dogsAssigned} dogs)
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Workload Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {trainers.map((trainer) => (
          <Card
            key={trainer.id}
            className={`cursor-pointer transition-all ${
              trainerFilter === trainer.id ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setTrainerFilter(trainer.id === trainerFilter ? 'all' : trainer.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar name={trainer.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{trainer.name}</p>
                  <p className="text-sm text-surface-500">
                    {trainer.dogsAssigned} dogs assigned
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      trainer.dogsAssigned >= 3 ? 'bg-yellow-500' :
                      trainer.dogsAssigned === 0 ? 'bg-surface-600' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(trainer.dogsAssigned * 25, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-surface-500 mt-1">
                  {trainer.dogsAssigned >= 3 ? 'Near capacity' :
                   trainer.dogsAssigned === 0 ? 'Available' :
                   'Good workload'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {trainerFilter === 'all' ? (
          // Show grouped by trainer
          Object.entries(groupedByTrainer).map(([trainerId, assignments]) => {
            const trainer = trainers.find((t) => t.id === trainerId);
            return (
              <Card key={trainerId}>
                <CardHeader
                  title={
                    <div className="flex items-center gap-3">
                      <Avatar name={trainer?.name || ''} size="sm" />
                      <span>{trainer?.name}</span>
                      <span className="text-sm font-normal text-surface-500">
                        ({assignments.length} dogs)
                      </span>
                    </div>
                  }
                />
                <CardContent>
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <AssignmentRow
                        key={assignment.id}
                        assignment={assignment}
                        isExpanded={expandedAssignment === assignment.id}
                        onToggle={() =>
                          setExpandedAssignment(
                            expandedAssignment === assignment.id ? null : assignment.id
                          )
                        }
                        onReassign={() => handleReassign(assignment)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          // Show flat list for single trainer
          <Card>
            <CardContent>
              <div className="space-y-3">
                {filteredAssignments.map((assignment) => (
                  <AssignmentRow
                    key={assignment.id}
                    assignment={assignment}
                    isExpanded={expandedAssignment === assignment.id}
                    onToggle={() =>
                      setExpandedAssignment(
                        expandedAssignment === assignment.id ? null : assignment.id
                      )
                    }
                    onReassign={() => handleReassign(assignment)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <Card className="text-center py-12">
          <Target size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No assignments found</h3>
          <p className="text-surface-400">
            {searchQuery || trainerFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first assignment'}
          </p>
        </Card>
      )}

      {/* Reassign Modal */}
      <Modal
        isOpen={showReassignModal}
        onClose={() => {
          setShowReassignModal(false);
          setSelectedAssignment(null);
        }}
        title="Reassign Dog"
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50">
              <Avatar name={selectedAssignment.dog.name} size="md" />
              <div>
                <p className="font-medium text-white">{selectedAssignment.dog.name}</p>
                <p className="text-sm text-surface-500">{selectedAssignment.dog.breed}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-surface-400">
              <span>Currently assigned to:</span>
              <span className="text-white">{selectedAssignment.trainer.name}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Reassign to:
              </label>
              <select className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none">
                {trainers
                  .filter((t) => t.id !== selectedAssignment.trainer.id)
                  .map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name} ({trainer.dogsAssigned} current dogs)
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Reason for reassignment (optional)
              </label>
              <textarea
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none resize-none"
                rows={3}
                placeholder="Enter reason..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedAssignment(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" leftIcon={<Shuffle size={16} />}>
                Reassign
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AssignmentRow({
  assignment,
  isExpanded,
  onToggle,
  onReassign,
}: {
  assignment: typeof demoAssignments[0];
  isExpanded: boolean;
  onToggle: () => void;
  onReassign: () => void;
}) {
  return (
    <div className="rounded-xl bg-surface-800/50 overflow-hidden">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-800 transition-colors"
        onClick={onToggle}
      >
        <Avatar name={assignment.dog.name} size="md" src={assignment.dog.photo_url} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{assignment.dog.name}</p>
            <StatusBadge variant="success" size="xs">Active</StatusBadge>
          </div>
          <p className="text-sm text-surface-500">{assignment.dog.breed}</p>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="hidden md:block">
            <p className="text-surface-500">Program</p>
            <p className="text-white">{assignment.program.name}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-surface-500">Progress</p>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-surface-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${assignment.progress}%` }}
                />
              </div>
              <span className="text-white">{assignment.progress}%</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <p className="text-surface-500">End Date</p>
            <p className="text-white">{formatDate(assignment.endDate)}</p>
          </div>
        </div>

        <Button variant="ghost" size="icon-sm">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-surface-700">
          <div className="pt-4 grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-surface-500 mb-1">Program</p>
              <p className="text-sm text-white">{assignment.program.name}</p>
            </div>
            <div>
              <p className="text-xs text-surface-500 mb-1">Duration</p>
              <p className="text-sm text-white">
                {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-surface-500 mb-1">Trainer</p>
              <p className="text-sm text-white">{assignment.trainer.name}</p>
            </div>
          </div>

          {assignment.notes && (
            <div className="mt-4">
              <p className="text-xs text-surface-500 mb-1">Notes</p>
              <p className="text-sm text-surface-300">{assignment.notes}</p>
            </div>
          )}

          <div className="flex gap-2 mt-4 pt-4 border-t border-surface-700">
            <Button variant="outline" size="sm" leftIcon={<Edit size={14} />}>
              Edit Assignment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Shuffle size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onReassign();
              }}
            >
              Reassign
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
