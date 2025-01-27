import express from 'express';
import { auth } from '../middleware/auth';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  bulkUpdateTasks,
  bulkDeleteTasks,
} from '../controllers/task.controller';

const router = express.Router();

// Get all tasks
router.get('/', auth, getTasks);

// Get single task
router.get('/:id', auth, getTask);

// Create task
router.post('/', auth, createTask);

// Update task
router.patch('/:id', auth, updateTask);

// Delete task
router.delete('/:id', auth, deleteTask);

// Bulk update tasks
router.patch('/bulk', auth, bulkUpdateTasks);

// Bulk delete tasks
router.delete('/bulk', auth, bulkDeleteTasks);

export default router;