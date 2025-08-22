# Agent Planner UI Guidelines

## Build & Development Commands
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run all tests
- `npm test -- --testPathPattern='ComponentName'` - Run specific test
- `npm run lint` - Run ESLint (add this script to package.json)
- `npm run typecheck` - Run TypeScript type checking (add this script to package.json)

## Code Style Guidelines
- **TypeScript**: Strict mode enabled; always use proper types
- **Components**: React functional components with TypeScript interfaces
- **Imports**: Group imports (React, libraries, components, utils, types)
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Styling**: TailwindCSS with utility classes following design system
- **State**: React Query for server state, Context API for UI state
- **Error Handling**: Consistent error boundaries and fallbacks
- **File Structure**: Group by feature, then by type within features
- **Formatting**: 2-space indentation, 80-character line limit

## Project Architecture
- Follow `/docs/ARCHITECTURE.md` for component organization
- Follow `/docs/DESIGN_SYSTEM.md` for visual design guidelines
- Use absolute imports from `src` root
- Maintain responsive design (desktop-first with mobile adaptations)
- Implement proper accessibility standards (WCAG 2.1 AA)