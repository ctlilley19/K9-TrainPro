'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { formatCurrency, servicePricing, billingService } from '@/services/billing';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle,
  Package,
} from 'lucide-react';

// Mock families
const mockFamilies = [
  {
    id: 'f1',
    name: 'Anderson Family',
    email: 'anderson@email.com',
    dogs: [
      { id: 'a', name: 'Max' },
      { id: 'b', name: 'Bella' },
    ],
  },
  {
    id: 'f2',
    name: 'Martinez Family',
    email: 'martinez@email.com',
    dogs: [{ id: 'c', name: 'Luna' }],
  },
  {
    id: 'f3',
    name: 'Johnson Family',
    email: 'johnson@email.com',
    dogs: [{ id: 'd', name: 'Cooper' }],
  },
];

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedDog, setSelectedDog] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0 },
  ]);

  const family = mockFamilies.find((f) => f.id === selectedFamily);

  // Calculate totals
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const total = subtotal - discountAmount + taxAmount;

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: `${Date.now()}`, description: '', quantity: 1, unit_price: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const applyServiceTemplate = (serviceKey: keyof typeof servicePricing, itemId: string) => {
    const service = servicePricing[serviceKey];
    updateLineItem(itemId, 'description', service.name);
    updateLineItem(itemId, 'unit_price', service.price);
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await billingService.createInvoice({
        facility_id: 'facility_1',
        family_id: selectedFamily,
        items: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
        })),
        tax_rate: taxRate,
        discount_amount: discountAmount,
        due_date: dueDate,
        notes,
      });
      router.push('/billing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvoice = async () => {
    setIsSending(true);
    try {
      const invoice = await billingService.createInvoice({
        facility_id: 'facility_1',
        family_id: selectedFamily,
        items: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
        })),
        tax_rate: taxRate,
        discount_amount: discountAmount,
        due_date: dueDate,
        notes,
      });
      await billingService.sendInvoice(invoice.id);
      router.push('/billing');
    } finally {
      setIsSending(false);
    }
  };

  const canSubmit =
    selectedFamily && lineItems.some((item) => item.description && item.unit_price > 0);

  return (
    <div>
      <PageHeader
        title="Create Invoice"
        description="Generate a new invoice for services"
        breadcrumbs={[
          { label: 'Billing', href: '/billing' },
          { label: 'New Invoice' },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <Card>
            <CardHeader title="Client" />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Family"
                  value={selectedFamily}
                  onChange={(e) => {
                    setSelectedFamily(e.target.value);
                    setSelectedDog('');
                  }}
                  options={mockFamilies.map((f) => ({
                    value: f.id,
                    label: f.name,
                  }))}
                  placeholder="Select family"
                />
                {family && (
                  <Select
                    label="Dog (optional)"
                    value={selectedDog}
                    onChange={(e) => setSelectedDog(e.target.value)}
                    options={family.dogs.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                    placeholder="Select dog"
                  />
                )}
              </div>
              {family && (
                <p className="text-sm text-surface-400 mt-3">
                  Invoice will be sent to: {family.email}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader
              title="Line Items"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={addLineItem}
                >
                  Add Item
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-surface-800/50 space-y-4"
                  >
                    {/* Quick Service Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(servicePricing)
                        .slice(0, 6)
                        .map(([key, service]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              applyServiceTemplate(key as keyof typeof servicePricing, item.id)
                            }
                            className="px-2 py-1 text-xs rounded bg-surface-700 hover:bg-surface-600 text-surface-300 transition-colors"
                          >
                            {service.name.split(' ').slice(0, 2).join(' ')}
                          </button>
                        ))}
                    </div>

                    {/* Item Fields */}
                    <div className="grid md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <Input
                          label="Description"
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(item.id, 'description', e.target.value)
                          }
                          placeholder="Service description"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Qty"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                          }
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          label="Unit Price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              'unit_price',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          leftIcon={<DollarSign size={14} />}
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        {lineItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeLineItem(item.id)}
                            className="mb-1"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right text-sm">
                      <span className="text-surface-400">Line Total: </span>
                      <span className="font-medium text-white">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader title="Additional Options" />
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  leftIcon={<Calendar size={14} />}
                />
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  leftIcon={<DollarSign size={14} />}
                />
              </div>
              <Textarea
                className="mt-4"
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes to include on the invoice..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader title="Summary" />
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Discount</span>
                    <span className="text-green-400">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Tax ({taxRate}%)</span>
                    <span className="text-white">{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="h-px bg-surface-700" />
                <div className="flex justify-between">
                  <span className="font-medium text-white">Total</span>
                  <span className="text-xl font-bold text-white">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSendInvoice}
                  isLoading={isSending}
                  disabled={!canSubmit}
                  leftIcon={<Send size={16} />}
                >
                  Send Invoice
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSaveDraft}
                  isLoading={isSubmitting}
                  disabled={!canSubmit}
                  leftIcon={<Save size={16} />}
                >
                  Save as Draft
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
            </CardContent>
          </Card>

          {/* Service Templates */}
          <Card>
            <CardHeader title="Quick Add Services" />
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(servicePricing).map(([key, service]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      const newItem = {
                        id: `${Date.now()}`,
                        description: service.name,
                        quantity: 1,
                        unit_price: service.price,
                      };
                      setLineItems((prev) => [...prev, newItem]);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors text-left"
                  >
                    <span className="text-sm text-white">{service.name}</span>
                    <span className="text-sm font-medium text-brand-400">
                      {formatCurrency(service.price)}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
