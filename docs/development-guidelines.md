# Mentoraura Frontend — Development & Contribution Guidelines

Welcome to the Mentoraura frontend engineering team! This document outlines our engineering standards, UI component structure, coding rules, and Git guidelines for building our Next.js App Router application.

---

## 1. Branching & Git Workflow

### Branch Naming Conventions
- **Feature**: `feat/<short-description>` (e.g., `feat/mentor-search-bar`)
- **Fix**: `fix/<short-description>` (e.g., `fix/mobile-nav-overflow`)
- **Refactor**: `refactor/<short-description>` (e.g., `refactor/booking-modal`)
- **Documentation**: `docs/<short-description>` (e.g., `docs/update-guidelines`)

### Workflow Rule
1. **Never push directly to `main`**. All work happens on feature branches.
2. Open a Pull Request (PR) against `main`.
3. Require at least **1 approving review** before merging.
4. Keep PRs small, focused, and testable.

---

## 2. Conventional Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

`<type>(<scope>): <short summary>`

### Types:
- `feat`: New feature or UI component
- `fix`: Bug fix
- `style`: Formatting, visual tweaks, CSS changes
- `refactor`: Code restructuring without UI functional change
- `docs`: Documentation updates

### Examples:
- `feat(mentor-profile): add availability calendar picker component`
- `fix(auth): redirect user to dashboard after login`
- `style(navigation): tweak mobile navbar padding and shadow`

---

## 3. Next.js 15 App Router Guidelines

- **Server vs. Client Components**:
  - Default to **Server Components** for data fetching, static rendering, and SEO performance.
  - Add `'use client'` only when using hooks (`useState`, `useEffect`), event listeners, or browser APIs.
- **Route Groups**: Keep pages organized inside route groups:
  - `app/(auth)/` — Login, Register, Password Reset
  - `app/(mentee)/` — Mentee Dashboard, Sessions, Mentors
  - `app/(mentor)/` — Mentor Portal, Availability, Earnings
  - `app/(admin)/` — Platform Management
  - `app/(public)/` — Landing page, Blog, Terms

---

## 4. UI Design System & Styling Rules

- **CSS & Design System**: Use CSS Modules / Vanilla CSS design tokens declared in `src/styles/` or standard utility tokens.
- **No Ad-Hoc Styles**: Avoid inline hardcoded inline styles (`style={{ color: '#123456' }}`). Use standard class names and variables.
- **Responsive & Mobile-First**: Test all components at mobile breakpoints (375px), tablet (768px), and desktop (1280px).
- **Icons & Assets**: Use SVG icon sets or optimized Next.js `<Image />` components. Do not embed raw base64 strings in components.

---

## 5. API Integration & State Management

- **API Client**: Store API request methods inside `src/lib/api/`. Keep component files clean from raw `fetch` URLs.
- **Custom Hooks**: Encapsulate complex state or async data fetching into reusable hooks (`src/lib/hooks/`).
- **Global State**: Use lightweight state stores (`src/store/`) only when state must be shared across unrelated components (e.g. auth session, active cart/checkout state).

---

## 6. Pre-Commit Quality Checklist

Before opening a PR, ensure the following pass locally:

```bash
# 1. Lint code
npm run lint

# 2. Compile & build check
npm run build
```

---

## 7. Code Review Guidelines (For Reviewers)

When reviewing frontend PRs:
- [ ] Ensure components are modular and properly placed in `components/ui/` or `components/layout/`.
- [ ] Check responsive layout on both mobile and desktop viewports.
- [ ] Verify Server vs Client component boundaries are clean.
- [ ] Ensure no secret API keys are leaked in client code (`NEXT_PUBLIC_` only for public variables).
