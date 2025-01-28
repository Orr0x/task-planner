import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task';
import { Project } from '../models/Project';

// Get all tasks for current user (across all projects)
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all projects the user has access to
    const projects = await Project.find({
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    const projectIds = projects.map(p => p._id);

    // Get tasks from these projects
    const tasks = await Task.find({
      projectId: { $in: projectIds }
    })
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
    });
    return;
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch tasks',
    });
    return;
  }
};

// Get single task
export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID',
      });
      return;
    }

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName email');

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.projectId,
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    if (!project) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to access this task',
      });
      return;
    }

    res.json({
      success: true,
      data: task,
    });
    return;
  } catch (error: any) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch task',
    });
    return;
  }
};

// Create task
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
      return;
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    if (!project) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to create tasks in this project',
      });
      return;
    }

    // Validate required fields
    const { title, description, status, startDate, endDate, assignedTo } = req.body;
    if (!title || !description || !status || !startDate || !endDate || !assignedTo) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
      return;
    }

    const task = await Task.create({
      ...req.body,
      createdBy: req.user?._id,
      projectId: project._id,
    });

    await task.populate('assignedTo', 'fullName email');
    await task.populate('createdBy', 'fullName email');

    res.status(201).json({
      success: true,
      data: task,
    });
    return;
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create task',
    });
    return;
  }
};

// Update task
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID',
      });
      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.projectId,
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    if (!project) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to update this task',
      });
      return;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName email');

    res.json({
      success: true,
      data: updatedTask,
    });
    return;
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update task',
    });
    return;
  }
};

// Delete task
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID',
      });
      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.projectId,
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    if (!project) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to delete this task',
      });
      return;
    }

    await task.deleteOne();

    res.json({
      success: true,
      data: { message: 'Task deleted successfully' },
    });
    return;
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete task',
    });
    return;
  }
};

// Bulk update tasks
export const bulkUpdateTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, update } = req.body;

    // Validate task IDs
    if (!Array.isArray(ids) || ids.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      res.status(400).json({
        success: false,
        error: 'Invalid task IDs',
      });
      return;
    }

    // Check if user has access to all tasks' projects
    const tasks = await Task.find({ _id: { $in: ids } });
    const projectIds = [...new Set(tasks.map(t => t.projectId))];

    const accessibleProjects = await Project.find({
      _id: { $in: projectIds },
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    if (accessibleProjects.length !== projectIds.length) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to update some of these tasks',
      });
      return;
    }

    const result = await Task.updateMany(
      { _id: { $in: ids } },
      { $set: update },
      { runValidators: true }
    );

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
    return;
  } catch (error: any) {
    console.error('Error bulk updating tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update tasks',
    });
    return;
  }
};

// Bulk delete tasks
export const bulkDeleteTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    // Validate task IDs
    if (!Array.isArray(ids) || ids.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      res.status(400).json({
        success: false,
        error: 'Invalid task IDs',
      });
      return;
    }

    // Check if user has access to all tasks' projects
    const tasks = await Task.find({ _id: { $in: ids } });
    const projectIds = [...new Set(tasks.map(t => t.projectId))];

    const accessibleProjects = await Project.find({
      _id: { $in: projectIds },
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    if (accessibleProjects.length !== projectIds.length) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to delete some of these tasks',
      });
      return;
    }

    const result = await Task.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      data: {
        modifiedCount: result.deletedCount,
      },
    });
    return;
  } catch (error: any) {
    console.error('Error bulk deleting tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete tasks',
    });
    return;
  }
};