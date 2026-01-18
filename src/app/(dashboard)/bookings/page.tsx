'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { bookingTypes } from '@/services/supabase/bookings';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Check,
  X,
  User,
  Phone,
  Mail,
  Dog,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

// Mock bookings
const mockBookings = [
  {
    id: '1',
    type: 'consultation' as const,
    status: 'pending' as const,
    date: '2025-01-14',
    start_time: '10:00',
    end_time: '10:30',
    contact_name: 'John Smith',
    contact_email: 'john@email.com',
    contact_phone: '(301) 555-1234',
    dog_name: 'Buddy',
    dog_breed: 'Labrador Retriever',
    dog_age: '1-3 years',
    goals: 'Basic obedience training, leash walking',
    source: 'website',
    created_at: '2025-01-13T10:00:00Z',
  },
  {
    id: '2',
    type: 'evaluation' as const,
    status: 'confirmed' as const,
    date: '2025-01-14',
    start_time: '14:00',
    end_time: '15:00',
    contact_name: 'Sarah Johnson',
    contact_email: 'sarah@email.com',
    contact_phone: '(301) 555-5678',
    dog_name: 'Rex',
    dog_breed: 'German Shepherd',
    dog_age: '3-7 years',
    goals: 'Aggression management, socialization',
    source: 'referral',
    created_at: '2025-01-12T15:00:00Z',
  },
  {
    id: '3',
    type: 'training' as const,
    status: 'confirmed' as const,
    date: '2025-01-15',
    start_time: '09:00',
    end_time: '10:00',
    contact_name: 'Mike Davis',
    contact_email: 'mike@email.com',
    contact_phone: '(301) 555-9012',
    dog_name: 'Cooper',
    dog_breed: 'Golden Retriever',
    dog_age: '6m-1y',
    goals: 'Puppy foundation training',
    source: 'google',
    created_at: '2025-01-11T09:00:00Z',
  },
  {
    id: '4',
    type: 'board_train' as const,
    status: 'pending' as const,
    date: '2025-01-16',
    start_time: '08:00',
    end_time: '09:30',
    contact_name: 'Emily Wilson',
    contact_email: 'emily@email.com',
    contact_phone: '(301) 555-3456',
    dog_name: 'Luna',
    dog_breed: 'Border Collie',
    dog_age: '1-3 years',
    goals: '4-week board and train program',
    source: 'social',
    created_at: '2025-01-10T14:00:00Z',
  },
];

