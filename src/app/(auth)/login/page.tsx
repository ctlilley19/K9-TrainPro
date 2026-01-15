'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Dog, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, enableDemoMode, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleDemoLogin = () => {
    enableDemoMode();
    router.push('/dashboard');
  };

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
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-surface-400">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            placeholder="Enter your password"
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
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-surface-400">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-brand-400 hover:text-brand-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-surface-800 text-surface-500">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full mt-4"
            onClick={handleDemoLogin}
          >
            Try Demo Mode
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-surface-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
