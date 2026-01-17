# K9 ProTrain - Claude Context

## Project Overview
K9 ProTrain is a professional dog training facility management SaaS platform built with Next.js 15, React 19, Supabase, and Stripe.

**Tech Stack:**
- Framework: Next.js 15 (App Router)
- UI: React 19, Tailwind CSS, Lucide icons
- State: Zustand (auth), TanStack React Query (data)
- Backend: Supabase (auth, database, storage)
- Payments: Stripe
- Monitoring: Sentry

## Key Architecture

### Authentication Flow
- **Auth Store:** `src/stores/authStore.ts` - Zustand store managing user, facility, and demo state
- **Auth Service:** `src/services/supabase/auth.ts` - Supabase auth operations
- **Auth Guard:** `src/components/auth/AuthGuard.tsx` - Route protection component
- **Login Page:** `src/app/(auth)/login/page.tsx`

### Demo Mode System
The app has a comprehensive demo mode for prospects to explore features without signup.

**How demo mode is determined** (`src/lib/supabase.ts`):
```typescript
export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'false') return false;
  // Auto-detect: no Supabase credentials = demo mode
  return !supabaseUrl || supabaseUrl.includes('placeholder');
}
```

**Demo Personas** (defined in `authStore.ts`):
- `dog_owner` - Pet parent view (Sarah Anderson, sees family fam-1)
- `trainer` - Trainer view (Mike Johnson)
- `manager` - Full admin view (Demo Admin)

**Demo Data:** Located in `src/hooks/useData.ts` (lines 42-500+)
- demoDogs, demoFamilies, demoPrograms, demoBadges, etc.
- All data hooks check `isDemoMode()` and return demo data if true

### Data Hooks Pattern
All data hooks in `src/hooks/useData.ts` follow this pattern:
```typescript
useQuery({
  queryFn: async () => {
    if (isDemoMode() || !facility?.id) {
      return demoData; // Return demo data
    }
    return service.getAll(facility.id); // Real Supabase query
  }
});
```

## Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, register, onboarding)
│   ├── (dashboard)/       # Trainer/Manager dashboard
│   ├── (pet-parent)/      # Pet parent portal
│   ├── (admin)/           # System admin routes
│   └── api/               # API routes
├── components/            # React components
├── hooks/                 # Custom hooks (useData.ts is the main data hook file)
├── lib/                   # Utilities (supabase client, stripe, etc.)
├── services/              # Backend services
│   └── supabase/          # Supabase service modules
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## Environment Setup
Copy `.env.example` to `.env.local` and configure:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_DEMO_MODE` - 'true', 'false', or empty (auto-detect)
- Stripe keys for payments
- Sentry DSN for error tracking (optional)

**Important:** Without valid Supabase credentials, the app auto-enables demo mode and all data will be demo data, even after "logging in".

## Common Issues

### Demo data showing after login
**Cause:** Missing or invalid Supabase credentials in `.env.local`
**Fix:** Create `.env.local` with valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Auth state persisting incorrectly
**Cause:** Zustand persist middleware stores auth in localStorage key `k9-protrain-auth`
**Fix:** Clear localStorage or check `partialize` in `authStore.ts:404-412`

## Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm test             # Jest tests
```

## GitHub Repository
https://github.com/ctlilley19/K9-ProTrain
