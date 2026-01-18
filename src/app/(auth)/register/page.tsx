'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Building, User, Mail, Lock, Eye, EyeOff, Heart, Sparkles, Loader2, CheckCircle, Crown } from 'lucide-react';

const registerSchema = z
  .object({
    facilityName: z.string().min(2, 'Facility name must be at least 2 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;
type UserType = 'business' | 'family';

// Tier configurations
const familyTiers = [
  {
    id: 'family_free',
    name: 'Free',
    price: 0,
    description: 'Get started with basic features',
    features: ['View daily reports', 'Photo gallery access', 'Up to 2 dogs'],
    popular: false,
  },
  {
    id: 'family_premium',
    name: 'Premium',
    price: 10,
    description: 'Enhanced tracking & support',
    features: ['Everything in Free', 'Video access', 'Homework tracking', 'Up to 5 dogs'],
    popular: true,
  },
  {
    id: 'family_pro',
    name: 'Pro',
    price: 19,
    description: 'For multi-pet families',
    features: ['Everything in Premium', 'NFC tag included', 'Up to 10 dogs', 'Advanced analytics'],
    popular: false,
  },
];

const businessTiers = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    description: 'For small training operations',
    features: ['Up to 10 active dogs', 'Basic training board', 'Daily reports', '2 trainer seats'],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    description: 'For growing businesses',
    features: ['Up to 30 active dogs', 'Video library', 'Custom branding', '5 trainer seats'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 249,
    description: 'For large facilities',
    features: ['Unlimited dogs', 'Multi-location', 'API access', 'Unlimited trainers'],
    popular: false,
  },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as UserType) || 'business';

  const [userType, setUserType] = useState<UserType>(initialType);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, isLoading, error } = useAuthStore();

  const tiers = userType === 'business' ? businessTiers : familyTiers;
  const isBusiness = userType === 'business';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signUp({
        facilityName: data.facilityName,
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Go directly to onboarding after signup
      router.push('/onboarding');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl overflow-hidden">
          <Image
            src="/images/k9-logo.png"
            alt="K9 ProTrain"
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-2xl font-bold text-gradient">K9 ProTrain</span>
      </div>

      <Card variant="bordered" padding="lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-surface-400 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-green-400" />
            Start your 14-day free trial
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="mb-6">
          <p className="text-sm text-surface-400 text-center mb-3">I am a...</p>
          <div className="relative flex bg-surface-800 rounded-xl p-1">
            {/* Sliding background */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ${
                userType === 'business'
                  ? 'left-1 bg-brand-500'
                  : 'left-[calc(50%+2px)] bg-purple-500'
              }`}
            />
            <button
              type="button"
              onClick={() => { setUserType('business'); setSelectedTier(null); }}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                userType === 'business' ? 'text-white' : 'text-surface-400 hover:text-surface-300'
              }`}
            >
              <Building size={18} />
              <span className="font-medium">Business Owner</span>
            </button>
            <button
              type="button"
              onClick={() => { setUserType('family'); setSelectedTier(null); }}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                userType === 'family' ? 'text-white' : 'text-surface-400 hover:text-surface-300'
              }`}
            >
              <Heart size={18} />
              <span className="font-medium">Dog Parent</span>
            </button>
          </div>
        </div>

        {/* Tier Selection */}
        <div className="mb-6">
          <p className="text-sm text-surface-400 text-center mb-3">Select your plan</p>
          <div className="grid gap-3">
            {tiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTier === tier.id
                    ? isBusiness
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-purple-500 bg-purple-500/10'
                    : 'border-surface-700 hover:border-surface-600 bg-surface-800/50'
                }`}
              >
                {tier.popular && (
                  <div className={`absolute -top-2 right-4 px-2 py-0.5 rounded text-xs font-medium ${
                    isBusiness ? 'bg-brand-500 text-white' : 'bg-purple-500 text-white'
                  }`}>
                    <Crown size={10} className="inline mr-1" />
                    Popular
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{tier.name}</h3>
                    <p className="text-xs text-surface-400">{tier.description}</p>
                  </div>
                  <div className="text-right">
                    {tier.price === 0 ? (
                      <span className="text-xl font-bold text-white">Free</span>
                    ) : (
                      <div>
                        <span className="text-xl font-bold text-white">${tier.price}</span>
                        <span className="text-sm text-surface-400">/mo</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tier.features.map((feature, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs text-surface-300 bg-surface-700/50 px-2 py-1 rounded">
                      <CheckCircle size={10} className="text-green-400" />
                      {feature}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Registration Form - Only show after tier selection */}
        {selectedTier && (
          <>
            <div className="border-t border-surface-700 pt-6 mb-6">
              <p className="text-sm text-surface-400 text-center mb-4">Enter your details</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                {...register('facilityName')}
                type="text"
                label={isBusiness ? 'Business Name' : 'Family Name'}
                placeholder={isBusiness ? 'Your Training Facility' : 'The Smith Family'}
                leftIcon={isBusiness ? <Building size={18} /> : <Heart size={18} />}
                error={errors.facilityName?.message}
              />

              <Input
                {...register('name')}
                type="text"
                label="Your Name"
                placeholder="John Smith"
                leftIcon={<User size={18} />}
                error={errors.name?.message}
                autoComplete="name"
              />

              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="you@example.com"
                leftIcon={<Mail size={18} />}
                error={errors.email?.message}
                autoComplete="email"
              />

              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a strong password"
                leftIcon={<Lock size={18} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-surface-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                error={errors.password?.message}
                hint="Must be at least 8 characters"
                autoComplete="new-password"
              />

              <Input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your password"
                leftIcon={<Lock size={18} />}
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-surface-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-brand-400 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-brand-400 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </>
        )}

        <p className="mt-6 text-center text-sm text-surface-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}

function RegisterLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterForm />
    </Suspense>
  );
}
