'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useUpload } from '@/hooks/useUpload';
import { cn } from '@/lib/utils';
import {
  Upload,
  Image as ImageIcon,
  Eye,
  Save,
  X,
  RotateCcw,
  Check,
  Loader2,
} from 'lucide-react';

interface TagDesignerProps {
  onSave: (design: TagDesign) => Promise<void>;
  onCancel: () => void;
  initialDesign?: TagDesign;
}

export interface TagDesign {
  id?: string;
  name: string;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  productType: 'single_sided' | 'double_sided';
  backgroundColor: string;
  textColor: string;
  businessName: string;
  showBusinessName: boolean;
  layout: 'logo_centered' | 'logo_top' | 'text_only' | 'logo_only';
}

const DEFAULT_DESIGN: TagDesign = {
  name: '',
  frontImageUrl: null,
  backImageUrl: null,
  productType: 'double_sided',
  backgroundColor: '#1a1a2e',
  textColor: '#ffffff',
  businessName: '',
  showBusinessName: true,
  layout: 'logo_centered',
};

const PRESET_COLORS = [
  { name: 'Navy', bg: '#1a1a2e', text: '#ffffff' },
  { name: 'Black', bg: '#0a0a0a', text: '#ffffff' },
  { name: 'White', bg: '#ffffff', text: '#1a1a2e' },
  { name: 'Gold', bg: '#1a1a2e', text: '#f59e0b' },
  { name: 'Brand', bg: '#6366f1', text: '#ffffff' },
  { name: 'Green', bg: '#064e3b', text: '#10b981' },
];

const LAYOUT_OPTIONS = [
  { value: 'logo_centered', label: 'Logo Centered', icon: '◉' },
  { value: 'logo_top', label: 'Logo Top, Text Bottom', icon: '◠' },
  { value: 'text_only', label: 'Text Only', icon: 'T' },
  { value: 'logo_only', label: 'Logo Only', icon: '○' },
];

// Default K9 ProTrain logo for standard tags
const DEFAULT_K9_LOGO = '/images/k9-logo.png';

