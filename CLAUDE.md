# Project Instructions

Full standards: [FRONTEND_CODING_STANDARDS.md](FRONTEND_CODING_STANDARDS.md).

## Required for every code change

- **Tests**: any new component, hook, util, or bug fix must include tests
  covering it. Add/update tests in `__tests__/` alongside the code.
- **Lint**: `npm run lint` must pass with zero errors and zero warnings
  (`--max-warnings 0`). Do not suppress rules or widen `ignorePatterns` —
  fix the underlying issue.
- Before considering a change done, run:
  ```bash
  npm run lint
  npm run test -- --run
  ```

A pre-commit hook (Husky + lint-staged) enforces both automatically.
