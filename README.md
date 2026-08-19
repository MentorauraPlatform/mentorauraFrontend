# Mentoraura — Frontend

> **Next.js 15 · App Router · TypeScript** — Presentation layer for the Mentoraura mentorship marketplace

[![CI — Frontend](https://github.com/YOUR_ORG/mentoraura-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/mentoraura-frontend/actions/workflows/ci.yml)

---

## Table of Contents

- [Overview](#overview)
- [Architecture Principle](#architecture-principle)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Page Map](#page-map)
- [Rendering Strategy](#rendering-strategy)
- [API Layer](#api-layer)
- [State Management](#state-management)
- [Styling](#styling)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [Branch Strategy](#branch-strategy)

---

## Overview

Mentoraura Frontend is the **Next.js presentation layer** for the Mentoraura platform. It handles:

- **Public marketing site** — SEO-optimised server-rendered pages for mentor discovery, pricing, blog, etc.
- **Mentee dashboard** — manage mentorships, messages, bookings, and billing
- **Mentor dashboard** — manage profile, availability, plans, sessions, earnings, and reviews
- **Admin panel** — applications, users, payments, payouts, disputes, moderation, analytics

The frontend **owns zero business logic**. Every state change goes through the NestJS API.

---

## Architecture Principle

> ❌ **Wrong** — frontend decides:
> ```
> "Payment succeeded → activate mentorship"
> ```
>
> ✅ **Correct** — API decides:
> ```
> NestJS verifies payment → NestJS activates mentorship → frontend renders the result
> ```

The frontend's only job is to **render data** and **send user intent to the API**.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 LTS |
| npm | 10+ |
| Mentoraura Backend | running on `localhost:4000` |

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_ORG/mentoraura-frontend.git
cd mentoraura-frontend

# 2. Install dependencies
npm install

# 3. Copy environment template and fill in values
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values.

> ⚠️ **Never commit `.env.local` to version control.**

See [`.env.example`](./.env.example) for a full reference.

---

## Project Structure

```
mentoraura-frontend/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI pipeline
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # SSR/SSG public pages (SEO)
│   │   │   ├── page.tsx              # Home
│   │   │   ├── mentors/              # Mentor directory + profiles
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   ├── blog/
│   │   │   └── legal/
│   │   ├── (auth)/                   # Login, Signup, Verify, Forgot PW
│   │   ├── (mentee)/                 # Mentee dashboard (client-rendered)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx          # Overview
│   │   │       ├── mentorships/
│   │   │       ├── messages/
│   │   │       ├── bookings/
│   │   │       ├── billing/
│   │   │       ├── wishlist/
│   │   │       └── settings/
│   │   ├── (mentor)/                 # Mentor dashboard (client-rendered)
│   │   │   └── mentor/
│   │   │       ├── overview/
│   │   │       ├── application/
│   │   │       ├── profile/
│   │   │       ├── plans/
│   │   │       ├── sessions/
│   │   │       ├── availability/
│   │   │       ├── mentees/
│   │   │       ├── messages/
│   │   │       ├── earnings/
│   │   │       └── reviews/
│   │   └── (admin)/                  # Admin panel (client-rendered)
│   │       └── admin/
│   │           ├── applications/
│   │           ├── users/
│   │           ├── payments/
│   │           ├── payouts/
│   │           ├── disputes/
│   │           ├── moderation/
│   │           ├── content/
│   │           ├── configuration/
│   │           └── analytics/
│   ├── components/
│   │   ├── ui/                       # Primitive UI components (Button, Input, Modal)
│   │   ├── layout/                   # Header, Footer, Sidebar, Nav
│   │   ├── forms/                    # Form components + validation
│   │   ├── mentor/                   # Mentor-specific components
│   │   ├── mentee/                   # Mentee-specific components
│   │   ├── admin/                    # Admin-specific components
│   │   ├── messaging/                # Chat components
│   │   ├── scheduling/               # Calendar/booking components
│   │   ├── payments/                 # Checkout, billing components
│   │   └── shared/                   # Cross-cutting components
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts             # Centralized API client (fetch wrapper)
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── utils/                    # Pure utility functions
│   │   ├── validators/               # Zod schemas for form validation
│   │   ├── constants/                # App-wide constants
│   │   └── types/
│   │       └── index.ts              # Shared TypeScript types (mirrors backend model)
│   ├── store/                        # Client-side state (Zustand / React Context)
│   └── styles/                       # Global CSS and design tokens
├── public/                           # Static assets
├── .env.example
├── .gitignore
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Page Map

### Public (SSR / SSG — for SEO)
| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/mentors` | Mentor directory (filterable, searchable) |
| `/mentors/[slug]` | Public mentor profile |
| `/pricing` | Pricing page |
| `/about` | About Mentoraura |
| `/blog` | Blog index |
| `/blog/[slug]` | Blog post |
| `/legal` | Terms of Service, Privacy Policy |

### Auth
| Route | Description |
|-------|-------------|
| `/signup` | Registration |
| `/login` | Login |
| `/verify` | Email verification |
| `/forgot-password` | Password reset flow |

### Mentee Dashboard (client-rendered, authenticated)
| Route | Description |
|-------|-------------|
| `/dashboard` | Mentee overview |
| `/dashboard/mentorships` | Active mentorships |
| `/dashboard/messages` | Inbox |
| `/dashboard/messages/[id]` | Conversation |
| `/dashboard/bookings` | Upcoming sessions |
| `/dashboard/billing` | Payment history |
| `/dashboard/wishlist` | Saved mentors |
| `/dashboard/settings` | Account settings |

### Mentor Dashboard (client-rendered, authenticated)
| Route | Description |
|-------|-------------|
| `/mentor/overview` | Mentor stats |
| `/mentor/application` | Application status |
| `/mentor/profile` | Edit public profile |
| `/mentor/plans` | Manage plans |
| `/mentor/sessions` | Upcoming sessions |
| `/mentor/availability` | Set schedule |
| `/mentor/mentees` | Active mentees |
| `/mentor/messages` | Messaging inbox |
| `/mentor/earnings` | Earnings & payout history |
| `/mentor/reviews` | Reviews received |

### Admin (client-rendered, admin only)
| Route | Description |
|-------|-------------|
| `/admin/applications` | Review mentor applications |
| `/admin/users` | User management |
| `/admin/payments` | Payment oversight |
| `/admin/payouts` | Payout management |
| `/admin/disputes` | Dispute resolution |
| `/admin/moderation` | Content moderation |
| `/admin/content` | CMS content |
| `/admin/configuration` | Platform settings |
| `/admin/analytics` | Reporting & analytics |

---

## Rendering Strategy

| Area | Strategy | Reason |
|------|----------|--------|
| Public pages | SSR / ISR | SEO — mentor profiles, marketing pages need to be indexable |
| Dashboard pages | Client-side | Fast interactivity; not SEO-sensitive |
| Blog posts | SSG + ISR | Content rarely changes; cache-friendly |

---

## API Layer

All API calls are centralised in [`src/lib/api/client.ts`](./src/lib/api/client.ts).

```typescript
import { apiClient } from '@/lib/api/client';

// Example: fetch mentor list
const { data } = await apiClient.get<MentorProfile[]>('/mentors');

// Example: authenticated post
const { data } = await apiClient.post('/mentorships', payload, accessToken);
```

Never use raw `fetch()` in page/component files — always go through the client wrapper.

---

## State Management

| Scope | Approach |
|-------|----------|
| Server data (lists, profiles) | `fetch` in Server Components or SWR/React Query in Client Components |
| Auth state (user, tokens) | Zustand store or React Context |
| UI state (modals, tabs) | Local `useState` |

---

## Styling

- **Vanilla CSS** with CSS custom properties (design tokens)
- Global tokens defined in `src/styles/globals.css`
- Component styles co-located: `ComponentName.module.css`
- No Tailwind (unless a later team decision changes this)

---

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Testing stack: **Jest + React Testing Library**

Test files: `*.test.ts` / `*.test.tsx` co-located with source files.

---

## CI/CD

Every push and pull request to `main` or `develop` runs the CI pipeline:

| Job | What it checks |
|-----|----------------|
| `lint-and-typecheck` | ESLint + `tsc --noEmit` |
| `unit-tests` | Jest tests |
| `build` | `npm run build` (Next.js production build) |
| `security-audit` | `npm audit --audit-level=high` |

See [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

---

## Contributing

1. **Branch from `develop`** — never commit directly to `main`
2. **Branch naming**: `feat/`, `fix/`, `chore/`, `docs/` prefix  
   e.g. `feat/mentor-profile-page`, `fix/messaging-scroll-bug`
3. **Commits**: follow [Conventional Commits](https://www.conventionalcommits.org/)  
   e.g. `feat(mentor): add availability calendar component`
4. **Pull Requests**: must pass all CI jobs before merge
5. **No business logic in components** — if you find yourself writing conditional state from a payment result, it belongs in the API

---

## Branch Strategy

```
main        ← production deployments only (protected)
develop     ← integration branch; all feature PRs target here
feat/*      ← new features
fix/*       ← bug fixes
chore/*     ← tooling, dependencies, config
docs/*      ← documentation only
release/*   ← release preparation
```
