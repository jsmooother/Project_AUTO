# Agentic Ads - B2B SaaS Platform

**Tagline:** Smarter ads. Zero busywork.

## Overview

Agentic Ads is a premium B2B SaaS platform that automates advertising from customer website inventory. Starting with vehicle dealerships, the platform is expandable to any vertical. The product features a clean Scandinavian enterprise aesthetic with high whitespace, strong hierarchy, and trustworthy status indicators.

## Product Story (3-Step Flow)

1. **Connect Website URL** - Import your inventory automatically
2. **Connect Ad Accounts** - Link your Meta/Google ad accounts
3. **Set Rules + Budget** - Configure automation and let it run continuously

## Tech Stack

### Core
- **React** 18.3.1
- **TypeScript** (via Vite)
- **React Router** 7.13.0
- **Vite** 6.3.5
- **Tailwind CSS** 4.1.12

### UI Components & Libraries

#### Radix UI Primitives (Accessible, unstyled components)
- `@radix-ui/react-accordion` 1.2.3
- `@radix-ui/react-alert-dialog` 1.1.6
- `@radix-ui/react-aspect-ratio` 1.1.2
- `@radix-ui/react-avatar` 1.1.3
- `@radix-ui/react-checkbox` 1.1.4
- `@radix-ui/react-collapsible` 1.1.3
- `@radix-ui/react-context-menu` 2.2.6
- `@radix-ui/react-dialog` 1.1.6
- `@radix-ui/react-dropdown-menu` 2.1.6
- `@radix-ui/react-hover-card` 1.1.6
- `@radix-ui/react-label` 2.1.2
- `@radix-ui/react-menubar` 1.1.6
- `@radix-ui/react-navigation-menu` 1.2.5
- `@radix-ui/react-popover` 1.1.6
- `@radix-ui/react-progress` 1.1.2
- `@radix-ui/react-radio-group` 1.2.3
- `@radix-ui/react-scroll-area` 1.2.3
- `@radix-ui/react-select` 2.1.6
- `@radix-ui/react-separator` 1.1.2
- `@radix-ui/react-slider` 1.2.3
- `@radix-ui/react-slot` 1.1.2
- `@radix-ui/react-switch` 1.1.3
- `@radix-ui/react-tabs` 1.1.3
- `@radix-ui/react-toggle` 1.1.2
- `@radix-ui/react-toggle-group` 1.1.2
- `@radix-ui/react-tooltip` 1.1.8

#### Material UI (for specific components)
- `@mui/material` 7.3.5
- `@mui/icons-material` 7.3.5
- `@emotion/react` 11.14.0
- `@emotion/styled` 11.14.1

#### Additional UI Libraries
- `lucide-react` 0.487.0 - Icon library
- `recharts` 2.15.2 - Charts and data visualization
- `sonner` 2.0.3 - Toast notifications
- `vaul` 1.1.2 - Drawer component
- `cmdk` 1.1.1 - Command menu
- `embla-carousel-react` 8.6.0 - Carousel/slider
- `motion` 12.23.24 - Animation library (formerly Framer Motion)
- `next-themes` 0.4.6 - Theme management

#### Form & Input Libraries
- `react-hook-form` 7.55.0 - Form state management
- `react-day-picker` 8.10.1 - Date picker
- `date-fns` 3.6.0 - Date utilities
- `input-otp` 1.4.2 - OTP input component

#### Layout & Interaction
- `react-resizable-panels` 2.1.7 - Resizable panel layouts
- `react-responsive-masonry` 2.7.1 - Masonry grid layouts
- `react-slick` 0.31.0 - Carousel component
- `react-dnd` 16.0.1 - Drag and drop
- `react-dnd-html5-backend` 16.0.1 - HTML5 backend for react-dnd
- `react-popper` 2.3.0 - Positioning engine
- `@popperjs/core` 2.11.8 - Popper positioning library

#### Styling Utilities
- `tailwind-merge` 3.2.0 - Merge Tailwind classes
- `class-variance-authority` 0.7.1 - CVA for component variants
- `clsx` 2.1.1 - Class name utility
- `tw-animate-css` 1.3.8 - Tailwind animation utilities

## Project Structure

```
/src
  /app
    /components          # Reusable UI components
      /ui               # Shadcn-style UI primitives
      /figma            # Figma-specific components
    /pages              # Page components
      /admin            # Admin-only pages
    /onboarding         # 3-step onboarding flow
      /start
      /connect
      /launch
    /i18n               # Internationalization (en, sv, de)
      LanguageContext.tsx
      translations.ts
      page-translations.ts
    /styles             # Global styles and theme
    routes.ts           # React Router configuration
    App.tsx             # Main app component
```

## Key Features

### Customer UI (Scandinavian Design)
- **Dashboard** - Overview of campaigns and performance
- **Inventory** - Manage product inventory (vehicles, etc.)
- **Ads** - Ad management and setup
- **Templates** - Ad creative templates
- **Performance** - Analytics and reporting
- **Runs** - Automation run history
- **Settings** - Account and integration settings
- **Billing** - Subscription and billing management

### Onboarding (3-Step Flow)
1. **Start** - Welcome and value proposition
2. **Connect** - Website URL and data source connection
3. **Launch** - Ad account connection and rule configuration

