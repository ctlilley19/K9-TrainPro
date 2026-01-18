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
import { Building, User, Mail, Lock, Eye, EyeOff, Heart, Sparkles, Loader2 } from 'lucide-react';

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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'business'; // 'business' or 'family'
  const isBusiness = userType === 'business';
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, isLoading, error } = useAuthStore();

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
    <div>
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
            {isBusiness ? (
              <>
                <Building size={14} className="text-brand-400" />
                <span className="text-xs text-brand-400 font-medium">Business Account</span>
              </>
            ) : (
              <>
                <Heart size={14} className="text-purple-400" />
                <span className="text-xs text-purple-400 font-medium">Family Account</span>
              </>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-surface-400 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-green-400" />
            Start your 14-day free trial
          </p>
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

        <p className="mt-6 text-center text-sm text-surface-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-surface-500">
          {isBusiness ? (
            <>
              Not a business?{' '}
              <Link href="/register?type=family" className="text-purple-400 hover:text-purple-300 transition-colors">
                Sign up as a dog parent
              </Link>
            </>
          ) : (
            <>
              Running a business?{' '}
              <Link href="/register?type=business" className="text-brand-400 hover:text-brand-300 transition-colors">
                Sign up as a business
              </Link>
            </>
          )}
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
