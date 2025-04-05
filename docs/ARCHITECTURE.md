# Agent Planner UI - Technical Architecture

This document outlines the technical architecture and design decisions for the Agent Planner UI.

## Overview

The Agent Planner UI is a modern React application that visualizes and manages planning systems. It consists of a simple list view for plans and a detailed visualization using React Flow for individual plan hierarchies.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: TailwindCSS for utility-first styling
- **State Management**: 
  - React Query for server state
  - React Context API for UI state
- **Visualization**: React Flow for interactive node visualization
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React for consistent iconography

## Project Structure

```
agent-planner-ui/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Generic components
│   │   ├── layout/        # Layout components
│   │   ├── nodes/         # Custom React Flow nodes
│   │   ├── plan/          # Plan-specific components
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route components
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Helper functions
│   ├── App.tsx            # Main application component
│   ├── index.tsx          # Application entry point
├── docs/                  # Documentation
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # TailwindCSS configuration
```

## Key Components

### Plan List View
- Displays a paginated, filterable list of plans
- Shows plan metadata including status, progress, and last update
- Provides quick actions for plan management

### Plan Visualization View
- Interactive canvas for visualizing plan hierarchy
- Custom node types for different plan elements
- Node selection and details panel
- Tools for creating new nodes and connections

### Node Types
- **Root Node**: The top-level node of a plan
- **Phase Node**: Groups related tasks
- **Task Node**: Individual work items
- **Milestone Node**: Key achievements or checkpoints

### Sidebar Components
- Plan overview with progress indicators
- Activity feed showing recent changes
- Quick filters and search tools

## State Management

### Server State
- Uses React Query for fetching, caching, and updating server data
- Implements optimistic updates for a responsive UX
- Handles background refetching and stale data management

### UI State
- Uses React Context for global UI state
- Manages sidebar visibility, selected nodes, etc.
- Implements reducers for complex state transitions

## API Integration

The UI integrates with the Planning System API, which provides endpoints for:
- Authentication
- Plan CRUD operations
- Node management
- Collaboration features
- Activity tracking

## Responsive Design

- Desktop-first approach with responsive adaptations
- Simplified mobile view for plan visualization
- Adaptive layouts for different screen sizes

## Performance Considerations

- Virtualization for rendering large lists
- Optimized React Flow rendering for plans with many nodes
- Code splitting for faster initial load
- Memoization of expensive components

## Accessibility

- WCAG 2.1 AA compliance
- Proper semantic HTML
- Keyboard navigation support
- Screen reader friendly with ARIA attributes

## Future Enhancements

- Real-time collaboration using WebSockets
- Timeline view for temporal plan visualization
- Advanced filtering and search capabilities
- Export and reporting features