### Admin UI
- **Overview** - System-wide metrics and health
- **Customers** - Customer management and details
- **Sources** - Data source management
- **Runs** - Global run monitoring
- **Ads** - Ad platform management
- **Billing** - Revenue and fee tracking (Agentic Ads fees)
- **System** - System configuration and health

### Public Pages
- **Landing Page** - Marketing homepage
- **Features** - Product features
- **Pricing** - Pricing tiers
- **About** - Company information
- **Login/Signup** - Authentication (Lovable.dev aesthetic with gradient orbs and glassmorphism)

## Design Principles

### Scandinavian Enterprise Aesthetic
- High whitespace for clarity
- Strong visual hierarchy
- Clean typography
- Trustworthy status indicators
- Professional color palette (blues, grays, greens)

### Login/Signup Pages
- Lovable.dev-inspired design
- Gradient orbs and glassmorphism
- Colorful, modern aesthetic
- Different from main app design

### Non-Negotiable Constraints
1. **Customer UI NEVER displays:**
   - Spend amounts
   - CPC (Cost Per Click)
   - CPM (Cost Per Mille)
   - Any `cost_per_*` metrics

2. **Customer routes must maintain:**
   - Session management
   - `x-customer-id` header behavior

3. **Admin-only spend metrics:**
   - Spend data only in admin UI/routes
   - Never exposed to customer-facing interfaces

4. **API contracts:**
   - Cannot change API paths
   - Cannot change response parsing (unless required)

## Installation

```bash
# Install dependencies
npm install

# or using pnpm
pnpm install

# or using yarn
yarn install
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Setup for Cursor/External Systems

### Required npm packages (copy to package.json dependencies):

```json
{
  "dependencies": {
    "@emotion/react": "11.14.0",
    "@emotion/styled": "11.14.1",
    "@mui/icons-material": "7.3.5",
    "@mui/material": "7.3.5",
    "@popperjs/core": "2.11.8",
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-aspect-ratio": "1.1.2",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-collapsible": "1.1.3",
    "@radix-ui/react-context-menu": "2.2.6",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-hover-card": "1.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-menubar": "1.1.6",
    "@radix-ui/react-navigation-menu": "1.2.5",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-radio-group": "1.2.3",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slider": "1.2.3",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@radix-ui/react-toggle": "1.1.2",
    "@radix-ui/react-toggle-group": "1.1.2",
    "@radix-ui/react-tooltip": "1.1.8",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "3.6.0",
    "embla-carousel-react": "8.6.0",
    "input-otp": "1.4.2",
    "lucide-react": "0.487.0",
    "motion": "12.23.24",
    "next-themes": "0.4.6",
    "react": "18.3.1",
    "react-day-picker": "8.10.1",
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-dom": "18.3.1",
    "react-hook-form": "7.55.0",
    "react-popper": "2.3.0",
    "react-resizable-panels": "2.1.7",
    "react-responsive-masonry": "2.7.1",
    "react-router": "7.13.0",
    "react-slick": "0.31.0",
    "recharts": "2.15.2",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tw-animate-css": "1.3.8",
    "vaul": "1.1.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "typescript": "^5.0.0",
    "vite": "6.3.5"
  }
}
```

## Routes

### Public Routes
- `/` - Landing page
- `/features` - Features page
- `/pricing` - Pricing page
- `/about` - About page
- `/login` - Login page
- `/signup` - Signup page
- `/reset-password` - Password reset

### Onboarding Routes (3-step)
- `/onboarding/start` - Step 1: Welcome
- `/onboarding/connect` - Step 2: Connect data sources
- `/onboarding/launch` - Step 3: Configure and launch

### Customer App Routes
- `/app/dashboard` - Main dashboard
- `/app/inventory` - Inventory management
- `/app/billing` - Billing and subscriptions
- `/app/settings` - Account settings
- `/app/templates` - Ad templates
- `/app/ads` - Ad management hub
- `/app/ads/simple` - Simple ad view
- `/app/ads/setup` - Ad setup
- `/app/ads/campaign` - Campaign details
- `/app/ads/diagnostics` - Ad diagnostics
- `/app/ads/boosts` - Ad boost management
- `/app/performance` - Performance analytics
- `/app/runs` - Automation runs

### Admin Routes
- `/admin/overview` - Admin dashboard
- `/admin/customers` - Customer list
- `/admin/customers/:id` - Customer details
- `/admin/sources` - Data sources
- `/admin/runs` - Run monitoring
- `/admin/runs/:id` - Run details
- `/admin/ads` - Ad platform management
- `/admin/billing` - Revenue tracking (Agentic Ads fees)
- `/admin/system` - System health

## Additional Documentation

See also:
- `API-CONTRACTS.md` - Backend API specifications
- `DATA-FLOWS.md` - Data flow documentation
- `ERROR-STATES.md` - Error handling patterns
- `COPY-GUIDELINES.md` - Copy writing guidelines
- `EXPORT_TO_CURSOR_GUIDE.md` - Detailed Cursor export instructions

## Notes

- Customer UI is 100% complete with full accessibility audit
- All 15 customer routes implemented with new Scandinavian design
- 3-step onboarding flow (start → connect → launch)
- Admin pages use "Agentic Ads" branding throughout
- **Internationalization**: Full support for English (en), Swedish (sv), and German (de)
  - Language context with localStorage persistence
  - Auto-detection of browser language
  - `<LanguageSelector />` component for language switching
- Login/Signup use Lovable.dev aesthetic (gradient orbs, glassmorphism)