# Agent Planner UI

A modern React application for visualizing and managing planning systems with interactive node-based visualizations.

## Overview

Agent Planner UI is a front-end interface for the Agent Planner system. It provides a user-friendly way to view and manage plans, with a focus on visualizing plan hierarchies using interactive node graphs.

## Features

- View a list of plans with status and progress information
- Visualize plan structures as interactive node graphs using React Flow
- Create and manage plan nodes (phases, tasks, milestones)
- Track progress and view activity history
- Manage node details, comments, and artifacts
- Dark mode support

## Technology Stack

- **React**: Frontend framework
- **TypeScript**: Static typing for better developer experience
- **React Flow**: Interactive node-based visualizations
- **React Query**: Data fetching and state management
- **TailwindCSS**: Utility-first styling
- **React Router**: Navigation and routing
- **Axios**: API communication

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to the project directory
cd agent-planner-ui

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start the development server
npm start
# or
yarn start
```

The application will be available at http://localhost:3000.

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build
```

The built files will be in the `build` directory.

## Project Structure

- `/src`: Source code
  - `/assets`: Static assets (images, etc.)
  - `/components`: Reusable UI components
    - `/common`: Generic components
    - `/layout`: Layout components
    - `/nodes`: Custom React Flow nodes
  - `/contexts`: React Context providers
  - `/hooks`: Custom React hooks
  - `/pages`: Route components
  - `/services`: API services
  - `/types`: TypeScript type definitions
  - `/utils`: Helper functions

## Design System

The UI follows a consistent design system documented in `/docs/DESIGN_SYSTEM.md`. It includes:

- Color palette
- Typography
- Spacing
- Component styles
- Node visualization guidelines

## Technical Architecture

The technical architecture is documented in `/docs/ARCHITECTURE.md`. It includes:

- Component hierarchy
- State management approach
- API integration
- Performance considerations

## Contributing

Please read the contribution guidelines before submitting pull requests.

## License

[License information]
