# Dependencies Reference - Agentic Ads

**Quick reference for all external packages used in this project**

---

## Installation Command

```bash
npm install
# or
pnpm install
# or
yarn install
```

---

## Core Framework (5 packages)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18.3.1 | UI framework |
| `react-dom` | 18.3.1 | React DOM bindings |
| `react-router` | 7.13.0 | Routing (NOT react-router-dom) |
| `vite` | 6.3.5 | Build tool |
| `typescript` | ^5.6.0 | Type safety |

---

## UI Component Libraries

### Radix UI Primitives (21 packages)
Accessible, unstyled components for building custom UI.

| Package | Version | Used For |
|---------|---------|----------|
| `@radix-ui/react-accordion` | 1.2.3 | Collapsible sections |
| `@radix-ui/react-alert-dialog` | 1.1.6 | Confirmation dialogs |
| `@radix-ui/react-aspect-ratio` | 1.1.2 | Image/video containers |
| `@radix-ui/react-avatar` | 1.1.3 | User avatars |
| `@radix-ui/react-checkbox` | 1.1.4 | Checkboxes |
| `@radix-ui/react-collapsible` | 1.1.3 | Show/hide content |
| `@radix-ui/react-context-menu` | 2.2.6 | Right-click menus |
| `@radix-ui/react-dialog` | 1.1.6 | Modal dialogs |
| `@radix-ui/react-dropdown-menu` | 2.1.6 | Dropdown menus |
| `@radix-ui/react-hover-card` | 1.1.6 | Hover tooltips |
| `@radix-ui/react-label` | 2.1.2 | Form labels |
| `@radix-ui/react-menubar` | 1.1.6 | Menu bars |
| `@radix-ui/react-navigation-menu` | 1.2.5 | Navigation menus |
| `@radix-ui/react-popover` | 1.1.6 | Popovers |
| `@radix-ui/react-progress` | 1.1.2 | Progress bars |
| `@radix-ui/react-radio-group` | 1.2.3 | Radio buttons |
| `@radix-ui/react-scroll-area` | 1.2.3 | Custom scrollbars |
| `@radix-ui/react-select` | 2.1.6 | Select dropdowns |
| `@radix-ui/react-separator` | 1.1.2 | Dividers |
| `@radix-ui/react-slider` | 1.2.3 | Sliders |
| `@radix-ui/react-slot` | 1.1.2 | Composition utility |
| `@radix-ui/react-switch` | 1.1.3 | Toggle switches |
| `@radix-ui/react-tabs` | 1.1.3 | Tab panels |
| `@radix-ui/react-toggle` | 1.1.2 | Toggle buttons |
| `@radix-ui/react-toggle-group` | 1.1.2 | Toggle groups |
| `@radix-ui/react-tooltip` | 1.1.8 | Tooltips |

### Material UI (4 packages)
Used for specific components not in Radix.

| Package | Version | Purpose |
|---------|---------|---------|
| `@mui/material` | 7.3.5 | Material UI components |
| `@mui/icons-material` | 7.3.5 | Material icons |
| `@emotion/react` | 11.14.0 | MUI peer dependency |
| `@emotion/styled` | 11.14.1 | MUI peer dependency |

---

## Icons & Assets

| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | 0.487.0 | Primary icon library |

---

## Data Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| `recharts` | 2.15.2 | Charts and graphs |

---

## Forms & Inputs

| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | 7.55.0 | Form state management (MUST use 7.55.0) |
| `react-day-picker` | 8.10.1 | Date picker |
| `date-fns` | 3.6.0 | Date utilities |
| `input-otp` | 1.4.2 | OTP input component |

---

## Styling

### Tailwind CSS (3 packages)

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 4.1.12 | Utility-first CSS framework |
| `@tailwindcss/vite` | 4.1.12 | Vite plugin for Tailwind v4 |
| `postcss` | (auto) | Required by Tailwind |

