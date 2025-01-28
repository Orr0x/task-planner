# Task Planning Application

A full-stack task management application with multiple views (Kanban, Gantt, List) built with React, Node.js, and MongoDB.

## Features

- **Authentication**
  - User registration and login
  - Secure session management with JWT
  - Protected routes and API endpoints

- **Project Management**
  - Create and manage multiple projects
  - Switch between different projects
  - Invite team members (coming soon)

- **Task Views**
  - **Kanban Board**: Drag-and-drop tasks between status columns
  - **Gantt Chart**: Visualize tasks over time with resizable date ranges
  - **List View**: Sort and filter tasks in a table format

- **Task Management**
  - Create, edit, and delete tasks
  - Set task status (Todo, In Progress, Done)
  - Assign start and end dates
  - Add descriptions and assign to team members

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Mantine UI components
- React Query for data fetching
- Hello-Pangea/DND for drag-and-drop
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- TypeScript for type safety

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally or a MongoDB Atlas connection string

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-planner
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Backend (.env):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project-planner
JWT_SECRET=your-secret-key
```

Frontend (.env):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
task-planner/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── contexts/       # React contexts
    │   ├── pages/          # Page components
    │   ├── services/       # API services
    │   ├── types/          # TypeScript types
    │   └── App.tsx         # Root component
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project by ID
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/projects/:id/tasks` - Get tasks for a project
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/bulk` - Bulk update tasks
- `DELETE /api/tasks/bulk` - Bulk delete tasks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.