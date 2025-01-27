# Task Planner Frontend

A modern React application for task management with Kanban, Gantt, and List views.

## Features

- User authentication (login/register)
- Multiple task views:
  - Kanban board with drag-and-drop
  - Gantt chart timeline
  - Sortable/filterable list view
- Task management:
  - Create, edit, and delete tasks
  - Assign tasks to users
  - Set start and end dates
  - Track task status
- Modern UI with Mantine components
- TypeScript for type safety
- React Query for server state management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Backend server running (see ../backend/README.md)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with:
```
VITE_API_URL=http://localhost:5000/api
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Build

Create a production build:
```bash
npm run build
```

## Technologies Used

- React with TypeScript
- Vite for build tooling
- Mantine UI components
- React Query for data fetching
- React Router for navigation
- DND Kit for drag-and-drop
- Axios for API requests

## Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/         # React context providers
├── pages/           # Route components
├── services/        # API and other services
├── types/           # TypeScript type definitions
├── App.tsx          # Root component
└── main.tsx         # Application entry point
```

## Component Overview

### Views

- `KanbanBoard`: Drag-and-drop task management
- `GanttChart`: Timeline view of tasks
- `TaskList`: Sortable/filterable table view

### Task Management

- `CreateTaskModal`: Form for creating new tasks
- `EditTaskModal`: Form for editing existing tasks
- `TaskCard`: Individual task display component

### Authentication

- `Login`: User login page
- `Register`: New user registration page

## State Management

- React Query for server state
- Context API for:
  - Authentication state
  - Task management
  - UI state

## API Integration

All API calls are centralized in `services/api.ts` using Axios.

## Styling

- Mantine UI components and theme
- CSS-in-JS with Mantine's styling system
- Responsive design for all screen sizes