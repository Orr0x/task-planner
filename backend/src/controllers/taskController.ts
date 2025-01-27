import { Request, Response, NextFunction } from 'express';
import { Task, ITask } from '../models/Task';
import { CustomError } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['todo', 'inProgress', 'done']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  assignedTo: z.string(),
});

const updateTaskSchema = taskSchema.partial();

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = taskSchema.parse(req.body);
    
    const task = new Task({
      ...validatedData,
      createdBy: req.user!.userId,
    });

    await task.save();

    await task.populate('assignedTo', 'fullName email');

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query: any = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate as string);
      if (endDate) query.endDate.$lte = new Date(endDate as string);
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName email');

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = updateTaskSchema.parse(req.body);

    const task = await Task.findById(req.params.id);
    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    // Update task
    Object.assign(task, validatedData);
    await task.save();

    await task.populate('assignedTo', 'fullName email');
    await task.populate('createdBy', 'fullName email');

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};