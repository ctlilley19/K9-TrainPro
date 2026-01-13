'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Dog,
  Clock,
  Award,
  FileText,
  Smartphone,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
} from 'lucide-react';

const features = [
  {
    icon: <Clock size={24} />,
    title: 'Activity Timers',
    description:
      'Automatic timing system tracks every activity with configurable alerts for kennel time, potty breaks, and more.',
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Live Updates',
    description:
      'Pet parents receive real-time photos and activity updates throughout the training day.',
  },
  {
    icon: <FileText size={24} />,
    title: 'Auto Daily Reports',
    description:
      'Automated end-of-day summaries with photos, activities, and trainer notes sent to owners.',
  },
  {
    icon: <Award size={24} />,
    title: 'Badge System',
    description:
      'Gamification with skill tiers, achievements, and milestones to celebrate progress.',
  },
  {
    icon: <Dog size={24} />,
    title: 'Training Board',
    description:
      'Kanban-style board for managing dogs through their daily activities with drag-and-drop.',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Analytics',
    description:
      'Business insights, training metrics, and operational data at your fingertips.',
  },
];

const benefits = [
  'Real-time communication with pet parents',
  'Reduced administrative overhead',
  'Professional graduation certificates',
  'Mobile-optimized for trainers on the floor',
  'Automated potty and kennel alerts',
  'Before/after progress documentation',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-amber">
                <Dog size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">K9 TrainPro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="glow">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
            <Star size={16} className="text-brand-400" />
            <span className="text-sm text-brand-400 font-medium">
              Professional Training Management
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Modern Training <br />
            <span className="text-gradient">Management Platform</span>
          </h1>

          <p className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-10">
            Streamline your dog training facility with real-time updates, automated
            reports, and gamification that keeps pet parents engaged and informed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="glow" size="lg" rightIcon={<ArrowRight size={18} />}>
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent z-10" />
            <div className="aspect-video max-w-5xl mx-auto rounded-2xl bg-surface-800/50 border border-surface-700 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-surface-600">
                <Dog size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-surface-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Run a Modern Training Facility
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              From activity tracking to parent communication, K9 TrainPro has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-surface-800/50 border border-surface-700 hover:border-brand-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/5"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-surface-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Built for Training Professionals
              </h2>
              <p className="text-surface-400 mb-8">
                K9 TrainPro was designed with input from professional trainers to solve
                real-world challenges in board-and-train operations.
              </p>

              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                    <span className="text-surface-300">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link href="/register">
                  <Button variant="primary" size="lg">
                    Get Started Today
                  </Button>
                </Link>
              </div>
            </div>

            <div className="aspect-square rounded-2xl bg-surface-800/50 border border-surface-700 flex items-center justify-center">
              <Award size={96} className="text-brand-400 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-surface-900/50 to-surface-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Training Facility?
          </h2>
          <p className="text-surface-400 mb-8">
            Join professional trainers who are delivering better experiences for pet parents.
          </p>
          <Link href="/register">
            <Button variant="glow" size="lg" rightIcon={<ArrowRight size={18} />}>
              Start Your Free Trial
            </Button>
          </Link>
          <p className="mt-4 text-sm text-surface-500">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-surface-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Dog size={18} className="text-white" />
              </div>
              <span className="font-bold text-gradient">K9 TrainPro</span>
            </div>
            <p className="text-sm text-surface-500">
              &copy; {new Date().getFullYear()} Lazy E Holdings LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
