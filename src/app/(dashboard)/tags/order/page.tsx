'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFacility, useUser } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  Tag,
  Package,
  Truck,
  CreditCard,
  Check,
  Minus,
  Plus,
  Info,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface PricingTier {
  minQuantity: number;
  maxQuantity: number | null;
  unitPrice: number;
  displayPrice: string;
}

export default function OrderTagsPage() {
  const router = useRouter();
  const facility = useFacility();
  const user = useUser();

  const [quantity, setQuantity] = useState(10);
  const [designType, setDesignType] = useState<'default' | 'custom'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [pricing, setPricing] = useState<{
    default: PricingTier[];
    custom: PricingTier[];
  } | null>(null);

  // Shipping form
  const [shipping, setShipping] = useState({
    name: '',
    company: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });

  // Pre-fill with facility address
  useEffect(() => {
    if (facility) {
      setShipping((prev) => ({
        ...prev,
        company: facility.name || '',
        line1: facility.address || '',
        city: facility.city || '',
        state: facility.state || '',
        zip: facility.zip || '',
        phone: facility.phone || '',
      }));
    }
  }, [facility]);

  // Fetch pricing
  useEffect(() => {
    async function fetchPricing() {
      try {
        const response = await fetch('/api/tags/pricing');
        const data = await response.json();
        if (data.pricingTiers) {
          setPricing(data.pricingTiers);
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      }
    }
    fetchPricing();
  }, []);

  // Check tier access
  const tier = facility?.subscription_tier || 'starter';
  const canOrderCustom = ['starter', 'professional', 'enterprise'].includes(tier);
  const canOrder = tier === 'family_pro' || canOrderCustom;

  // Calculate free tags
  const freeTagsRemaining = Math.max(
    0,
    (facility?.free_tags_allowance || 0) - (facility?.free_tags_used || 0)
  );

  // Get current unit price
  const currentPricing = pricing?.[designType] || [];
  const currentTier = currentPricing.find(
    (t) => quantity >= t.minQuantity && (t.maxQuantity === null || quantity <= t.maxQuantity)
  );
  const unitPrice = currentTier?.unitPrice || 0;

  // Calculate totals
  const freeTagsToApply = Math.min(freeTagsRemaining, quantity);
  const chargeableQuantity = quantity - freeTagsToApply;
  const subtotal = chargeableQuantity * unitPrice;
  const total = subtotal;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(500, prev + delta)));
  };

  const handleSubmit = async () => {
    if (!facility?.id || !user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tags/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          userId: user.id,
          quantity,
          designType,
          productType: designType === 'custom' ? 'double_sided' : 'single_sided',
          shippingAddress: {
            name: shipping.name || user.name,
            company: shipping.company,
            line1: shipping.line1,
            line2: shipping.line2,
            city: shipping.city,
            state: shipping.state,
            zip: shipping.zip,
            country: 'US',
            phone: shipping.phone,
          },
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else if (data.isFree) {
        // Free order processed
        router.push('/tags?success=true');
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidForm =
    shipping.name || user?.name
      ? shipping.line1 && shipping.city && shipping.state && shipping.zip
      : false;

  if (!canOrder) {
    return (
      <div>
        <PageHeader
          title="Order NFC Tags"
          description="Upgrade to order physical NFC tags"
          breadcrumbs={[{ label: 'Tags', href: '/tags' }, { label: 'Order' }]}
        />
        <Card className="text-center py-12">
          <Tag size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Upgrade Required</h3>
          <p className="text-surface-400 mb-6">
            NFC tag ordering requires Family Pro or a Business tier subscription.
          </p>
          <Button variant="primary" onClick={() => router.push('/settings?tab=billing')}>
            View Plans
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Order NFC Tags"
        description="Order physical NFC tags for your dogs"
        breadcrumbs={[{ label: 'Tags', href: '/tags' }, { label: 'Order' }]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Design Selection */}
          <Card>
            <CardHeader title="Choose Design" />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setDesignType('default')}
                  className={cn(
                    'p-6 rounded-xl border text-left transition-all',
                    designType === 'default'
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-surface-700 bg-surface-800/50 hover:border-surface-600'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-3">
                    <Tag size={24} className="text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Default Design</h3>
                  <p className="text-sm text-surface-400 mb-3">
                    K9 ProTrain branded tag with paw print logo
                  </p>
                  <p className="text-xs text-surface-500">Single-sided • Lower price</p>
                </button>

                <button
                  onClick={() => canOrderCustom && setDesignType('custom')}
                  disabled={!canOrderCustom}
                  className={cn(
                    'p-6 rounded-xl border text-left transition-all',
                    designType === 'custom'
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-surface-700 bg-surface-800/50 hover:border-surface-600',
                    !canOrderCustom && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                    <Sparkles size={24} className="text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Custom Design</h3>
                  <p className="text-sm text-surface-400 mb-3">
                    Your business logo on both sides
                  </p>
                  <p className="text-xs text-surface-500">
                    {canOrderCustom ? 'Double-sided • Business tiers' : 'Requires Business tier'}
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Quantity Selection */}
          <Card>
            <CardHeader title="Quantity" />
            <CardContent>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleQuantityChange(-10)}
                  disabled={quantity <= 10}
                >
                  <Minus size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </Button>
                <div className="w-24 text-center">
                  <span className="text-4xl font-bold text-white">{quantity}</span>
                  <p className="text-sm text-surface-400">tags</p>
                </div>
                <Button variant="outline" size="icon-sm" onClick={() => handleQuantityChange(1)}>
                  <Plus size={14} />
                </Button>
                <Button variant="outline" size="icon-sm" onClick={() => handleQuantityChange(10)}>
                  <Plus size={16} />
                </Button>
              </div>

              {/* Volume Pricing Tiers */}
              <div className="bg-surface-800/50 rounded-xl p-4">
                <p className="text-sm font-medium text-surface-300 mb-3">Volume Pricing</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {currentPricing.map((tier, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'p-2 rounded-lg text-center text-sm',
                        quantity >= tier.minQuantity &&
                          (tier.maxQuantity === null || quantity <= tier.maxQuantity)
                          ? 'bg-brand-500/20 border border-brand-500/30'
                          : 'bg-surface-800'
                      )}
                    >
                      <span className="text-surface-400">
                        {tier.minQuantity}
                        {tier.maxQuantity ? `-${tier.maxQuantity}` : '+'}
                      </span>
                      <p className="font-medium text-white">{tier.displayPrice}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader title="Shipping Address" />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Contact Name"
                  value={shipping.name}
                  onChange={(e) => setShipping((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={user?.name || 'Your name'}
                />
                <Input
                  label="Company (optional)"
                  value={shipping.company}
                  onChange={(e) => setShipping((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div className="mt-4 space-y-4">
                <Input
                  label="Address"
                  value={shipping.line1}
                  onChange={(e) => setShipping((prev) => ({ ...prev, line1: e.target.value }))}
                  placeholder="Street address"
                />
                <Input
                  label="Address Line 2 (optional)"
                  value={shipping.line2}
                  onChange={(e) => setShipping((prev) => ({ ...prev, line2: e.target.value }))}
                  placeholder="Apt, suite, unit, etc."
                />
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-3">
                    <Input
                      label="City"
                      value={shipping.city}
                      onChange={(e) => setShipping((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      label="State"
                      value={shipping.state}
                      onChange={(e) => setShipping((prev) => ({ ...prev, state: e.target.value }))}
                      maxLength={2}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label="ZIP"
                      value={shipping.zip}
                      onChange={(e) => setShipping((prev) => ({ ...prev, zip: e.target.value }))}
                    />
                  </div>
                </div>
                <Input
                  label="Phone (optional)"
                  value={shipping.phone}
                  onChange={(e) => setShipping((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="For delivery updates"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader title="Order Summary" />
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-surface-400">
                    {quantity} × {designType === 'custom' ? 'Custom' : 'Default'} Tags
                  </span>
                  <span className="text-white">
                    ${((unitPrice * quantity) / 100).toFixed(2)}
                  </span>
                </div>

                {freeTagsToApply > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Free tags applied ({freeTagsToApply})</span>
                    <span>-${((unitPrice * freeTagsToApply) / 100).toFixed(2)}</span>
                  </div>
                )}

                <div className="h-px bg-surface-700" />

                <div className="flex justify-between">
                  <span className="text-surface-400">Unit price</span>
                  <span className="text-white">${(unitPrice / 100).toFixed(2)}/tag</span>
                </div>

                <div className="h-px bg-surface-700" />

                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">${(total / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader title="Estimated Timeline" />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Package size={14} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Production</p>
                    <p className="text-sm text-surface-400">1-2 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Truck size={14} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Shipping</p>
                    <p className="text-sm text-surface-400">3-5 business days (USPS)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Total</p>
                    <p className="text-sm text-surface-400">4-7 business days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="bg-surface-800/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-surface-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-surface-400">
                Orders are fulfilled by our manufacturing partner and shipped directly to you in
                unbranded packaging.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!isValidForm}
              leftIcon={<CreditCard size={16} />}
            >
              {total > 0 ? 'Proceed to Payment' : 'Place Order'}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.back()}
              leftIcon={<ArrowLeft size={16} />}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
