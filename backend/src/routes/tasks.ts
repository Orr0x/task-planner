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

// Bulk operations must come before individual task routes
// to prevent /bulk being treated as an :id parameter
router.patch('/bulk', auth, bulkUpdateTasks);
router.delete('/bulk', auth, bulkDeleteTasks);

// Individual task operations
router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.get('/:id', auth, getTask);
router.patch('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

export default router;