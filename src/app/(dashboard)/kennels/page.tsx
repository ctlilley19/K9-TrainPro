'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate, cn } from '@/lib/utils';
import {
  useKennels,
  useCreateKennel,
  useUpdateKennel,
  useUpdateKennelStatus,
  useDeleteKennel,
  useAssignDogToKennel,
  useReleaseDogFromKennel,
  useDogs,
} from '@/hooks';
import type { KennelWithAssignment, KennelStatus, KennelSize, Dog } from '@/types/database';
import {
  Grid3X3,
  Plus,
  Search,
  Edit,
  Trash2,
  QrCode,
  Dog as DogIcon,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Calendar,
  User,
  ArrowRightLeft,
  MoreVertical,
  Download,
  Eye,
  Sparkles,
  Droplets,
  Thermometer,
  Camera,
  Sun,
} from 'lucide-react';

const statusColors: Record<KennelStatus, { bg: string; text: string; label: string }> = {
  available: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Available' },
  occupied: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Occupied' },
  cleaning: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Cleaning' },
  maintenance: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Maintenance' },
  reserved: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Reserved' },
};

const sizeLabels: Record<KennelSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  extra_large: 'XL',
};

const featureIcons: Record<string, React.ReactNode> = {
  outdoor_access: <Sun size={14} />,
  climate_controlled: <Thermometer size={14} />,
  camera: <Camera size={14} />,
  puppy_safe: <Sparkles size={14} />,
  elevated_bed: <Grid3X3 size={14} />,
  water_auto: <Droplets size={14} />,
};

