# FTD Frontend Application

A modern, production-ready React Progressive Web Application (PWA) template built with TypeScript, Redux Toolkit, and Vite.

## Features

✨ **Modern Stack**
- React 18 with TypeScript
- Vite for blazing fast builds
- Redux Toolkit for state management
- React Router v6 for routing
- Tailwind CSS for styling

🧪 **Testing & Quality**
- Vitest for unit testing
- React Testing Library for component testing
- Storybook for component library & documentation
- ESLint for code quality

📱 **PWA Ready**
- Service Worker support
- Offline-first caching strategy
- Installable as native app
- Web App Manifest

🏗️ **Architecture**
- Clean, scalable folder structure
- Reusable component system
- Centralized API client service
- Redux slices pattern
- Path aliases for clean imports

## Quick Start

### Prerequisites
- Node.js 18+ or compatible version
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Development

```bash
# Start development server
npm run dev

# Start Storybook for component development
npm run storybook

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Check test coverage
npm run test:coverage

# Run ESLint
npm run lint

# Type checking
npm run type-check
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Build Storybook for documentation
npm run storybook:build
```

## Project Structure

```
Frontend/
├── public/                  # Static assets and PWA files
│   ├── manifest.json       # PWA manifest
│   ├── sw.ts               # Service Worker
│   └── index.html          # HTML entry point
├── src/
│   ├── components/
│   │   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   │   ├── pages/          # Page components
│   │   └── shared/         # Reusable components (Button, Input, Card, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API clients and external services
│   ├── store/              # Redux store configuration
│   │   └── slices/         # Redux slices
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── main.tsx            # Application entry point
│   └── App.tsx             # Root component
├── .storybook/             # Storybook configuration
├── src/tests/              # Test setup and utilities
├── .env.example            # Environment variables template
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── vitest.config.ts        # Vitest configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Environment
VITE_ENVIRONMENT=development
VITE_DEBUG=true

# PWA Configuration
VITE_PWA_ENABLED=true
```

## Component Library (Storybook)

Storybook provides an interactive component library and documentation:

```bash
# Start Storybook dev server
npm run storybook

# Build Storybook for deployment
npm run storybook:build
```

Visit `http://localhost:6006` to view the component library.

## Redux State Management

### Store Structure

```typescript
store: {
  ui: {
    isLoading: boolean
    notification: { message, type } | null
    theme: 'light' | 'dark'
    sidebarOpen: boolean
  },
  auth: {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
  }
}
```

### Using Redux with Hooks

```typescript
import { useAppDispatch, useAppSelector } from '@hooks/redux.hooks'
import { setUser, logout } from '@store/slices/auth.slice'

function Component() {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  
  // Use dispatch and selectors
}
```

## API Service

The API client handles all HTTP requests with automatic token management:

```typescript
import apiClient from '@services/api-client'

// GET request
const users = await apiClient.get('/users')

// POST request
const response = await apiClient.post('/users', { name: 'John' })

// PUT request
await apiClient.put('/users/1', { name: 'Jane' })

// DELETE request
await apiClient.delete('/users/1')
```

### Authentication Service

```typescript
import authService from '@services/auth.service'

const { user, token } = await authService.login({
  email: 'user@example.com',
  password: 'password'
})
```

## Routing

Routes are configured in `src/App.tsx` using React Router v6:

```typescript
<Routes>
  <Route element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

## Styling

Uses Tailwind CSS with custom utilities defined in `src/styles/index.css`:

```html
<!-- Predefined utility classes -->
<button class="btn-primary">Button</button>
<div class="card">Content</div>
<input class="input" />
```

## Testing

### Run Tests

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test -- --watch

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Organization

- Unit tests: `src/components/__tests__/*.test.tsx`
- Integration tests: `src/tests/integration/`

### Writing Tests

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Button from '@components/shared/Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

## PWA Features

### Service Worker

The application includes a service worker (`public/sw.ts`) that:
- Caches app shell for offline access
- Implements network-first caching for API calls
- Handles background sync

### Installation

Users can install the app as a native app:
- Android: "Add to Home Screen" in Chrome
- iOS: "Add to Home Screen" in Safari
- Desktop: Install button in browser (Chromium-based)

### Manifest

Configure PWA metadata in `public/manifest.json`:
- App name and short name
- Icons for different sizes
- Theme colors
- Display mode (standalone)

## Performance Optimization

### Code Splitting

The build automatically splits code into chunks:
- `vendor.js` - React and dependencies
- `redux.js` - Redux and state management
- Main bundle

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('@components/pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  )
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Port Already in Use

```bash
# Change port in vite.config.ts
npm run dev -- --port 3001
```

### Service Worker Not Updating

```bash
# Clear browser cache and service worker
# In browser DevTools > Application > Clear storage
```

### ESLint Errors

```bash
# Fix linting issues automatically
npm run lint -- --fix
```

## Contributing

1. Create a feature branch
2. Follow coding standards (see FRONTEND_CODING_STANDARDS.md)
3. Write tests for new components
4. Add Storybook stories for UI components
5. Ensure all tests pass: `npm run test`

## Deployment

See [DEPLOYING.md](./DEPLOYING.md) for deployment instructions.

## Additional Resources

- [FRONTEND_CODING_STANDARDS.md](./FRONTEND_CODING_STANDARDS.md) - Code style and best practices
- [RUNNING_LOCALLY.md](./RUNNING_LOCALLY.md) - Detailed local development setup
- [PWA_SETUP.md](./PWA_SETUP.md) - PWA configuration details
- [React Documentation](https://react.dev)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [Vite Documentation](https://vitejs.dev)
- [Storybook Documentation](https://storybook.js.org)

## License

This project is part of the FTD Application Template.
