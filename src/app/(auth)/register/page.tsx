'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { isDemoMode } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Dog, Building, User, Mail, Lock, Eye, EyeOff, CheckCircle2, Inbox } from 'lucide-react';

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

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');
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

      // In demo mode, go straight to dashboard
      if (isDemoMode()) {
        router.push('/dashboard');
        return;
      }

      // In production, show email confirmation message
      setUserEmail(data.email);
      setSignupComplete(true);
    } catch (err) {
      // Error is handled by the store
    }
  };

  // Show success screen after signup
  if (signupComplete) {
    return (
      <div>
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-amber">
            <Dog size={28} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient">K9 ProTrain</span>
        </div>

        <Card variant="bordered" padding="lg">
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <Inbox size={32} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-surface-400 mb-6">
              We&apos;ve sent a confirmation link to:
            </p>
            <p className="text-brand-400 font-medium mb-6">{userEmail}</p>

            <div className="bg-surface-800 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" />
                Next Steps
              </h3>
              <ol className="text-sm text-surface-300 space-y-2 list-decimal list-inside">
                <li>Open the email from K9 ProTrain</li>
                <li>Click the confirmation link</li>
                <li>You&apos;ll be redirected to sign in</li>
                <li>Start setting up your facility!</li>
              </ol>
            </div>

            <p className="text-xs text-surface-500 mb-4">
              Didn&apos;t receive the email? Check your spam folder or wait a few minutes.
            </p>

            <Link
              href="/login"
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors text-sm"
            >
              Go to Sign In
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-amber">
          <Dog size={28} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-gradient">K9 ProTrain</span>
      </div>

      <Card variant="bordered" padding="lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-surface-400">Start your 14-day free trial</p>
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
            label="Facility Name"
            placeholder="Your Training Facility"
            leftIcon={<Building size={18} />}
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
      </Card>
    </div>
  );
}
