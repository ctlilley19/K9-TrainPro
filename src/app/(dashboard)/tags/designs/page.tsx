'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { TagDesigner, type TagDesign } from '@/components/tags';
import { useFacility, useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  Palette,
  Plus,
  Trash2,
  Edit2,
  Star,
  Check,
  Loader2,
  Lock,
  ArrowLeft,
  ImageIcon,
} from 'lucide-react';

interface DesignTemplate {
  id: string;
  name: string;
  design_type: string;
  front_image_url: string | null;
  back_image_url: string | null;
  is_default: boolean;
  created_at: string;
}

const BUSINESS_TIERS = ['professional', 'enterprise'];

export default function TagDesignsPage() {
  const facility = useFacility();
  const user = useAuthStore((s) => s.user);
  const [designs, setDesigns] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDesigner, setShowDesigner] = useState(false);
  const [editingDesign, setEditingDesign] = useState<DesignTemplate | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const hasCustomDesignAccess = facility?.subscription_tier &&
    BUSINESS_TIERS.includes(facility.subscription_tier);

  useEffect(() => {
    if (facility?.id) {
      fetchDesigns();
    }
  }, [facility?.id]);

  async function fetchDesigns() {
    if (!facility?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/tags/designs?facilityId=${facility.id}`);
      const data = await response.json();

      if (data.designs) {
        setDesigns(data.designs);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDesign(design: TagDesign) {
    if (!facility?.id || !user?.id) return;

    try {
      const method = design.id ? 'PATCH' : 'POST';
      const url = design.id ? `/api/tags/designs/${design.id}` : '/api/tags/designs';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          userId: user.id,
          name: design.name,
          designType: design.productType,
          frontImageUrl: design.frontImageUrl,
          backImageUrl: design.backImageUrl,
          isDefault: false,
        }),
      });

      if (response.ok) {
        await fetchDesigns();
        setShowDesigner(false);
        setEditingDesign(null);
      }
    } catch (error) {
      console.error('Error saving design:', error);
    }
  }

  async function handleSetDefault(designId: string) {
    if (!facility?.id) return;
    setActionLoading(designId);

    try {
      const response = await fetch(`/api/tags/designs/${designId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDefault: true,
          facilityId: facility.id,
        }),
      });

      if (response.ok) {
        await fetchDesigns();
      }
    } catch (error) {
      console.error('Error setting default:', error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteDesign(designId: string) {
    setActionLoading(designId);

    try {
      const response = await fetch(`/api/tags/designs/${designId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDesigns();
        setDeleteConfirm(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete design');
      }
    } catch (error) {
      console.error('Error deleting design:', error);
    } finally {
      setActionLoading(null);
    }
  }

  function handleEditDesign(template: DesignTemplate) {
    setEditingDesign(template);
    setShowDesigner(true);
  }

  function convertTemplateToDesign(template: DesignTemplate): TagDesign {
    return {
      id: template.id,
      name: template.name,
      frontImageUrl: template.front_image_url,
      backImageUrl: template.back_image_url,
      productType: template.design_type as 'single_sided' | 'double_sided',
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      businessName: '',
      showBusinessName: false,
      layout: 'logo_centered',
    };
  }

  // Show upgrade message if not on business tier
  if (!hasCustomDesignAccess) {
    return (
      <div>
        <PageHeader
          title="Custom Tag Designs"
          description="Create branded tag designs for your business"
        />
        <Card className="text-center py-12">
          <Lock size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Business Feature</h3>
          <p className="text-surface-400 mb-6 max-w-md mx-auto">
            Custom tag designs with your business logo are available on Professional
            and Enterprise plans. Upgrade to create branded tags for your clients.
          </p>
          <Link href="/settings/billing">
            <Button variant="primary">
              View Plans
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Show designer in full-screen mode
  if (showDesigner) {
    return (
      <div>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              setShowDesigner(false);
              setEditingDesign(null);
            }}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Designs
          </Button>
        </div>
        <PageHeader
          title={editingDesign ? 'Edit Design' : 'Create New Design'}
          description="Design your custom tag with your business logo"
        />
        <TagDesigner
          onSave={handleSaveDesign}
          onCancel={() => {
            setShowDesigner(false);
            setEditingDesign(null);
          }}
          initialDesign={editingDesign ? convertTemplateToDesign(editingDesign) : undefined}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Custom Tag Designs"
        description="Create and manage branded tag designs"
        action={
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowDesigner(true)}
          >
            New Design
          </Button>
        }
      />

      {loading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          </div>
        </Card>
      ) : designs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <Card key={design.id} className="overflow-hidden hover:border-brand-500/30 transition-all">
              {/* Design Preview */}
              <div className="aspect-square bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center p-6">
                {design.front_image_url ? (
                  <div className="w-32 h-32 rounded-full border-4 border-surface-600 bg-surface-800 overflow-hidden relative">
                    <Image
                      src={design.front_image_url}
                      alt={design.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-surface-600 bg-surface-800 flex items-center justify-center">
                    <ImageIcon size={40} className="text-surface-600" />
                  </div>
                )}
              </div>

              {/* Design Info */}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-white">{design.name}</h3>
                    <p className="text-sm text-surface-400 capitalize">
                      {design.design_type.replace('_', ' ')}
                    </p>
                  </div>
                  {design.is_default && (
                    <StatusBadge variant="success" size="xs">
                      <Star size={12} className="mr-1" />
                      Default
                    </StatusBadge>
                  )}
                </div>

                <p className="text-xs text-surface-500 mb-4">
                  Created {new Date(design.created_at).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditDesign(design)}
                    leftIcon={<Edit2 size={14} />}
                  >
                    Edit
                  </Button>

                  {!design.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(design.id)}
                      isLoading={actionLoading === design.id}
                      leftIcon={<Star size={14} />}
                      title="Set as default"
                    />
                  )}

                  {deleteConfirm === design.id ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDesign(design.id)}
                        isLoading={actionLoading === design.id}
                        className="text-red-400 hover:text-red-300"
                      >
                        Confirm
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(design.id)}
                      leftIcon={<Trash2 size={14} />}
                      className="text-red-400 hover:text-red-300"
                      title="Delete design"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Palette size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No designs yet</h3>
          <p className="text-surface-400 mb-6">
            Create your first custom tag design with your business logo
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowDesigner(true)}
          >
            Create Design
          </Button>
        </Card>
      )}

      {/* Link to order page */}
      {designs.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-surface-400 mb-2">Ready to order tags with your custom design?</p>
          <Link href="/tags/order">
            <Button variant="outline">
              Order Tags
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
