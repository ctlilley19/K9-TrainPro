'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, formatDate } from '@/lib/utils';
import {
  formatCurrency,
  getInvoiceStatusColor,
  type InvoiceStatus,
} from '@/services/billing';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  FileText,
  Send,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';

// Mock invoices
const mockInvoices = [
  {
    id: '1',
    invoice_number: 'INV-K9T001',
    family: { id: 'f1', name: 'Anderson Family' },
    dog: { name: 'Max' },
    status: 'paid' as InvoiceStatus,
    items: [{ description: '4-Week Board & Train', quantity: 1, unit_price: 4500, total: 4500 }],
    subtotal: 4500,
    tax_amount: 0,
    total: 4500,
    amount_paid: 4500,
    balance_due: 0,
    due_date: '2025-01-10',
    paid_date: '2025-01-08',
    created_at: '2024-12-15T10:00:00Z',
  },
  {
    id: '2',
    invoice_number: 'INV-K9T002',
    family: { id: 'f2', name: 'Martinez Family' },
    dog: { name: 'Luna' },
    status: 'sent' as InvoiceStatus,
    items: [
      { description: '2-Week Board & Train', quantity: 1, unit_price: 2500, total: 2500 },
      { description: 'Evaluation Fee', quantity: 1, unit_price: 75, total: 75 },
    ],
    subtotal: 2575,
    tax_amount: 0,
    total: 2575,
    amount_paid: 0,
    balance_due: 2575,
    due_date: '2025-01-20',
    created_at: '2025-01-06T14:00:00Z',
    sent_at: '2025-01-06T14:30:00Z',
  },
  {
    id: '3',
    invoice_number: 'INV-K9T003',
    family: { id: 'f3', name: 'Johnson Family' },
    dog: { name: 'Cooper' },
    status: 'overdue' as InvoiceStatus,
    items: [{ description: 'Private Training Package (8 sessions)', quantity: 1, unit_price: 640, total: 640 }],
    subtotal: 640,
    tax_amount: 0,
    total: 640,
    amount_paid: 0,
    balance_due: 640,
    due_date: '2025-01-05',
    created_at: '2024-12-20T09:00:00Z',
    sent_at: '2024-12-20T09:30:00Z',
  },
  {
    id: '4',
    invoice_number: 'INV-K9T004',
    family: { id: 'f1', name: 'Anderson Family' },
    dog: { name: 'Bella' },
    status: 'draft' as InvoiceStatus,
    items: [{ description: 'Group Class (6 weeks)', quantity: 1, unit_price: 175, total: 175 }],
    subtotal: 175,
    tax_amount: 0,
    total: 175,
    amount_paid: 0,
    balance_due: 175,
    due_date: '2025-01-25',
    created_at: '2025-01-13T11:00:00Z',
  },
];

// Calculate totals
const totalRevenue = mockInvoices
  .filter((i) => i.status === 'paid')
  .reduce((sum, i) => sum + i.amount_paid, 0);
const pendingAmount = mockInvoices
  .filter((i) => ['sent', 'overdue'].includes(i.status))
  .reduce((sum, i) => sum + i.balance_due, 0);
const overdueAmount = mockInvoices
  .filter((i) => i.status === 'overdue')
  .reduce((sum, i) => sum + i.balance_due, 0);

// Monthly revenue trends (last 6 months)
const revenueData = [
  { month: 'Aug', revenue: 8500, invoices: 4 },
  { month: 'Sep', revenue: 12200, invoices: 6 },
  { month: 'Oct', revenue: 9800, invoices: 5 },
  { month: 'Nov', revenue: 15600, invoices: 8 },
  { month: 'Dec', revenue: 11400, invoices: 6 },
  { month: 'Jan', revenue: totalRevenue, invoices: mockInvoices.filter(i => i.status === 'paid').length },
];

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.family.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendInvoice = (invoiceId: string) => {
    console.log('Sending invoice:', invoiceId);
    alert('Invoice sent!');
  };

  const handleMarkPaid = (invoiceId: string) => {
    console.log('Marking invoice as paid:', invoiceId);
    alert('Invoice marked as paid!');
  };

  return (
    <div>
      <PageHeader
        title="Billing & Invoices"
        description="Manage payments and invoices"
        action={
          <Link href="/billing/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Create Invoice
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Revenue (This Month)</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Clock size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Pending</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Overdue</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(overdueAmount)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <FileText size={20} className="text-brand-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Total Invoices</p>
              <p className="text-xl font-bold text-white">{mockInvoices.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Trends Chart */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-green-400" />
          <h3 className="font-medium text-white">Revenue Trends</h3>
          <span className="text-sm text-surface-400 ml-auto">Last 6 months</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Overdue Alert */}
      {overdueAmount > 0 && (
        <Card className="mb-6 border-red-500/30 bg-red-500/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-400" />
                <div>
                  <p className="font-medium text-white">
                    {mockInvoices.filter((i) => i.status === 'overdue').length} overdue
                    invoice(s)
                  </p>
                  <p className="text-sm text-surface-400">
                    Total overdue: {formatCurrency(overdueAmount)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Send Reminders
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search invoices..."
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
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent' },
                { value: 'paid', label: 'Paid' },
                { value: 'overdue', label: 'Overdue' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.map((invoice) => (
          <Card
            key={invoice.id}
            className={cn(
              'hover:border-brand-500/30 transition-all',
              invoice.status === 'overdue' && 'border-red-500/30'
            )}
            variant="bordered"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
              {/* Invoice Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center">
                  <FileText size={20} className="text-surface-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-brand-400">
                      {invoice.invoice_number}
                    </span>
                    <StatusBadge
                      variant={getInvoiceStatusColor(invoice.status) as any}
                      size="xs"
                    >
                      {invoice.status}
                    </StatusBadge>
                  </div>
                  <p className="font-medium text-white">{invoice.family.name}</p>
                  <p className="text-sm text-surface-400">
                    {invoice.dog.name} •{' '}
                    {invoice.items.map((i) => i.description).join(', ')}
                  </p>
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(invoice.total)}
                  </p>
                  {invoice.balance_due > 0 && invoice.balance_due !== invoice.total && (
                    <p className="text-sm text-surface-400">
                      Due: {formatCurrency(invoice.balance_due)}
                    </p>
                  )}
                  <p className="text-xs text-surface-500">
                    Due {formatDate(invoice.due_date)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {invoice.status === 'draft' && (
                    <>
                      <Link href={`/billing/${invoice.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Send size={14} />}
                        onClick={() => handleSendInvoice(invoice.id)}
                      >
                        Send
                      </Button>
                    </>
                  )}
                  {invoice.status === 'sent' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<ExternalLink size={14} />}
                      >
                        Payment Link
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle size={14} />}
                        onClick={() => handleMarkPaid(invoice.id)}
                      >
                        Mark Paid
                      </Button>
                    </>
                  )}
                  {invoice.status === 'overdue' && (
                    <>
                      <Button variant="outline" size="sm" leftIcon={<Send size={14} />}>
                        Send Reminder
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle size={14} />}
                        onClick={() => handleMarkPaid(invoice.id)}
                      >
                        Mark Paid
                      </Button>
                    </>
                  )}
                  {invoice.status === 'paid' && (
                    <>
                      <Link href={`/billing/${invoice.id}`}>
                        <Button variant="ghost" size="sm" leftIcon={<Eye size={14} />}>
                          View
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}>
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <Card className="text-center py-12">
          <FileText size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No invoices found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first invoice'}
          </p>
          <Link href="/billing/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Create Invoice
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
