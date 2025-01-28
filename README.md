# Task Planner

A full-stack task planning application with multiple views and authentication.

## Features

- **Authentication**
  - User registration and login
  - Secure session management with JWT
  - Protected routes and API endpoints

- **Multiple Views**
  - Kanban Board: Drag-and-drop task management
  - Gantt Chart: Timeline visualization
  - Calendar View: Monthly task overview
  - List View: Sortable/filterable task table

- **Task Management**
  - Create, edit, and delete tasks
  - Assign tasks to users
  - Set start and end dates
  - Track task status
  - Add descriptions and details

## Tech Stack

- **Frontend**
  - React with TypeScript
  - Mantine UI components
  - date-fns for date manipulation
  - Vite for development and building

- **Backend**
  - Node.js with TypeScript
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB running locally or a MongoDB Atlas connection string
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Orr0x/task-planner.git
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
PORT=3000
MONGODB_URI=mongodb://localhost:27017/project-planner
JWT_SECRET=your_jwt_secret_here
```

Frontend (.env):
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

5. Visit `http://localhost:5173` in your browser

## Project Structure

```
task-planner/
├── backend/                 # Backend server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Server entry point
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json
│
└── README.md
```

## API Endpoints

- **Auth**
  - POST `/api/auth/register` - Register new user
  - POST `/api/auth/login` - Login user
  - GET `/api/auth/me` - Get current user

- **Tasks**
  - GET `/api/tasks` - List all tasks
  - POST `/api/tasks` - Create new task
  - PUT `/api/tasks/:id` - Update task
  - DELETE `/api/tasks/:id` - Delete task

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.