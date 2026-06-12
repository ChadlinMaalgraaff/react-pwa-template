# Component Structure Guide

## Overview
This template follows a clean, modular component organization with each component having its own folder, CSS file, and clear separation of concerns.

## Directory Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── index.ts              # Layout exports
│   │   ├── Header/
│   │   │   ├── Header.tsx        # Component logic
│   │   │   └── Header.css        # Component styles
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Sidebar.css
│   │   └── Layout/
│   │       ├── Layout.tsx
│   │       └── Layout.css
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Dashboard.css
│   │   └── NotFound/
│   │       ├── NotFound.tsx
│   │       └── NotFound.css
│   └── shared/
│       ├── index.ts              # Shared exports
│       ├── Button/
│       │   ├── Button.tsx
│       │   └── Button.css
│       ├── Card/
│       │   ├── Card.tsx
│       │   └── Card.css
│       ├── Input/
│       │   ├── Input.tsx
│       │   └── Input.css
│       └── __tests__/
│           ├── Button.test.tsx
│           └── Input.test.tsx
├── stories/                      # Storybook stories (separate from components)
│   ├── Button.stories.tsx
│   ├── Card.stories.tsx
│   └── Input.stories.tsx
└── styles/
    ├── index.css                 # Global styles + Tailwind
    └── shared.css                # Shared component utility classes
```

## Component Organization Best Practices

### Each Component Folder Contains:
1. **Component File** (`ComponentName.tsx`) - Component logic and JSX
2. **Style File** (`ComponentName.css`) - Component-specific CSS
3. **Imports** - Both component CSS and shared styles

### CSS Structure
- **Component CSS** - Scoped utilities for the specific component
- **Shared CSS** - Common component patterns and base styles
- **Inline Tailwind** - Quick utilities directly in JSX

### Example Component Setup

```tsx
// Button/Button.tsx
import React from 'react'
import './Button.css'
import '@styles/shared.css'  // Import shared styles

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  // ... props
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', ...props }, ref) => {
    // Component logic
    return <button {...props} ref={ref} />
  }
)

export default Button
```

## Imports

### Importing Shared Components
```tsx
// Option 1: From index (recommended)
import { Button, Card, Input } from '@components/shared'

// Option 2: Direct import
import Button from '@components/shared/Button/Button'
```

### Importing Layout Components
```tsx
// Option 1: From index (recommended)
import { Layout, Header, Sidebar } from '@components/layout'

// Option 2: Direct import
import Layout from '@components/layout/Layout/Layout'
```

### Importing Pages
```tsx
import Dashboard from '@components/pages/Dashboard/Dashboard'
import NotFound from '@components/pages/NotFound/NotFound'
```

## Storybook Stories

All Storybook stories are located in the `src/stories/` directory:
- `Button.stories.tsx`
- `Card.stories.tsx`
- `Input.stories.tsx`

Stories import components from their actual locations:
```tsx
import Button from '../components/shared/Button/Button'
```

## Styling Guide

### Shared Component Styles
Located in `src/styles/shared.css`, these styles provide:
- Base button styles (`.button-base`)
- Card container styles (`.card-base`)
- Input field styles (`.input-base`)
- Error and helper text styles

### Adding New Styles

1. **Component-specific**: Add to `ComponentName.css` in the component folder
2. **Shared patterns**: Add to `src/styles/shared.css`
3. **Global**: Add to `src/styles/index.css`

## Adding New Components

To add a new shared component:

```bash
mkdir -p src/components/shared/MyComponent
```

Create:
- `src/components/shared/MyComponent/MyComponent.tsx`
- `src/components/shared/MyComponent/MyComponent.css`

Then update `src/components/shared/index.ts`:
```ts
export { default as MyComponent } from './MyComponent/MyComponent'
```

## File Import Aliases
The project uses TypeScript path aliases for cleaner imports:
- `@components` → `src/components/`
- `@styles` → `src/styles/`
- `@hooks` → `src/hooks/`
- `@store` → `src/store/`
- `@services` → `src/services/`
- `@types` → `src/types/`
- `@utils` → `src/utils/`

## Testing

Tests are located in `src/components/shared/__tests__/`:
- Update component imports to use the new folder structure
- Tests automatically update when components move

## Summary

This structure provides:
✅ Clear separation of concerns
✅ Easy to locate component styles
✅ Scalable component organization
✅ Organized storybook stories
✅ Shared style utilities
✅ Quick component lookup
