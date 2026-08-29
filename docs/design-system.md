# MentorAura Frontend — Design System & Color Palette Guidelines

This document outlines the official design system, color tokens, component patterns, and visual hierarchy for the **MentorAura Frontend** (Next.js 15 App Router). 

All frontend engineers must follow these guidelines to maintain a cohesive, high-end, and accessible user interface.

---

## 🎨 1. Brand Color System

The MentorAura palette combines **Warm Orange** (`#F97316`) for energy and action with **Deep Navy** (`#172033`) for structure, trust, and legibility.

### 🔴 Core Brand Tokens

| Role | Color Name | Hex Code | Usage & Placement Rules |
|---|---|---|---|
| **Primary** | Warm Orange | `#F97316` | Main CTAs, Primary Action Buttons, Active Tabs, Highlights. **Use sparingly** for key actions only! |
| **Primary Hover** | Dark Orange | `#EA580C` | Hover states for primary buttons and interactive elements. |
| **Primary Light** | Soft Orange | `#FFF7ED` | Active card backgrounds, badge fills, subtle container highlights. |
| **Secondary** | Deep Navy | `#172033` | Navbars, Footers, Main Headings (H1/H2/H3), Structure. |
| **Secondary Hover** | Dark Navy | `#0F172A` | Hover state for navy buttons and dark surfaces. |
| **Background** | Warm White | `#FFFCF9` | Main page background color (warmer & friendlier than sterile pure white). |
| **Surface / Card** | Pure White | `#FFFFFF` | Cards, Modals, Forms, Dropdowns, Input fields. |
| **Main Text** | Charcoal | `#1F2937` | Body copy, readable text labels, form input values. |
| **Secondary Text** | Slate | `#64748B` | Subtitles, metadata, placeholders, secondary descriptions. |
| **Border** | Light Gray | `#E5E7EB` | Card outlines, input borders, structural dividers. |

---

### 🚦 Status & Feedback Tokens

| Status | Color | Hex Code | Purpose |
|---|---|---|---|
| **Success** | Green | `#16A34A` | Completed sessions, verified mentor badges, payment success |
| **Error** | Red | `#DC2626` | Validation errors, failed transactions, danger actions |
| **Warning** | Amber | `#F59E0B` | Ratings stars, pending approval state |

---

## 🧩 2. Reusable Modular Components

All shared UI components live in `src/components/ui/` and `src/components/layout/`. They are strictly decoupled and accept custom standard HTML attributes.

### 1. `Button` (`src/components/ui/Button.tsx`)
```tsx
import { Button } from '@/components/ui/Button';

// Primary CTA Button (Warm Orange)
<Button variant="primary" size="lg">Find a Mentor</Button>

// Secondary Button (Deep Navy)
<Button variant="secondary" size="md">Apply as Mentor</Button>

// Outline Button
<Button variant="outline" size="sm">Cancel</Button>
```

### 2. `Input` (`src/components/ui/Input.tsx`)
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  leftIcon={<Mail className="w-4 h-4 text-[#64748B]" />}
  error={errors.email}
/>
```

### 3. `Card` (`src/components/ui/Card.tsx`)
```tsx
import { Card } from '@/components/ui/Card';

// Interactive Mentor Profile Card
<Card variant="hoverable" padding="lg">
  {/* Content */}
</Card>
```

### 4. `Badge` (`src/components/ui/Badge.tsx`)
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="orange" size="md">Top Rated</Badge>
<Badge variant="success" size="sm">Available Now</Badge>
```

---

## 📐 3. UI & Layout Best Practices

1. **Avoid Orange Overuse**: Do not make every header orange. Orange is reserved for **Energy & Action** (Buttons, Badges, Links). Deep Navy handles **Trust & Structure** (Headers, Navbars).
2. **Card Surfaces**: Always place form containers, modals, and profile cards inside `Card` components with background `#FFFFFF` over the `#FFFCF9` warm page background to create natural depth.
3. **Glassmorphism Navbars**: Sticky headers use the `.glass-nav` CSS class for modern backdrop blur.