export default function KennelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<KennelStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingKennel, setEditingKennel] = useState<KennelWithAssignment | null>(null);
  const [selectedKennel, setSelectedKennel] = useState<KennelWithAssignment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: 'medium' as KennelSize,
    features: [] as string[],
    notes: '',
  });

  const { data: kennels = [], isLoading } = useKennels();
  const { data: dogs = [] } = useDogs();
  const createKennel = useCreateKennel();
  const updateKennel = useUpdateKennel();
  const updateKennelStatus = useUpdateKennelStatus();
  const deleteKennel = useDeleteKennel();
  const assignDog = useAssignDogToKennel();
  const releaseDog = useReleaseDogFromKennel();

  // Filter kennels
  const filteredKennels = useMemo(() => {
    return kennels.filter((kennel) => {
      const matchesSearch =
        kennel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kennel.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kennel.current_assignment?.dog.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || kennel.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [kennels, searchQuery, statusFilter]);

  // Group by location
  const groupedKennels = useMemo(() => {
    const groups: Record<string, KennelWithAssignment[]> = {};
    filteredKennels.forEach((kennel) => {
      const location = kennel.location || 'Other';
      if (!groups[location]) groups[location] = [];
      groups[location].push(kennel);
    });
    return groups;
  }, [filteredKennels]);

  // Stats
  const stats = useMemo(() => ({
    total: kennels.length,
    available: kennels.filter((k) => k.status === 'available').length,
    occupied: kennels.filter((k) => k.status === 'occupied').length,
    cleaning: kennels.filter((k) => k.status === 'cleaning').length,
    maintenance: kennels.filter((k) => k.status === 'maintenance').length,
  }), [kennels]);

  // Available dogs (not currently assigned to a kennel)
  const availableDogs = useMemo(() => {
    const assignedDogIds = new Set(
      kennels
        .filter((k) => k.current_assignment)
        .map((k) => k.current_assignment!.dog_id)
    );
    return dogs.filter((d) => !assignedDogIds.has(d.id));
  }, [dogs, kennels]);

  const handleCreateKennel = async () => {
    await createKennel.mutateAsync({
      name: formData.name,
      location: formData.location || null,
      size: formData.size,
      status: 'available',
      features: formData.features.length > 0 ? formData.features : null,
      notes: formData.notes || null,
      qr_code_url: null,
      display_order: kennels.length,
      is_active: true,
    });
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateKennel = async () => {
    if (!editingKennel) return;
    await updateKennel.mutateAsync({
      id: editingKennel.id,
      data: {
        name: formData.name,
        location: formData.location || null,
        size: formData.size,
        features: formData.features.length > 0 ? formData.features : null,
        notes: formData.notes || null,
      },
    });
    setEditingKennel(null);
    resetForm();
  };

  const handleAssignDog = async (dogId: string) => {
    if (!selectedKennel) return;
    await assignDog.mutateAsync({
      kennelId: selectedKennel.id,
      dogId,
    });
    setShowAssignModal(false);
    setSelectedKennel(null);
  };

  const handleReleaseDog = async (kennel: KennelWithAssignment) => {
    if (!kennel.current_assignment) return;
    await releaseDog.mutateAsync(kennel.current_assignment.id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      size: 'medium',
      features: [],
      notes: '',
    });
  };

  const openEditModal = (kennel: KennelWithAssignment) => {
    setEditingKennel(kennel);
    setFormData({
      name: kennel.name,
      location: kennel.location || '',
      size: kennel.size,
      features: kennel.features || [],
      notes: kennel.notes || '',
    });
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const getQRCodeUrl = (kennelId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/kennel/${kennelId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Kennel Management"
        description="Manage kennels, assignments, and generate QR codes"
        icon={<Grid3X3 className="text-brand-400" size={24} />}
        action={
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Kennel
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-surface-800/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-sm text-surface-400">Total Kennels</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.available}</p>
            <p className="text-sm text-green-400/70">Available</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.occupied}</p>
            <p className="text-sm text-blue-400/70">Occupied</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.cleaning}</p>
            <p className="text-sm text-yellow-400/70">Cleaning</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.maintenance}</p>
            <p className="text-sm text-red-400/70">Maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search kennels or dogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as KennelStatus | 'all')}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </Card>

      {/* Kennels Grid by Location */}
      {Object.entries(groupedKennels).map(([location, locationKennels]) => (
        <div key={location} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-surface-400" />
            <h2 className="text-lg font-semibold text-white">{location}</h2>
            <span className="text-sm text-surface-500">({locationKennels.length} kennels)</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {locationKennels.map((kennel) => (
              <KennelCard
                key={kennel.id}
                kennel={kennel}
                onEdit={() => openEditModal(kennel)}
                onShowQR={() => {
                  setSelectedKennel(kennel);
                  setShowQRModal(true);
                }}
                onAssign={() => {
                  setSelectedKennel(kennel);
                  setShowAssignModal(true);
                }}
                onRelease={() => handleReleaseDog(kennel)}
                onStatusChange={(status) => updateKennelStatus.mutate({ id: kennel.id, status })}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {filteredKennels.length === 0 && (
        <Card className="text-center py-12">
          <Grid3X3 size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No kennels found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first kennel to get started'}
          </p>
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
            Add Kennel
          </Button>
        </Card>
      )}

      {/* Add/Edit Kennel Modal */}
      <Modal
        isOpen={showAddModal || !!editingKennel}
        onClose={() => {
          setShowAddModal(false);
          setEditingKennel(null);
          resetForm();
        }}
        title={editingKennel ? 'Edit Kennel' : 'Add New Kennel'}
      >
        <div className="space-y-4">
          <Input
            label="Kennel Name"
            placeholder="e.g., K-101"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Location"
            placeholder="e.g., Building A - Ground Floor"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Size</label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value as KennelSize })}
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="small">Small (up to 20 lbs)</option>
              <option value="medium">Medium (20-50 lbs)</option>
              <option value="large">Large (50-80 lbs)</option>
              <option value="extra_large">Extra Large (80+ lbs)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Features</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(featureIcons).map(([feature, icon]) => (
                <button
                  key={feature}
                  onClick={() => toggleFeature(feature)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all',
                    formData.features.includes(feature)
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : 'border-surface-700 text-surface-400 hover:border-surface-600'
                  )}
                >
                  {icon}
                  {feature.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Any special notes about this kennel..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowAddModal(false);
                setEditingKennel(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={editingKennel ? handleUpdateKennel : handleCreateKennel}
              disabled={!formData.name}
            >
              {editingKennel ? 'Save Changes' : 'Add Kennel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedKennel(null);
        }}
        title={`QR Code - ${selectedKennel?.name}`}
      >
        {selectedKennel && (
          <div className="text-center space-y-4">
            <div className="bg-white p-6 rounded-xl inline-block">
              <div className="w-48 h-48 bg-surface-200 rounded flex items-center justify-center">
                <QrCode size={160} className="text-surface-900" />
              </div>
            </div>
            <p className="text-sm text-surface-400 break-all">
              {getQRCodeUrl(selectedKennel.id)}
            </p>
            <p className="text-sm text-surface-500">
              Scan this QR code to quickly access {selectedKennel.name} and log activities
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" leftIcon={<Download size={16} />}>
                Download PNG
              </Button>
              <Button variant="primary" className="flex-1" leftIcon={<Eye size={16} />}>
                Print Labels
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Dog Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedKennel(null);
        }}
        title={`Assign Dog to ${selectedKennel?.name}`}
      >
        {selectedKennel && (
          <div className="space-y-4">
            {availableDogs.length === 0 ? (
              <div className="text-center py-8">
                <DogIcon size={48} className="mx-auto text-surface-600 mb-4" />
                <p className="text-surface-400">All dogs are currently assigned to kennels</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableDogs.map((dog) => (
                  <button
                    key={dog.id}
                    onClick={() => handleAssignDog(dog.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
                  >
                    <Avatar name={dog.name} size="md" src={dog.photo_url} />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{dog.name}</p>
                      <p className="text-sm text-surface-400">{dog.breed}</p>
                    </div>
                    <Plus size={20} className="text-surface-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// Kennel Card Component
function KennelCard({
  kennel,
  onEdit,
  onShowQR,
  onAssign,
  onRelease,
  onStatusChange,
}: {
  kennel: KennelWithAssignment;
  onEdit: () => void;
  onShowQR: () => void;
  onAssign: () => void;
  onRelease: () => void;
  onStatusChange: (status: KennelStatus) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const status = statusColors[kennel.status];

  return (
    <Card className="relative overflow-hidden">
      {/* Status stripe */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', status.bg.replace('/10', ''))} />

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white text-lg">{kennel.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge
                variant={
                  kennel.status === 'available' ? 'success' :
                  kennel.status === 'occupied' ? 'info' :
                  kennel.status === 'cleaning' ? 'warning' :
                  'danger'
                }
                size="xs"
              >
                {status.label}
              </StatusBadge>
              <span className="text-xs text-surface-500">{sizeLabels[kennel.size]}</span>
            </div>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical size={16} />
            </Button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface-800 border border-surface-700 rounded-lg shadow-xl z-50 py-1">
                  <button
                    onClick={() => { onShowQR(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-white hover:bg-surface-700"
                  >
                    <QrCode size={14} />
                    View QR Code
                  </button>
                  <button
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-white hover:bg-surface-700"
                  >
                    <Edit size={14} />
                    Edit Kennel
                  </button>
                  <div className="border-t border-surface-700 my-1" />
                  <button
                    onClick={() => { onStatusChange('available'); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-surface-700"
                  >
                    <CheckCircle size={14} />
                    Mark Available
                  </button>
                  <button
                    onClick={() => { onStatusChange('cleaning'); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-surface-700"
                  >
                    <Sparkles size={14} />
                    Mark Cleaning
                  </button>
                  <button
                    onClick={() => { onStatusChange('maintenance'); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-surface-700"
                  >
                    <Wrench size={14} />
                    Mark Maintenance
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        {kennel.features && kennel.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {kennel.features.map((feature) => (
              <span
                key={feature}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-800 text-xs text-surface-400"
                title={feature.replace(/_/g, ' ')}
              >
                {featureIcons[feature]}
              </span>
            ))}
          </div>
        )}

        {/* Current Dog */}
        {kennel.current_assignment ? (
          <div className="p-3 rounded-lg bg-surface-800/50 mb-3">
            <div className="flex items-center gap-3">
              <Avatar
                name={kennel.current_assignment.dog.name}
                size="md"
                src={kennel.current_assignment.dog.photo_url}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  {kennel.current_assignment.dog.name}
                </p>
                <p className="text-xs text-surface-400 truncate">
                  {kennel.current_assignment.dog.breed}
                </p>
              </div>
            </div>
            {kennel.current_assignment.notes && (
              <p className="mt-2 text-xs text-surface-400 line-clamp-2">
                {kennel.current_assignment.notes}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-surface-500">
              <Clock size={12} />
              <span>Since {formatDate(kennel.current_assignment.assigned_at)}</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-surface-800/30 border border-dashed border-surface-700 mb-3 text-center">
            <p className="text-sm text-surface-500">No dog assigned</p>
          </div>
        )}

        {/* Notes */}
        {kennel.notes && (
          <p className="text-xs text-surface-500 mb-3 line-clamp-2">{kennel.notes}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {kennel.status === 'available' && !kennel.current_assignment ? (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              leftIcon={<DogIcon size={14} />}
              onClick={onAssign}
            >
              Assign Dog
            </Button>
          ) : kennel.current_assignment ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              leftIcon={<ArrowRightLeft size={14} />}
              onClick={onRelease}
            >
              Release
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              leftIcon={<CheckCircle size={14} />}
              onClick={() => onStatusChange('available')}
            >
              Mark Ready
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowQR}
          >
            <QrCode size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
