import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { Project } from '../models/Project';

// Get all tasks for current user (across all projects)
export const getTasks = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
    });
  }
};

// Get single task
export const getTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
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
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this task',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
    });
  }
};

// Create task
export const createTask = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create tasks in this project',
      });
    }

    const task = await Task.create({
      ...req.body,
      createdBy: req.user?._id,
    });

    await task.populate('assignedTo', 'fullName email');
    await task.populate('createdBy', 'fullName email');

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
    });
  }
};

// Update task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
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
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task',
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    )
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName email');

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
    });
  }
};

// Delete task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
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
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this task',
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      data: { message: 'Task deleted successfully' },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
    });
  }
};

// Bulk update tasks
export const bulkUpdateTasks = async (req: Request, res: Response) => {
  try {
    const { ids, update } = req.body;

    // Check if user has access to all tasks' projects
    const tasks = await Task.find({ _id: { $in: ids } });
    const projectIds = [...new Set(tasks.map(t => t.projectId.toString()))];

    const accessibleProjects = await Project.find({
      _id: { $in: projectIds },
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    if (accessibleProjects.length !== projectIds.length) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update some of these tasks',
      });
    }

    const result = await Task.updateMany(
      { _id: { $in: ids } },
      { $set: update }
    );

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update tasks',
    });
  }
};

// Bulk delete tasks
export const bulkDeleteTasks = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // Check if user has access to all tasks' projects
    const tasks = await Task.find({ _id: { $in: ids } });
    const projectIds = [...new Set(tasks.map(t => t.projectId.toString()))];

    const accessibleProjects = await Project.find({
      _id: { $in: projectIds },
      $or: [
        { createdBy: req.user?._id },
        { members: req.user?._id }
      ]
    });

    if (accessibleProjects.length !== projectIds.length) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete some of these tasks',
      });
    }

    const result = await Task.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      data: {
        modifiedCount: result.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete tasks',
    });
  }
};