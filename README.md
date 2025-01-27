# Task Planner

A full-stack task planning application with authentication, featuring Kanban board, Gantt chart, and list views.

## Features

- User authentication (register, login, session management)
- Multiple project views:
  - Kanban board
  - Gantt chart
  - List view
- Project management
- Task management with drag-and-drop
- Real-time updates
- Responsive design

## Tech Stack

### Frontend
- React
- TypeScript
- Mantine UI
- React Query
- React Router
- Axios

### Backend
- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- CORS

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or a remote instance)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/task-planner.git
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

3. Create `.env` files:

Backend `.env` (in `/backend`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project-planner
JWT_SECRET=your-secret-key
```

Frontend `.env` (in `/frontend`):
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

1. Start MongoDB (if running locally)

2. Start the backend server:
```bash
cd backend
npm run build
npm start
```

3. Start the frontend development server:
```bash
cd frontend
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Development

### Backend Structure
- `/src/controllers` - Request handlers
- `/src/middleware` - Custom middleware (auth, error handling)
- `/src/models` - MongoDB models
- `/src/routes` - API routes
- `/src/types` - TypeScript type definitions

### Frontend Structure
- `/src/components` - Reusable React components
- `/src/contexts` - React context providers
- `/src/pages` - Page components
- `/src/services` - API services
- `/src/types` - TypeScript type definitions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get single project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
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

This project is licensed under the MIT License - see the LICENSE file for details