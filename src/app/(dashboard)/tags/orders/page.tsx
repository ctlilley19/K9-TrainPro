'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { useFacility } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  Package,
  Truck,
  Check,
  Clock,
  Search,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Tag,
  X,
  CreditCard,
} from 'lucide-react';

interface TagOrder {
  id: string;
  order_number: string;
  status: string;
  quantity: number;
  design_type: string;
  product_type: string;
  unit_price: number;
  total_amount: number;
  shipping_name: string;
  shipping_company: string | null;
  shipping_city: string;
  shipping_state: string;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  tags?: { id: string; tag_code: string; status: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending Payment', variant: 'warning', icon: <CreditCard size={14} /> },
  paid: { label: 'Paid', variant: 'info', icon: <Check size={14} /> },
  sent_to_vendor: { label: 'In Production', variant: 'info', icon: <Package size={14} /> },
  shipped: { label: 'Shipped', variant: 'info', icon: <Truck size={14} /> },
  delivered: { label: 'Delivered', variant: 'success', icon: <Check size={14} /> },
  canceled: { label: 'Canceled', variant: 'error', icon: <X size={14} /> },
};

export default function TagOrdersPage() {
  const facility = useFacility();
  const [orders, setOrders] = useState<TagOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showShipModal, setShowShipModal] = useState<string | null>(null);
  const [trackingForm, setTrackingForm] = useState({
    trackingNumber: '',
    carrier: 'usps',
    trackingUrl: '',
  });

  useEffect(() => {
    if (facility?.id) {
      fetchOrders();
    }
  }, [facility?.id]);

