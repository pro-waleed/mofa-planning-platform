# Tests

The current repository is delivered as an MVP foundation with verified build and type safety. Automated tests are the next recommended step.

## Current Verification

- `npm run typecheck`
- `npm run build`

## Recommended Phase 2 Test Coverage

- Prisma-backed integration tests for template creation and plan creation
- workflow tests for approvals, report return, and training nomination decisions
- component tests for key forms and dashboard summaries
- end-to-end tests for the primary stakeholder demo flows

## Suggested Tooling

- Vitest or Jest for unit and integration tests
- Testing Library for React components
- Playwright for end-to-end flows
