# Agent Planner UI Design System

This document outlines the design system for the Agent Planner UI, providing guidelines for consistent visual appearance and user experience.

## Colors

### Primary Colors
- **Primary Blue**: #3b82f6 - Main brand color, used for primary actions, links, and key UI elements
- **Dark Blue**: #1d4ed8 - Used for hover states and secondary elements
- **Light Blue**: #dbeafe - Used for backgrounds, highlights, and non-interactive elements

### Status Colors
- **Success Green**: #10b981 - Indicates successful operations or completed status
- **Warning Yellow**: #f59e0b - Indicates warnings or items needing attention
- **Error Red**: #ef4444 - Indicates errors or blocked status
- **Neutral Gray**: #9ca3af - Indicates inactive or disabled states

### Dark Mode Colors
- **Background**: #1e293b - Main background in dark mode
- **Surface**: #334155 - Card and surface elements in dark mode
- **Dark Success**: #059669 - Success color for dark mode
- **Dark Error**: #b91c1c - Error color for dark mode

## Typography

The typeface system uses Inter as the primary font family with various weights for different UI elements.

### Heading Styles
- **H1**: 24px, Bold - Page titles and main headings
- **H2**: 20px, Bold - Section headings and dialog titles
- **H3**: 16px, Semi-Bold - Sub-sections and card headings

### Text Styles
- **Body**: 16px, Regular - Main text content
- **Small**: 14px, Regular - Secondary text, metadata
- **Caption**: 12px, Regular - Helper text, timestamps

## Spacing System

Our spacing system follows a 4px grid for consistency:
- 4px - Extra small spacing (xs)
- 8px - Small spacing (sm)
- 16px - Medium spacing (md)
- 24px - Large spacing (lg)
- 32px - Extra large spacing (xl)

## Components

### Buttons
- **Primary Button**: Blue background, white text, rounded corners
- **Secondary Button**: White background, gray border, blue text
- **Icon Button**: Circular, with varying background based on importance

### Cards
- Subtle shadow
- 16px padding
- 8px border radius
- White background (light mode) or dark slate (dark mode)

### Badges
- Rounded pill shape for status indicators
- Color coding by status type
- Compact text with 8px vertical, 12px horizontal padding

### Navigation
- Left sidebar for main navigation
- Top bar for context-specific actions and breadcrumbs
- Clear visual hierarchy with icons and labels

## Node Visualization

### Node Types
- **Root Node**: Bold border, slightly larger than other nodes
- **Phase Node**: Medium sized with distinct background
- **Task Node**: Standard size, simpler styling
- **Milestone Node**: Diamond or special shape to indicate significance

### Status Indicators
- Color-coded borders or labels
- Clear iconography for different states
- Consistent placement of status elements

## Animation Guidelines

- Subtle transitions between states (300ms duration)
- Smooth node movements in flow visualization
- Gentle fade effects for appearing/disappearing elements
- Avoid excessive or distracting animations

## Accessibility

- All interactive elements must have sufficient color contrast (WCAG AA)
- Focus states must be clearly visible
- Text should maintain 4.5:1 contrast ratio against backgrounds
- All interactive elements accessible via keyboard navigation
