import express from 'express';
import { auth } from '../middleware/auth';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
} from '../controllers/project.controller';

const router = express.Router();

// All project routes should be protected
router.use(auth);

// Get all projects for current user
router.get('/', getProjects);

// Get single project
router.get('/:id', getProject);

// Create new project
router.post('/', createProject);

// Update project
router.patch('/:id', updateProject);

// Delete project
router.delete('/:id', deleteProject);

// Get project tasks
router.get('/:id/tasks', getProjectTasks);

export default router;