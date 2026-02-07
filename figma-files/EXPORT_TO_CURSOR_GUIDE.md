# Cursor Export Guide - Agentic Ads

**Last Updated**: February 7, 2026

This guide will help you export the Agentic Ads project from Figma Make to Cursor or any other development environment.

## Quick Export Steps

1. **Download all project files** from Figma Make
2. **Install dependencies** using npm/pnpm/yarn
3. **Configure environment** (optional backend API URLs)
4. **Run development server**

## Required Dependencies

### Core Dependencies

Copy this into your `package.json`:

```json
{
  "name": "agentic-ads",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
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
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "typescript": "^5.6.0",
    "vite": "6.3.5"
  }
}
```

### Installation Command

```bash
# Using npm
npm install

# Using pnpm (recommended for speed)
pnpm install

# Using yarn
yarn install
```

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/          # Shadcn-style UI primitives
│   │   │   └── figma/       # Figma-specific components
│   │   ├── pages/           # Page components
│   │   │   └── admin/       # Admin-only pages
│   │   ├── onboarding/      # 3-step onboarding flow
│   │   │   ├── start/
│   │   │   ├── connect/
│   │   │   └── launch/
│   │   ├── i18n/            # Internationalization
│   │   │   ├── LanguageContext.tsx
│   │   │   ├── translations.ts
│   │   │   └── page-translations.ts
│   │   ├── routes.ts        # React Router configuration
│   │   └── App.tsx          # Main app component
│   └── styles/              # Global styles
│       ├── fonts.css
│       ├── index.css
│       ├── tailwind.css
│       └── theme.css
├── package.json
├── vite.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## Configuration Files

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### postcss.config.mjs

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

## Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
# API Configuration (optional - for backend integration)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_META_OAUTH_CLIENT_ID=your_meta_client_id
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id

# Environment
VITE_ENV=development
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Development Commands

```bash
# Start development server
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build
# Output in /dist folder

# Preview production build
npm run preview
```

## Backend Integration

### API Base URL Configuration

Create `/src/config/api.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
};

export const API_ROUTES = {
  // Customer routes
  customer: {
    dashboard: '/customer/dashboard',
    inventory: '/customer/inventory',
    ads: '/customer/ads',
    settings: '/customer/settings',
    performance: '/customer/performance',
    billing: '/customer/billing',
  },
  // Admin routes
  admin: {
    overview: '/admin/overview',
    customers: '/admin/customers',
    customerDetail: (id: string) => `/admin/customers/${id}`,
  },
  // Auth routes
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
  },
};
```

### Example API Call

```typescript
import { API_CONFIG, API_ROUTES } from '@/config/api';

async function fetchDashboard() {
  const response = await fetch(
    `${API_CONFIG.baseUrl}${API_ROUTES.customer.dashboard}`,
    {
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  
  return response.json();
}
```

## Key Implementation Notes

### 1. Authentication Flow

The app uses cookie-based authentication:
- Login sets a `session` cookie
- All customer routes use this cookie automatically
- Admin routes require `admin_session` cookie + `X-Customer-ID` header

### 2. No Spend Data in Customer UI

**CRITICAL**: Customer-facing UI NEVER displays:
- Spend amounts
- CPC (Cost Per Click)
- CPM (Cost Per Mille)
- Any `cost_per_*` metrics

These are ONLY visible in admin routes.

### 3. Routing

The app uses React Router v7 with data mode:
- All routes defined in `/src/app/routes.ts`
- Uses `createBrowserRouter` and `RouterProvider`
- Nested routes with layouts (AppLayout, AdminLayout)

### 4. Styling

- **Tailwind CSS v4** (no config file needed)
- Custom theme in `/src/styles/theme.css`
- Scandinavian design: high whitespace, clean hierarchy
- Login/Signup: Lovable.dev aesthetic (gradient orbs, glassmorphism)

### 5. Internationalization (i18n)

The app supports **3 languages**:
- 🇬🇧 **English** (en) - Default
- 🇸🇪 **Swedish** (sv) - Svenska
- 🇩🇪 **German** (de) - Deutsch

**Implementation**:
- Language context in `/src/app/i18n/LanguageContext.tsx`
- Translations in `/src/app/i18n/translations.ts` and `page-translations.ts`
- Language selector component: `<LanguageSelector />` (in header/navigation)
- Auto-detects browser language on first visit
- Saves preference to localStorage

**Usage in components**:
```typescript
import { useLanguage } from '@/app/i18n/LanguageContext';
import { translations } from '@/app/i18n/translations';

function MyComponent() {
  const { lang } = useLanguage();
  const t = translations[lang];
  
  return <button>{t.save}</button>;
}
```

### 6. Components

- UI primitives in `/src/app/components/ui/` (Radix UI + custom styling)
- Reusable components in `/src/app/components/`
- Page components in `/src/app/pages/`

## Testing the Export

### 1. Verify Installation

```bash
npm run dev
```

Should open at `http://localhost:5173`

### 2. Check Routes

Navigate to:
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page
- `/onboarding/start` - Onboarding start
- `/app/dashboard` - Dashboard (requires auth)
- `/admin/overview` - Admin overview (requires admin auth)

### 3. Verify API Integration

All API calls should fail gracefully with error states until backend is connected.

## Common Issues & Solutions

### Issue: Module not found errors

**Solution**: Ensure path aliases are configured in `vite.config.ts` and `tsconfig.json`

### Issue: Tailwind styles not applying

**Solution**: 
1. Check `postcss.config.mjs` exists
2. Verify `@tailwindcss/vite` is in devDependencies
3. Restart dev server

### Issue: React Router not working

**Solution**: Ensure you're using `react-router` v7 (NOT `react-router-dom`)

### Issue: Motion/Framer Motion errors

**Solution**: Import from `motion/react`:
```typescript
import { motion } from 'motion/react'; // Correct
// NOT from 'framer-motion'
```

## Production Deployment

### Build

```bash
npm run build
```

Output: `/dist` folder (ready for deployment)

### Deployment Platforms

**Vercel**:
```bash
npm i -g vercel
vercel
```

**Netlify**:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Static Hosting**:
Upload `/dist` folder contents to any static host.

### Environment Variables for Production

Set these in your deployment platform:
- `VITE_API_BASE_URL` - Your production API URL
- `VITE_ENV=production`

## Additional Resources

- **API Documentation**: See `API-CONTRACTS.md`
- **Data Flows**: See `DATA-FLOWS.md`
- **Error Handling**: See `ERROR-STATES.md`
- **Copy Guidelines**: See `COPY-GUIDELINES.md`
- **Main README**: See `README.md`

## Support

For issues or questions:
1. Check the documentation files in the root directory
2. Verify all dependencies are installed correctly
3. Ensure you're using the correct versions (especially React Router v7)
4. Check the browser console for detailed error messages

## Checklist for Export

- [ ] All files exported from Figma Make
- [ ] `package.json` dependencies installed
- [ ] Dev server runs without errors
- [ ] All routes accessible
- [ ] Styles rendering correctly
- [ ] API calls fail gracefully (before backend connection)
- [ ] Environment variables configured (if needed)
- [ ] Production build successful

---

**Project Complete**: Customer UI 100% complete with full accessibility audit, 3-step onboarding flow, admin pages with "Agentic Ads" branding, all ready for backend integration.