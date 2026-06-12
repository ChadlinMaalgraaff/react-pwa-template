# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-15

### Added
- Initial React PWA template setup
- TypeScript configuration and strict mode
- Vite build tool with optimized configuration
- Redux Toolkit for state management
  - Auth slice with user and token management
  - UI slice for application state
- React Router v6 for navigation
- Tailwind CSS for styling
- Storybook for component library and documentation
  - Button component with stories
  - Card component with stories
  - Input component with stories
- Vitest for unit testing
- React Testing Library for component testing
- API client service with automatic token management
- Authentication service for user login/register
- Service Worker registration for PWA support
- Web App Manifest for PWA installation
- Custom React hooks for Redux integration
- Layout components (Header, Sidebar)
- Page components (Dashboard, NotFound)
- Reusable shared components (Button, Card, Input)
- Type definitions for API and common types
- Utility functions (formatting, validation, helpers)
- Comprehensive documentation:
  - README.md
  - FRONTEND_CODING_STANDARDS.md
  - RUNNING_LOCALLY.md
  - DEPLOYING.md
  - PWA_SETUP.md
- Environment configuration with examples
- ESLint configuration for code quality
- Test setup with jsdom environment
- Git configuration (.gitignore)

### Features
- 🚀 Modern React 18 with TypeScript
- ⚡ Vite for fast builds and HMR
- 🎨 Tailwind CSS styling
- 📦 Redux Toolkit state management
- 🛣️ React Router navigation
- 📱 PWA support (installable, offline-ready)
- 🧪 Testing setup (Vitest + RTL)
- 📚 Component library (Storybook)
- 🔒 Type-safe API client
- 🎯 Path aliases for clean imports

### Directories
```
Frontend/
├── public/                 # Static assets and PWA files
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API and utility services
│   ├── store/             # Redux configuration
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── tests/             # Test setup
│   ├── main.tsx           # Entry point
│   └── App.tsx            # Root component
├── .storybook/            # Storybook configuration
├── Documentation files    # README, coding standards, etc.
└── Configuration files    # tsconfig, vite.config, etc.
```

### Known Issues
None at this time.

### Future Plans
- [ ] Mobile app version (React Native)
- [ ] Dark mode support
- [ ] Internationalization (i18n)
- [ ] Advanced caching strategies
- [ ] Push notifications
- [ ] Background sync
- [ ] Analytics integration
- [ ] Performance monitoring (Sentry)
- [ ] E2E testing (Playwright/Cypress)

---

[0.1.0]: https://github.com/your-org/ftd-app/releases/tag/v0.1.0
