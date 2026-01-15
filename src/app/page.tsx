'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  Users,
  Video,
  MessageSquare,
  BookOpen,
  Calendar,
  Shield,
  TrendingUp,
  XCircle,
  Zap,
  DollarSign,
  Timer,
  Camera,
  GraduationCap,
  ClipboardList,
  Home,
  Play,
} from 'lucide-react';

// K9 Working Dog images from Unsplash (free for commercial use)
const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1582729909650-cf927813117c?w=1200&q=80',
    alt: 'Professional K9 German Shepherd with handler',
  },
  {
    url: 'https://images.unsplash.com/photo-1546815708-410983510897?w=800&q=80',
    alt: 'Dog agility training',
  },
  {
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    alt: 'Golden Retriever in training',
  },
];

const problemStats = [
  { label: 'Client check-in calls/texts', time: '45-60 min/day' },
  { label: 'Writing daily reports', time: '15-20 min per dog' },
  { label: 'Taking & sending photos', time: '20-30 min/day' },
  { label: 'Answering progress questions', time: 'Constant' },
];

const stayTrainFeatures = [
  {
    icon: <ClipboardList size={20} />,
    title: 'Live Training Board',
    description: 'Visual board showing every dog\'s status: Kennel, Training, Play, Rest. One-tap updates.',
  },
  {
    icon: <Timer size={20} />,
    title: 'Activity Timers',
    description: 'Automatic logging of training sessions, play time, rest, and potty breaks. No manual tracking.',
  },
  {
    icon: <FileText size={20} />,
    title: 'Auto Daily Reports',
    description: 'System generates professional reports from logged activities. Sent automatically each evening.',
  },
  {
    icon: <Smartphone size={20} />,
    title: 'Pet Parent Portal',
    description: 'Owners see live status, photos, progress, and earned badges. Eliminates 80%+ of calls.',
  },
  {
    icon: <Camera size={20} />,
    title: 'Photo & Video Sharing',
    description: 'One-tap upload from trainer\'s phone. Automatically appears in portal and daily report.',
  },
  {
    icon: <Award size={20} />,
    title: 'Badge System',
    description: 'Dogs earn visual badges as they master skills. Clients share these—free marketing.',
  },
];

const privateLessonFeatures = [
  {
    icon: <BookOpen size={20} />,
    title: 'Homework System',
    description: 'Assign practice tasks after each session. See who\'s putting in work before their next lesson.',
  },
  {
    icon: <Video size={20} />,
    title: 'Video Library',
    description: 'Upload how-to videos. Clients rewatch demonstrations instead of texting questions.',
  },
  {
    icon: <Play size={20} />,
    title: 'Video Submissions',
    description: 'Clients upload practice videos. Provide feedback asynchronously—train without being there.',
  },
  {
    icon: <MessageSquare size={20} />,
    title: 'In-App Messaging',
    description: 'All client communication in one place. No hunting through texts and emails.',
  },
  {
    icon: <Calendar size={20} />,
    title: 'Session Recaps',
    description: 'Auto-send summaries after each lesson with what was covered and what to practice.',
  },
  {
    icon: <GraduationCap size={20} />,
    title: 'Graduation Certificates',
    description: 'Professional PDF certificates auto-generated with skills mastered and your branding.',
  },
];

const competitorProblems = [
  { name: 'Gingr / PetExec', problem: 'Built for boarding & grooming. No homework, no video coaching. $105-155/mo for features you don\'t need.' },
  { name: 'Texting & Email', problem: 'Scattered across 5 apps. Try finding that photo from 3 weeks ago. No organization.' },
  { name: 'Paper & Spreadsheets', problem: 'Time-consuming, unprofessional, easy to lose. Clients can\'t access any of it.' },
  { name: 'Facebook Groups', problem: 'No privacy, no organization. Clients see each other\'s dogs and drama.' },
];

const hiddenCosts = [
  'Lost referrals: Happy clients don\'t share because there\'s nothing shareable',
  'Price objections: Hard to justify $3,000+ board & trains without visible proof',
  'Trainer burnout: Your best people didn\'t sign up to do data entry',
  'Scaling ceiling: Can\'t grow without hiring dedicated admin staff',
];