export function TagDesigner({ onSave, onCancel, initialDesign }: TagDesignerProps) {
  const [design, setDesign] = useState<TagDesign>(initialDesign || DEFAULT_DESIGN);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');
  const [uploadingSide, setUploadingSide] = useState<'front' | 'back' | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading, progress } = useUpload({
    bucket: 'logos',
    onError: (error) => {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
      setUploadingSide(null);
    },
  });

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSide(side);

    // Upload to Supabase Storage
    const url = await upload(file, {
      folder: `tag-designs/${Date.now()}`,
    });

    if (url) {
      if (side === 'front') {
        setDesign((prev) => ({ ...prev, frontImageUrl: url }));
      } else {
        setDesign((prev) => ({ ...prev, backImageUrl: url }));
      }
    }

    setUploadingSide(null);
    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!design.name) {
      alert('Please enter a design name');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(design);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setDesign(initialDesign || DEFAULT_DESIGN);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Controls */}
      <div className="space-y-6">
        {/* Design Name */}
        <Card>
          <CardHeader title="Design Details" />
          <CardContent>
            <Input
              label="Design Name"
              value={design.name}
              onChange={(e) => setDesign((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Main Logo, Holiday Design"
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Product Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDesign((prev) => ({ ...prev, productType: 'single_sided' }))}
                  className={cn(
                    'flex-1 p-3 rounded-lg border text-sm transition-all',
                    design.productType === 'single_sided'
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-surface-700 text-surface-400 hover:border-surface-600'
                  )}
                >
                  Single Sided
                  <p className="text-xs text-surface-500 mt-1">Logo front, QR back</p>
                </button>
                <button
                  onClick={() => setDesign((prev) => ({ ...prev, productType: 'double_sided' }))}
                  className={cn(
                    'flex-1 p-3 rounded-lg border text-sm transition-all',
                    design.productType === 'double_sided'
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-surface-700 text-surface-400 hover:border-surface-600'
                  )}
                >
                  Double Sided
                  <p className="text-xs text-surface-500 mt-1">Custom both sides</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo Selection */}
        <Card>
          <CardHeader
            title="Logo Selection"
            action={
              design.productType === 'double_sided' && (
                <div className="flex gap-1 bg-surface-800 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('front')}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      activeTab === 'front'
                        ? 'bg-brand-500 text-white'
                        : 'text-surface-400 hover:text-white'
                    )}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setActiveTab('back')}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      activeTab === 'back'
                        ? 'bg-brand-500 text-white'
                        : 'text-surface-400 hover:text-white'
                    )}
                  >
                    Back
                  </button>
                </div>
              )
            }
          />
          <CardContent>
            {/* Default Logo Option */}
            <div className="mb-4 p-3 rounded-lg border border-surface-700 bg-surface-800/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDesign((prev) => ({ ...prev, frontImageUrl: DEFAULT_K9_LOGO }))}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    design.frontImageUrl === DEFAULT_K9_LOGO
                      ? 'border-brand-500 ring-2 ring-brand-500/30'
                      : 'border-surface-600 hover:border-surface-500'
                  )}
                >
                  <Image
                    src={DEFAULT_K9_LOGO}
                    alt="K9 ProTrain Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain bg-surface-900"
                  />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">K9 ProTrain Default</p>
                  <p className="text-xs text-surface-400">Standard K9 ProTrain branding</p>
                  <p className="text-xs text-green-400 mt-1">Included free</p>
                </div>
                {design.frontImageUrl === DEFAULT_K9_LOGO && (
                  <Check size={20} className="text-brand-400" />
                )}
              </div>
            </div>

            {/* Custom Logo Upload Section */}
            <div className="mb-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded">
                  Premium
                </span>
                <div>
                  <p className="text-sm font-medium text-white">Custom Business Logo</p>
                  <p className="text-xs text-surface-400">Upload your own logo for branded tags (+$2.50/tag)</p>
                </div>
              </div>
            </div>

            <input
              ref={frontInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'front')}
            />
            <input
              ref={backInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'back')}
            />

            {(activeTab === 'front' || design.productType === 'single_sided') && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-surface-300">
                  {design.productType === 'double_sided' ? 'Front Image' : 'Custom Logo'}
                </label>
                {design.frontImageUrl ? (
                  <div className="relative">
                    <div className="aspect-square w-full max-w-[200px] mx-auto rounded-xl overflow-hidden bg-surface-800">
                      <Image
                        src={design.frontImageUrl}
                        alt="Front design"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setDesign((prev) => ({ ...prev, frontImageUrl: null }))}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => frontInputRef.current?.click()}
                    disabled={uploadingSide === 'front'}
                    className="w-full aspect-square max-w-[200px] mx-auto rounded-xl border-2 border-dashed border-surface-700 hover:border-brand-500 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingSide === 'front' ? (
                      <>
                        <Loader2 size={24} className="text-brand-400 animate-spin" />
                        <span className="text-sm text-surface-400">Uploading... {progress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-surface-500" />
                        <span className="text-sm text-surface-400">Upload Logo</span>
                        <span className="text-xs text-surface-500">PNG, JPG, SVG</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {activeTab === 'back' && design.productType === 'double_sided' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-surface-300">Back Image</label>
                {design.backImageUrl ? (
                  <div className="relative">
                    <div className="aspect-square w-full max-w-[200px] mx-auto rounded-xl overflow-hidden bg-surface-800">
                      <Image
                        src={design.backImageUrl}
                        alt="Back design"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setDesign((prev) => ({ ...prev, backImageUrl: null }))}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => backInputRef.current?.click()}
                    disabled={uploadingSide === 'back'}
                    className="w-full aspect-square max-w-[200px] mx-auto rounded-xl border-2 border-dashed border-surface-700 hover:border-brand-500 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingSide === 'back' ? (
                      <>
                        <Loader2 size={24} className="text-brand-400 animate-spin" />
                        <span className="text-sm text-surface-400">Uploading... {progress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-surface-500" />
                        <span className="text-sm text-surface-400">Upload Back Design</span>
                        <span className="text-xs text-surface-500">Include QR placeholder</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader title="Colors" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Preset Colors
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() =>
                        setDesign((prev) => ({
                          ...prev,
                          backgroundColor: color.bg,
                          textColor: color.text,
                        }))
                      }
                      className={cn(
                        'aspect-square rounded-lg border-2 transition-all relative',
                        design.backgroundColor === color.bg
                          ? 'border-brand-500 scale-110'
                          : 'border-transparent hover:border-surface-600'
                      )}
                      style={{ backgroundColor: color.bg }}
                      title={color.name}
                    >
                      {design.backgroundColor === color.bg && (
                        <Check size={14} className="absolute inset-0 m-auto text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={design.backgroundColor}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, backgroundColor: e.target.value }))
                      }
                      className="w-10 h-10 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={design.backgroundColor}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, backgroundColor: e.target.value }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={design.textColor}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, textColor: e.target.value }))
                      }
                      className="w-10 h-10 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={design.textColor}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, textColor: e.target.value }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout & Text */}
        <Card>
          <CardHeader title="Layout & Text" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Layout</label>
                <div className="grid grid-cols-4 gap-2">
                  {LAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setDesign((prev) => ({
                          ...prev,
                          layout: option.value as TagDesign['layout'],
                        }))
                      }
                      className={cn(
                        'p-3 rounded-lg border text-center transition-all',
                        design.layout === option.value
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-surface-700 hover:border-surface-600'
                      )}
                    >
                      <span className="text-2xl block mb-1">{option.icon}</span>
                      <span className="text-xs text-surface-400">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={design.showBusinessName}
                    onChange={(e) =>
                      setDesign((prev) => ({ ...prev, showBusinessName: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-surface-600 bg-surface-700 text-brand-500"
                  />
                  <span className="text-sm font-medium text-surface-300">Show Business Name</span>
                </label>
                {design.showBusinessName && (
                  <Input
                    value={design.businessName}
                    onChange={(e) =>
                      setDesign((prev) => ({ ...prev, businessName: e.target.value }))
                    }
                    placeholder="Your Business Name"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Preview */}
      <div className="space-y-6">
        <Card className="sticky top-6">
          <CardHeader
            title="Live Preview"
            action={
              <div className="flex items-center gap-2 text-sm text-surface-400">
                <Eye size={14} />
                Actual size: 38mm
              </div>
            }
          />
          <CardContent>
            <div className="flex justify-center">
              {/* Tag Preview - Circular keychain shape */}
              <div
                className="w-48 h-48 rounded-full border-4 border-surface-600 shadow-xl flex flex-col items-center justify-center p-4 transition-all"
                style={{ backgroundColor: design.backgroundColor }}
              >
                {/* Logo */}
                {design.frontImageUrl &&
                  (design.layout === 'logo_centered' ||
                    design.layout === 'logo_top' ||
                    design.layout === 'logo_only') && (
                    <div
                      className={cn(
                        'relative',
                        design.layout === 'logo_centered' && 'w-24 h-24',
                        design.layout === 'logo_top' && 'w-16 h-16 mb-2',
                        design.layout === 'logo_only' && 'w-28 h-28'
                      )}
                    >
                      <Image
                        src={design.frontImageUrl}
                        alt="Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                {/* Business Name */}
                {design.showBusinessName &&
                  design.businessName &&
                  (design.layout === 'logo_top' || design.layout === 'text_only') && (
                    <p
                      className={cn(
                        'font-bold text-center',
                        design.layout === 'text_only' ? 'text-lg' : 'text-sm'
                      )}
                      style={{ color: design.textColor }}
                    >
                      {design.businessName}
                    </p>
                  )}

                {/* Placeholder if no logo */}
                {!design.frontImageUrl && design.layout !== 'text_only' && (
                  <div className="flex flex-col items-center text-surface-500">
                    <ImageIcon size={32} />
                    <span className="text-xs mt-2">Upload Logo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Keychain hole indicator */}
            <div className="flex justify-center mt-4">
              <div className="w-4 h-4 rounded-full border-2 border-surface-600 bg-surface-800" />
            </div>

            <p className="text-center text-xs text-surface-500 mt-4">
              Preview shows front side. Back will have QR code
              {design.productType === 'double_sided' && ' or custom design'}.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleReset} leftIcon={<RotateCcw size={16} />}>
            Reset
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save size={16} />}
            className="flex-1"
          >
            Save Design
          </Button>
        </div>
      </div>
    </div>
  );
}