  async function fetchOrders() {
    if (!facility?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/tags/orders?facilityId=${facility.id}`);
      const data = await response.json();

      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkShipped(orderId: string) {
    if (!trackingForm.trackingNumber || !trackingForm.carrier) {
      alert('Please enter tracking number and carrier');
      return;
    }

    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/tags/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_shipped',
          trackingNumber: trackingForm.trackingNumber,
          carrier: trackingForm.carrier,
          trackingUrl: trackingForm.trackingUrl || undefined,
        }),
      });

      if (response.ok) {
        await fetchOrders();
        setShowShipModal(null);
        setTrackingForm({ trackingNumber: '', carrier: 'usps', trackingUrl: '' });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkDelivered(orderId: string) {
    if (!confirm('Mark this order as delivered? This will make the tags available for assignment.')) {
      return;
    }

    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/tags/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_delivered' }),
      });

      if (response.ok) {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.tracking_number && order.tracking_number.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => ['pending', 'paid', 'sent_to_vendor'].includes(o.status)).length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  return (
    <div>
      <PageHeader
        title="Tag Orders"
        description="View and manage your NFC tag orders"
        breadcrumbs={[{ label: 'Tags', href: '/tags' }, { label: 'Orders' }]}
        action={
          <Link href="/tags/order">
            <Button variant="primary" leftIcon={<Package size={16} />}>
              New Order
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Package size={20} className="text-brand-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Total Orders</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Processing</p>
              <p className="text-xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Truck size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Shipped</p>
              <p className="text-xl font-bold text-white">{stats.shipped}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Check size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Delivered</p>
              <p className="text-xl font-bold text-white">{stats.delivered}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by order #, name, or tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="sent_to_vendor">In Production</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {loading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          </div>
        </Card>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedOrder === order.id;

            return (
              <Card key={order.id} className="overflow-hidden">
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center">
                      <Package size={24} className="text-brand-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-brand-400">
                          #{order.order_number}
                        </span>
                        <StatusBadge
                          variant={statusConfig.variant as 'success' | 'warning' | 'error' | 'info' | 'default'}
                          size="xs"
                        >
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </StatusBadge>
                      </div>
                      <p className="text-sm text-surface-400">
                        {order.quantity} × {order.design_type === 'custom' ? 'Custom' : 'Default'} Tags
                        <span className="mx-2">•</span>
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-white">
                      ${(order.total_amount / 100).toFixed(2)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-surface-400" />
                    ) : (
                      <ChevronDown size={20} className="text-surface-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-surface-700 p-4 bg-surface-800/30">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Shipping Info */}
                      <div>
                        <h4 className="text-sm font-medium text-surface-300 mb-3 flex items-center gap-2">
                          <MapPin size={14} />
                          Shipping To
                        </h4>
                        <div className="text-surface-400 text-sm">
                          <p className="text-white font-medium">{order.shipping_name}</p>
                          {order.shipping_company && <p>{order.shipping_company}</p>}
                          <p>{order.shipping_city}, {order.shipping_state}</p>
                        </div>
                      </div>

                      {/* Tracking Info */}
                      <div>
                        <h4 className="text-sm font-medium text-surface-300 mb-3 flex items-center gap-2">
                          <Truck size={14} />
                          Tracking
                        </h4>
                        {order.tracking_number ? (
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="text-surface-400">Carrier:</span>{' '}
                              <span className="text-white uppercase">{order.carrier}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-surface-400">Tracking #:</span>{' '}
                              <span className="text-white font-mono">{order.tracking_number}</span>
                            </p>
                            {order.tracking_url && (
                              <a
                                href={order.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300"
                              >
                                <ExternalLink size={12} />
                                Track Package
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-surface-500">No tracking info yet</p>
                        )}
                      </div>
                    </div>

                    {/* Tags in Order */}
                    {order.tags && order.tags.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-surface-700">
                        <h4 className="text-sm font-medium text-surface-300 mb-3 flex items-center gap-2">
                          <Tag size={14} />
                          Tags in Order ({order.tags.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {order.tags.slice(0, 10).map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 bg-surface-800 rounded text-xs font-mono text-surface-300"
                            >
                              {tag.tag_code}
                            </span>
                          ))}
                          {order.tags.length > 10 && (
                            <span className="px-2 py-1 text-xs text-surface-500">
                              +{order.tags.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t border-surface-700 flex justify-end gap-3">
                      {order.status === 'sent_to_vendor' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowShipModal(order.id)}
                          leftIcon={<Truck size={14} />}
                        >
                          Mark Shipped
                        </Button>
                      )}

                      {order.status === 'shipped' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleMarkDelivered(order.id)}
                          isLoading={actionLoading === order.id}
                          leftIcon={<Check size={14} />}
                        >
                          Mark Delivered
                        </Button>
                      )}

                      {order.tracking_url && (
                        <a
                          href={order.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" leftIcon={<ExternalLink size={14} />}>
                            Track Package
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Package size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Place your first tag order'}
          </p>
          <Link href="/tags/order">
            <Button variant="primary" leftIcon={<Package size={16} />}>
              Order Tags
            </Button>
          </Link>
        </Card>
      )}

      {/* Ship Modal */}
      {showShipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader
              title="Add Tracking Information"
              action={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowShipModal(null)}
                >
                  <X size={16} />
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Carrier
                  </label>
                  <select
                    value={trackingForm.carrier}
                    onChange={(e) =>
                      setTrackingForm((prev) => ({ ...prev, carrier: e.target.value }))
                    }
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="usps">USPS</option>
                    <option value="ups">UPS</option>
                    <option value="fedex">FedEx</option>
                    <option value="dhl">DHL</option>
                  </select>
                </div>

                <Input
                  label="Tracking Number"
                  value={trackingForm.trackingNumber}
                  onChange={(e) =>
                    setTrackingForm((prev) => ({ ...prev, trackingNumber: e.target.value }))
                  }
                  placeholder="Enter tracking number"
                />

                <Input
                  label="Tracking URL (optional)"
                  value={trackingForm.trackingUrl}
                  onChange={(e) =>
                    setTrackingForm((prev) => ({ ...prev, trackingUrl: e.target.value }))
                  }
                  placeholder="Auto-generated if left empty"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowShipModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleMarkShipped(showShipModal)}
                  isLoading={actionLoading === showShipModal}
                  leftIcon={<Truck size={14} />}
                >
                  Mark Shipped
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