### Styling Utilities (4 packages)

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwind-merge` | 3.2.0 | Merge Tailwind classes intelligently |
| `class-variance-authority` | 0.7.1 | CVA for component variants |
| `clsx` | 2.1.1 | Conditional class names |
| `tw-animate-css` | 1.3.8 | Tailwind animation utilities |

---

## Animations & Interactions

| Package | Version | Purpose | Import From |
|---------|---------|---------|-------------|
| `motion` | 12.23.24 | Animation library (formerly Framer Motion) | `motion/react` |
| `react-dnd` | 16.0.1 | Drag and drop | - |
| `react-dnd-html5-backend` | 16.0.1 | HTML5 backend for react-dnd | - |

**Important**: Import Motion as:
```typescript
import { motion } from 'motion/react';
// NOT from 'framer-motion'
```

---

## Layout & Positioning

| Package | Version | Purpose |
|---------|---------|---------|
| `react-resizable-panels` | 2.1.7 | Resizable panel layouts |
| `react-responsive-masonry` | 2.7.1 | Masonry grid layouts |
| `react-slick` | 0.31.0 | Carousel component |
| `embla-carousel-react` | 8.6.0 | Modern carousel/slider |
| `react-popper` | 2.3.0 | Positioning engine |
| `@popperjs/core` | 2.11.8 | Popper core library |

---

## UI Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `sonner` | 2.0.3 | Toast notifications |
| `vaul` | 1.1.2 | Drawer component |
| `cmdk` | 1.1.1 | Command menu (⌘K) |
| `next-themes` | 0.4.6 | Theme management (dark mode) |

---

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@vitejs/plugin-react` | 4.7.0 | React plugin for Vite |
| `@types/react` | ^18.3.0 | TypeScript types for React |
| `@types/react-dom` | ^18.3.0 | TypeScript types for ReactDOM |

---

## Package Installation Notes

### Critical Version Requirements

**MUST use exact version:**
- `react-hook-form@7.55.0` - Other versions may cause issues

**Use React Router v7, NOT react-router-dom:**
```bash
# ✅ Correct
npm install react-router@7.13.0

# ❌ Wrong
npm install react-router-dom
```

### Peer Dependencies

**Material UI requires:**
- `@emotion/react`
- `@emotion/styled`

These are automatically included in package.json.

**React DnD requires:**
- `react-dnd-html5-backend` (for HTML5 drag and drop)

---

## Import Examples

### Common Imports

```typescript
// React & Router
import React from 'react';
import { useNavigate, Link } from 'react-router';

// UI Components
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Dialog } from '@/app/components/ui/dialog';

// Icons
import { ChevronRight, Settings, User } from 'lucide-react';

// Forms
import { useForm } from 'react-hook-form';

// Animations
import { motion } from 'motion/react';

// Charts
import { LineChart, Line, XAxis, YAxis } from 'recharts';

// Utilities
import { cn } from '@/app/components/ui/utils'; // tailwind-merge + clsx
import { format } from 'date-fns';

// Notifications
import { toast } from 'sonner';
```

---

## Troubleshooting

### Issue: "Cannot find module 'react-router-dom'"
**Solution**: This project uses `react-router` v7, not `react-router-dom`. Update imports:
```typescript
// ✅ Correct
import { useNavigate } from 'react-router';

// ❌ Wrong
import { useNavigate } from 'react-router-dom';
```

### Issue: "Motion is not defined"
**Solution**: Import from the correct path:
```typescript
// ✅ Correct
import { motion } from 'motion/react';

// ❌ Wrong
import { motion } from 'framer-motion';
```

### Issue: "Tailwind classes not applying"
**Solution**: 
1. Ensure `@tailwindcss/vite` is installed
2. Check `postcss.config.mjs` exists
3. Restart dev server

### Issue: "Module not found @/"
**Solution**: Check path alias in `vite.config.ts` and `tsconfig.json`:
```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

---

## Package Size Breakdown

**Largest Packages:**
- Radix UI primitives: ~21 packages (tree-shakeable)
- Material UI: ~4 packages
- Recharts: Charts library
- Motion: Animation library

**Total Production Dependencies**: 42 packages  
**Total Dev Dependencies**: 5 packages

**Estimated Bundle Size** (after tree-shaking and code splitting):
- Initial load: ~200-300 KB (gzipped)
- Total (all routes): ~500-700 KB (gzipped)

---

## Updating Dependencies

### Safe Updates
Most packages can be updated safely:
```bash
npm update
```

### Version-Locked Packages
These should NOT be updated without testing:
- `react-hook-form@7.55.0` - Locked to specific version
- `react-router@7.x` - Major version change could break routing

### Major Version Updates
Before updating to major versions:
1. Check breaking changes in changelog
2. Test thoroughly in dev environment
3. Update type definitions if needed
4. Check for deprecated APIs

---

## Alternative Packages

If you need to replace any packages, here are alternatives:

**Forms:**
- `react-hook-form` → `formik` or `react-final-form`

**Charts:**
- `recharts` → `chart.js` + `react-chartjs-2` or `victory`

**Animations:**
- `motion` → `react-spring` or plain CSS animations

**Drag & Drop:**
- `react-dnd` → `react-beautiful-dnd` or `@dnd-kit/core`

**Icons:**
- `lucide-react` → `react-icons` or `heroicons`

---

**Total Package Count**: 47 packages (42 production + 5 dev)

**Last Updated**: February 7, 2026
