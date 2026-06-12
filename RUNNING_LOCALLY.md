# Running the Frontend Locally

This guide provides detailed instructions for setting up and running the FTD Frontend application locally.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Development Server](#development-server)
5. [Component Development with Storybook](#component-development-with-storybook)
6. [Testing](#testing)
7. [Building](#building)
8. [Troubleshooting](#troubleshooting)

## System Requirements

### Required

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (or yarn/pnpm equivalent)
- **Git**: For version control
- **Code Editor**: VS Code (recommended) with TypeScript support

### Optional

- **Docker**: For containerized development
- **PostgreSQL**: If backend is running locally
- **Redis**: For caching (optional)

### Check Your Installation

```bash
# Check Node.js version
node --version
# Expected: v18.x.x or higher

# Check npm version
npm --version
# Expected: v8.x.x or higher

# Check Git version
git --version
```

## Installation

### 1. Clone the Repository

```bash
# Navigate to your projects directory
cd ~/projects

# Clone the repository
git clone https://github.com/your-org/ftd-app.git
cd ftd-app/Frontend
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# Verify installation
npm list react react-dom react-router-dom @reduxjs/toolkit
```

### 3. Create Environment File

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your configuration
# On macOS/Linux:
nano .env.local
# On Windows:
# notepad .env.local
```

### Environment Configuration

Edit `.env.local` with appropriate values:

```env
# Development API endpoint
VITE_API_BASE_URL=http://localhost:8000/api

# Environment setting
VITE_ENVIRONMENT=development

# Debug mode
VITE_DEBUG=true

# PWA Features
VITE_PWA_ENABLED=true
```

**Note**: For backend integration, ensure your backend is running on the configured port.

## Development Server

### Starting the Dev Server

```bash
# Start Vite development server
npm run dev

# The app will automatically open in your browser
# Expected: http://localhost:3000
```

### Development Features

The development server includes:
- ⚡ Hot Module Replacement (HMR) - instant updates without full reload
- 📊 Development console - view logs and errors
- 🔍 Source maps - debug original TypeScript files
- 🚨 Error overlay - see errors in the browser

### Accessing the Application

1. **Main App**: http://localhost:3000
2. **With trailing slash**: http://localhost:3000/

### Common Development Tasks

```bash
# Run type checking
npm run type-check

# Check code quality
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Format code with Prettier (if configured)
npm run format
```

### Changing the Port

If port 3000 is in use, you can change it:

**Option 1: Command Line**
```bash
npm run dev -- --port 3001
```

**Option 2: Update vite.config.ts**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3001,
    open: true,
  },
})
```

## Component Development with Storybook

Storybook is an isolated development environment for UI components.

### Starting Storybook

```bash
# Start Storybook dev server
npm run storybook

# Default port: http://localhost:6006
```

### Creating Stories

Stories showcase components in different states:

```typescript
// src/components/shared/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import Button from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click Me',
  },
}
```

### Storybook Features

- **Component Preview**: View components in isolation
- **Props Editor**: Test component props interactively
- **Accessibility**: Check WCAG compliance
- **Coverage**: View component test coverage
- **Documentation**: Auto-generated from JSDoc

### Building Storybook

```bash
# Build static Storybook site
npm run storybook:build

# Output directory: storybook-static/
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run in watch mode (re-runs on file changes)
npm run test -- --watch

# Run tests with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Output

```
 ✓ src/components/shared/__tests__/Button.test.tsx (7)
   ✓ renders button with text
   ✓ handles click events
   ✓ renders in primary variant
   ✓ renders in secondary variant
   ✓ disables button when disabled prop is true
   ✓ disables button when isLoading is true

Test Files  1 passed (1)
Tests  7 passed (7)
```

### Test Coverage Report

```bash
# Generate and view coverage
npm run test:coverage

# Output directory: coverage/
# Open: coverage/index.html in browser
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Component from './Component'

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    render(<Component />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Debugging Tests

```bash
# Run tests with debugging
npm run test -- --inspect-brk

# Or use Storybook test runner
npm run storybook:test
```

## Building

### Production Build

```bash
# Build for production
npm run build

# Output directory: dist/

# The build includes:
# - Minified JavaScript
# - Optimized CSS
# - Lazy-loaded chunks
# - Service Worker
```

### Build Output

```
dist/
├── index.html           # Main HTML file
├── assets/
│   ├── index-*.js       # Main bundle
│   ├── vendor-*.js      # Vendor bundle
│   ├── redux-*.js       # Redux bundle
│   └── index-*.css      # Styles
└── manifest.json        # PWA manifest
```

### Preview Build Locally

```bash
# Build and preview
npm run build
npm run preview

# Runs on: http://localhost:4173
```

### Build Performance

Check build size:

```bash
# Install size analyzer
npm install -D rollup-plugin-visualizer

# Generate bundle analysis
npm run build -- --plugins visualizer()
```

## TypeScript

### Type Checking

```bash
# Check for TypeScript errors
npm run type-check

# Run in watch mode
npm run type-check -- --watch
```

### VS Code TypeScript Support

1. Open Command Palette: `Cmd+Shift+P`
2. Type "TypeScript: Select TypeScript Version"
3. Choose "Use Workspace Version"

## VS Code Extensions (Recommended)

For the best development experience, install:

- **ES7+ React/Redux/React-Native snippets**
- **ESLint**
- **Prettier - Code formatter**
- **Tailwind CSS IntelliSense**
- **REST Client** (for API testing)
- **Thunder Client** or **Postman** (API testing)

## Debugging

### Browser DevTools

1. Open: `F12` or `Right-click → Inspect`
2. **Console tab**: View logs and errors
3. **Network tab**: Monitor API calls
4. **Application tab**: Check service worker and cache
5. **Accessibility Inspector**: Check WCAG compliance

### React DevTools

Install [React DevTools](https://react-devtools-tutorial.vercel.app/) browser extension:

1. Inspect React components
2. View props and state
3. Track component renders
4. Profile performance

### Redux DevTools

Install [Redux DevTools](https://github.com/reduxjs/redux-devtools):

1. Monitor Redux actions and state
2. Time-travel debugging
3. Export/import state
4. Dispatch actions from DevTools

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverride": {
        "/src/*": "${webspaceRoot}/*"
      }
    }
  ]
}
```

Start debugging: `F5`

## Connecting to Backend

### Backend API Configuration

Ensure your backend is running and accessible:

```bash
# Example: Backend running on port 8000
VITE_API_BASE_URL=http://localhost:8000/api
```

### Testing API Calls

```bash
# Check if backend is accessible
curl -X GET http://localhost:8000/api/health

# Should return: {"status": "ok"}
```

### CORS Issues

If experiencing CORS errors, backend must include:

```headers
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Common Workflows

### Creating a New Component

```bash
# 1. Create component file
touch src/components/shared/NewComponent.tsx

# 2. Create stories file
touch src/components/shared/NewComponent.stories.tsx

# 3. Create tests
mkdir -p src/components/shared/__tests__
touch src/components/shared/__tests__/NewComponent.test.tsx

# 4. View in Storybook
npm run storybook
```

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feat/new-feature

# 2. Start dev server
npm run dev

# 3. Make changes and test
npm run test -- --watch

# 4. Check quality
npm run lint
npm run type-check

# 5. Build and verify
npm run build
npm run preview
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- --port 3001
```

### Dependencies Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hot Module Replacement (HMR) Not Working

```bash
# 1. Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
# 2. Restart dev server
npm run dev

# 3. Check browser console for errors
# 4. Verify port 3000 is accessible
```

### Module Resolution Errors

```bash
# Verify TypeScript configuration
npm run type-check

# Check import paths match tsconfig.json
# Common issue: Wrong import paths
# ❌ import Button from '../components/shared/Button'
# ✅ import Button from '@components/shared/Button'
```

### Memory Issues

```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Service Worker Issues

```bash
# Clear service worker from DevTools
# Application → Service Workers → Unregister

# Or manually:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister())
})
```

## Additional Help

- **Documentation**: See [README.md](./README.md)
- **Coding Standards**: See [FRONTEND_CODING_STANDARDS.md](./FRONTEND_CODING_STANDARDS.md)
- **Issues**: Check GitHub issues or create a new one
- **Team Slack**: #frontend-help channel

## Quick Reference

```bash
# Start development
npm run dev

# Start Storybook
npm run storybook

# Run tests
npm run test

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# All checks
npm run lint && npm run type-check && npm run test && npm run build
```

---

**Last Updated**: 2024
**Maintainer**: Frontend Team
