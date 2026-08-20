# 🎨 Mentoraura Frontend — Architecture & Roadmap

> **Stack:** Next.js 15 · App Router · TypeScript · Vanilla CSS
> **Pattern:** SSR for public pages · CSR for authenticated dashboards
> **Timeline:** `Aug 19, 2026` → `Nov 19, 2026`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Rendering Strategy](#2-rendering-strategy)
3. [Route & Page Map](#3-route--page-map)
4. [Component Architecture](#4-component-architecture)
5. [API & State Layer](#5-api--state-layer)
6. [Design System](#6-design-system)
7. [Key Flows](#7-key-flows)
8. [Project Milestones](#8-project-milestones)

---

## 1. Architecture Overview

```
                        INTERNET
                            │
                 ┌──────────▼──────────┐
                 │   Cloudflare Edge   │
                 │  CDN · WAF · Cache  │
                 └──────────┬──────────┘
                            │ HTTPS / TLS
               ┌────────────┴────────────┐
               ▼                         ▼
      ┌──────────────────┐      ┌──────────────────┐
      │    Next.js App   │      │  Static Assets   │
      │  ◄── YOU ARE     │      │   via CDN Edge   │
      │       HERE       │      └──────────────────┘
      └────────┬─────────┘
               │
     ┌─────────┴──────────┐
     │                    │
     ▼                    ▼
Public Routes         Auth Routes
(SSR / SSG)           (CSR)
SEO-optimised         Client-rendered
Home · Mentors        Login · Signup
Blog · Pricing        Verify · Reset
                           │
                 ┌─────────┴──────────┐
                 │                    │
                 ▼                    ▼
        Mentee Dashboard      Mentor Dashboard
          (CSR · auth)          (CSR · auth)
                 │                    │
                 └─────────┬──────────┘
                           │
                    Admin Panel
                   (CSR · admin only)
                           │
                           ▼ REST / JSON (HTTPS)
               ┌───────────────────────────┐
               │       NestJS API          │
               │    (All business logic)   │
               └───────────────────────────┘
```

> **Core rule:** The frontend renders; the API decides.
>
> ❌ Wrong → `if (paymentSuccess) activateMentorship()`
> ✅ Right &nbsp;→ API returns `{ mentorship: { status: "active" } }` — render that

---

## 2. Rendering Strategy

| Route Group | Strategy | Reason |
|-------------|----------|--------|
| `(public)` — Home, Mentors, Blog | **SSR / ISR** | SEO — must be indexable by search engines |
| `(public)` — Mentor Profile | **SSR** | Dynamic but must be crawlable |
| `(auth)` — Login / Signup | **CSR** | Not SEO-sensitive, interactive |
| `(mentee)` — Dashboard | **CSR** | Private, interactive, not indexed |
| `(mentor)` — Dashboard | **CSR** | Private, interactive, not indexed |
| `(admin)` — Admin Panel | **CSR** | Internal-only, access-controlled |

**Public page SEO requirements:**
- `<title>` and `<meta name="description">` on every page
- Single `<h1>` per page
- Semantic HTML5 elements (`<main>`, `<article>`, `<nav>`, `<section>`)
- Structured data (JSON-LD) on mentor profiles

---

## 3. Route & Page Map

```
src/app/
│
├── (public)/                        SSR / ISR — public, SEO-indexed
│   ├── page.tsx                     Home — hero, featured mentors, how it works
│   ├── mentors/
│   │   ├── page.tsx                 Mentor directory — search, filter, browse
│   │   └── [slug]/
│   │       └── page.tsx             Mentor public profile — bio, plans, reviews
│   ├── pricing/
│   │   └── page.tsx                 Pricing explanation
│   ├── about/
│   │   └── page.tsx                 About Mentoraura
│   ├── blog/
│   │   ├── page.tsx                 Blog index — article cards
│   │   └── [slug]/
│   │       └── page.tsx             Blog post — SSG + ISR
│   └── legal/
│       └── page.tsx                 Terms of Service · Privacy Policy
│
├── (auth)/                          CSR — authentication flows
│   ├── signup/
│   │   └── page.tsx                 Registration form
│   ├── login/
│   │   └── page.tsx                 Login form
│   ├── verify/
│   │   └── page.tsx                 Email verification
│   └── forgot-password/
│       └── page.tsx                 Password reset request + set-new
│
├── (mentee)/                        CSR — protected, role: mentee
│   └── dashboard/
│       ├── page.tsx                 Overview — active mentorships, next session
│       ├── mentorships/
│       │   └── page.tsx             List of mentorships + status
│       ├── messages/
│       │   ├── page.tsx             Conversation inbox
│       │   └── [id]/
│       │       └── page.tsx         Conversation thread
│       ├── bookings/
│       │   └── page.tsx             Upcoming + past sessions
│       ├── billing/
│       │   └── page.tsx             Payment history + invoices
│       ├── wishlist/
│       │   └── page.tsx             Saved / bookmarked mentors
│       └── settings/
│           └── page.tsx             Account · notification preferences
│
├── (mentor)/                        CSR — protected, role: mentor
│   └── mentor/
│       ├── overview/
│       │   └── page.tsx             Stats — earnings, mentees, rating
│       ├── application/
│       │   └── page.tsx             Application status tracker
│       ├── profile/
│       │   └── page.tsx             Edit public profile
│       ├── plans/
│       │   └── page.tsx             Manage subscription plans
│       ├── sessions/
│       │   └── page.tsx             Upcoming + past sessions
│       ├── availability/
│       │   └── page.tsx             Weekly schedule builder
│       ├── mentees/
│       │   └── page.tsx             Active mentees list
│       ├── messages/
│       │   ├── page.tsx             Message inbox
│       │   └── [id]/
│       │       └── page.tsx         Conversation thread
│       ├── earnings/
│       │   └── page.tsx             Earnings + payout history
│       └── reviews/
│           └── page.tsx             Reviews received
│
└── (admin)/                         CSR — protected, role: admin
    └── admin/
        ├── applications/
        │   └── page.tsx             Review mentor applications
        ├── users/
        │   └── page.tsx             User management
        ├── payments/
        │   └── page.tsx             Payment oversight
        ├── payouts/
        │   └── page.tsx             Payout management
        ├── disputes/
        │   └── page.tsx             Dispute resolution
        ├── moderation/
        │   └── page.tsx             Content moderation queue
        ├── content/
        │   └── page.tsx             CMS — blog + resources
        ├── configuration/
        │   └── page.tsx             Feature flags · platform settings
        └── analytics/
            └── page.tsx             Revenue · users · mentorships
```

---

## 4. Component Architecture

```
src/components/
│
├── ui/                   Primitive design-system components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Spinner.tsx
│   ├── Toast.tsx
│   └── Pagination.tsx
│
├── layout/               Page shells and navigation
│   ├── PublicHeader.tsx
│   ├── PublicFooter.tsx
│   ├── DashboardSidebar.tsx
│   ├── DashboardTopBar.tsx
│   └── AdminSidebar.tsx
│
├── forms/                Validated form components
│   ├── AuthForm.tsx
│   ├── MentorApplicationForm.tsx
│   ├── AvailabilityForm.tsx
│   ├── PlanForm.tsx
│   └── ReviewForm.tsx
│
├── mentor/               Mentor-domain UI blocks
│   ├── MentorCard.tsx
│   ├── MentorProfileHero.tsx
│   ├── PlanCard.tsx
│   └── MentorStats.tsx
│
├── mentee/               Mentee-domain UI blocks
│   ├── MentorshipCard.tsx
│   └── BookingCard.tsx
│
├── scheduling/           Calendar and booking UI
│   ├── AvailabilityCalendar.tsx
│   ├── TimeSlotPicker.tsx
│   └── BookingConfirmation.tsx
│
├── messaging/            Chat UI
│   ├── ConversationList.tsx
│   ├── MessageThread.tsx
│   └── MessageInput.tsx
│
├── payments/             Checkout and billing UI
│   ├── CheckoutForm.tsx
│   ├── PaymentMethodSelector.tsx
│   └── InvoiceCard.tsx
│
├── admin/                Admin-specific UI blocks
│   ├── ApplicationReviewCard.tsx
│   ├── DisputeCard.tsx
│   └── AnalyticsChart.tsx
│
└── shared/               Cross-cutting UI
    ├── EmptyState.tsx
    ├── ErrorBoundary.tsx
    ├── SearchBar.tsx
    └── StarRating.tsx
```

---

## 5. API & State Layer

### API Client

All HTTP calls go through a single typed client — never raw `fetch()` in components.

```typescript
// src/lib/api/client.ts
import { apiClient } from '@/lib/api/client';

// GET (Server Component or hook)
const { data } = await apiClient.get<MentorProfile[]>('/mentors');

// POST (authenticated)
const { data } = await apiClient.post('/bookings', payload, accessToken);
```

### State Management

| Scope | Tool |
|-------|------|
| Server data (lists, profiles) | Server Components + `fetch` with `cache` |
| Client data fetching | SWR or React Query in Client Components |
| Auth session (user, tokens) | Zustand store / Next.js session |
| UI state (modals, drawers) | Local `useState` — never global |

### Auth Flow

```
User submits login form
        │
        ▼
POST /auth/login  (via apiClient)
        │
        ▼
Store tokens (httpOnly cookie or memory)
        │
        ▼
Redirect to role-appropriate dashboard
        │
        ├── mentee → /dashboard
        ├── mentor → /mentor/overview
        └── admin  → /admin/applications
```

Route protection: Next.js middleware checks session and redirects unauthenticated users to `/login`.

---

## 6. Design System

```
src/styles/
├── globals.css       Design tokens (CSS custom properties)
├── typography.css    Font scale, line-heights
└── utilities.css     Spacing, layout helpers
```

### Token Conventions

```css
/* Colours */
--color-primary-500: hsl(258, 75%, 58%);
--color-surface:     hsl(220, 20%, 10%);

/* Spacing (8pt grid) */
--space-1: 4px;   --space-2: 8px;
--space-4: 16px;  --space-6: 24px;
--space-8: 32px;  --space-12: 48px;

/* Typography */
--font-sans: 'Inter', system-ui, sans-serif;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-2xl: 1.5rem;
--text-4xl: 2.25rem;
```

**Rules:**
- Components use CSS Modules (`.module.css`) — no inline styles
- No Tailwind (unless team decides otherwise — document that decision here)
- Google Font `Inter` loaded via `next/font`

---

## 7. Key Flows

### Complete Mentorship Flow (frontend perspective)

```
Mentor fills application form
        │ POST /mentor/apply
        ▼
Application submitted → status page shown
        │ (admin approves via backend)
        ▼
Profile published → visible in /mentors directory

Mentee searches → filters → opens /mentors/[slug]
        │ POST /mentorships/apply
        ▼
Mentor accepts → Mentee notified
        │
        ▼
Free intro call booked → Google Meet link shown
        │
        ▼
Mentee selects plan → Checkout page
        │ POST /payments/checkout
        ▼
Payment provider UI (MTN / Orange / Card)
        │ Webhook → NestJS activates mentorship
        ▼
Dashboard shows active mentorship
        │
        ├──► /dashboard/messages/[id]   → chat
        └──► /dashboard/bookings        → schedule sessions
                       │ POST review when session complete
                       ▼
              Review submitted → mentor rating updated
```

### Complete Payment Flow (frontend perspective)

```
Mentee on /mentors/[slug] clicks "Choose Plan"
        │
        ▼
/checkout?planId=xxx  (CheckoutForm component)
        │
        ▼
User selects payment method (MTN / Orange / Card)
        │ POST /payments/checkout  { planId, method, idempotencyKey }
        ▼
API returns { redirectUrl } or { ussdCode }
        │
        ▼
Frontend shows USSD prompt OR redirects to payment page
        │ (user completes payment out-of-band)
        ▼
Frontend polls GET /payments/:ref/status  OR
        receives redirect callback
        │
        ▼
On success → redirect to /dashboard?payment=success
On failure → show error with retry option
```

---

## 8. Project Milestones

> 📅 **Start:** August 19, 2026 &nbsp;·&nbsp; **Deadline:** November 19, 2026
> Use `- [x]` to mark items complete. Every feature branches from `develop`.

---

### 🏗️ Phase 1 — Foundation `Aug 19 – Sep 16`

#### Week 1 &nbsp;·&nbsp; Aug 19–26 &nbsp;·&nbsp; Project Setup
- [ ] Repository pushed to GitHub with `main` + `develop` branches
- [ ] Branch protection rules enabled on `main`
- [ ] CI pipeline green (lint · typecheck · build)
- [ ] `Inter` font loaded via `next/font`
- [ ] Global CSS design tokens defined (`globals.css`)
- [ ] Public layout shell — `PublicHeader` + `PublicFooter`
- [ ] Dashboard layout shell — `DashboardSidebar` + `DashboardTopBar`
- [ ] `src/lib/api/client.ts` — typed fetch wrapper verified
- [ ] `src/lib/types/index.ts` — all domain types synced with backend

#### Week 2 &nbsp;·&nbsp; Aug 26 – Sep 2 &nbsp;·&nbsp; Authentication Pages
- [ ] `/signup` — registration form with validation (email · password · name)
- [ ] `/login` — login form with JWT storage
- [ ] `/verify` — email verification token page
- [ ] `/forgot-password` — request reset + set-new-password pages
- [ ] `AuthForm` component with error states + loading states
- [ ] Next.js middleware: redirect unauthenticated users from protected routes
- [ ] Role-based redirect on login (mentee / mentor / admin)
- [ ] Unit tests for auth utility functions

#### Week 3 &nbsp;·&nbsp; Sep 2–9 &nbsp;·&nbsp; Public Pages (SSR / SEO)
- [ ] `/` — Home page: hero, featured mentors, how-it-works, CTA sections
- [ ] `/mentors` — Mentor directory with `SearchBar` + category filters
- [ ] `/mentors/[slug]` — Mentor profile: bio, plans, reviews, book CTA
- [ ] `/pricing` — Pricing explainer page
- [ ] `/about` — About Mentoraura
- [ ] All public pages have `<title>`, `<meta description>`, semantic HTML
- [ ] `MentorCard` component rendering from API data
- [ ] `StarRating` component for review display

#### Week 4 &nbsp;·&nbsp; Sep 9–16 &nbsp;·&nbsp; Design System Polish
- [ ] `Button` — variants: primary · secondary · ghost · danger
- [ ] `Input`, `Select`, `Textarea` — with error states
- [ ] `Modal` + `Toast` notification component
- [ ] `Badge` — status display (active · pending · suspended)
- [ ] `Avatar` with fallback initials
- [ ] `Pagination` component
- [ ] `EmptyState` component (no results, no data)
- [ ] `ErrorBoundary` component
- [ ] `Spinner` / skeleton loading states
- [ ] Responsive breakpoints verified (mobile · tablet · desktop)

---

### ⚙️ Phase 2 — Core Features `Sep 16 – Oct 21`

#### Week 5 &nbsp;·&nbsp; Sep 16–23 &nbsp;·&nbsp; Mentee Dashboard
- [ ] `/dashboard` — overview: active mentorships, next booking, quick stats
- [ ] `/dashboard/mentorships` — list with status badges + actions
- [ ] `/dashboard/bookings` — upcoming and past sessions with meeting links
- [ ] `/dashboard/wishlist` — saved mentors grid
- [ ] `/dashboard/settings` — account details · password change · notification prefs
- [ ] `MentorshipCard` + `BookingCard` components
- [ ] API data-fetching hooks for dashboard sections

#### Week 6 &nbsp;·&nbsp; Sep 23–30 &nbsp;·&nbsp; Mentor Application & Dashboard
- [ ] `/mentor/application` — multi-step application form (profile · skills · KYC upload)
- [ ] `/mentor/overview` — stats: total mentees, earnings, average rating, next session
- [ ] `/mentor/profile` — edit bio · avatar · headline · skills · languages
- [ ] `/mentor/plans` — create · edit · deactivate plans
- [ ] `/mentor/availability` — weekly schedule builder (`AvailabilityCalendar`)
- [ ] `/mentor/mentees` — list of active mentees with mentorship status
- [ ] `/mentor/reviews` — all reviews received with pagination

#### Week 7 &nbsp;·&nbsp; Sep 30 – Oct 7 &nbsp;·&nbsp; Scheduling & Payments
- [ ] `/mentors/[slug]` — `TimeSlotPicker` showing mentor available slots
- [ ] `BookingConfirmation` modal — date · time · duration · meeting link
- [ ] `/checkout` — `CheckoutForm` with payment method selector
- [ ] `PaymentMethodSelector` — MTN MoMo · Orange Money · Card options
- [ ] USSD prompt display for mobile money payments
- [ ] Payment status polling / redirect callback handler
- [ ] `/dashboard/billing` — payment history with `InvoiceCard` components
- [ ] Success / failure states with retry option

#### Week 8 &nbsp;·&nbsp; Oct 7–14 &nbsp;·&nbsp; Messaging
- [ ] `/dashboard/messages` — `ConversationList` inbox with unread badges
- [ ] `/dashboard/messages/[id]` — `MessageThread` with `MessageInput`
- [ ] Optimistic message send (message appears immediately, syncs on response)
- [ ] File attachment upload UI with progress indicator
- [ ] Same messaging UI in `/mentor/messages/[id]`
- [ ] Mark-as-read on thread open
- [ ] Empty state for no conversations

#### Week 9 &nbsp;·&nbsp; Oct 14–21 &nbsp;·&nbsp; Earnings, Reviews & Notifications
- [ ] `/mentor/earnings` — balance · earnings breakdown · payout history
- [ ] Payout request UI — "Request Payout" button + confirmation modal
- [ ] `ReviewForm` — star rating + written review, post-session trigger
- [ ] In-app notification bell with unread count badge
- [ ] Notification dropdown — list of recent notifications
- [ ] Mark notification as read on click
- [ ] Toast notifications for key actions (booking confirmed, payment received)

---

### 🚀 Phase 3 — Polish & Launch `Oct 21 – Nov 19`

#### Week 10 &nbsp;·&nbsp; Oct 21–28 &nbsp;·&nbsp; Admin Panel
- [ ] `/admin/applications` — application cards with approve / reject actions
- [ ] `/admin/users` — searchable user table with suspend / activate
- [ ] `/admin/payments` — payment list with status filters
- [ ] `/admin/payouts` — payout batch management
- [ ] `/admin/disputes` — dispute resolution interface
- [ ] `/admin/moderation` — message and review moderation queue
- [ ] `/admin/content` — blog and resource CMS editor
- [ ] `/admin/configuration` — feature flags toggle UI
- [ ] `/admin/analytics` — revenue · signups · mentorship charts (`AnalyticsChart`)

#### Week 11 &nbsp;·&nbsp; Oct 28 – Nov 4 &nbsp;·&nbsp; Hardening
- [ ] All forms validated client-side with Zod schemas
- [ ] All API error responses handled gracefully with user-facing messages
- [ ] No raw error objects shown to users in production
- [ ] Loading skeletons on all data-fetching pages
- [ ] `ErrorBoundary` wrapping all route segments
- [ ] Lighthouse score ≥ 90 on all public pages (performance · SEO · accessibility)
- [ ] All images use `next/image` with correct `alt` text
- [ ] Keyboard navigation verified across all interactive components
- [ ] WCAG 2.1 AA contrast ratios verified

#### Week 12 &nbsp;·&nbsp; Nov 4–11 &nbsp;·&nbsp; Staging & QA
- [ ] Frontend deployed to staging environment
- [ ] Staging connected to staging API (sandbox payment credentials)
- [ ] All CI jobs green on staging deployments
- [ ] Cross-browser testing: Chrome · Firefox · Safari · mobile browsers
- [ ] Full user journey QA: signup → mentor apply → book → pay → message → review
- [ ] `npm audit` — zero high-severity findings
- [ ] `next build` output reviewed — no errors or warnings

#### Week 13 &nbsp;·&nbsp; Nov 11–19 &nbsp;·&nbsp; Production Launch 🎉
- [ ] Production environment deployed
- [ ] `NEXT_PUBLIC_API_URL` points to production API
- [ ] CDN caching rules verified for public pages
- [ ] Core Web Vitals passing in production (LCP · FID · CLS)
- [ ] All public pages indexed in Google Search Console
- [ ] Sitemap (`/sitemap.xml`) and `robots.txt` live
- [ ] Sentry error tracking integrated and alerts configured
- [ ] `v1.0.0` tag pushed to `main`
- [ ] **🚀 Mentoraura Frontend v1.0.0 is LIVE**

---

## Milestone Progress

| Phase | Period | Items | Status |
|-------|--------|-------|--------|
| 🏗️ Phase 1 — Foundation | Aug 19 – Sep 16 | 28 tasks | 🔲 In Progress |
| ⚙️ Phase 2 — Core Features | Sep 16 – Oct 21 | 32 tasks | 🔲 Not Started |
| 🚀 Phase 3 — Polish & Launch | Oct 21 – Nov 19 | 26 tasks | 🔲 Not Started |

---

> **Last updated:** August 19, 2026
> **Owner:** Frontend Team
> **Branch strategy:** all features branch from `develop` · PRs require CI green · merge to `main` on release only
