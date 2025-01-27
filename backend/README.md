# Task Planner Backend

A RESTful API backend for the Task Planning Application with authentication, task management, and MongoDB integration.

## Features

- User authentication (register/login) with JWT
- Task CRUD operations
- Task status management (todo, inProgress, done)
- Date-based task planning
- MongoDB integration
- TypeScript support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB running locally or a MongoDB Atlas connection string
- npm or yarn package manager

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the variables as needed:
  ```
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/project-planner
  JWT_SECRET=your-secret-key-here
  NODE_ENV=development
  ```

3. Start MongoDB:
- Make sure MongoDB is running locally on port 27017
- Or update MONGODB_URI in .env to point to your MongoDB instance

## Development

Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## Build

Build the TypeScript code:
```bash
npm run build
```

## Production

Start the production server:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (protected)

### Tasks
All task endpoints require authentication (Bearer token)

- GET `/api/tasks` - Get all tasks
- GET `/api/tasks/:id` - Get single task
- POST `/api/tasks` - Create new task
- PATCH `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task

## Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Implement login",
    "description": "Add user authentication",
    "status": "todo",
    "startDate": "2024-01-26T00:00:00.000Z",
    "endDate": "2024-01-27T00:00:00.000Z",
    "assignedTo": "user_id_here"
  }'