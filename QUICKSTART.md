# Frontend Quick Start

Get the FTD Frontend application running in 5 minutes.

## Prerequisites

- Node.js 18+
- npm/yarn

## Installation

```bash
# 1. Navigate to Frontend directory
cd pwa

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Start development server
npm run dev

# Your app is now running at http://localhost:3000 🚀
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run storybook       # View component library

# Testing
npm run test            # Run tests
npm run test:ui         # Interactive test dashboard

# Quality
npm run lint            # Check code quality
npm run type-check      # TypeScript validation

# Build
npm run build           # Production build
npm run preview         # Preview production build
```

## Next Steps

1. **Explore Components**: Open Storybook at `http://localhost:6006`
2. **Read Docs**: Check [README.md](./README.md)
3. **Code Standards**: Review [FRONTEND_CODING_STANDARDS.md](./FRONTEND_CODING_STANDARDS.md)
4. **Local Setup**: See [RUNNING_LOCALLY.md](./RUNNING_LOCALLY.md)

## Project Structure

```
src/
├── components/shared/      # Reusable UI components
├── components/pages/       # Page components
├── services/               # API clients
├── store/                  # Redux setup
├── hooks/                  # Custom hooks
└── types/                  # TypeScript definitions
```

## Key Features

✨ **React 18** - Latest React with TypeScript
⚡ **Vite** - Lightning-fast builds
📦 **Redux Toolkit** - State management
🧪 **Vitest** - Fast unit testing
📚 **Storybook** - Component documentation
📱 **PWA Ready** - Installable app

## Need Help?

- 📖 [Full Documentation](./README.md)
- 🏗️ [Architecture Guide](./FRONTEND_CODING_STANDARDS.md)
- 🚀 [Deployment Guide](./DEPLOYING.md)
- 📱 [PWA Setup](./PWA_SETUP.md)

---

**Ready to code?** Start with `npm run dev` and explore the component library at `http://localhost:6006`
