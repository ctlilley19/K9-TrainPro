# K9 ProTrain

## The Trust & Transparency Platform for Professional Pet Care

**Built by a USMC Veteran who understands: Time is the one resource you can't get back.**

**Lazy E Holdings LLC**

---

## Mission Statement

K9 ProTrain solves one problem across all pet care services:

> **"Prove you took care of my dog."**

Whether it's training, walking, or sitting - pet parents want **PROOF** and **PEACE OF MIND**. We provide verified transparency that builds trust between pet care providers and pet parents.

---

## Table of Contents

1. [The Problem We Solve](#the-problem-we-solve)
2. [Platform Overview](#platform-overview)
3. [Product Roadmap](#product-roadmap)
4. [Account Types](#account-types)
5. [Service Modes](#service-modes)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Permission Delegation](#permission-delegation)
8. [Escalation Notifications](#escalation-notifications)
9. [Invitation & Account System](#invitation--account-system)
10. [Core Features](#core-features)
11. [QR/NFC Tap System](#qrnfc-tap-system)
12. [Tag Shop & Pricing](#tag-shop--pricing)
13. [GPS & Location Services](#gps--location-services)
14. [Training Board (Kanban)](#training-board-kanban)
15. [Activity Logging & Timers](#activity-logging--timers)
16. [Pet Parent Portal](#pet-parent-portal)
17. [Family Account Features](#family-account-features)
18. [Daily Reports (Auto-Generated)](#daily-reports-auto-generated)
19. [Homework System](#homework-system)
20. [Badges & Achievements](#badges--achievements)
21. [Care Checklists (Sitter Mode)](#care-checklists-sitter-mode)
22. [Payment & Subscription System](#payment--subscription-system)
23. [Notification System](#notification-system)
24. [Real-Time Updates](#real-time-updates)
25. [Technical Architecture](#technical-architecture)
26. [Database Schema](#database-schema)
27. [Security & Privacy](#security--privacy)
28. [Lost Pet Mode](#lost-pet-mode)
29. [Navigation Structure](#navigation-structure)
30. [File Structure](#file-structure)
31. [Development Phases](#development-phases)
32. [Business Model & Pricing](#business-model--pricing)
33. [Anti-Gaming Protections](#anti-gaming-protections)
34. [Glossary](#glossary)

---

## The Problem We Solve

### For Dog Trainers
| Problem | Solution |
|---------|----------|
| "How's my dog doing?" calls all day | Live status in pet parent portal |
| 15-20 min/dog writing daily reports | Auto-generated from logged data |
| No proof of training activities | Timestamped logs + photos |
| Forgotten activities | QR/NFC tap logging (2 seconds) |
| Client anxiety during board & train | Real-time transparency |

### For Dog Walkers
| Problem | Solution |
|---------|----------|
| "Did they actually walk my dog?" | GPS route tracking + map |
| Walker marks "done" but didn't go | Geofence check-in verification |
| No proof of visit | Timestamped photos required |
| Short walks billed as long | Timer + distance tracking |

### For Pet Sitters
| Problem | Solution |
|---------|----------|
| Sitter paid upfront, never shows up | Payment escrow with milestone release |
| No proof of feeding/medication | Care checklist with photo verification |
| "Was my dog actually cared for?" | Visit reports with timestamps |
| Missed visits discovered too late | Real-time alerts to pet parent |

### For Pet Parents (Families)
| Problem | Solution |
|---------|----------|
| Multiple caregivers, no central view | One portal for all pet care |
| Can't verify walker actually came | GPS + geofence verification |
| Medication tracking across providers | Centralized medication log |
| No way to share access with spouse | Family member invitations |

---

## Platform Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      K9 PROTRAIN ECOSYSTEM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      ┌─────────────────┐                        │
│                      │   K9 PROTRAIN   │                        │
│                      │   CORE PLATFORM │                        │
│                      └────────┬────────┘                        │
│                               │                                  │
│         ┌─────────────────────┼─────────────────────┐           │
│         │                     │                     │           │
│         ▼                     ▼                     ▼           │
│   ┌───────────┐        ┌───────────┐        ┌───────────┐      │
│   │  TRAINER  │        │  WALKER   │        │  SITTER   │      │
│   │   MODE    │        │   MODE    │        │   MODE    │      │
│   └───────────┘        └───────────┘        └───────────┘      │
│                                                                  │
│   ─────────────────────────────────────────────────────────     │
│                                                                  │
│   ACCOUNT TYPES:                                                │
│   ┌───────────────────────┐    ┌───────────────────────┐       │
│   │   BUSINESS ACCOUNTS   │    │   FAMILY ACCOUNTS     │       │
│   │   (B2B - Providers)   │    │   (B2C - Pet Owners)  │       │
│   │   $79-249/month       │    │   $0-19/month         │       │
│   └───────────────────────┘    └───────────────────────┘       │
│                                                                  │
│   SHARED FEATURES:                                              │
│   • QR/NFC tap check-in    • Photo uploads                     │
│   • Real-time updates      • Pet parent portal                 │
│   • Activity logging       • In-app messaging                  │
│   • Automated reports      • Payment processing                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Product Roadmap

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT EVOLUTION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   v1.0  K9 ProTrain                                             │
│         └── Dog trainers, walkers, sitters (B2B)               │
│         └── Dogs only                                           │
│         └── Business accounts                                   │
│         └── GOAL: Launch, learn, earn                           │
│                                                                  │
│              ↓                                                   │
│                                                                  │
│   v1.5  K9 ProTrain + Family Accounts                          │
│         └── Add B2C family accounts                            │
│         └── Pet owners can subscribe directly                  │
│         └── Freemium model                                      │
│                                                                  │
│              ↓                                                   │
│                                                                  │
│   v2.0  K9 CarePro                                              │
│         └── Refined based on v1.x feedback                     │
│         └── Better features, smoother UX                       │
│         └── Enhanced integrations                               │
│                                                                  │
│              ↓                                                   │
│                                                                  │
│   v2.5  Pet CarePro                                             │
│         └── Add cats, horses, exotics                          │
│         └── Multi-species support                               │
│         └── Broader market                                      │
│                                                                  │
│              ↓                                                   │
│                                                                  │
│   v3.0+ TrustStack (Future Vision)                              │
│         └── Other care verticals (childcare, elder care)       │
│         └── Platform play                                       │
│         └── Decided based on market feedback                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Account Types

K9 ProTrain supports two distinct account types:

### Business Accounts (B2B)

**For:** Professional trainers, walkers, sitters, and pet care facilities

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS ACCOUNT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   WHO CREATES IT: Business owner (trainer, walker, sitter)      │
│                                                                  │
│   WHAT THEY GET:                                                │
│   ✓ Full facility management                                   │
│   ✓ Training Board (Kanban)                                    │
│   ✓ Team management (staff accounts)                           │
│   ✓ Client management                                          │
│   ✓ Auto-generated daily reports                               │
│   ✓ Badge & achievement system                                 │
│   ✓ Skill tracking & progress                                  │
│   ✓ Homework assignments                                       │
│   ✓ Business analytics                                         │
│   ✓ Custom branding                                            │
│   ✓ Wholesale tag pricing                                      │
│   ✓ Priority support                                           │
│                                                                  │
│   PRICING: $79 - $249/month (see Pricing section)              │
│                                                                  │
│   INVITES: Staff members AND client families                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Family Accounts (B2C)

**For:** Pet owners who want to manage their own pet's care

```
┌─────────────────────────────────────────────────────────────────┐
│                    FAMILY ACCOUNT                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   WHO CREATES IT: Pet owner (no business required)              │
│                                                                  │
│   WHAT THEY GET:                                                │
│   ✓ Pet profiles (up to 5 on Premium)                         │
│   ✓ Invite caregivers (walkers, sitters, family)              │
│   ✓ Activity log from all caregivers                          │
│   ✓ GPS route tracking (Premium)                               │
│   ✓ Photo gallery                                              │
│   ✓ Medical records storage (Premium)                          │
│   ✓ Care instructions                                          │
│   ✓ QR/NFC tag ordering (retail pricing)                      │
│                                                                  │
│   PRO TIER ADDS ($19/mo):                                      │
│   ✓ Pet Analytics (activity trends, care stats)               │
│   ✓ In-app QR code (digital, no physical tag needed)          │
│   ✓ 1 free physical QR/NFC tag included                       │
│                                                                  │
│   WHAT FAMILIES DON'T GET (Business only):                     │
│   ✗ Training Board                                             │
│   ✗ Skill tracking & badges                                    │
│   ✗ Daily auto-reports                                         │
│   ✗ Team management                                            │
│   ✗ Business analytics (revenue, clients, staff)              │
│   ✗ Custom branding                                            │
│                                                                  │
│   PRICING: Free, $10/mo (Premium), or $19/mo (Pro)             │
│                                                                  │
│   INVITES: Family members AND caregivers                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### The Flywheel Effect

```
┌─────────────────────────────────────────────────────────────────┐
│                    GROWTH FLYWHEEL                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Business invites family → Family sees value                  │
│         ↑                           ↓                           │
│         │                    Family tells friends               │
│         │                           ↓                           │
│   Caregiver upgrades ←──── Friend hires walker                 │
│   to Business account              ↓                           │
│         ↑                    Walker uses app                   │
│         │                           ↓                           │
│         └────────── Walker gets more clients                   │
│                                                                  │
│   Both account types feed each other's growth.                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Modes

### 1. Trainer Mode (Facility)

**For:** Board & train facilities, day training programs, private lesson trainers

**Key Features:**
- Training Board (Kanban-style status view)
- Activity timers (automatic duration tracking)
- Skill progress tracking
- Badge & achievement system
- Homework assignments
- Video library
- Auto daily reports
- Graduation certificates
- Kennel management

### 2. Walker Mode

**For:** Professional dog walkers, dog walking businesses

**Key Features:**
- GPS route tracking with map
- Geofence check-in (prove arrival)
- Walk timer with distance
- Multi-dog walk support
- Recurring schedule management
- Route history
- Potty break logging

### 3. Sitter Mode

**For:** Pet sitters, house sitters, drop-in visit providers

**Key Features:**
- Care checklists (customizable per pet)
- Medication logging with photo verification
- Feeding confirmation
- Visit window scheduling
- Home access management (key codes, lockbox)
- Payment escrow with milestone release
- Overnight stay tracking

### 4. Hybrid Mode

**For:** Businesses that offer multiple services

All features from all modes available, selectable per client/booking.

---

## User Roles & Permissions

### Complete Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE ROLE SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   BUSINESS ACCOUNTS                   FAMILY ACCOUNTS           │
│   (Facilities)                        (Pet Owners)              │
│   ─────────────────                   ───────────────           │
│                                                                  │
│   ┌─────────────────┐                 ┌─────────────────┐       │
│   │     OWNER       │                 │  FAMILY OWNER   │       │
│   │ (creates biz)   │                 │ (creates acct)  │       │
│   └────────┬────────┘                 └────────┬────────┘       │
│            │                                   │                 │
│            │ can delegate to                   │ can invite      │
│            ▼                                   ▼                 │
│   ┌─────────────────┐                 ┌─────────────────┐       │
│   │    MANAGER      │                 │  FAMILY MEMBER  │       │
│   │ (elevated staff)│                 │ (spouse, etc)   │       │
│   └────────┬────────┘                 └────────┬────────┘       │
│            │                                   │                 │
│            │ manages                           │ can invite      │
│            ▼                                   ▼                 │
│   ┌─────────────────┐                 ┌─────────────────┐       │
│   │    TRAINER      │                 │   CAREGIVER     │       │
│   │ (staff member)  │◄────────────────│ (walker/sitter) │       │
│   └────────┬────────┘   same person   └─────────────────┘       │
│            │            can be both!                            │
│            │                                                     │
│            │ invites families                                   │
│            ▼                                                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  FAMILY CONNECTIONS                      │   │
│   │                                                          │   │
│   │   When a business invites a family, the family can:     │   │
│   │   • View their pet in the business portal               │   │
│   │   • ALSO have their own Family Account                  │   │
│   │   • Pet data can sync between both (with permission)    │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Role Definitions

#### Business-Side Roles

| Role | Description | Created By |
|------|-------------|------------|
| **Owner** | Creates facility account. Full control including billing, can delete facility, transfer ownership. One per facility. | Self-signup |
| **Manager** | Almost full control. Manages team, settings, clients. Cannot access billing or delete facility. Can be granted additional permissions. | Owner |
| **Trainer** | Works with all dogs. Logs activities, photos, notes. Invites primary family members. Cannot manage staff or settings by default. Can be granted additional permissions. | Owner or Manager |

#### Family-Side Roles

| Role | Description | Created By |
|------|-------------|------------|
| **Family Owner** | Creates family account. Full control of their pets. Can invite family members and caregivers. | Self-signup |
| **Family Member** | Same view access as Family Owner. Cannot invite others or edit care instructions. | Family Owner |
| **Caregiver** | Limited access. Can view basic pet info, care instructions, log visits. Cannot see training progress, reports, or message trainer. | Family Owner |

### Permission Matrix (Business Accounts)

| Permission | Owner | Manager | Trainer |
|------------|:-----:|:-------:|:-------:|
| **Facility Management** |
| Billing & subscription | Yes | No | No |
| Delete facility | Yes | No | No |
| Transfer ownership | Yes | No | No |
| Change facility settings | Yes | Yes | No |
| **Team Management** |
| Invite/remove managers | Yes | No | No |
| Invite/remove trainers | Yes | Yes | No |
| Grant permissions | Yes | Yes* | No |
| **Dog/Client Management** |
| Add new dogs/clients | Yes | Yes | Yes |
| Edit any dog's info | Yes | Yes | Yes |
| Delete dogs/clients | Yes | Yes | No |
| **Training Operations** |
| View training board | Yes | Yes | Yes |
| Log activities (any dog) | Yes | Yes | Yes |
| Assign homework | Yes | Yes | Yes |
| Award badges | Yes | Yes | Yes |
| **Communication** |
| Message any client | Yes | Yes | Yes |
| **Invitations** |
| Invite primary family | Yes | Yes | Yes |

*Managers can only grant permissions they themselves have.

---

## Permission Delegation

Owners and Managers can grant additional permissions to lower roles.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERMISSION DELEGATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   RULES:                                                        │
│   • You can only grant permissions YOU have                     │
│   • Owner can grant anything except:                            │
│     - Delete facility                                           │
│     - Transfer ownership                                        │
│   • Manager can grant trainer-level permissions                 │
│   • Granted permissions can be revoked anytime                  │
│                                                                  │
│   ─────────────────────────────────────────────────────────     │
│                                                                  │
│   EXAMPLE:                                                      │
│   Owner Sarah wants trainer Mike to handle billing              │
│   while she's on vacation.                                      │
│                                                                  │
│   Sarah goes to: Team → Mike → Permissions                      │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  MIKE'S PERMISSIONS                                      │   │
│   │                                                          │   │
│   │  Role: Trainer (base permissions)                       │   │
│   │                                                          │   │
│   │  ADDITIONAL PERMISSIONS:                                │   │
│   │  [x] View billing (granted by Sarah, Owner)             │   │
│   │  [x] Manage subscriptions (granted by Sarah, Owner)     │   │
│   │  [ ] Delete facility (cannot be granted)                │   │
│   │  [ ] Transfer ownership (cannot be granted)             │   │
│   │                                                          │   │
│   │  [Save Changes]                                         │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Delegatable Permissions

| Permission | Owner Can Grant | Manager Can Grant |
|------------|:---------------:|:-----------------:|
| View billing | Yes | No |
| Manage subscriptions | Yes | No |
| Change facility settings | Yes | No |
| Invite/remove trainers | Yes | Yes |
| Delete dogs/clients | Yes | Yes |
| View analytics | Yes | Yes |
| Export data | Yes | Yes |

### Non-Delegatable Permissions (Owner Only, Always)

- Delete facility
- Transfer ownership
- Remove the last Owner

---

## Escalation Notifications

When someone uses elevated or granted permissions, the person who granted those permissions is notified immediately.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESCALATION ALERTS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   WHEN: Someone uses elevated/granted permissions               │
│   WHO: The person who granted those permissions gets notified   │
│   HOW: Push notification + email (configurable)                 │
│                                                                  │
│   ─────────────────────────────────────────────────────────     │
│                                                                  │
│   EXAMPLES:                                                     │
│                                                                  │
│   Manager adds a new trainer:                                   │
│   → Owner gets: "Manager Jake added new trainer: Emily S."     │
│                                                                  │
│   Trainer (with billing permission) changes subscription:       │
│   → Owner gets: "Mike changed plan from Pro to Business"       │
│                                                                  │
│   Manager removes a client:                                     │
│   → Owner gets: "Manager Jake deleted client: Johnson Family"  │
│                                                                  │
│   ─────────────────────────────────────────────────────────     │
│                                                                  │
│   OWNER'S NOTIFICATION SETTINGS:                                │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  ESCALATION ALERTS                                       │   │
│   │                                                          │   │
│   │  Notify me when someone with elevated permissions:       │   │
│   │  [x] Changes billing/subscription (always on)           │   │
│   │  [x] Adds/removes team members                          │   │
│   │  [x] Deletes clients or dogs                            │   │
│   │  [ ] Adds new clients (optional - high volume)          │   │
│   │  [ ] All elevated activity (very noisy)                 │   │
│   │                                                          │   │
│   │  Notify via:                                            │   │
│   │  [x] Push notification                                  │   │
│   │  [x] Email                                              │   │
│   │  [ ] SMS (premium)                                      │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   This creates ACCOUNTABILITY without BLOCKING workflow.        │
│   Manager/Trainer can act → Owner stays informed.               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Always-On Escalations (Cannot Disable)

These escalations always notify the Owner:
- Billing/subscription changes
- Facility settings changes
- Team member additions/removals
- Data exports

---

## Invitation & Account System

### Philosophy: Everyone Creates an Account

All users create their own accounts. This provides:
- Proper security (individual passwords)
- Clear permissions per user
- Users manage their own settings
- Audit trail of who did what
- More engagement = more value

### Signup Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIMPLIFIED SIGNUP                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   "Sarah, you've been invited to track Max's training!"         │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                          │   │
│   │  [    Continue with Google    ]  ← One click, done      │   │
│   │                                                          │   │
│   │  ─────────── or ───────────                             │   │
│   │                                                          │   │
│   │  Email: sarah@johnson.com (pre-filled, read-only)       │   │
│   │  Password: [________________________]                   │   │
│   │                                                          │   │
│   │  [Create Account]                                       │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   • Name pulled from invite (no extra typing)                   │
│   • Email already verified (clicked invite link)                │
│   • Automatically connected to their pet                        │
│   • Takes 30 seconds max                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Invitation Flows

#### Flow 1: Trainer Adds New Dog + Family

```
TRAINER'S VIEW:
┌─────────────────────────────────────────────────────────────────┐
│  ADD NEW DOG                                                     │
│                                                                  │
│  Dog's Name: [Max__________________]                            │
│  Breed: [German Shepherd___________]                            │
│  Age: [2] years [3] months                                      │
│  Weight: [75] lbs                                               │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  PRIMARY CONTACT (Pet Owner)                                    │
│  First Name: [Sarah________________]                            │
│  Last Name: [Johnson_______________]                            │
│  Email: [sarah@johnson.com_________]                            │
│  Phone: [(555) 123-4567____________]                            │
│                                                                  │
│  [x] Send invitation email to create account                    │
│                                                                  │
│  [Add Dog & Send Invite]                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

WHAT HAPPENS:
1. Dog "Max" created in database
2. Invitation record created with token
3. Email sent to sarah@johnson.com
4. Sarah clicks link → Signup page (pre-filled)
5. Sarah creates password → Account created
6. Sarah automatically linked to Max as Primary Family
```

#### Flow 2: Primary Family Invites Family Member

```
SARAH'S PORTAL → CARE TEAM:
┌─────────────────────────────────────────────────────────────────┐
│  INVITE FAMILY MEMBER                                           │
│                                                                  │
│  Name: [Mike Johnson_______________]                            │
│  Email: [mike@johnson.com__________]                            │
│  Relationship: [Spouse] (optional)                              │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  This person will have FULL ACCESS to view Max's:               │
│  - Live status and location                                     │
│  - Training progress and skills                                 │
│  - Daily reports                                                │
│  - Photos and videos                                            │
│  - Messages with trainer                                        │
│                                                                  │
│  They will NOT be able to:                                      │
│  - Invite other people                                          │
│  - Edit care instructions                                       │
│                                                                  │
│  [Send Invite]                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Flow 3: Primary Family Invites Caregiver

```
SARAH'S PORTAL → CARE TEAM:
┌─────────────────────────────────────────────────────────────────┐
│  INVITE DOG WALKER / SITTER                                     │
│                                                                  │
│  Name or Business: [Happy Paws Walking_____]                    │
│  Email: [info@happypaws.com________]                            │
│  Type: (*) Dog Walker  ( ) Pet Sitter  ( ) Both                 │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  LIMITED ACCESS                                                 │
│                                                                  │
│  This person will be able to:                                   │
│  - View Max's basic info and photo                              │
│  - View care instructions you've written                        │
│  - Log their visits and walks                                   │
│  - Take and upload photos                                       │
│  - See their scheduled visits                                   │
│                                                                  │
│  They will NOT be able to:                                      │
│  - See training progress or daily reports                       │
│  - See badges or skills                                         │
│  - Message the trainer                                          │
│  - Invite other people                                          │
│  - Change care instructions                                     │
│                                                                  │
│  [Send Invite]                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Features

### Shared Across All Modes

| Feature | Description |
|---------|-------------|
| **QR/NFC Tap Check-in** | Scan or tap to instantly log activities. 2 seconds. |
| **Photo Uploads** | Timestamped, GPS-tagged photos as proof of care |
| **Activity Logging** | Every action logged with who, what, when, where |
| **Pet Parent Portal** | Real-time view of their pet's status and history |
| **In-App Messaging** | Communication between providers and pet parents |
| **Automated Reports** | Daily/visit summaries sent automatically |
| **Multi-Pet Support** | Handle households with multiple pets |
| **Team Management** | Multiple staff members with role-based access |
| **Payment Processing** | Stripe integration for subscriptions and transactions |
| **Mobile-First Design** | Works on any phone, installable as PWA |

### Business-Only Features

| Feature | Description |
|---------|-------------|
| **Training Board** | Kanban view showing all dogs' current status |
| **Skill Tracking** | Track progress on specific skills (sit, recall, etc.) |
| **Badge System** | Visual achievements dogs earn |
| **Homework System** | Assign practice tasks to clients |
| **Auto Daily Reports** | System generates and sends daily summaries |
| **Video Library** | Upload training videos for clients to watch |
| **Certificates** | Auto-generate graduation certificates |
| **Business Analytics** | Reports on activity, clients, revenue |
| **Custom Branding** | Your logo on reports and portal |
| **Wholesale Tags** | Discounted QR/NFC tag pricing |

### Family-Only Features

| Feature | Description |
|---------|-------------|
| **Caregiver Invites** | Invite your own walker/sitter |
| **Care Instructions** | Write instructions for caregivers |
| **Medical Records** | Store vet records and medication info |
| **Multi-Provider View** | See all care from all providers in one place |

---

## QR/NFC Tap System

### The Concept

Every dog, kennel, station, and home has a unique identifier encoded in both QR code and NFC tag format. This enables instant activity logging with minimal friction.

### Why Both QR AND NFC?

| QR Code Scan | NFC Tap |
|--------------|---------|
| 1. Open app | 1. Open app |
| 2. Tap "Scan" button | 2. Tap phone to tag |
| 3. Point camera at code | 3. Done |
| 4. Wait for focus | |
| 5. Code recognized | |
| 6. Done | |
| **Time: 3-5 seconds** | **Time: 1-2 seconds** |
| Requires: Good lighting | Requires: Nothing |

**Our Solution:** Both on one tag. NFC for speed, QR as backup.

### QR/NFC Data Format

```
URL Format: https://app.k9protrain.com/tap/{type}/{uuid}

Examples:
- Dog:     https://app.k9protrain.com/tap/dog/a1b2c3d4-e5f6-...
- Kennel:  https://app.k9protrain.com/tap/kennel/b2c3d4e5-f6a7-...
- Station: https://app.k9protrain.com/tap/station/c3d4e5f6-a7b8-...
- Home:    https://app.k9protrain.com/tap/home/d4e5f6a7-b8c9-...
```

### Quick Action Sheet (When Tag Scanned)

```
┌─────────────────────────────────────┐
│              MAX                    │
│         German Shepherd             │
│                                     │
│  Current: In Kennel K-03            │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ [Train]         [Play]         ││
│  │ [Potty]         [Feed]         ││
│  │ [Rest]          [Groom]        ││
│  │ [Photo]         [Note]         ││
│  └─────────────────────────────────┘│
│                                     │
│  [View Full Profile]                │
└─────────────────────────────────────┘
```

### In-App QR Code (Family Pro)

Family Pro subscribers get a digital QR code they can display on their phone screen - no physical tag needed.

```
┌─────────────────────────────────────┐
│  K9 ProTrain App                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      [QR CODE IMAGE]        │   │
│  │                             │   │
│  │    Scan to view Max's       │   │
│  │    pet profile              │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ Share ]  [ Download ]  [ Print ] │
│                                     │
└─────────────────────────────────────┘
```

**Use Cases:**
- Show phone screen to vet/groomer for pet info
- Emergency - lost pet, show QR to shelter staff
- Backup if physical tag is lost
- Share pet profile with new caregiver

**Features:**
- Static QR code tied to pet's profile URL
- Can be saved as image, shared, or printed
- Works even without physical tag
- Free/Premium users see "Upgrade to Pro to unlock"

### QR Builder (DIY Print Option)

Users can generate and print their own QR codes from within the app - no physical tag order required.

```
┌─────────────────────────────────────────────────────────────────┐
│  QR BUILDER                                                      │
│                                                                  │
│  Select Pet: [Max - German Shepherd     ▼]                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │              [GENERATED QR CODE]                        │   │
│  │                                                          │   │
│  │              app.k9protrain.com/tap/dog/abc123          │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Tag Style: ( ) Basic  (*) With Logo  ( ) Kennel Card          │
│                                                                  │
│  [ Download PNG ]  [ Download PDF ]  [ Print ]                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Output Options:**
- **PNG** - Single QR code image for digital use
- **PDF** - Print-ready tag template (multiple sizes)
- **Kennel Card** - Full card with pet photo, name, QR code

**Use Cases:**
- DIY users who want to print at home or local print shop
- Businesses who want to laminate their own kennel cards
- Backup tags while waiting for physical order
- Temporary tags for boarding dogs

**Note:** Physical NFC+QR tags still available for order via Tag Shop (recommended for durability and NFC tap functionality).

---

## Tag Shop & Pricing

> **Note:** Tag pricing is preliminary and subject to change pending vendor outreach.

### Pricing Strategy

Different pricing for Business vs Family accounts:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TAG PRICING                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   FAMILY ACCOUNTS (Retail Pricing):                             │
│   ─────────────────────────────────                             │
│                                                                  │
│   Basic Tag (QR only)                        $8                 │
│   • Laminated tag with QR code                                  │
│   • Great for: Indoor pets, backup                              │
│                                                                  │
│   Standard Tag (QR + NFC)                    $18                │
│   • Durable collar tag with QR + NFC chip        POPULAR        │
│   • Great for: Daily walks, active dogs                         │
│                                                                  │
│   Premium Tag (QR + NFC + Engraving)         $30                │
│   • Metal tag, engraved name, QR + NFC                          │
│   • Great for: Style-conscious pet parents                      │
│                                                                  │
│   Home Check-in Tag                          $20                │
│   • Weatherproof, adhesive back                                 │
│   • Great for: Walker/sitter arrival verification               │
│                                                                  │
│   ─────────────────────────────────────────────────────────     │
│                                                                  │
│   BUNDLES:                                                      │
│   Pet Starter Kit (Standard + Home + Basic)  $40  (save $6)     │
│   Multi-Pet Pack (3 Standard tags)           $45  (save $9)     │
│                                                                  │
│   ═══════════════════════════════════════════════════════════   │
│                                                                  │
│   BUSINESS ACCOUNTS (Wholesale Pricing):                        │
│   ──────────────────────────────────────                        │
│                                                                  │
│   Starter Plan ($79/mo):                                        │
│   • 20 tags included free                                       │
│   • Additional tags: $5 each                                    │
│                                                                  │
│   Pro Plan ($149/mo):                                           │
│   • 50 tags included free                                       │
│   • Additional tags: $4 each                                    │
│                                                                  │
│   Business Plan ($249/mo):                                      │
│   • 100 tags included free                                      │
│   • Additional tags: $3 each                                    │
│                                                                  │
│   Volume discounts: 100+ = $3, 250+ = $2.50, 500+ = $2          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tag Shop UI (Family Portal)

```
┌─────────────────────────────────────────────────────────────────┐
│  ORDER TAGS FOR YOUR PETS                                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │   [Image: Standard Tag]        MOST POPULAR             │    │
│  │   STANDARD TAG - $18                                    │    │
│  │   QR + NFC, durable plastic                             │    │
│  │   Great for: Daily walks, active dogs                   │    │
│  │   [Add to Cart]                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │   [Image: Premium Tag]                                  │    │
│  │   PREMIUM TAG - $30                                     │    │
│  │   QR + NFC, metal with engraved name                    │    │
│  │   [Add to Cart]                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│   BUNDLE & SAVE                                                  │
│   Pet Starter Kit - $40 (save $6)                               │
│   [Add Bundle to Cart]                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tag Fulfillment Strategy

| Stage | Supplier | Notes |
|-------|----------|-------|
| **Testing (1-25 tags)** | Tagstand (USA) | No minimums, fast |
| **Early (50-100 tags)** | Seritag (UK) | Good quality/price |
| **Scaling (500+ tags)** | RFIDSilicone (China) | Lowest cost |
| **Print-on-Demand** | Printify / Gooten | For custom designs, drop-ship |

**Physical Tag Reference:**
Looking at tags similar to PetDwelling style - circular metal tag with:
- QR code on front
- Paw print design on back
- NFC chip embedded
- Split ring attachment

---

## GPS & Location Services

### Walker Mode: Route Tracking

```
HOW IT WORKS:
1. Walker taps "Start Walk" in app
2. App records GPS coordinates every 30 seconds
3. Walker walks the dog (phone in pocket is fine)
4. Walker taps "End Walk"
5. App generates route map and stats

PET PARENT SEES:
┌─────────────────────────────────────┐
│         [MAP WITH ROUTE]            │
│    *────────────────*               │
│    Start           End              │
└─────────────────────────────────────┘
Duration: 32 minutes
Distance: 1.4 miles
Photos: 3
Potty breaks: 2
```

### Geofence Check-In

```
SETUP:
1. Pet parent's address saved with GPS coordinates
2. System creates 100-meter geofence around address

CHECK-IN FLOW:
1. Provider arrives at home
2. Opens app, taps "Check In"
3. App captures current GPS location
4. System compares to geofence:
   - INSIDE: "Check-in verified at 2:03 PM"
   - OUTSIDE: "Location doesn't match"

FRAUD PREVENTION:
• Mock location detection (Android)
• Photo required at check-in
• All data logged for disputes
```

---

## Training Board (Kanban)

Visual board showing every dog's current status at a glance.

```
┌─────────────────────────────────────────────────────────────────┐
│                      TRAINING BOARD                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   KENNEL        TRAINING       PLAY          REST               │
│   ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐             │
│   │ Zeus  │    │ Bella │    │ Luna  │    │ Rocky │             │
│   │ 2:30  │    │ 0:45  │    │ 0:20  │    │ 1:15  │             │
│   │ K-01  │    │ Sarah │    │ Mike  │    │       │             │
│   ├───────┤    └───────┘    └───────┘    └───────┘             │
│   │ Max   │                                                     │
│   │ 1:45  │    ┌───────┐                                        │
│   │ K-03  │    │ Duke  │                                        │
│   └───────┘    │ 0:10  │                                        │
│                │ Sarah │                                        │
│                └───────┘                                        │
│                                                                  │
│   • Drag a dog card to a new column = activity logged           │
│   • Numbers = time in current status (live timer)               │
│   • Everyone sees updates instantly (real-time)                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Note:** Training Board is a Business-only feature.

---

## Activity Logging & Timers

### What Gets Logged?

| Field | Description | Example |
|-------|-------------|---------|
| Dog | Which dog | Zeus |
| Activity Type | What they're doing | Training |
| Started At | When this started | 2025-01-14 09:00:00 |
| Ended At | When this ended | 2025-01-14 09:45:00 |
| Duration | How long (calculated) | 45 minutes |
| Staff | Who logged it | Sarah M. |
| Station | Where (optional) | Training Yard A |
| Notes | Additional info | "Worked on recall" |

### Timer Logic

```
9:00 AM - Trainer scans Zeus, taps "Training"
          → Activity STARTS, timer begins: 0:00

9:45 AM - Trainer scans Zeus, taps "Play"
          → Training activity ENDS (duration: 45 min)
          → Play activity STARTS, new timer: 0:00

10:15 AM - Trainer scans Zeus, taps "Kennel"
           → Play activity ENDS (duration: 30 min)
           → Kennel activity STARTS

ZEUS'S DAY SO FAR:
• Training: 45 minutes
• Play: 30 minutes
• Kennel: [still going...]
```

---

## Pet Parent Portal

### Business Client Portal

```
┌─────────────────────────────────────────────────────────────────┐
│  K9 PROTRAIN                              Welcome, Sarah        │
├─────────────────────────────────────────────────────────────────┤
│  [My Pets] [Photos] [Progress] [Messages] [Care Team]           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  MAX                              German Shepherd        │    │
│  │                                                          │    │
│  │  Current Status: TRAINING                                │    │
│  │  Duration: 0:45:23 (live)                                │    │
│  │  With: Sarah M. (Trainer)                                │    │
│  │                                                          │    │
│  │  Program: 2-Week Board & Train                           │    │
│  │  Day 8 of 14 | ████████████░░░░░░░░ 57%                 │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [Live Status] [Reports] [Homework] [Photos] [Progress]         │
│                                                                  │
│  CARE TEAM                                                      │
│  Sarah Johnson (You) - Primary Contact                          │
│  Mike Johnson - Family Member                                   │
│                                                                  │
│  [+ Add Family Member]                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Family Account Features

Family accounts are for pet owners who want to manage their own pet's care without going through a business.

### Family Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  K9 PROTRAIN                              Welcome, Sarah        │
├─────────────────────────────────────────────────────────────────┤
│  [My Pets] [Activity] [Photos] [Care Team] [Tags]               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MY PETS                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  MAX                              German Shepherd        │    │
│  │  Last activity: Walk with Happy Paws (2 hours ago)       │    │
│  │  [View Details]                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  LUNA                             Tabby Cat              │    │
│  │  Last activity: Feeding (this morning)                   │    │
│  │  [View Details]                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [+ Add Pet] (2 of 5 on Premium plan)                           │
│                                                                  │
│  ─────────────────────────────────────────────────────────      │
│                                                                  │
│  RECENT ACTIVITY                                                │
│  Today:                                                         │
│  • 2:30 PM - Max walked by Happy Paws (1.2 mi, 28 min)         │
│  • 8:00 AM - Luna fed by You                                    │
│  • 7:15 AM - Max potty break by You                             │
│                                                                  │
│  MY CARE TEAM                                                   │
│  Mike Johnson (Spouse) - Family Member                          │
│  Happy Paws Walking - Dog Walker                                │
│  Sarah's Pet Sitting - Pet Sitter                               │
│                                                                  │
│  [+ Add Family Member]  [+ Add Walker/Sitter]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### What Family Accounts Include

| Feature | Free | Premium ($10/mo) | Pro ($19/mo) |
|---------|:----:|:---------------:|:------------:|
| Pets | 1 | 5 | 5 |
| Caregivers | 2 | 5 | 5 |
| Activities/month | 50 | Unlimited | Unlimited |
| Activity history | 30 days | Unlimited | Unlimited |
| GPS route tracking | No | Yes | Yes |
| Photo storage | 50 photos | Unlimited | Unlimited |
| Medical records | No | Yes | Yes |
| Care instructions | Yes | Yes | Yes |
| **Pet Analytics** | No | No | **Yes** |
| **In-app QR code** | No | No | **Yes** |
| **Free physical tag** | No | No | **1 included** |
| QR/NFC tag ordering | Yes (retail) | Yes (retail) | Yes (retail) |
| Ads | Yes | No | No |
| **Annual price** | - | $100/year | $190/year |

---

## Daily Reports (Auto-Generated)

### Business Feature Only

System generates daily reports from logged activities. Zero manual work.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DAILY REPORT: MAX                             │
│                    January 14, 2025                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   TODAY'S ACTIVITIES                                            │
│   ────────────────────────────────────────────                  │
│   Training    ████████████████░░░░  2h 15m                      │
│   Play        ████████░░░░░░░░░░░░  1h 00m                      │
│   Rest        ██████░░░░░░░░░░░░░░  0h 45m                      │
│   Kennel      ████████████████████  4h 00m                      │
│                                                                  │
│   PHOTOS FROM TODAY                                             │
│   [Photo] [Photo] [Photo] [Photo] [Photo]                       │
│                                                                  │
│   SKILLS WORKED ON                                              │
│   • Recall (with distractions) - Great progress!                │
│   • Place command                                               │
│   • Loose leash walking                                         │
│                                                                  │
│   TRAINER NOTES                                                 │
│   "Max had an excellent day! His recall is really coming        │
│   along - we practiced in the yard with other dogs as           │
│   distractions and he nailed it 4 out of 5 times."              │
│                                                                  │
│   NEW BADGE EARNED: Recall Rockstar!                            │
│                                                                  │
│   ────────────────────────────────────────────────              │
│   Ultimate K9 Training | (555) 123-4567                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Homework System

### Business Feature Only

```
TRAINER ASSIGNS:
┌─────────────────────────────────────────────────────────────────┐
│  NEW HOMEWORK                                                    │
│                                                                  │
│  Title: Practice Recall                                         │
│  Instructions:                                                  │
│  Practice recall 3x daily in your backyard.                     │
│  Start at 10 feet, increase distance as Max improves.           │
│                                                                  │
│  [Attach Demo Video]                                            │
│  Due: Before next session (Jan 21)                              │
│                                                                  │
│  [Assign Homework]                                              │
└─────────────────────────────────────────────────────────────────┘

CLIENT SEES:
┌─────────────────────────────────────────────────────────────────┐
│  HOMEWORK                                                        │
│                                                                  │
│  [ ] Practice Recall                                            │
│      Due: Jan 21                                                │
│      [Watch Demo Video]                                         │
│      [Upload Practice Video]                                    │
│      [Mark Complete]                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Badges & Achievements

### Business Feature Only

```
BADGE CATEGORIES:
─────────────────

SKILL BADGES (earned when skill is mastered)
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ SIT │ │DOWN │ │STAY │ │COME │ │HEEL │ │PLACE│
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘

MILESTONE BADGES (earned at program milestones)
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│DAY 1│ │WEEK1│ │WEEK2│ │GRAD │
└─────┘ └─────┘ └─────┘ └─────┘

FITNESS BADGES (walker mode - distance milestones)
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 10  │ │ 50  │ │ 100 │ │ 500 │
│MILES│ │MILES│ │MILES│ │MILES│
└─────┘ └─────┘ └─────┘ └─────┘
```

---

## Care Checklists (Sitter Mode)

```
PET PARENT CONFIGURES:
┌─────────────────────────────────────────────────────────────────┐
│  MAX'S MORNING VISIT CHECKLIST                                  │
│                                                                  │
│  [x] Fresh water (required)                                     │
│  [x] Breakfast - 1 cup kibble (required)                        │
│  [x] Morning medication - Apoquel 1 tablet (required, photo)    │
│  [x] Potty break - minimum 10 min (required)                    │
│  [x] Photo of Max (required)                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

SITTER'S VIEW:
┌─────────────────────────────────────────────────────────────────┐
│  MORNING VISIT - MAX                         08:15 AM           │
│                                                                  │
│  [Done] Fresh water                          [Completed]        │
│  [Done] Breakfast (1 cup kibble)             [Completed]        │
│  [ ] Medication: Apoquel                     [Photo Required]   │
│  [ ] Potty break (10+ min)                   [Start Timer]      │
│  [ ] Photo of Max                            [Take Photo]       │
│                                                                  │
│  3 items remaining                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Payment & Subscription System

### Subscription Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE PRICING STRUCTURE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   FOR FAMILIES (B2C):                                           │
│   ═══════════════════                                           │
│                                                                  │
│   FREE            PREMIUM             PRO                       │
│   $0/mo           $10/mo ($100/yr)    $19/mo ($190/yr)         │
│   ─────────────────────────────────────────────────────────     │
│   1 pet           5 pets              5 pets                    │
│   2 caregivers    5 caregivers        5 caregivers              │
│   50 activities   Unlimited           Unlimited                 │
│   30-day history  Unlimited           Unlimited                 │
│   No GPS          GPS tracking        GPS tracking              │
│   50 photos       Unlimited           Unlimited                 │
│   No medical      Medical records     Medical records           │
│   Ads             No ads              No ads                    │
│   -               -                   Pet Analytics             │
│   -               -                   In-app QR code            │
│   -               -                   1 free physical tag       │
│                                                                  │
│   ─────────────────────────────────────────────────────────     │
│                                                                  │
│   FOR BUSINESSES (B2B):                                         │
│   ════════════════════                                          │
│                                                                  │
│   STARTER              PRO                 BUSINESS             │
│   $79/month            $149/month          $249/month           │
│   ($790/year)          ($1,490/year)       ($2,490/year)        │
│   ─────────────────────────────────────────────────────────     │
│   1 staff              5 staff             Unlimited staff      │
│   20 dogs              50 dogs             Unlimited dogs       │
│   20 tags included     50 tags included    100 tags included    │
│   +$5/tag after        +$4/tag after       +$3/tag after        │
│                                                                  │
│   ALL BUSINESS TIERS INCLUDE:                                   │
│   - Training Board (Kanban)                                     │
│   - Skill tracking & progress                                   │
│   - Badge & achievement system                                  │
│   - Homework assignments                                        │
│   - Auto-generated daily reports                                │
│   - Client portal (for your customers)                          │
│   - Team management                                             │
│   - Business analytics                                          │
│   - Custom branding (logo, colors)                              │
│   - Priority support                                            │
│                                                                  │
│   Annual billing = 2 months free                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Payment Escrow (Sitter Mode)

```
MILESTONE-BASED RELEASE:
────────────────────────

BOOKING: 5-day pet sitting ($250 total)

1. Pet parent pays $250 at booking
   → Money held in escrow (Stripe)
   → Sitter sees "Payment secured"

2. Each day, sitter completes all checklist items
   → $50/day released automatically

   Day 1: All visits completed → $50 released
   Day 2: All visits completed → $50 released
   Day 3: All visits completed → $50 released
   Day 4: All visits completed → $50 released
   Day 5: All visits completed → $50 released

3. If sitter misses visits:
   → Money stays in escrow
   → Pet parent alerted immediately
   → Can dispute or find replacement
```

---

## Notification System

### Notification Triggers

| Trigger | Recipients | Channels |
|---------|------------|----------|
| Daily report ready | Family | Email, Push |
| Badge earned | Family | Email, Push |
| Photo uploaded | Family | Push |
| Homework assigned | Family | Email, Push |
| Message received | Recipient | Push |
| Walk started | Family | Push |
| Walk completed | Family | Push, Email |
| Visit completed | Family | Push |
| **MISSED VISIT** | Family | Push, SMS, Email |
| Medication due | Caregiver | Push |
| Payment released | Caregiver | Push, Email |
| **Escalation alert** | Owner/Manager | Push, Email |

### Missed Visit Escalation

```
Visit Window: 8-9 AM

8:00 AM - No check-in yet (normal)
8:30 AM - Sitter reminder: "Visit due in 30 minutes"
8:45 AM - Sitter urgent: "Visit due in 15 minutes"
9:00 AM - Visit window closed
          → Pet parent ALERT: "Morning visit not completed"
          → Sitter warning: "Visit marked as MISSED"
          → Payment for this visit HELD
```

---

## Real-Time Updates

### How It Works

```
Provider taps "Start Training"
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE                                  │
│                                                              │
│   INSERT INTO activities (...)                              │
│                                                              │
│   → Triggers Supabase Realtime broadcast                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        │
        ├──────────────────────────────┐
        │                              │
        ▼                              ▼
┌───────────────┐            ┌───────────────┐
│ Other Trainers│            │  Pet Parent   │
│   Dashboard   │            │    Portal     │
│               │            │               │
│ Training Board│            │ Status shows: │
│ updates live  │            │ "Training"    │
└───────────────┘            └───────────────┘

NO PAGE REFRESH NEEDED
Updates appear in < 1 second
```

---

## Technical Architecture

### Tech Stack

| Component | Technology | Why |
|-----------|------------|-----|
| **Framework** | Next.js 14+ (App Router) | Server components, API routes, great DX |
| **Language** | TypeScript | Type safety, better IDE support |
| **Database** | Supabase (PostgreSQL) | Postgres + Auth + Storage + Realtime |
| **Styling** | Tailwind CSS | Rapid development, consistent design |
| **Components** | shadcn/ui | Accessible, customizable, professional |
| **Payments** | Stripe | Industry standard, escrow support |
| **Email** | Resend | Modern, developer-friendly |
| **SMS** | Twilio | Reliable text delivery |
| **Maps** | Mapbox | GPS route visualization |
| **Hosting** | Vercel | Optimized for Next.js |

### Multi-Tenant Architecture

```
Ultimate K9 (facility_id: abc-123)
├── Can only see their dogs
├── Can only see their clients
├── Can only see their staff
└── Cannot see any data from other facilities

Johnson Family (family_id: def-456)
├── Can only see their pets
├── Can only see their caregivers
└── Cannot see any data from other families

ISOLATION: Row Level Security (RLS) at database level
```

---

## Database Schema

### Core Tables

```sql
-- ACCOUNT TYPES
CREATE TYPE account_type AS ENUM ('business', 'family');

-- FACILITIES (Business accounts)
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  account_type account_type DEFAULT 'business',
  business_type TEXT, -- 'trainer', 'walker', 'sitter', 'hybrid'
  logo_url TEXT,
  stripe_customer_id TEXT,
  subscription_tier TEXT, -- 'starter', 'pro', 'business'
  subscription_status TEXT, -- 'trialing', 'active', 'canceled', 'past_due'
  tags_included INTEGER DEFAULT 0,
  tags_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAMILY ACCOUNTS
CREATE TABLE family_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_tier TEXT, -- 'free', 'premium'
  subscription_status TEXT,
  pet_limit INTEGER DEFAULT 1,
  caregiver_limit INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  facility_id UUID REFERENCES facilities,
  family_account_id UUID REFERENCES family_accounts,
  role TEXT NOT NULL, -- Business: 'owner', 'manager', 'trainer'
                      -- Family: 'family_owner', 'family_member', 'caregiver'
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  invited_by UUID REFERENCES users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERMISSION GRANTS (for delegation)
CREATE TABLE permission_grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  permission TEXT NOT NULL,
  granted_by UUID REFERENCES users NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, permission)
);

-- PETS
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities,
  family_account_id UUID REFERENCES family_accounts,
  name TEXT NOT NULL,
  species TEXT DEFAULT 'dog', -- For future: 'cat', 'horse', etc.
  breed TEXT,
  age_years INTEGER,
  age_months INTEGER,
  weight_lbs DECIMAL,
  photo_url TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  medical_notes TEXT,
  behavioral_notes TEXT,
  care_instructions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PET ACCESS
CREATE TABLE pet_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets NOT NULL,
  user_id UUID REFERENCES users NOT NULL,
  access_level TEXT NOT NULL, -- 'primary', 'family', 'caregiver'
  granted_by UUID REFERENCES users,
  can_edit_care_instructions BOOLEAN DEFAULT FALSE,
  can_invite_family BOOLEAN DEFAULT FALSE,
  can_invite_caregivers BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pet_id, user_id)
);

-- INVITATIONS
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  facility_id UUID REFERENCES facilities,
  family_account_id UUID REFERENCES family_accounts,
  pet_id UUID REFERENCES pets,
  access_level TEXT,
  invited_by UUID REFERENCES users NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITIES
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities,
  family_account_id UUID REFERENCES family_accounts,
  pet_id UUID REFERENCES pets NOT NULL,
  user_id UUID REFERENCES users NOT NULL,
  activity_type TEXT NOT NULL,
  status TEXT NOT NULL, -- 'started', 'ended'
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  station_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPS ROUTES
CREATE TABLE gps_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES activities NOT NULL,
  coordinates JSONB NOT NULL,
  distance_miles DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ESCALATION LOGS
CREATE TABLE escalation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities NOT NULL,
  actor_id UUID REFERENCES users NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  notified_user_id UUID REFERENCES users NOT NULL,
  notification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAG ORDERS
CREATE TABLE tag_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities,
  family_account_id UUID REFERENCES family_accounts,
  user_id UUID REFERENCES users NOT NULL,
  items JSONB NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER,
  total_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'delivered'
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Security & Privacy

### Authentication

**Initial Setup (Day 1):**
- Full login with email + password
- Set 4-digit PIN (keeps forever, never changes)

**Smart Session Management:**
```
Day 1:      Full login (email + password) + Set PIN
            ↓
Days 2-30:  Just open app → Auto-logged in
            ↓
Day 31:     Enter PIN (quick 4-digit)
            ↓
Days 32-60: Just open app → Auto-logged in
            ↓
Day 61:     Enter PIN
            ↓
Days 62-90: Just open app → Auto-logged in
            ↓
Day 91:     Session expired → Full login required
            (Same PIN still works after re-login)
```

**Why This Works:**
- Trainers stay fast: Login once, stay logged in, just tap tags
- PIN re-verification every 30 days catches stolen devices
- Full re-auth every 90 days ensures account security
- PIN is permanent - set once, never changes

**Additional Auth Features:**
- OAuth: Google Sign-In
- Password reset via email
- Magic links for invitations
- Biometric unlock (Face ID / Touch ID) as PIN alternative

### Authorization
- Role-based access control (RBAC)
- Permission delegation with audit trail
- Row Level Security (RLS) at database level
- Facility/Family isolation (multi-tenant)
- Pet-level access control

### Escalation Audit Trail
- All elevated permission usage logged
- Escalation notifications cannot be disabled for critical actions
- Full audit trail for compliance

---

## Lost Pet Mode

When a dog's tag is scanned, the system uses smart routing to show the right information to the right person.

### QR/NFC Tag Scanning Flow

```
Someone scans app.k9protrain.com/tag/ABC123
                ↓
         Are they logged in?
                ↓
        ┌───────┴───────┐
        ↓               ↓
       NO              YES
        ↓               ↓
   Lost Dog         Check Role
    Profile             ↓
                ┌───────┴───────┐
                ↓               ↓
             Trainer          Owner
                ↓               ↓
             Quick            Full
              Log           Profile
```

### Lost Pet Mode Settings

Pet parents can configure what strangers see when scanning their lost pet's tag:

```
Lost Pet Mode: [ON/OFF]

Show to strangers:
 ☑ Pet name
 ☑ Pet photo
 ☑ "I'm lost! Please help" banner
 ☐ My phone number
 ☑ Contact Owner button (masked email)
 ☐ My address
 ☑ Vet contact info
```

### Trainer Quick Log Screen

When a logged-in trainer scans a dog's tag, they see a fast action screen:

```
┌─────────────────────────┐
│  MAX (Golden Retriever) │
│                         │
│  [🚶 Walk]  [🍖 Feed]   │
│                         │
│  [🎓 Train] [💊 Meds]   │
│                         │
│  [📝 Note]              │
│                         │
│        ✓ Logged!        │
└─────────────────────────┘
```

**Quick Log Features:**
- One-tap activity logging
- Auto-timestamps
- Optional photo attachment
- Duration timer auto-starts
- Syncs to daily report

### Owner Full Profile View

When the pet owner scans, they see the complete pet profile with:
- All activity history
- Photo gallery
- Training progress
- Medical records
- Assigned homework
- Badge collection

---

## Navigation Structure

Simplified navigation to reduce clicks and cognitive load.

### Manager View (Sidebar - 7 items)

```
┌──────────────────────────┐
│  Dashboard               │  ← Overview, quick stats, analytics
│  Board                   │  ← Training Board (kanban)
│  Dogs                    │  ← Profiles + Kennels view
│  Clients                 │  ← Client list + Messages inline
│  Content                 │  ← Badges, Homework, Videos, Reports
│  Team                    │  ← Staff management
│  Settings ⚙️              │  ← Billing, Tags, Notifications, Account
└──────────────────────────┘
```

### Trainer View (Sidebar - 6 items)

```
┌──────────────────────────┐
│  Dashboard               │  ← Personal stats, today's dogs, analytics
│  Board                   │  ← Training Board (kanban)
│  Dogs                    │  ← Profiles + Kennels view
│  Clients                 │  ← Client list + Messages
│  Content                 │  ← Badges, Homework, Videos, Reports
│  Settings ⚙️              │  ← Notifications, Personal settings
└──────────────────────────┘
```

### Family View (Top Nav - 4 items)

```
[Dashboard]     [Pets]     [Messages]     [Settings]
```

| Tab | What's Inside |
|-----|---------------|
| **Dashboard** | Pet status cards, recent activity, analytics (Pro only) |
| **Pets** | Click pet → Activity, Photos, Progress, Medical records |
| **Messages** | Conversations with caregivers |
| **Settings** | Care Team, Tags, Account, Notifications |

### What Got Consolidated

| Before | After | Merged Into |
|--------|-------|-------------|
| Kennels | - | Dogs (as a view/filter) |
| Photos | - | Pet detail page |
| Activity | - | Pet detail page |
| Progress | - | Pet detail page |
| Care Team | - | Settings |
| Tags | - | Settings |
| Badges, Homework, Videos, Reports | Content | Single library |
| Analytics, Billing, Notifications | Settings | Admin section |

---

## File Structure

```
k9-protrain/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── invite/[token]/
│   │
│   ├── (dashboard)/              # Business interface
│   │   ├── layout.tsx
│   │   ├── dashboard/            # Overview + analytics
│   │   ├── board/                # Training Board (kanban)
│   │   ├── dogs/                 # Dog profiles + kennels
│   │   ├── clients/              # Client list + messages
│   │   ├── content/              # Badges, homework, videos, reports
│   │   ├── team/                 # Staff management
│   │   │   └── [id]/
│   │   │       └── permissions/
│   │   └── settings/             # Billing, tags, notifications
│   │
│   ├── (portal)/                 # Business client portal
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── pets/
│   │   │   └── [id]/             # Pet detail (activity, photos, progress)
│   │   ├── messages/
│   │   └── settings/             # Care team, account
│   │
│   ├── (family)/                 # Family account interface
│   │   ├── layout.tsx
│   │   ├── dashboard/            # Overview + analytics (Pro)
│   │   ├── pets/
│   │   │   └── [id]/             # Pet detail (activity, photos, progress)
│   │   ├── messages/
│   │   └── settings/             # Care team, tags, account
│   │
│   ├── tap/                      # QR/NFC landing pages
│   │   ├── dog/[id]/
│   │   ├── kennel/[id]/
│   │   └── home/[id]/
│   │
│   └── api/
│       ├── webhooks/stripe/
│       ├── cron/daily-reports/
│       └── cron/escalation-digest/
│
├── components/
├── lib/
├── hooks/
├── types/
└── supabase/
```

---

## Development Phases

### Phase 1: Foundation
- [ ] Project setup (Next.js, Supabase, Tailwind)
- [ ] Database schema creation
- [ ] Authentication (login, signup, password reset)
- [ ] Basic dashboard layout
- [ ] Multi-tenant data isolation
- [ ] User roles and permissions
- [ ] Permission delegation system
- [ ] Escalation notification system

### Phase 2: Core Dog Management
- [ ] Pet profiles (create, edit, view)
- [ ] Client management
- [ ] Invitation system
- [ ] Pet access control
- [ ] Photo upload
- [ ] Pet list with search/filter

### Phase 3: QR/NFC & Activity Logging
- [ ] QR code generation
- [ ] QR code scanning
- [ ] NFC tap support
- [ ] Activity logging (start/end)
- [ ] Activity timers
- [ ] Training Board (Kanban)
- [ ] Real-time updates

### Phase 4: Pet Parent Portal
- [ ] Portal layout
- [ ] Live status view
- [ ] Photo gallery
- [ ] Progress view
- [ ] Care team management
- [ ] Family/caregiver invitations

### Phase 5: Reports & Badges
- [ ] Daily report generation
- [ ] Report email templates
- [ ] Auto-send daily reports
- [ ] Badge system
- [ ] Badge awarding
- [ ] Certificates

### Phase 6: Family Accounts
- [ ] Family account signup
- [ ] Family dashboard
- [ ] Caregiver invitations
- [ ] Care instructions
- [ ] Tag shop (retail)
- [ ] Freemium limits enforcement

### Phase 7: GPS & Walker Features
- [ ] GPS route tracking
- [ ] Geofence check-in
- [ ] Route visualization
- [ ] Distance tracking
- [ ] Walk history

### Phase 8: Sitter Features
- [ ] Care checklists
- [ ] Medication logging
- [ ] Visit windows
- [ ] Missed visit alerts
- [ ] Payment escrow

### Phase 9: Billing & Polish
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Tag order fulfillment
- [ ] Mobile optimization
- [ ] PWA features
- [ ] Performance optimization

---

## Business Model & Pricing

### Revenue Streams

1. **Subscription fees** - Monthly/annual plans (Business + Family)
2. **Tag sales** - Retail markup on Family accounts
3. **Transaction fees** - 2.9% on payment escrow (Stripe pass-through)

### Target Metrics (Year 1)

| Metric | Target |
|--------|--------|
| Business accounts | 100 |
| Avg revenue per business | $170/month |
| Family Premium accounts | 400 |
| Family Pro accounts | 100 |
| Tag sales | $10,000 |
| **Total ARR** | **$270K+** |

**Family Revenue Breakdown:**
- 400 Premium × $10/mo = $4,000/mo
- 100 Pro × $19/mo = $1,900/mo
- Total Family = $5,900/mo ($70,800/year)

---

## Anti-Gaming Protections

Preventing businesses from using cheap Family accounts:

### Hard Limits

| Limit | Family Free | Family Premium | Business |
|-------|:-----------:|:--------------:|:--------:|
| Pets | 1 | 5 | 20+ |
| Caregivers | 2 | 5 | Unlimited staff |
| Activities/month | 50 | Unlimited | Unlimited |

**If you need 6+ pets or 6+ caregivers → Must upgrade to Business**

### Feature Gates (Family accounts DON'T get)

- Training Board (Kanban view)
- Skill tracking & progress
- Badge system
- Homework assignments
- Daily auto-reports
- Client management
- Team management
- Business analytics
- Custom branding
- Wholesale tag pricing

### Behavioral Detection

System flags accounts that look like businesses:
- 5 pets with different "owner" surnames
- High activity volume (50+ activities/week)
- Multiple caregivers logging activities daily
- Patterns matching business hours (M-F 8-5)

Flagged accounts get upgrade prompts.

---

## Glossary

### Account Types
| Term | Definition |
|------|------------|
| **Business Account** | Professional trainers, walkers, sitters. B2B. |
| **Family Account** | Pet owners managing their own care. B2C. |

### Business Roles
| Term | Definition |
|------|------------|
| **Owner** | Created facility, full control |
| **Manager** | Staff with elevated permissions |
| **Trainer** | Staff who works with dogs |

### Family Roles
| Term | Definition |
|------|------------|
| **Family Owner** | Created family account |
| **Family Member** | Spouse, partner, etc. with view access |
| **Caregiver** | Walker/sitter with limited access |

### Technical Terms
| Term | Definition |
|------|------------|
| **Multi-tenant** | Multiple accounts share app, data isolated |
| **RLS** | Row Level Security - database isolation |
| **Escalation** | Notification when elevated permissions used |
| **Permission Delegation** | Granting permissions to lower roles |

---

## Summary

K9 ProTrain is a unified platform for pet care transparency:

**For Businesses (B2B):**
- Trainers: Training board, activity logging, auto reports, badges
- Walkers: GPS routes, geofence verification, distance tracking
- Sitters: Care checklists, medication logging, payment escrow

**For Families (B2C):**
- Pet management, caregiver invites, activity tracking
- One place to see all care from all providers

**Core Innovation:** QR/NFC tap system makes logging instant (2 seconds)

**Key Differentiator:** VERIFIED PROOF across all service types

---

*K9 ProTrain - Lazy E Holdings LLC*
*USMC Veteran-Owned*
*"Time is the one resource you can't get back."*