const includedFeatures = [
  'All Stay & Train features',
  'All Private Lesson features',
  'Unlimited trainer accounts',
  'Your branding on all reports',
  'Badge & achievement system',
  'Video library hosting',
  'SMS notifications',
  'Priority support',
  'Custom onboarding',
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
              <span className="text-xl font-bold text-gradient">K9 ProTrain</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#problem" className="text-surface-400 hover:text-white transition-colors">The Problem</a>
              <a href="#features" className="text-surface-400 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-surface-400 hover:text-white transition-colors">Pricing</a>
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
              Purpose-Built for Professional Dog Trainers
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Stop Drowning in <br />
            <span className="text-gradient">Admin Work</span>
          </h1>

          <p className="text-lg md:text-xl text-surface-400 max-w-3xl mx-auto mb-6">
            The average board & train facility spends <span className="text-white font-semibold">10-15 hours per week</span> on client communication alone. That&apos;s a part-time employee&apos;s worth of hours that could be spent on training dogs.
          </p>

          <p className="text-lg text-surface-300 max-w-2xl mx-auto mb-10">
            K9 ProTrain automates the busy work so you can focus on your mission.
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

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent z-10" />
            <div className="aspect-video max-w-5xl mx-auto rounded-2xl bg-surface-800/50 border border-surface-700 overflow-hidden relative">
              <Image
                src={heroImages[0].url}
                alt={heroImages[0].alt}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-20 px-4 bg-surface-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The Daily Time Drain
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              Professional dog trainers are drowning in admin work that has nothing to do with training dogs.
            </p>
          </div>

          {/* Time Drain Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {problemStats.map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20"
              >
                <Clock size={24} className="text-red-400 mb-3" />
                <p className="text-2xl font-bold text-white mb-1">{stat.time}</p>
                <p className="text-surface-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* The Trust Gap */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="p-8 rounded-2xl bg-surface-800/50 border border-surface-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <Shield size={24} className="text-amber-400" />
                The Trust Gap
              </h3>
              <p className="text-surface-300 mb-4">
                When a pet parent drops off their dog for a 2-week board & train, they&apos;re trusting you with a family member. Without visibility into what&apos;s happening, that trust gets tested every single day.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-surface-700 text-surface-300">Silence breeds anxiety</span>
                <span className="px-3 py-1.5 rounded-full bg-surface-700 text-surface-300">Anxiety breeds phone calls</span>
                <span className="px-3 py-1.5 rounded-full bg-surface-700 text-surface-300">Phone calls interrupt training</span>
              </div>
            </div>
          </div>

          {/* Competitor Problems */}
          <div className="mb-16">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">Current Tools Weren&apos;t Built for Trainers</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {competitorProblems.map((item, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-surface-800/30 border border-surface-700"
                >
                  <div className="flex items-start gap-3">
                    <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white mb-1">{item.name}</p>
                      <p className="text-surface-400 text-sm">{item.problem}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Costs */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">The Hidden Costs</h3>
            <div className="space-y-3">
              {hiddenCosts.map((cost, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-surface-800/30">
                  <TrendingUp size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-surface-300 text-sm">{cost}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Zap size={16} className="text-green-400" />
              <span className="text-sm text-green-400 font-medium">The Solution</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Purpose-Built for Professional Trainers
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              Not adapted from boarding software. Not a generic CRM with a paw print logo. A focused tool that does exactly what you need—nothing more, nothing less.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-surface-900/50">
        <div className="max-w-7xl mx-auto">
          {/* Stay & Train Features */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Home size={20} className="text-brand-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">For Stay & Train Programs</h3>
                <p className="text-surface-400 text-sm">Board & Train, Day Immersion, Overnight Programs</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stayTrainFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-surface-800/50 border border-surface-700 hover:border-brand-500/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-surface-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Private Lesson Features */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">For Private Lessons & Group Classes</h3>
                <p className="text-surface-400 text-sm">One-on-One Training, Group Sessions, Virtual Coaching</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {privateLessonFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-surface-800/50 border border-surface-700 hover:border-purple-500/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-surface-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                8x Return on Investment
              </h2>
              <p className="text-surface-400 mb-8">
                We&apos;ve done the math because we know your time has a dollar value.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50 border border-surface-700">
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-green-400" />
                    <span className="text-surface-300">Time recovered</span>
                  </div>
                  <span className="font-semibold text-white">10+ hours/week</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50 border border-surface-700">
                  <div className="flex items-center gap-3">
                    <DollarSign size={20} className="text-green-400" />
                    <span className="text-surface-300">At $50/hour trainer time</span>
                  </div>
                  <span className="font-semibold text-white">$2,000+/month</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50 border border-surface-700">
                  <div className="flex items-center gap-3">
                    <BarChart3 size={20} className="text-brand-400" />
                    <span className="text-surface-300">Platform investment</span>
                  </div>
                  <span className="font-semibold text-white">$249/month</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={24} className="text-green-400" />
                  <span className="text-2xl font-bold text-white">Net ROI: 8x return</span>
                </div>
                <p className="text-surface-400 text-sm">Plus the intangibles: better client retention, more referrals, happier trainers</p>
              </div>
            </div>

            <div className="aspect-square rounded-2xl bg-surface-800/50 border border-surface-700 overflow-hidden relative">
              <Image
                src="https://images.unsplash.com/photo-1546815708-410983510897?w=800&q=80"
                alt="Dog agility training"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-surface-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-surface-400">
              One plan. Everything included. No hidden fees.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-purple-500 rounded-3xl blur-lg opacity-20" />
            <div className="relative p-8 md:p-12 rounded-2xl bg-surface-800 border border-surface-700">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
                  <Star size={16} className="text-brand-400" />
                  <span className="text-sm text-brand-400 font-medium">Business Plan</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-white">$249</span>
                  <span className="text-surface-400">/month</span>
                </div>
                <p className="text-surface-400">or $2,490/year <span className="text-green-400">(2 months free)</span></p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {includedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-surface-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-4 text-sm text-surface-400 mb-4">
                  <span>Unlimited trainers</span>
                  <span className="text-surface-600">•</span>
                  <span>Unlimited dogs</span>
                  <span className="text-surface-600">•</span>
                  <span>Unlimited clients</span>
                </div>
                <Link href="/register">
                  <Button variant="glow" size="lg" rightIcon={<ArrowRight size={18} />}>
                    Start 14-Day Free Trial
                  </Button>
                </Link>
                <p className="text-sm text-surface-500">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why This, Why Now?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-800/50 border border-surface-700">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">First-Mover Advantage</h3>
              <p className="text-surface-400 text-sm">No training company offers this level of client transparency. Establish the standard before competitors catch on.</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-800/50 border border-surface-700">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Referral Force Multiplier</h3>
              <p className="text-surface-400 text-sm">Pet parents share badges and progress on social media. Every share is free marketing that compounds over time.</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-800/50 border border-surface-700">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Premium Positioning</h3>
              <p className="text-surface-400 text-sm">The technology signals professionalism. It justifies your pricing and attracts clients who value quality.</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-800/50 border border-surface-700">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Scale Without Chaos</h3>
              <p className="text-surface-400 text-sm">As you grow across locations, K9 ProTrain keeps operations consistent. Standard procedures, not tribal knowledge.</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-800/50 border border-surface-700">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Trainer Retention</h3>
              <p className="text-surface-400 text-sm">Your people signed up to train dogs, not push paperwork. Give them tools to do the job they love.</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-800/50 border border-surface-700">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Build Trust Automatically</h3>
              <p className="text-surface-400 text-sm">Silence breeds anxiety. K9 ProTrain handles emotional management so your team can focus on the dogs.</p>
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
            Simple, no-pressure process. Try it with 5-10 dogs for 30 days. If it doesn&apos;t deliver, walk away.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/register">
              <Button variant="glow" size="lg" rightIcon={<ArrowRight size={18} />}>
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg">
                View Demo First
              </Button>
            </Link>
          </div>
          <p className="text-sm text-surface-500">
            No credit card required. 14-day free trial. Cancel anytime.
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
              <span className="font-bold text-gradient">K9 ProTrain</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-surface-500">
              <span>Built by trainers, for trainers</span>
              <span>|</span>
              <span>USMC Veteran Owned</span>
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