const statusColors = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'info',
} as const;

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<typeof mockBookings[0] | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.dog_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Group bookings by date
  const bookingsByDate = filteredBookings.reduce((acc, booking) => {
    if (!acc[booking.date]) {
      acc[booking.date] = [];
    }
    acc[booking.date].push(booking);
    return acc;
  }, {} as Record<string, typeof mockBookings>);

  const pendingCount = mockBookings.filter((b) => b.status === 'pending').length;
  const todayCount = mockBookings.filter(
    (b) => b.date === new Date().toISOString().split('T')[0]
  ).length;

  const handleConfirm = (booking: typeof mockBookings[0]) => {
    console.log('Confirming booking:', booking.id);
    // In real app, this would call bookingsService.confirmBooking
  };

  const handleCancel = (booking: typeof mockBookings[0]) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      console.log('Cancelling booking:', booking.id);
      // In real app, this would call bookingsService.cancelBooking
    }
  };

  const openDetail = (booking: typeof mockBookings[0]) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  return (
    <div>
      <PageHeader
        title="Bookings"
        description={`${pendingCount} pending, ${todayCount} today`}
        action={
          <div className="flex gap-2">
            <Link href="/book" target="_blank">
              <Button variant="outline" leftIcon={<ExternalLink size={16} />}>
                View Booking Page
              </Button>
            </Link>
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Add Booking
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-yellow-400">{pendingCount}</div>
          <div className="text-sm text-surface-400">Pending</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-green-400">
            {mockBookings.filter((b) => b.status === 'confirmed').length}
          </div>
          <div className="text-sm text-surface-400">Confirmed</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-brand-400">
            {mockBookings.filter((b) => b.type === 'consultation').length}
          </div>
          <div className="text-sm text-surface-400">Consultations</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-purple-400">
            {mockBookings.filter((b) => b.type === 'evaluation').length}
          </div>
          <div className="text-sm text-surface-400">Evaluations</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by name or dog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-surface-400" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      <div className="space-y-6">
        {Object.entries(bookingsByDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, bookings]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-surface-400 mb-3">
                {formatDate(date, 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const typeInfo = bookingTypes[booking.type];
                  return (
                    <Card
                      key={booking.id}
                      className="hover:border-brand-500/30 transition-all cursor-pointer"
                      variant="bordered"
                      onClick={() => openDetail(booking)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 text-center">
                            <p className="text-lg font-bold text-white">
                              {booking.start_time}
                            </p>
                            <p className="text-xs text-surface-500">
                              {typeInfo.duration} min
                            </p>
                          </div>
                          <div className="h-12 w-px bg-surface-700" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white">
                                {booking.contact_name}
                              </h3>
                              <StatusBadge
                                variant={statusColors[booking.status]}
                                size="xs"
                              >
                                {booking.status}
                              </StatusBadge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-surface-400">
                              <span className="flex items-center gap-1">
                                <Dog size={14} />
                                {booking.dog_name} ({booking.dog_breed})
                              </span>
                            </div>
                            <p className="text-sm text-brand-400 mt-1">
                              {typeInfo.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<Check size={14} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirm(booking);
                                }}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<X size={14} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancel(booking);
                                }}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Empty State */}
      {Object.keys(bookingsByDate).length === 0 && (
        <Card className="text-center py-12">
          <Calendar size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No bookings found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery || statusFilter !== 'all' || dateFilter
              ? 'Try adjusting your filters'
              : 'Share your booking page to start receiving appointments'}
          </p>
          <Link href="/book" target="_blank">
            <Button variant="primary" leftIcon={<ExternalLink size={16} />}>
              View Booking Page
            </Button>
          </Link>
        </Card>
      )}

      {/* Booking Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        size="lg"
        raw
      >
        {selectedBooking && (
          <>
            <ModalHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Booking Details
                  </h2>
                  <p className="text-sm text-surface-400">
                    {bookingTypes[selectedBooking.type].name}
                  </p>
                </div>
                <StatusBadge variant={statusColors[selectedBooking.status]}>
                  {selectedBooking.status}
                </StatusBadge>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Date & Time */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <Calendar size={24} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {formatDate(selectedBooking.date, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-surface-400">
                      {selectedBooking.start_time} - {selectedBooking.end_time} (
                      {bookingTypes[selectedBooking.type].duration} min)
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-medium text-surface-400 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-surface-500" />
                      <span className="text-white">{selectedBooking.contact_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-surface-500" />
                      <a
                        href={`mailto:${selectedBooking.contact_email}`}
                        className="text-brand-400 hover:text-brand-300"
                      >
                        {selectedBooking.contact_email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-surface-500" />
                      <a
                        href={`tel:${selectedBooking.contact_phone}`}
                        className="text-brand-400 hover:text-brand-300"
                      >
                        {selectedBooking.contact_phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Dog Info */}
                <div>
                  <h3 className="text-sm font-medium text-surface-400 mb-3">
                    Dog Information
                  </h3>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50">
                    <Avatar name={selectedBooking.dog_name} size="lg" />
                    <div>
                      <p className="font-medium text-white">
                        {selectedBooking.dog_name}
                      </p>
                      <p className="text-sm text-surface-400">
                        {selectedBooking.dog_breed} • {selectedBooking.dog_age}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Goals */}
                {selectedBooking.goals && (
                  <div>
                    <h3 className="text-sm font-medium text-surface-400 mb-2">
                      Training Goals
                    </h3>
                    <p className="text-white">{selectedBooking.goals}</p>
                  </div>
                )}

                {/* Source */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Source</span>
                  <span className="text-white capitalize">{selectedBooking.source}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Booked on</span>
                  <span className="text-white">
                    {formatDate(selectedBooking.created_at, 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="flex gap-2">
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button
                      variant="ghost"
                      leftIcon={<X size={16} />}
                      onClick={() => {
                        handleCancel(selectedBooking);
                        setShowDetailModal(false);
                      }}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      leftIcon={<Check size={16} />}
                      onClick={() => {
                        handleConfirm(selectedBooking);
                        setShowDetailModal(false);
                      }}
                    >
                      Confirm Booking
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <>
                    <Button
                      variant="outline"
                      leftIcon={<MessageSquare size={16} />}
                      onClick={() => {
                        // Navigate to messages
                        setShowDetailModal(false);
                      }}
                    >
                      Send Message
                    </Button>
                    <Button
                      variant="ghost"
                      leftIcon={<X size={16} />}
                      onClick={() => {
                        handleCancel(selectedBooking);
                        setShowDetailModal(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
